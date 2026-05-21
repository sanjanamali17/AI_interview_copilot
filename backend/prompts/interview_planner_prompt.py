"""
Interview Planner Prompt Templates for AI Interview Copilot v5
"""

INTERVIEW_PLANNER_SYSTEM_PROMPT = """
You are an expert AI interview strategist with 15+ years of experience in technical recruiting.
You design comprehensive, personalized interview strategies that adapt to candidate profiles and job requirements.
Your interview plans are thorough, fair, and designed to accurately assess candidate capabilities.
"""

INTERVIEW_PLANNER_PROMPT = """
Create a comprehensive interview strategy plan for this candidate.

CANDIDATE PROFILE:
Name: {candidate_name}
Position: {position}
Experience Level: {experience_level} ({total_experience_years} years)
Key Skills: {', '.join(key_skills)}
Technologies: {', '.join(technologies)}
Leadership Experience: {leadership_roles}
Projects: {', '.join(projects[:3])}

JOB REQUIREMENTS:
Required Skills: {', '.join(required_skills)}
Technologies: {', '.join(technologies_required)}
Seniority Level: {seniority_level}
Responsibilities: {', '.join(responsibilities[:3])}

Create an interview plan with:

1. INTERVIEW STRUCTURE:
   - Number of stages
   - Questions per stage
   - Time allocation per stage
   - Difficulty progression strategy

2. FOCUS AREAS:
   - Primary assessment areas (top 5)
   - Secondary assessment areas
   - Skill gaps to investigate
   - Experience validation points

3. QUESTION STRATEGY:
   - Question types per stage
   - Difficulty adaptation rules
   - Follow-up question triggers
   - Technical depth requirements

4. EVALUATION CRITERIA:
   - Key performance indicators
   - Success thresholds per stage
   - Weighting of different skills
   - Red flag indicators

5. PERSONALIZATION:
   - Resume-specific questions
   - Project deep-dive areas
   - Experience validation approach
   - Cultural fit assessment

Provide the plan in a structured, actionable format that can be directly implemented by the AI interviewer.
"""

INTERVIEW_STAGE_SPECIFIC_PROMPTS = {
    "introduction": """
    Generate an introduction stage question for {candidate_name} applying for {position}.
    
    The question should:
    - Be warm and welcoming
    - Help the candidate feel comfortable
    - Gather basic information about their background
    - Set the tone for a professional interview
    - Be appropriate for {experience_level} level experience
    
    Generate only the question, no additional text.
    """,
    
    "resume_deep_dive": """
    Create a resume-specific question for {candidate_name} based on their background.
    
    Focus area: {focus_area}
    Experience: {experience_level}
    Key achievement: {achievement}
    
    The question should:
    - Explore the candidate's experience in depth
    - Validate claims made on resume
    - Assess the quality and impact of their work
    - Be specific to their background
    - Encourage detailed, evidence-based responses
    
    Generate only the question, no additional text.
    """,
    
    "technical_questions": """
    Generate a technical question for {candidate_name} for the {position} role.
    
    Skill focus: {skill_focus}
    Difficulty: {difficulty}
    Required technologies: {technologies}
    
    The question should:
    - Test core technical knowledge
    - Be appropriate for {difficulty} level
    - Relate to real-world scenarios
    - Allow demonstration of problem-solving skills
    - Be relevant to the position requirements
    
    Generate only the question, no additional text.
    """,
    
    "system_design": """
    Create a system design question for {candidate_name}.
    
    Role: {position}
    Experience: {experience_level}
    Complexity: {difficulty}
    
    The question should:
    - Test architectural thinking
    - Involve scalability considerations
    - Require trade-off analysis
    - Be realistic and practical
    - Match the candidate's experience level
    
    Generate only the question, no additional text.
    """,
    
    "behavioral_questions": """
    Generate a behavioral question for {candidate_name}.
    
    Situation context: {situation}
    Experience level: {experience_level}
    Assessment focus: {focus_area}
    
    The question should:
    - Reveal past behavior as predictor of future performance
    - Be open-ended and situational
    - Test soft skills and cultural fit
    - Allow demonstration of self-awareness
    - Be relevant to the role context
    
    Generate only the question, no additional text.
    """,
    
    "situational_problems": """
    Create a situational problem-solving question for {candidate_name}.
    
    Scenario: {scenario}
    Role context: {position}
    Complexity: {difficulty}
    
    The question should:
    - Present a realistic work challenge
    - Test decision-making under pressure
    - Assess prioritization and judgment
    - Reveal problem-solving methodology
    - Be relevant to day-to-day responsibilities
    
    Generate only the question, no additional text.
    """
}

DIFFICULTY_ADAPTATION_PROMPT = """
Analyze the candidate's performance and recommend difficulty adjustment.

Current Performance:
- Recent Scores: {recent_scores}
- Average Score: {average_score}
- Question Difficulty: {current_difficulty}
- Stage: {current_stage}
- Response Quality: {response_quality}

Adjustment Rules:
- Increase difficulty if: average score >= 8.0 for 3+ consecutive questions
- Maintain difficulty if: 6.0 <= average score < 8.0
- Decrease difficulty if: average score <= 4.0

Recommend:
1. New difficulty level (beginner/intermediate/advanced)
2. Rationale for adjustment
3. Expected impact on interview flow
4. Any special considerations

Respond in JSON format.
"""

FOLLOW_UP_QUESTION_PROMPT = """
Generate an intelligent follow-up question based on the candidate's answer.

Original Question: {original_question}
Candidate's Answer: {candidate_answer}
Current Difficulty: {difficulty}
Question Category: {category}

The follow-up question should:
1. Probe deeper into areas where the answer was brief or unclear
2. Challenge assumptions made in the answer
3. Explore related technical concepts
4. Match the specified difficulty level
5. Be specific and relevant to the original topic
6. Build upon the candidate's response

Consider:
- Did the candidate provide concrete examples?
- Were there gaps in their explanation?
- Can we test deeper understanding?
- Should we explore edge cases?

Generate only the follow-up question, no additional text.
"""

INTERVIEW_CLOSURE_PROMPT = """
Generate professional closing remarks for this interview.

Candidate: {candidate_name}
Position: {position}
Interview Duration: {duration} questions
Overall Performance: {performance_summary}

The closing should:
1. Thank the candidate sincerely
2. Acknowledge their time and effort
3. Briefly mention next steps
4. End on a positive, professional note
5. Be concise (2-3 sentences)

Generate only the closing remarks, no additional text.
"""
