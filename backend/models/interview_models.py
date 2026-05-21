"""
Data models for AI Interview Copilot v5
"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field

class DifficultyLevel(str, Enum):
    """Interview difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class InterviewStage(str, Enum):
    """Interview stages"""
    INTRODUCTION = "introduction"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    TECHNICAL_QUESTIONS = "technical_questions"
    SYSTEM_DESIGN = "system_design"
    SITUATIONAL_PROBLEMS = "situational_problems"
    BEHAVIORAL_QUESTIONS = "behavioral_questions"
    CANDIDATE_QUESTIONS = "candidate_questions"
    CLOSING = "closing"

class StressLevel(str, Enum):
    """Stress level indicators"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class HiringRecommendation(str, Enum):
    """Hiring recommendations"""
    HIRE = "hire"
    CONSIDER = "consider"
    REJECT = "reject"

class ResumeData(BaseModel):
    """Resume information model"""
    skills: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    leadership_roles: List[str] = Field(default_factory=list)
    experience_level: str = ""
    industry_domain: str = ""
    total_experience_years: float = 0.0
    education: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

class JobDescription(BaseModel):
    """Job description model"""
    required_skills: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    seniority_level: str = ""
    department: str = ""
    location: str = ""

class Question(BaseModel):
    """Interview question model"""
    id: str
    text: str
    stage: InterviewStage
    difficulty: DifficultyLevel
    category: str
    follow_up_to: Optional[str] = None
    context: Optional[str] = None

class Answer(BaseModel):
    """Candidate answer model"""
    question_id: str
    text: str
    audio_file_path: Optional[str] = None
    response_time_seconds: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.now)

class EvaluationScore(BaseModel):
    """Evaluation score model"""
    technical_accuracy: float = Field(ge=0, le=10)
    communication_clarity: float = Field(ge=0, le=10)
    problem_solving: float = Field(ge=0, le=10)
    confidence: float = Field(ge=0, le=10)
    overall_score: float = Field(ge=0, le=10)
    stress_level: StressLevel = StressLevel.LOW
    feedback: str = ""

class SkillNode(BaseModel):
    """Skill graph node"""
    name: str
    proficiency_level: float = Field(ge=0, le=10)
    category: str
    evidence_count: int = 0

class SkillGraph(BaseModel):
    """Candidate skill graph"""
    nodes: List[SkillNode] = Field(default_factory=list)
    edges: Dict[str, List[str]] = Field(default_factory=dict)
    last_updated: datetime = Field(default_factory=datetime.now)

class InterviewSession(BaseModel):
    """Interview session model"""
    session_id: str
    candidate_name: str
    position: str
    resume_data: ResumeData
    job_description: JobDescription
    current_stage: InterviewStage = InterviewStage.INTRODUCTION
    current_difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    questions_asked: List[Question] = Field(default_factory=list)
    answers_received: List[Answer] = Field(default_factory=list)
    evaluations: List[EvaluationScore] = Field(default_factory=list)
    skill_graph: SkillGraph = Field(default_factory=SkillGraph)
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    is_active: bool = True

class InterviewAnalytics(BaseModel):
    """Interview analytics model"""
    session_id: str
    average_score: float
    strongest_areas: List[str]
    weakest_areas: List[str]
    question_count_by_stage: Dict[str, int]
    difficulty_progression: List[DifficultyLevel]
    stress_pattern: List[StressLevel]
    time_spent_per_stage: Dict[str, float]
    knowledge_gaps: List[str]

class HiringPrediction(BaseModel):
    """Hiring prediction model"""
    session_id: str
    hiring_probability: float = Field(ge=0, le=1)
    confidence_level: str
    reasoning: List[str]
    key_strengths: List[str]
    key_concerns: List[str]
    recommendation: HiringRecommendation

class FinalReport(BaseModel):
    """Final interview report model"""
    session_id: str
    candidate_name: str
    position: str
    overall_score: float = Field(ge=0, le=10)
    technical_knowledge_score: float = Field(ge=0, le=10)
    communication_skills_score: float = Field(ge=0, le=10)
    problem_solving_score: float = Field(ge=0, le=10)
    stress_level_assessment: StressLevel
    skill_graph_summary: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    areas_for_improvement: List[str]
    recommended_learning_topics: List[str]
    hiring_probability_score: float = Field(ge=0, le=1)
    hiring_recommendation: HiringRecommendation
    reasoning: str
    interview_duration_minutes: float
    generated_at: datetime = Field(default_factory=datetime.now)

class LiveDashboard(BaseModel):
    """Live interview dashboard model"""
    session_id: str
    current_stage: InterviewStage
    current_question: str
    candidate_transcript: str
    live_scores: Dict[str, float]
    difficulty_level: DifficultyLevel
    skill_coverage_map: Dict[str, float]
    time_elapsed_minutes: float
    questions_remaining: int

class InterviewPlan(BaseModel):
    """Interview strategy plan model"""
    session_id: str
    stages: List[InterviewStage]
    questions_per_stage: Dict[str, int]
    difficulty_progression: List[DifficultyLevel]
    focus_areas: List[str]
    estimated_duration_minutes: int
    personalized_topics: List[str]
