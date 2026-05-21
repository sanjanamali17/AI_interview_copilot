/**
 * Home Page - AI Interview Copilot v5
 * Functional AI interview platform entry point
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mic, BarChart3, FileText, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    console.log('🚀 Starting AI Interview flow...');
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">AI Interview Copilot v5</h1>
                <p className="text-gray-400 text-sm">Autonomous Multi-Agent AI Recruiter</p>
              </div>
            </div>
            <button
              onClick={handleStartInterview}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start AI Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI-Powered Interview System
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of hiring with our autonomous AI recruiter. 
            Conduct voice-based interviews with real-time analysis and professional evaluation.
          </p>
          
          <button
            onClick={handleStartInterview}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-105 text-lg font-semibold flex items-center space-x-3 mx-auto"
          >
            <Brain className="w-6 h-6" />
            <span>Start AI Interview</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <Mic className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Voice Interview</h3>
            <p className="text-gray-400 text-sm">
              Natural conversation with AI recruiter using voice interaction and real-time transcription.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Analytics</h3>
            <p className="text-gray-400 text-sm">
              Real-time performance tracking with stress detection and confidence scoring.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            <FileText className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Skill Analysis</h3>
            <p className="text-gray-400 text-sm">
              Comprehensive technical assessment with digital twin profiling.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-colors">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Reports</h3>
            <p className="text-gray-400 text-sm">
              Professional hiring recommendations with detailed evaluation reports.
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">Ready to Begin?</h3>
          <div className="text-center">
            <p className="text-gray-300 mb-8">
              Upload your resume and start your AI-powered interview immediately.
              The system will guide you through a professional evaluation process.
            </p>
            <button
              onClick={handleStartInterview}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all transform hover:scale-105 text-lg font-semibold"
            >
              Start AI Interview Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
