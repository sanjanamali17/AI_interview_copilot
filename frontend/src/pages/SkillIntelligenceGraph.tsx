/**
 * Skill Intelligence Graph - AI Interview Copilot v5
 * Visual skill analysis and competency mapping
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Target, 
  ArrowLeft,
  RefreshCw,
  FileText,
  Activity
} from 'lucide-react';
import { interviewAPI } from '../services/api';

interface SkillData {
  skill: string;
  level: number;
  category: 'technical' | 'soft' | 'domain';
  assessment: string;
}

interface SkillGraphData {
  strongSkills: SkillData[];
  moderateSkills: SkillData[];
  weakSkills: SkillData[];
  overallScore: number;
  skillCount: number;
  topSkill: string;
  improvementArea: string;
}

const SkillIntelligenceGraph: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [skillData, setSkillData] = useState<SkillGraphData>({
    strongSkills: [],
    moderateSkills: [],
    weakSkills: [],
    overallScore: 0,
    skillCount: 0,
    topSkill: '',
    improvementArea: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'soft' | 'domain'>('all');

  useEffect(() => {
    if (sessionId) {
      loadSkillData();
    }
  }, [sessionId]);

  const loadSkillData = async () => {
    try {
      console.log('📊 Loading skill data for session:', sessionId);
      
      // Fetch skill graph data from backend
      const skillGraphData = await interviewAPI.getSkillGraph(sessionId!);
      console.log('✅ Skill data loaded:', skillGraphData);
      
      // Mock data for demonstration
      const mockSkillData: SkillGraphData = {
        strongSkills: [
          { skill: 'Python', level: 85, category: 'technical', assessment: 'Strong proficiency in data manipulation and analysis' },
          { skill: 'Machine Learning', level: 78, category: 'technical', assessment: 'Good understanding of ML concepts and algorithms' },
          { skill: 'Communication', level: 82, category: 'soft', assessment: 'Clear explanation of technical concepts' },
          { skill: 'Data Analysis', level: 80, category: 'domain', assessment: 'Experience with real-world data projects' }
        ],
        moderateSkills: [
          { skill: 'Statistics', level: 72, category: 'technical', assessment: 'Solid statistical foundation for data science' },
          { skill: 'Problem Solving', level: 68, category: 'soft', assessment: 'Methodical approach to complex problems' },
          { skill: 'SQL', level: 65, category: 'technical', assessment: 'Basic database querying skills' },
          { skill: 'Teamwork', level: 75, category: 'soft', assessment: 'Collaborative team player' }
        ],
        weakSkills: [
          { skill: 'System Design', level: 45, category: 'technical', assessment: 'Limited experience with large-scale systems' },
          { skill: 'Deep Learning', level: 52, category: 'technical', assessment: 'Familiar with concepts but limited practical experience' },
          { skill: 'Cloud Computing', level: 48, category: 'technical', assessment: 'Basic knowledge of cloud platforms' },
          { skill: 'Public Speaking', level: 55, category: 'soft', assessment: 'Needs improvement in presentation skills' }
        ],
        overallScore: 71,
        skillCount: 11,
        topSkill: 'Python',
        improvementArea: 'System Design'
      };
      
      setSkillData(mockSkillData);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ Failed to load skill data:', err);
      setError(err.message || 'Failed to load skill data');
      setLoading(false);
    }
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSkillTextColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500';
      case 'soft': return 'bg-green-500';
      case 'domain': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getAllSkills = () => {
    const allSkills = [...skillData.strongSkills, ...skillData.moderateSkills, ...skillData.weakSkills];
    if (selectedCategory === 'all') return allSkills;
    return allSkills.filter(skill => skill.category === selectedCategory);
  };

  const renderSkillBar = (skill: SkillData) => (
    <div key={skill.skill} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getCategoryColor(skill.category)}`} />
          <span className="font-medium">{skill.skill}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold ${getSkillTextColor(skill.level)}`}>
            {skill.level}%
          </span>
          <span className="text-xs text-gray-400 capitalize">{skill.category}</span>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${getSkillColor(skill.level)}`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 italic">{skill.assessment}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dashboard/${sessionId}`)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-2xl font-bold">Skill Intelligence Graph</h1>
                  <p className="text-gray-400 text-sm">Session: {sessionId}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadSkillData}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate(`/report/${sessionId}`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading skill analysis...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-2xl font-bold ${getSkillTextColor(skillData.overallScore)}`}>
                    {skillData.overallScore}%
                  </span>
                </div>
                <h3 className="text-gray-300 font-medium">Overall Score</h3>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skillData.overallScore}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {skillData.strongSkills.length}
                  </span>
                </div>
                <h3 className="text-gray-300 font-medium">Strong Skills</h3>
                <p className="text-xs text-gray-400 mt-1">80%+ proficiency</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    {skillData.moderateSkills.length}
                  </span>
                </div>
                <h3 className="text-gray-300 font-medium">Moderate Skills</h3>
                <p className="text-xs text-gray-400 mt-1">60-79% proficiency</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-red-400">
                    {skillData.weakSkills.length}
                  </span>
                </div>
                <h3 className="text-gray-300 font-medium">Weak Skills</h3>
                <p className="text-xs text-gray-400 mt-1">Below 60% proficiency</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
              <div className="flex space-x-4">
                {(['all', 'technical', 'soft', 'domain'] as const).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'All Skills' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Strong Skills */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  Strong Skills
                </h3>
                <div className="space-y-4">
                  {skillData.strongSkills
                    .filter(skill => selectedCategory === 'all' || skill.category === selectedCategory)
                    .map(renderSkillBar)}
                </div>
              </div>

              {/* Moderate Skills */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                  Moderate Skills
                </h3>
                <div className="space-y-4">
                  {skillData.moderateSkills
                    .filter(skill => selectedCategory === 'all' || skill.category === selectedCategory)
                    .map(renderSkillBar)}
                </div>
              </div>

              {/* Weak Skills */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  Weak Skills
                </h3>
                <div className="space-y-4">
                  {skillData.weakSkills
                    .filter(skill => selectedCategory === 'all' || skill.category === selectedCategory)
                    .map(renderSkillBar)}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 font-medium mb-2">Top Strength</h4>
                  <p className="text-gray-300">{skillData.topSkill} - Strong candidate performance</p>
                </div>
                <div>
                  <h4 className="text-red-400 font-medium mb-2">Improvement Area</h4>
                  <p className="text-gray-300">{skillData.improvementArea} - Needs development focus</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillIntelligenceGraph;
