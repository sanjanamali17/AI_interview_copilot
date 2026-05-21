"""
Evaluation Prompt Templates for AI Interview Copilot v5
"""

EVALUATION_SYSTEM_PROMPT = """
You are an expert technical interviewer and evaluator with 15+ years of experience in assessing candidates across various technical roles.
You provide fair, comprehensive, and constructive evaluations that accurately reflect candidate capabilities.
Your evaluations are detailed, evidence-based, and focused on both strengths and areas for improvement.
"""

DETAILED_EVALUATION_PROMPT = """
Evaluate this interview answer comprehensively and fairly.

QUESTION:
{question}

ANSWER:
{answer}

CONTEXT:
- Question Category: {category}
- Difficulty Level: {difficulty}
- Response Time: {response_time} seconds
- Question Number: {question_number}
- Interview Stage: {stage}

EVALUATION CRITERIA:
1. Technical Accuracy (0-10): Correctness of technical information
2. Communication Clarity (0-10): How well the answer is expressed
3. Problem Solving (0-10): Quality of reasoning and approach
4. Confidence (0-10): Level of confidence demonstrated
5. Relevance (0-10): How well the answer addresses the question
6. Depth (0-10): Level of detail and understanding shown

For each criterion, provide:
- Score (0-10)
- Specific evidence from the answer
- Strengths demonstrated
- Areas for improvement

Also assess:
- Overall communication quality
- Technical knowledge depth
- Problem-solving methodology
- Cultural fit indicators
- Red flags (if any)

Provide constructive feedback that:
1. Acknowledges what the candidate did well
2. Identifies specific improvement areas
3. Gives actionable suggestions
4. Is encouraging and professional

Respond in JSON format with detailed evaluation.
"""

STRESS_DETECTION_PROMPT = """
Analyze stress indicators in this candidate response.

ANSWER TEXT: {answer_text}
RESPONSE TIME: {response_time} seconds
WORD COUNT: {word_count} words

Stress indicators to assess:
1. Hesitation patterns: "um", "uh", "like", "you know", etc.
2. Uncertainty language: "maybe", "perhaps", "I think", "not sure"
3. Short or incomplete answers
4. Repetitive phrasing
5. Negative language patterns
6. Fillers and pauses indicators

Calculate stress metrics:
- Hesitation frequency (per 100 words)
- Uncertainty ratio (uncertain phrases / total phrases)
- Answer completeness (adequate detail vs too brief)
- Communication confidence (based on language patterns)

Stress level classification:
- LOW: < 0.05 hesitation frequency, confident language
- MODERATE: 0.05-0.15 hesitation frequency, some uncertainty
- HIGH: > 0.15 hesitation frequency, high uncertainty

Provide:
1. Stress level (low/moderate/high)
2. Confidence score (0-10)
3. Specific stress indicators found
4. Communication quality assessment
5. Recommendations for reducing stress

Respond in JSON format.
"""

KNOWLEDGE_GAP_DETECTION_PROMPT = """
Detect potential knowledge gaps between resume claims and interview performance.

RESUME CLAIMS:
{resume_claims}

INTERVIEW ANSWERS:
{interview_answers}

ANALYSIS FOCUS:
1. Claimed skills vs demonstrated knowledge
2. Depth of understanding in claimed areas
3. Practical application of theoretical knowledge
4. Consistency across different questions
5. Ability to handle follow-up questions

Look for:
- Superficial answers to deep technical questions
- Inability to explain basic concepts in claimed areas
- Contradictions between different answers
- Over-reliance on buzzwords without substance
- Evasive or overly general responses

Provide assessment:
- Consistency score (0-10)
- Knowledge depth score (0-10)
- Specific gaps identified
- Confidence in claimed skills
- Recommendations for validation

Respond in JSON format.
"""

