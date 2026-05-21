import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

const TimelinePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Placeholder for timeline loading
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-white">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Clock className="w-8 h-8 mr-3 text-primary-400" />
              Interview Timeline
            </h1>
            <p className="text-dark-300 mt-1">
              Question-by-question interview history and scores
            </p>
          </div>
          <Button onClick={() => navigate(`/dashboard/${sessionId}`)} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Resume Introduction</h3>
                  <p className="text-dark-300 mb-2">Tell me about yourself and your experience</p>
                  <div className="flex items-center justify-between">
                    <span className="text-success-400 font-semibold">Score: 7/10</span>
                    <span className="text-dark-400 text-sm">Technical: 8, Communication: 7, Problem Solving: 6</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Backend Architecture</h3>
                  <p className="text-dark-300 mb-2">Design a scalable backend system for a social media platform</p>
                  <div className="flex items-center justify-between">
                    <span className="text-success-400 font-semibold">Score: 8/10</span>
                    <span className="text-dark-400 text-sm">Technical: 9, Communication: 7, Problem Solving: 8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Scaling Scenario</h3>
                  <p className="text-dark-300 mb-2">How would you handle 1M concurrent users?</p>
                  <div className="flex items-center justify-between">
                    <span className="text-warning-400 font-semibold">Score: 6/10</span>
                    <span className="text-dark-400 text-sm">Technical: 6, Communication: 7, Problem Solving: 5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
