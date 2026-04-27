import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, TrendingUp, Shield, Target, Flame } from "lucide-react";
import styles from "./ResumeRoaster.module.css";
import type { RoastResult } from "./types";

const hiringColors: Record<string, string> = {
  Low: "#EF4444",
  Medium: "#F59E0B",
  High: "#10B981",
  "Very High": "#0891B2",
};

const scoreColor = (s: number) => (s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444");

interface AnalysisResultProps {
  result: RoastResult;
  reset: () => void;
}

export function AnalysisResult({ result, reset }: AnalysisResultProps) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.results}
    >
      <div className={styles.roastBox}>
        <p className={styles.roastLabel}>
          <Flame size={12} /> The Honest Verdict
        </p>
        <p className={styles.roastText}>"{result.roast}"</p>
      </div>

      <div className={styles.scoresRow}>
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
              {result.overall_score}
              <span className={styles.scoreOf}>/100</span>
            </span>
          </div>
          <p className={styles.scoreVerdict}>{result.overall_verdict}</p>
        </div>

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
            <span className={styles.scoreNum} style={{ color: scoreColor(result.ats_score) }}>
              {result.ats_score}
              <span className={styles.scoreOf}>/100</span>
            </span>
          </div>
          <p className={styles.scoreVerdict}>{result.ats_tip}</p>
        </div>

        <div className={styles.hiringCard}>
          <p className={styles.scoreLabel}>
            <TrendingUp size={11} /> Hiring Chance
          </p>
          <p className={styles.hiringValue} style={{ color: hiringColors[result.hiring_chance] }}>
            {result.hiring_chance}
          </p>
          <p className={styles.hiringRole}>{result.role_detected}</p>
        </div>
      </div>

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

      {result.missing_sections.length > 0 && (
        <div className={styles.missingCard}>
          <p className={styles.missingLabel}>Missing Sections</p>
          <div className={styles.missingTags}>
            {result.missing_sections.map((s, i) => (
              <span key={i} className={styles.missingTag}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <button className={styles.resetBtn} onClick={reset}>
        <RotateCcw size={15} />
        Analyze Another Resume
      </button>
    </motion.div>
  );
}