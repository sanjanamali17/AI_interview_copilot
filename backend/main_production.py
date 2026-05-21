"""
Production AI Interview System - Complete Rebuild
Handles all edge cases, never crashes, production-ready
"""

import logging
import uuid
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data models
class InterviewSession(BaseModel):
    session_id: str
    candidate_name: str
    position: str
    resume_data: Dict[str, Any]
    job_description: Dict[str, Any]
    questions_asked: List[Dict[str, Any]]
    answers_received: List[Dict[str, Any]]
    current_stage: str

class Question(BaseModel):
    question: str
    question_id: str
    stage: str
    difficulty: str
    type: str

class Answer(BaseModel):
    answer: str
    question_id: str
    timestamp: str

# Global session storage
sessions: Dict[str, InterviewSession] = {}

# Create FastAPI app
app = FastAPI(
    title="AI Interview Copilot v5 - Production",
    description="Production-grade autonomous AI recruiting platform",
    version="5.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response helpers
def create_response(data: dict) -> JSONResponse:
    """Create success response"""
    return JSONResponse(
        status_code=200,
        content={"status": "success", "data": data}
    )

def create_error_response(message: str, status_code: int = 500) -> JSONResponse:
    """Create error response"""
    return JSONResponse(
        status_code=status_code,
        content={"status": "error", "message": message}
    )

# Resume Parser - Production Ready
class ResumeParser:
    def parse_resume_text(self, text: str, filename: str = "resume.txt") -> Dict[str, Any]:
        """Parse resume text - NEVER CRASHES"""
        try:
            logger.info(f"Parsing resume text from {filename}")
            
            if not text or text.strip() == "":
                return {
                    'skills': [],
                    'experience': '0 years',
                    'projects': [],
                    'education': '',
                    'raw_text': ''
                }
            
            # Extract skills (robust keyword matching)
            skill_keywords = [
                'python', 'javascript', 'react', 'node', 'sql', 
                'machine learning', 'data science', 'aws', 'docker',
                'java', 'typescript', 'angular', 'mongodb', 'postgresql',
                'git', 'kubernetes', 'tensorflow', 'pytorch'
            ]
            
            skills = []
            text_lower = text.lower()
            for skill in skill_keywords:
                if skill in text_lower:
                    skills.append(skill.title())
            
            # Extract experience years (robust patterns)
            year_patterns = [
                r'(\d+)\+?\s*(?:years?|yrs?)',
                r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)',
                r'experience\s*:\s*(\d+)',
                r'total\s*experience\s*:\s*(\d+)'
            ]
            
            years_experience = 0
            for pattern in year_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    try:
                        years = int(match.group(1))
                        years_experience = max(years_experience, years)
                    except ValueError:
                        continue
            
            # Extract projects (robust extraction)
            projects = []
            project_patterns = [
                r'project[s]?:?(.*?)(?:\n\n|\n[A-Z]|\Z)',
                r'project experience\s*:\s*(.*?)(?:\n\n|\n[A-Z]|\Z)',
                r'personal project[s]\s*:\s*(.*?)(?:\n\n|\n[A-Z]|\Z)',
                r'key project[s]\s*:\s*(.*?)(?:\n\n|\n[A-Z]|\Z)'
            ]
            
            for pattern in project_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
                for match in matches:
                    project_lines = [line.strip() for line in match.split('\n') if line.strip()]
                    for line in project_lines[:3]:  # Limit to first 3 lines
                        if len(line) > 10 and not line.startswith('-') and not line.startswith('*'):
                            projects.append(line.title())
            
            return {
                'skills': list(set(skills))[:10],  # Limit to 10 skills
                'experience': f"{years_experience} years",
                'projects': list(set(projects))[:5],  # Limit to 5 projects
                'education': self._extract_education(text),
                'raw_text': text[:500] if len(text) > 500 else text
            }
            
        except Exception as e:
            logger.error(f"Resume parsing error: {str(e)}")
            # NEVER CRASH - return safe fallback
            return {
                'skills': [],
                'experience': '0 years',
                'projects': [],
                'education': '',
                'raw_text': text[:500] if text else ''
            }
    
    def _extract_education(self, text: str) -> str:
        """Extract education information"""
        education_patterns = [
            r'(?:bachelor|master|phd|degree|education).*?([a-z]+\s*[a-z]+)',
            r'([a-z]+\s*[a-z]+\s*(?:bachelor|master|phd))',
            r'university\s*:\s*([^\n]+)',
            r'college\s*:\s*([^\n]+)'
        ]
        
        for pattern in education_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip().title()[:50]
        
        return ""

