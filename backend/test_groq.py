"""
Test script to verify Groq API configuration
"""

import os
from config import config

def test_groq_api():
    """Test if Groq API is properly configured"""
    
    print("=== Groq API Configuration Test ===")
    print(f"API Key configured: {'Yes' if config.GROQ_API_KEY else 'No'}")
    print(f"API Key length: {len(config.GROQ_API_KEY) if config.GROQ_API_KEY else 0}")
    print(f"Model: {config.GROQ_MODEL}")
    
    if config.GROQ_API_KEY:
        print("\n✅ Groq API is configured!")
        print("You can now run the AI Interview Copilot.")
    else:
        print("\n❌ Groq API key is not configured!")
        print("\nTo set up your API key:")
        print("1. Get your key from https://groq.com/")
        print("2. Set environment variable:")
        print("   set GROQ_API_KEY=your_gsk_api_key_here")
        print("   OR")
        print("   $env:GROQ_API_KEY='your_gsk_api_key_here'")
        print("3. Restart your terminal/application")

if __name__ == "__main__":
    test_groq_api()
