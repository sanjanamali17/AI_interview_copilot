"""
Test script to verify Groq LLM service is working
"""

import asyncio
from services.llm_service import llm_service

async def test_llm_service():
    """Test if LLM service can make API calls"""
    
    try:
        print("=== Testing Groq LLM Service ===")
        
        # Test simple response
        response = await llm_service.generate_response(
            prompt="Hello! Please respond with 'Groq API is working!'",
            system_prompt="You are a helpful assistant.",
            max_tokens=50
        )
        
        print(f"✅ LLM Response: {response}")
        print("🎉 Groq API is fully functional!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your API key configuration.")

if __name__ == "__main__":
    asyncio.run(test_llm_service())
