/**
 * Final AI Recruiter Report - AI Interview Copilot v5
 * Professional recruiter evaluation report
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Target,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Award,
  Users,
  Activity
} from 'lucide-react';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';

interface FinalReport {
  sessionId: string;
  candidateName: string;
  position: string;
  interviewDate: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  stressAssessment: string;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  recommendedLearning: string[];
  hiringProbability: number;
  hiringRecommendation: 'Hire' | 'Consider' | 'Reject';
  recommendationReasoning: string;
  interviewTimeline: Array<{
    questionNumber: number;
    question: string;
    answer: string;
    score: number;
    confidence: string;
    stressLevel: string;
    feedback: string;
  }>;
}

const FinalAIRecruiterReport: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadFinalReport();
    }
  }, [sessionId]);

  const loadFinalReport = async () => {
    try {
      console.log('📊 Loading final report for session:', sessionId);
      
      // Fetch final report from backend
      const reportData = await interviewAPI.getFinalReport(sessionId!);
      console.log('✅ Final report loaded:', reportData);
      
      // Mock comprehensive report data
      const mockReport: FinalReport = {
        sessionId: sessionId!,
        candidateName: 'Sanjana Mali',
        position: 'Data Scientist',
        interviewDate: new Date().toLocaleDateString(),
        overallScore: 78,
        technicalScore: 82,
        communicationScore: 75,
        problemSolvingScore: 76,
        stressAssessment: 'Low to Moderate',
        strengths: [
          'Strong Python programming skills',
          'Solid understanding of machine learning algorithms',
          'Good statistical foundation',
          'Clear communication style',
          'Methodical problem-solving approach',
          'Experience with data analysis projects'
        ],
        weaknesses: [
          'Limited system design experience',
          'Needs more deep learning practical experience',
          'Could improve on scalability concepts'
        ],
        knowledgeGaps: [
          'Distributed systems architecture',
          'Large-scale data processing',
          'Production ML deployment',
          'Cloud platform optimization'
        ],
        recommendedLearning: [
          'System design fundamentals and patterns',
          'Cloud-native ML deployment strategies',
          'Big data technologies (Spark, Kafka)',
          'MLOps and production ML systems',
          'Advanced deep learning frameworks'
        ],
        hiringProbability: 78,
        hiringRecommendation: 'Hire',
        recommendationReasoning: 'Candidate demonstrates strong technical foundation in data science with excellent Python skills and solid ML knowledge. Communication is clear and problem-solving approach is methodical. While system design experience is limited, the candidate shows high potential and ability to learn quickly. Recommended for hire with focus on growth in system architecture.',
        interviewTimeline: [
          {
            questionNumber: 1,
            question: "Tell me about your experience with machine learning projects.",
            answer: "I've worked on several ML projects including predictive modeling and classification tasks using Python and scikit-learn. I've implemented various algorithms from linear regression to random forests and have experience with data preprocessing and feature engineering.",
            score: 8.1,
            confidence: "High",
            stressLevel: "Low",
            feedback: "Strong technical explanation with good examples of practical experience"
          },
          {
            questionNumber: 2,
            question: "How would you handle missing data in a dataset?",
            answer: "I would first analyze the missing data pattern to understand if it's MCAR, MAR, or MNAR. Then I'd use appropriate imputation techniques like mean/median imputation for numerical data, or more advanced methods like KNN imputation or iterative imputation. I'd also consider dropping columns with too many missing values.",
            score: 7.8,
            confidence: "High",
            stressLevel: "Low",
            feedback: "Good systematic approach to data preprocessing with awareness of different missing data mechanisms"
          },
          {
            questionNumber: 3,
            question: "Describe a challenging data science problem you've solved.",
            answer: "In my last project, I had to deal with imbalanced classes in a fraud detection system. I used SMOTE for oversampling the minority class and implemented ensemble methods. I also optimized the threshold for better precision-recall tradeoff, which improved the F1-score significantly.",
            score: 7.5,
            confidence: "Medium",
            stressLevel: "Moderate",
            feedback: "Good problem-solving but could elaborate more on the specific results and metrics"
          }
        ]
      };
      
      setReport(mockReport);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ Failed to load final report:', err);
      setError(err.message || 'Failed to load final report');
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportContent = `
AI INTERVIEW COPILOT V5 - FINAL RECRUITER REPORT
==================================================

Candidate: ${report.candidateName}
Position: ${report.position}
Interview Date: ${report.interviewDate}
Session ID: ${report.sessionId}

OVERALL ASSESSMENT
------------------
Overall Score: ${report.overallScore}/100
Technical Score: ${report.technicalScore}/100
Communication Score: ${report.communicationScore}/100
Problem Solving Score: ${report.problemSolvingScore}/100
Stress Assessment: ${report.stressAssessment}

HIRING RECOMMENDATION
---------------------
Recommendation: ${report.hiringRecommendation}
Probability: ${report.hiringProbability}%
Reasoning: ${report.recommendationReasoning}

STRENGTHS
--------
${report.strengths.map(s => `• ${s}`).join('\n')}

AREAS FOR IMPROVEMENT
--------------------
${report.weaknesses.map(w => `• ${w}`).join('\n')}

KNOWLEDGE GAPS
--------------
${report.knowledgeGaps.map(k => `• ${k}`).join('\n')}

RECOMMENDED LEARNING
-------------------
${report.recommendedLearning.map(r => `• ${r}`).join('\n')}

INTERVIEW TIMELINE
-----------------
${report.interviewTimeline.map(t => `
Question ${t.questionNumber}: ${t.question}
Answer: ${t.answer}
Score: ${t.score}/10
Confidence: ${t.confidence}
Stress: ${t.stressLevel}
Feedback: ${t.feedback}
`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Interview_Report_${report.candidateName.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Hire': return 'bg-green-600';
      case 'Consider': return 'bg-yellow-600';
      case 'Reject': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Generating final recruiter report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
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
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-2xl font-bold">Final AI Recruiter Report</h1>
                  <p className="text-gray-400 text-sm">Professional Evaluation • {report.candidateName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadFinalReport}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Executive Summary */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="w-6 h-6 mr-3 text-purple-400" />
              Executive Summary
            </h2>
            <div className={`px-4 py-2 rounded-lg font-bold ${getRecommendationColor(report.hiringRecommendation)}`}>
              {report.hiringRecommendation}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}%
              </div>
              <div className="text-gray-400">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(report.hiringProbability)}`}>
                {report.hiringProbability}%
              </div>
              <div className="text-gray-400">Hiring Probability</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                {report.interviewTimeline.length}
              </div>
              <div className="text-gray-400">Questions Completed</div>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Recommendation Reasoning:</h3>
            <p className="text-gray-300 leading-relaxed">{report.recommendationReasoning}</p>
          </div>
        </div>

        {/* Performance Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Performance Scores
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Technical Skills</span>
                  <span className={getScoreColor(report.technicalScore)}>{report.technicalScore}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${report.technicalScore}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Communication</span>
                  <span className={getScoreColor(report.communicationScore)}>{report.communicationScore}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${report.communicationScore}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Problem Solving</span>
                  <span className={getScoreColor(report.problemSolvingScore)}>{report.problemSolvingScore}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${report.problemSolvingScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stress Assessment */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-400" />
              Stress Assessment
            </h2>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-4">
                {report.stressAssessment}
              </div>
              <p className="text-gray-300">
                Candidate maintained good composure throughout the interview with minimal stress indicators.
              </p>
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Detected Strengths
            </h2>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Award className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-400" />
              Knowledge Gaps
            </h2>
            <div className="space-y-3">
              {report.knowledgeGaps.map((gap, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Target className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Recommended Learning Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.recommendedLearning.map((topic, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>{topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Timeline */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-400" />
            Interview Replay Timeline
          </h2>
          <div className="space-y-4">
            {report.interviewTimeline.map((item, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {item.questionNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold">Question {item.questionNumber}</h3>
                      <p className="text-sm text-gray-400">{item.question}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(item.score * 10)}`}>
                      {item.score}/10
                    </div>
                    <div className="text-xs text-gray-400">
                      Confidence: {item.confidence} | Stress: {item.stressLevel}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-4 mb-3">
                  <p className="text-sm text-gray-300 italic">{item.answer}</p>
                </div>
                <div className="text-sm text-blue-400">
                  <strong>AI Feedback:</strong> {item.feedback}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalAIRecruiterReport;
