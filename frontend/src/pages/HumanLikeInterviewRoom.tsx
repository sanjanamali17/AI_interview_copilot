import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Brain, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { getNextQuestion, submitAnswer } from '../services/api_production';
import { voiceInterviewService } from '../services/voiceInterviewService';

interface Question {
  question: string;
  question_id: string;
  stage: string;
  difficulty: string;
  type: string;
}

interface InterviewState {
  currentQuestion: Question | null;
  userAnswer: string;
  aiResponse: string;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isSubmitting: boolean;
  isAISpeaking: boolean;
  conversation: Array<{speaker: 'ai' | 'user', text: string, timestamp: string}>;
}

const HumanLikeInterviewRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: null,
    userAnswer: '',
    aiResponse: '',
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    isSubmitting: false,
    isAISpeaking: false,
    conversation: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // Timeout wrapper for API calls
  const fetchWithTimeout = (promise: Promise<any>, timeout = 8000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      )
    ]);
  };

  // Initialize voice interview service
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Set up voice service callbacks
    voiceInterviewService.setUserSpeechCallback((transcript: string) => {
      console.log('🎤 User spoke:', transcript);
      setInterviewState(prev => ({
        ...prev,
        userAnswer: transcript,
        isListening: false,
        conversation: [...prev.conversation, {
          speaker: 'user',
          text: transcript,
          timestamp: new Date().toISOString()
        }]
      }));
    });

    voiceInterviewService.setAISpeechCompleteCallback(() => {
      console.log('🔚 AI finished speaking');
      setInterviewState(prev => ({
        ...prev,
        isAISpeaking: false,
        isListening: false // DO NOT auto-start mic - user controls it
      }));
    });

    // Load first question
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    if (!sessionId || isFetching.current) return;
    
    isFetching.current = true;
    setStatus("Generating next question...");
    setError('');
    
    try {
      console.log('📡 Loading next question...');
      
      // Use timeout wrapper
      const response = await fetchWithTimeout(
        getNextQuestion(sessionId),
        8000 // 8 second timeout
      );
      
      console.log('📩 Next Question:', response);
      
      if (!response || !response.question) {
        throw new Error("Invalid question response");
      }
      
      const question = {
        question: response.question,
        question_id: response.question_id,
        stage: response.stage,
        difficulty: response.difficulty,
        type: response.type
      };
      
      // Combine acknowledgement and question for human-like flow
      const fullText = response.acknowledgement 
        ? `${response.acknowledgement} ${response.question}`
        : response.question;
      
      console.log('✅ Full AI response:', fullText);
      
      // STEP 3: Update UI
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: question,
        conversation: [...prev.conversation, {
          speaker: 'ai',
          text: fullText,
          timestamp: new Date().toISOString()
        }]
      }));

      // STEP 4: Speak the combined text naturally
      await speakQuestion(fullText);
      
    } catch (err: any) {
      console.error("❌ Error:", err);
      
      if (err.message === "Request timeout" && retryCount < 1) {
        // Auto-retry once
        console.log("🔄 Retrying...");
        setRetryCount(prev => prev + 1);
        setStatus("Retrying...");
        
        setTimeout(() => {
          loadNextQuestion();
        }, 1000);
        
      } else {
        setError(err.message || 'Failed to load next question');
        setStatus("⚠️ Unable to load next question. Please click retry.");
      }
    } finally {
      isFetching.current = false;
    }
  };

  const speakQuestion = async (text: string) => {
    setInterviewState(prev => ({
      ...prev,
      isAISpeaking: true,
      isListening: false, // Mic OFF while AI speaks
      isThinking: false
    }));

    setStatus("AI Speaking...");

    try {
      await voiceInterviewService.speak(text);
    } catch (err: any) {
      console.error('❌ Speech synthesis error:', err);
      setError('Failed to speak question');
    } finally {
      setInterviewState(prev => ({
        ...prev,
        isAISpeaking: false,
        isListening: false // DO NOT auto-start mic - user controls it
      }));
      setStatus('');
    }
  };

  const submitUserAnswer = async () => {
    if (!interviewState.userAnswer.trim() || interviewState.isSubmitting) {
      return;
    }

    // Stop listening when submitting
    voiceInterviewService.stopListening();

    // IMMEDIATE loading state
    setInterviewState(prev => ({
      ...prev,
      isSubmitting: true,
      isThinking: true,
      isListening: false,
      isAISpeaking: false
    }));

    setStatus("Analyzing your answer...");
    setError('');

    try {
      console.log("📤 Submitting:", interviewState.userAnswer);
      
      // STEP 1: Submit answer to backend
      const response = await submitAnswer({
        session_id: sessionId!,
        answer: interviewState.userAnswer.trim(),
        question_id: interviewState.currentQuestion?.question_id || ''
      });

      if (response && response.status === 'success') {
        console.log("✅ Answer submitted successfully");
        setRetryCount(0); // Reset retry count
        
        // STEP 2: Clear answer
        setInterviewState(prev => ({
          ...prev,
          userAnswer: '',
          isSubmitting: false
        }));
        
        // STEP 3: ALWAYS call next question
        setStatus("🤖 Generating next question...");
        console.log("📡 Calling next-question API...");
        
        const res = await getNextQuestion(sessionId!);
        console.log("📩 Response:", res);

        // STEP 4: VALIDATE RESPONSE
        if (!res || !res.question) {
          throw new Error("Invalid question response");
        }

        // STEP 5: UPDATE UI
        const question = {
          question: res.question,
          question_id: res.question_id,
          stage: res.stage,
          difficulty: res.difficulty,
          type: res.type
        };
        
        // Combine acknowledgement and question for human-like flow
        const fullText = res.acknowledgement 
          ? `${res.acknowledgement} ${res.question}`
          : res.question;
        
        console.log('✅ Full AI response:', fullText);
        
        setInterviewState(prev => ({
          ...prev,
          currentQuestion: question,
          conversation: [...prev.conversation, {
            speaker: 'ai',
            text: fullText,
            timestamp: new Date().toISOString()
          }]
        }));

        // STEP 6: SPEAK
        await speakQuestion(fullText);
        
      } else {
        throw new Error('Failed to submit answer');
      }
      
    } catch (err: any) {
      console.error("❌ ERROR:", err);
      setError(err.message || 'Failed to submit answer');
      setStatus("⚠️ Failed to load next question");
      
      // HARD FALLBACK - IMPORTANT
      const fallbackQuestion = "Let's move ahead. Can you explain one of your projects?";
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: {
          question: fallbackQuestion,
          question_id: 'fallback_1',
          stage: 'fallback',
          difficulty: 'easy',
          type: 'fallback'
        },
        conversation: [...prev.conversation, {
          speaker: 'ai',
          text: fallbackQuestion,
          timestamp: new Date().toISOString()
        }]
      }));
      
      await speakQuestion(fallbackQuestion);
      
      setInterviewState(prev => ({
        ...prev,
        isSubmitting: false,
        isThinking: false
      }));
    }
  };

  const retryLoadNextQuestion = async () => {
    setRetryCount(0);
    setStatus("Retrying...");
    await loadNextQuestion();
  };

  const startRecording = () => {
    if (interviewState.isAISpeaking) {
      // Don't allow recording while AI is speaking
      return;
    }
    
    voiceInterviewService.startListening();
    setInterviewState(prev => ({ ...prev, isListening: true }));
    setStatus("Listening...");
  };

  const stopRecording = () => {
    voiceInterviewService.stopListening();
    setInterviewState(prev => ({ ...prev, isListening: false }));
    setStatus('');
  };

  const toggleListening = () => {
    if (interviewState.isAISpeaking) {
      // Don't allow interrupting AI speech
      return;
    }

    if (interviewState.isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const stopInterview = () => {
    if (window.confirm('Are you sure you want to end this interview?')) {
      voiceInterviewService.stopSpeaking();
      navigate('/');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'greeting': return 'text-green-400';
      case 'introduction': return 'text-blue-400';
      case 'experience': return 'text-purple-400';
      case 'technical': return 'text-orange-400';
      case 'behavioral': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'greeting': return 'Welcome';
      case 'introduction': return 'Getting to Know You';
      case 'project_deep_dive': return 'Project Discussion';
      case 'project_followup': return 'Project Challenges';
      case 'project_solution': return 'Problem Solving';
      case 'skills_technical': return 'Technical Skills';
      case 'skills_practical': return 'Practical Experience';
      case 'experience_behavioral': return 'Experience & Leadership';
      case 'scenario_problem': return 'Problem Scenarios';
      case 'scenario_priority': return 'Priority Handling';
      case 'behavioral_motivation': return 'Motivation & Fit';
      case 'behavioral_fit': return 'Why You?';
      case 'closing': return 'Final Questions';
      case 'complete': return 'Interview Complete';
      default: return 'Interview';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Initializing interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">AI Interview Room</h1>
              <p className="text-gray-400">
                Session: <span className="text-blue-400 font-mono">{sessionId}</span>
              </p>
            </div>
            <Button
              onClick={stopInterview}
              variant="secondary"
              className="bg-red-600 hover:bg-red-700"
            >
              End Interview
            </Button>
          </div>
        </div>

        {/* Conversation Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Real-time interview conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {interviewState.conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${msg.speaker === 'user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-4`}>
                    <div className="flex items-center mb-2">
                      {msg.speaker === 'user' ? (
                        <Volume2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {msg.speaker === 'user' ? 'You' : 'AI Interviewer'}
                      </span>
                    </div>
                    <p className="text-gray-200">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {interviewState.currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Current Question</CardTitle>
                <div className="flex gap-4">
                  <span className={`text-sm font-medium ${getStageColor(interviewState.currentQuestion.stage)}`}>
                    {getStageLabel(interviewState.currentQuestion.stage)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Brain className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-lg leading-relaxed text-gray-200 flex-1">
                  {interviewState.currentQuestion.question}
                </p>
              </div>
              {interviewState.isSpeaking && (
                <div className="mt-4 flex items-center gap-2 text-blue-400">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>AI is speaking...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Voice Control */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voice Control</CardTitle>
            <CardDescription>
              {interviewState.isAISpeaking 
                ? "AI is speaking, please listen..." 
                : interviewState.isListening 
                  ? "Listening for your response..." 
                  : "Click 'Start Listening' when ready to respond"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-4">
              <Button
                onClick={toggleListening}
                disabled={interviewState.isAISpeaking}
                className={`${
                  interviewState.isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
                size="lg"
              >
                {interviewState.isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>

            {/* User Answer Display */}
            {interviewState.userAnswer && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Your Response:</h3>
                <p className="text-gray-200">{interviewState.userAnswer}</p>
              </div>
            )}

            {/* Status Indicators */}
            {interviewState.isThinking && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <span>{status || "AI is analyzing your response..."}</span>
                </div>
              </div>
            )}

            {interviewState.isAISpeaking && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>AI is speaking...</span>
                </div>
              </div>
            )}

            {status && !interviewState.isThinking && !interviewState.isAISpeaking && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <span>{status}</span>
                </div>
              </div>
            )}

            {/* Retry Button */}
            {status.includes("Failed to load") && (
              <div className="text-center py-4">
                <Button
                  onClick={submitUserAnswer}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Retry Loading Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Answer */}
        <Card>
          <CardContent>
            <Button
              onClick={submitUserAnswer}
              disabled={!interviewState.userAnswer.trim() || interviewState.isSubmitting || interviewState.isThinking}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="lg"
            >
              {interviewState.isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 mr-2" />
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
          <h3 className="text-lg font-medium text-gray-300 mb-3">Structured Interview Flow:</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              AI speaks question → Wait for AI to finish
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Click "Start Listening" → Speak your answer clearly
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Click "Stop Listening" → Then "Submit Answer"
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Follow structured interview stages (Greeting → Introduction → Projects → Skills → Scenarios → Behavioral → Closing)
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Answer based on your resume and experience
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HumanLikeInterviewRoom;
