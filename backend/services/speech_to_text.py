"""
Speech-to-Text Service for AI Interview Copilot v5
Converts voice answers to text for analysis
"""

import logging
import speech_recognition as sr
from typing import Optional, Dict, Any
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SpeechToTextService:
    """Service for converting speech to text"""
    
    def __init__(self):
        """Initialize speech-to-text service"""
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Configure recognizer settings
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.energy_threshold = 300
        self.recognizer.pause_threshold = 0.8
        self.recognizer.operation_timeout = 30
        self.recognizer.phrase_threshold = 0.3
        
        # Calibrate microphone for ambient noise
        self._calibrate_microphone()
    
    def _calibrate_microphone(self):
        """Calibrate microphone for ambient noise"""
        try:
            with self.microphone as source:
                logger.info("Calibrating microphone for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                logger.info("Microphone calibration complete")
        except Exception as e:
            logger.warning(f"Microphone calibration failed: {str(e)}")
    
    async def transcribe_audio_file(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to audio file
            
        Returns:
            Dictionary with transcription results
        """
        try:
            logger.info(f"Transcribing audio file: {audio_file_path}")
            
            # Load audio file
            audio_file = Path(audio_file_path)
            if not audio_file.exists():
                raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
            with sr.AudioFile(str(audio_file)) as source:
                audio_data = self.recognizer.record(source)
            
            # Transcribe using Google Speech Recognition (free tier)
            text = await self._transcribe_with_google(audio_data)
            
            # Calculate transcription metrics
            metrics = self._calculate_transcription_metrics(text)
            
            result = {
                "text": text,
                "confidence": metrics.get("confidence", 0.0),
                "duration_seconds": metrics.get("duration", 0.0),
                "word_count": metrics.get("word_count", 0),
                "success": True,
                "error": None
            }
            
            logger.info(f"Transcription completed: {len(text)} characters")
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing audio file: {str(e)}")
            return {
                "text": "",
                "confidence": 0.0,
                "duration_seconds": 0.0,
                "word_count": 0,
                "success": False,
                "error": str(e)
            }
    
    async def transcribe_live_audio(self, timeout: int = 30) -> Dict[str, Any]:
        """
        Transcribe live audio from microphone
        
        Args:
            timeout: Maximum recording time in seconds
            
        Returns:
            Dictionary with transcription results
        """
        try:
            logger.info("Starting live audio transcription...")
            
            # Record audio from microphone
            with self.microphone as source:
                logger.info("Listening for speech...")
                audio_data = self.recognizer.listen(source, timeout=timeout)
            
            # Transcribe the recorded audio
            text = await self._transcribe_with_google(audio_data)
            
            # Calculate transcription metrics
            metrics = self._calculate_transcription_metrics(text)
            
            result = {
                "text": text,
                "confidence": metrics.get("confidence", 0.0),
                "duration_seconds": metrics.get("duration", 0.0),
                "word_count": metrics.get("word_count", 0),
                "success": True,
                "error": None
            }
            
            logger.info(f"Live transcription completed: {len(text)} characters")
            return result
            
        except sr.WaitTimeoutError:
            logger.warning("No speech detected within timeout period")
            return {
                "text": "",
                "confidence": 0.0,
                "duration_seconds": 0.0,
                "word_count": 0,
                "success": False,
                "error": "No speech detected"
            }
        except Exception as e:
            logger.error(f"Error in live transcription: {str(e)}")
            return {
                "text": "",
                "confidence": 0.0,
                "duration_seconds": 0.0,
                "word_count": 0,
                "success": False,
                "error": str(e)
            }
    
    async def _transcribe_with_google(self, audio_data) -> str:
        """
        Transcribe audio using Google Speech Recognition
        
        Args:
            audio_data: Audio data to transcribe
            
        Returns:
            Transcribed text
        """
        loop = asyncio.get_event_loop()
        
        def _recognize():
            try:
                # Try Google Speech Recognition first
                text = self.recognizer.recognize_google(
                    audio_data, 
                    language="en-US",
                    show_all=False
                )
                return text
                
            except sr.UnknownValueError:
                logger.warning("Google Speech Recognition could not understand audio")
                return ""
                
            except sr.RequestError as e:
                logger.warning(f"Google Speech Recognition error: {str(e)}")
                # Fallback to Sphinx (offline)
                try:
                    text = self.recognizer.recognize_sphinx(audio_data)
                    logger.info("Used Sphinx as fallback")
                    return text
                except:
                    logger.error("Both Google and Sphinx recognition failed")
                    return ""
        
        # Run recognition in thread pool to avoid blocking
        text = await loop.run_in_executor(self.executor, _recognize)
        return text
    
    def _calculate_transcription_metrics(self, text: str) -> Dict[str, Any]:
        """
        Calculate transcription metrics
        
        Args:
            text: Transcribed text
            
        Returns:
            Dictionary with metrics
        """
        if not text:
            return {
                "confidence": 0.0,
                "duration": 0.0,
                "word_count": 0,
                "speaking_rate": 0.0
            }
        
        words = text.split()
        word_count = len(words)
        
        # Estimate duration based on word count (average speaking rate: 150 words per minute)
        estimated_duration = (word_count / 150) * 60  # seconds
        
        # Calculate speaking rate (words per minute)
        speaking_rate = (word_count / estimated_duration) * 60 if estimated_duration > 0 else 0
        
        # Simple confidence estimation based on text characteristics
        confidence = self._estimate_confidence(text)
        
        return {
            "confidence": confidence,
            "duration": estimated_duration,
            "word_count": word_count,
            "speaking_rate": speaking_rate
        }
    
    def _estimate_confidence(self, text: str) -> float:
        """
        Estimate transcription confidence based on text characteristics
        
        Args:
            text: Transcribed text
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        if not text:
            return 0.0
        
        confidence = 0.5  # Base confidence
        
        # Boost confidence for longer text
        if len(text) > 50:
            confidence += 0.2
        
        # Boost confidence for complete sentences
        sentences = text.count('.') + text.count('!') + text.count('?')
        if sentences > 0:
            confidence += 0.1
        
        # Reduce confidence for repetitive filler words
        filler_words = ['um', 'uh', 'like', 'you know', 'actually', 'basically']
        filler_count = sum(text.lower().count(filler) for filler in filler_words)
        filler_ratio = filler_count / max(len(text.split()), 1)
        
        if filler_ratio > 0.2:
            confidence -= 0.2
        
        # Ensure confidence stays within bounds
        return max(0.0, min(1.0, confidence))
    
    async def start_listening_continuous(self, callback=None):
        """
        Start continuous listening for real-time transcription
        
        Args:
            callback: Function to call with transcription results
        """
        def _callback(recognizer, audio):
            try:
                text = recognizer.recognize_google(audio, language="en-US")
                if callback:
                    asyncio.create_task(callback(text))
            except sr.UnknownValueError:
                pass
            except sr.RequestError as e:
                logger.error(f"Continuous listening error: {str(e)}")
        
        try:
            logger.info("Starting continuous listening...")
            self.stop_listening = self.recognizer.listen_in_background(
                self.microphone, 
                _callback
            )
            logger.info("Continuous listening started")
        except Exception as e:
            logger.error(f"Failed to start continuous listening: {str(e)}")
            raise
    
    def stop_continuous_listening(self):
        """Stop continuous listening"""
        if hasattr(self, 'stop_listening'):
            self.stop_listening(wait_for_stop=False)
            logger.info("Continuous listening stopped")
    
    async def test_microphone(self) -> Dict[str, Any]:
        """
        Test microphone functionality
        
        Returns:
            Dictionary with test results
        """
        try:
            with self.microphone as source:
                logger.info("Testing microphone...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                audio_data = self.recognizer.listen(source, timeout=5)
                
                # Try to transcribe
                text = await self._transcribe_with_google(audio_data)
                
                return {
                    "microphone_working": True,
                    "test_transcription": text,
                    "audio_level": "Good" if len(text) > 0 else "No audio detected",
                    "success": True
                }
                
        except Exception as e:
            return {
                "microphone_working": False,
                "test_transcription": "",
                "audio_level": "Error",
                "error": str(e),
                "success": False
            }

# Global speech-to-text service instance
speech_to_text_service = SpeechToTextService()
