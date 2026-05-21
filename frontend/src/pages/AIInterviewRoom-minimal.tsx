import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AIInterviewRoom: React.FC = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get session ID from URL
  useEffect(() => {
    const pathParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = pathParams.get('session_id');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
    }
  }, []);

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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interview Session: {sessionId}
            </h2>
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
              <p className="text-gray-800">
                Welcome to your AI Interview! Your session is ready.
              </p>
            </div>
            
            {loading && (
              <div className="text-center mt-4">
                <p className="text-gray-600">Loading...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 p-4 rounded-lg mt-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewRoom;
