"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import styles from "./ResumeRoaster.module.css";
import { useResumeAnalysis } from "./../hooks/useResumeAnalysis";
import { UploadZone } from "./UploadZone";
import { AnalysisResult } from "./AnalysisResult";

export default function ResumeRoaster() {
  const {
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
  } = useResumeAnalysis();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
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
            Upload your resume. Our AI gives you honest, specific feedback — not
            the polite lies your friends tell you.
          </p>
        </motion.div>

        <div className={styles.card}>
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
              {!result && (
                <UploadZone
                  file={file}
                  dragging={dragging}
                  loading={loading}
                  error={error}
                  errorType={errorType}
                  inputRef={inputRef}
                  setDragging={setDragging}
                  onDrop={onDrop}
                  onInputChange={onInputChange}
                  analyze={analyze}
                  reset={reset}
                />
              )}

              {result && <AnalysisResult result={result} reset={reset} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}