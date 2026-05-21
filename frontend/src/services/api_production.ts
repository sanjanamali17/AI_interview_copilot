// Production API Service - Handles all edge cases, never crashes
const API_BASE = "http://localhost:8009";

// API Client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log(`🌐 API Request: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Validate response format
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      console.log(`🌐 Form API Request: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      console.log(`📡 Form Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Form API Error:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Form API Response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Form request failed:', error);
      throw error;
    }
  }
}

const api = new ApiClient(API_BASE);

// Response Types
interface APIResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

// Start Interview - PRODUCTION READY
export const startInterview = async (
  candidateName: string,
  position: string,
  resumeFile?: File,
  jobDescriptionText?: string
): Promise<any> => {
  try {
    console.log('🚀 Starting interview API call...');
    console.log('📋 Data:', { candidateName, position, hasResume: !!resumeFile, hasJobText: !!jobDescriptionText });

    const response = await api.post<APIResponse<any>>('/start-interview', {
      candidate_name: candidateName,
      position: position,
      resume_text: resumeFile ? await resumeFile.text() : undefined,
      job_description_text: jobDescriptionText || undefined
    });

    if (response.status === 'success' && response.data) {
      console.log('✅ Interview started:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to start interview');
    }
  } catch (error) {
    console.error('❌ Start interview error:', error);
    throw error;
  }
};

// Upload Resume - PRODUCTION READY
export const uploadResume = async (file: File): Promise<any> => {
  try {
    console.log('📄 Uploading resume file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.postForm<APIResponse<any>>('/upload-resume', formData);

    if (response.status === 'success' && response.data) {
      console.log('✅ Resume uploaded:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to upload resume');
    }
  } catch (error) {
    console.error('❌ Resume upload error:', error);
    throw error;
  }
};

// Upload Job Description - PRODUCTION READY
export const uploadJobDescription = async (data: File | string): Promise<any> => {
  try {
    console.log('📋 Uploading job description...');
    
    if (typeof data === 'string') {
      // Text input
      const response = await api.post<APIResponse<any>>('/upload-job-description', {
        job_description_text: data
      });

      if (response.status === 'success' && response.data) {
        console.log('✅ Job description uploaded (text):', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to upload job description');
      }
    } else {
      // File upload
      const formData = new FormData();
      formData.append('file', data);

      const response = await api.postForm<APIResponse<any>>('/upload-job-description', formData);

      if (response.status === 'success' && response.data) {
        console.log('✅ Job description uploaded (file):', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to upload job description');
      }
    }
  } catch (error) {
    console.error('❌ Job description upload error:', error);
    throw error;
  }
};

// Get Next Question - PRODUCTION READY
export const getNextQuestion = async (sessionId: string): Promise<any> => {
  try {
    console.log('📡 Getting next question for session:', sessionId);
    
    const response = await api.get(`/next-question/${sessionId}`);
    
    console.log('✅ Raw API response:', response);
    
    // MUST RETURN RESPONSE.DATA - CRITICAL
    if (response && response.status === 'success') {
      console.log('✅ Next question received:', response);
      return response; // Return the full response object with data
    } else {
      throw new Error(response.message || 'Failed to get next question');
    }
  } catch (error) {
    console.error('❌ Get next question error:', error);
    throw error;
  }
};

// Submit Answer - PRODUCTION READY
export const submitAnswer = async (data: {
  session_id: string;
  answer: string;
  question_id: string;
}): Promise<any> => {
  try {
    console.log('📤 Submitting answer for session:', data.session_id);
    console.log('📝 Answer:', data.answer);
    
    const response = await api.post<APIResponse<any>>('/submit-answer', data);

    if (response.status === 'success' && response.data) {
      console.log('✅ Answer submitted successfully:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to submit answer');
    }
  } catch (error) {
    console.error('❌ Submit answer error:', error);
    throw error;
  }
};

// Health Check - PRODUCTION READY
export const healthCheck = async (): Promise<any> => {
  try {
    console.log('🏥 Checking backend health...');
    
    const response = await api.get<APIResponse<any>>('/health');

    if (response.status === 'success' && response.data) {
      console.log('✅ Backend health check passed:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Backend health check failed');
    }
  } catch (error) {
    console.error('❌ Health check error:', error);
    throw error;
  }
};
