"""
Question Generation Prompt Templates for AI Interview Copilot v5
"""

QUESTION_GENERATION_SYSTEM_PROMPT = """
You are an expert technical interviewer with deep knowledge across multiple domains including software engineering, data science, system design, and product management.
You create insightful, challenging, and fair questions that accurately assess candidate capabilities.
Your questions are practical, relevant, and designed to reveal true understanding rather than memorized answers.
"""

QUESTION_GENERATION_PROMPTS = {
    "technical": """
    Generate a {difficulty} level technical question for a {position} position.
    
    CANDIDATE PROFILE:
    - Experience Level: {experience_level}
    - Key Skills: {', '.join(skills)}
    - Technologies: {', '.join(technologies)}
    
    JOB REQUIREMENTS:
    - Required Skills: {', '.join(required_skills)}
    - Focus Area: {focus_area}
    
    The question should:
    1. Test core technical knowledge relevant to the position
    2. Be appropriate for {difficulty} level candidates
    3. Involve practical problem-solving
    4. Allow demonstration of depth vs breadth
    5. Be answerable within 2-3 minutes
    6. Have clear evaluation criteria
    
    Generate only the question, no additional text.
    """,
    
    "system_design": """
    Create a {difficulty} level system design question for a {position} role.
    
    CONTEXT:
    - Role Level: {experience_level}
    - System Complexity: {complexity}
    - Key Constraints: {constraints}
    
    The question should involve:
    1. Architectural decision-making
    2. Scalability considerations
    3. Trade-off analysis
    4. Practical implementation concerns
    5. Real-world constraints
    
    Focus on: {focus_area}
    
    Generate only the question, no additional text.
    """,
    
    "behavioral": """
    Generate a {difficulty} level behavioral question for a {position} candidate.
    
    ASSESSMENT FOCUS: {assessment_focus}
    EXPERIENCE LEVEL: {experience_level}
    
    The question should:
    1. Reveal past behavior patterns
    2. Test specific competencies
    3. Be situational and open-ended
    4. Allow STAR method responses
    5. Be relevant to workplace scenarios
    
    Target competency: {target_competency}
    
    Generate only the question, no additional text.
    """,
    
    "situational": """
    Create a {difficulty} level situational problem for a {position} candidate.
    
    SCENARIO CONTEXT: {scenario_context}
    DECISION POINTS: {decision_points}
    
    The situational problem should:
    1. Present a realistic work challenge
    2. Test judgment and prioritization
    3. Involve multiple stakeholders
    4. Have no single "right" answer
    5. Reveal decision-making process
    
    Key variables: {key_variables}
    
    Generate only the question, no additional text.
    """,
    
    "resume_specific": """
    Generate a question that explores the candidate's specific experience.
    
    RESUME HIGHLIGHT: {resume_highlight}
    CANDIDATE CLAIM: {candidate_claim}
    VALIDATION GOAL: {validation_goal}
    
    The question should:
    1. Deeply explore the claimed experience
    2. Test authenticity of the resume claim
    3. Assess the impact and quality of work
    4. Reveal learning and growth
    5. Be respectful yet thorough
    
    Focus area: {focus_area}
    
    Generate only the question, no additional text.
    """
}

PERSONALIZED_QUESTION_PROMPT = """
Personalize this question template for the specific candidate.

TEMPLATE: {question_template}
CANDIDATE NAME: {candidate_name}
POSITION: {position}
EXPERIENCE: {experience_level}
KEY SKILLS: {', '.join(key_skills)}
PROJECTS: {', '.join(projects[:2])}

Personalization guidelines:
1. Reference their specific experience where relevant
2. Use their name appropriately
3. Connect to their stated interests
4. Match their experience level
5. Incorporate their technical stack

Generate only the personalized question.
"""

QUESTION_DIFFICULTY_PROMPT = """
Determine the appropriate difficulty level for this question.

QUESTION: {question}
CANDIDATE PROFILE:
- Experience: {experience_years} years
- Level: {experience_level}
- Skills: {', '.join(skills)}

POSITION REQUIREMENTS:
- Seniority: {required_seniority}
- Complexity: {role_complexity}
- Scope: {responsibility_scope}

Rate difficulty on these factors:
1. Technical depth required (0-10)
2. Problem-solving complexity (0-10)
3. Prerequisite knowledge (0-10)
4. Time to answer (0-10)
5. Ambiguity tolerance (0-10)

Recommend difficulty: beginner/intermediate/advanced
Provide brief justification.

Respond in JSON format.
"""

QUESTION_QUALITY_CHECK_PROMPT = """
Evaluate the quality of this interview question.

QUESTION: {question}
TARGET DIFFICULTY: {difficulty}
QUESTION TYPE: {question_type}
ROLE: {position}

Quality criteria:
1. Clarity and specificity (0-10)
2. Relevance to position (0-10)
3. Appropriate difficulty (0-10)
4. Open-endedness (0-10)
5. Evaluability (0-10)
6. Time appropriateness (0-10)

Also assess:
- Potential for bias (yes/no)
- Cultural sensitivity (yes/no)
- Accessibility concerns (yes/no)
- Alternative phrasing suggestions

Provide overall score (0-10) and improvement recommendations.

Respond in JSON format.
"""

CONTEXTUAL_FOLLOW_UP_PROMPT = """
Generate contextual follow-up questions based on the conversation.

CONVERSATION HISTORY:
{conversation_history}

CURRENT ANSWER: {current_answer}
QUESTION CATEGORY: {category}
DIFFICULTY LEVEL: {difficulty}

Follow-up strategy:
1. Identify gaps or ambiguities in the answer
2. Test deeper understanding of mentioned concepts
3. Explore practical implementation details
4. Challenge assumptions if appropriate
5. Probe decision-making rationale

Generate 2-3 potential follow-up questions.
Rank them by priority (1=highest priority).

Respond in JSON format with questions and priorities.
"""

ADAPTIVE_QUESTION_GENERATION_PROMPT = """
Generate an adaptive question based on candidate performance.

PERFORMANCE ANALYSIS:
- Recent scores: {recent_scores}
- Strength areas: {strengths}
- Weak areas: {weaknesses}
- Response patterns: {response_patterns}

ADAPTATION STRATEGY:
- If performing well: increase complexity
- If struggling: simplify or change topic
- If mixed: maintain current level

CURRENT STAGE: {current_stage}
REMAINING TIME: {remaining_time}
FOCUS AREAS: {focus_areas}

Generate a question that:
1. Matches the adaptation strategy
2. Addresses current performance level
3. Covers important focus areas
4. Fits within time constraints
5. Maintains interview flow

Generate only the question, no additional text.
"""
