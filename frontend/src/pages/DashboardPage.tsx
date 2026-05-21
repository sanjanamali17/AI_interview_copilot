import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Users, TrendingUp, Clock, ArrowLeft, BarChart3, Activity, AlertCircle, Target } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';
import { DashboardData } from '../services/types';

const DashboardPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadDashboardData();
    }
  }, [sessionId]);

  useEffect(() => {
    let interval: number;
    if (autoRefresh && sessionId) {
      interval = setInterval(loadDashboardData, 3000); // Refresh every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, sessionId]);

  const loadDashboardData = async () => {
    if (!sessionId) return;
    
    try {
      // const data = await interviewAPI.getDashboard(sessionId);
      // Mock data for now
      const data = {
        totalQuestions: 15,
        answeredQuestions: 12,
        averageResponseTime: 45,
        technicalScore: 8.5,
        communicationScore: 7.2,
        problemSolvingScore: 8.8,
        overallScore: 8.2,
        status: 'in_progress'
      };
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-400';
    if (score >= 6) return 'text-warning-400';
    return 'text-danger-400';
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success-400';
      case 'moderate': return 'text-warning-400';
      case 'high': return 'text-danger-400';
      default: return 'text-dark-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-success-400" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-danger-400 rotate-180" />;
      default: return <div className="w-4 h-4 text-warning-400">—</div>;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'strong_hire':
      case 'hire':
        return 'bg-success-500/20 border-success-500/50 text-success-400';
      case 'consider':
      case 'borderline':
        return 'bg-warning-500/20 border-warning-500/50 text-warning-400';
      case 'reject':
      case 'unlikely_hire':
        return 'bg-danger-500/20 border-danger-500/50 text-danger-400';
      default:
        return 'bg-dark-500/20 border-dark-500/50 text-dark-400';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Brain className="w-8 h-8 mr-3 text-primary-400" />
              Live Interview Dashboard
            </h1>
            <p className="text-dark-300 mt-1">
              {dashboardData?.candidate_name} • {dashboardData?.position}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-success-400' : 'text-dark-400'}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button onClick={() => navigate(`/final-report/${sessionId}`)}>
              View Final Report
            </Button>
          </div>
        </div>

        {error && (
          <Card variant="bordered" className="border-danger-500/50 mb-6">
            <CardContent className="flex items-center">
              <AlertCircle className="w-5 h-5 text-danger-400 mr-2" />
              <span className="text-danger-400">{error}</span>
            </CardContent>
          </Card>
        )}

        {dashboardData && (
          <div className="space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Technical Score */}
              <Card className="text-center">
                <CardContent className="py-6">
                  <div className={`text-4xl font-bold ${getScoreColor(dashboardData.live_scores.technical)}`}>
                    {dashboardData.live_scores.technical.toFixed(1)}
                  </div>
                  <div className="text-sm text-dark-400 mt-2">Technical Score</div>
                </CardContent>
              </Card>

              {/* Communication Score */}
              <Card className="text-center">
                <CardContent className="py-6">
                  <div className={`text-4xl font-bold ${getScoreColor(dashboardData.live_scores.communication)}`}>
                    {dashboardData.live_scores.communication.toFixed(1)}
                  </div>
                  <div className="text-sm text-dark-400 mt-2">Communication</div>
                </CardContent>
              </Card>

              {/* Problem Solving Score */}
              <Card className="text-center">
                <CardContent className="py-6">
                  <div className={`text-4xl font-bold ${getScoreColor(dashboardData.live_scores.problem_solving)}`}>
                    {dashboardData.live_scores.problem_solving.toFixed(1)}
                  </div>
                  <div className="text-sm text-dark-400 mt-2">Problem Solving</div>
                </CardContent>
              </Card>

              {/* Confidence Score */}
              <Card className="text-center">
                <CardContent className="py-6">
                  <div className={`text-4xl font-bold ${getScoreColor(dashboardData.live_scores.confidence)}`}>
                    {dashboardData.live_scores.confidence.toFixed(1)}
                  </div>
                  <div className="text-sm text-dark-400 mt-2">Confidence</div>
                </CardContent>
              </Card>
            </div>

            {/* Interview Status */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Current Status */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary-400" />
                    Interview Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Stage:</span>
                      <span className="text-white font-medium">{dashboardData.current_stage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Difficulty:</span>
                      <span className="text-white font-medium">{dashboardData.current_difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Questions:</span>
                      <span className="text-white font-medium">{dashboardData.questions_remaining} remaining</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Duration:</span>
                      <span className="text-white font-medium">{dashboardData.elapsed_time} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trend */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
                    Performance Trend
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">Trend:</span>
                      <div className="flex items-center">
                        {getTrendIcon(dashboardData.performance_trends.trend)}
                        <span className="text-white font-medium ml-2 capitalize">
                          {dashboardData.performance_trends.trend}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Average:</span>
                      <span className="text-white font-medium">
                        {dashboardData.performance_trends.current_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Peak:</span>
                      <span className="text-success-400 font-medium">
                        {dashboardData.performance_trends.peak_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Lowest:</span>
                      <span className="text-danger-400 font-medium">
                        {dashboardData.performance_trends.lowest_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stress Level */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-primary-400" />
                    Stress Analysis
                  </h3>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getStressColor(dashboardData.stress_level)} mb-2`}>
                      {dashboardData.stress_level.toUpperCase()}
                    </div>
                    <div className="text-sm text-dark-400">
                      Current stress level
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress and Prediction */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Progress */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary-400" />
                    Interview Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-dark-400">Completion</span>
                        <span className="text-white font-medium">{dashboardData.progress_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary-600 to-primary-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${dashboardData.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-dark-400">Skill Coverage</span>
                        <span className="text-white font-medium">
                          {dashboardData.skill_coverage.coverage_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-success-600 to-success-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${dashboardData.skill_coverage.coverage_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {dashboardData.skill_coverage.missing_skills.length > 0 && (
                      <div>
                        <div className="text-sm text-dark-400 mb-2">Missing Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.skill_coverage.missing_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Prediction */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
                    Hiring Prediction
                  </h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${getRecommendationColor(dashboardData.predicted_outcome.outcome)}`}>
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">
                          {dashboardData.predicted_outcome.outcome.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm">
                          Confidence: {dashboardData.predicted_outcome.confidence}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-400">
                          {dashboardData.predicted_outcome.current_score.toFixed(1)}
                        </div>
                        <div className="text-xs text-dark-400">Current Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success-400">
                          {dashboardData.predicted_outcome.projected_final_score.toFixed(1)}
                        </div>
                        <div className="text-xs text-dark-400">Projected Final</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate(`/skill-graph/${sessionId}`)}>
                View Skill Graph
              </Button>
              <Button onClick={() => navigate(`/timeline/${sessionId}`)} variant="secondary">
                View Timeline
              </Button>
              <Button onClick={() => navigate(`/final-report/${sessionId}`)} variant="success">
                Generate Final Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
