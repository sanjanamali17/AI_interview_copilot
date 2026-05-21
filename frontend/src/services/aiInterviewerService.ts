/**
 * AI Interviewer Service - AI Interview Copilot v5
 * Manages human-like AI interviewer behavior and conversation flow
 */

export interface InterviewMessage {
  type: 'greeting' | 'question' | 'followup' | 'feedback' | 'closing';
  text: string;
  timestamp: Date;
}

export interface CandidateResponse {
  text: string;
  confidence: number;
  stressLevel: 'low' | 'moderate' | 'high';
  hesitationWords: number;
  responseTime: number;
}

export interface InterviewContext {
  candidateName: string;
  position: string;
  resumeSkills: string[];
  currentQuestionIndex: number;
  totalQuestions: number;
  previousAnswers: CandidateResponse[];
  detectedWeaknesses: string[];
  detectedStrengths: string[];
}

export class AIInterviewerService {
  private context: InterviewContext;
  private conversationHistory: InterviewMessage[] = [];

  constructor(context: InterviewContext) {
    this.context = context;
  }

  /**
   * Generate AI greeting message
   */
  generateGreeting(): InterviewMessage {
    const greetings = [
      `Hello ${this.context.candidateName}, thank you for joining the interview today. I'm excited to learn more about your experience and skills.`,
      `Good ${this.getTimeOfDay()} ${this.context.candidateName}. Welcome to your interview for the ${this.context.position} position. Let's start with a brief introduction.`,
      `Hi ${this.context.candidateName}, thank you for taking the time to speak with me today. I'll be asking you some questions about your background and the ${this.context.position} role.`
    ];

    const greeting: InterviewMessage = {
      type: 'greeting',
      text: greetings[Math.floor(Math.random() * greetings.length)],
      timestamp: new Date()
    };

    this.conversationHistory.push(greeting);
    return greeting;
  }

  /**
   * Generate contextual follow-up question
   */
  generateFollowUp(previousAnswer: CandidateResponse, originalQuestion: string): InterviewMessage {
    const followUps = this.generateFollowUpQuestions(previousAnswer, originalQuestion);
    
    const followUp: InterviewMessage = {
      type: 'followup',
      text: followUps[Math.floor(Math.random() * followUps.length)],
      timestamp: new Date()
    };

    this.conversationHistory.push(followUp);
    return followUp;
  }

  /**
   * Generate encouraging feedback
   */
  generateFeedback(answerStrength: 'strong' | 'moderate' | 'weak'): InterviewMessage {
    const feedback = this.getFeedbackByStrength(answerStrength);
    
    const feedbackMessage: InterviewMessage = {
      type: 'feedback',
      text: feedback,
      timestamp: new Date()
    };

    this.conversationHistory.push(feedbackMessage);
    return feedbackMessage;
  }

  /**
   * Analyze candidate response for stress and confidence
   */
  analyzeResponse(text: string, responseTime: number): CandidateResponse {
    // Stress indicators
    const hesitationWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    const uncertaintyPhrases = ['i think', 'maybe', 'probably', 'not sure', 'i guess'];
    const shortResponseThreshold = 20; // characters
    
    const hesitationCount = hesitationWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    const uncertaintyCount = uncertaintyPhrases.filter(phrase => 
      text.toLowerCase().includes(phrase)
    ).length;

    // Calculate stress level
    let stressLevel: 'low' | 'moderate' | 'high' = 'low';
    
    if (hesitationCount >= 3 || uncertaintyCount >= 2 || text.length < shortResponseThreshold) {
      stressLevel = 'high';
    } else if (hesitationCount >= 1 || uncertaintyCount >= 1) {
      stressLevel = 'moderate';
    }

    // Calculate confidence based on response length, hesitation, and uncertainty
    let confidence = 1.0;
    confidence -= (hesitationCount * 0.1);
    confidence -= (uncertaintyCount * 0.15);
    
    // Bonus for detailed responses
    if (text.length > 100) {
      confidence += 0.2;
    }
    
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      text,
      confidence,
      stressLevel,
      hesitationWords: hesitationCount,
      responseTime
    };
  }

  /**
   * Generate interview summary
   */
  generateSummary(): {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    hiringProbability: number;
  } {
    const avgConfidence = this.context.previousAnswers.reduce((sum, answer) => 
      sum + answer.confidence, 0) / this.context.previousAnswers.length;
    
    const stressScore = this.context.previousAnswers.filter(answer => 
      answer.stressLevel === 'high').length / this.context.previousAnswers.length;

    const overallScore = (avgConfidence * 0.7) + ((1 - stressScore) * 0.3);

    return {
      overallScore: Math.round(overallScore * 100),
      strengths: this.context.detectedStrengths,
      weaknesses: this.context.detectedWeaknesses,
      recommendations: this.generateRecommendations(),
      hiringProbability: this.calculateHiringProbability(overallScore)
    };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private generateFollowUpQuestions(answer: CandidateResponse, question: string): string[] {
    const followUps: string[] = [];

    // Based on answer strength
    if (answer.confidence > 0.8) {
      followUps.push(
        "That's a great explanation. Could you elaborate on the specific challenges you faced?",
        "Excellent insight. Let's explore that approach in more detail.",
        "That's impressive. How did you measure the success of that approach?"
      );
    } else if (answer.confidence > 0.5) {
      followUps.push(
        "That's a good starting point. Could you provide more specific details?",
        "I see what you mean. How would you improve that approach?",
        "Thanks for sharing. What was the most valuable lesson you learned from that experience?"
      );
    } else {
      followUps.push(
        "That's interesting. Could you walk me through your thought process?",
        "Let me rephrase the question to help you think about it differently.",
        "No problem. Let's try a simpler aspect of this topic."
      );
    }

    return followUps;
  }

  private getFeedbackByStrength(strength: 'strong' | 'moderate' | 'weak'): string {
    const feedback = {
      strong: [
        "That's an excellent answer. You've clearly demonstrated strong knowledge in this area.",
        "Great response! Your experience really shows through in your explanation.",
        "Very well articulated. That's exactly the kind of insight we're looking for."
      ],
      moderate: [
        "Good answer. You're on the right track with your approach.",
        "That's a solid response. Could you add a bit more detail about the implementation?",
        "Nice explanation. I'd like to hear more about the results you achieved."
      ],
      weak: [
        "That's a basic understanding. Let me help you think through this more systematically.",
        "I see where you're going with that. Let's break this down into smaller components.",
        "That's a starting point. Let's explore the fundamental concepts behind this."
      ]
    };

    const responses = feedback[strength];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Based on detected weaknesses
    if (this.context.detectedWeaknesses.includes('System Design')) {
      recommendations.push("Study distributed systems architecture and load balancing patterns");
    }
    
    if (this.context.detectedWeaknesses.includes('Communication')) {
      recommendations.push("Practice explaining technical concepts to non-technical audiences");
    }
    
    if (this.context.detectedWeaknesses.includes('Problem Solving')) {
      recommendations.push("Work on algorithmic problem-solving and coding challenges");
    }

    return recommendations;
  }

  private calculateHiringProbability(overallScore: number): number {
    if (overallScore >= 0.8) return 85 + Math.random() * 10; // 85-95%
    if (overallScore >= 0.6) return 60 + Math.random() * 20; // 60-80%
    if (overallScore >= 0.4) return 30 + Math.random() * 20; // 30-50%
    return 10 + Math.random() * 20; // 10-30%
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): InterviewMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Update context with new information
   */
  updateContext(updates: Partial<InterviewContext>): void {
    this.context = { ...this.context, ...updates };
  }
}
