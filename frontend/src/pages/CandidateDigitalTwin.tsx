/**
 * AI Candidate Digital Twin - AI Interview Copilot v5
 * Advanced candidate intelligence profiling
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  User, 
  Target, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  FileText,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';

interface CapabilityProfile {
  technicalIntelligence: number;
  communicationClarity: number;
  problemSolvingAbility: number;
  analyticalThinking: number;
  creativityScore: number;
  leadershipPotential: number;
  adaptabilityScore: number;
  learningVelocity: number;
}

interface BehavioralProfile {
  confidenceLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  stressResponse: 'Resilient' | 'Moderate' | 'Sensitive' | 'Highly Sensitive';
  communicationStyle: 'Direct' | 'Analytical' | 'Collaborative' | 'Reserved';
  workStyle: 'Independent' | 'Collaborative' | 'Leadership' | 'Supportive';
  riskTolerance: 'Conservative' | 'Balanced' | 'Moderate' | 'Aggressive';
  decisionMaking: 'Analytical' | 'Intuitive' | 'Collaborative' | 'Decisive';
}

interface CognitiveProfile {
  logicalReasoning: number;
  patternRecognition: number;
  abstractThinking: number;
  memoryRecall: number;
  attentionToDetail: number;
  speedOfProcessing: number;
  mentalFlexibility: number;
  criticalThinking: number;
}

interface PotentialIndicators {
  growthPotential: number;
  leadershipPotential: number;
  innovationPotential: number;
  collaborationPotential: number;
  technicalGrowthRate: number;
  careerTrajectory: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Leadership' | 'Executive';
  timeToPromotion: string;
  futureRoles: string[];
}

interface RiskFactors {
  technicalRisks: string[];
  behavioralRisks: string[];
  culturalFitRisks: string[];
  performanceRisks: string[];
  retentionRisk: 'Low' | 'Medium' | 'High';
  onboardingComplexity: 'Low' | 'Medium' | 'High';
  supportRequirements: string[];
}

interface CandidateTwinData {
  candidateName: string;
  position: string;
  overallScore: number;
  capabilities: CapabilityProfile;
  behavioralProfile: BehavioralProfile;
  cognitiveProfile: CognitiveProfile;
  potentialIndicators: PotentialIndicators;
  riskFactors: RiskFactors;
  createdAt: Date;
}

const CandidateDigitalTwin: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [twinData, setTwinData] = useState<CandidateTwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadCandidateTwin();
    }
  }, [sessionId]);

  const loadCandidateTwin = async () => {
    try {
      console.log('🧠 Loading candidate digital twin for session:', sessionId);
      
      // Fetch candidate twin data from backend
      // const twinResponse = await interviewAPI.getCandidateTwin(sessionId!);
      // Mock data for demonstration
      const mockTwinData: CandidateTwinData = {
        candidateName: 'Sanjana Mali',
        position: 'Data Scientist',
        overallScore: 78,
        capabilities: {
          technicalIntelligence: 8.2,
          communicationClarity: 7.4,
          problemSolvingAbility: 7.8,
          analyticalThinking: 7.6,
          creativityScore: 7.2,
          leadershipPotential: 6.8,
          adaptabilityScore: 8.1,
          learningVelocity: 8.5
        },
        behavioralProfile: {
          confidenceLevel: 'High',
          stressResponse: 'Resilient',
          communicationStyle: 'Analytical',
          workStyle: 'Collaborative',
          riskTolerance: 'Balanced',
          decisionMaking: 'Analytical'
        },
        cognitiveProfile: {
          logicalReasoning: 8.0,
          patternRecognition: 7.8,
          abstractThinking: 7.5,
          memoryRecall: 7.2,
          attentionToDetail: 8.3,
          speedOfProcessing: 7.6,
          mentalFlexibility: 7.9,
          criticalThinking: 8.1
        },
        potentialIndicators: {
          growthPotential: 8.4,
          leadershipPotential: 6.8,
          innovationPotential: 7.2,
          collaborationPotential: 8.7,
          technicalGrowthRate: 8.5,
          careerTrajectory: 'Senior Level',
          timeToPromotion: '6-12 months',
          futureRoles: ['Senior Data Scientist', 'ML Team Lead', 'Principal Engineer']
        },
        riskFactors: {
          technicalRisks: ['Limited system design experience', 'Needs more deep learning practical experience'],
          behavioralRisks: ['May be too analytical in fast-paced environments'],
          culturalFitRisks: [],
          performanceRisks: ['May need guidance on large-scale projects'],
          retentionRisk: 'Low',
          onboardingComplexity: 'Medium',
          supportRequirements: ['Technical mentorship', 'System design guidance']
        },
        createdAt: new Date()
      };
      
      setTwinData(mockTwinData);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ Failed to load candidate twin:', err);
      setError(err.message || 'Failed to load candidate profile');
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Generating candidate digital twin...</p>
        </div>
      </div>
    );
  }

  if (error || !twinData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dashboard/${sessionId}`)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold">AI Candidate Digital Twin</h1>
                  <p className="text-gray-400 text-sm">{twinData.candidateName} • {twinData.position}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Score: <span className={getScoreColor(twinData.overallScore / 10)}>{twinData.overallScore}%</span>
              </div>
              
              <button
                onClick={loadCandidateTwin}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate(`/report/${sessionId}`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Overall Score */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Overall Intelligence Score</h2>
            <div className={`text-6xl font-bold ${getScoreColor(twinData.overallScore / 10)} mb-4`}>
              {twinData.overallScore}%
            </div>
            <p className="text-gray-300">Comprehensive candidate evaluation across all dimensions</p>
          </div>
        </div>

        {/* Capabilities Profile */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-3 text-blue-400" />
            Capabilities Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(twinData.capabilities).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                    {value.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(value)}`}
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral & Cognitive Profiles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Behavioral Profile */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Behavioral Profile
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Confidence Level</span>
                <span className="font-medium text-green-400">{twinData.behavioralProfile.confidenceLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Stress Response</span>
                <span className="font-medium text-yellow-400">{twinData.behavioralProfile.stressResponse}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Communication Style</span>
                <span className="font-medium">{twinData.behavioralProfile.communicationStyle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Work Style</span>
                <span className="font-medium">{twinData.behavioralProfile.workStyle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Risk Tolerance</span>
                <span className="font-medium">{twinData.behavioralProfile.riskTolerance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Decision Making</span>
                <span className="font-medium">{twinData.behavioralProfile.decisionMaking}</span>
              </div>
            </div>
          </div>

          {/* Cognitive Profile */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-400" />
              Cognitive Profile
            </h2>
            
            <div className="space-y-4">
              {Object.entries(twinData.cognitiveProfile).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-medium ${getScoreColor(value)}`}>
                    {value.toFixed(1)}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Potential Indicators */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-orange-400" />
            Potential Indicators
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Growth Potential</span>
                <span className={`font-bold ${getScoreColor(twinData.potentialIndicators.growthPotential)}`}>
                  {twinData.potentialIndicators.growthPotential.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Leadership Potential</span>
                <span className={`font-bold ${getScoreColor(twinData.potentialIndicators.leadershipPotential)}`}>
                  {twinData.potentialIndicators.leadershipPotential.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Innovation Potential</span>
                <span className={`font-bold ${getScoreColor(twinData.potentialIndicators.innovationPotential)}`}>
                  {twinData.potentialIndicators.innovationPotential.toFixed(1)}/10
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Collaboration Potential</span>
                <span className={`font-bold ${getScoreColor(twinData.potentialIndicators.collaborationPotential)}`}>
                  {twinData.potentialIndicators.collaborationPotential.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Technical Growth Rate</span>
                <span className={`font-bold ${getScoreColor(twinData.potentialIndicators.technicalGrowthRate)}`}>
                  {twinData.potentialIndicators.technicalGrowthRate.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Career Trajectory</span>
                <span className="font-medium text-green-400">{twinData.potentialIndicators.careerTrajectory}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-300">Time to Promotion</span>
                <p className="font-medium text-blue-400">{twinData.potentialIndicators.timeToPromotion}</p>
              </div>
              <div>
                <span className="text-gray-300">Future Roles</span>
                <div className="space-y-1">
                  {twinData.potentialIndicators.futureRoles.map((role, index) => (
                    <p key={index} className="text-sm text-gray-300">• {role}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
            Risk Assessment
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-red-400 mb-3">Technical Risks</h3>
                <div className="space-y-2">
                  {twinData.riskFactors.technicalRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-yellow-400 mb-3">Behavioral Risks</h3>
                <div className="space-y-2">
                  {twinData.riskFactors.behavioralRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-orange-400 mb-3">Performance Risks</h3>
                <div className="space-y-2">
                  {twinData.riskFactors.performanceRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-purple-400 mb-3">Support Requirements</h3>
                <div className="space-y-2">
                  {twinData.riskFactors.supportRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-300">Retention Risk</p>
              <p className={`font-bold ${getRiskColor(twinData.riskFactors.retentionRisk)}`}>
                {twinData.riskFactors.retentionRisk}
              </p>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-300">Onboarding Complexity</p>
              <p className={`font-bold ${getRiskColor(twinData.riskFactors.onboardingComplexity)}`}>
                {twinData.riskFactors.onboardingComplexity}
              </p>
            </div>
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-300">Overall Risk Level</p>
              <p className="font-bold text-green-400">Low</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDigitalTwin;