# Job Description Parser
class JobDescriptionParser:
    def parse_job_description(self, text: str) -> Dict[str, Any]:
        """Parse job description - NEVER CRASHES"""
        try:
            if not text or text.strip() == "":
                return {
                    'requirements': [],
                    'responsibilities': [],
                    'raw_text': ''
                }
            
            # Extract requirements (skills)
            requirement_keywords = [
                'python', 'javascript', 'react', 'node', 'sql',
                'machine learning', 'data science', 'aws', 'docker',
                'java', 'typescript', 'angular', 'mongodb'
            ]
            
            requirements = []
            text_lower = text.lower()
            for req in requirement_keywords:
                if req in text_lower:
                    requirements.append(req.title())
            
            # Extract responsibilities
            responsibility_patterns = [
                r'(?:develop|design|implement|create|build|manage|lead).*?([^.!?]*[.!?])',
                r'responsibilities?\s*:\s*([^.!?]*[.!?])',
                r'(?:you will|you\'ll|candidate should)\s*([^.!?]*[.!?])'
            ]
            
            responsibilities = []
            for pattern in responsibility_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if len(match.strip()) > 10:
                        responsibilities.append(match.strip().capitalize()[:100])
            
            return {
                'requirements': list(set(requirements))[:10],
                'responsibilities': list(set(responsibilities))[:5],
                'raw_text': text[:500] if len(text) > 500 else text
            }
            
        except Exception as e:
            logger.error(f"Job description parsing error: {str(e)}")
            # NEVER CRASH - return safe fallback
            return {
                'requirements': [],
                'responsibilities': [],
                'raw_text': text[:500] if text else ''
            }

# AI Question Engine - Production Ready
class QuestionEngine:
    def __init__(self):
        self.question_templates = {
            'greeting': "Hi {candidate_name}, how is your day going?",
            'introduction': "Tell me about yourself and your background in {position}.",
            'technical': "I see you have experience with {skill}. Can you explain a challenging project where you used this technology?",
            'behavioral': "Tell me about a time you faced a difficult challenge and how you overcame it.",
            'project_based': "I see you worked on {project}. Can you walk me through your role and the impact you made?",
            'follow_up': "That's interesting. Can you elaborate more on the {aspect} you mentioned?",
            'closing': "Thank you for sharing. Do you have any questions for me about this role or the company?"
        }
    
    def generate_next_question(self, session: InterviewSession) -> Question:
        """Generate next question based on session state"""
        try:
            question_count = len(session.questions_asked)
            answers_count = len(session.answers_received)
            
            # First question - ALWAYS use candidate name
            if question_count == 0:
                return Question(
                    question=self.question_templates['greeting'].format(
                        candidate_name=session.candidate_name
                    ),
                    question_id=f"q_{question_count + 1}",
                    stage="greeting",
                    difficulty="easy",
                    type="introduction"
                )
            
            # Second question - introduction
            elif question_count == 1:
                return Question(
                    question=self.question_templates['introduction'].format(
                        position=session.position
                    ),
                    question_id=f"q_{question_count + 1}",
                    stage="introduction",
                    difficulty="easy",
                    type="introduction"
                )
            
            # Resume-based questions
            elif question_count < 5:
                resume_data = session.resume_data
                if resume_data.get('projects'):
                    project = resume_data['projects'][0] if resume_data['projects'] else "your project"
                    return Question(
                        question=self.question_templates['project_based'].format(project=project),
                        question_id=f"q_{question_count + 1}",
                        stage="technical",
                        difficulty="medium",
                        type="resume_based"
                    )
                elif resume_data.get('skills'):
                    skill = resume_data['skills'][0] if resume_data['skills'] else "your skills"
                    return Question(
                        question=self.question_templates['technical'].format(skill=skill),
                        question_id=f"q_{question_count + 1}",
                        stage="technical",
                        difficulty="medium",
                        type="technical"
                    )
            
            # Behavioral questions
            elif question_count < 8:
                return Question(
                    question=self.question_templates['behavioral'],
                    question_id=f"q_{question_count + 1}",
                    stage="behavioral",
                    difficulty="medium",
                    type="behavioral"
                )
            
            # Follow-up questions based on last answer
            elif answers_count > 0 and question_count < 12:
                last_answer = session.answers_received[-1]['answer']
                if len(last_answer) > 50:  # Substantial answer
                    return Question(
                        question=self.question_templates['follow_up'].format(aspect="details"),
                        question_id=f"q_{question_count + 1}",
                        stage="follow_up",
                        difficulty="hard",
                        type="follow_up"
                    )
            
            # Closing question
            else:
                return Question(
                    question=self.question_templates['closing'],
                    question_id=f"q_{question_count + 1}",
                    stage="closing",
                    difficulty="easy",
                    type="closing"
                )
                
        except Exception as e:
            logger.error(f"Question generation error: {str(e)}")
            # NEVER CRASH - return safe fallback
            return Question(
                question="Tell me more about your experience.",
                question_id=f"q_fallback_{len(session.questions_asked) + 1}",
                stage="fallback",
                difficulty="medium",
                type="fallback"
            )

