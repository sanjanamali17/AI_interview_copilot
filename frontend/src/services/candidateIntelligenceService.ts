/**
 * Candidate Intelligence Service - AI Interview Copilot v5
 * Creates comprehensive digital twin profile of candidate abilities
 */

export interface CandidateDigitalTwin {
  id: string;
  name: string;
  position: string;
  overallScore: number;
  capabilities: CapabilityProfile;
  behavioralProfile: BehavioralProfile;
  cognitiveProfile: CognitiveProfile;
  potentialIndicators: PotentialIndicators;
  riskFactors: RiskFactors;
  developmentPlan: DevelopmentPlan;
  createdAt: Date;
}

export interface CapabilityProfile {
  technicalIntelligence: number; // 0-10
  communicationClarity: number; // 0-10
  problemSolvingAbility: number; // 0-10
  analyticalThinking: number; // 0-10
  creativityScore: number; // 0-10
  leadershipPotential: number; // 0-10
  adaptabilityScore: number; // 0-10
  learningVelocity: number; // 0-10
}

export interface BehavioralProfile {
  confidenceLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  stressResponse: 'Resilient' | 'Moderate' | 'Sensitive' | 'Highly Sensitive';
  communicationStyle: 'Direct' | 'Analytical' | 'Collaborative' | 'Reserved';
  workStyle: 'Independent' | 'Collaborative' | 'Leadership' | 'Supportive';
  riskTolerance: 'Conservative' | 'Balanced' | 'Moderate' | 'Aggressive';
  decisionMaking: 'Analytical' | 'Intuitive' | 'Collaborative' | 'Decisive';
}

export interface CognitiveProfile {
  logicalReasoning: number; // 0-10
  patternRecognition: number; // 0-10
  abstractThinking: number; // 0-10
  memoryRecall: number; // 0-10
  attentionToDetail: number; // 0-10
  speedOfProcessing: number; // 0-10
  mentalFlexibility: number; // 0-10
  criticalThinking: number; // 0-10
}

export interface PotentialIndicators {
  growthPotential: number; // 0-10
  leadershipPotential: number; // 0-10
  innovationPotential: number; // 0-10
  collaborationPotential: number; // 0-10
  technicalGrowthRate: number; // 0-10
  careerTrajectory: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Leadership' | 'Executive';
  timeToPromotion: string; // e.g., "6-12 months"
  futureRoles: string[];
}

export interface RiskFactors {
  technicalRisks: string[];
  behavioralRisks: string[];
  culturalFitRisks: string[];
  performanceRisks: string[];
  retentionRisk: 'Low' | 'Medium' | 'High';
  onboardingComplexity: 'Low' | 'Medium' | 'High';
  supportRequirements: string[];
}

export interface DevelopmentPlan {
  immediateActions: string[];
  shortTermGoals: string[]; // 0-3 months
  midTermGoals: string[]; // 3-6 months
  longTermGoals: string[]; // 6-12 months
  recommendedTraining: string[];
  mentorshipNeeds: string[];
  successMetrics: string[];
}

export class CandidateIntelligenceService {
  /**
   * Generate comprehensive candidate digital twin
   */
  generateDigitalTwin(
    candidateName: string,
    position: string,
    interviewData: any,
    skillAssessments: any[],
    stressAnalysis: any
  ): CandidateDigitalTwin {
    const capabilities = this.analyzeCapabilities(interviewData, skillAssessments);
    const behavioralProfile = this.analyzeBehavioralProfile(stressAnalysis, interviewData);
    const cognitiveProfile = this.analyzeCognitiveProfile(interviewData);
    const potentialIndicators = this.assessPotential(capabilities, behavioralProfile);
    const riskFactors = this.identifyRiskFactors(capabilities, behavioralProfile, skillAssessments);
    const developmentPlan = this.createDevelopmentPlan(capabilities, riskFactors, potentialIndicators);

    return {
      id: `candidate_${Date.now()}`,
      name: candidateName,
      position,
      overallScore: this.calculateOverallScore(capabilities),
      capabilities,
      behavioralProfile,
      cognitiveProfile,
      potentialIndicators,
      riskFactors,
      developmentPlan,
      createdAt: new Date()
    };
  }

