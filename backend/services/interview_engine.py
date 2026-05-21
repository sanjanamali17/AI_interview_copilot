"""
Professional Human Interviewer for AI Interview Copilot v5
Manages intelligent interview flow with contextual questions
"""

import logging
import uuid
import re
from typing import List, Dict, Optional, Any
from datetime import datetime
from models.interview_models import (
    InterviewSession, Question, Answer, DifficultyLevel, 
    InterviewStage, ResumeData, JobDescription, InterviewPlan
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InterviewEngine:
    """Professional Human Interviewer managing intelligent interview flow"""
    
    def __init__(self):
        """Initialize interview engine"""
        self.active_sessions: Dict[str, InterviewSession] = {}
    
    def create_interview_session(self, candidate_name: str, position: str, 
                                resume_data: ResumeData, job_description: JobDescription) -> InterviewSession:
        """Create new interview session"""
        session_id = str(uuid.uuid4())
        
        session = InterviewSession(
            session_id=session_id,
            candidate_name=candidate_name,
            position=position,
            resume_data=resume_data,
            job_description=job_description,
            current_stage=InterviewStage.INTRODUCTION,
            current_difficulty=DifficultyLevel.INTERMEDIATE,
            questions_asked=[],
            answers_received=[],
            start_time=datetime.now()
        )
        
        self.active_sessions[session_id] = session
        logger.info(f"Created interview session for {candidate_name}")
        return session
    
    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Get interview session by ID"""
        return self.active_sessions.get(session_id)
    
    async def generate_next_question(
        self, 
        session_id: str, 
        follow_up_to: Optional[str] = None
    ) -> Question:
        """
        Generate next question as a PROFESSIONAL HUMAN INTERVIEWER
        
        Args:
            session_id: Interview session ID
            follow_up_to: Optional previous question ID for follow-up
            
        Returns:
            Generated question with human-like intelligence
        """
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            
            # Get complete session context
            from services.memory_manager import get_session_memory
            session_memory = get_session_memory(session_id)
            
            if not session_memory:
                raise ValueError(f"Session memory not found for {session_id}")
            
            # Extract context
            candidate_name = session_memory.get("candidate_name", "Candidate")
            job_role = session_memory.get("job_role", "")
            resume_text = session_memory.get("resume_text", "")
            job_description = session_memory.get("job_description", {})
            previous_questions = session_memory.get("previous_questions", [])
            answers = session_memory.get("answers", [])
            
            print(f"=== PROFESSIONAL INTERVIEWER ANALYSIS ===")
            print(f"Candidate: {candidate_name}")
            print(f"Role: {job_role}")
            print(f"Resume Length: {len(resume_text)} chars")
            print(f"Questions Asked: {len(previous_questions)}")
            print(f"Answers Given: {len(answers)}")
            print("=" * 45)
            
            # INTELLIGENT QUESTION SELECTION
            question_count = len(previous_questions)
            
            if question_count == 0:
                # FIRST QUESTION (MANDATORY)
                question_text = f"Hi {candidate_name}, how is your day going?"
                stage = "greeting"
                category = "introduction"
                
            elif question_count == 1:
                # SECOND QUESTION (MANDATORY)
                question_text = f"Can you tell me about yourself and your background, {candidate_name}?"
                stage = "introduction"
                category = "background"
                
            elif question_count == 2:
                # RESUME-BASED QUESTION
                question_text = self._generate_resume_question(candidate_name, resume_text, job_role)
                stage = "resume_deep_dive"
                category = "resume_specific"
                
            else:
                # INTELLIGENT FOLLOW-UP OR NEW TOPIC
                last_answer = answers[-1] if answers else None
                question_text = self._generate_intelligent_followup(
                    candidate_name, resume_text, job_description, 
                    previous_questions, last_answer, question_count
                )
                stage = "follow_up"
                category = "contextual"
            
            # Create question object
            question = Question(
                id=f"q_{question_count + 1}",
                text=question_text,
                category=category,
                difficulty=DifficultyLevel.INTERMEDIATE,
                stage=InterviewStage.INTRODUCTION if question_count < 3 else InterviewStage.TECHNICAL
            )
            
            # Store question in session
            session.questions_asked.append(question)
            
            # Store in memory manager
            from services.memory_manager import add_question_to_session
            add_question_to_session(session_id, {
                "question_text": question_text,
                "question_type": stage,
                "timestamp": datetime.now().isoformat()
            })
            
            print(f"✅ Generated {stage} question for {candidate_name}")
            print(f"📝 Question: {question_text}")
            
            return question
            
        except Exception as e:
            print(f"❌ Error generating intelligent question: {str(e)}")
            # Fallback
            return Question(
                id="fallback",
                text=f"Hi {session.candidate_name}, could you tell me about your recent experience?",
                category="fallback",
                difficulty=DifficultyLevel.INTERMEDIATE,
                stage=InterviewStage.INTRODUCTION
            )
    
    def _generate_resume_question(self, candidate_name: str, resume_text: str, job_role: str) -> str:
        """Generate specific resume-based question"""
        # Look for projects
        project_pattern = r'project[s]?\s*(?:called|named)?\s*["\']?([^"\'\n]{5,50})["\']?'
        projects = re.findall(project_pattern, resume_text.lower())
        
        # Look for skills
        skills_pattern = r'(python|java|javascript|react|node\.js|machine learning|ml|ai|sql|aws|docker|kubernetes)'
        skills = re.findall(skills_pattern, resume_text.lower())
        
        # Look for experience
        exp_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
        experience = re.findall(exp_pattern, resume_text.lower())
        
        print(f"🔍 Resume Analysis:")
        print(f"   Projects found: {projects}")
        print(f"   Skills found: {skills}")
        print(f"   Experience: {experience} years")
        
        # Generate specific question
        if projects:
            project = projects[0].title()
            return f"I see you worked on a project called '{project}'. Can you explain the objective and your role in that project?"
        elif skills:
            skill = skills[0].title()
            return f"I notice you have experience with {skill}. Can you tell me about a challenging problem you solved using {skill}?"
        elif experience:
            years = experience[0]
            return f"With {years} years of experience, what would you say is your biggest professional achievement?"
        else:
            return f"Can you walk me through your most relevant experience for the {job_role} position?"
    
    def _generate_intelligent_followup(self, candidate_name: str, resume_text: str, 
                                    job_description: dict, previous_questions: list, 
                                    last_answer: dict, question_count: int) -> str:
        """Generate intelligent follow-up based on context"""
        
        # Analyze last answer for follow-up opportunities
        if last_answer:
            answer_text = last_answer.get("answer_text", "")
            print(f"🧠 Analyzing last answer: {answer_text[:100]}...")
            
            # Look for technical mentions for deep follow-up
            tech_followups = {
                "python": "Which Python libraries did you use and why did you choose them?",
                "machine learning": "What ML algorithms did you consider and why did you choose the final one?",
                "model": "How did you evaluate your model's performance and what metrics did you use?",
                "algorithm": "What was the time complexity of your algorithm and how did you optimize it?",
                "database": "How did you handle database performance and scalability?",
                "api": "How did you handle API authentication and security concerns?",
                "team": "What was your specific role in the team collaboration and how did you coordinate?",
                "project": "What was the biggest technical challenge you faced in this project?",
                "performance": "How did you measure and improve the performance of your solution?",
                "react": "How did you manage state and component lifecycle in your React application?",
                "aws": "Which AWS services did you use and how did you ensure cost optimization?",
                "docker": "How did you containerize your application and manage multi-environment deployments?"
            }
            
            for keyword, followup in tech_followups.items():
                if keyword.lower() in answer_text.lower():
                    return followup
        
        # If no good follow-up, move to new topic based on resume
        if question_count < 8:
            return self._generate_resume_question(candidate_name, resume_text, job_role)
        
        # Later stage behavioral questions
        if question_count < 10:
            return f"What motivates you to apply for this role, {candidate_name}?"
        elif question_count < 12:
            return "What would you say are your biggest strengths that make you a good fit for this position?"
        elif question_count < 14:
            return "Can you describe a situation where you had to learn a new technology quickly?"
        else:
            return f"Do you have any questions for me about the role or the company, {candidate_name}?"

# Create global instance
interview_engine = InterviewEngine()
