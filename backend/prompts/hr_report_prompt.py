"""
HR Report Prompt Templates for AI Interview Copilot v5
"""

HR_REPORT_SYSTEM_PROMPT = """
You are an experienced HR professional and hiring manager with 20+ years of experience in talent acquisition and assessment.
You provide comprehensive, fair, and actionable hiring recommendations based on thorough interview analysis.
Your reports are professional, data-driven, and focused on making optimal hiring decisions.
"""

FINAL_REPORT_GENERATION_PROMPT = """
Generate a comprehensive final interview report for this candidate.

CANDIDATE INFORMATION:
- Name: {candidate_name}
- Position: {position}
- Interview Date: {interview_date}
- Interview Duration: {duration_minutes} minutes
- Interviewer: AI Interview Copilot v5

INTERVIEW PERFORMANCE:
- Overall Score: {overall_score}/10
- Technical Knowledge: {technical_score}/10
- Communication Skills: {communication_score}/10
- Problem Solving: {problem_solving_score}/10
- Confidence Level: {confidence_score}/10
- Stress Assessment: {stress_level}

SKILL ASSESSMENT:
- Skill Graph Summary: {skill_graph_summary}
- Strongest Areas: {strongest_areas}
- Weakest Areas: {weakest_areas}
- Knowledge Gaps: {knowledge_gaps}

INTERVIEW ANALYTICS:
- Questions Asked: {questions_asked}
- Average Response Time: {avg_response_time}s
- Performance Trend: {performance_trend}
- Consistency Score: {consistency_score}

JOB FIT ANALYSIS:
- Skill Alignment: {skill_alignment}%
- Experience Match: {experience_match}%
- Cultural Fit: {cultural_fit}%
- Growth Potential: {growth_potential}%

HIRING RECOMMENDATION:
- Recommendation: {recommendation}
- Hiring Probability: {hiring_probability}%
- Confidence Level: {confidence_level}
- Key Strengths: {key_strengths}
- Key Concerns: {key_concerns}

Generate a professional report with:
1. Executive Summary
2. Detailed Assessment
3. Strengths and Weaknesses
4. Hiring Recommendation
5. Next Steps

Format as a structured report suitable for hiring managers.
"""

EXECUTIVE_SUMMARY_PROMPT = """
Generate an executive summary for this hiring decision.

CANDIDATE: {candidate_name}
POSITION: {position}
OVERALL SCORE: {overall_score}/10
RECOMMENDATION: {recommendation}

KEY POINTS:
- Performance highlights: {highlights}
- Main concerns: {concerns}
- Fit assessment: {fit_assessment}
- Risk factors: {risk_factors}

The executive summary should:
1. State the recommendation clearly
2. Provide 2-3 key supporting points
3. Note any significant concerns
4. Suggest next steps
5. Be concise (2-3 sentences total)

Target audience: Senior leadership and hiring managers
Tone: Professional, decisive, data-driven

Generate only the executive summary text.
"""

HIRING_DECISION_PROMPT = """
Make a hiring recommendation based on comprehensive interview analysis.

CANDIDATE PROFILE:
{candidate_profile}

INTERVIEW PERFORMANCE:
{performance_data}

JOB REQUIREMENTS:
{job_requirements}

COMPARATIVE ANALYSIS:
- vs Job Requirements: {job_match_score}%
- vs Benchmark Candidates: {benchmark_comparison}
- vs Team Average: {team_comparison}

DECISION FACTORS:
1. Technical Competency: {tech_competency}
2. Cultural Fit: {cultural_fit}
3. Growth Potential: {growth_potential}
4. Team Impact: {team_impact}
5. Risk Assessment: {risk_assessment}

HIRING CRITERIA:
- Minimum threshold: {min_threshold}
- Preferred threshold: {preferred_threshold}
- Exceptional threshold: {exceptional_threshold}

Recommendation options:
- HIRE: Strong candidate, proceed with offer
- CONSIDER: Good candidate, needs follow-up
- REJECT: Not suitable, close position

Provide:
1. Clear recommendation
2. Detailed reasoning
3. Supporting evidence
4. Risk assessment
5. Next steps

Respond in JSON format.
"""

CANDIDATE_COMPARISON_PROMPT = """
Compare this candidate against others for the same position.

CURRENT CANDIDATE:
{current_candidate}

COMPARISON CANDIDATES:
{comparison_candidates}

POSITION REQUIREMENTS:
{position_requirements}

COMPARISON METRICS:
1. Technical Skills Assessment
2. Communication Evaluation
3. Problem-Solving Capability
4. Cultural Fit Score
5. Growth Potential
6. Experience Relevance
7. Interview Performance
8. Overall Assessment

Rank candidates by:
- Overall suitability
- Technical strength
- Cultural alignment
- Growth trajectory
- Risk level

Provide:
1. Ranking table with scores
2. Strengths/weaknesses comparison
3. Fit assessment for each
4. Recommendation rationale
5. Decision-making framework

Respond in JSON format.
"""