  /**
   * Analyze candidate capabilities
   */
  private analyzeCapabilities(interviewData: any, skillAssessments: any[]): CapabilityProfile {
    // Extract scores from interview data and skill assessments
    const technicalSkills = skillAssessments.filter(s => s.category === 'technical');
    const softSkills = skillAssessments.filter(s => s.category === 'soft');
    
    const technicalIntelligence = this.calculateCapabilityScore(technicalSkills);
    const communicationClarity = this.extractCommunicationScore(interviewData);
    const problemSolvingAbility = this.extractProblemSolvingScore(interviewData);
    const analyticalThinking = this.calculateAnalyticalScore(interviewData, skillAssessments);
    const creativityScore = this.assessCreativity(interviewData);
    const leadershipPotential = this.assessLeadership(interviewData, skillAssessments);
    const adaptabilityScore = this.assessAdaptability(interviewData);
    const learningVelocity = this.assessLearningVelocity(interviewData);

    return {
      technicalIntelligence,
      communicationClarity,
      problemSolvingAbility,
      analyticalThinking,
      creativityScore,
      leadershipPotential,
      adaptabilityScore,
      learningVelocity
    };
  }

  /**
   * Analyze behavioral profile
   */
  private analyzeBehavioralProfile(stressAnalysis: any, interviewData: any): BehavioralProfile {
    const confidenceLevel = this.mapConfidenceLevel(stressAnalysis.confidenceScore);
    const stressResponse = this.assessStressResponse(stressAnalysis);
    const communicationStyle = this.analyzeCommunicationStyle(interviewData);
    const workStyle = this.assessWorkStyle(interviewData);
    const riskTolerance = this.assessRiskTolerance(interviewData);
    const decisionMaking = this.assessDecisionMaking(interviewData);

    return {
      confidenceLevel,
      stressResponse,
      communicationStyle,
      workStyle,
      riskTolerance,
      decisionMaking
    };
  }

  /**
   * Analyze cognitive profile
   */
  private analyzeCognitiveProfile(interviewData: any): CognitiveProfile {
    // Analyze responses for cognitive indicators
    const responses = interviewData.responses || [];
    
    const logicalReasoning = this.assessLogicalReasoning(responses);
    const patternRecognition = this.assessPatternRecognition(responses);
    const abstractThinking = this.assessAbstractThinking(responses);
    const memoryRecall = this.assessMemoryRecall(responses);
    const attentionToDetail = this.assessAttentionToDetail(responses);
    const speedOfProcessing = this.assessProcessingSpeed(responses);
    const mentalFlexibility = this.assessMentalFlexibility(responses);
    const criticalThinking = this.assessCriticalThinking(responses);

    return {
      logicalReasoning,
      patternRecognition,
      abstractThinking,
      memoryRecall,
      attentionToDetail,
      speedOfProcessing,
      mentalFlexibility,
      criticalThinking
    };
  }

  /**
   * Assess candidate potential
   */
  private assessPotential(capabilities: CapabilityProfile, behavioralProfile: BehavioralProfile): PotentialIndicators {
    const growthPotential = this.calculateGrowthPotential(capabilities, behavioralProfile);
    const leadershipPotential = capabilities.leadershipPotential;
    const innovationPotential = this.assessInnovationPotential(capabilities);
    const collaborationPotential = this.assessCollaborationPotential(behavioralProfile);
    const technicalGrowthRate = this.assessTechnicalGrowthRate(capabilities);
    const careerTrajectory = this.predictCareerTrajectory(capabilities, growthPotential);
    const timeToPromotion = this.estimateTimeToPromotion(careerTrajectory, growthPotential);
    const futureRoles = this.predictFutureRoles(careerTrajectory, capabilities);

    return {
      growthPotential,
      leadershipPotential,
      innovationPotential,
      collaborationPotential,
      technicalGrowthRate,
      careerTrajectory,
      timeToPromotion,
      futureRoles
    };
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    capabilities: CapabilityProfile, 
    behavioralProfile: BehavioralProfile, 
    skillAssessments: any[]
  ): RiskFactors {
    const technicalRisks = this.identifyTechnicalRisks(capabilities, skillAssessments);
    const behavioralRisks = this.identifyBehavioralRisks(behavioralProfile);
    const culturalFitRisks = this.identifyCulturalFitRisks(behavioralProfile);
    const performanceRisks = this.identifyPerformanceRisks(capabilities);
    const retentionRisk = this.assessRetentionRisk(behavioralProfile, capabilities);
    const onboardingComplexity = this.assessOnboardingComplexity(capabilities, skillAssessments);
    const supportRequirements = this.identifySupportRequirements(capabilities, behavioralProfile);

    return {
      technicalRisks,
      behavioralRisks,
      culturalFitRisks,
      performanceRisks,
      retentionRisk,
      onboardingComplexity,
      supportRequirements
    };
  }

