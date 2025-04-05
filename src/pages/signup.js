import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, UserIcon, BriefcaseIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'HR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Signing up with data:', formData);
      await signup(formData);
      // Redirect is handled in the AuthContext
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-6 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 -z-10"></div>

      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-700/20 rounded-full blur-3xl transform -translate-y-1/4 -translate-x-1/4"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-700/20 rounded-full blur-3xl transform translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-3xl"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-10">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {mounted && theme === 'dark' ? (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mx-auto h-16 w-16 relative mb-4"
          variants={logoVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl transform rotate-6 shadow-lg"></div>
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-md">
            <UserCircleIcon className="h-9 w-9 text-indigo-600 dark:text-indigo-500" />
          </div>
        </motion.div>
        
        <motion.h2 
          className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
          variants={itemVariants}
        >
          Create Account
        </motion.h2>
        <motion.p 
          className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400"
          variants={itemVariants}
        >
          Or{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            sign in to your account
          </Link>
        </motion.p>
      </motion.div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-6 px-4 sm:px-8 shadow-lg sm:rounded-lg border border-gray-200 dark:border-gray-700"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <div className="flex-grow">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700/90 dark:text-white transition-colors duration-200"
                  placeholder="Choose a username"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700/90 dark:text-white transition-colors duration-200"
                  placeholder="Choose a password"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <div className="mt-1">
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center px-3 py-2 rounded-md border cursor-pointer transition-colors duration-200 ${
                    formData.role === 'HR' 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-700' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="HR"
                      checked={formData.role === 'HR'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <UserCircleIcon className={`h-4 w-4 mr-2 ${
                      formData.role === 'HR' 
                        ? 'text-blue-500 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.role === 'HR' 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      HR
                    </span>
                    {formData.role === 'HR' && (
                      <motion.div 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full"
                        layoutId="roleIndicator"
                      ></motion.div>
                    )}
                  </label>
                  
                  <label className={`relative flex items-center px-3 py-2 rounded-md border cursor-pointer transition-colors duration-200 ${
                    formData.role === 'Hiring Manager' 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-700' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="Hiring Manager"
                      checked={formData.role === 'Hiring Manager'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <BriefcaseIcon className={`h-4 w-4 mr-2 ${
                      formData.role === 'Hiring Manager' 
                        ? 'text-blue-500 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.role === 'Hiring Manager' 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Manager
                    </span>
                    {formData.role === 'Hiring Manager' && (
                      <motion.div 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full"
                        layoutId="roleIndicator"
                      ></motion.div>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Sign up'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      <motion.div 
        className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        &copy; {new Date().getFullYear()} We Hire. All rights reserved.
      </motion.div>
    </div>
  );
} 