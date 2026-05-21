"""
Analytics Agent for AI Interview Copilot v5
Provides real-time analytics and insights
"""

import logging
import numpy as np
from typing import List, Dict, Optional, Any
from datetime import datetime
from models.interview_models import InterviewSession, InterviewAnalytics
from services.analytics_service import analytics_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsAgent:
    """Analytics Agent for real-time interview insights"""
    
    def __init__(self):
        """Initialize analytics agent"""
        self.performance_metrics = {}
        self.benchmark_data = self._load_benchmarks()
    
    def _load_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """Load performance benchmarks"""
        return {
            "software_engineer": {
                "technical": 7.0,
                "communication": 7.5,
                "problem_solving": 7.0,
                "confidence": 7.0
            },
            "data_scientist": {
                "technical": 7.5,
                "communication": 6.5,
                "problem_solving": 8.0,
                "confidence": 6.5
            },
            "product_manager": {
                "technical": 5.5,
                "communication": 8.5,
                "problem_solving": 7.5,
                "confidence": 8.0
            }
        }
    
    async def generate_live_dashboard(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate live dashboard data"""
        try:
            # Get current metrics
            current_metrics = analytics_service.generate_live_metrics(session)
            
            # Calculate performance trends
            trends = self._calculate_performance_trends(session)
            
            # Generate skill coverage
            skill_coverage = self._analyze_skill_coverage(session)
            
            # Assess interview efficiency
            efficiency = analytics_service.calculate_interview_efficiency(session)
            
            dashboard = {
                "session_id": session.session_id,
                "candidate_name": session.candidate_name,
                "position": session.position,
                "current_stage": current_metrics["current_stage"],
                "current_difficulty": current_metrics["current_difficulty"],
                "progress_percentage": current_metrics["progress_percentage"],
                "elapsed_time": current_metrics["elapsed_time_minutes"],
                "questions_remaining": current_metrics["questions_remaining"],
                "live_scores": current_metrics["current_scores"],
                "stress_level": current_metrics["stress_level"],
                "skill_coverage": skill_coverage,
                "performance_trends": trends,
                "efficiency_metrics": efficiency,
                "benchmark_comparison": self._compare_to_benchmarks(session),
                "predicted_outcome": self._predict_outcome(session),
                "recommendations": self._generate_recommendations(session)
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Error generating live dashboard: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_performance_trends(self, session: InterviewSession) -> Dict[str, Any]:
        """Calculate performance trends"""
        if len(session.evaluations) < 3:
            return {"trend": "insufficient_data"}
        
        scores = [eval.overall_score for eval in session.evaluations]
        
        # Calculate trend
        if len(scores) >= 5:
            recent_avg = np.mean(scores[-3:])
            early_avg = np.mean(scores[:3])
            
            if recent_avg > early_avg + 1.0:
                trend = "improving"
            elif recent_avg < early_avg - 1.0:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "trend": trend,
            "current_average": np.mean(scores),
            "peak_score": max(scores),
            "lowest_score": min(scores),
            "volatility": np.std(scores)
        }
    
    def _analyze_skill_coverage(self, session: InterviewSession) -> Dict[str, Any]:
        """Analyze skill coverage"""
        required_skills = set(session.job_description.required_skills)
        covered_skills = set()
        
        # Simple coverage analysis
        for question in session.questions_asked:
            if question.category.lower() in [skill.lower() for skill in required_skills]:
                covered_skills.add(question.category.lower())
        
        coverage_percentage = (len(covered_skills) / max(len(required_skills), 1)) * 100
        
        return {
            "required_skills": len(required_skills),
            "covered_skills": len(covered_skills),
            "coverage_percentage": round(coverage_percentage, 1),
            "missing_skills": list(required_skills - covered_skills)
        }
    
    def _compare_to_benchmarks(self, session: InterviewSession) -> Dict[str, Any]:
        """Compare performance to benchmarks"""
        if not session.evaluations:
            return {"status": "no_data"}
        
        # Get role category
        role = self._categorize_role(session.position)
        benchmark = self.benchmark_data.get(role, {})
        
        if not benchmark:
            return {"status": "no_benchmark"}
        
        # Calculate averages
        avg_scores = {
            "technical": np.mean([eval.technical_accuracy for eval in session.evaluations]),
            "communication": np.mean([eval.communication_clarity for eval in session.evaluations]),
            "problem_solving": np.mean([eval.problem_solving for eval in session.evaluations]),
            "confidence": np.mean([eval.confidence for eval in session.evaluations])
        }
        
        # Calculate differences
        comparison = {}
        for skill, score in avg_scores.items():
            bench_score = benchmark.get(skill, 7.0)
            comparison[skill] = {
                "candidate_score": round(score, 1),
                "benchmark_score": bench_score,
                "difference": round(score - bench_score, 1),
                "performance": "above" if score > bench_score else "below" if score < bench_score else "at"
            }
        
        return comparison
    
    def _categorize_role(self, position: str) -> str:
        """Categorize position"""
        position_lower = position.lower()
        
        if any(term in position_lower for term in ["data scientist", "analytics", "ml"]):
            return "data_scientist"
        elif any(term in position_lower for term in ["product manager", "pm"]):
            return "product_manager"
        else:
            return "software_engineer"
    
    def _predict_outcome(self, session: InterviewSession) -> Dict[str, Any]:
        """Predict interview outcome"""
        if not session.evaluations:
            return {"prediction": "insufficient_data"}
        
        avg_score = np.mean([eval.overall_score for eval in session.evaluations])
        
        # Simple prediction based on current performance
        if avg_score >= 8.0:
            outcome = "strong_hire"
            confidence = "high"
        elif avg_score >= 6.5:
            outcome = "likely_hire"
            confidence = "medium"
        elif avg_score >= 5.0:
            outcome = "borderline"
            confidence = "low"
        else:
            outcome = "unlikely_hire"
            confidence = "high"
        
        return {
            "outcome": outcome,
            "confidence": confidence,
            "current_score": round(avg_score, 1),
            "projected_final_score": round(avg_score * 1.05, 1)  # Assume slight improvement
        }
    
    def _generate_recommendations(self, session: InterviewSession) -> List[str]:
        """Generate real-time recommendations"""
        recommendations = []
        
        if not session.evaluations:
            return ["Continue interview to gather more data"]
        
        avg_scores = {
            "technical": np.mean([eval.technical_accuracy for eval in session.evaluations]),
            "communication": np.mean([eval.communication_clarity for eval in session.evaluations]),
            "problem_solving": np.mean([eval.problem_solving for eval in session.evaluations]),
            "confidence": np.mean([eval.confidence for eval in session.evaluations])
        }
        
        # Generate specific recommendations
        for skill, score in avg_scores.items():
            if score < 5.0:
                if skill == "technical":
                    recommendations.append("Focus on technical fundamentals in remaining questions")
                elif skill == "communication":
                    recommendations.append("Encourage more detailed explanations")
                elif skill == "problem_solving":
                    recommendations.append("Ask more structured problem-solving questions")
                elif skill == "confidence":
                    recommendations.append("Create a more comfortable atmosphere")
        
        if not recommendations:
            recommendations.append("Candidate performing well, continue current approach")
        
        return recommendations[:3]  # Limit to 3 recommendations
    
    async def generate_comprehensive_analytics(self, session: InterviewSession) -> InterviewAnalytics:
        """Generate comprehensive analytics"""
        return await analytics_service.generate_interview_analytics(session)
    
    def get_performance_summary(self, session: InterviewSession) -> Dict[str, Any]:
        """Get performance summary"""
        if not session.evaluations:
            return {"status": "no_evaluations"}
        
        evaluations = session.evaluations
        
        summary = {
            "total_questions": len(session.questions_asked),
            "total_evaluations": len(evaluations),
            "average_scores": {
                "technical": round(np.mean([eval.technical_accuracy for eval in evaluations]), 2),
                "communication": round(np.mean([eval.communication_clarity for eval in evaluations]), 2),
                "problem_solving": round(np.mean([eval.problem_solving for eval in evaluations]), 2),
                "confidence": round(np.mean([eval.confidence for eval in evaluations]), 2),
                "overall": round(np.mean([eval.overall_score for eval in evaluations]), 2)
            },
            "score_distribution": self._get_score_distribution(evaluations),
            "stress_analysis": self._analyze_stress_patterns(evaluations),
            "improvement_areas": self._identify_improvement_areas(evaluations)
        }
        
        return summary
    
    def _get_score_distribution(self, evaluations: List) -> Dict[str, int]:
        """Get score distribution"""
        distribution = {"excellent": 0, "good": 0, "average": 0, "poor": 0}
        
        for eval in evaluations:
            score = eval.overall_score
            if score >= 8:
                distribution["excellent"] += 1
            elif score >= 6:
                distribution["good"] += 1
            elif score >= 4:
                distribution["average"] += 1
            else:
                distribution["poor"] += 1
        
        return distribution
    
    def _analyze_stress_patterns(self, evaluations: List) -> Dict[str, Any]:
        """Analyze stress patterns"""
        stress_levels = [eval.stress_level.value for eval in evaluations]
        
        return {
            "low_count": stress_levels.count("low"),
            "moderate_count": stress_levels.count("moderate"),
            "high_count": stress_levels.count("high"),
            "dominant_level": max(set(stress_levels), key=stress_levels.count) if stress_levels else "unknown"
        }
    
    def _identify_improvement_areas(self, evaluations: List) -> List[str]:
        """Identify improvement areas"""
        areas = []
        
        avg_technical = np.mean([eval.technical_accuracy for eval in evaluations])
        avg_communication = np.mean([eval.communication_clarity for eval in evaluations])
        avg_problem_solving = np.mean([eval.problem_solving for eval in evaluations])
        avg_confidence = np.mean([eval.confidence for eval in evaluations])
        
        if avg_technical < 6.0:
            areas.append("Technical Skills")
        if avg_communication < 6.0:
            areas.append("Communication")
        if avg_problem_solving < 6.0:
            areas.append("Problem Solving")
        if avg_confidence < 6.0:
            areas.append("Confidence")
        
        return areas

# Global analytics agent instance
analytics_agent = AnalyticsAgent()
