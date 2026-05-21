/**
 * AI Interview Page v5 - Production-ready voice interview experience
 * Human-like AI recruiter with voice interaction and real-time analytics
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Volume2, VolumeX, Brain, MessageSquare, TrendingUp } from 'lucide-react';
import { interviewAPI } from '../services/api';
import { voiceService } from '../services/voiceService';
import { AIInterviewerService, InterviewContext, CandidateResponse } from '../services/aiInterviewerService';
import { stressDetectionService, StressAnalysis } from '../services/stressDetectionService';
import { skillIntelligenceService, SkillAssessment } from '../services/skillIntelligenceService';
import { candidateIntelligenceService, CandidateDigitalTwin } from '../services/candidateIntelligenceService';
import { InterviewDashboard } from '../components/InterviewDashboard';

const InterviewPageV5: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [candidateName, setCandidateName] = useState('Sanjana Mali');
  const [position, setPosition] = useState('Data Scientist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Voice interaction state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [answerText, setAnswerText] = useState('');
  
  // AI Interviewer
  const [aiInterviewer, setAiInterviewer] = useState<AIInterviewerService | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  
  // Analytics
  const [showDashboard, setShowDashboard] = useState(false);
  const [interviewMetrics, setInterviewMetrics] = useState({
    questionCount: 0,
    avgResponseTime: 0,
    confidenceScore: 0,
    stressLevel: 'moderate' as 'low' | 'moderate' | 'high',
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    skillAssessments: [] as SkillAssessment[],
    stressAnalysis: null as StressAnalysis | null,
    candidateProfile: null as CandidateDigitalTwin | null
  });

  const responseStartTime = useRef<number>(0);
  const questionStartTime = useRef<number>(0);

  useEffect(() => {
    if (sessionId) {
      console.log('🎯 InterviewPage v5 loaded with session:', sessionId);
      
      // Initialize AI Interviewer
      const context: InterviewContext = {
        candidateName,
        position,
        resumeSkills: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics'],
        currentQuestionIndex: 0,
        totalQuestions: 10,
        previousAnswers: [],
        detectedWeaknesses: [],
        detectedStrengths: []
      };
      
      const interviewer = new AIInterviewerService(context);
      setAiInterviewer(interviewer);
      
      // Start interview
      startInterview();
    }
  }, [sessionId]);

  useEffect(() => {
    // Setup voice service callbacks
    voiceService.onInterimResult = (transcript: string) => {
      setInterimTranscript(transcript);
    };
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      // Generate AI greeting
      if (aiInterviewer) {
        const greeting = aiInterviewer.generateGreeting();
        console.log('🤖 AI Greeting:', greeting.text);
        
        // Speak greeting
        setIsSpeaking(true);
        await voiceService.speak(greeting.text);
        setIsSpeaking(false);
        
        // Load first question
        await loadNextQuestion();
      }
    } catch (err: any) {
      console.error('❌ Failed to start interview:', err);
      setError(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    if (!sessionId) return;
    
    console.log('📡 Loading next question for session:', sessionId);
    setLoading(true);
    questionStartTime.current = Date.now();
    
    try {
      const question = await interviewAPI.getNextQuestion(sessionId);
      console.log('✅ Question loaded:', question);
      setCurrentQuestion(question);
      setTranscript('');
      setInterimTranscript('');
      setAnswerText('');
      
      // Speak the question
      if (question && question.text) {
        setIsSpeaking(true);
        await voiceService.speak(question.text);
        setIsSpeaking(false);
      }
      
      setInterviewMetrics(prev => ({
        ...prev,
        questionCount: prev.questionCount + 1
      }));
      
    } catch (err: any) {
      console.error('❌ Failed to load question:', err);
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    if (!voiceService.isVoiceSupported()) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
    responseStartTime.current = Date.now();
    
    try {
      const transcript = await voiceService.listen();
      setTranscript(transcript);
      setAnswerText(transcript);
      setIsListening(false);
      
      // Analyze response
      const responseTime = (Date.now() - responseStartTime.current) / 1000;
      if (aiInterviewer) {
        const analysis = aiInterviewer.analyzeResponse(transcript, responseTime);
        console.log('🧠 Response Analysis:', analysis);
        
        // Perform comprehensive stress analysis
        const stressAnalysis = stressDetectionService.analyzeTextStress(transcript, responseTime);
        console.log('😰 Stress Analysis:', stressAnalysis);
        
        // Perform skill intelligence analysis
        const skillAssessments = skillIntelligenceService.analyzeSkills('', [transcript], position);
        console.log('🎯 Skill Assessments:', skillAssessments);
        
        // Update comprehensive metrics
        setInterviewMetrics(prev => ({
          ...prev,
          avgResponseTime: (prev.avgResponseTime * prev.questionCount + responseTime) / (prev.questionCount + 1),
          confidenceScore: analysis.confidence * 100,
          stressLevel: stressAnalysis.overallStressLevel,
          technicalScore: skillAssessments.find(s => s.skill === 'Python')?.currentLevel || 0,
          communicationScore: stressAnalysis.confidenceScore,
          problemSolvingScore: analysis.confidence * 80,
          skillAssessments,
          stressAnalysis
        }));
        
        // Submit answer to backend
        await submitAnswer(transcript, responseTime, analysis, stressAnalysis, skillAssessments);
      }
      
    } catch (err: any) {
      console.error('❌ Voice recognition error:', err);
      setError(err.message || 'Voice recognition failed');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const submitAnswer = async (answer: string, responseTime: number, analysis: CandidateResponse, stressAnalysis: StressAnalysis, skillAssessments: SkillAssessment[]) => {
    if (!sessionId || !currentQuestion) return;
    
    setLoading(true);
    try {
      console.log('📤 Submitting answer:', answer);
      
      const response = await interviewAPI.submitAnswer(
        sessionId,
        currentQuestion.id || '1',
        answer,
        responseTime
      );
      
      console.log('✅ Answer submitted:', response);
      
      // Generate AI feedback
      if (aiInterviewer) {
        const answerStrength = analysis.confidence > 0.7 ? 'strong' : 
                             analysis.confidence > 0.5 ? 'moderate' : 'weak';
        
        const feedback = aiInterviewer.generateFeedback(answerStrength);
        console.log('💬 AI Feedback:', feedback.text);
        
        // Speak feedback
        setIsSpeaking(true);
        await voiceService.speak(feedback.text);
        setIsSpeaking(false);
        
        // Generate candidate digital twin profile
        const candidateProfile = candidateIntelligenceService.generateDigitalTwin(
          candidateName,
          position,
          { responses: [{ answer, question: currentQuestion.text }] },
          skillAssessments,
          stressAnalysis
        );
        
        console.log('👤 Candidate Profile:', candidateProfile);
        
        // Update metrics with candidate profile
        setInterviewMetrics(prev => ({
          ...prev,
          candidateProfile
        }));
        
        // Load next question or end interview
        if (interviewMetrics.questionCount < 8) {
          setTimeout(() => loadNextQuestion(), 2000);
        } else {
          endInterview();
        }
      }
      
    } catch (err: any) {
      console.error('❌ Failed to submit answer:', err);
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    console.log('🏁 Ending interview');
    
    if (aiInterviewer) {
      const summary = aiInterviewer.generateSummary();
      console.log('📊 Interview Summary:', summary);
      
      // Navigate to final report
      navigate(`/final-report/${sessionId}`, { state: { summary } });
    }
  };

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  if (showDashboard) {
    return <InterviewDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">AI Interview Session</h1>
                <p className="text-gray-400 text-sm">Session: {sessionId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Live Metrics */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{interviewMetrics.questionCount}</div>
                  <div className="text-gray-400">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{Math.round(interviewMetrics.confidenceScore)}%</div>
                  <div className="text-gray-400">Confidence</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    interviewMetrics.stressLevel === 'low' ? 'text-green-400' :
                    interviewMetrics.stressLevel === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {interviewMetrics.stressLevel}
                  </div>
                  <div className="text-gray-400">Stress</div>
                </div>
              </div>
              
              {/* Controls */}
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Exit Interview
              </button>
              
              <button
                onClick={toggleDashboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading interview...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {!loading && !error && currentQuestion && (
          <div className="space-y-8">
            
            {/* AI Interviewer Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AI Interviewer</h2>
                    <p className="text-gray-400 text-sm">Technical Recruiter</p>
                  </div>
                </div>
                
                {isSpeaking && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                <p className="text-lg leading-relaxed">
                  {currentQuestion.text || "Loading question..."}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Question {interviewMetrics.questionCount} of 10</span>
                <span>Technical Assessment</span>
              </div>
            </div>

            {/* Candidate Response Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Your Response</h2>
                    <p className="text-gray-400 text-sm">{candidateName}</p>
                  </div>
                </div>
                
                {isListening && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <Mic className="w-5 h-5 animate-pulse" />
                    <span className="text-sm">Recording...</span>
                  </div>
                )}
              </div>
              
              {/* Voice Recording Interface */}
              <div className="space-y-6">
                {/* Transcript Display */}
                {(transcript || interimTranscript) && (
                  <div className="bg-gray-900/50 rounded-lg p-6">
                    <div className="text-sm text-gray-400 mb-2">Transcript:</div>
                    <div className="text-white">
                      {transcript}
                      {interimTranscript && (
                        <span className="text-gray-400 italic">{interimTranscript}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Voice Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      disabled={isSpeaking}
                      className="flex items-center space-x-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-xl transition-all transform hover:scale-105 disabled:scale-100"
                    >
                      <Mic className="w-6 h-6" />
                      <span className="font-medium">Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="flex items-center space-x-3 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl transition-all transform hover:scale-105 animate-pulse"
                    >
                      <MicOff className="w-6 h-6" />
                      <span className="font-medium">Stop Recording</span>
                    </button>
                  )}
                  
                  {/* Manual text input fallback */}
                  <button
                    onClick={() => {
                      // Show text input area
                      const textArea = document.getElementById('manual-answer');
                      if (textArea) {
                        textArea.classList.toggle('hidden');
                      }
                    }}
                    className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Manual Answer Input */}
                <textarea
                  id="manual-answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none"
                />
                
                {answerText && (
                  <button
                    onClick={() => {
                      const responseTime = 30;
                      const analysis = aiInterviewer?.analyzeResponse(answerText, responseTime)!;
                      const stressAnalysis = stressDetectionService.analyzeTextStress(answerText, responseTime);
                      const skillAssessments = skillIntelligenceService.analyzeSkills('', [answerText], position);
                      
                      submitAnswer(answerText, responseTime, analysis, stressAnalysis, skillAssessments);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPageV5;
