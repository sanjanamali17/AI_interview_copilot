"""
Analytics Service for AI Interview Copilot v5
Provides interview analytics, insights, and performance tracking
"""

import logging
import numpy as np
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from models.interview_models import (
    InterviewSession, EvaluationScore, InterviewAnalytics,
    InterviewStage, StressLevel, DifficultyLevel
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for interview analytics and insights"""
    
    def __init__(self):
        """Initialize analytics service"""
        self.performance_benchmarks = self._load_performance_benchmarks()
        self.skill_weightings = self._load_skill_weightings()
    
    def _load_performance_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """Load performance benchmarks for different roles and levels"""
        return {
            "software_engineer": {
                "beginner": {"technical": 5.0, "communication": 6.0, "problem_solving": 4.5, "confidence": 5.5},
                "intermediate": {"technical": 7.0, "communication": 7.0, "problem_solving": 6.5, "confidence": 7.0},
                "senior": {"technical": 8.5, "communication": 8.0, "problem_solving": 8.0, "confidence": 8.5}
            },
            "data_scientist": {
                "beginner": {"technical": 5.5, "communication": 5.5, "problem_solving": 5.0, "confidence": 5.0},
                "intermediate": {"technical": 7.5, "communication": 6.5, "problem_solving": 7.0, "confidence": 6.5},
                "senior": {"technical": 9.0, "communication": 7.5, "problem_solving": 8.5, "confidence": 8.0}
            },
            "product_manager": {
                "beginner": {"technical": 4.0, "communication": 7.0, "problem_solving": 6.0, "confidence": 7.0},
                "intermediate": {"technical": 5.0, "communication": 8.0, "problem_solving": 7.5, "confidence": 8.0},
                "senior": {"technical": 6.0, "communication": 9.0, "problem_solving": 8.5, "confidence": 9.0}
            }
        }
    
    def _load_skill_weightings(self) -> Dict[str, float]:
        """Load weightings for different skills in overall scoring"""
        return {
            "technical_accuracy": 0.35,
            "communication_clarity": 0.25,
            "problem_solving": 0.30,
            "confidence": 0.10
        }
    
    async def generate_interview_analytics(self, session: InterviewSession) -> InterviewAnalytics:
        """
        Generate comprehensive interview analytics
        
        Args:
            session: Interview session to analyze
            
        Returns:
            Interview analytics object
        """
        try:
            logger.info(f"Generating analytics for session {session.session_id}")
            
            # Calculate average scores
            average_score = self._calculate_average_score(session.evaluations)
            
            # Identify strongest and weakest areas
            strongest_areas, weakest_areas = self._analyze_strength_weakness(session.evaluations)
            
            # Analyze question count by stage
            question_count_by_stage = self._analyze_stage_coverage(session)
            
            # Track difficulty progression
            difficulty_progression = self._analyze_difficulty_progression(session)
            
            # Analyze stress patterns
            stress_pattern = self._analyze_stress_patterns(session.evaluations)
            
            # Calculate time spent per stage
            time_spent_per_stage = self._calculate_time_per_stage(session)
            
            # Detect knowledge gaps
            knowledge_gaps = await self._detect_knowledge_gaps(session)
            
            analytics = InterviewAnalytics(
                session_id=session.session_id,
                average_score=average_score,
                strongest_areas=strongest_areas,
                weakest_areas=weakest_areas,
                question_count_by_stage=question_count_by_stage,
                difficulty_progression=difficulty_progression,
                stress_pattern=stress_pattern,
                time_spent_per_stage=time_spent_per_stage,
                knowledge_gaps=knowledge_gaps
            )
            
            logger.info(f"Generated analytics for session {session.session_id}")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating interview analytics: {str(e)}")
            raise
    
    def _calculate_average_score(self, evaluations: List[EvaluationScore]) -> float:
        """Calculate average overall score from evaluations"""
        if not evaluations:
            return 0.0
        
        total_score = sum(eval.overall_score for eval in evaluations)
        return round(total_score / len(evaluations), 2)
    
    def _analyze_strength_weakness(self, evaluations: List[EvaluationScore]) -> Tuple[List[str], List[str]]:
        """Analyze candidate's strongest and weakest areas"""
        if not evaluations:
            return [], []
        
        # Calculate average for each dimension
        avg_technical = np.mean([eval.technical_accuracy for eval in evaluations])
        avg_communication = np.mean([eval.communication_clarity for eval in evaluations])
        avg_problem_solving = np.mean([eval.problem_solving for eval in evaluations])
        avg_confidence = np.mean([eval.confidence for eval in evaluations])
        
        scores = {
            "Technical Knowledge": avg_technical,
            "Communication": avg_communication,
            "Problem Solving": avg_problem_solving,
            "Confidence": avg_confidence
        }
        
        # Sort by score
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Strongest areas (top 2)
        strongest = [area for area, score in sorted_scores[:2] if score >= 7.0]
        
        # Weakest areas (bottom 2)
        weakest = [area for area, score in sorted_scores[-2:] if score < 6.0]
        
        return strongest, weakest
    
    def _analyze_stage_coverage(self, session: InterviewSession) -> Dict[str, int]:
        """Analyze question coverage by interview stage"""
        stage_counts = {}
        
        for question in session.questions_asked:
            stage_name = question.stage.value
            stage_counts[stage_name] = stage_counts.get(stage_name, 0) + 1
        
        return stage_counts
    
    def _analyze_difficulty_progression(self, session: InterviewSession) -> List[DifficultyLevel]:
        """Analyze difficulty progression throughout interview"""
        return [question.difficulty for question in session.questions_asked]
    
    def _analyze_stress_patterns(self, evaluations: List[EvaluationScore]) -> List[StressLevel]:
        """Analyze stress patterns throughout interview"""
        return [eval.stress_level for eval in evaluations]
    
    def _calculate_time_per_stage(self, session: InterviewSession) -> Dict[str, float]:
        """Calculate time spent per interview stage"""
        stage_times = {}
        
        if not session.start_time:
            return stage_times
        
        end_time = session.end_time or datetime.now()
        total_duration = (end_time - session.start_time).total_seconds() / 60  # minutes
        
        # Distribute time based on question count per stage
        stage_counts = self._analyze_stage_coverage(session)
        total_questions = sum(stage_counts.values())
        
        if total_questions > 0:
            for stage, count in stage_counts.items():
                stage_times[stage] = round((count / total_questions) * total_duration, 2)
        
        return stage_times
    
    async def _detect_knowledge_gaps(self, session: InterviewSession) -> List[str]:
        """Detect knowledge gaps from interview performance"""
        knowledge_gaps = []
        
        # Analyze low-scoring areas
        if session.evaluations:
            avg_scores = {
                "Technical Knowledge": np.mean([eval.technical_accuracy for eval in session.evaluations]),
                "Communication": np.mean([eval.communication_clarity for eval in session.evaluations]),
                "Problem Solving": np.mean([eval.problem_solving for eval in session.evaluations])
            }
            
            for area, score in avg_scores.items():
                if score < 5.0:
                    knowledge_gaps.append(f"{area} (Score: {score:.1f}/10)")
        
        # Compare with job requirements
        required_skills = session.job_description.required_skills
        resume_skills = session.resume_data.skills
        
        missing_skills = [skill for skill in required_skills if skill.lower() not in [rs.lower() for rs in resume_skills]]
        if missing_skills:
            knowledge_gaps.extend([f"Missing skill: {skill}" for skill in missing_skills[:3]])
        
        return knowledge_gaps
    
    def calculate_performance_percentile(self, session: InterviewSession) -> float:
        """
        Calculate candidate's performance percentile against benchmarks
        
        Args:
            session: Interview session
            
        Returns:
            Performance percentile (0-100)
        """
        if not session.evaluations:
            return 0.0
        
        # Determine role category
        role_category = self._categorize_role(session.position)
        experience_level = self._categorize_experience(session.resume_data.total_experience_years)
        
        # Get benchmark for this role and level
        benchmark = self.performance_benchmarks.get(role_category, {}).get(experience_level, {})
        
        if not benchmark:
            return 50.0  # Default to 50th percentile
        
        # Calculate candidate's average scores
        candidate_scores = {
            "technical": np.mean([eval.technical_accuracy for eval in session.evaluations]),
            "communication": np.mean([eval.communication_clarity for eval in session.evaluations]),
            "problem_solving": np.mean([eval.problem_solving for eval in session.evaluations]),
            "confidence": np.mean([eval.confidence for eval in session.evaluations])
        }
        
        # Calculate percentile based on benchmark
        total_deviation = 0
        count = 0
        
        for skill, score in candidate_scores.items():
            if skill in benchmark:
                deviation = (score - benchmark[skill]) / 10.0  # Normalize to 0-1
                total_deviation += deviation
                count += 1
        
        if count == 0:
            return 50.0
        
        avg_deviation = total_deviation / count
        percentile = max(0, min(100, 50 + (avg_deviation * 50)))
        
        return round(percentile, 1)
    
    def _categorize_role(self, position: str) -> str:
        """Categorize position into role types"""
        position_lower = position.lower()
        
        if any(term in position_lower for term in ["data scientist", "data science", "analytics", "ml"]):
            return "data_scientist"
        elif any(term in position_lower for term in ["product manager", "product owner", "pm"]):
            return "product_manager"
        else:
            return "software_engineer"
    
    def _categorize_experience(self, years: float) -> str:
        """Categorize experience level"""
        if years >= 7:
            return "senior"
        elif years >= 3:
            return "intermediate"
        else:
            return "beginner"
    
    def generate_improvement_recommendations(self, session: InterviewSession) -> List[str]:
        """
        Generate personalized improvement recommendations
        
        Args:
            session: Interview session
            
        Returns:
            List of improvement recommendations
        """
        recommendations = []
        
        if not session.evaluations:
            return recommendations
        
        # Analyze weak areas
        avg_scores = {
            "Technical Knowledge": np.mean([eval.technical_accuracy for eval in session.evaluations]),
            "Communication": np.mean([eval.communication_clarity for eval in session.evaluations]),
            "Problem Solving": np.mean([eval.problem_solving for eval in session.evaluations]),
            "Confidence": np.mean([eval.confidence for eval in session.evaluations])
        }
        
        # Generate specific recommendations
        for area, score in avg_scores.items():
            if score < 5.0:
                if area == "Technical Knowledge":
                    recommendations.append("Focus on strengthening core technical concepts through hands-on projects")
                elif area == "Communication":
                    recommendations.append("Practice explaining technical concepts clearly and concisely")
                elif area == "Problem Solving":
                    recommendations.append("Work on breaking down complex problems into smaller, manageable steps")
                elif area == "Confidence":
                    recommendations.append("Practice mock interviews to build confidence and reduce anxiety")
        
        # Add job-specific recommendations
        missing_skills = [skill for skill in session.job_description.required_skills 
                         if skill.lower() not in [rs.lower() for rs in session.resume_data.skills]]
        
        if missing_skills:
            recommendations.append(f"Develop skills in: {', '.join(missing_skills[:3])}")
        
        return recommendations
    
    def calculate_interview_efficiency(self, session: InterviewSession) -> Dict[str, float]:
        """
        Calculate interview efficiency metrics
        
        Args:
            session: Interview session
            
        Returns:
            Dictionary with efficiency metrics
        """
        if not session.start_time:
            return {}
        
        end_time = session.end_time or datetime.now()
        total_duration = (end_time - session.start_time).total_seconds() / 60  # minutes
        
        total_questions = len(session.questions_asked)
        total_answers = len(session.answers_received)
        
        # Calculate metrics
        questions_per_minute = total_questions / max(total_duration, 1)
        answer_rate = total_answers / max(total_questions, 1)
        
        # Calculate average response time
        avg_response_time = 0
        if session.answers_received:
            avg_response_time = np.mean([ans.response_time_seconds for ans in session.answers_received])
        
        return {
            "total_duration_minutes": round(total_duration, 2),
            "questions_per_minute": round(questions_per_minute, 2),
            "answer_rate": round(answer_rate, 2),
            "average_response_time_seconds": round(avg_response_time, 2),
            "interview_completeness": round((total_answers / max(total_questions, 1)) * 100, 1)
        }
    
    def generate_live_metrics(self, session: InterviewSession) -> Dict[str, Any]:
        """
        Generate live interview metrics for dashboard
        
        Args:
            session: Interview session
            
        Returns:
            Live metrics dictionary
        """
        # Calculate current scores
        current_scores = {}
        if session.evaluations:
            current_scores = {
                "technical": round(np.mean([eval.technical_accuracy for eval in session.evaluations[-3:]]), 1),
                "communication": round(np.mean([eval.communication_clarity for eval in session.evaluations[-3:]]), 1),
                "problem_solving": round(np.mean([eval.problem_solving for eval in session.evaluations[-3:]]), 1),
                "confidence": round(np.mean([eval.confidence for eval in session.evaluations[-3:]]), 1)
            }
        
        # Calculate progress
        total_stages = len(list(InterviewStage))
        current_stage_index = list(InterviewStage).index(session.current_stage)
        progress_percentage = (current_stage_index / (total_stages - 1)) * 100 if total_stages > 1 else 0
        
        # Time metrics
        elapsed_time = (datetime.now() - session.start_time).total_seconds() / 60  # minutes
        questions_remaining = max(0, 15 - len(session.questions_asked))  # Assuming 15 questions max
        
        return {
            "current_stage": session.current_stage.value,
            "current_difficulty": session.current_difficulty.value,
            "progress_percentage": round(progress_percentage, 1),
            "elapsed_time_minutes": round(elapsed_time, 1),
            "questions_asked": len(session.questions_asked),
            "questions_remaining": questions_remaining,
            "current_scores": current_scores,
            "stress_level": session.evaluations[-1].stress_level.value if session.evaluations else "low",
            "skill_coverage": self._calculate_skill_coverage(session)
        }
    
    def _calculate_skill_coverage(self, session: InterviewSession) -> Dict[str, float]:
        """Calculate skill coverage percentage"""
        required_skills = set(skill.lower() for skill in session.job_description.required_skills)
        covered_skills = set()
        
        # Simple heuristic: if a question category matches a skill, consider it covered
        for question in session.questions_asked:
            if question.category.lower() in required_skills:
                covered_skills.add(question.category.lower())
        
        coverage_percentage = (len(covered_skills) / max(len(required_skills), 1)) * 100
        
        return {
            "covered_skills": len(covered_skills),
            "total_required_skills": len(required_skills),
            "coverage_percentage": round(coverage_percentage, 1)
        }

# Global analytics service instance
analytics_service = AnalyticsService()
