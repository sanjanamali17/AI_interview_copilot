"""
Prediction Prompt Templates for AI Interview Copilot v5
"""

PREDICTION_SYSTEM_PROMPT = """
You are an expert talent analyst and data scientist specializing in predictive hiring models.
You analyze interview performance data to predict hiring success with high accuracy.
Your predictions are based on comprehensive data analysis, statistical modeling, and industry benchmarks.
"""

HIRING_PROBABILITY_PREDICTION_PROMPT = """
Predict the hiring probability for this candidate based on comprehensive analysis.

CANDIDATE PROFILE:
{candidate_profile}

INTERVIEW PERFORMANCE:
{interview_performance}

JOB REQUIREMENTS:
{job_requirements}

PREDICTION FACTORS:
1. Technical Assessment Score: {technical_score}/10
2. Communication Score: {communication_score}/10
3. Problem-Solving Score: {problem_solving_score}/10
4. Experience Alignment: {experience_alignment}%
5. Skill Coverage: {skill_coverage}%
6. Cultural Fit Score: {cultural_fit}/10
7. Performance Trend: {performance_trend}
8. Stress Management: {stress_management}

HISTORICAL DATA:
- Similar position success rate: {historical_success_rate}%
- Average interview score for hires: {average_hire_score}
- Score correlation with success: {score_correlation}

PREDICTION MODEL WEIGHTS:
- Interview performance: 40%
- Experience alignment: 25%
- Skill coverage: 20%
- Cultural fit: 15%

Calculate:
1. Base probability from profile match
2. Performance adjustment
3. Experience factor
4. Cultural fit adjustment
5. Overall hiring probability (0-100%)

Provide:
- Hiring probability percentage
- Confidence level (High/Medium/Low)
- Key positive factors
- Key risk factors
- Prediction reasoning

Respond in JSON format.
"""

SUCCESS_PREDICTION_PROMPT = """
Predict the candidate's probability of success in this specific role.

CANDIDATE ASSESSMENT:
{candidate_assessment}

ROLE ANALYSIS:
{role_analysis}

SUCCESS FACTORS:
{success_factors}

PREDICTION DIMENSIONS:
1. Technical Capability Success
2. Team Integration Success
3. Performance Excellence
4. Career Growth
5. Leadership Potential
6. Innovation Contribution

WEIGHTING FOR ROLE:
{role_weighting}

HISTORICAL SUCCESS PATTERNS:
{success_patterns}

RISK ASSESSMENT:
{risk_assessment}

For each dimension:
- Predict success probability (0-100%)
- Identify key indicators
- Note risk factors
- Suggest mitigation strategies

Calculate overall success probability:
- Weighted average of dimensions
- Confidence interval
- Success timeline prediction
- Performance ceiling estimate

Provide:
- Overall success probability
- Dimensional breakdown
- Success timeline
- Key success factors
- Primary risks
- Development recommendations

Respond in JSON format.
"""

PERFORMANCE_TRAJECTORY_PREDICTION_PROMPT = """
Predict the candidate's performance trajectory over the first 12 months.

CURRENT ASSESSMENT:
{current_assessment}

LEARNING INDICATORS:
{learning_indicators}

ADAPTABILITY METRICS:
{adaptability_metrics}

TRAJECTORY FACTORS:
1. Initial ramp-up speed
2. Skill acquisition rate
3. Problem-solving progression
4. Integration timeline
5. Independence development
6. Contribution growth

PREDICTION PERIODS:
- Month 1-3: Onboarding period
- Month 4-6: Skill development
- Month 7-9: Independence phase
- Month 10-12: Full contribution

For each period predict:
- Performance level (0-10)
- Key achievements expected
- Potential challenges
- Support needed
- Success metrics

Calculate:
- Performance curve trajectory
- Time to full productivity
- Peak performance potential
- Long-term growth projection

Provide:
- 12-month performance forecast
- Key milestone predictions
- Development timeline
- Support requirements
- Success probability by phase

Respond in JSON format.
"""

RETENTION_PREDICTION_PROMPT = """
Predict the candidate's likelihood of long-term retention.

RETENTION FACTORS:
{retention_factors}

CANDIDATE PROFILE:
{candidate_profile}

ORGANIZATIONAL FIT:
{organizational_fit}

RISK INDICATORS:
{risk_indicators}

PREDICTION VARIABLES:
1. Job satisfaction potential
2. Career growth alignment
3. Cultural compatibility
4. Compensation competitiveness
5. Work-life balance fit
6. Team integration potential
7. Long-term goal alignment

HISTORICAL RETENTION DATA:
{retention_data}

TURNOVER RISK FACTORS:
- Industry mobility rate: {industry_mobility}
- Role turnover rate: {role_turnover}
- Skill market demand: {skill_demand}
- Experience level risk: {experience_risk}

Predict:
- 6-month retention probability
- 1-year retention probability
- 2-year retention probability
- 5-year retention probability

Identify:
- Primary retention drivers
- Key turnover risks
- Mitigation strategies
- Engagement recommendations
- Career development needs

Provide:
- Retention probability timeline
- Key retention factors
- Turnover risk assessment
- Retention strategy recommendations
- Early warning indicators

Respond in JSON format.
"""

