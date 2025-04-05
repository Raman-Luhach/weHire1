import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Check for token in localStorage (browser-only)
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          
          if (token) {
            // Try to get user info
            try {
              const userData = localStorage.getItem('user');
              if (userData) {
                setUser(JSON.parse(userData));
                console.log('User authenticated from localStorage:', JSON.parse(userData));
              }
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token'); // Clear invalid token
          localStorage.removeItem('user');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials);
      
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }
      
      const response = await auth.login(credentials);
      
      console.log('AuthContext: Login response received:', response.data);
      
      // Store token in localStorage (browser-only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        
        // Store user info
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      setUser(response.data.user);
      console.log('AuthContext: Login successful, user set to:', response.data.user);
      
      toast.success('Login successful');
      
      // Redirect based on user role
      if (response.data.user.role === 'HR') {
        console.log('AuthContext: Redirecting to HR dashboard');
        router.push('/hr');
      } else if (response.data.user.role === 'Hiring Manager') {
        console.log('AuthContext: Redirecting to Manager dashboard');
        router.push('/manager');
      } else {
        console.log('AuthContext: Redirecting to main dashboard');
        router.push('/dashboard');
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      console.error('AuthContext: Error message:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Signing up with:', userData);
      const response = await auth.signup(userData);
      console.log('Signup response:', response.data);
      toast.success('Signup successful! Please login.');
      router.push('/login');
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 