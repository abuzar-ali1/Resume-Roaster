import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  XCircle,
  Zap,
} from "lucide-react";
import styles from "./ResumeRoaster.module.css";
import type { ErrorType } from "./types";

interface UploadZoneProps {
  file: File | null;
  dragging: boolean;
  loading: boolean;
  error: string | null;
  errorType: ErrorType;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setDragging: (val: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analyze: () => void;
  reset: () => void;
}

export function UploadZone({
  file,
  dragging,
  loading,
  error,
  errorType,
  inputRef,
  setDragging,
  onDrop,
  onInputChange,
  analyze,
  reset,
}: UploadZoneProps) {
  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ""} ${
          file ? styles.dropzoneHasFile : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
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
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>
                {(file.size / 1024).toFixed(1)} KB — Ready to analyze
              </p>
            </div>
            <button
              className={styles.removeFile}
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          <div className={styles.dropContent}>
            <div className={styles.uploadIconWrap}>
              <Upload className={styles.uploadIcon} />
            </div>
            <p className={styles.dropTitle}>Drop your resume here</p>
            <p className={styles.dropSub}>
              or click to browse — PDF or DOCX, max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          className={`${styles.errorBox} ${
            errorType === "not_resume" ? styles.errorBoxWarning : ""
          }`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          <p>{error}</p>
        </motion.div>
      )}

      <button
        className={styles.analyzeBtn}
        onClick={analyze}
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <Loader2 className={styles.spin} size={18} /> Analyzing...
          </>
        ) : (
          <>
            <Zap size={18} /> Roast My Resume
          </>
        )}
      </button>

      <p className={styles.disclaimer}>
        Your resume is never stored. Analyzed and discarded immediately.
      </p>
    </motion.div>
  );
}