TEAM_IMPACT_PREDICTION_PROMPT = """
Predict the candidate's impact on team dynamics and performance.

CURRENT TEAM STATE:
{current_team_state}

CANDIDATE IMPACT PROFILE:
{candidate_impact_profile}

IMPACT DIMENSIONS:
1. Technical capability enhancement
2. Knowledge sharing contribution
3. Collaboration improvement
4. Innovation stimulation
5. Leadership influence
6. Team morale impact
7. Productivity contribution
8. Cultural influence

TEAM COMPLEMENTARITY:
{team_complementarity}

PREDICTION METRICS:
- Team performance change (+/- %)
- Knowledge transfer rate
- Collaboration improvement
- Innovation contribution
- Conflict resolution impact
- Mentorship potential

Predict for:
- Immediate impact (0-3 months)
- Short-term impact (3-6 months)
- Medium-term impact (6-12 months)
- Long-term impact (12+ months)

Provide:
- Overall team impact score
- Positive impact areas
- Potential challenges
- Integration timeline
- Success recommendations

Respond in JSON format.
"""

PROMOTION_TIMELINE_PREDICTION_PROMPT = """
Predict the candidate's promotion timeline and career progression.

CAREER POTENTIAL ASSESSMENT:
{career_potential}

PERFORMANCE INDICATORS:
{performance_indicators}

GROWTH FACTORS:
{growth_factors}

PROMOTION CRITERIA:
{promotion_criteria}

PREDICTION VARIABLES:
1. Learning acceleration rate
2. Leadership emergence
3. Impact scale growth
4. Responsibility expansion
5. Innovation contribution
6. Team influence
7. Business understanding

CAREER PATH OPTIONS:
{career_paths}

Predict:
- Time to first promotion
- Time to senior level
- Time to leadership role
- Maximum potential level
- Career trajectory shape

For each promotion level:
- Timeline prediction
- Required developments
- Success probability
- Key milestones
- Potential blockers

Provide:
- Career progression timeline
- Promotion probability by level
- Development requirements
- Success factors
- Career recommendations

Respond in JSON format.
"""

SALARY_GROWTH_PREDICTION_PROMPT = """
Predict the candidate's salary growth trajectory.

CURRENT COMPENSATION:
{current_compensation}

PERFORMANCE POTENTIAL:
{performance_potential}

MARKET FACTORS:
{market_factors}

GROWTH DRIVERS:
{growth_drivers}

PREDICTION PARAMETERS:
1. Performance-based increases
2. Market rate adjustments
3. Promotion-based increases
4. Skill acquisition premiums
5. Inflation adjustments
6. Company performance factors

PREDICTION TIMELINE:
- 6 months: {six_month_projection}
- 1 year: {one_year_projection}
- 2 years: {two_year_projection}
- 3 years: {three_year_projection}
- 5 years: {five_year_projection}

For each period predict:
- Base salary projection
- Total compensation projection
- Growth percentage
- Key growth drivers
- Risk factors

Provide:
- Salary growth trajectory
- Total compensation forecast
- Growth rate by period
- Key growth drivers
- Market competitiveness analysis

Respond in JSON format.
"""

SKILL_DEVELOPMENT_PREDICTION_PROMPT = """
Predict the candidate's skill development trajectory.

CURRENT SKILL PROFILE:
{current_skills}

LEARNING INDICATORS:
{learning_indicators}

DEVELOPMENT FACTORS:
{development_factors}

SKILL CATEGORIES:
{skill_categories}

PREDICTION METRICS:
1. Learning speed
2. Skill retention rate
3. Application ability
4. Innovation potential
5. Knowledge sharing
6. Cross-functional development

PREDICTION TIMELINE:
- 3 months: {three_month_skills}
- 6 months: {six_month_skills}
- 12 months: {twelve_month_skills}
- 24 months: {twenty_four_month_skills}

For each skill category predict:
- Current proficiency level
- Target proficiency level
- Development timeline
- Learning approach
- Success probability

Provide:
- Skill development roadmap
- Learning timeline predictions
- Development recommendations
- Resource requirements
- Success metrics

Respond in JSON format.
"""

PREDICTION_CONFIDENCE_ASSESSMENT_PROMPT = """
Assess confidence level in hiring predictions.

PREDICTION DATA:
{prediction_data}

DATA QUALITY:
{data_quality}

MODEL ACCURACY:
{model_accuracy}

CONFIDENCE FACTORS:
1. Data completeness
2. Sample size adequacy
3. Model validation
4. Historical accuracy
5. Market stability
6. Candidate consistency

UNCERTAINTY SOURCES:
{uncertainty_sources}

CONFIDENCE LEVELS:
- HIGH: >85% confidence, strong data support
- MEDIUM: 60-85% confidence, moderate data
- LOW: <60% confidence, limited data

For each prediction:
- Confidence score (0-100%)
- Confidence level classification
- Key confidence factors
- Primary uncertainty sources
- Improvement recommendations

Provide:
- Overall confidence assessment
- Prediction-specific confidence
- Confidence improvement plan
- Risk mitigation strategies
- Monitoring recommendations

Respond in JSON format.
"""
