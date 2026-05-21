"""
HR Agent for AI Interview Copilot v5
Analyzes interview data and makes hiring recommendations
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from models.interview_models import (
    InterviewSession, HiringRecommendation, HiringPrediction
)
from services.llm_service import llm_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HRAgent:
    """AI HR Agent that makes hiring decisions"""
    
    def __init__(self):
        """Initialize HR agent"""
        self.hiring_criteria = self._load_hiring_criteria()
        self.decision_thresholds = {
            "hire": 8.0,
            "consider": 6.0,
            "reject": 4.0
        }
    
    def _load_hiring_criteria(self) -> Dict[str, float]:
        """Load hiring criteria weights"""
        return {
            "technical_skills": 0.35,
            "communication": 0.20,
            "problem_solving": 0.25,
            "cultural_fit": 0.10,
            "leadership": 0.10
        }
    
    async def analyze_candidate(self, session: InterviewSession) -> Dict[str, Any]:
        """Analyze candidate and make hiring recommendation"""
        try:
            logger.info(f"Analyzing candidate {session.candidate_name}")
            
            # Evaluate against job requirements
            job_fit_analysis = await self._evaluate_job_fit(session)
            
            # Assess team compatibility
            team_assessment = await self._assess_team_compatibility(session)
            
            # Calculate hiring score
            hiring_score = self._calculate_hiring_score(job_fit_analysis, team_assessment)
            
            # Make recommendation
            recommendation = self._make_recommendation(hiring_score)
            
            # Generate reasoning
            reasoning = await self._generate_reasoning(
                session, job_fit_analysis, team_assessment, hiring_score
            )
            
            analysis = {
                "candidate_name": session.candidate_name,
                "position": session.position,
                "hiring_score": hiring_score,
                "recommendation": recommendation,
                "job_fit_analysis": job_fit_analysis,
                "team_assessment": team_assessment,
                "reasoning": reasoning,
                "confidence_level": self._assess_confidence(hiring_score),
                "key_strengths": job_fit_analysis.get("strengths", []),
                "key_concerns": job_fit_analysis.get("concerns", [])
            }
            
            logger.info(f"HR analysis completed for {session.candidate_name}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error in HR analysis: {str(e)}")
            return {"error": str(e)}
    
    async def _evaluate_job_fit(self, session: InterviewSession) -> Dict[str, Any]:
        """Evaluate candidate's fit for the job"""
        prompt = f"""
        Evaluate job fit for this candidate.
        
        Position: {session.position}
        Required Skills: {', '.join(session.job_description.required_skills)}
        Candidate Skills: {', '.join(session.resume_data.skills)}
        Experience: {session.resume_data.total_experience_years} years
        
        Interview Performance:
        - Questions Asked: {len(session.questions_asked)}
        - Average Score: {sum(eval.overall_score for eval in session.evaluations)/len(session.evaluations) if session.evaluations else 0}/10
        
        Evaluate:
        1. Technical alignment (0-10)
        2. Experience match (0-10)
        3. Skill coverage (0-10)
        4. Growth potential (0-10)
        5. Overall job fit (0-10)
        
        List strengths and concerns.
        Respond in JSON format.
        """
        
        return await llm_service.generate_structured_response(prompt, temperature=0.3)
    
    async def _assess_team_compatibility(self, session: InterviewSession) -> Dict[str, Any]:
        """Assess team compatibility"""
        prompt = f"""
        Assess team compatibility based on interview performance.
        
        Position: {session.position}
        Experience Level: {session.resume_data.experience_level}
        Leadership Experience: {'Yes' if session.resume_data.leadership_roles else 'No'}
        
        Communication Score: {sum(eval.communication_clarity for eval in session.evaluations)/len(session.evaluations) if session.evaluations else 0}/10
        Problem Solving Score: {sum(eval.problem_solving for eval in session.evaluations)/len(session.evaluations) if session.evaluations else 0}/10
        
        Assess:
        1. Collaboration potential (0-10)
        2. Communication style (0-10)
        3. Adaptability (0-10)
        4. Leadership qualities (0-10)
        5. Team compatibility (0-10)
        
        Respond in JSON format.
        """
        
        return await llm_service.generate_structured_response(prompt, temperature=0.3)
    
    def _calculate_hiring_score(self, job_fit: Dict[str, Any], team_assess: Dict[str, Any]) -> float:
        """Calculate overall hiring score"""
        job_score = job_fit.get("overall_job_fit", 0) * 0.6
        team_score = team_assess.get("team_compatibility", 0) * 0.4
        return round(job_score + team_score, 2)
    
    def _make_recommendation(self, hiring_score: float) -> HiringRecommendation:
        """Make hiring recommendation based on score"""
        if hiring_score >= self.decision_thresholds["hire"]:
            return HiringRecommendation.HIRE
        elif hiring_score >= self.decision_thresholds["consider"]:
            return HiringRecommendation.CONSIDER
        else:
            return HiringRecommendation.REJECT
    
    def _assess_confidence(self, hiring_score: float) -> str:
        """Assess confidence level in recommendation"""
        if hiring_score >= 9.0 or hiring_score <= 3.0:
            return "High"
        elif hiring_score >= 7.0 or hiring_score <= 5.0:
            return "Medium"
        else:
            return "Low"
    
    async def _generate_reasoning(
        self, session: InterviewSession, job_fit: Dict, team_assess: Dict, hiring_score: float
    ) -> str:
        """Generate reasoning for hiring decision"""
        prompt = f"""
        Generate reasoning for hiring decision.
        
        Candidate: {session.candidate_name}
        Position: {session.position}
        Hiring Score: {hiring_score}/10
        Job Fit: {job_fit.get('overall_job_fit', 0)}/10
        Team Compatibility: {team_assess.get('team_compatibility', 0)}/10
        
        Strengths: {', '.join(job_fit.get('strengths', []))}
        Concerns: {', '.join(job_fit.get('concerns', []))}
        
        Provide concise reasoning (2-3 sentences).
        """
        
        return await llm_service.generate_response(prompt, temperature=0.4)
    
    async def generate_final_report(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate comprehensive final report"""
        analysis = await self.analyze_candidate(session)
        
        report = {
            "candidate_name": session.candidate_name,
            "position": session.position,
            "interview_date": session.start_time.strftime("%Y-%m-%d"),
            "interview_duration": f"{len(session.questions_asked)} questions",
            "overall_score": analysis["hiring_score"],
            "recommendation": analysis["recommendation"],
            "reasoning": analysis["reasoning"],
            "strengths": analysis["key_strengths"],
            "concerns": analysis["key_concerns"],
            "confidence_level": analysis["confidence_level"],
            "next_steps": self._get_next_steps(analysis["recommendation"])
        }
        
        return report
    
    def _get_next_steps(self, recommendation: HiringRecommendation) -> str:
        """Get next steps based on recommendation"""
        steps = {
            HiringRecommendation.HIRE: "Proceed with offer preparation and reference checks",
            HiringRecommendation.CONSIDER: "Schedule follow-up interview with team lead",
            HiringRecommendation.REJECT: "Send polite rejection letter and close position"
        }
        return steps.get(recommendation, "Review with hiring team")

# Global HR agent instance
hr_agent = HRAgent()
