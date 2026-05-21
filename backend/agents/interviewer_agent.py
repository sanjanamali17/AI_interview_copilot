"""
Interviewer Agent for AI Interview Copilot v5
Conducts interviews, asks questions, adapts difficulty, maintains flow
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from models.interview_models import (
    InterviewSession, Question, Answer, DifficultyLevel,
    InterviewStage, ResumeData, JobDescription
)
from services.llm_service import llm_service
from services.interview_engine import interview_engine
from services.memory_manager import memory_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InterviewerAgent:
    """AI Interviewer Agent that conducts the interview"""
    
    def __init__(self):
        """Initialize interviewer agent"""
        self.conversation_context = {}
        self.question_strategies = self._load_question_strategies()
        self.adaptation_thresholds = {
            "increase_difficulty": 8.0,
            "decrease_difficulty": 4.0,
            "follow_up_trigger": 6.0
        }
    
    def _load_question_strategies(self) -> Dict[str, Dict[str, Any]]:
        """Load question strategies for different scenarios"""
        return {
            "resume_deep_dive": {
                "focus": ["experience", "achievements", "projects", "skills"],
                "question_types": ["behavioral", "situational", "technical"],
                "difficulty_progression": "gradual"
            },
            "technical_assessment": {
                "focus": ["problem_solving", "technical_knowledge", "best_practices"],
                "question_types": ["technical", "system_design", "coding"],
                "difficulty_progression": "adaptive"
            },
            "behavioral_assessment": {
                "focus": ["teamwork", "leadership", "communication", "conflict_resolution"],
                "question_types": ["behavioral", "situational"],
                "difficulty_progression": "steady"
            },
            "system_design": {
                "focus": ["architecture", "scalability", "trade-offs", "design_patterns"],
                "question_types": ["system_design", "architectural"],
                "difficulty_progression": "progressive"
            }
        }
    
    async def start_interview(
        self, 
        session: InterviewSession
    ) -> Dict[str, Any]:
        """
        Start the interview with opening remarks and first question
        
        Args:
            session: Interview session
            
        Returns:
            Interview start response with welcome message and first question
        """
        try:
            logger.info(f"Starting interview for session {session.session_id}")
            
            # Generate welcome message
            welcome_message = await self._generate_welcome_message(session)
            
            # Generate first question
            first_question = await interview_engine.generate_next_question(session.session_id)
            
            # Store in memory
            memory_manager.add_question_to_memory(session.session_id, first_question)
            
            # Initialize conversation context
            self.conversation_context[session.session_id] = {
                "stage": session.current_stage,
                "difficulty": session.current_difficulty,
                "question_count": 1,
                "follow_up_count": 0,
                "last_question_time": datetime.now(),
                "candidate_engagement": "initial"
            }
            
            response = {
                "welcome_message": welcome_message,
                "first_question": first_question.text,
                "question_id": first_question.id,
                "stage": session.current_stage.value,
                "difficulty": session.current_difficulty.value,
                "estimated_duration": 45,  # minutes
                "interview_plan": await self._generate_interview_overview(session)
            }
            
            logger.info(f"Interview started for session {session.session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Error starting interview: {str(e)}")
            raise
    
    async def ask_next_question(
        self, 
        session_id: str,
        previous_answer: Optional[Answer] = None,
        force_follow_up: bool = False
    ) -> Dict[str, Any]:
        """
        Ask the next question in the interview
        
        Args:
            session_id: Interview session ID
            previous_answer: Previous answer for context
            force_follow_up: Force a follow-up question
            
        Returns:
            Next question response
        """
        try:
            session = interview_engine.get_session(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            
            logger.info(f"🎯 Found session {session_id} for candidate {session.candidate_name}")
            logger.info(f"📊 Current stage: {session.current_stage.value}, difficulty: {session.current_difficulty.value}")
            
            # Update conversation context
            self._update_conversation_context(session_id, previous_answer)
            
            # Determine if follow-up is needed
            should_follow_up = await self._should_ask_follow_up(
                session, previous_answer, force_follow_up
            )
            
            logger.info(f"🔄 Should ask follow-up: {should_follow_up}")
            
            if should_follow_up and previous_answer:
                # Generate follow-up question
                follow_up_question = await interview_engine.generate_next_question(
                    session_id, previous_answer.question_id
                )
                question = follow_up_question
                
                # Update follow-up count
                if session_id in self.conversation_context:
                    self.conversation_context[session_id]["follow_up_count"] += 1
                
            else:
                # Generate regular next question
                question = await interview_engine.generate_next_question(session_id)
                
                # Check if we should advance to next stage
                if await self._should_advance_stage(session):
                    new_stage = await interview_engine.advance_stage(session_id)
                    session.current_stage = new_stage
                    
                    # Generate stage-appropriate question
                    question = await interview_engine.generate_next_question(session_id)
            
            logger.info(f"❓ Generated question: {question.text}")
            
            # Store question in memory
            memory_manager.add_question_to_memory(session_id, question)
            
            # Update question count
            if session_id in self.conversation_context:
                self.conversation_context[session_id]["question_count"] += 1
                self.conversation_context[session_id]["last_question_time"] = datetime.now()
            
            response = {
                "question": question.text,
                "question_id": question.id,
                "stage": session.current_stage.value,
                "difficulty": session.current_difficulty.value,
                "is_follow_up": question.follow_up_to is not None,
                "question_number": self.conversation_context[session_id]["question_count"],
                "estimated_remaining_questions": max(0, 15 - self.conversation_context[session_id]["question_count"]),
                "context": question.context
            }
            
            logger.info(f"✅ Asked question {response['question_number']} for session {session_id}")
            logger.info(f"📤 Response: {response}")
            return response
            
        except Exception as e:
            logger.error(f"Error asking next question: {str(e)}")
            raise
    
    async def process_answer(
        self, 
        session_id: str, 
        answer: Answer
    ) -> Dict[str, Any]:
        """
        Process candidate's answer and update interview state
        
        Args:
            session_id: Interview session ID
            answer: Candidate's answer
            
        Returns:
            Processing response with next steps
        """
        try:
            session = interview_engine.get_session(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            
            # Store answer in memory
            memory_manager.add_answer_to_memory(session_id, answer)
            
            # Analyze answer quality
            answer_analysis = await self._analyze_answer_quality(session, answer)
            
            # Update conversation context
            if session_id in self.conversation_context:
                self.conversation_context[session_id]["candidate_engagement"] = answer_analysis["engagement_level"]
            
            # Determine if difficulty adaptation is needed
            if answer_analysis["overall_score"] > 0:
                await interview_engine.adapt_difficulty(session_id, answer_analysis["overall_score"])
            
            # Check for interview completion
            should_end = await self._should_end_interview(session)
            
            response = {
                "answer_received": True,
                "answer_analysis": answer_analysis,
                "next_action": "continue" if not should_end else "end_interview",
                "current_stage": session.current_stage.value,
                "current_difficulty": session.current_difficulty.value,
                "questions_remaining": max(0, 15 - len(session.questions_asked))
            }
            
            logger.info(f"Processed answer for session {session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Error processing answer: {str(e)}")
            raise
    
    async def _generate_welcome_message(self, session: InterviewSession) -> str:
        """Generate personalized welcome message"""
        prompt = f"""
        Generate a warm, professional welcome message for a job interview.
        
        Candidate: {session.candidate_name}
        Position: {session.position}
        Experience Level: {session.resume_data.experience_level}
        
        The message should:
        1. Welcome the candidate warmly
        2. Briefly introduce the interview format
        3. Mention the position they're applying for
        4. Set a comfortable tone
        5. Be concise (2-3 sentences)
        
        Generate only the welcome message, no additional text.
        """
        
        system_prompt = "You are a friendly, professional interviewer. Make candidates feel comfortable."
        
        return await llm_service.generate_response(prompt, system_prompt, temperature=0.7)
    
    async def _generate_interview_overview(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate interview structure overview"""
        return {
            "stages": [
                "Introduction & Resume Review",
                "Technical Assessment",
                "System Design",
                "Behavioral Questions",
                "Candidate Questions",
                "Closing"
            ],
            "estimated_duration": "45-60 minutes",
            "focus_areas": session.resume_data.skills[:5],
            "question_types": ["Technical", "Behavioral", "Situational", "System Design"]
        }
    
    async def _should_ask_follow_up(
        self, 
        session: InterviewSession, 
        answer: Optional[Answer],
        force_follow_up: bool
    ) -> bool:
        """Determine if a follow-up question should be asked"""
        if force_follow_up:
            return True
        
        if not answer:
            return False
        
        # Check follow-up count limit
        context = self.conversation_context.get(session.session_id, {})
        if context.get("follow_up_count", 0) >= 2:  # Max 2 follow-ups per topic
            return False
        
        # Analyze answer for follow-up triggers
        answer_text = answer.text.lower()
        
        # Triggers for follow-up
        follow_up_triggers = [
            len(answer_text.split()) < 20,  # Too short
            "for example" in answer_text or "such as" in answer_text,  # Mentions examples
            "depends on" in answer_text,  # Conditional answer
            answer_text.count("?") > 0,  # Asks questions back
            answer.confidence < 6.0 if hasattr(answer, 'confidence') else False  # Low confidence
        ]
        
        return any(follow_up_triggers)
    
    async def _should_advance_stage(self, session: InterviewSession) -> bool:
        """Determine if interview should advance to next stage"""
        questions_in_stage = sum(1 for q in session.questions_asked if q.stage == session.current_stage)
        
        # Stage-specific question limits
        stage_limits = {
            InterviewStage.INTRODUCTION: 1,
            InterviewStage.RESUME_DEEP_DIVE: 2,
            InterviewStage.TECHNICAL_QUESTIONS: 4,
            InterviewStage.SYSTEM_DESIGN: 2,
            InterviewStage.SITUATIONAL_PROBLEMS: 2,
            InterviewStage.BEHAVIORAL_QUESTIONS: 2,
            InterviewStage.CANDIDATE_QUESTIONS: 1,
            InterviewStage.CLOSING: 1
        }
        
        limit = stage_limits.get(session.current_stage, 3)
        return questions_in_stage >= limit
    
    async def _analyze_answer_quality(self, session: InterviewSession, answer: Answer) -> Dict[str, Any]:
        """Analyze the quality of candidate's answer"""
        try:
            # Get the question for context
            question = None
            for q in session.questions_asked:
                if q.id == answer.question_id:
                    question = q
                    break
            
            if not question:
                return {"overall_score": 0.0, "engagement_level": "unknown"}
            
            # Use LLM to analyze answer
            prompt = f"""
            Analyze the quality of this interview answer.
            
            Question: {question.text}
            Answer: {answer.text}
            Question Category: {question.category}
            Difficulty Level: {question.difficulty.value}
            
            Evaluate on:
            1. Relevance (0-10): How well does it answer the question?
            2. Depth (0-10): How detailed and comprehensive is the answer?
            3. Clarity (0-10): How clear and articulate is the response?
            4. Confidence (0-10): How confident does the candidate sound?
            5. Technical Accuracy (0-10): How technically accurate is the answer?
            
            Also assess:
            - Engagement level: "high", "medium", or "low"
            - Should we ask a follow-up: "yes" or "no"
            - Key strengths in the answer
            - Areas for improvement
            
            Respond in JSON format.
            """
            
            analysis = await llm_service.generate_structured_response(prompt)
            
            if isinstance(analysis, dict):
                # Calculate overall score
                scores = [analysis.get("relevance", 0), analysis.get("depth", 0), 
                         analysis.get("clarity", 0), analysis.get("confidence", 0), 
                         analysis.get("technical_accuracy", 0)]
                overall_score = sum(scores) / len(scores) if scores else 0
                
                return {
                    "overall_score": round(overall_score, 1),
                    "relevance": analysis.get("relevance", 0),
                    "depth": analysis.get("depth", 0),
                    "clarity": analysis.get("clarity", 0),
                    "confidence": analysis.get("confidence", 0),
                    "technical_accuracy": analysis.get("technical_accuracy", 0),
                    "engagement_level": analysis.get("engagement_level", "medium"),
                    "should_follow_up": analysis.get("should_follow_up", "no") == "yes",
                    "strengths": analysis.get("key_strengths", []),
                    "improvements": analysis.get("areas_for_improvement", [])
                }
            else:
                return {"overall_score": 5.0, "engagement_level": "medium"}
                
        except Exception as e:
            logger.warning(f"Error analyzing answer quality: {str(e)}")
            return {"overall_score": 5.0, "engagement_level": "medium"}
    
    def _update_conversation_context(self, session_id: str, answer: Optional[Answer]):
        """Update conversation context with new information"""
        if session_id not in self.conversation_context:
            return
        
        context = self.conversation_context[session_id]
        
        if answer:
            # Update engagement based on answer length and response time
            word_count = len(answer.text.split())
            response_time = answer.response_time_seconds
            
            if word_count > 50 and response_time < 60:
                context["candidate_engagement"] = "high"
            elif word_count > 20:
                context["candidate_engagement"] = "medium"
            else:
                context["candidate_engagement"] = "low"
    
    async def _should_end_interview(self, session: InterviewSession) -> bool:
        """Determine if interview should end"""
        # Check if we've asked enough questions
        total_questions = len(session.questions_asked)
        
        if total_questions >= 15:  # Max questions
            return True
        
        # Check if we've covered all stages
        stages_covered = set(q.stage for q in session.questions_asked)
        all_stages = set(InterviewStage)
        
        if len(stages_covered) >= len(all_stages) - 1:  # All except maybe closing
            return True
        
        # Check time limit (45 minutes)
        if session.start_time:
            elapsed = (datetime.now() - session.start_time).total_seconds() / 60
            if elapsed >= 45:
                return True
        
        return False
    
    async def handle_interview_closure(self, session_id: str) -> Dict[str, Any]:
        """
        Handle interview closure with final remarks
        
        Args:
            session_id: Interview session ID
            
        Returns:
            Closure response
        """
        try:
            session = interview_engine.get_session(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            
            # Generate closing remarks
            closing_message = await self._generate_closing_remarks(session)
            
            # End the session
            interview_engine.end_session(session_id)
            
            # Save memory
            memory_manager.save_memory()
            
            response = {
                "closing_message": closing_message,
                "interview_ended": True,
                "total_questions": len(session.questions_asked),
                "total_duration_minutes": round((datetime.now() - session.start_time).total_seconds() / 60, 1),
                "next_steps": "You will receive a detailed evaluation report shortly.",
                "thank_you_message": "Thank you for your time and interest in this position."
            }
            
            logger.info(f"Interview closed for session {session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Error handling interview closure: {str(e)}")
            raise
    
    async def _generate_closing_remarks(self, session: InterviewSession) -> str:
        """Generate professional closing remarks"""
        prompt = f"""
        Generate professional closing remarks for a job interview.
        
        Candidate: {session.candidate_name}
        Position: {session.position}
        Interview Duration: {len(session.questions_asked)} questions
        
        The closing remarks should:
        1. Thank the candidate for their time
        2. Mention the next steps in the process
        3. Be professional and encouraging
        4. Be concise (2-3 sentences)
        
        Generate only the closing remarks, no additional text.
        """
        
        system_prompt = "You are a professional interviewer closing an interview."
        
        return await llm_service.generate_response(prompt, system_prompt, temperature=0.6)
    
    def get_interview_status(self, session_id: str) -> Dict[str, Any]:
        """Get current interview status"""
        try:
            session = interview_engine.get_session(session_id)
            if not session:
                return {"error": "Session not found"}
            
            context = self.conversation_context.get(session_id, {})
            
            status = {
                "session_id": session_id,
                "candidate_name": session.candidate_name,
                "position": session.position,
                "current_stage": session.current_stage.value,
                "current_difficulty": session.current_difficulty.value,
                "questions_asked": len(session.questions_asked),
                "answers_received": len(session.answers_received),
                "is_active": session.is_active,
                "start_time": session.start_time.isoformat(),
                "candidate_engagement": context.get("candidate_engagement", "unknown"),
                "follow_up_count": context.get("follow_up_count", 0),
                "estimated_progress": round((len(session.questions_asked) / 15) * 100, 1)
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting interview status: {str(e)}")
            return {"error": str(e)}

# Global interviewer agent instance
interviewer_agent = InterviewerAgent()
