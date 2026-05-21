import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Send, Clock, Brain, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { startInterview, uploadResume, uploadJobDescription, getNextQuestion, submitAnswer } from '../services/api_production';
import { voiceService } from '../services/voiceService';

interface Question {
  question: string;
  question_id: string;
  stage: string;
  difficulty: string;
  type: string;
}

interface Answer {
  answer: string;
  question_id: string;
  timestamp: string;
}

interface InterviewSession {
  session_id: string;
  candidate_name: string;
  position: string;
  resume_data: any;
  job_description: any;
  questions_asked: Question[];
  answers_received: Answer[];
  current_stage: string;
}

const InterviewRoomProduction: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // State management - PRODUCTION READY
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<InterviewSession | null>(null);
  
  // Prevent duplicate API calls
  const hasFetchedQuestion = useRef(false);
  const hasInitializedSession = useRef(false);
  const currentQuestionRef = useRef<Question | null>(null);

  // Initialize session
  useEffect(() => {
    if (hasInitializedSession.current || !sessionId) return;
    hasInitializedSession.current = true;
    
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load first question
      if (!hasFetchedQuestion.current) {
        hasFetchedQuestion.current = true;
        await fetchNextQuestion();
      }
      
    } catch (err: any) {
      console.error('❌ Error initializing session:', err);
      setError(err.message || 'Failed to initialize session');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Loading next question...');
      
      const response = await getNextQuestion(sessionId);
      
      if (response && response.status === 'success' && response.question) {
        const question = {
          question: response.question,
          question_id: response.question_id,
          stage: response.stage,
          difficulty: response.difficulty,
          type: response.type
        };
        console.log('✅ Next question received:', question);
        
        // Store question in multiple places for consistency
        setCurrentQuestion(question);
        currentQuestionRef.current = question;
        
        // Speak question (voice synthesis)
        if (voiceService.isVoiceSupported() && question.question) {
          try {
            setIsSpeaking(true);
            await voiceService.speak(question.question);
            console.log('🔊 Question spoken successfully');
          } catch (voiceError) {
            console.error('❌ Voice synthesis error:', voiceError);
            // Continue without voice - not critical
          } finally {
            setIsSpeaking(false);
          }
        }
      } else {
        throw new Error('Invalid question response from server');
      }
      
    } catch (err: any) {
      console.error('❌ Error loading next question:', err);
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!voiceService.isVoiceSupported()) {
      setError('Voice recognition not supported in this browser');
      return;
    }
    
    if (isRecording) {
      console.warn('⚠️ Already recording');
      return;
    }
    
    setIsRecording(true);
    setTranscript('');
    setError('');
    
    try {
      console.log('🎤 Starting voice recording...');
      
      // Set up voice service callback for FINAL TRANSCRIPT ONLY
      voiceService.onInterimResult = (finalTranscript: string) => {
        console.log('📝 Final transcript captured:', finalTranscript);
        setTranscript(finalTranscript);
      };
      
      await voiceService.startListening();
      console.log('✅ Voice recording started');
      
    } catch (err: any) {
      console.error('❌ Error starting recording:', err);
      setError('Failed to start voice recording. Please use text input.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) {
      console.warn('⚠️ Not recording');
      return;
    }
    
    setIsRecording(false);
    
    try {
      console.log('🛑 Stopping voice recording...');
      
      // Stop recording and get final transcript
      const finalTranscript = await voiceService.stopListening();
      console.log('📝 Final transcript:', finalTranscript);
      
      // Ensure transcript is saved
      if (finalTranscript && finalTranscript.trim().length > 0) {
        setTranscript(finalTranscript);
      }
      
    } catch (err: any) {
      console.error('❌ Error stopping recording:', err);
      setError('Failed to stop recording');
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestionRef.current || isSubmitting) {
      console.warn('⚠️ Cannot submit - no question or already submitting');
      return;
    }
    
    const answer = transcript || answerText;
    
    // Enhanced validation
    if (!answer || answer.trim().length < 5) {
      setError('Please provide a more detailed answer (at least 5 characters)');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('📤 Submitting answer:', answer);
      
      // Step 1: Submit answer
      await submitAnswer({
        session_id: sessionId!,
        answer: answer.trim(),
        question_id: currentQuestionRef.current!.question_id
      });
      
      console.log('✅ Answer submitted successfully');
      
      // Step 2: Clear current answer
      setAnswerText('');
      setTranscript('');
      
      // Step 3: Load next question after successful submission
      setTimeout(() => {
        fetchNextQuestion();
      }, 1000); // Small delay for better UX
      console.error('❌ Error submitting answer:', err);
      setError(err.message || 'Failed to submit answer');
    } catch (error: any) {
      console.error('❌ Error submitting answer:', error);
      setError(error.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const endInterview = () => {
    if (window.confirm('Are you sure you want to end this interview?')) {
      navigate('/');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'greeting': return 'text-green-400';
      case 'introduction': return 'text-blue-400';
      case 'technical': return 'text-purple-400';
      case 'behavioral': return 'text-orange-400';
      case 'follow_up': return 'text-pink-400';
      case 'closing': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">AI Interview Room</h1>
              <p className="text-gray-400">
                Session: <span className="text-blue-400 font-mono">{sessionId}</span>
              </p>
              {sessionData && (
                <p className="text-gray-400">
                  Candidate: <span className="text-green-400">{sessionData.candidate_name}</span> | 
                  Position: <span className="text-yellow-400">{sessionData.position}</span>
                </p>
              )}
            </div>
            <Button
              onClick={endInterview}
              variant="secondary"
              className="bg-red-600 hover:bg-red-700"
            >
              End Interview
            </Button>
          </div>
        </div>

        {/* Question Display */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Interview Question</CardTitle>
                <div className="flex gap-4">
                  <span className={`text-sm font-medium ${getStageColor(currentQuestion.stage)}`}>
                    {currentQuestion.stage}
                  </span>
                  <span className={`text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Brain className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-lg leading-relaxed text-gray-200">
                  {currentQuestion.question}
                </p>
              </div>
              {isSpeaking && (
                <div className="mt-4 flex items-center gap-2 text-blue-400">
                  <div className="animate-pulse">🔊 Speaking...</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Voice Recording Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voice Recording</CardTitle>
            <CardDescription>
              Click the microphone to start recording your answer. Speak clearly and naturally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recording Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button
                    onClick={startRecording}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Your Answer (Voice):</h3>
                  <p className="text-gray-200 whitespace-pre-wrap">{transcript}</p>
                </div>
              )}

              {/* Text Input Fallback */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Or Type Your Answer:</h3>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent>
            <Button
              onClick={submitAnswer}
              disabled={isSubmitting || (!transcript && !answerText.trim())}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mt-4">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Interview Tips:</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Speak clearly and at a moderate pace
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Provide detailed, specific examples
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Use the STAR method for behavioral questions
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Take your time to think before answering
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoomProduction;
