import { useState, useRef, useCallback } from "react";
import type { RoastResult, ErrorType } from "../components/types";

export function useResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError(null);
    setErrorType(null);
    setResult(null);

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

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

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setErrorType(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:8000/api/roast-resume/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server Error: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        setErrorType(data.error as ErrorType);
        setError(data.message);
        return;
      }

      setResult(data);
    } catch (err: any) {
      setErrorType("network");
      setError(err.message || "Network error. Check your connection and try again.");
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

  return {
    file,
    dragging,
    loading,
    result,
    error,
    errorType,
    inputRef,
    setDragging,
    onInputChange,
    onDrop,
    analyze,
    reset,
  };
}