import axios from 'axios';
import { getToken, removeToken } from './auth';

// Base API URL - set to port 8000
const API_URL = 'https://wehirebackend.onrender.com/';

// Set this to false to use the real API
const USE_MOCK = false;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized error detected, redirecting to login');
      // Only remove token if it's an actual auth issue, not a network error
      if (error.response.data && error.response.data.detail) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const auth = {
  login: async (credentials) => {
    console.log('Attempting login with:', credentials);
    
    // Convert credentials to form data as required by the FastAPI backend
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      console.log('Login response:', response.data);
      
      // Extract user ID from the response
      let userId = null;
      
      // Try to get user ID directly from the response
      if (response.data.user_id) {
        userId = response.data.user_id;
      } else if (response.data.id) {
        userId = response.data.id;
      } else {
        // If no ID is provided, we'll need to fetch the user profile 
        // or rely on the backend to provide it
        console.warn('No user ID found in login response - user needs to be fetched separately');
      }
      
      console.log('Extracted user ID:', userId);
      
      // Map response to expected format
      return {
        data: {
          token: response.data.access_token,
          user: {
            id: userId,
            username: credentials.username,
            role: response.data.role || 'Hiring Manager'
          }
        }
      };
    });
  },
  
  signup: async (userData) => {
    console.log('Signing up with:', userData);
    return api.post('/api/auth/signup', userData);
  },

  getCurrentUser: async () => {
    return api.get('/api/auth/me');
  }
};

// API endpoints for jobs
export const jobs = {
  getAll: () => {
    console.log('Fetching all jobs');
    return api.get('/api/jobs');
  },
  
  getById: (id) => {
    console.log(`Fetching job with ID: ${id}`);
    return api.get(`/api/jobs/${id}`);
  },
  
  getByManagerId: (managerId) => {
    console.log(`Fetching jobs for manager ID: ${managerId}`);
    
    // If managerId is undefined or invalid, return empty array
    if (!managerId || managerId === 'undefined') {
      console.error('Invalid manager ID:', managerId);
      return Promise.resolve({ data: [] });
    }
    
    // Use the dedicated API endpoint for manager jobs
    // The API documentation shows this endpoint exists and requires an integer manager_id
    try {
      // Try to parse managerId as integer if it's not already
      const managerIdInt = typeof managerId === 'number' ? managerId : parseInt(managerId);
      
      console.log(`Using manager-specific endpoint with ID: ${managerIdInt}`);
      return api.get(`/api/jobs/manager/${managerIdInt}`);
    } catch (error) {
      console.error('Error parsing manager ID:', error);
      return Promise.resolve({ data: [] });
    }
  },
  
  create: (jobData) => {
    console.log('Creating job with data:', jobData);
    // Ensure assigned_to is properly formatted if present
    if (jobData.assigned_to) {
      jobData.assigned_to = parseInt(jobData.assigned_to);
    }
    
    // Ensure salary is a number
    if (jobData.salary) {
      jobData.salary = parseFloat(jobData.salary);
    }
    
    return api.post('/api/jobs', jobData);
  },
  
  update: (id, jobData) => {
    console.log(`Updating job ${id} with data:`, jobData);
    // Ensure assigned_to is properly formatted if present
    if (jobData.assigned_to) {
      jobData.assigned_to = parseInt(jobData.assigned_to);
    }
    
    // Ensure salary is a number
    if (jobData.salary) {
      jobData.salary = parseFloat(jobData.salary);
    }
    
    return api.put(`/api/jobs/${id}`, jobData);
  },
  
  delete: (id) => {
    console.log(`Deleting job with ID: ${id}`);
    return api.delete(`/api/jobs/${id}`);
  },
};

// API endpoints for hiring managers
export const hiringManagers = {
  getAll: () => {
    console.log('Fetching all hiring managers');
    return api.get('/api/hiring-managers');
  },
};

export default api; 