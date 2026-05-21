import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Clock, Brain, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';
import { Question, Answer, EvaluationScore } from '../services/types';

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [evaluations, setEvaluations] = useState<EvaluationScore[]>([]);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (sessionId) {
      console.log('🎯 InterviewPage loaded with session:', sessionId);
      loadNextQuestion();
    }
  }, [sessionId]);

  const loadNextQuestion = async () => {
    if (!sessionId) return;
    
    console.log('📡 Loading next question for session:', sessionId);
    setLoading(true);
    try {
      // const question = await interviewAPI.getNextQuestion(sessionId);
      // Mock question for now
      const question = {
        question: "Can you explain your experience with machine learning?",
        question_id: "q1",
        stage: "technical",
        difficulty: "intermediate",
        type: "experience"
      };
      console.log('✅ Question loaded:', question);
      setCurrentQuestion(question);
      setTranscript('');
    } catch (err: any) {
      console.error('❌ Failed to load question:', err);
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        // Here you would send the audio file for transcription
        // For now, we'll simulate transcription
        setTranscript("This is a simulated transcript of the voice answer.");
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !sessionId) return;
    
    const answerToSend = transcript || answerText;
    if (!answerToSend.trim()) {
      setError('Please provide an answer');
      return;
    }

    setLoading(true);
    try {
      console.log('✅ Answer submitted successfully');
      // Mock submission success
      setAnswerText('');
      loadNextQuestion();
        await loadNextQuestion();
      } else {
        navigate(`/dashboard/${sessionId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.overall_score, 0);
    return (total / evaluations.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-primary-400" />
            AI Interview in Progress
          </h1>
          <p className="text-dark-300">
            Question {questionNumber} • Average Score: {getAverageScore()}/10
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Question */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary-400" />
                  Interview Question
                </CardTitle>
                <CardDescription>
                  {currentQuestion?.category} • {currentQuestion?.difficulty}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
                    <p className="text-dark-300 mt-4">Loading question...</p>
                  </div>
                ) : currentQuestion ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-dark-700/50 rounded-lg border border-dark-600">
                      <p className="text-lg text-white leading-relaxed">
                        {currentQuestion.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-dark-400">
                      <span>Category: {currentQuestion.category}</span>
                      <span>Difficulty: {currentQuestion.difficulty}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-dark-300">No question available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Answer */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Answer</CardTitle>
                <CardDescription>
                  Provide your response via voice or text
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Voice Recording */}
                  <div className="text-center">
                    <Button
                      variant={isRecording ? "danger" : "secondary"}
                      size="lg"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={loading}
                      className="w-full"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Voice Recording
                        </>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <div className="mt-4 flex items-center justify-center text-danger-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(recordingTime)}
                      </div>
                    )}
                  </div>

                  {/* Transcript Display */}
                  {transcript && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-300 mb-2">Voice Transcript:</h4>
                      <div className="p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                        <p className="text-white">{transcript}</p>
                      </div>
                    </div>
                  )}

                  {/* Text Answer */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Or type your answer:</h4>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32 resize-none"
                      placeholder="Type your answer here..."
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={submitAnswer}
                    loading={loading}
                    disabled={!answerText.trim() && !transcript}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6">
            <Card variant="bordered" className="border-danger-500/50">
              <CardContent className="text-center">
                <p className="text-danger-400">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress */}
        <div className="mt-8">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-dark-300">Interview Progress</span>
                <span className="text-primary-400 font-semibold">Question {questionNumber}</span>
              </div>
              <div className="mt-2 w-full bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((questionNumber / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
