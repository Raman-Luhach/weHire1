import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT } from '@/utils/config';

// Fallback data to display when backend isn't available
const FALLBACK_CATEGORIES = [
  {
    id: 'temp-1',
    name: 'Technical Skills',
    description: 'Evaluate technical abilities and knowledge',
    defaultTime: 30,
    questions: [
      { id: 'temp-101', text: 'Assess coding skills and technical knowledge', status: 'Must Ask', mustAsk: true }
    ]
  },
  {
    id: 'temp-2',
    name: 'Problem Solving',
    description: 'Evaluate analytical and problem-solving abilities',
    defaultTime: 20,
    questions: [
      { id: 'temp-201', text: 'Present a real-world scenario to analyze', status: 'Must Ask', mustAsk: true }
    ]
  }
];

// Map for status conversion between frontend and backend
const statusMap = {
  'Must Ask': 'active',
  'If Time Permits': 'if_time_permits',
  'Don&apos;t Ask': 'inactive'
};

// Determine must_ask flag based on status
const getMustAskFlag = (status) => {
  return status === 'Must Ask';
};

// Reverse map for converting backend status to frontend
const reverseStatusMap = {
  'active': 'Must Ask',
  'if_time_permits': 'If Time Permits',
  'inactive': 'Don&apos;t Ask'
};

// Icon map for categories
const categoryIconMap = {
  'Technical Skills': <AcademicCapIcon className="h-5 w-5" />,
  'Problem Solving': <LightBulbIcon className="h-5 w-5" />,
  'Behavioral': <ChatBubbleLeftRightIcon className="h-5 w-5" />,
  'Technical': <AcademicCapIcon className="h-5 w-5" />,
  'Past Experience': <BriefcaseIcon className="h-5 w-5" />,
  'Case Study': <ClipboardDocumentListIcon className="h-5 w-5" />,
  'Situation Handling': <ChatBubbleLeftRightIcon className="h-5 w-5" />,
  'Personality Test': <UserGroupIcon className="h-5 w-5" />
};

// Default category icon if not found in map
const defaultCategoryIcon = <ClipboardDocumentListIcon className="h-5 w-5" />;

