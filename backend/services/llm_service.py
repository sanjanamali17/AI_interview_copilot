"""
LLM Service for Groq API integration
Handles all AI model interactions for AI Interview Copilot v5
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from groq import Groq
from config import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Groq LLM API"""
    
    def __init__(self):
        """Initialize LLM service with Groq client"""
        # Don't validate API key during import to allow testing
        if not config.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not configured. LLM service will not be functional until key is provided.")
            self.client = None
        else:
            self.client = Groq(api_key=config.GROQ_API_KEY)
            logger.info("🚀 GROQ API client initialized successfully")
        
        self.model = config.GROQ_MODEL
        
    async def test_connection(self) -> bool:
        """Test connection to Groq API"""
        if not self.client:
            logger.error("❌ GROQ client not initialized")
            return False
            
        try:
            logger.info("🔍 Testing GROQ API connection...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Say 'Connection test successful'"}],
                max_tokens=10
            )
            result = response.choices[0].message.content
            logger.info(f"✅ GROQ connection successful: {result}")
            return True
        except Exception as e:
            logger.error(f"❌ GROQ connection failed: {str(e)}")
            return False
        
    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        max_retries: int = 3
    ) -> str:
        """
        Generate response from Groq LLM with retry logic and timeout handling
        
        Args:
            prompt: User prompt
            system_prompt: System context prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            max_retries: Maximum number of retry attempts
            
        Returns:
            Generated text response
        """
        if not self.client:
            raise ValueError("GROQ_API_KEY not configured. Please set the environment variable to use LLM services.")
        
        messages = []
        
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        logger.info(f"Generating response with model: {self.model}")
        
        # Retry logic with exponential backoff
        for attempt in range(max_retries):
            try:
                logger.info(f"🔄 LLM attempt {attempt + 1}/{max_retries}")
                
                # Use asyncio.wait_for for timeout handling
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.client.chat.completions.create,
                        model=self.model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens
                    ),
                    timeout=10.0  # 10 second timeout
                )
                
                generated_text = response.choices[0].message.content
                logger.info(f"✅ Generated response of length: {len(generated_text)} (attempt {attempt + 1})")
                
                return generated_text.strip()
                
            except asyncio.TimeoutError:
                logger.error(f"⏰ LLM timeout on attempt {attempt + 1}/{max_retries}")
                if attempt == max_retries - 1:
                    logger.error("❌ All retry attempts failed due to timeout")
                    raise Exception("LLM service timeout: Model provider unreachable after multiple attempts")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                
            except Exception as e:
                logger.error(f"❌ LLM connection error on attempt {attempt + 1}/{max_retries}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error("❌ All retry attempts failed")
                    raise Exception(f"LLM service unavailable: {str(e)}")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    async def generate_structured_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        schema: Optional[Dict] = None,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Generate structured JSON response from Groq LLM with retry logic
        
        Args:
            prompt: User prompt
            system_prompt: System context prompt
            schema: Expected JSON schema
            max_retries: Maximum number of retry attempts
            
        Returns:
            Structured response as dictionary
        """
        try:
            # Add schema instruction to prompt if provided
            if schema:
                schema_instruction = f"\n\nPlease respond in valid JSON format with this schema: {json.dumps(schema, indent=2)}"
                prompt += schema_instruction
            
            response_text = await self.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,  # Lower temperature for structured responses
                max_tokens=1500,
                max_retries=max_retries
            )
            
            # Try to parse as JSON
            try:
                # Extract JSON from response if it contains markdown code blocks
                if "```json" in response_text:
                    start = response_text.find("```json") + 7
                    end = response_text.find("```", start)
                    json_text = response_text[start:end].strip()
                elif "```" in response_text:
                    start = response_text.find("```") + 3
                    end = response_text.find("```", start)
                    json_text = response_text[start:end].strip()
                else:
                    json_text = response_text.strip()
                
                parsed_response = json.loads(json_text)
                logger.info(f"✅ Successfully parsed structured response")
                return parsed_response
                
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ Failed to parse JSON response: {e}")
                logger.warning(f"Response text: {response_text}")
                
                # Return raw text as fallback with error info
                return {
                    "raw_response": response_text,
                    "error": "Failed to parse JSON",
                    "status": "parsing_failed"
                }
                
        except Exception as e:
            logger.error(f"❌ Error generating structured response: {str(e)}")
            
            # Return error response instead of raising exception
            return {
                "error": f"LLM service unavailable: {str(e)}",
                "status": "service_unavailable",
                "raw_response": ""
            }
    
    async def analyze_text_sentiment(
        self, 
        text: str
    ) -> Dict[str, float]:
        """
        Analyze sentiment and confidence from text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment scores
        """
        prompt = f"""
        Analyze the following text for confidence level and stress indicators.
        Consider factors like:
        - Hesitation patterns (um, uh, like, you know)
        - Uncertain language (maybe, perhaps, I think)
        - Answer length and detail
        - Technical accuracy
        
        Text to analyze:
        "{text}"
        
        Provide scores from 0.0 to 1.0:
        - confidence: How confident the speaker sounds
        - stress: How stressed the speaker appears
        - clarity: How clear and articulate the response is
        
        Respond in JSON format.
        """
        
        return await self.generate_structured_response(prompt)
    
    async def detect_knowledge_gaps(
        self, 
        resume_claims: List[str], 
        interview_answers: List[str]
    ) -> Dict[str, Any]:
        """
        Detect potential knowledge gaps between resume claims and interview performance
        
        Args:
            resume_claims: Skills and experience claimed on resume
            interview_answers: Answers given during interview
            
        Returns:
            Analysis of potential knowledge gaps
        """
        prompt = f"""
        Analyze potential knowledge gaps between resume claims and interview performance.
        
        Resume Claims:
        {chr(10).join(f"- {claim}" for claim in resume_claims)}
        
        Interview Answers:
        {chr(10).join(f"- {answer}" for answer in interview_answers)}
        
        Identify:
        1. Claims that lack supporting evidence in answers
        2. Areas where answers seem superficial or generic
        3. Technical topics where depth is missing
        4. Overall consistency assessment
        
        Respond in JSON format with:
        - potential_gaps: list of identified gaps
        - consistency_score: 0.0 to 1.0
        - recommendations: list of suggestions
        """
        
        return await self.generate_structured_response(prompt)
    
    async def generate_follow_up_question(
        self, 
        original_question: str, 
        candidate_answer: str, 
        difficulty: str
    ) -> str:
        """
        Generate intelligent follow-up question based on candidate's answer
        
        Args:
            original_question: The question that was asked
            candidate_answer: The candidate's response
            difficulty: Current difficulty level
            
        Returns:
            Follow-up question
        """
        prompt = f"""
        Generate a follow-up question based on the candidate's answer.
        
        Original Question: {original_question}
        Candidate Answer: {candidate_answer}
        Difficulty Level: {difficulty}
        
        The follow-up question should:
        1. Probe deeper into areas where the answer was brief or unclear
        2. Challenge assumptions made in the answer
        3. Explore related technical concepts
        4. Match the specified difficulty level
        5. Be specific and relevant to the original topic
        
        Generate only the follow-up question, no additional text.
        """
        
        return await self.generate_response(prompt, temperature=0.6)
    
    async def evaluate_technical_answer(
        self, 
        question: str, 
        answer: str, 
        expected_topics: List[str]
    ) -> Dict[str, Any]:
        """
        Evaluate technical accuracy and depth of an answer
        
        Args:
            question: The question asked
            answer: The candidate's answer
            expected_topics: Topics that should be covered
            
        Returns:
            Evaluation scores and feedback
        """
        prompt = f"""
        Evaluate the technical accuracy and depth of this answer.
        
        Question: {question}
        Answer: {answer}
        Expected Topics: {', '.join(expected_topics)}
        
        Score from 0.0 to 1.0:
        - technical_accuracy: Correctness of technical information
        - depth: How deep the explanation goes
        - clarity: How well the concepts are explained
        - completeness: Coverage of expected topics
        
        Provide specific feedback on strengths and areas for improvement.
        
        Respond in JSON format.
        """
        
        return await self.generate_structured_response(prompt)

# Global LLM service instance
llm_service = LLMService()
