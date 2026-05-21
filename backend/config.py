"""
Configuration settings for AI Interview Copilot v5
"""

import os
from typing import Optional

# Configure logging
import logging
logger = logging.getLogger(__name__)

class Config:
    """Application configuration class"""
    
    # Groq API Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # FastAPI Configuration
    APP_TITLE: str = "AI Interview Copilot v5"
    APP_VERSION: str = "5.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".txt"}
    
    # Interview Configuration
    MAX_QUESTIONS_PER_INTERVIEW: int = 15
    DEFAULT_DIFFICULTY: str = "intermediate"
    SCORING_RANGES: dict = {
        "technical": (0, 10),
        "communication": (0, 10),
        "problem_solving": (0, 10),
        "confidence": (0, 10)
    }
    
    # Stress Detection Thresholds
    STRESS_THRESHOLDS: dict = {
        "low": 0.3,
        "moderate": 0.6,
        "high": 1.0
    }
    
    # Hiring Probability Thresholds
    HIRE_THRESHOLD: float = 0.7
    CONSIDER_THRESHOLD: float = 0.4
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate required configuration"""
        if not cls.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY environment variable is not set. LLM features will not work.")
            return False
        return True

# Global configuration instance
config = Config()