  /**
   * Create development plan
   */
  private createDevelopmentPlan(
    capabilities: CapabilityProfile,
    riskFactors: RiskFactors,
    potentialIndicators: PotentialIndicators
  ): DevelopmentPlan {
    const immediateActions = this.generateImmediateActions(capabilities, riskFactors);
    const shortTermGoals = this.generateShortTermGoals(capabilities, potentialIndicators);
    const midTermGoals = this.generateMidTermGoals(capabilities, potentialIndicators);
    const longTermGoals = this.generateLongTermGoals(potentialIndicators);
    const recommendedTraining = this.recommendTraining(capabilities, riskFactors);
    const mentorshipNeeds = this.identifyMentorshipNeeds(capabilities, potentialIndicators);
    const successMetrics = this.defineSuccessMetrics(capabilities, potentialIndicators);

    return {
      immediateActions,
      shortTermGoals,
      midTermGoals,
      longTermGoals,
      recommendedTraining,
      mentorshipNeeds,
      successMetrics
    };
  }

  // Helper methods for analysis
  private calculateCapabilityScore(skills: any[]): number {
    if (skills.length === 0) return 5;
    const total = skills.reduce((sum, skill) => sum + skill.currentLevel, 0);
    return Math.min(10, (total / skills.length) / 10);
  }

