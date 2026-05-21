import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Network, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { interviewAPI } from '../services/api';

const SkillGraphPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Placeholder for skill graph loading
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-white">Loading skill graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Network className="w-8 h-8 mr-3 text-primary-400" />
              Skill Graph Analysis
            </h1>
            <p className="text-dark-300 mt-1">
              Visual representation of candidate skills and knowledge gaps
            </p>
          </div>
          <Button onClick={() => navigate(`/dashboard/${sessionId}`)} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card variant="glass" className="p-12 text-center">
          <Network className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Skill Graph Visualization</h2>
          <p className="text-dark-300 mb-6">
            Interactive skill graph will be displayed here showing candidate's technical skills, 
            proficiency levels, and knowledge dependencies.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-400 mb-2">Python</div>
              <div className="text-sm text-dark-400">Strong (9/10)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-400 mb-2">ML</div>
              <div className="text-sm text-dark-400">Medium (6/10)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-danger-400 mb-2">System Design</div>
              <div className="text-sm text-dark-400">Weak (4/10)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SkillGraphPage;