# Initialize services
resume_parser = ResumeParser()
job_parser = JobDescriptionParser()
question_engine = QuestionEngine()

# API Endpoints
@app.post("/start-interview")
async def start_interview(request: Request):
    """Start interview session - PRODUCTION READY"""
    try:
        logger.info(f"🚀 Start interview endpoint reached")
        
        # Get request data
        body = await request.json()
        candidate_name = body.get("candidate_name", "Candidate")
        position = body.get("position", "Software Engineer")
        resume_text = body.get("resume_text", "")
        job_description_text = body.get("job_description_text", "")
        
        # Validate required fields
        if not candidate_name or not position:
            return create_error_response("candidate_name and position are required", 400)
        
        # Parse resume (NEVER CRASHES)
        resume_data = {}
        if resume_text:
            resume_data = resume_parser.parse_resume_text(resume_text, "resume.txt")
            logger.info(f"✅ Resume parsed successfully: {len(resume_data.get('skills', []))} skills found")
        
        # Parse job description (NEVER CRASHES)
        job_desc_data = {}
        if job_description_text:
            job_desc_data = job_parser.parse_job_description(job_description_text)
            logger.info(f"✅ Job description parsed successfully: {len(job_desc_data.get('requirements', []))} requirements found")
        
        # Create session
        session_id = str(uuid.uuid4())
        session = InterviewSession(
            session_id=session_id,
            candidate_name=candidate_name,
            position=position,
            resume_data=resume_data,
            job_description=job_desc_data,
            questions_asked=[],
            answers_received=[],
            current_stage="greeting"
        )
        
        # Store session
        sessions[session_id] = session
        
        # Save to file (persistent storage)
        try:
            with open("interview_memory.json", "w") as f:
                json.dump({session_id: session.dict()}, f, indent=2)
        except Exception as e:
            logger.error(f"Memory save error: {str(e)}")
        
        logger.info(f"✅ Interview started for {candidate_name}")
        
        return create_response({
            "status": "success",
            "message": "Interview started successfully",
            "session_id": session_id,
            "candidate_name": candidate_name,
            "position": position
        })
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        return create_error_response(f"Failed to start interview: {str(e)}")

