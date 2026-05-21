"""
Prediction Agent for AI Interview Copilot v5
Predicts hiring probability and outcomes
"""

import logging
import numpy as np
from typing import List, Dict, Optional, Any
from datetime import datetime
from models.interview_models import InterviewSession, HiringPrediction, HiringRecommendation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PredictionAgent:
    """Prediction Agent for hiring probability and outcomes"""
    
    def __init__(self):
        """Initialize prediction agent"""
        self.prediction_model = self._load_prediction_model()
        self.success_factors = self._load_success_factors()
    
    def _load_prediction_model(self) -> Dict[str, float]:
        """Load prediction model weights"""
        return {
            "technical_score": 0.35,
            "communication_score": 0.20,
            "problem_solving_score": 0.25,
            "experience_years": 0.10,
            "skill_alignment": 0.10
        }
    
    def _load_success_factors(self) -> Dict[str, List[str]]:
        """Load success factors for different roles"""
        return {
            "software_engineer": [
                "strong technical fundamentals",
                "problem-solving ability",
                "code quality awareness",
                "team collaboration"
            ],
            "data_scientist": [
                "statistical knowledge",
                "analytical thinking",
                "communication of insights",
                "business acumen"
            ],
            "product_manager": [
                "stakeholder management",
                "prioritization skills",
                "market understanding",
                "leadership qualities"
            ]
        }
    
    async def predict_hiring_probability(self, session: InterviewSession) -> HiringPrediction:
        """Predict hiring probability with detailed reasoning"""
        try:
            logger.info(f"Predicting hiring probability for {session.candidate_name}")
            
            # Calculate base probability
            base_probability = self._calculate_base_probability(session)
            
            # Adjust for interview performance
            performance_adjustment = self._calculate_performance_adjustment(session)
            
            # Adjust for experience alignment
            experience_adjustment = self._calculate_experience_adjustment(session)
            
            # Adjust for cultural fit
            cultural_adjustment = self._calculate_cultural_adjustment(session)
            
            # Calculate final probability
            final_probability = base_probability + performance_adjustment + experience_adjustment + cultural_adjustment
            final_probability = max(0.0, min(1.0, final_probability))
            
            # Determine confidence level
            confidence_level = self._determine_confidence_level(session, final_probability)
            
            # Generate reasoning
            reasoning = await self._generate_prediction_reasoning(
                session, final_probability, performance_adjustment, experience_adjustment
            )
            
            # Identify key strengths and concerns
            strengths, concerns = self._identify_key_factors(session)
            
            # Make hiring recommendation
            recommendation = self._make_hiring_recommendation(final_probability)
            
            prediction = HiringPrediction(
                session_id=session.session_id,
                hiring_probability=round(final_probability, 3),
                confidence_level=confidence_level,
                reasoning=reasoning,
                key_strengths=strengths,
                key_concerns=concerns,
                recommendation=recommendation
            )
            
            logger.info(f"Hiring prediction: {final_probability:.1%} for {session.candidate_name}")
            return prediction
            
        except Exception as e:
            logger.error(f"Error predicting hiring probability: {str(e)}")
            # Return default prediction
            return HiringPrediction(
                session_id=session.session_id,
                hiring_probability=0.5,
                confidence_level="Low",
                reasoning=["Prediction could not be completed due to an error"],
                key_strengths=[],
                key_concerns=["Insufficient data for prediction"],
                recommendation=HiringRecommendation.CONSIDER
            )
    
    def _calculate_base_probability(self, session: InterviewSession) -> float:
        """Calculate base probability from resume and job match"""
        # Skill alignment
        required_skills = set(session.job_description.required_skills)
        candidate_skills = set(skill.lower() for skill in session.resume_data.skills)
        
        skill_match_ratio = len(required_skills.intersection(candidate_skills)) / max(len(required_skills), 1)
        
        # Experience alignment
        required_experience = self._extract_required_experience(session.job_description.seniority_level)
        experience_match = min(1.0, session.resume_data.total_experience_years / max(required_experience, 1))
        
        # Base probability
        base_prob = (skill_match_ratio * 0.6) + (experience_match * 0.4)
        
        return base_prob
    
    def _extract_required_experience(self, seniority: str) -> float:
        """Extract required experience from seniority level"""
        seniority_lower = seniority.lower()
        
        if "senior" in seniority_lower or "lead" in seniority_lower:
            return 7.0
        elif "mid" in seniority_lower or "intermediate" in seniority_lower:
            return 4.0
        elif "junior" in seniority_lower or "entry" in seniority_lower:
            return 1.0
        else:
            return 3.0  # Default
    
    def _calculate_performance_adjustment(self, session: InterviewSession) -> float:
        """Calculate performance adjustment from interview scores"""
        if not session.evaluations:
            return 0.0
        
        # Calculate average scores
        avg_technical = np.mean([eval.technical_accuracy for eval in session.evaluations])
        avg_communication = np.mean([eval.communication_clarity for eval in session.evaluations])
        avg_problem_solving = np.mean([eval.problem_solving for eval in session.evaluations])
        avg_confidence = np.mean([eval.confidence for eval in session.evaluations])
        
        # Weighted average
        weighted_score = (
            avg_technical * self.prediction_model["technical_score"] +
            avg_communication * self.prediction_model["communication_score"] +
            avg_problem_solving * self.prediction_model["problem_solving_score"]
        )
        
        # Convert to probability adjustment (-0.3 to +0.3)
        adjustment = (weighted_score - 5.0) / 10.0 * 0.6
        
        return adjustment
    
    def _calculate_experience_adjustment(self, session: InterviewSession) -> float:
        """Calculate experience adjustment"""
        years = session.resume_data.total_experience_years
        
        # Experience bonus/penalty
        if years >= 10:
            return 0.05  # Senior experience bonus
        elif years >= 5:
            return 0.02  # Mid-level bonus
        elif years < 2:
            return -0.03  # Junior penalty
        else:
            return 0.0  # Neutral
    
    def _calculate_cultural_adjustment(self, session: InterviewSession) -> float:
        """Calculate cultural fit adjustment"""
        if not session.evaluations:
            return 0.0
        
        # Use communication and confidence as cultural indicators
        avg_communication = np.mean([eval.communication_clarity for eval in session.evaluations])
        avg_confidence = np.mean([eval.confidence for eval in session.evaluations])
        
        cultural_score = (avg_communication + avg_confidence) / 2
        
        # Small adjustment based on cultural fit
        adjustment = (cultural_score - 5.0) / 10.0 * 0.1
        
        return adjustment
    
    def _determine_confidence_level(self, session: InterviewSession, probability: float) -> str:
        """Determine confidence level in prediction"""
        # Base confidence on data availability
        if len(session.evaluations) < 3:
            return "Low"
        elif len(session.evaluations) < 6:
            return "Medium"
        else:
            return "High"
    
    async def _generate_prediction_reasoning(
        self, session: InterviewSession, probability: float, 
        performance_adj: float, experience_adj: float
    ) -> List[str]:
        """Generate detailed reasoning for prediction"""
        reasoning = []
        
        # Base reasoning
        if probability >= 0.8:
            reasoning.append("Strong candidate with excellent qualifications")
        elif probability >= 0.6:
            reasoning.append("Good candidate meeting most requirements")
        elif probability >= 0.4:
            reasoning.append("Borderline candidate with mixed qualifications")
        else:
            reasoning.append("Weak candidate not meeting key requirements")
        
        # Performance reasoning
        if performance_adj > 0.1:
            reasoning.append("Exceptional interview performance")
        elif performance_adj < -0.1:
            reasoning.append("Below-average interview performance")
        
        # Experience reasoning
        if experience_adj > 0.02:
            reasoning.append("Relevant experience aligns well with role")
        elif experience_adj < -0.02:
            reasoning.append("Limited experience for role requirements")
        
        # Skill alignment reasoning
        skill_alignment = self._calculate_skill_alignment(session)
        if skill_alignment > 0.8:
            reasoning.append("Excellent skill alignment with job requirements")
        elif skill_alignment < 0.5:
            reasoning.append("Significant skill gaps for the position")
        
        return reasoning
    
    def _calculate_skill_alignment(self, session: InterviewSession) -> float:
        """Calculate skill alignment percentage"""
        required_skills = set(skill.lower() for skill in session.job_description.required_skills)
        candidate_skills = set(skill.lower() for skill in session.resume_data.skills + session.resume_data.technologies)
        
        if not required_skills:
            return 1.0
        
        alignment = len(required_skills.intersection(candidate_skills)) / len(required_skills)
        return alignment
    
    def _identify_key_factors(self, session: InterviewSession) -> tuple[List[str], List[str]]:
        """Identify key strengths and concerns"""
        strengths = []
        concerns = []
        
        if not session.evaluations:
            return strengths, concerns
        
        # Analyze performance
        avg_technical = np.mean([eval.technical_accuracy for eval in session.evaluations])
        avg_communication = np.mean([eval.communication_clarity for eval in session.evaluations])
        avg_problem_solving = np.mean([eval.problem_solving for eval in session.evaluations])
        
        # Strengths
        if avg_technical >= 8.0:
            strengths.append("Strong technical knowledge")
        if avg_communication >= 8.0:
            strengths.append("Excellent communication skills")
        if avg_problem_solving >= 8.0:
            strengths.append("Outstanding problem-solving ability")
        
        # Experience strengths
        if session.resume_data.total_experience_years >= 5:
            strengths.append("Relevant professional experience")
        
        # Leadership strengths
        if session.resume_data.leadership_roles:
            strengths.append("Leadership experience")
        
        # Concerns
        if avg_technical < 5.0:
            concerns.append("Weak technical foundation")
        if avg_communication < 5.0:
            concerns.append("Communication challenges")
        if avg_problem_solving < 5.0:
            concerns.append("Limited problem-solving skills")
        
        # Experience concerns
        if session.resume_data.total_experience_years < 2:
            concerns.append("Limited professional experience")
        
        # Skill gap concerns
        skill_alignment = self._calculate_skill_alignment(session)
        if skill_alignment < 0.6:
            concerns.append("Significant skill gaps")
        
        return strengths, concerns
    
    def _make_hiring_recommendation(self, probability: float) -> HiringRecommendation:
        """Make hiring recommendation based on probability"""
        if probability >= 0.75:
            return HiringRecommendation.HIRE
        elif probability >= 0.5:
            return HiringRecommendation.CONSIDER
        else:
            return HiringRecommendation.REJECT
    
    async def predict_success_probability(self, session: InterviewSession) -> Dict[str, Any]:
        """Predict probability of success in the role"""
        try:
            # Get role category
            role_category = self._categorize_role(session.position)
            
            # Get success factors for role
            success_factors = self.success_factors.get(role_category, [])
            
            # Assess against success factors
            factor_scores = {}
            for factor in success_factors:
                score = self._assess_success_factor(session, factor)
                factor_scores[factor] = score
            
            # Calculate overall success probability
            if factor_scores:
                success_probability = np.mean(list(factor_scores.values()))
            else:
                success_probability = 0.5
            
            # Generate success insights
            insights = await self._generate_success_insights(session, factor_scores)
            
            return {
                "success_probability": round(success_probability, 3),
                "success_factors": factor_scores,
                "role_category": role_category,
                "insights": insights,
                "recommendations": self._generate_success_recommendations(factor_scores)
            }
            
        except Exception as e:
            logger.error(f"Error predicting success probability: {str(e)}")
            return {"error": str(e)}
    
    def _categorize_role(self, position: str) -> str:
        """Categorize position for success prediction"""
        position_lower = position.lower()
        
        if any(term in position_lower for term in ["data scientist", "analytics", "ml"]):
            return "data_scientist"
        elif any(term in position_lower for term in ["product manager", "pm"]):
            return "product_manager"
        else:
            return "software_engineer"
    
    def _assess_success_factor(self, session: InterviewSession, factor: str) -> float:
        """Assess specific success factor"""
        factor_lower = factor.lower()
        
        # Map factors to evaluation metrics
        if "technical" in factor_lower:
            return np.mean([eval.technical_accuracy for eval in session.evaluations]) / 10.0 if session.evaluations else 0.5
        elif "communication" in factor_lower:
            return np.mean([eval.communication_clarity for eval in session.evaluations]) / 10.0 if session.evaluations else 0.5
        elif "problem" in factor_lower or "analytical" in factor_lower:
            return np.mean([eval.problem_solving for eval in session.evaluations]) / 10.0 if session.evaluations else 0.5
        elif "leadership" in factor_lower:
            return 0.8 if session.resume_data.leadership_roles else 0.4
        elif "collaboration" in factor_lower or "team" in factor_lower:
            return np.mean([eval.communication_clarity for eval in session.evaluations]) / 10.0 if session.evaluations else 0.5
        else:
            return 0.5  # Default
    
    async def _generate_success_insights(self, session: InterviewSession, factor_scores: Dict[str, float]) -> List[str]:
        """Generate insights about success factors"""
        insights = []
        
        # Top factors
        if factor_scores:
            sorted_factors = sorted(factor_scores.items(), key=lambda x: x[1], reverse=True)
            top_factor, top_score = sorted_factors[0]
            if top_score >= 0.8:
                insights.append(f"Exceptional strength in {top_factor}")
            
            # Bottom factors
            bottom_factor, bottom_score = sorted_factors[-1]
            if bottom_score <= 0.4:
                insights.append(f"Development needed in {bottom_factor}")
        
        # Overall assessment
        avg_score = np.mean(list(factor_scores.values())) if factor_scores else 0.5
        if avg_score >= 0.7:
            insights.append("High potential for success in this role")
        elif avg_score <= 0.4:
            insights.append("Significant challenges for role success")
        
        return insights
    
    def _generate_success_recommendations(self, factor_scores: Dict[str, float]) -> List[str]:
        """Generate recommendations based on success factors"""
        recommendations = []
        
        for factor, score in factor_scores.items():
            if score < 0.5:
                if "technical" in factor.lower():
                    recommendations.append("Focus on technical skill development")
                elif "communication" in factor.lower():
                    recommendations.append("Improve communication and presentation skills")
                elif "leadership" in factor.lower():
                    recommendations.append("Seek leadership opportunities and training")
                elif "problem" in factor.lower():
                    recommendations.append("Practice structured problem-solving approaches")
        
        if not recommendations:
            recommendations.append("Continue building on current strengths")
        
        return recommendations[:3]

# Global prediction agent instance
prediction_agent = PredictionAgent()