  private extractCommunicationScore(interviewData: any): number {
    // Extract communication scores from interview evaluations
    const evaluations = interviewData.evaluations || [];
    if (evaluations.length === 0) return 6;
    
    const total = evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.communication_clarity || 0), 0);
    return Math.min(10, (total / evaluations.length) / 10);
  }

  private extractProblemSolvingScore(interviewData: any): number {
    const evaluations = interviewData.evaluations || [];
    if (evaluations.length === 0) return 6;
    
    const total = evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.problem_solving || 0), 0);
    return Math.min(10, (total / evaluations.length) / 10);
  }

  private calculateAnalyticalScore(interviewData: any, skillAssessments: any[]): number {
    const analyticalSkills = skillAssessments.filter(s => 
      s.skill.includes('Analysis') || s.skill.includes('Analytics')
    );
    return this.calculateCapabilityScore(analyticalSkills);
  }

  private assessCreativity(interviewData: any): number {
    // Analyze responses for creative thinking indicators
    const responses = interviewData.responses || [];
    let creativityScore = 5;
    
    responses.forEach((response: any) => {
      if (response.answer && (
        response.answer.includes('innovative') ||
        response.answer.includes('creative') ||
        response.answer.includes('unique approach') ||
        response.answer.includes('out-of-the-box')
      )) {
        creativityScore += 1;
      }
    });
    
    return Math.min(10, creativityScore);
  }

  private assessLeadership(interviewData: any, skillAssessments: any[]): number {
    const leadershipSkills = skillAssessments.filter(s => 
      s.skill.includes('Leadership') || s.skill.includes('Team')
    );
    let baseScore = this.calculateCapabilityScore(leadershipSkills);
    
    // Boost score if leadership examples provided
    const responses = interviewData.responses || [];
    responses.forEach((response: any) => {
      if (response.answer && (
        response.answer.includes('led') ||
        response.answer.includes('managed') ||
        response.answer.includes('mentored') ||
        response.answer.includes('coordinated')
      )) {
        baseScore += 0.5;
      }
    });
    
    return Math.min(10, baseScore);
  }

  private assessAdaptability(interviewData: any): number {
    // Assess based on responses to change/learning questions
    const responses = interviewData.responses || [];
    let adaptabilityScore = 6;
    
    responses.forEach((response: any) => {
      if (response.answer && (
        response.answer.includes('adapt') ||
        response.answer.includes('learned') ||
        response.answer.includes('quickly') ||
        response.answer.includes('flexible')
      )) {
        adaptabilityScore += 0.5;
      }
    });
    
    return Math.min(10, adaptabilityScore);
  }

  private assessLearningVelocity(interviewData: any): number {
    // Assess how quickly candidate picks up new concepts
    const responses = interviewData.responses || [];
    let learningScore = 6;
    
    responses.forEach((response: any) => {
      if (response.answer && (
        response.answer.includes('quickly learned') ||
        response.answer.includes('fast learner') ||
        response.answer.includes('picked up') ||
        response.answer.includes('self-taught')
      )) {
        learningScore += 0.5;
      }
    });
    
    return Math.min(10, learningScore);
  }

  private mapConfidenceLevel(score: number): 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'Very Low';
  }

  private assessStressResponse(stressAnalysis: any): 'Resilient' | 'Moderate' | 'Sensitive' | 'Highly Sensitive' {
    switch (stressAnalysis.overallStressLevel) {
      case 'low': return 'Resilient';
      case 'moderate': return 'Moderate';
      case 'high': return 'Sensitive';
      default: return 'Highly Sensitive';
    }
  }

  private analyzeCommunicationStyle(interviewData: any): 'Direct' | 'Analytical' | 'Collaborative' | 'Reserved' {
    // Analyze communication patterns from responses
    const responses = interviewData.responses || [];
    let styleScore = { direct: 0, analytical: 0, collaborative: 0, reserved: 0 };
    
    responses.forEach((response: any) => {
      const answer = response.answer?.toLowerCase() || '';
      if (answer.includes('directly') || answer.includes('straightforward')) styleScore.direct++;
      if (answer.includes('analyze') || answer.includes('data')) styleScore.analytical++;
      if (answer.includes('team') || answer.includes('collaborate')) styleScore.collaborative++;
      if (answer.includes('listen') || answer.includes('observe')) styleScore.reserved++;
    });
    
    const maxScore = Math.max(styleScore.direct, styleScore.analytical, styleScore.collaborative, styleScore.reserved);
    if (maxScore === styleScore.analytical) return 'Analytical';
    if (maxScore === styleScore.collaborative) return 'Collaborative';
    if (maxScore === styleScore.direct) return 'Direct';
    return 'Reserved';
  }

  private assessWorkStyle(interviewData: any): 'Independent' | 'Collaborative' | 'Leadership' | 'Supportive' {
    // Similar analysis for work style
    return 'Collaborative'; // Placeholder
  }

  private assessRiskTolerance(interviewData: any): 'Conservative' | 'Balanced' | 'Moderate' | 'Aggressive' {
    return 'Balanced'; // Placeholder
  }

  private assessDecisionMaking(interviewData: any): 'Analytical' | 'Intuitive' | 'Collaborative' | 'Decisive' {
    return 'Analytical'; // Placeholder
  }

  // Additional helper methods...
  private assessLogicalReasoning(responses: any[]): number { return 7; }
  private assessPatternRecognition(responses: any[]): number { return 7; }
  private assessAbstractThinking(responses: any[]): number { return 7; }
  private assessMemoryRecall(responses: any[]): number { return 7; }
  private assessAttentionToDetail(responses: any[]): number { return 7; }
  private assessProcessingSpeed(responses: any[]): number { return 7; }
  private assessMentalFlexibility(responses: any[]): number { return 7; }
  private assessCriticalThinking(responses: any[]): number { return 7; }

  private calculateGrowthPotential(capabilities: CapabilityProfile, behavioralProfile: BehavioralProfile): number {
    return (capabilities.learningVelocity + capabilities.adaptabilityScore) / 2;
  }

  private assessInnovationPotential(capabilities: CapabilityProfile): number {
    return capabilities.creativityScore;
  }

  private assessCollaborationPotential(behavioralProfile: BehavioralProfile): number {
    return behavioralProfile.communicationStyle === 'Collaborative' ? 8 : 6;
  }

  private assessTechnicalGrowthRate(capabilities: CapabilityProfile): number {
    return capabilities.learningVelocity;
  }

  private predictCareerTrajectory(capabilities: CapabilityProfile, growthPotential: number): 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Leadership' | 'Executive' {
    const overallScore = Object.values(capabilities).reduce((sum, val) => sum + val, 0) / Object.keys(capabilities).length;
    
    if (overallScore >= 9.5 && growthPotential >= 9) return 'Executive';
    if (overallScore >= 8.5 && growthPotential >= 8) return 'Leadership';
    if (overallScore >= 7.5) return 'Senior Level';
    if (overallScore >= 6.5) return 'Mid Level';
    return 'Entry Level';
  }

  private estimateTimeToPromotion(careerTrajectory: string, growthPotential: number): string {
    if (growthPotential >= 8) return '3-6 months';
    if (growthPotential >= 6) return '6-12 months';
    return '12+ months';
  }

  private predictFutureRoles(careerTrajectory: string, capabilities: CapabilityProfile): string[] {
    const roleMap: Record<string, string[]> = {
      'Leadership': ['Senior Data Scientist', 'Team Lead', 'Principal Engineer', 'Engineering Manager'],
      'Senior Level': ['Senior Data Scientist', 'Staff Engineer', 'Tech Lead'],
      'Mid Level': ['Data Scientist', 'Software Engineer', 'Senior Analyst'],
      'Entry Level': ['Junior Data Scientist', 'Associate Engineer', 'Analyst']
    };
    
    return roleMap[careerTrajectory] || ['Data Scientist'];
  }

  private identifyTechnicalRisks(capabilities: CapabilityProfile, skillAssessments: any[]): string[] {
    const risks: string[] = [];
    if (capabilities.technicalIntelligence < 6) risks.push('Below average technical skills');
    if (capabilities.analyticalThinking < 6) risks.push('Limited analytical capabilities');
    return risks;
  }

  private identifyBehavioralRisks(behavioralProfile: BehavioralProfile): string[] {
    const risks: string[] = [];
    if (behavioralProfile.confidenceLevel === 'Low' || behavioralProfile.confidenceLevel === 'Very Low') {
      risks.push('Low confidence may impact performance');
    }
    if (behavioralProfile.stressResponse === 'Highly Sensitive') {
      risks.push('High stress sensitivity');
    }
    return risks;
  }

  private identifyCulturalFitRisks(behavioralProfile: BehavioralProfile): string[] {
    return []; // Placeholder for cultural fit analysis
  }

  private identifyPerformanceRisks(capabilities: CapabilityProfile): string[] {
    const risks: string[] = [];
    if (capabilities.problemSolvingAbility < 6) risks.push('May struggle with complex problems');
    return risks;
  }

  private assessRetentionRisk(behavioralProfile: BehavioralProfile, capabilities: CapabilityProfile): 'Low' | 'Medium' | 'High' {
    return 'Low'; // Placeholder
  }

  private assessOnboardingComplexity(capabilities: CapabilityProfile, skillAssessments: any[]): 'Low' | 'Medium' | 'High' {
    return 'Medium'; // Placeholder
  }

  private identifySupportRequirements(capabilities: CapabilityProfile, behavioralProfile: BehavioralProfile): string[] {
    const requirements: string[] = [];
    if (capabilities.technicalIntelligence < 7) requirements.push('Technical mentorship');
    if (behavioralProfile.confidenceLevel === 'Low') requirements.push('Confidence building support');
    return requirements;
  }

  private generateImmediateActions(capabilities: CapabilityProfile, riskFactors: RiskFactors): string[] {
    return [
      'Complete onboarding technical assessment',
      'Assign technical mentor',
      'Set up 30-day performance goals'
    ];
  }

  private generateShortTermGoals(capabilities: CapabilityProfile, potentialIndicators: PotentialIndicators): string[] {
    return [
      'Master core technical stack',
      'Complete first project independently',
      'Demonstrate problem-solving skills'
    ];
  }

  private generateMidTermGoals(capabilities: CapabilityProfile, potentialIndicators: PotentialIndicators): string[] {
    return [
      'Lead small project',
      'Mentor junior team member',
      'Contribute to technical strategy'
    ];
  }

  private generateLongTermGoals(potentialIndicators: PotentialIndicators): string[] {
    return [
      'Achieve senior level competency',
      'Develop expertise in specialized area',
      'Take on leadership responsibilities'
    ];
  }

  private recommendTraining(capabilities: CapabilityProfile, riskFactors: RiskFactors): string[] {
    const training: string[] = [];
    if (capabilities.technicalIntelligence < 7) training.push('Advanced technical skills training');
    if (capabilities.communicationClarity < 7) training.push('Communication skills workshop');
    return training;
  }

  private identifyMentorshipNeeds(capabilities: CapabilityProfile, potentialIndicators: PotentialIndicators): string[] {
    const needs: string[] = [];
    if (capabilities.leadershipPotential > 7) needs.push('Leadership mentoring');
    return needs;
  }

  private defineSuccessMetrics(capabilities: CapabilityProfile, potentialIndicators: PotentialIndicators): string[] {
    return [
      'Achieve 90% of technical goals',
      'Positive peer feedback',
      'Successful project delivery'
    ];
  }

  private calculateOverallScore(capabilities: CapabilityProfile): number {
    const scores = Object.values(capabilities);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
}

export const candidateIntelligenceService = new CandidateIntelligenceService();