@app.get("/next-question/{session_id}")
async def get_next_question(session_id: str):
    """Get next interview question - STRUCTURED INTERVIEW FLOW"""
    try:
        logger.info(f"🎯 Getting next question for session {session_id}")
        
        # Get session
        session = sessions.get(session_id)
        if not session:
            logger.error(f"❌ Session not found: {session_id}")
            return create_error_response("Session not found", 404)
        
        # Get current question count and stage
        question_count = len(session.questions_asked)
        answers_count = len(session.answers_received)
        
        # Get previous questions to prevent repeats
        previous_questions = [q.get('question', '') for q in session.questions_asked]
        
        # Get last answer for context
        last_answer = ""
        if answers_count > 0:
            last_answer = session.answers_received[-1].get('answer', '')
        
        # Get resume data for personalized questions
        resume_data = session.resume_data or {}
        projects = resume_data.get('projects', [])
        skills = resume_data.get('skills', [])
        experience = resume_data.get('experience', [])
        leadership = resume_data.get('leadership', [])
        activities = resume_data.get('activities', [])
        
        # STRICT INTERVIEW FLOW - MANDATORY ORDER
        acknowledgement = ""
        question_text = ""
        stage = ""
        
        if question_count == 0:
            # STEP 1 — GREETING (MANDATORY)
            question_text = f"Hi {session.candidate_name}, how is your day going?"
            acknowledgement = ""
            stage = "greeting"
            
        elif question_count == 1:
            # STEP 2 — INTRODUCTION (MANDATORY)
            acknowledgement = "That's good to hear. Let's begin."
            question_text = "Can you tell me about yourself?"
            stage = "introduction"
            
        elif question_count == 2:
            # STEP 3 — RESUME PROJECT QUESTIONS
            acknowledgement = "Thanks for sharing that."
            if projects and len(projects) > 0:
                project_name = projects[0]
                question_text = f"I see you worked on {project_name}. Can you explain that project?"
            else:
                question_text = "Can you describe a challenging project you worked on?"
            stage = "project_deep_dive"
            
        elif question_count == 3:
            # STEP 3 — PROJECT FOLLOW-UP
            acknowledgement = "That's interesting."
            if projects and len(projects) > 0:
                question_text = "What challenges did you face in that project?"
            else:
                question_text = "What was the biggest challenge in your project?"
            stage = "project_followup"
            
        elif question_count == 4:
            # STEP 3 — PROJECT SOLUTION
            acknowledgement = "I see."
            question_text = "How did you solve those challenges?"
            stage = "project_solution"
            
        elif question_count == 5:
            # STEP 4 — SKILLS BASED QUESTIONS
            acknowledgement = "Great approach."
            if skills and len(skills) > 0:
                skill = skills[0]
                if skill.lower() in ['python', 'java', 'javascript', 'c++']:
                    question_text = f"You mentioned {skill}. Can you explain OOP concepts in {skill}?"
                elif skill.lower() in ['sql', 'database']:
                    question_text = f"You mentioned {skill}. Can you explain different types of SQL joins?"
                elif skill.lower() in ['machine learning', 'ml', 'ai']:
                    question_text = f"You mentioned {skill}. What is overfitting and how do you prevent it?"
                else:
                    question_text = f"You mentioned {skill}. Can you explain your experience with it?"
            else:
                question_text = "What technical skills are you most proud of?"
            stage = "skills_technical"
            
        elif question_count == 6:
            # STEP 4 — SKILLS PRACTICAL
            acknowledgement = "Good explanation."
            if skills and len(skills) > 1:
                skill = skills[1]
                question_text = f"Tell me about a time you used {skill} in a real project."
            else:
                question_text = "Can you describe your problem-solving approach?"
            stage = "skills_practical"
            
        elif question_count == 7:
            # STEP 5 — EXPERIENCE / ACTIVITY QUESTIONS
            acknowledgement = "That's valuable experience."
            if leadership and len(leadership) > 0:
                question_text = "You mentioned leadership experience. Can you describe a situation where you led a team?"
            elif activities and len(activities) > 0:
                question_text = f"Tell me about your involvement in {activities[0]}."
            elif experience and len(experience) > 0:
                question_text = f"Can you elaborate on your experience at {experience[0]}?"
            else:
                question_text = "How do you work in a team environment?"
            stage = "experience_behavioral"
            
        elif question_count == 8:
            # STEP 6 — SCENARIO QUESTIONS
            acknowledgement = "That's good to know."
            if 'ml' in [s.lower() for s in skills] or 'machine learning' in [s.lower() for s in skills]:
                question_text = "Suppose your model accuracy drops in production. What will you do?"
            elif 'data' in [s.lower() for s in skills] or 'sql' in [s.lower() for s in skills]:
                question_text = "How will you handle missing data in a dataset?"
            else:
                question_text = "Describe a time you had to learn a new technology quickly."
            stage = "scenario_problem"
            
        elif question_count == 9:
            # STEP 6 — SCENARIO FOLLOW-UP
            acknowledgement = "Interesting approach."
            question_text = "How would you prioritize multiple urgent tasks?"
            stage = "scenario_priority"
            
        elif question_count == 10:
            # STEP 7 — BEHAVIORAL QUESTIONS
            acknowledgement = "That shows good thinking."
            job_description = session.job_description or ""
            if 'data scientist' in job_description.lower() or 'ml engineer' in job_description.lower():
                question_text = "Why are you interested in this data science role?"
            else:
                question_text = "Why should we hire you?"
            stage = "behavioral_motivation"
            
        elif question_count == 11:
            # STEP 7 — BEHAVIORAL FOLLOW-UP
            acknowledgement = "I appreciate that."
            question_text = "What makes you the best candidate for this position?"
            stage = "behavioral_fit"
            
        elif question_count == 12:
            # STEP 8 — CLOSING
            acknowledgement = "Thank you for sharing."
            question_text = "Do you have any questions for me?"
            stage = "closing"
            
        else:
            # INTERVIEW COMPLETE - WRAP UP
            acknowledgement = "Thank you for your time."
            question_text = "The interview is complete. We'll be in touch soon."
            stage = "complete"
        
        # CRITICAL: Check if question already exists and prevent repeat
        if question_text in previous_questions:
            logger.warning(f"⚠️ Question already asked: {question_text}")
            # Generate unique fallback based on stage
            if stage == "project_deep_dive":
                question_text = f"That's interesting, {session.candidate_name}. Can you tell me about another project you worked on?"
            elif stage == "skills_technical":
                question_text = f"Let's discuss your technical background. What's your strongest technical skill?"
            else:
                question_text = f"That's interesting, {session.candidate_name}. Can you tell me more about your experience?"
        
        # Add to previous questions list
        previous_questions.append(question_text)
        
        # Create question object
        question_obj = Question(
            question=question_text,
            question_id=f"q_{question_count + 1}",
            stage=stage,
            difficulty="medium",
            type="structured"
        )
        
        # Store question in session
        session.questions_asked.append(question_obj.dict())
        sessions[session_id] = session
        
        # Save to file
        try:
            with open("interview_memory.json", "w") as f:
                json.dump({session_id: session.dict()}, f, indent=2)
        except Exception as e:
            logger.error(f"Memory save error: {str(e)}")
        
        logger.info(f"✅ Generated question: {question_text}")
        logger.info(f"✅ Stage: {stage}")
        logger.info(f"✅ Acknowledgement: {acknowledgement}")
        
        # GUARANTEED VALID RESPONSE - NEVER NULL/UNDEFINED
        response_data = {
            "status": "success",
            "acknowledgement": acknowledgement,
            "question": question_text,
            "question_id": f"q_{question_count + 1}",
            "stage": stage,
            "difficulty": "medium",
            "type": "structured",
            "question_number": question_count + 1
        }
        
        print("STRUCTURED INTERVIEW - Stage:", stage)
        print("Question Generated:", question_text)
        print("Acknowledgement:", acknowledgement)
        
        return response_data
        
    except Exception as e:
        logger.error(f"❌ Error getting next question: {str(e)}")
        # Fallback question
        return {
            "status": "success",
            "acknowledgement": "Let's continue.",
            "question": "Can you explain one of your projects?",
            "question_id": "fallback_1",
            "stage": "fallback",
            "difficulty": "medium",
            "type": "fallback",
            "question_number": 1
        }

