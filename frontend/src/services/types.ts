// API Types for AI Interview Copilot v5

export interface ResumeData {
  skills: string[];
  technologies: string[];
  projects: string[];
  leadership_roles: string[];
  total_experience_years: number;
  experience_level: string;
  industry_domain: string;
  education: string[];
  certifications: string[];
}

export interface JobDescription {
  required_skills: string[];
  technologies: string[];
  responsibilities: string[];
  seniority_level: string;
  department: string;
  location: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stage: string;
  follow_up_to?: string;
}

export interface Answer {
  question_id: string;
  text: string;
  response_time_seconds: number;
}

export interface EvaluationScore {
  question_id: string;
  technical_accuracy: number;
  communication_clarity: number;
  problem_solving: number;
  confidence: number;
  relevance: number;
  depth: number;
  overall_score: number;
  feedback: string;
  stress_level: 'low' | 'moderate' | 'high';
}

export interface InterviewSession {
  session_id: string;
  candidate_name: string;
  position: string;
  resume_data: ResumeData;
  job_description: JobDescription;
  current_stage: string;
  current_difficulty: string;
  questions_asked: Question[];
  answers_received: Answer[];
  evaluations: EvaluationScore[];
  start_time: string;
  is_active: boolean;
}

export interface DashboardData {
  session_id: string;
  candidate_name: string;
  position: string;
  current_stage: string;
  current_difficulty: string;
  progress_percentage: number;
  elapsed_time: number;
  questions_remaining: number;
  live_scores: {
    technical: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  stress_level: string;
  skill_coverage: {
    required_skills: number;
    covered_skills: number;
    coverage_percentage: number;
    missing_skills: string[];
  };
  performance_trends: {
    trend: string;
    current_average: number;
    peak_score: number;
    lowest_score: number;
    volatility: number;
  };
  predicted_outcome: {
    outcome: string;
    confidence: string;
    current_score: number;
    projected_final_score: number;
  };
}

export interface SkillNode {
  name: string;
  proficiency: number;
  category: string;
  dependencies: string[];
}

export interface SkillGraph {
  nodes: SkillNode[];
  edges: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
}

export interface FinalReport {
  session_evaluation: {
    overall_score: number;
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    confidence_score: number;
  };
  hr_analysis: {
    hiring_score: number;
    recommendation: string;
    reasoning: string;
    key_strengths: string[];
    key_concerns: string[];
  };
  hiring_prediction: {
    session_id: string;
    hiring_probability: number;
    confidence_level: string;
    reasoning: string[];
    key_strengths: string[];
    key_concerns: string[];
    recommendation: string;
  };
  final_report: {
    candidate_name: string;
    position: string;
    interview_date: string;
    interview_duration: string;
    overall_score: number;
    recommendation: string;
    reasoning: string;
    strengths: string[];
    concerns: string[];
    confidence_level: string;
    next_steps: string;
  };
  comprehensive_analytics: {
    average_scores: {
      technical: number;
      communication: number;
      problem_solving: number;
      confidence: number;
      overall: number;
    };
    score_distribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
    };
    stress_analysis: {
      low_count: number;
      moderate_count: number;
      high_count: number;
      dominant_level: string;
    };
    improvement_areas: string[];
  };
  generated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  version: string;
}

export interface VoiceRecording {
  blob: Blob;
  duration: number;
  transcript?: string;
}
