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
  ArrowLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
];

export default function EditJob() {
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [managers, setManagers] = useState([]);
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Fetch job data and managers
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch job data
        const jobResponse = await jobs.getById(id);
        setJob(jobResponse.data);
        setFormData(jobResponse.data);
        
        // Fetch hiring managers if user is HR
        if (user?.role === 'HR') {
          try {
            const managersResponse = await hiringManagers.getAll();
            setManagers(managersResponse.data);
          } catch (error) {
            console.error('Failed to fetch hiring managers:', error);
            toast.error('Failed to load hiring managers list');
          }
        }
      } catch (error) {
        toast.error('Failed to fetch job details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, router, user]);

  // Check permissions
  useEffect(() => {
    // Redirect if unauthorized
    if (user && job) {
      const canEdit = user?.role === 'HR' || (user?.role === 'Hiring Manager' && job.assigned_to === user.id);
      if (!canEdit) {
        toast.error('You do not have permission to edit this job');
        router.push(`/jobs/${id}`);
      }
    }
  }, [user, job, router, id]);

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
    setSubmitError('');

    try {
      // Process the form data
      const jobData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      };

      await jobs.update(id, jobData);
      toast.success('Job updated successfully');
      router.push(`/jobs/${id}`);
    } catch (error) {
      console.error('Job update error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update job';
      setSubmitError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      toast.error('Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  // Handle loading state
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

  // Job not found
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

  // Main edit form
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => router.push(`/jobs/${id}`)}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Job Details
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
            {/* Status color bar */}
            <div className={`h-2 ${
              job.status === 'open' ? 'bg-green-500' : 
              job.status === 'closed' ? 'bg-red-500' : 
              job.status === 'in_review' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <PencilIcon className="h-6 w-6 mr-2 text-indigo-500" />
                Edit Job: {job.title}
              </h1>

              {submitError && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                      value={formData.title || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={6}
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                      value={formData.description || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      id="requirements"
                      rows={6}
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                      value={formData.requirements || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          required
                          className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                          value={formData.location || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Department
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          required
                          className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                          value={formData.department || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Salary
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="number"
                          name="salary"
                          id="salary"
                          min="0"
                          step="1000"
                          className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                          value={formData.salary || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Closing Date
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="date"
                          name="end_date"
                          id="end_date"
                          required
                          className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                          value={formData.end_date || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                          name="status"
                          id="status"
                          required
                          className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                          value={formData.status || ''}
                          onChange={handleChange}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {user?.role === 'HR' && (
                      <div>
                        <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Assigned To
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BriefcaseIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <select
                            name="assigned_to"
                            id="assigned_to"
                            className="pl-10 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
                            value={formData.assigned_to || ''}
                            onChange={handleChange}
                          >
                            <option value="">Not Assigned</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name || manager.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${id}`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 