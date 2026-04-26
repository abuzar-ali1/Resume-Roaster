"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Loader2, AlertCircle,
  CheckCircle2, XCircle, Zap, RotateCcw,
  TrendingUp, Shield, Target, Flame
} from "lucide-react";
import styles from "./ResumeRoaster.module.css";

// ── Types ──────────────────────────────────────────────────────────────────────
interface RoastResult {
  candidate_name:    string;
  role_detected:     string;
  overall_score:     number;
  overall_verdict:   string;
  strengths:         string[];
  weaknesses:        string[];
  missing_sections:  string[];
  quick_fixes:       string[];
  ats_score:         number;
  ats_tip:           string;
  hiring_chance:     "Low" | "Medium" | "High" | "Very High";
  roast:             string;
}

type ErrorType = "no_file" | "wrong_format" | "too_large" | "empty_file"
               | "not_resume" | "parse_failed" | "groq_error" | "network" | null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const hiringColors: Record<string, string> = {
  "Low":       "#EF4444",
  "Medium":    "#F59E0B",
  "High":      "#10B981",
  "Very High": "#0891B2",
};

const scoreColor = (s: number) =>
  s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file,      setFile]      = useState<File | null>(null);
  const [dragging,  setDragging]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<RoastResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    setError(null);
    setErrorType(null);
    setResult(null);

    const allowed = ["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"];

    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|doc)$/i)) {
      setErrorType("wrong_format");
      setError("Only PDF or DOCX files accepted.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorType("too_large");
      setError("File too large. Max 5MB.");
      return;
    }
    setFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setErrorType(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/roast-resume/`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.error) {
        setErrorType(data.error as ErrorType);
        setError(data.message);
        return;
      }
      setResult(data);
    } catch {
      setErrorType("network");
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setErrorType(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.badge}>
            <Flame className={styles.badgeIcon} />
            <span>AI Resume Roaster</span>
          </div>
          <h2 className={styles.title}>
            Get Your Resume
            <span className={styles.titleAccent}> Brutally Reviewed.</span>
          </h2>
          <p className={styles.subtitle}>
            Upload your resume. Our AI gives you honest, specific feedback —
            not the polite lies your friends tell you.
          </p>
        </motion.div>

        {/* Main Card */}
        <div className={styles.card}>

          {/* Card Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBox}>
                <Flame className={styles.iconBoxIcon} />
              </div>
              <div>
                <p className={styles.cardTitle}>Resume Analysis Engine</p>
                <p className={styles.cardSub}>Powered by Groq / Llama 3</p>
              </div>
            </div>
            <div className={styles.engineBadge}>
              <span className={styles.engineDot} />
              <span>Engine Ready</span>
            </div>
          </div>

          <div className={styles.cardBody}>
            <AnimatePresence mode="wait">

              {/* ── Upload State ── */}
              {!result && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Drop Zone */}
                  <div
                    className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ""} ${file ? styles.dropzoneHasFile : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={onInputChange}
                      className={styles.hiddenInput}
                    />

                    {file ? (
                      <div className={styles.fileSelected}>
                        <div className={styles.fileIconWrap}>
                          <FileText className={styles.fileIcon} />
                        </div>
                        <div>
                          <p className={styles.fileName}>{file.name}</p>
                          <p className={styles.fileSize}>
                            {(file.size / 1024).toFixed(1)} KB — Ready to analyze
                          </p>
                        </div>
                        <button
                          className={styles.removeFile}
                          onClick={e => { e.stopPropagation(); reset(); }}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.dropContent}>
                        <div className={styles.uploadIconWrap}>
                          <Upload className={styles.uploadIcon} />
                        </div>
                        <p className={styles.dropTitle}>
                          Drop your resume here
                        </p>
                        <p className={styles.dropSub}>
                          or click to browse — PDF or DOCX, max 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      className={`${styles.errorBox} ${errorType === "not_resume" ? styles.errorBoxWarning : ""}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={16} />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {/* Analyze Button */}
                  <button
                    className={styles.analyzeBtn}
                    onClick={analyze}
                    disabled={!file || loading}
                  >
                    {loading ? (
                      <><Loader2 className={styles.spin} size={18} /> Analyzing...</>
                    ) : (
                      <><Zap size={18} /> Roast My Resume</>
                    )}
                  </button>

                  <p className={styles.disclaimer}>
                    Your resume is never stored. Analyzed and discarded immediately.
                  </p>
                </motion.div>
              )}

              {/* ── Result State ── */}
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.results}
                >
                  {/* The Roast */}
                  <div className={styles.roastBox}>
                    <p className={styles.roastLabel}>
                      <Flame size={12} /> The Honest Verdict
                    </p>
                    <p className={styles.roastText}>"{result.roast}"</p>
                  </div>

                  {/* Scores Row */}
                  <div className={styles.scoresRow}>

                    {/* Overall Score */}
                    <div className={styles.scoreCard}>
                      <p className={styles.scoreLabel}>Overall Score</p>
                      <div className={styles.scoreBarWrap}>
                        <div className={styles.scoreBarBg}>
                          <motion.div
                            className={styles.scoreBarFill}
                            style={{ background: scoreColor(result.overall_score) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.overall_score}%` }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span
                          className={styles.scoreNum}
                          style={{ color: scoreColor(result.overall_score) }}
                        >
                          {result.overall_score}<span className={styles.scoreOf}>/100</span>
                        </span>
                      </div>
                      <p className={styles.scoreVerdict}>{result.overall_verdict}</p>
                    </div>

                    {/* ATS Score */}
                    <div className={styles.scoreCard}>
                      <p className={styles.scoreLabel}>
                        <Shield size={11} /> ATS Score
                      </p>
                      <div className={styles.scoreBarWrap}>
                        <div className={styles.scoreBarBg}>
                          <motion.div
                            className={styles.scoreBarFill}
                            style={{ background: scoreColor(result.ats_score) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.ats_score}%` }}
                            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span
                          className={styles.scoreNum}
                          style={{ color: scoreColor(result.ats_score) }}
                        >
                          {result.ats_score}<span className={styles.scoreOf}>/100</span>
                        </span>
                      </div>
                      <p className={styles.scoreVerdict}>{result.ats_tip}</p>
                    </div>

                    {/* Hiring Chance */}
                    <div className={styles.hiringCard}>
                      <p className={styles.scoreLabel}>
                        <TrendingUp size={11} /> Hiring Chance
                      </p>
                      <p
                        className={styles.hiringValue}
                        style={{ color: hiringColors[result.hiring_chance] }}
                      >
                        {result.hiring_chance}
                      </p>
                      <p className={styles.hiringRole}>{result.role_detected}</p>
                    </div>
                  </div>

                  {/* Strengths + Weaknesses */}
                  <div className={styles.feedbackGrid}>
                    <div className={styles.feedbackCard}>
                      <h4 className={styles.feedbackTitle}>
                        <CheckCircle2 size={14} className={styles.greenIcon} />
                        What's Working
                      </h4>
                      <ul className={styles.feedbackList}>
                        {result.strengths.map((s, i) => (
                          <li key={i} className={styles.feedbackItem}>
                            <span className={styles.greenDot} />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.feedbackCard}>
                      <h4 className={styles.feedbackTitle}>
                        <XCircle size={14} className={styles.redIcon} />
                        What's Hurting You
                      </h4>
                      <ul className={styles.feedbackList}>
                        {result.weaknesses.map((w, i) => (
                          <li key={i} className={styles.feedbackItem}>
                            <span className={styles.redDot} />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quick Fixes */}
                  <div className={styles.fixesCard}>
                    <h4 className={styles.feedbackTitle}>
                      <Target size={14} />
                      Fix These Today
                    </h4>
                    <ol className={styles.fixList}>
                      {result.quick_fixes.map((f, i) => (
                        <li key={i} className={styles.fixItem}>
                          <span className={styles.fixNum}>{i + 1}</span>
                          {f}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Missing Sections */}
                  {result.missing_sections.length > 0 && (
                    <div className={styles.missingCard}>
                      <p className={styles.missingLabel}>Missing Sections</p>
                      <div className={styles.missingTags}>
                        {result.missing_sections.map((s, i) => (
                          <span key={i} className={styles.missingTag}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset */}
                  <button className={styles.resetBtn} onClick={reset}>
                    <RotateCcw size={15} />
                    Analyze Another Resume
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}