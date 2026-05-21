// API Configuration
const API_BASE = "http://localhost:8000";

// API Response Types
export interface InterviewSession {
  session_id: string;
  candidate_name: string;
  position: string;
  started_at: string;
}

export interface Question {
  question: string;
  question_id: string;
  stage: string;
  difficulty: string;
  type: string;
}

export interface APIResponse<T> {
  data: T;
  status: string;
  message: string;
}

// Simple API client
const api = {
  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    return response;
  },

  // POST request with JSON
  async post<T>(endpoint: string, data?: any): Promise<Response> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return response;
  },

  // POST request with FormData
  async postForm<T>(endpoint: string, formData: FormData): Promise<Response> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    return response;
  }
};

// Start Interview
export const startInterview = async (
  candidateName: string,
  position: string,
  resumeFile?: File,
  jobDescriptionText?: string
): Promise<InterviewSession> => {
  try {
    console.log('🚀 Starting interview API call...');
    console.log('📋 Data:', { candidateName, position, hasResume: !!resumeFile, hasJobText: !!jobDescriptionText });

    const response = await api.post<APIResponse<InterviewSession>>('/start-interview', {
      candidate_name: candidateName,
      position: position,
      resume_text: resumeFile ? await resumeFile.text() : undefined,
      job_description_text: jobDescriptionText || undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Start interview response:', data);
    return data.data;
  } catch (err) {
    console.error('Start interview error:', err);
    throw new Error(`Failed to start interview: ${(err as Error).message}`);
  }
};

// Upload Resume
export const uploadResume = async (file: File): Promise<any> => {
  try {
    console.log('📄 Uploading resume file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.postForm('/upload-resume', formData);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resume uploaded:', data);
    return data.data;
  } catch (err) {
    console.error('Resume upload error:', err);
    throw new Error(`Failed to upload resume: ${(err as Error).message}`);
  }
};

// Upload Job Description
export const uploadJobDescription = async (data: File | string): Promise<any> => {
  try {
    if (data instanceof File) {
      // Handle file upload
      const formData = new FormData();
      formData.append('file', data);
      
      console.log('📤 Uploading job description file:', data.name);
      
      const response = await api.postForm('/upload-job-description', formData);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Job description uploaded:', result);
      return result.data;
    } else {
      // Handle text upload
      const response = await api.post<APIResponse<any>>('/job-description-text', {
        job_description_text: data
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Job description text uploaded:', result);
      return result.data;
    }
  } catch (err) {
    console.error('Job description upload error:', err);
    throw new Error(`Failed to upload job description: ${(err as Error).message}`);
  }
};

// Get Next Question
export const getNextQuestion = async (sessionId: string, followUp: boolean = false): Promise<Question> => {
  try {
    console.log('📡 Getting next question for session:', sessionId);
    console.log('🔍 Follow up question:', followUp);
    
    const response = await api.get<APIResponse<Question>>(`/next-question/${sessionId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Next question received:', data);
    
    // Check if response has expected structure
    if (!data || !data.question) {
      console.error('❌ Invalid response structure:', data);
      throw new Error('Invalid question response from backend');
    }

    return data.data;
  } catch (err) {
    console.error('Fetch error:', err);
    throw new Error(`Failed to load question: ${(err as Error).message}`);
  }
};

// Submit Answer
export const submitAnswer = async (sessionId: string, answer: string): Promise<any> => {
  try {
    console.log('📤 Submitting answer for session:', sessionId);
    console.log('📝 Answer:', answer);
    
    const response = await api.post<APIResponse<any>>('/answer', {
      session_id: sessionId,
      answer: answer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submit error:', errorText);
      throw new Error(`Submit failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Answer submitted:', data);
    return data.data;
  } catch (err) {
    console.error('Submit answer error:', err);
    throw new Error(`Failed to submit answer: ${(err as Error).message}`);
  }
};

// Health Check
export const healthCheck = async (): Promise<any> => {
  try {
    const response = await api.get<APIResponse<any>>('/health');
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Health check error:', err);
    throw new Error(`Health check failed: ${(err as Error).message}`);
  }
};
