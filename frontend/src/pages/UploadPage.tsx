import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { interviewAPI } from '../services/api';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleJobDescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setJobDescriptionFile(file);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleStartInterview = async () => {
    if (!candidateName || !position) {
      setError('Please fill in all required fields');
      return;
    }

    if (!resumeFile && !jobDescriptionText && !jobDescriptionFile) {
      setError('Please provide either a resume or job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await interviewAPI.startInterview(
        candidateName,
        position,
        resumeFile || undefined,
        jobDescriptionText || undefined
      );

      navigate(`/interview/${session.session_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Start AI Interview
          </h1>
          <p className="text-xl text-dark-300">
            Upload candidate information and begin the intelligent interview process
          </p>
        </div>

        {/* Upload Form */}
        <Card variant="glass" className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Candidate Info */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-primary-400" />
                Candidate Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter candidate name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Resume (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                        <p className="text-white">
                          {resumeFile ? resumeFile.name : 'Click to upload resume'}
                        </p>
                        <p className="text-sm text-dark-400 mt-1">PDF files only</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Job Description */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-primary-400" />
                Job Description
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Job Description Text
                  </label>
                  <textarea
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32 resize-none"
                    placeholder="Paste job description here..."
                  />
                </div>

                <div className="text-center text-dark-400 text-sm">
                  OR
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Job Description File (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleJobDescriptionUpload}
                      className="hidden"
                      id="jd-upload"
                    />
                    <label
                      htmlFor="jd-upload"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                        <p className="text-white">
                          {jobDescriptionFile ? jobDescriptionFile.name : 'Click to upload job description'}
                        </p>
                        <p className="text-sm text-dark-400 mt-1">PDF files only</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-danger-500/20 border border-danger-500/50 rounded-lg">
              <p className="text-danger-400">{error}</p>
            </div>
          )}

          {/* Start Button */}
          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleStartInterview}
              loading={loading}
              disabled={!candidateName || !position}
              className="text-lg px-12"
            >
              Start Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <CheckCircle className="w-8 h-8 text-success-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
            <p className="text-dark-300 text-sm">
              Advanced AI analyzes resumes and generates personalized questions
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <CheckCircle className="w-8 h-8 text-success-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Evaluation</h3>
            <p className="text-dark-300 text-sm">
              Get instant feedback and scoring during the interview
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <CheckCircle className="w-8 h-8 text-success-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Reports</h3>
            <p className="text-dark-300 text-sm">
              Detailed analysis with hiring recommendations
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