// Use dynamic import with ssr: false to avoid prerendering issues
const InterviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, getToken } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [curriculumData, setCurriculumData] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', default_time: 20 });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  
  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Theme check - safer way to check dark mode
  const isDarkMode = mounted && theme === 'dark';
  
  // Helper function to get authenticated API headers
  const getAuthHeaders = async () => {
    try {
      const token = await getToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (err) {
      console.error('Failed to get auth token:', err);
      setError('Authentication error. Please log in again.');
      router.push('/login');
      throw err;
    }
  };
  
  const fetchCategories = async (jobId) => {
    try {
      const headers = await getAuthHeaders();
      
      // Use the correct API endpoint based on the documentation with the proxy
      const response = await axios.get(`${API_BASE_URL}/interview/job/${jobId}/categories`, {
        headers,
        timeout: 5000 // 5 second timeout
      });
      
      // Transform the API response to the format needed by the UI
      const transformedData = response.data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        defaultTime: category.default_time,
        icon: categoryIconMap[category.name] || defaultCategoryIcon,
        questions: category.questions.map(q => ({
          id: q.id,
          text: q.text,
          status: reverseStatusMap[q.status] || 'Must Ask',
          mustAsk: q.must_ask,
          isNew: false
        }))
      }));
      
      setCurriculumData(transformedData);
    } catch (err) {
      console.error('Error fetching interview categories:', err);
      
      // Handle network errors specifically
      if (err.message === 'Network Error') {
        setError(`Cannot connect to the backend server. Please make sure the server is running and accessible.`);
        toast.error('Cannot connect to backend server');
        
        // Load fallback data for development/testing purposes
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback data in development mode');
          const fallbackData = FALLBACK_CATEGORIES.map(category => ({
            ...category,
            icon: categoryIconMap[category.name] || defaultCategoryIcon
          }));
          setCurriculumData(fallbackData);
          toast.info('Loaded fallback data for development purposes');
        }
      } else {
        // For other errors, show a generic message
        toast.error('Failed to load interview data from server');
        setError('Failed to load interview data. Please ensure the backend API is running.');
      }
    }
  };
  
  useEffect(() => {
    const fetchJobAndInterviewData = async () => {
      // Don't try to fetch data if id is not available yet
      if (!id) {
        return;
      }
      
      setLoading(true);
      try {
        // Fetch job details
        const response = await jobs.getById(id);
        setJob(response.data);
        
        // Fetch interview categories and questions for this job
        await fetchCategories(id);
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndInterviewData();
  }, [id]);

  // Handler for changing time allocation
  const handleTimeChange = (categoryId, newTime) => {
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? { ...category, defaultTime: parseInt(newTime) || 0 } 
          : category
      )
    );
  };

  // Handler for changing question status
  const handleQuestionStatusChange = async (categoryId, questionId, newStatus) => {
    // Update UI optimistically
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: category.questions.map(question => 
                question.id === questionId 
                  ? { 
                      ...question, 
                      status: newStatus, 
                      mustAsk: getMustAskFlag(newStatus),
                      isModified: true // Mark as modified when status changes
                    } 
                  : question
              )
            } 
          : category
      )
    );
    
    // No immediate API call - will be saved with the Save button or Save Persona
  };

  // Handler for adding a new question
  const handleAddQuestion = async (categoryId) => {
    // Find the category to add the question to
    const category = curriculumData.find(c => c.id === categoryId);
    if (!category) return;
    
    // First, add a temporary question to the UI
    const tempId = `temp-${Date.now()}`;
    const newQuestion = {
      id: tempId,
      text: '',
      status: 'Must Ask',
      mustAsk: true,
      isNew: true, // Flag to mark this as a new question
      isModified: false // Since it's new, we don't need to track modifications yet
    };
    
    // Update the UI
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: [
                ...category.questions,
                newQuestion
              ]
            } 
          : category
      )
    );
  };

  // Handler for saving a question
  const handleSaveQuestion = async (categoryId, questionId, questionText) => {
    // Get the question
    const category = curriculumData.find(c => c.id === categoryId);
    if (!category) return;
    
    const question = category.questions.find(q => q.id === questionId);
    if (!question) return;
    
    // If question text is empty, remove it from UI
    if (!questionText.trim()) {
      handleRemoveQuestion(categoryId, questionId);
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      
      // If it's a new question, create it via API
      if (question.isNew) {
        const response = await axios.post(`${API_BASE_URL}/interview/questions`, {
          text: questionText,
          status: statusMap[question.status] || 'active',
          must_ask: question.mustAsk !== undefined ? question.mustAsk : getMustAskFlag(question.status),
          category_id: categoryId,
          job_id: parseInt(id)
        }, { headers });
        
        // Update the UI with the real ID from the server
        setCurriculumData(
          curriculumData.map(category => 
            category.id === categoryId 
              ? {
                  ...category,
                  questions: category.questions.map(q => 
                    q.id === questionId
                      ? {
                          id: response.data.id,
                          text: response.data.text,
                          status: reverseStatusMap[response.data.status] || 'Must Ask',
                          mustAsk: response.data.must_ask,
                          isNew: false,
                          isModified: false
                        }
                      : q
                  )
                } 
              : category
          )
        );
        
        toast.success('Question saved');
      } else if (question.isModified) {
        // Only update if the question has been modified
        await axios.put(`${API_BASE_URL}/interview/questions/${questionId}`, {
          text: questionText,
          status: statusMap[question.status] || 'active',
          must_ask: question.mustAsk !== undefined ? question.mustAsk : getMustAskFlag(question.status)
        }, { headers });
        
        // Mark question as no longer modified
        setCurriculumData(
          curriculumData.map(category => 
            category.id === categoryId 
              ? {
                  ...category,
                  questions: category.questions.map(q => 
                    q.id === questionId
                      ? { ...q, isModified: false }
                      : q
                  )
                } 
              : category
          )
        );
        
        toast.success('Question updated');
      } else {
        toast.info('No changes to save');
      }
    } catch (err) {
      console.error('Error saving question:', err);
      toast.error('Failed to save question. Please check if the backend API is running.');
    }
  };

  // Handler for removing a question
  const handleRemoveQuestion = async (categoryId, questionId) => {
    // Get the question to check if it's new (temporary)
    const category = curriculumData.find(c => c.id === categoryId);
    if (!category) return;
    
    const question = category.questions.find(q => q.id === questionId);
    
    // For new questions that haven't been saved to the server yet, just remove from UI
    if (question && question.isNew) {
      setCurriculumData(
        curriculumData.map(category => 
          category.id === categoryId 
            ? {
                ...category,
                questions: category.questions.filter(q => q.id !== questionId)
              } 
            : category
        )
      );
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      
      // Call the DELETE endpoint to remove the question
      await axios.delete(`${API_BASE_URL}/interview/questions/${questionId}`, { headers });
      
      // Update UI after successful API call
      setCurriculumData(
        curriculumData.map(category => 
          category.id === categoryId 
            ? {
                ...category,
                questions: category.questions.filter(question => question.id !== questionId)
              } 
            : category
        )
      );
      
      toast.success('Question removed successfully');
    } catch (err) {
      console.error('Error removing question:', err);
      toast.error('Failed to remove question. Please check if the backend API is running.');
    }
  };

  // Handler for editing question text
  const handleQuestionTextChange = async (categoryId, questionId, newText) => {
    const question = curriculumData
      .find(c => c.id === categoryId)?.questions
      .find(q => q.id === questionId);
    
    if (!question) return;
    
    // If it's a new question, just update the text without marking modified
    // For existing questions, mark as modified if the text changes
    const shouldMarkModified = !question.isNew;
    
    // Just update the UI state
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: category.questions.map(q => 
                q.id === questionId 
                  ? { ...q, text: newText, isModified: shouldMarkModified ? true : q.isModified }
                  : q
              )
            } 
          : category
      )
    );
  };
  
  // Handler for adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/interview/categories`, {
        name: newCategory.name,
        description: newCategory.description || `Questions for ${newCategory.name}`,
        default_time: parseInt(newCategory.default_time) || 20,
        job_id: parseInt(id)
      }, { headers });
      
      // Add new category to UI after successful API call
      const newCategoryData = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        defaultTime: response.data.default_time,
        icon: categoryIconMap[response.data.name] || defaultCategoryIcon,
        questions: []
      };
      
      setCurriculumData([...curriculumData, newCategoryData]);
      
      // Reset form
      setNewCategory({ name: '', description: '', default_time: 20 });
      setShowNewCategoryForm(false);
      
      toast.success('Category added successfully');
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category. Please check if the backend API is running.');
    }
  };

  // Handler for saving all changes at once
  const handleSaveCurriculum = async () => {
    try {
      const headers = await getAuthHeaders();
      
      // First save all modified or new questions
      const modifiedQuestionsPromises = [];
      
      curriculumData.forEach(category => {
        category.questions.forEach(question => {
          // Skip questions with empty text
          if (!question.text.trim()) {
            // Remove empty questions from UI
            setCurriculumData(prevData => 
              prevData.map(cat => 
                cat.id === category.id 
                  ? {
                      ...cat,
                      questions: cat.questions.filter(q => 
                        q.id !== question.id || q.text.trim() !== ''
                      )
                    } 
                  : cat
              )
            );
            return;
          }
          
          // Handle new questions
          if (question.isNew) {
            const promise = axios.post(`${API_BASE_URL}/interview/questions`, {
              text: question.text,
              status: statusMap[question.status] || 'active',
              must_ask: question.mustAsk !== undefined ? question.mustAsk : getMustAskFlag(question.status),
              category_id: category.id,
              job_id: parseInt(id)
            }, { headers });
            
            modifiedQuestionsPromises.push({
              promise,
              categoryId: category.id,
              questionId: question.id,
              isNew: true
            });
          }
          // Handle modified existing questions
          else if (question.isModified) {
            const promise = axios.put(`${API_BASE_URL}/interview/questions/${question.id}`, {
              text: question.text,
              status: statusMap[question.status] || 'active',
              must_ask: question.mustAsk !== undefined ? question.mustAsk : getMustAskFlag(question.status)
            }, { headers });
            
            modifiedQuestionsPromises.push({
              promise,
              categoryId: category.id,
              questionId: question.id,
              isNew: false
            });
          }
        });
      });
      
      // Wait for all question updates to complete
      const questionResults = await Promise.allSettled(modifiedQuestionsPromises.map(item => item.promise));
      
      // Update the UI with real IDs for new questions
      questionResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && modifiedQuestionsPromises[index].isNew) {
          const { categoryId, questionId } = modifiedQuestionsPromises[index];
          const responseData = result.value.data;
          
          setCurriculumData(prevData => 
            prevData.map(category => 
              category.id === categoryId 
                ? {
                    ...category,
                    questions: category.questions.map(q => 
                      q.id === questionId
                        ? {
                            id: responseData.id,
                            text: responseData.text,
                            status: reverseStatusMap[responseData.status] || 'Must Ask',
                            mustAsk: responseData.must_ask,
                            isNew: false,
                            isModified: false
                          }
                        : q
                    )
                  } 
                : category
            )
          );
        } else if (result.status === 'fulfilled') {
          // Clear the isModified flag for successfully saved questions
          const { categoryId, questionId } = modifiedQuestionsPromises[index];
          
          setCurriculumData(prevData => 
            prevData.map(category => 
              category.id === categoryId 
                ? {
                    ...category,
                    questions: category.questions.map(q => 
                      q.id === questionId
                        ? { ...q, isModified: false }
                        : q
                    )
                  } 
                : category
            )
          );
        }
      });
      
      // Now update category time allocations
      const categoryPromises = curriculumData.map(category => 
        axios.patch(`${API_BASE_URL}/interview/categories/${category.id}`, {
          default_time: category.defaultTime
        }, { headers })
      );
      
      await Promise.all(categoryPromises);
      
      // Show success message
      toast.success('Interview persona saved successfully!');
      setSavedMessage('Interview persona saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving curriculum:', err);
      toast.error('Failed to save interview persona. Please check if the backend API is running.');
    }
  };

  // Calculate total time
  const totalTime = curriculumData.reduce((total, category) => total + category.defaultTime, 0);

  // Get status badge class based on status and theme
  const getStatusClass = (status) => {
    if (isDarkMode) {
      switch (status) {
        case 'Must Ask':
          return 'bg-indigo-900 text-indigo-300 border border-indigo-700';
        case 'If Time Permits':
          return 'bg-blue-900 text-blue-300 border border-blue-700';
        case 'Don&apos;t Ask':
          return 'bg-gray-800 text-gray-300 border border-gray-700';
        default:
          return 'bg-gray-800 text-gray-300 border border-gray-700';
      }
    } else {
      switch (status) {
        case 'Must Ask':
          return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
        case 'If Time Permits':
          return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'Don&apos;t Ask':
          return 'bg-gray-100 text-gray-800 border border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Must Ask':
        return <CheckCircleIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'If Time Permits':
        return <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'Don&apos;t Ask':
        return <XCircleIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get recommended time based on category name
  const getRecommendedTime = (categoryName) => {
    switch (categoryName) {
      case 'Technical Skills':
      case 'Technical':
        return 30;
      case 'Past Experience':
      case 'Problem Solving':
        return 20;
      case 'Case Study':
        return 25;
      case 'Situation Handling':
        return 15;
      case 'Personality Test':
      case 'Behavioral':
        return 10;
      default:
        return 20;
    }
  };

  // Handler for deleting a category
  const handleDeleteCategory = async (categoryId) => {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this category and all its questions? This action cannot be undone.')) {
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      
      // Call the DELETE endpoint to remove the category
      await axios.delete(`${API_BASE_URL}/interview/categories/${categoryId}`, { headers });
      
      // Update UI after successful API call
      setCurriculumData(curriculumData.filter(category => category.id !== categoryId));
      
      toast.success('Category and its questions removed successfully');
    } catch (err) {
      console.error('Error removing category:', err);
      toast.error('Failed to remove category. Please check if the backend API is running.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <h2 className="text-red-800 dark:text-red-300 font-medium">Error</h2>
            <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
              Return to Job Details
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Job Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Job
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{job?.title || 'Interview Persona'}</h1>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mr-4">
              <span className="block text-xs uppercase">Total Time</span>
              <span className="font-medium text-lg flex items-center text-indigo-600 dark:text-indigo-400">
                <ClockIcon className="h-5 w-5 mr-1" />
                {totalTime} min
              </span>
            </div>
            
            <button
              onClick={handleSaveCurriculum}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Persona
            </button>
          </div>
        </div>
        
        {savedMessage && (
          <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
            {savedMessage}
          </div>
        )}
        
        {/* Interview Curriculum Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Persona Builder</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Create a structured interview plan with specific categories and questions
            </p>
          </div>
          
          <div className="p-6">
            {/* Curriculum Categories */}
            <div className="space-y-8">
              {curriculumData.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="ml-3 p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Delete category"
                        title="Delete category"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mt-4 md:mt-0 w-full md:w-72">
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Time Allocation
                        </label>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{category.defaultTime} min</span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={category.defaultTime}
                          onChange={(e) => handleTimeChange(category.id, e.target.value)}
                          className="w-full h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 accent-indigo-600"
                        />
                        
                        {/* Time labels */}
                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>5m</span>
                          <span>20m</span>
                          <span>40m</span>
                          <span>60m</span>
                        </div>
                        
                        {/* Recommended time indicator */}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <svg className="h-3 w-3 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                          </svg>
                          <span>Recommended: {getRecommendedTime(category.name)} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Questions */}
                  <div className="mt-4 space-y-3">
                    {category.questions.map((question) => (
                      <div 
                        key={question.id} 
                        className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 flex items-start justify-between"
                      >
                        <div className="flex-1 mr-4">
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleQuestionTextChange(category.id, question.id, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter question..."
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <div className="mr-2 flex space-x-1">
                            <button
                              onClick={() => handleQuestionStatusChange(category.id, question.id, 'Must Ask')}
                              title="Must Ask"
                              className={`p-1.5 rounded-md transition-colors ${
                                question.status === 'Must Ask' 
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-700' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                              }`}
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleQuestionStatusChange(category.id, question.id, 'If Time Permits')}
                              title="If Time Permits"
                              className={`p-1.5 rounded-md transition-colors ${
                                question.status === 'If Time Permits' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                              }`}
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleQuestionStatusChange(category.id, question.id, 'Don&apos;t Ask')}
                              title="Don&apos;t Ask"
                              className={`p-1.5 rounded-md transition-colors ${
                                question.status === 'Don&apos;t Ask' 
                                  ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-600' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                          
                          {/* Only show save button if question is new or modified */}
                          {(question.isNew || question.isModified) && (
                            <button
                              onClick={() => handleSaveQuestion(category.id, question.id, question.text)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 mr-1"
                              aria-label="Save question"
                              title="Save question"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoveQuestion(category.id, question.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Remove question"
                            title="Remove question"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Question */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleAddQuestion(category.id)}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Add Question to {category.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add New Category */}
            {showNewCategoryForm ? (
              <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Add New Category</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Technical Skills"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Brief description of the category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      step="5"
                      value={newCategory.default_time}
                      onChange={(e) => setNewCategory({...newCategory, default_time: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Add Category
                    </button>
                    <button
                      onClick={() => setShowNewCategoryForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={() => setShowNewCategoryForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Add New Category
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Question Status Legend */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Question Status Legend</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass('Must Ask')}`}>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span>Must Ask</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass('If Time Permits')}`}>
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>If Time Permits</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass('Don&apos;t Ask')}`}>
                <XCircleIcon className="h-4 w-4 mr-1" />
                <span>Don&apos;t Ask</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Export with dynamic to disable SSR for this page
export default dynamic(() => Promise.resolve(InterviewPage), { ssr: false }); 