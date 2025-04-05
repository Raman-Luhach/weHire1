import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, hiringManagers } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

export default function CreateJob() {
  const initialFormData = {
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
    salary: '',
    end_date: new Date().toISOString().split('T')[0], // Default to today
    status: 'draft',
    assigned_to: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if not HR
    if (user && user.role !== 'HR') {
      toast.error('Unauthorized access');
      router.push('/dashboard');
      return;
    }

    const fetchManagers = async () => {
      try {
        console.log('Fetching hiring managers...');
        const response = await hiringManagers.getAll();
        console.log('Hiring managers response:', response.data);
        setManagers(response.data);
      } catch (error) {
        console.error('Failed to fetch hiring managers:', error);
        toast.error('Failed to load hiring managers');
      }
    };

    if (user) {
      fetchManagers();
    }
  }, [user, router]);

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

      console.log('Submitting job data:', jobData);

      const response = await jobs.create(jobData);
      console.log('Job creation response:', response.data);
      toast.success('Job created successfully');
      router.push('/hr');
    } catch (error) {
      console.error('Job creation error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create job';
      setSubmitError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Job</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Fill in the details to create a new job posting
          </p>
        </div>

        {submitError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
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
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                value={formData.title}
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
                rows={4}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                value={formData.description}
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
                rows={4}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  id="department"
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  min="0"
                  step="1000"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assign to Hiring Manager
                </label>
                <select
                  name="assigned_to"
                  id="assigned_to"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                  value={formData.assigned_to}
                  onChange={handleChange}
                >
                  <option value="">Select a Hiring Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 