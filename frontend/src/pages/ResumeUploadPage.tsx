/**
 * Resume Upload Page - AI Interview Copilot v5
 * Functional resume upload with backend integration
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { startInterview, uploadResume, uploadJobDescription } from '../services/api_production';

const ResumeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const jobDescriptionFileRef = useRef<HTMLInputElement>(null);
  
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      console.log('📄 Resume file selected:', file.name);
    }
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobDescriptionFile(file);
      console.log('📋 Job description file selected:', file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateName || !position) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      let jobDescriptionTextToSend = jobDescriptionText;
      
      // Handle job description upload (file or text)
      if (jobDescriptionFile) {
        console.log('📋 Uploading job description file:', jobDescriptionFile.name);
        
        try {
          const uploadResponse = await uploadJobDescription(jobDescriptionFile);
          console.log('✅ Job description upload response:', uploadResponse);
          
          if (uploadResponse && uploadResponse.status === 'success') {
            jobDescriptionTextToSend = uploadResponse.job_description_text;
            console.log('✅ Job description text extracted:', jobDescriptionTextToSend);
          } else {
            console.warn('⚠️ Job description upload failed, using text input');
            setError('Job description upload failed. Using text input instead.');
          }
        } catch (uploadError) {
          console.error('❌ Job description upload error:', uploadError);
          console.warn('⚠️ Job description upload failed. Continuing without job description.');
          jobDescriptionTextToSend = '';  // Clear and continue
          // Don't return - continue with interview
        }
      } else if (jobDescriptionText && jobDescriptionText.trim()) {
        console.log('📝 Processing job description text');
        
        try {
          const textResponse = await uploadJobDescription(jobDescriptionText.trim());
          console.log('✅ Job description text response:', textResponse);
          
          if (textResponse.status === 'success') {
            jobDescriptionTextToSend = textResponse.job_description_text;
            console.log('✅ Job description text processed:', jobDescriptionTextToSend);
          } else {
            console.warn('⚠️ Job description text processing failed');
            setError('Job description text processing failed. Continuing without job description.');
            jobDescriptionTextToSend = '';
          }
        } catch (textError) {
          console.error('❌ Job description text error:', textError);
          setError('Job description text processing failed. Continuing without job description.');
          jobDescriptionTextToSend = '';
        }
      }
      
      console.log('🚀 Starting interview with:', { candidateName, position });
      console.log('📄 Resume file:', resumeFile?.name);
      console.log('📋 Job description file:', jobDescriptionFile?.name);
      console.log('📝 Job description text:', jobDescriptionTextToSend);
      
      // Call backend to start interview
      const response = await startInterview(
        candidateName,
        position,
        resumeFile || undefined,
        jobDescriptionTextToSend
      );
      
      console.log('✅ Interview started successfully:', response);
      console.log('🆔 Session ID:', response.session_id);
      
      if (response && response.session_id) {
        setSuccess(true);
        
        // Navigate to interview room after 2 seconds
        setTimeout(() => {
          navigate(`/interview/${response.session_id}`);
        }, 2000);
      } else {
        setError('Failed to start interview. Please try again.');
      }
      
    } catch (err: any) {
      console.error('❌ Failed to start interview:', err);
      setError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = () => {
    // Pre-fill for quick testing
    setCandidateName('Sanjana Mali');
    setPosition('Data Scientist');
    setJobDescriptionText('Data Scientist responsible for developing ML models and analyzing data to drive business insights.');
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
                <h1 className="text-2xl font-bold">Resume Upload</h1>
                <p className="text-gray-400 text-sm">Prepare for AI Interview</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {success ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">Interview Started!</h2>
            <p className="text-gray-300 text-lg mb-8">
              Redirecting you to the AI interview room...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-400" />
                Interview Setup
              </h2>
              <p className="text-gray-300">
                Upload your resume and optionally provide a job description to begin your AI-powered interview.
                The system will analyze your background and conduct a professional evaluation.
              </p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Candidate Information */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position Applied For *
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g., Data Scientist, Software Engineer"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Resume Upload
                </h3>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <input
                    ref={resumeFileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => resumeFileRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Choose Resume
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Job Description (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Job Description
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 mb-3">
                        {jobDescriptionFile ? jobDescriptionFile.name : 'Click to upload job description'}
                      </p>
                      <input
                        ref={jobDescriptionFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleJobDescriptionChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => jobDescriptionFileRef.current?.click()}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or Paste Job Description
                    </label>
                    <textarea
                      value={jobDescriptionText}
                      onChange={(e) => setJobDescriptionText(e.target.value)}
                      placeholder="Paste job description here..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleQuickStart}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Quick Start (Sample Data)
                </button>
                
                <div className="space-x-4 flex">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !candidateName || !position}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Starting Interview...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Start AI Interview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
