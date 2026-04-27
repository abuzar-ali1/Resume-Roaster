export interface RoastResult {
  candidate_name: string;
  role_detected: string;
  overall_score: number;
  overall_verdict: string;
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  quick_fixes: string[];
  ats_score: number;
  ats_tip: string;
  hiring_chance: "Low" | "Medium" | "High" | "Very High";
  roast: string;
}

export type ErrorType =
  | "no_file"
  | "wrong_format"
  | "too_large"
  | "empty_file"
  | "not_resume"
  | "parse_failed"
  | "groq_error"
  | "network"
  | null;