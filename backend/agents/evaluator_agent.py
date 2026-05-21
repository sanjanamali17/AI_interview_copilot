"""
Evaluator Agent for AI Interview Copilot v5
Evaluates candidate responses, provides scoring and detailed feedback
"""

import logging
import numpy as np
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
from models.interview_models import (
    InterviewSession, Answer, EvaluationScore, Question,
    StressLevel, DifficultyLevel
)
from services.llm_service import llm_service
from services.memory_manager import memory_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EvaluatorAgent:
    """AI Evaluator Agent that evaluates candidate responses"""
    
    def __init__(self):
        """Initialize evaluator agent"""
        self.evaluation_criteria = self._load_evaluation_criteria()
        self.scoring_weights = self._load_scoring_weights()
        self.stress_indicators = self._load_stress_indicators()
    
    def _load_evaluation_criteria(self) -> Dict[str, Dict[str, Any]]:
        """Load evaluation criteria for different question types"""
        return {
            "technical": {
                "criteria": [
                    "technical_accuracy",
                    "depth_of_knowledge",
                    "problem_solving_approach",
                    "best_practices",
                    "code_quality"
                ],
                "weight_distribution": {
                    "technical_accuracy": 0.4,
                    "depth_of_knowledge": 0.3,
                    "problem_solving_approach": 0.2,
                    "best_practices": 0.1
                }
            },
            "behavioral": {
                "criteria": [
                    "communication_clarity",
                    "situational_awareness",
                    "emotional_intelligence",
                    "leadership_potential",
                    "team_collaboration"
                ],
                "weight_distribution": {
                    "communication_clarity": 0.3,
                    "situational_awareness": 0.25,
                    "emotional_intelligence": 0.2,
                    "leadership_potential": 0.15,
                    "team_collaboration": 0.1
                }
            },
            "system_design": {
                "criteria": [
                    "architectural_thinking",
                    "scalability_considerations",
                    "trade_off_analysis",
                    "technical_decision_making",
                    "practical_implementation"
                ],
                "weight_distribution": {
                    "architectural_thinking": 0.3,
                    "scalability_considerations": 0.25,
                    "trade_off_analysis": 0.2,
                    "technical_decision_making": 0.15,
                    "practical_implementation": 0.1
                }
            },
            "situational": {
                "criteria": [
                    "problem_analysis",
                    "decision_making",
                    "prioritization",
                    "stakeholder_management",
                    "risk_assessment"
                ],
                "weight_distribution": {
                    "problem_analysis": 0.3,
                    "decision_making": 0.25,
                    "prioritization": 0.2,
                    "stakeholder_management": 0.15,
                    "risk_assessment": 0.1
                }
            }
        }
    
    def _load_scoring_weights(self) -> Dict[str, float]:
        """Load scoring weights for overall evaluation"""
        return {
            "technical_accuracy": 0.35,
            "communication_clarity": 0.25,
            "problem_solving": 0.30,
            "confidence": 0.10
        }
    
    def _load_stress_indicators(self) -> Dict[str, List[str]]:
        """Load linguistic indicators of stress"""
        return {
            "hesitation": [
                "um", "uh", "like", "you know", "actually", "basically",
                "sort of", "kind of", "maybe", "perhaps", "I think"
            ],
            "uncertainty": [
                "not sure", "I don't know", "maybe", "perhaps", "probably",
                "I guess", "I'm not certain", "I'm not positive"
            ],
            "filler_words": [
                "um", "uh", "er", "ah", "like", "so", "well", "you know"
            ],
            "negativity": [
                "can't", "won't", "don't", "impossible", "difficult",
                "hard", "struggle", "problem", "issue"
            ]
        }
    
    async def evaluate_answer(
        self, 
        session: InterviewSession, 
        question: Question, 
        answer: Answer
    ) -> EvaluationScore:
        """
        Evaluate candidate's answer comprehensively
        
        Args:
            session: Interview session
            question: Question asked
            answer: Candidate's answer
            
        Returns:
            Detailed evaluation score
        """
        try:
            logger.info(f"Evaluating answer for question {question.id}")
            
            # Get evaluation criteria for question type
            criteria_config = self.evaluation_criteria.get(
                question.category, 
                self.evaluation_criteria["technical"]
            )
            
            # Perform detailed evaluation using LLM
            detailed_evaluation = await self._perform_detailed_evaluation(
                question, answer, criteria_config
            )
            
            # Calculate component scores
            component_scores = self._calculate_component_scores(
                detailed_evaluation, criteria_config
            )
            
            # Calculate stress level
            stress_level = self._assess_stress_level(answer.text)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(component_scores)
            
            # Generate feedback
            feedback = await self._generate_feedback(
                question, answer, component_scores, detailed_evaluation
            )
            
            # Create evaluation score
            evaluation = EvaluationScore(
                technical_accuracy=component_scores.get("technical_accuracy", 0.0),
                communication_clarity=component_scores.get("communication_clarity", 0.0),
                problem_solving=component_scores.get("problem_solving", 0.0),
                confidence=component_scores.get("confidence", 0.0),
                overall_score=overall_score,
                stress_level=stress_level,
                feedback=feedback
            )
            
            # Store evaluation in memory
            memory_manager.add_evaluation_to_memory(session.session_id, evaluation)
            
            logger.info(f"Evaluation completed: {overall_score}/10")
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating answer: {str(e)}")
            # Return default evaluation on error
            return EvaluationScore(
                technical_accuracy=5.0,
                communication_clarity=5.0,
                problem_solving=5.0,
                confidence=5.0,
                overall_score=5.0,
                stress_level=StressLevel.MODERATE,
                feedback="Evaluation could not be completed due to an error."
            )
    
    async def _perform_detailed_evaluation(
        self, 
        question: Question, 
        answer: Answer,
        criteria_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform detailed evaluation using LLM"""
        prompt = f"""
        Evaluate this interview answer comprehensively.
        
        Question: {question.text}
        Answer: {answer.text}
        Question Category: {question.category}
        Difficulty Level: {question.difficulty.value}
        Response Time: {answer.response_time_seconds} seconds
        
        Evaluation Criteria: {', '.join(criteria_config['criteria'])}
        
        For each criterion, provide:
        1. Score (0-10): How well the candidate performed
        2. Evidence: Specific examples from the answer
        3. Strengths: What they did well
        4. Improvements: What could be better
        
        Also assess:
        - Overall communication quality (0-10)
        - Technical accuracy (0-10)
        - Problem-solving approach (0-10)
        - Confidence level (0-10)
        - Relevance to question (0-10)
        
        Respond in JSON format with detailed scores and explanations.
        """
        
        system_prompt = "You are an expert technical interviewer providing detailed, fair evaluations."
        
        evaluation = await llm_service.generate_structured_response(prompt, temperature=0.3)
        
        return evaluation if isinstance(evaluation, dict) else {}
    
    def _calculate_component_scores(
        self, 
        detailed_evaluation: Dict[str, Any],
        criteria_config: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate component scores from detailed evaluation"""
        scores = {
            "technical_accuracy": 0.0,
            "communication_clarity": 0.0,
            "problem_solving": 0.0,
            "confidence": 0.0
        }
        
        # Extract scores from detailed evaluation
        if isinstance(detailed_evaluation, dict):
            scores["technical_accuracy"] = detailed_evaluation.get("technical_accuracy", 0.0)
            scores["communication_clarity"] = detailed_evaluation.get("overall_communication_quality", 0.0)
            scores["problem_solving"] = detailed_evaluation.get("problem_solving_approach", 0.0)
            scores["confidence"] = detailed_evaluation.get("confidence_level", 0.0)
        
        # Ensure scores are within bounds
        for key in scores:
            scores[key] = max(0.0, min(10.0, scores[key]))
        
        return scores
    
    def _assess_stress_level(self, answer_text: str) -> StressLevel:
        """Assess stress level from answer text"""
        text_lower = answer_text.lower()
        
        # Count stress indicators
        hesitation_count = sum(text_lower.count(word) for word in self.stress_indicators["hesitation"])
        uncertainty_count = sum(text_lower.count(phrase) for phrase in self.stress_indicators["uncertainty"])
        filler_count = sum(text_lower.count(word) for word in self.stress_indicators["filler_words"])
        negativity_count = sum(text_lower.count(word) for word in self.stress_indicators["negativity"])
        
        # Calculate stress score
        word_count = len(answer_text.split())
        if word_count == 0:
            return StressLevel.MODERATE
        
        stress_indicators_per_word = (hesitation_count + uncertainty_count + filler_count + negativity_count) / word_count
        
        # Determine stress level
        if stress_indicators_per_word > 0.15:
            return StressLevel.HIGH
        elif stress_indicators_per_word > 0.08:
            return StressLevel.MODERATE
        else:
            return StressLevel.LOW
    
    def _calculate_overall_score(self, component_scores: Dict[str, float]) -> float:
        """Calculate overall score from component scores"""
        overall = 0.0
        
        for component, score in component_scores.items():
            weight = self.scoring_weights.get(component, 0.25)
            overall += score * weight
        
        return round(overall, 2)
    
    async def _generate_feedback(
        self, 
        question: Question, 
        answer: Answer,
        component_scores: Dict[str, float],
        detailed_evaluation: Dict[str, Any]
    ) -> str:
        """Generate constructive feedback"""
        prompt = f"""
        Generate constructive feedback for this interview answer.
        
        Question: {question.text}
        Answer: {answer.text}
        
        Component Scores:
        - Technical Accuracy: {component_scores.get('technical_accuracy', 0)}/10
        - Communication Clarity: {component_scores.get('communication_clarity', 0)}/10
        - Problem Solving: {component_scores.get('problem_solving', 0)}/10
        - Confidence: {component_scores.get('confidence', 0)}/10
        
        Provide feedback that:
        1. Acknowledges what the candidate did well
        2. Identifies specific areas for improvement
        3. Gives actionable suggestions
        4. Is encouraging and professional
        5. Is concise (3-4 sentences)
        
        Generate only the feedback, no additional text.
        """
        
        system_prompt = "You are a constructive interviewer providing helpful feedback."
        
        return await llm_service.generate_response(prompt, system_prompt, temperature=0.6)
    
    async def evaluate_session_overall(self, session: InterviewSession) -> Dict[str, Any]:
        """
        Evaluate the entire interview session
        
        Args:
            session: Interview session
            
        Returns:
            Overall session evaluation
        """
        try:
            logger.info(f"Evaluating overall session {session.session_id}")
            
            if not session.evaluations:
                return {"error": "No evaluations available"}
            
            # Calculate average scores
            avg_scores = self._calculate_session_averages(session.evaluations)
            
            # Analyze performance trends
            performance_trends = self._analyze_performance_trends(session.evaluations)
            
            # Identify strengths and weaknesses
            strengths, weaknesses = self._identify_session_strengths_weaknesses(session.evaluations)
            
            # Assess consistency
            consistency_score = self._assess_consistency(session.evaluations)
            
            # Generate overall assessment
            overall_assessment = await self._generate_overall_assessment(
                session, avg_scores, performance_trends, strengths, weaknesses
            )
            
            # Calculate hiring recommendation score
            hiring_score = self._calculate_hiring_score(avg_scores, consistency_score, performance_trends)
            
            evaluation = {
                "session_id": session.session_id,
                "candidate_name": session.candidate_name,
                "position": session.position,
                "average_scores": avg_scores,
                "performance_trends": performance_trends,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "consistency_score": consistency_score,
                "overall_assessment": overall_assessment,
                "hiring_recommendation_score": hiring_score,
                "total_questions": len(session.questions_asked),
                "evaluation_count": len(session.evaluations),
                "interview_duration": round((datetime.now() - session.start_time).total_seconds() / 60, 1)
            }
            
            logger.info(f"Session evaluation completed for {session.session_id}")
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating session: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_session_averages(self, evaluations: List[EvaluationScore]) -> Dict[str, float]:
        """Calculate average scores across all evaluations"""
        if not evaluations:
            return {}
        
        averages = {
            "technical_accuracy": np.mean([eval.technical_accuracy for eval in evaluations]),
            "communication_clarity": np.mean([eval.communication_clarity for eval in evaluations]),
            "problem_solving": np.mean([eval.problem_solving for eval in evaluations]),
            "confidence": np.mean([eval.confidence for eval in evaluations]),
            "overall_score": np.mean([eval.overall_score for eval in evaluations])
        }
        
        # Round to 2 decimal places
        return {key: round(value, 2) for key, value in averages.items()}
    
    def _analyze_performance_trends(self, evaluations: List[EvaluationScore]) -> Dict[str, Any]:
        """Analyze performance trends throughout the interview"""
        if len(evaluations) < 3:
            return {"trend": "insufficient_data"}
        
        # Split evaluations into thirds
        third = len(evaluations) // 3
        early_scores = [eval.overall_score for eval in evaluations[:third]]
        middle_scores = [eval.overall_score for eval in evaluations[third:2*third]]
        late_scores = [eval.overall_score for eval in evaluations[2*third:]]
        
        early_avg = np.mean(early_scores) if early_scores else 0
        middle_avg = np.mean(middle_scores) if middle_scores else 0
        late_avg = np.mean(late_scores) if late_scores else 0
        
        # Determine trend
        if late_avg > early_avg + 1.0:
            trend = "improving"
        elif late_avg < early_avg - 1.0:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "early_average": round(early_avg, 2),
            "middle_average": round(middle_avg, 2),
            "late_average": round(late_avg, 2),
            "improvement_score": round(late_avg - early_avg, 2)
        }
    
    def _identify_session_strengths_weaknesses(self, evaluations: List[EvaluationScore]) -> Tuple[List[str], List[str]]:
        """Identify overall strengths and weaknesses"""
        if not evaluations:
            return [], []
        
        # Calculate averages for each dimension
        avg_technical = np.mean([eval.technical_accuracy for eval in evaluations])
        avg_communication = np.mean([eval.communication_clarity for eval in evaluations])
        avg_problem_solving = np.mean([eval.problem_solving for eval in evaluations])
        avg_confidence = np.mean([eval.confidence for eval in evaluations])
        
        dimensions = {
            "Technical Knowledge": avg_technical,
            "Communication": avg_communication,
            "Problem Solving": avg_problem_solving,
            "Confidence": avg_confidence
        }
        
        # Sort by score
        sorted_dims = sorted(dimensions.items(), key=lambda x: x[1], reverse=True)
        
        # Strengths (top 2 with score >= 7)
        strengths = [dim for dim, score in sorted_dims[:2] if score >= 7.0]
        
        # Weaknesses (bottom 2 with score <= 6)
        weaknesses = [dim for dim, score in sorted_dims[-2:] if score <= 6.0]
        
        return strengths, weaknesses
    
    def _assess_consistency(self, evaluations: List[EvaluationScore]) -> float:
        """Assess consistency of performance"""
        if len(evaluations) < 2:
            return 0.0
        
        scores = [eval.overall_score for eval in evaluations]
        standard_deviation = np.std(scores)
        
        # Lower standard deviation = higher consistency
        consistency_score = max(0.0, 10.0 - standard_deviation)
        
        return round(consistency_score, 2)
    
    async def _generate_overall_assessment(
        self,
        session: InterviewSession,
        avg_scores: Dict[str, float],
        performance_trends: Dict[str, Any],
        strengths: List[str],
        weaknesses: List[str]
    ) -> str:
        """Generate overall assessment summary"""
        prompt = f"""
        Generate an overall assessment summary for this interview candidate.
        
        Candidate: {session.candidate_name}
        Position: {session.position}
        
        Average Scores:
        - Technical: {avg_scores.get('technical_accuracy', 0)}/10
        - Communication: {avg_scores.get('communication_clarity', 0)}/10
        - Problem Solving: {avg_scores.get('problem_solving', 0)}/10
        - Confidence: {avg_scores.get('confidence', 0)}/10
        - Overall: {avg_scores.get('overall_score', 0)}/10
        
        Performance Trend: {performance_trends.get('trend', 'unknown')}
        Strengths: {', '.join(strengths) if strengths else 'None identified'}
        Weaknesses: {', '.join(weaknesses) if weaknesses else 'None identified'}
        
        Provide a concise, professional assessment (2-3 sentences) that summarizes:
        1. Overall performance level
        2. Key strengths
        3. Main areas for improvement
        4. Fit for the position
        
        Generate only the assessment, no additional text.
        """
        
        system_prompt = "You are an experienced hiring manager providing candidate assessments."
        
        return await llm_service.generate_response(prompt, system_prompt, temperature=0.5)
    
    def _calculate_hiring_score(
        self,
        avg_scores: Dict[str, float],
        consistency_score: float,
        performance_trends: Dict[str, Any]
    ) -> float:
        """Calculate overall hiring recommendation score"""
        # Base score from overall average
        base_score = avg_scores.get("overall_score", 0.0)
        
        # Adjust for consistency
        consistency_bonus = (consistency_score - 5.0) * 0.2  # Max +/- 1 point
        
        # Adjust for trend
        trend_bonus = 0.0
        if performance_trends.get("trend") == "improving":
            trend_bonus = 0.5
        elif performance_trends.get("trend") == "declining":
            trend_bonus = -0.5
        
        # Calculate final score
        hiring_score = base_score + consistency_bonus + trend_bonus
        
        return round(max(0.0, min(10.0, hiring_score)), 2)
    
    def get_evaluation_summary(self, session_id: str) -> Dict[str, Any]:
        """Get evaluation summary for a session"""
        try:
            session_data = memory_manager.memory_store.get(session_id)
            if not session_data:
                return {"error": "Session not found"}
            
            evaluations = session_data.get("evaluations", [])
            if not evaluations:
                return {"error": "No evaluations available"}
            
            # Calculate summary statistics
            summary = {
                "total_evaluations": len(evaluations),
                "average_scores": {
                    "technical_accuracy": np.mean([eval["technical_accuracy"] for eval in evaluations]),
                    "communication_clarity": np.mean([eval["communication_clarity"] for eval in evaluations]),
                    "problem_solving": np.mean([eval["problem_solving"] for eval in evaluations]),
                    "confidence": np.mean([eval["confidence"] for eval in evaluations]),
                    "overall_score": np.mean([eval["overall_score"] for eval in evaluations])
                },
                "stress_distribution": self._calculate_stress_distribution(evaluations),
                "score_distribution": self._calculate_score_distribution(evaluations),
                "improvement_areas": self._identify_improvement_areas(evaluations)
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting evaluation summary: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_stress_distribution(self, evaluations: List[Dict]) -> Dict[str, int]:
        """Calculate stress level distribution"""
        stress_counts = {"low": 0, "moderate": 0, "high": 0}
        
        for eval in evaluations:
            stress_level = eval.get("stress_level", "moderate")
            if stress_level in stress_counts:
                stress_counts[stress_level] += 1
        
        return stress_counts
    
    def _calculate_score_distribution(self, evaluations: List[Dict]) -> Dict[str, int]:
        """Calculate score distribution"""
        distribution = {
            "excellent (8-10)": 0,
            "good (6-8)": 0,
            "average (4-6)": 0,
            "poor (0-4)": 0
        }
        
        for eval in evaluations:
            score = eval.get("overall_score", 0)
            if score >= 8:
                distribution["excellent (8-10)"] += 1
            elif score >= 6:
                distribution["good (6-8)"] += 1
            elif score >= 4:
                distribution["average (4-6)"] += 1
            else:
                distribution["poor (0-4)"] += 1
        
        return distribution
    
    def _identify_improvement_areas(self, evaluations: List[Dict]) -> List[str]:
        """Identify areas needing improvement"""
        areas = []
        
        # Calculate averages for each dimension
        avg_technical = np.mean([eval["technical_accuracy"] for eval in evaluations])
        avg_communication = np.mean([eval["communication_clarity"] for eval in evaluations])
        avg_problem_solving = np.mean([eval["problem_solving"] for eval in evaluations])
        avg_confidence = np.mean([eval["confidence"] for eval in evaluations])
        
        if avg_technical < 6.0:
            areas.append("Technical Knowledge")
        if avg_communication < 6.0:
            areas.append("Communication Skills")
        if avg_problem_solving < 6.0:
            areas.append("Problem Solving")
        if avg_confidence < 6.0:
            areas.append("Confidence Level")
        
        return areas

# Global evaluator agent instance
evaluator_agent = EvaluatorAgent()
