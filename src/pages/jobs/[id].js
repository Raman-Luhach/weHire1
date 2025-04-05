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
  CheckIcon
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
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            
            {/* Job Management Controls */}
            <div className="flex flex-wrap gap-3">
              {canEdit && (
                <>
                  <button
                    onClick={() => router.push(`/jobs/${id}/edit`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Job
                  </button>
                  {user?.role === 'HR' && (
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  )}
                </>
              )}
              
              {isHiringManager && (
                <>
                  <button
                    onClick={navigateToInterviewSchedule}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Interview Persona
                  </button>
                  
                  <button
                    onClick={navigateToViewCandidates}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    View Candidates
                  </button>
                </>
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
                  
                  {/* Hiring Manager Info */}
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
                          <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hiring Manager</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {job.assigned_manager?.username || job.assigned_manager?.name || 'No manager assigned'}
                          </p>
                        </div>
                      </div>
                      
                      {isHR && (
                        <button
                          onClick={openManagerModal}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/30 border border-indigo-300 dark:border-indigo-700 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-1.5" />
                          {job.assigned_manager ? 'Change Manager' : 'Assign Manager'}
                        </button>
                      )}
                    </div>
                  </div>
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
            </div>
          </div>
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