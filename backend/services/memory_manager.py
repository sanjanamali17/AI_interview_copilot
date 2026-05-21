import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from models.interview_models import InterviewSession

# Global memory store for interview sessions
memory_store: Dict[str, Dict[str, Any]] = {}

def _load_memory_from_file() -> None:
    """Load memory from file"""
    global memory_store
    try:
        if os.path.exists("interview_memory.json"):
            with open("interview_memory.json", "r") as f:
                memory_store = json.load(f)
                print(f"✅ Loaded {len(memory_store)} sessions from memory")
    except Exception as e:
        print(f"⚠️ Error loading memory file: {e}")
        memory_store = {}

def _save_memory_to_file() -> None:
    """Save memory to file"""
    try:
        with open("interview_memory.json", "w") as f:
            json.dump(memory_store, f, indent=2)
        print(f"✅ Saved {len(memory_store)} sessions to memory file")
    except Exception as e:
        print(f"⚠️ Error saving memory file: {e}")

def initialize_session_memory(session: InterviewSession) -> None:
    """Initialize session memory with complete interview context"""
    try:
        # Store per session with ALL required data
        session_data = {
            "session_id": session.session_id,
            "candidate_name": session.candidate_name,
            "job_role": session.position,
            "resume_text": session.resume_text,
            "job_description": {
                "required_skills": session.job_description.required_skills,
                "technologies": session.job_description.technologies,
                "seniority_level": session.job_description.seniority_level
            },
            "previous_questions": [],
            "answers": [],
            "start_time": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        # Store in memory
        memory_store[session.session_id] = session_data
        
        # Save to persistent storage
        _save_memory_to_file()
        
        print(f"✅ Session memory initialized for {session.candidate_name}")
        print(f"📋 Job Role: {session.position}")
        print(f"📄 Resume Length: {len(session.resume_text)} chars")
        print(f"📋 JD Skills: {len(session.job_description.required_skills)} items")
        print(f"💾 Session ID: {session.session_id}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error initializing session memory: {str(e)}")
        raise

def get_session_memory(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session memory"""
    return memory_store.get(session_id)

def update_session_memory(session_id: str, updates: Dict[str, Any]) -> None:
    """Update session memory"""
    if session_id in memory_store:
        memory_store[session_id].update(updates)
        memory_store[session_id]["last_updated"] = datetime.now().isoformat()
        _save_memory_to_file()

def add_question_to_session(session_id: str, question: Dict[str, Any]) -> None:
    """Add question to session memory"""
    if session_id in memory_store:
        memory_store[session_id]["previous_questions"].append(question)
        memory_store[session_id]["last_updated"] = datetime.now().isoformat()
        _save_memory_to_file()

def add_answer_to_session(session_id: str, answer: Dict[str, Any]) -> None:
    """Add answer to session memory"""
    if session_id in memory_store:
        memory_store[session_id]["answers"].append(answer)
        memory_store[session_id]["last_updated"] = datetime.now().isoformat()
        _save_memory_to_file()

def clear_session_memory(session_id: str) -> None:
    """Clear memory for specific session"""
    try:
        if session_id in memory_store:
            del memory_store[session_id]
            _save_memory_to_file()
            print(f"✅ Cleared memory for session {session_id}")
    except Exception as e:
        print(f"❌ Error clearing session memory: {e}")

def get_all_sessions() -> Dict[str, Dict[str, Any]]:
    """Get all sessions"""
    return memory_store

# Initialize memory on module load
_load_memory_from_file()

# Create memory manager instance for backward compatibility
class MemoryManager:
    def __init__(self):
        pass
    
    def initialize_session_memory(self, session: InterviewSession) -> None:
        """Initialize session memory with complete interview context"""
        initialize_session_memory(session)
    
    def get_session_memory(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session memory"""
        return get_session_memory(session_id)
    
    def add_question_to_session(self, session_id: str, question: Dict[str, Any]) -> None:
        """Add question to session memory"""
        add_question_to_session(session_id, question)
    
    def add_answer_to_session(self, session_id: str, answer: Dict[str, Any]) -> None:
        """Add answer to session memory"""
        add_answer_to_session(session_id, answer)
    
    def save_memory(self) -> None:
        """Save memory to file"""
        _save_memory_to_file()

# Create global instance
memory_manager = MemoryManager()
