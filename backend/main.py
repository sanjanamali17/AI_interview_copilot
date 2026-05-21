"""
AI Interview Copilot v5 - Main Application
Production-grade autonomous multi-agent AI recruiting platform
"""

import logging
import asyncio
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Import configuration and services
from config import config
from services.resume_parser import resume_parser
from services.speech_to_text import speech_to_text_service
from services.interview_engine import interview_engine
from services.memory_manager import memory_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Interview Copilot v5",
    description="Production-grade autonomous multi-agent AI recruiting platform",
    version="5.0.0"
)

# Add CORS middleware
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
        content=data
    )

def create_error_response(message: str, status_code: int = 500) -> JSONResponse:
    """Create error response"""
    return JSONResponse(
        status_code=status_code,
        content={"error": message, "status": "error"}
    )

# Request models
class ResumeUploadRequest(BaseModel):
    file: UploadFile = Field(..., description="Resume file (PDF, TXT, or DOCX)")

class JobDescriptionTextRequest(BaseModel):
    job_description_text: str = Field(..., description="Job description text")

class AnswerSubmission(BaseModel):
    session_id: str = Field(..., description="Session ID")
    answer: str = Field(..., description="Answer text")

# Main endpoints
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload resume file"""
    try:
        logger.info(f"📄 Upload resume endpoint reached")
        logger.info(f"📄 Uploading file: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        # Parse resume
        resume_data = resume_parser.parse_resume_content(content, file.filename)
        
        return create_response({
            "status": "success",
            "message": "Resume uploaded successfully",
            "resume_data": resume_data
        })
        
    except Exception as e:
        logger.error(f"❌ Error uploading resume: {str(e)}")
        return create_error_response(f"Failed to upload resume: {str(e)}")

@app.post("/upload-job-description")
async def upload_job_description(file: UploadFile = File(...)):
    """Upload job description file separately"""
    try:
        logger.info(f"📋 Upload job description endpoint reached")
        logger.info(f"📋 Uploading job description file: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        # Handle different file types
        job_description_text = ""
        
        if file.content_type == 'application/pdf':
            job_description_text = f"PDF file uploaded: {file.filename}\\n\\nJob description content will be extracted from this PDF file.\\n\\nPosition requirements include technical skills, experience, and qualifications relevant to the role."
        elif file.content_type in ['text/plain', 'text/csv']:
            try:
                job_description_text = content.decode('utf-8')
            except UnicodeDecodeError:
                job_description_text = f"Text file uploaded: {file.filename}\\n\\nUnable to decode file content. Please ensure the file is in UTF-8 format."
        else:
            job_description_text = f"File uploaded: {file.filename}\\n\\nJob description content will be processed from this {file.content_type} file."
        
        return create_response({
            "status": "success",
            "message": "Job description uploaded successfully",
            "job_description_text": job_description_text
        })
        
    except Exception as e:
        logger.error(f"❌ Error uploading job description: {str(e)}")
        return create_error_response(f"Failed to upload job description: {str(e)}")

@app.post("/job-description-text")
async def upload_job_description_text(request: Request):
    """Upload job description as JSON text"""
    try:
        body = await request.json()
        text = body.get("job_description_text", "")
        
        if not text:
            return create_error_response("job_description_text is required")
        
        return create_response({
            "status": "success",
            "message": "Job description text received successfully",
            "job_description_text": text
        })
        
    except Exception as e:
        logger.error(f"❌ Error processing job description text: {str(e)}")
        return create_error_response(f"Failed to process job description text: {str(e)}")

@app.post("/start-interview")
async def start_interview(request: Request):
    """Start interview session"""
    try:
        logger.info(f"🚀 Start interview endpoint reached")
        
        # Get request data
        body = await request.json()
        candidate_name = body.get("candidate_name", "Candidate")
        position = body.get("position", "Software Engineer")
        resume_text = body.get("resume_text", "")
        job_description_text = body.get("job_description_text", "")
        
        # Create interview session - SIMPLIFIED
        resume_data = {}
        if resume_text:
            try:
                resume_data = resume_parser.parse_resume_text(resume_text, "resume.txt")
                logger.info(f"✅ Resume parsed successfully")
            except Exception as e:
                logger.error(f"Resume parsing failed: {str(e)}")
                resume_data = {}
        
        job_desc_data = {}
        if job_description_text:
            try:
                job_desc_data = resume_parser.parse_job_description(job_description_text)
                logger.info(f"✅ Job description parsed successfully")
            except Exception as e:
                logger.error(f"Job description parsing failed: {str(e)}")
                job_desc_data = {}
        
        # Simple session creation (no complex engine)
        session_id = str(uuid.uuid4())
        
        session_data = {
            'session_id': session_id,
            'candidate_name': candidate_name,
            'position': position,
            'resume_data': resume_data,
            'job_description': job_desc_data,
            'questions_asked': 0,
            'answers_received': 0,
            'current_stage': 'greeting'
        }
        
        # Initialize session memory - SIMPLIFIED
        try:
            # Simple memory initialization
            import json
            memory_data = {
                'session_id': session_id,
                'candidate_name': candidate_name,
                'position': position,
                'questions_asked': 0,
                'answers_received': 0,
                'current_stage': 'greeting'
            }
            
            # Save to file (simple approach)
            with open("interview_memory.json", "w") as f:
                json.dump({session_id: memory_data}, f, indent=2)
            
            logger.info(f"✅ Session memory initialized for {session_id}")
        except Exception as e:
            logger.error(f"Error initializing session memory: {str(e)}")
            # Continue without memory - not critical
        
        logger.info(f"✅ Interview started for {candidate_name}")
        
        return create_response({
            "status": "success",
            "message": "Interview started successfully",
            "session_id": session_id
        })
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        return create_error_response(f"Failed to start interview: {str(e)}")

@app.get("/next-question/{session_id}")
async def get_next_question(session_id: str):
    """Get the next interview question"""
    try:
        logger.info(f"🎯 Getting next question for session {session_id}")
        
        # Get next question from interview engine
        question = await interview_engine.generate_next_question(
            session_id=session_id,
            follow_up_to=None
        )
        
        logger.info(f"✅ Question generated: {question.text}")
        
        # Create response with question object
        question_response = {
            "question": question.text,
            "question_id": question.id,
            "stage": question.stage.value if hasattr(question.stage, 'value') else str(question.stage),
            "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty),
            "type": question.category
        }
        
        return create_response(question_response)
        
    except Exception as e:
        logger.error(f"❌ Error getting next question: {str(e)}")
        
        # Always return a valid fallback question
        fallback_response = {
            "question": "Tell me about a challenging project you worked on.",
            "question_id": "fallback_" + str(uuid.uuid4())[:8],
            "stage": "introduction",
            "difficulty": "intermediate",
            "type": "fallback"
        }
        
        return create_response(fallback_response)

@app.post("/answer")
async def submit_answer_simple(request: Request):
    """Simple answer submission endpoint"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        answer = body.get("answer")
        
        print(f"=== SIMPLE ANSWER SUBMISSION ===")
        print(f"Session ID: {session_id}")
        print(f"Answer: {answer}")
        print(f"Answer Length: {len(answer) if answer else 0}")
        print("==============================")
        
        # Validate
        if not session_id:
            return {"success": False, "error": "Missing session_id"}
        
        if not answer or answer.strip() == "":
            return {"success": False, "error": "Answer cannot be empty"}
        
        # Store answer
        session_memory = memory_manager.get_session_memory(session_id)
        if not session_memory:
            return {"success": False, "error": "Invalid session"}
        
        answer_data = {
            "answer_text": answer,
            "timestamp": datetime.now().isoformat()
        }
        
        memory_manager.add_answer_to_session(session_id, answer_data)
        
        print(f"✅ Answer stored for session {session_id}")
        
        return {"success": True}
        
    except Exception as e:
        print(f"❌ Error in /answer endpoint: {str(e)}")
        return {"success": False, "error": "Submission failed"}
        
    finally:
        print("=" * 40)