TEAM_IMPACT_ASSESSMENT_PROMPT = """
Assess the potential impact of this candidate on the team.

CANDIDATE PROFILE:
{candidate_profile}

CURRENT TEAM DYNAMICS:
{team_dynamics}

TEAM COMPOSITION:
- Size: {team_size}
- Skill Mix: {skill_mix}
- Experience Levels: {experience_levels}
- Work Style: {work_style}
- Current Challenges: {challenges}

IMPACT AREAS:
1. Technical Capability Enhancement
2. Team Collaboration Improvement
3. Knowledge Sharing Contribution
4. Leadership Potential
5. Innovation and Creativity
6. Workload Distribution
7. Team Morale and Culture
8. Succession Planning

Assess:
- Positive impact potential (0-10)
- Risk factors and concerns
- Integration challenges
- Skill complementarity
- Leadership contribution
- Cultural influence

Provide recommendations for:
- Onboarding approach
- Team integration strategy
- Role assignment
- Development planning

Respond in JSON format.
"""

SALARY_RECOMMENDATION_PROMPT = """
Generate salary recommendation based on candidate assessment.

CANDIDATE QUALIFICATIONS:
{candidate_qualifications}

PERFORMANCE ASSESSMENT:
- Overall Score: {overall_score}/10
- Experience Level: {experience_level}
- Skill Proficiency: {skill_proficiency}
- Market Demand: {market_demand}

MARKET DATA:
- Position Average: {position_average}
- Experience Range: {experience_range}
- Skill Premium: {skill_premium}
- Location Adjustment: {location_adjustment}

COMPENSATION FACTORS:
1. Experience and qualifications
2. Technical skill proficiency
3. Interview performance
4. Market competitiveness
5. Internal equity
6. Growth potential
7. Budget constraints

Recommend:
- Base salary range
- Total compensation package
- Bonus/variable components
- Equity considerations (if applicable)
- Benefits alignment

Provide rationale for recommendation based on:
- Performance-based adjustments
- Market competitiveness
- Internal equity considerations
- Retention risk assessment

Respond in JSON format.
"""

ONBOARDING_PLAN_PROMPT = """
Create a personalized onboarding plan for this candidate.

CANDIDATE PROFILE:
{candidate_profile}

ROLE REQUIREMENTS:
{role_requirements}

IDENTIFIED STRENGTHS:
{strengths}

DEVELOPMENT AREAS:
{development_areas}

ONBOARDING GOALS:
1. Rapid integration into team
2. Quick productivity ramp-up
3. Cultural assimilation
4. Skill development
5. Relationship building
6. Process understanding

90-DAY PLAN STRUCTURE:
- First 30 days: Orientation and basics
- Days 31-60: Skill development and integration
- Days 61-90: Independence and contribution

For each phase include:
- Learning objectives
- Key activities
- Mentor assignments
- Success metrics
- Check-in points
- Risk mitigation

Customize based on:
- Experience level
- Skill gaps
- Learning style
- Team dynamics
- Role complexity

Generate a structured onboarding plan with specific, actionable steps.
"""

FEEDBACK_GENERATION_PROMPT = """
Generate professional feedback for this candidate.

INTERVIEW OUTCOME: {outcome}
OVERALL ASSESSMENT: {assessment}
SPECIFIC FEEDBACK: {specific_feedback}

Feedback types:
1. Offer acceptance feedback
2. Rejection feedback
3. Follow-up interview feedback
4. General improvement feedback

Guidelines:
- Be constructive and professional
- Provide specific, actionable feedback
- Maintain company reputation
- Be encouraging when appropriate
- Protect confidential information
- Follow legal compliance

Generate feedback that:
1. Acknowledges their effort and time
2. Provides honest assessment
3. Offers specific improvement areas
4. Maintains positive relationship
5. Is appropriate for the outcome

Generate only the feedback text.
"""

TALENT_POOL_ANALYSIS_PROMPT = """
Analyze this candidate for future talent pool consideration.

CANDIDATE ASSESSMENT:
{candidate_assessment}

CURRENT POSITION: {current_position}
HIRING DECISION: {hiring_decision}

FUTURE OPPORTUNITY ANALYSIS:
1. Skill trajectory potential
2. Experience development path
3. Leadership capability
4. Cultural alignment strength
5. Learning agility
6. Network value

TALENT POOL CATEGORIES:
- Immediate hire candidates
- Future consideration candidates
- Skill development candidates
- Leadership pipeline candidates
- Network referral candidates

Recommendation criteria:
- Growth potential score
- Cultural fit strength
- Skill marketability
- Development timeline
- Organizational need

Provide:
- Talent pool category
- Future potential assessment
- Development recommendations
- Engagement strategy
- Follow-up timeline

Respond in JSON format.
"""