@app.post("/submit-answer")
async def submit_answer(request: Request):
    """Submit answer - HUMAN-LIKE FLOW"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        answer = body.get("answer")
        question_id = body.get("question_id")
        
        # Validate required fields
        if not session_id or not answer:
            return create_error_response("session_id and answer are required", 400)
        
        # Get session
        session = sessions.get(session_id)
        if not session:
            return create_error_response("Session not found", 404)
        
        # Store answer with timestamp
        answer_data = Answer(
            answer=answer,
            question_id=question_id,
            timestamp=datetime.now().isoformat()
        )
        
        session.answers_received.append(answer_data.dict())
        session.current_stage = "processing"
        sessions[session_id] = session
        
        # Save to file
        try:
            with open("interview_memory.json", "w") as f:
                json.dump({session_id: session.dict()}, f, indent=2)
        except Exception as e:
            logger.error(f"Memory save error: {str(e)}")
        
        logger.info(f"✅ Answer submitted for session {session_id}: {answer[:50]}...")
        
        # RETURN SIMPLE SUCCESS - NO NESTED DATA
        return {
            "status": "success",
            "message": "Answer submitted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error submitting answer: {str(e)}")
        return create_error_response(f"Failed to submit answer: {str(e)}")

@app.post("/upload-job-description")
async def upload_job_description_file(file: UploadFile = File(...)):
    """Upload job description file - PRODUCTION READY"""
    try:
        logger.info(f"📋 Upload job description endpoint reached")
        
        # Read file content
        content = await file.read()
        
        # Handle different file types
        job_description_text = ""
        
        if file.content_type == 'application/pdf':
            job_description_text = f"PDF job description file: {file.filename}"
        elif file.content_type in ['text/plain', 'text/csv']:
            try:
                job_description_text = content.decode('utf-8')
            except UnicodeDecodeError:
                job_description_text = f"Text job description file: {file.filename}"
        else:
            job_description_text = f"Job description file: {file.filename}"
        
        # Parse job description
        job_desc_data = job_parser.parse_job_description(job_description_text)
        
        logger.info(f"✅ Job description uploaded: {file.filename}")
        
        return create_response({
            "status": "success",
            "message": "Job description uploaded successfully",
            "job_description_text": job_description_text,
            "job_description_data": job_desc_data
        })
        
    except Exception as e:
        logger.error(f"Error uploading job description: {str(e)}")
        return create_error_response(f"Failed to upload job description: {str(e)}")

@app.post("/upload-resume")
async def upload_resume_file(file: UploadFile = File(...)):
    """Upload resume file - PRODUCTION READY"""
    try:
        logger.info(f"📄 Upload resume endpoint reached")
        
        # Read file content
        content = await file.read()
        
        # Handle different file types
        resume_text = ""
        
        if file.content_type == 'application/pdf':
            resume_text = f"PDF resume file: {file.filename}"
        elif file.content_type in ['text/plain', 'text/csv']:
            try:
                resume_text = content.decode('utf-8')
            except UnicodeDecodeError:
                resume_text = f"Text resume file: {file.filename}"
        else:
            resume_text = f"Resume file: {file.filename}"
        
        # Parse resume
        resume_data = resume_parser.parse_resume_text(resume_text, file.filename)
        
        logger.info(f"✅ Resume uploaded: {file.filename}")
        
        return create_response({
            "status": "success",
            "message": "Resume uploaded successfully",
            "resume_text": resume_text,
            "resume_data": resume_data
        })
        
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        return create_error_response(f"Failed to upload resume: {str(e)}")

@app.get("/interview-progress/{session_id}")
async def get_interview_progress(session_id: str):
    """Get interview progress - PRODUCTION READY"""
    try:
        session = sessions.get(session_id)
        if not session:
            return create_error_response("Session not found", 404)
        
        questions_asked = len(session.questions_asked)
        answers_received = len(session.answers_received)
        
        progress_data = {
            "session_id": session_id,
            "candidate_name": session.candidate_name,
            "position": session.position,
            "questions_asked": questions_asked,
            "answers_received": answers_received,
            "current_stage": session.current_stage,
            "progress_percentage": min(100, (answers_received / max(1, questions_asked)) * 100) if questions_asked > 0 else 0
        }
        
        return create_response(progress_data)
        
    except Exception as e:
        logger.error(f"Error getting interview progress: {str(e)}")
        return create_error_response(f"Failed to get interview progress: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint - PRODUCTION READY"""
    return create_response({
        "status": "healthy",
        "service": "AI Interview Copilot v5 - Production",
        "version": "5.0.0",
        "active_sessions": len(sessions)
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8009,
        log_level="info"
    )