PERFORMANCE_TREND_ANALYSIS_PROMPT = """
Analyze performance trends throughout this interview.

EVALUATION HISTORY:
{evaluation_history}

PERFORMANCE METRICS:
- Question progression: {question_progression}
- Difficulty changes: {difficulty_changes}
- Stage transitions: {stage_transitions}
- Time patterns: {time_patterns}

Trend analysis:
1. Performance trajectory (improving/stable/declining)
2. Adaptation to difficulty changes
3. Consistency across different stages
4. Learning curve during interview
5. Fatigue or engagement patterns

Calculate:
- Early performance average (first 1/3)
- Middle performance average (middle 1/3)
- Late performance average (last 1/3)
- Overall trend direction
- Performance volatility

Provide insights:
- Strength consistency
- Improvement areas
- Adaptability indicators
- Interview engagement
- Recommendations

Respond in JSON format.
"""

CULTURAL_FIT_ASSESSMENT_PROMPT = """
Assess cultural fit indicators from interview responses.

RESPONSES ANALYSIS:
{responses_analysis}

CULTURAL DIMENSIONS:
1. Team Collaboration: How they discuss working with others
2. Communication Style: Clarity, openness, listening
3. Adaptability: Response to change and new challenges
4. Leadership: How they handle responsibility and influence
5. Problem-Solving Approach: Individual vs collaborative
6. Learning Attitude: Growth mindset and feedback receptivity

ORGANIZATIONAL VALUES:
{organizational_values}

Assessment criteria:
- Alignment with company values
- Team compatibility indicators
- Communication effectiveness
- Adaptability and flexibility
- Leadership potential
- Learning orientation

Provide:
- Cultural fit score (0-10)
- Strength areas for culture
- Potential concerns
- Team dynamics implications
- Onboarding considerations

Respond in JSON format.
"""

TECHNICAL_COMPETENCY_MATRIX_PROMPT = """
Create a technical competency matrix for this candidate.

CANDIDATE PROFILE:
{candidate_profile}

TECHNICAL AREAS ASSESSED:
{technical_areas}

EVALUATION DATA:
{evaluation_data}

Competency dimensions:
1. Knowledge Base: Foundational understanding
2. Practical Application: Real-world usage
3. Problem Solving: Applied reasoning
4. Best Practices: Industry standards
5. Innovation: Creative solutions
6. Learning Ability: Quick adaptation

For each technical area:
- Rate each dimension (0-10)
- Provide evidence from answers
- Identify growth trajectory
- Note any red flags

Generate competency matrix with:
- Overall technical score
- Area-specific strengths
- Development opportunities
- Comparative analysis
- Recommendations

Respond in JSON format.
"""

FEEDBACK_GENERATION_PROMPT = """
Generate constructive feedback for this interview evaluation.

EVALUATION SUMMARY:
{evaluation_summary}

CANDIDATE PERFORMANCE:
- Overall Score: {overall_score}/10
- Technical: {technical_score}/10
- Communication: {communication_score}/10
- Problem Solving: {problem_solving_score}/10
- Confidence: {confidence_score}/10

STRENGTHS IDENTIFIED:
{strengths}

IMPROVEMENT AREAS:
{improvement_areas}

Generate feedback that:
1. Opens with positive acknowledgment
2. Highlights 2-3 specific strengths with examples
3. Identifies 2-3 improvement areas with actionable advice
4. Provides encouragement and next steps
5. Maintains professional and supportive tone
6. Is concise (3-4 sentences total)

Focus on:
- Being specific and evidence-based
- Providing actionable guidance
- Balancing criticism with encouragement
- Using clear, professional language

Generate only the feedback text, no additional formatting.
"""

EVALUATION_CALIBRATION_PROMPT = """
Calibrate evaluation standards for consistency.

RECENT EVALUATIONS:
{recent_evaluations}

CALIBRATION TARGETS:
- Average score distribution: {target_distribution}
- Passing threshold: {passing_threshold}
- Excellence threshold: {excellence_threshold}

Review evaluations for:
1. Score consistency across similar answers
2. Appropriate difficulty adjustments
3. Fair application of criteria
4. Bias detection and correction
5. Standard adherence

Provide calibration recommendations:
- Score adjustments needed
- Criteria refinement
- Bias corrections
- Standard improvements
- Quality metrics

Respond in JSON format.
"""
