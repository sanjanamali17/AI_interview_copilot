import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, CheckCircle, AlertCircle, TrendingUp, Clock, Target, Award, BarChart3, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api';
import { FinalReport } from '../services/types';

const FinalReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadFinalReport();
    }
  }, [sessionId]);

  const loadFinalReport = async () => {
    if (!sessionId) return;
    
    try {
      // const report = await interviewAPI.getFinalReport(sessionId);
      // Mock data for now
      const report = {
        sessionId: sessionId,
        candidateName: 'Sanjana Mali',
        position: 'Data Scientist',
        interviewDate: new Date().toISOString(),
        overallScore: 85,
        technicalScore: 88,
        communicationScore: 82,
        problemSolvingScore: 87,
        strengths: ['Technical expertise', 'Problem-solving', 'Communication'],
        areasForImprovement: ['Leadership skills', 'Project management'],
        recommendation: 'Strong candidate for senior technical role'
      };
      setFinalReport(report);
    } catch (err: any) {
      setError(err.message || 'Failed to load final report');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-400';
    if (score >= 6) return 'text-warning-400';
    return 'text-danger-400';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'hire':
        return 'bg-success-500/20 border-success-500/50 text-success-400';
      case 'consider':
        return 'bg-warning-500/20 border-warning-500/50 text-warning-400';
      case 'reject':
        return 'bg-danger-500/20 border-danger-500/50 text-danger-400';
      default:
        return 'bg-dark-500/20 border-dark-500/50 text-dark-400';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'hire':
        return <CheckCircle className="w-6 h-6" />;
      case 'consider':
        return <AlertCircle className="w-6 h-6" />;
      case 'reject':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const downloadReport = () => {
    if (!finalReport) return;
    
    const reportData = {
      candidate: finalReport.final_report.candidate_name,
      position: finalReport.final_report.position,
      date: finalReport.final_report.interview_date,
      overall_score: finalReport.final_report.overall_score,
      recommendation: finalReport.final_report.recommendation,
      strengths: finalReport.final_report.strengths,
      concerns: finalReport.final_report.concerns,
      hiring_probability: finalReport.hiring_prediction.hiring_probability,
      confidence_level: finalReport.hiring_prediction.confidence_level
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `interview-report-${finalReport.final_report.candidate_name.replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-white">Generating final report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-primary-400" />
            Final Interview Report
          </h1>
          <p className="text-dark-300 mt-2">
            Comprehensive evaluation and hiring recommendation
          </p>
        </div>

        {error && (
          <Card variant="bordered" className="border-danger-500/50 mb-6">
            <CardContent className="flex items-center">
              <AlertCircle className="w-5 h-5 text-danger-400 mr-2" />
              <span className="text-danger-400">{error}</span>
            </CardContent>
          </Card>
        )}

        {finalReport && (
          <div className="space-y-6">
            {/* Candidate Overview */}
            <Card variant="glass">
              <CardContent className="py-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {finalReport.final_report.candidate_name}
                  </h2>
                  <p className="text-xl text-primary-400 mb-4">
                    {finalReport.final_report.position}
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-dark-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {finalReport.final_report.interview_date}
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {finalReport.final_report.interview_duration}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Score and Recommendation */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Score */}
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="text-6xl font-bold text-primary-400 mb-2">
                    {finalReport.final_report.overall_score.toFixed(1)}
                  </div>
                  <div className="text-lg text-white mb-4">Overall Score</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-dark-400">Technical</div>
                      <div className={`font-semibold ${getScoreColor(finalReport.session_evaluation.technical_score)}`}>
                        {finalReport.session_evaluation.technical_score.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-dark-400">Communication</div>
                      <div className={`font-semibold ${getScoreColor(finalReport.session_evaluation.communication_score)}`}>
                        {finalReport.session_evaluation.communication_score.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-dark-400">Problem Solving</div>
                      <div className={`font-semibold ${getScoreColor(finalReport.session_evaluation.problem_solving_score)}`}>
                        {finalReport.session_evaluation.problem_solving_score.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-dark-400">Confidence</div>
                      <div className={`font-semibold ${getScoreColor(finalReport.session_evaluation.confidence_score)}`}>
                        {finalReport.session_evaluation.confidence_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hiring Recommendation */}
              <Card>
                <CardContent className="py-8">
                  <div className={`p-6 rounded-lg border ${getRecommendationColor(finalReport.final_report.recommendation)}`}>
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {getRecommendationIcon(finalReport.final_report.recommendation)}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {finalReport.final_report.recommendation.toUpperCase()}
                      </div>
                      <div className="text-sm mb-4">
                        Confidence: {finalReport.final_report.confidence_level}
                      </div>
                      <div className="text-sm">
                        {finalReport.final_report.next_steps}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-2">
                      {(finalReport.hiring_prediction.hiring_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-dark-400">Hiring Probability</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <Card>
              <CardContent className="py-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
                  Performance Analytics
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-400">
                      {finalReport.comprehensive_analytics.score_distribution.excellent}
                    </div>
                    <div className="text-sm text-dark-400">Excellent (8-10)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-400">
                      {finalReport.comprehensive_analytics.score_distribution.good}
                    </div>
                    <div className="text-sm text-dark-400">Good (6-7.9)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-400">
                      {finalReport.comprehensive_analytics.score_distribution.average}
                    </div>
                    <div className="text-sm text-dark-400">Average (4-5.9)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-danger-400">
                      {finalReport.comprehensive_analytics.score_distribution.poor}
                    </div>
                    <div className="text-sm text-dark-400">Poor (&lt;4)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Concerns */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success-400" />
                    Key Strengths
                  </h3>
                  <div className="space-y-2">
                    {finalReport.final_report.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success-400 mr-2 flex-shrink-0" />
                        <span className="text-white">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Concerns */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-danger-400" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {finalReport.final_report.concerns.map((concern, index) => (
                      <div key={index} className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-warning-400 mr-2 flex-shrink-0" />
                        <span className="text-white">{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HR Analysis */}
            <Card>
              <CardContent className="py-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-400" />
                  HR Analysis
                </h3>
                <div className="bg-dark-800/50 rounded-lg p-6 border border-dark-700">
                  <p className="text-white leading-relaxed">
                    {finalReport.final_report.reasoning}
                  </p>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-dark-400">Hiring Score</div>
                    <div className="text-white font-semibold">
                      {finalReport.hr_analysis.hiring_score.toFixed(1)}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-dark-400">Key Strengths</div>
                    <div className="text-white font-semibold">
                      {finalReport.hr_analysis.key_strengths.length} identified
                    </div>
                  </div>
                  <div>
                    <div className="text-dark-400">Key Concerns</div>
                    <div className="text-white font-semibold">
                      {finalReport.hr_analysis.key_concerns.length} identified
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary">
                Start New Interview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalReportPage;
