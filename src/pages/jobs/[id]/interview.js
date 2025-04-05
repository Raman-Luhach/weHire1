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

// Use dynamic import with ssr: false to avoid prerendering issues
const InterviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');
  
  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Theme check - safer way to check dark mode
  const isDarkMode = mounted && theme === 'dark';
  
  // Interview curriculum data
  const [curriculumData, setCurriculumData] = useState([
    {
      id: 1,
      name: 'Technical',
      description: 'Evaluate candidate\'s technical abilities and knowledge',
      defaultTime: 30,
      icon: <AcademicCapIcon className="h-5 w-5" />,
      questions: [
        { id: 101, text: 'Assess coding skills and technical knowledge', status: 'Must Ask' },
        { id: 102, text: 'Evaluate problem-solving approach', status: 'Must Ask' }
      ]
    },
    {
      id: 2,
      name: 'Past Experience',
      description: 'Review relevant work history and achievements',
      defaultTime: 20,
      icon: <BriefcaseIcon className="h-5 w-5" />,
      questions: [
        { id: 201, text: 'Discuss relevant projects and contributions', status: 'Must Ask' },
        { id: 202, text: 'Evaluate growth and learning trajectory', status: 'If Time Permits' }
      ]
    },
    {
      id: 3,
      name: 'Case Study',
      description: 'Present real-world scenarios to evaluate analytical abilities',
      defaultTime: 25,
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      questions: [
        { id: 301, text: 'Present product/business case to analyze', status: 'Must Ask' },
        { id: 302, text: 'Evaluate strategic thinking and solution quality', status: 'Must Ask' }
      ]
    },
    {
      id: 4,
      name: 'Situation Handling',
      description: 'Assess how candidates respond to challenging scenarios',
      defaultTime: 15,
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      questions: [
        { id: 401, text: 'Present conflict resolution scenarios', status: 'Must Ask' },
        { id: 402, text: 'Evaluate crisis management abilities', status: 'If Time Permits' }
      ]
    },
    {
      id: 5,
      name: 'Personality Test',
      description: 'Assess cultural fit and interpersonal qualities',
      defaultTime: 10,
      icon: <UserGroupIcon className="h-5 w-5" />,
      questions: [
        { id: 501, text: 'Evaluate team collaboration style', status: 'Must Ask' },
        { id: 502, text: 'Assess adaptability and growth mindset', status: 'Must Ask' }
      ]
    }
  ]);
  
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    const fetchJob = async () => {
      // Don't try to fetch data if id is not available yet
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await jobs.getById(id);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
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
  const handleQuestionStatusChange = (categoryId, questionId, newStatus) => {
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: category.questions.map(question => 
                question.id === questionId 
                  ? { ...question, status: newStatus } 
                  : question
              )
            } 
          : category
      )
    );
  };

  // Handler for adding a new question
  const handleAddQuestion = (categoryId) => {
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: [
                ...category.questions,
                {
                  id: Date.now(), // Use timestamp as a temporary ID
                  text: '',
                  status: 'Must Ask'
                }
              ]
            } 
          : category
      )
    );
  };

  // Handler for removing a question
  const handleRemoveQuestion = (categoryId, questionId) => {
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
  };

  // Handler for editing question text
  const handleQuestionTextChange = (categoryId, questionId, newText) => {
    setCurriculumData(
      curriculumData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              questions: category.questions.map(question => 
                question.id === questionId 
                  ? { ...question, text: newText } 
                  : question
              )
            } 
          : category
      )
    );
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

  // Handler for saving curriculum
  const handleSaveCurriculum = () => {
    // Here you would send the curriculum data to your API
    console.log('Saving curriculum:', curriculumData);
    
    // Show success message
    setSavedMessage('Interview persona saved successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Add the getRecommendedTime function to the component, above the return statement
  const getRecommendedTime = (categoryName) => {
    switch (categoryName) {
      case 'Technical':
        return 30;
      case 'Past Experience':
        return 20;
      case 'Case Study':
        return 25;
      case 'Situation Handling':
        return 15;
      case 'Personality Test':
        return 10;
      default:
        return 20;
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
                          
                          <button
                            onClick={() => handleRemoveQuestion(category.id, question.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Remove question"
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