import os
import io
import json
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from groq import Groq
from dotenv import load_dotenv
load_dotenv()  

def extract_text_from_pdf(file) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}")


def extract_text_from_docx(file) -> str:
    try:
        import docx
        doc = docx.Document(io.BytesIO(file.read()))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not read DOCX: {str(e)}")


def looks_like_resume(text: str) -> bool:
    """
    Quick keyword check — if none of these appear, it's probably not a resume.
    """
    resume_keywords = [
        "experience", "education", "skills", "project", "work",
        "university", "college", "degree", "internship", "developer",
        "engineer", "manager", "designed", "built", "developed",
        "responsible", "bachelor", "master", "gpa", "certificate",
        "employment", "position", "company", "organization", "role",
        "python", "react", "javascript", "java", "css", "html",
        "linkedin", "github", "email", "phone", "contact",
    ]
    text_lower = text.lower()
    matches = sum(1 for kw in resume_keywords if kw in text_lower)
    return matches >= 4  # needs at least 4 resume-like keywords


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def roast_resume(request):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # ── 1. Get file ────────────────────────────────────────────────────────────
    uploaded_file = request.FILES.get('resume')
    if not uploaded_file:
        return Response({
            'error': 'no_file',
            'message': 'No file uploaded. Please attach your resume.'
        }, status=400)

    # ── 2. Check file type ─────────────────────────────────────────────────────
    filename     = uploaded_file.name.lower()
    is_pdf       = filename.endswith('.pdf')
    is_docx      = filename.endswith('.docx') or filename.endswith('.doc')

    if not (is_pdf or is_docx):
        return Response({
            'error': 'wrong_format',
            'message': 'Only PDF or DOCX files are accepted. Please upload your resume in one of these formats.'
        }, status=400)

    # ── 3. Check file size (max 5MB) ───────────────────────────────────────────
    if uploaded_file.size > 5 * 1024 * 1024:
        return Response({
            'error': 'too_large',
            'message': 'File too large. Please upload a file under 5MB.'
        }, status=400)

    # ── 4. Extract text ────────────────────────────────────────────────────────
    try:
        if is_pdf:
            resume_text = extract_text_from_pdf(uploaded_file)
        else:
            resume_text = extract_text_from_docx(uploaded_file)
    except ValueError as e:
        return Response({
            'error': 'extract_failed',
            'message': str(e)
        }, status=400)

    if len(resume_text) < 50:
        return Response({
            'error': 'empty_file',
            'message': 'Could not extract readable text from your file. Make sure it\'s not a scanned image.'
        }, status=400)

    # ── 5. Check if it actually looks like a resume ────────────────────────────
    if not looks_like_resume(resume_text):
        return Response({
            'error': 'not_resume',
            'message': 'This doesn\'t look like a resume. Please upload your actual CV or resume document.'
        }, status=400)

    # ── 6. Limit text to 3000 chars to avoid token overflow ───────────────────
    resume_text_trimmed = resume_text[:3000]

    # ──  prompt
    prompt = f"""
You are a brutally honest senior software engineer and tech recruiter with 10 years of experience.
You are reviewing a developer's resume. Be direct, specific, and helpful.
Do NOT be generic. Reference actual content from the resume in your feedback.

Here is the resume text:
---
{resume_text_trimmed}
---

Respond ONLY in this exact JSON format, no markdown, no extra text:
{{
  "is_resume": true,
  "candidate_name": "extracted name or Unknown",
  "role_detected": "what role this person seems to be targeting",
  "overall_score": <integer 0-100>,
  "overall_verdict": "one punchy sentence about this resume overall",
  "strengths": [
    "specific strength 1 with reference to actual content",
    "specific strength 2",
    "specific strength 3"
  ],
  "weaknesses": [
    "specific weakness 1 with what to fix",
    "specific weakness 2 with what to fix",
    "specific weakness 3 with what to fix"
  ],
  "missing_sections": ["section1", "section2"],
  "quick_fixes": [
    "Actionable fix 1 — do this today",
    "Actionable fix 2 — do this today",
    "Actionable fix 3 — do this today"
  ],
  "ats_score": <integer 0-100>,
  "ats_tip": "one specific ATS optimization tip",
  "hiring_chance": "Low | Medium | High | Very High",
  "roast": "one brutally honest but constructive line summing up this resume like a senior dev would say it"
}}
"""

    # ── 8. Call Groq ───────────────────────────────────────────────────────────
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.3,
        )
        raw   = response.choices[0].message.content.strip()
        clean = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean)
        return Response(result)

    except json.JSONDecodeError:
        return Response({
            'error': 'parse_failed',
            'message': 'AI response could not be parsed. Please try again.'
        }, status=500)
    except Exception as e:
        return Response({'error': 'groq_error', 'message': str(e)}, status=500)