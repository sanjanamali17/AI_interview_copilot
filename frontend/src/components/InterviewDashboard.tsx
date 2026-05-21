/**
 * Real-time Interview Dashboard - AI Interview Copilot v5
 * Live recruiter dashboard with real-time analytics
 */

import React, { useState, useEffect } from 'react';
import { Brain, Mic, MicOff, Clock, TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface LiveMetrics {
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceLevel: number;
  stressLevel: 'low' | 'moderate' | 'high';
  hiringProbability: number;
  interviewStage: 'greeting' | 'technical' | 'behavioral' | 'closing';
  currentQuestion: string;
  candidateResponse: string;
  responseTime: number;
}

interface SkillGraph {
  skill: string;
  level: number;
  category: 'technical' | 'soft' | 'domain';
}

export const InterviewDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    confidenceLevel: 0,
    stressLevel: 'moderate',
    hiringProbability: 0,
    interviewStage: 'greeting',
    currentQuestion: '',
    candidateResponse: '',
    responseTime: 0
  });

  const [skillGraph, setSkillGraph] = useState<SkillGraph[]>([
    { skill: 'Python', level: 0, category: 'technical' },
    { skill: 'Machine Learning', level: 0, category: 'technical' },
    { skill: 'System Design', level: 0, category: 'technical' },
    { skill: 'Communication', level: 0, category: 'soft' },
    { skill: 'Problem Solving', level: 0, category: 'soft' },
    { skill: 'Data Analysis', level: 0, category: 'domain' }
  ]);

  const [isLive, setIsLive] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update metrics with realistic variations
      setMetrics(prev => ({
        ...prev,
        technicalScore: Math.min(100, prev.technicalScore + (Math.random() - 0.3) * 5),
        communicationScore: Math.min(100, prev.communicationScore + (Math.random() - 0.2) * 3),
        problemSolvingScore: Math.min(100, prev.problemSolvingScore + (Math.random() - 0.3) * 4),
        confidenceLevel: Math.max(0, Math.min(100, prev.confidenceLevel + (Math.random() - 0.4) * 6)),
        hiringProbability: Math.min(95, Math.max(5, 
          (prev.technicalScore * 0.4 + prev.communicationScore * 0.3 + prev.problemSolvingScore * 0.3) * 0.9
        ))
      }));

      // Update skill graph
      setSkillGraph(prev => prev.map(skill => ({
        ...skill,
        level: Math.min(100, Math.max(0, skill.level + (Math.random() - 0.3) * 8))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">AI Interview Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isLive ? 'text-green-400' : 'text-gray-400'}`}>
              <Activity className="w-5 h-5" />
              <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLive ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Metrics Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-time Scores */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Live Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.technicalScore)}`}>
                  {Math.round(metrics.technicalScore)}%
                </div>
                <div className="text-sm text-gray-400">Technical</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.communicationScore)}`}>
                  {Math.round(metrics.communicationScore)}%
                </div>
                <div className="text-sm text-gray-400">Communication</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.problemSolvingScore)}`}>
                  {Math.round(metrics.problemSolvingScore)}%
                </div>
                <div className="text-sm text-gray-400">Problem Solving</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.confidenceLevel)}`}>
                  {Math.round(metrics.confidenceLevel)}%
                </div>
                <div className="text-sm text-gray-400">Confidence</div>
              </div>
            </div>
          </div>

          {/* Current Interview Status */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Interview Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Stage:</span>
                <span className="font-medium capitalize">{metrics.interviewStage}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Stress Level:</span>
                <span className={`font-medium capitalize ${getStressColor(metrics.stressLevel)}`}>
                  {metrics.stressLevel}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Hiring Probability:</span>
                <span className={`font-bold ${getScoreColor(metrics.hiringProbability)}`}>
                  {Math.round(metrics.hiringProbability)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time:</span>
                <span className="font-medium">{metrics.responseTime}s</span>
              </div>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mic className="w-5 h-5 mr-2 text-blue-400" />
              Live Transcript
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-blue-400 mb-2">AI Interviewer:</div>
                <div>{metrics.currentQuestion || "Waiting for next question..."}</div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-green-400 mb-2">Candidate:</div>
                <div>{transcript || metrics.candidateResponse || "Listening..."}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Panel */}
        <div className="space-y-6">
          
          {/* Skill Graph */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Skill Intelligence</h2>
            
            <div className="space-y-3">
              {skillGraph.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-xs text-gray-400">{Math.round(skill.level)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getSkillColor(skill.level)}`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Questions Asked</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="font-medium">24s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Interview Time</span>
                <span className="font-medium">18:42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Detected Strengths</span>
                <span className="font-medium text-green-400">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Knowledge Gaps</span>
                <span className="font-medium text-orange-400">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
