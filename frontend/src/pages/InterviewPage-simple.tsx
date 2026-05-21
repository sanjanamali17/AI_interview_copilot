import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';

const InterviewPageSimple: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const question = await interviewAPI.getNextQuestion(sessionId);
      console.log('✅ Question loaded:', question);
      setCurrentQuestion(question);
    } catch (err: any) {
      console.error('❌ Failed to load question:', err);
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a2e', 
      color: 'white', 
      padding: '50px',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/upload')}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Upload
        </button>
      </div>

      <h1>AI Interview Session</h1>
      <p>Session ID: {sessionId}</p>

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <p>Loading question...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          padding: '10px', 
          margin: '20px 0', 
          borderRadius: '5px' 
        }}>
          Error: {error}
        </div>
      )}

      {currentQuestion && (
        <div style={{ 
          backgroundColor: '#2a2a3e', 
          padding: '30px', 
          margin: '20px 0', 
          borderRadius: '10px',
          border: '1px solid #3b82f6'
        }}>
          <h2>Question {currentQuestion.question_number || 1}</h2>
          <p style={{ fontSize: '18px', marginTop: '15px' }}>
            {currentQuestion.question_text || currentQuestion.text || 'No question text available'}
          </p>
          
          <div style={{ marginTop: '30px' }}>
            <textarea 
              placeholder="Type your answer here..."
              style={{
                backgroundColor: '#1a1a2e',
                color: 'white',
                padding: '15px',
                border: '1px solid #3b82f6',
                borderRadius: '5px',
                width: '100%',
                height: '150px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={loadNextQuestion}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '10px'
              }}
            >
              Submit Answer
            </button>
            
            <button 
              onClick={loadNextQuestion}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Next Question
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !currentQuestion && (
        <div style={{ marginTop: '20px' }}>
          <p>No question loaded. Click "Next Question" to load the first question.</p>
          <button 
            onClick={loadNextQuestion}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            Load First Question
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPageSimple;
