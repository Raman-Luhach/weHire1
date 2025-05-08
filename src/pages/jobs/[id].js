import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, hiringManagers } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PencilIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
];

export default function JobDetails() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');
  const [savingManager, setSavingManager] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await jobs.getById(id);
        setJob(response.data);
        setFormData(response.data);
        
        // Set the selected manager based on the job data
        if (response.data.assigned_to) {
          setSelectedManager(response.data.assigned_to.toString());
        }
      } catch (error) {
        toast.error('Failed to fetch job details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  // Function to open the assign manager modal
  const openManagerModal = async () => {
    // Fetch managers if needed
    if (managers.length === 0) {
      try {
        const response = await hiringManagers.getAll();
        setManagers(response.data);
      } catch (error) {
        console.error('Failed to fetch hiring managers:', error);
        toast.error('Failed to load hiring managers');
      }
    }
    
    setShowManagerModal(true);
  };

  // Function to save the selected manager
  const saveManager = async () => {
    setSavingManager(true);
    
    try {
      // Create a partial job update with just the assigned_to field
      const updateData = {
        ...job,
        assigned_to: selectedManager ? parseInt(selectedManager) : null
      };
      
      const response = await jobs.update(id, updateData);
      setJob(response.data);
      toast.success('Hiring manager updated successfully');
      setShowManagerModal(false);
    } catch (error) {
      console.error('Failed to update manager:', error);
      toast.error('Failed to update hiring manager');
    } finally {
      setSavingManager(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      };

      await jobs.update(id, jobData);
      setJob(jobData);
      setIsEditing(false);
      toast.success('Job updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update job');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobs.delete(id);
      toast.success('Job deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete job');
    }
  };

  const navigateToInterviewSchedule = () => {
    router.push(`/jobs/${id}/interview`);
  };

  const navigateToViewCandidates = () => {
    router.push(`/jobs/${id}/candidates`);
  };

  // Get status badge styling
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />;
      case 'closed':
        return <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />;
      case 'in_review':
        return <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 animate-pulse transition-colors duration-200">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-indigo-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="text-xl font-medium text-indigo-700 dark:text-white">Loading job details...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Job not found</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 rounded-md bg-red-100 dark:bg-red-800 text-red-800 dark:text-white hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200 flex items-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Return to dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const canEdit = user?.role === 'HR' || (user?.role === 'Hiring Manager' && job.assigned_to === user.id);
  const isHiringManager = user?.role === 'Hiring Manager';
  const isHR = user?.role === 'HR';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <button
              onClick={() => {
                if (user?.role === 'HR') {
                  router.push('/hr');
                } else if (user?.role === 'Hiring Manager') {
                  router.push('/manager');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            
            {/* Job Management Controls */}
            <div className="flex flex-wrap gap-3">
              {isHR && (
                <>
                  <button
                    onClick={() => router.push(`/jobs/${job.id}/interview-fix`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    InterviewFix
                  </button>
                  
                  <button
                    onClick={() => router.push(`/jobs/${job.id}/intervet`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    InterVet
                  </button>
                </>
              )}
              
              {/* View Candidates button - available for both HR and Hiring Manager */}
              <button
                onClick={navigateToViewCandidates}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
              >
                <UserGroupIcon className="h-4 w-4 mr-2" />
                View Candidates
              </button>
              
              {isHiringManager && (
                <button
                  onClick={navigateToInterviewSchedule}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                  Interview Persona
                </button>
              )}
            </div>
          </div>

          {/* Main Job Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Status color bar */}
            <div className={`h-2 ${
              job.status === 'open' ? 'bg-green-500' : 
              job.status === 'closed' ? 'bg-red-500' : 
              job.status === 'in_review' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            
            {/* Job Header with Key Details */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Department */}
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Department</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.department || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                        <MapPinIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.location || 'Remote'}</p>
                      </div>
                    </div>
                    
                    {/* Salary */}
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                        <CurrencyDollarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Salary</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.salary ? `$${job.salary.toLocaleString()}` : 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {/* Deadline */}
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                        <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Deadline</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(job.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hiring Manager Info - only show for HR */}
                  {isHR && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                            <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hiring Manager</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {job.assigned_manager?.username || job.assigned_manager?.name || 'No manager assigned'}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={openManagerModal}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all duration-200"
                        >
                          <PencilIcon className="h-4 w-4 mr-1.5" />
                          {job.assigned_manager ? 'Change Manager' : 'Assign Manager'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400" />
                  Job Description
                </h2>
                <div className="prose max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="whitespace-pre-line">{job.description || 'No description available.'}</p>
                </div>
              </div>
              
              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400" />
                    Requirements
                  </h2>
                  <div className="prose max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-line">{job.requirements}</p>
                  </div>
                </div>
              )}
              
              {/* Interview Summary Section - Directly embedded on the page */}
              {isHR && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400" />
                    Interview Summary
                  </h2>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Interview Progress */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interview Progress</h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Candidate Screening</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">8/15</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '53%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Interviews Scheduled</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">5/15</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '33%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Interviews Completed</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">3/15</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>

                      {/* Average Rating */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Average Candidate Rating</h3>
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">4.2</div>
                            <div className="flex items-center justify-center mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'
                                  } ${star === 4 ? 'fill-yellow-500 opacity-60' : ''}`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Based on 3 completed interviews</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Candidates by Stage */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Candidates by Stage</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">15</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Screening</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">5</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">InterVet</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">InterFix</p>
                        </div>
                      </div>
                    </div>

                    {/* Stage Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stage Distribution</h3>
                      <div className="h-64 flex items-end justify-around px-2">
                        {[
                          { stage: 'Applied', count: 15, color: 'bg-gray-500' },
                          { stage: 'Screening', count: 7, color: 'bg-blue-500' },
                          { stage: 'InterVet', count: 5, color: 'bg-yellow-500' },
                          { stage: 'InterFix', count: 3, color: 'bg-purple-500' },
                          { stage: 'Hired', count: 0, color: 'bg-green-500' }
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {item.count > 0 ? `${Math.round((item.count / 15) * 100)}%` : '0%'}
                            </div>
                            <div 
                              className={`w-12 ${item.color} rounded-t-md`} 
                              style={{ height: item.count > 0 ? `${Math.max((item.count / 15) * 100, 10)}%` : '10px', opacity: item.count > 0 ? 1 : 0.3 }}
                            ></div>
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
                              {item.stage}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => router.push(`/jobs/${id}/interview-summary`)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        View Detailed Interview Summary
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {isHR && (
            <>
              <button
                onClick={() => router.push(`/jobs/${id}/candidates/upload`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Resumes
              </button>
              
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manager Selection Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
              {job.assigned_manager ? 'Change Hiring Manager' : 'Assign Hiring Manager'}
            </h3>
            
            <div className="mb-6">
              <label htmlFor="manager-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Manager
              </label>
              <select
                id="manager-select"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Not Assigned</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name || manager.username || manager.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowManagerModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={saveManager}
                disabled={savingManager}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {savingManager ? 'Saving...' : 'Save'}
                {!savingManager && <CheckIcon className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 