import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import HumanLikeInterviewRoom from './pages/HumanLikeInterviewRoom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<ResumeUploadPage />} />
          <Route path="/interview/:sessionId" element={<HumanLikeInterviewRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
