import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, BarChart3, Zap, Shield, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Resume Analysis",
      description: "Advanced AI parsing of resumes with skill extraction and experience validation"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Adaptive Interview Questions",
      description: "Dynamic question generation that adapts to candidate performance in real-time"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Candidate Scoring",
      description: "Live evaluation of technical, communication, and problem-solving skills"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Hiring Prediction",
      description: "AI-powered probability analysis with confidence scoring"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Stress & Lie Detection",
      description: "Advanced linguistic analysis for authenticity assessment"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Skill Graph Analysis",
      description: "Visual representation of candidate strengths and knowledge gaps"
    }
  ];

  const stats = [
    { value: "95%", label: "Accuracy Rate" },
    { value: "50%", label: "Time Reduction" },
    { value: "10K+", label: "Interviews Conducted" },
    { value: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="bg-dark-900/50 backdrop-blur-lg border-b border-dark-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary-400 mr-3" />
              <span className="text-xl font-bold text-white">AI Interview Copilot</span>
              <span className="ml-2 text-xs text-primary-400 bg-primary-500/20 px-2 py-1 rounded">v5</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/upload">
                <Button>Start Interview</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-400/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <span className="text-gradient">AI Interview Copilot</span>
              <br />
              <span className="text-3xl md:text-4xl text-dark-300 font-normal mt-4 block">
                Autonomous Multi-Agent AI Recruiter
              </span>
            </h1>
            <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Experience the future of recruiting with our advanced AI system that conducts 
              intelligent interviews, evaluates candidates in real-time, and provides data-driven 
              hiring recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="text-lg">
                  Start Interview <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="text-lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Advanced AI Interview Features
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Our multi-agent AI system provides comprehensive interview capabilities 
              that rival human recruiters with enhanced accuracy and consistency.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary-500/20 rounded-lg text-primary-400 mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-dark-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-dark-300">
              Get started with AI interviews in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload Resume</h3>
              <p className="text-dark-300">Candidate uploads resume and job description</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Interview</h3>
              <p className="text-dark-300">Multi-agent AI conducts adaptive interview</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Report</h3>
              <p className="text-dark-300">Receive comprehensive evaluation and hiring recommendation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card variant="glass" className="text-center p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="text-xl text-dark-300 mb-8">
              Join companies using AI Interview Copilot to make better hiring decisions 
              faster and more accurately.
            </p>
            <Link to="/upload">
              <Button size="lg" className="text-lg">
                Start Your First Interview <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-primary-400 mr-2" />
            <span className="text-white font-semibold">AI Interview Copilot v5</span>
          </div>
          <p className="text-dark-400 text-sm">
            © 2024 AI Interview Copilot. Autonomous Multi-Agent AI Recruiting Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
