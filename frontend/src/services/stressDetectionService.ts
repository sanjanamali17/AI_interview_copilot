/**
 * Stress Detection Service - AI Interview Copilot v5
 * Analyzes candidate responses for stress indicators and psychological patterns
 */

export interface StressIndicators {
  hesitationWords: number;
  fillerWords: number;
  shortResponses: number;
  uncertaintyPhrases: number;
  repetitionCount: number;
  responseLatency: number;
  speechRate: number;
  volumeVariation: number;
}

export interface StressAnalysis {
  overallStressLevel: 'low' | 'moderate' | 'high';
  confidenceScore: number;
  anxietyIndicators: string[];
  behavioralPatterns: {
    speechPattern: 'calm' | 'nervous' | 'rushed';
    communicationStyle: 'confident' | 'hesitant' | 'uncertain';
    cognitiveLoad: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
}

export class StressDetectionService {
  private hesitationWords = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'basically',
    'sort of', 'kind of', 'I guess', 'maybe', 'perhaps', 'probably'
  ];

  private uncertaintyPhrases = [
    'I think', 'I believe', 'I suppose', 'I might', 'I could', 'I would',
    'not sure', 'not certain', 'maybe', 'perhaps', 'possibly', 'I\'m not sure',
    'I don\'t know', 'I\'m not certain', 'it seems like', 'it appears'
  ];

  private stressIndicators = [
    'nervous', 'anxious', 'worried', 'concerned', 'stressed', 'pressured',
    'difficult', 'hard', 'challenging', 'struggling', 'confused', 'unclear'
  ];

  /**
   * Analyze text for stress indicators
   */
  analyzeTextStress(text: string, responseTime: number): StressAnalysis {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const wordCount = words.length;

    // Count hesitation words
    const hesitationCount = this.hesitationWords.filter(word => 
      lowerText.includes(word)
    ).length;

    // Count uncertainty phrases
    const uncertaintyCount = this.uncertaintyPhrases.filter(phrase => 
      lowerText.includes(phrase)
    ).length;

    // Count stress indicators
    const stressIndicatorCount = this.stressIndicators.filter(indicator => 
      lowerText.includes(indicator)
    ).length;

    // Calculate response characteristics
    const wordsPerMinute = (wordCount / responseTime) * 60;
    const shortResponse = wordCount < 10 ? 1 : 0;
    // const longResponse = wordCount > 100 ? 1 : 0; // Not used currently

    // Calculate stress score (0-100)
    let stressScore = 0;
    stressScore += (hesitationCount * 8);  // Each hesitation adds 8 points
    stressScore += (uncertaintyCount * 12); // Each uncertainty adds 12 points
    stressScore += (stressIndicatorCount * 15); // Direct stress indicators
    stressScore += (shortResponse * 10); // Short responses indicate stress
    stressScore += (responseTime > 10 ? 15 : 0); // Long response time
    stressScore += (wordsPerMinute < 80 ? 10 : 0); // Slow speech indicates hesitation
    stressScore += (wordsPerMinute > 180 ? 10 : 0); // Fast speech indicates anxiety

    // Determine stress level
    let stressLevel: 'low' | 'moderate' | 'high';
    if (stressScore <= 25) {
      stressLevel = 'low';
    } else if (stressScore <= 50) {
      stressLevel = 'moderate';
    } else {
      stressLevel = 'high';
    }

    // Calculate confidence score (inverse of stress)
    const confidenceScore = Math.max(0, 100 - stressScore);

    // Identify anxiety indicators
    const anxietyIndicators: string[] = [];
    if (hesitationCount > 3) anxietyIndicators.push('Excessive hesitation');
    if (uncertaintyCount > 2) anxietyIndicators.push('High uncertainty');
    if (shortResponse) anxietyIndicators.push('Minimal responses');
    if (responseTime > 8) anxietyIndicators.push('Delayed responses');
    if (wordsPerMinute > 160) anxietyIndicators.push('Rapid speech');
    if (stressIndicatorCount > 0) anxietyIndicators.push('Direct stress expressions');

    // Determine behavioral patterns
    const speechPattern = wordsPerMinute > 160 ? 'rushed' : 
                        wordsPerMinute < 80 ? 'nervous' : 'calm';
    
    const communicationStyle = uncertaintyCount > 2 ? 'uncertain' :
                              hesitationCount > 3 ? 'hesitant' : 'confident';
    
    const cognitiveLoad = stressScore > 40 ? 'high' :
                         stressScore > 20 ? 'medium' : 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (hesitationCount > 2) {
      recommendations.push('Practice speaking more confidently with fewer fillers');
    }
    if (uncertaintyCount > 1) {
      recommendations.push('Work on expressing ideas with more certainty');
    }
    if (shortResponse) {
      recommendations.push('Provide more detailed responses to demonstrate knowledge');
    }
    if (responseTime > 8) {
      recommendations.push('Practice quicker thinking and response formulation');
    }
    if (stressLevel === 'high') {
      recommendations.push('Consider relaxation techniques before interviews');
    }

    return {
      overallStressLevel: stressLevel,
      confidenceScore,
      anxietyIndicators,
      behavioralPatterns: {
        speechPattern,
        communicationStyle,
        cognitiveLoad
      },
      recommendations
    };
  }

  /**
   * Analyze voice patterns for stress (would integrate with voice analysis)
   */
  analyzeVoiceStress(_audioData: any): Partial<StressAnalysis> {
    // Placeholder for voice analysis
    // In production, this would analyze:
    // - Pitch variation
    // - Speech rate
    // - Volume changes
    // - Pauses and fillers
    
    return {
      behavioralPatterns: {
        speechPattern: 'calm',
        communicationStyle: 'confident',
        cognitiveLoad: 'low'
      }
    };
  }

  /**
   * Get stress level color for UI
   */
  getStressColor(stressLevel: 'low' | 'moderate' | 'high'): string {
    switch (stressLevel) {
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  /**
   * Get confidence level color for UI
   */
  getConfidenceColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }
}

export const stressDetectionService = new StressDetectionService();
