import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';

const UploadPageSimple: React.FC = () => {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [jobDescription] = useState('Data Scientist responsibilities and duties...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartInterview = async () => {
    console.log('🚀 Starting interview...');
    console.log('📋 Candidate:', candidateName);
    console.log('💼 Position:', position);
    
    if (!candidateName || !position) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📡 Calling API: /start-interview');
      
      // Call the backend API
      const response = await interviewAPI.startInterview(
        candidateName,
        position,
        undefined, // resume file (optional)
        jobDescription
      );

      console.log('✅ API Response:', response);
      console.log('🆔 Session ID:', response.session_id);

      // Navigate to interview page with session ID
      navigate(`/interview/${response.session_id}`);
      
    } catch (err: any) {
      console.error('❌ API Error:', err);
      setError(`Failed to start interview: ${err.message || 'Unknown error'}`);
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
      <h1>Start AI Interview</h1>
      <p>This is the upload page. If you see this, navigation is working.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Candidate Information</h3>
        <input 
          type="text" 
          placeholder="Candidate Name" 
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          style={{ 
            backgroundColor: '#2a2a3e', 
            color: 'white', 
            padding: '10px', 
            margin: '10px', 
            border: '1px solid #3b82f6',
            borderRadius: '5px',
            width: '300px'
          }} 
        />
        <br />
        <input 
          type="text" 
          placeholder="Position" 
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{ 
            backgroundColor: '#2a2a3e', 
            color: 'white', 
            padding: '10px', 
            margin: '10px', 
            border: '1px solid #3b82f6',
            borderRadius: '5px',
            width: '300px'
          }} 
        />
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px' 
        }}>
          {error}
        </div>
      )}

      <button 
        onClick={handleStartInterview}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#6b7280' : '#3b82f6',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        {loading ? 'Starting Interview...' : 'Start Interview'}
      </button>
    </div>
  );
};

export default UploadPageSimple;