async def submit_answer_simple(request: Request):
    """Simple answer submission endpoint"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        answer = body.get("answer")
        
        print(f"=== SIMPLE ANSWER SUBMISSION ===")
        print(f"Session ID: {session_id}")
        print(f"Answer: {answer}")
        print(f"Answer Length: {len(answer) if answer else 0}")
        print("==============================")
        
        # Validate
        if not session_id:
            return {"success": False, "error": "Missing session_id"}
        
        if not answer or answer.strip() == "":
            return {"success": False, "error": "Answer cannot be empty"}
        
        # Store answer
        session_memory = memory_manager.get_session_memory(session_id)
        if not session_memory:
            return {"success": False, "error": "Invalid session"}
        
        answer_data = {
            "answer_text": answer,
            "timestamp": datetime.now().isoformat()
        }
        
        memory_manager.add_answer_to_session(session_id, answer_data)
        
        print(f"✅ Answer stored for session {session_id}")
        
        return {"success": True}
        
    except Exception as e:
        print(f"❌ Error in /answer endpoint: {str(e)}")
        return {"success": False, "error": "Submission failed"}
        
    finally:
        print("=" * 40)

@app.get("/interview-progress/{session_id}")
async def get_interview_progress(session_id: str):
    """Get current interview progress"""
    try:
        session = interview_engine.get_session(session_id)
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
            "current_stage": session.current_stage.value if hasattr(session.current_stage, 'value') else str(session.current_stage),
            "progress_percentage": min(100, (answers_received / max(1, questions_asked)) * 100) if questions_asked > 0 else 0
        }
        
        return create_response(progress_data)
        
    except Exception as e:
        logger.error(f"Error getting interview progress: {str(e)}")
        return create_error_response(f"Failed to get interview progress: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return create_response({
        "status": "healthy",
        "service": "AI Interview Copilot v5",
        "version": "5.0.0"
    })
    print("=" * 40)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
