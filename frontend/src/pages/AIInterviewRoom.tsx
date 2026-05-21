import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextQuestion, submitAnswer } from '../services/api';
import { voiceService } from '../services/voiceService';

interface Question {
  question: string;
  question_id: string;
  stage: string;
  difficulty: string;
  type: string;
}

interface InterviewState {
  currentQuestion: Question | null;
  stage: string;
  questionNumber: number;
}

const AIInterviewRoom: React.FC = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('');
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: null,
    stage: 'introduction',
    questionNumber: 1
  });
  const [transcript, setTranscript] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const hasFetched = useRef(false);

  const responseStartTime = useRef<number>(Date.now());

  // Get session ID from URL
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const pathParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = pathParams.get('session_id');
    if (sessionIdFromUrl && !isInitialized) {
      setSessionId(sessionIdFromUrl);
      setIsInitialized(true);
      fetchFirstQuestion();
    }
  }, []);

  // Fetch first question from API
  const fetchFirstQuestion = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Fetching first question from API...');
      
      const questionData = await getNextQuestion(sessionId);
      
      console.log('✅ First question received:', questionData);
      
      setInterviewState({
        currentQuestion: questionData,
        stage: 'introduction',
        questionNumber: 1
      });
      
      // Speak the question
      if (voiceService.isVoiceSupported()) {
        await voiceService.speak(questionData.question);
      }
      
      console.log('✅ First question set and spoken');
      
    } catch (error) {
      console.error('❌ Error fetching first question:', error);
      setError('Failed to load question. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!sessionId || !interviewState.currentQuestion || isSubmitting) {
      console.log('🚫 Cannot submit - missing data or already submitting');
      return;
    }
    
    const answer = transcript || textAnswer;
    
    if (!answer || answer.trim().length < 10) {
      setError('Please speak clearly for at least 10 characters');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('📤 Submitting answer:', answer);
      
      // Step 1: Submit answer
      const result = await submitAnswer(sessionId, answer);
      console.log('✅ Answer submitted:', result);
      
      // Step 2: Wait for success, then load next question
      fetchNextQuestion();
      
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      setError('Submission failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load next question
  const fetchNextQuestion = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Loading next question...');
      
      const questionData = await getNextQuestion(sessionId);
      
      console.log('✅ Next question received:', questionData);
      
      // Update UI with new question
      setInterviewState(prev => ({
        currentQuestion: questionData,
        stage: 'interview',
        questionNumber: prev.questionNumber + 1
      }));
      
      // Speak the question
      if (voiceService.isVoiceSupported()) {
        await voiceService.speak(questionData.question);
      }
      
    } catch (error) {
      console.error('❌ Error loading next question:', error);
      setError('Failed to load question. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!voiceService.isVoiceSupported()) {
      setError('Voice recognition not supported');
      return;
    }
    
    setIsListening(true);
    setTranscript('');
    setError('');
    
    try {
      // Set callback for transcript updates
      voiceService.onInterimResult = (transcript: string) => {
        setTranscript(transcript);
      };
      
      await voiceService.startListening();
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setError('Failed to start recording');
      setIsListening(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      await voiceService.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
    }
  };

  // End interview
  const endInterview = () => {
    navigate('/');
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Session</h2>
          <p className="text-gray-600 mb-4">No session ID provided</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">AI Interview Room</h1>
            <button
              onClick={endInterview}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      {/* Interview Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Current Question */}
            {interviewState.currentQuestion && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Question {interviewState.questionNumber}
                </h2>
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                  <p className="text-gray-800">{interviewState.currentQuestion.question}</p>
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              {/* Voice Recording */}
              <div className="text-center">
                {isListening ? (
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-red-800 font-medium mb-2">🎤 Recording...</p>
                    <p className="text-gray-600">Speak clearly into your microphone</p>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    🎤 Start Recording
                  </button>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Transcript:</h3>
                  <p className="text-gray-700">{transcript}</p>
                </div>
              )}

              {/* Text Answer Input */}
              <div>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !transcript || !textAnswer}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="text-center">
                  <p className="text-gray-600">Loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewRoom;
