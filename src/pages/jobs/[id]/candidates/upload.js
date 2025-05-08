import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  UserPlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function UploadCandidates() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await jobs.getById(id);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Redirect if user is not HR
  useEffect(() => {
    if (user && user.role !== 'HR') {
      toast.error('You do not have permission to access this page');
      router.push(`/jobs/${id}`);
    }
  }, [user, id, router]);

  const handleNavigateToCreate = () => {
    router.push(`/jobs/${id}/candidates/create`);
  };

  const handleBulkUpload = () => {
    // This would typically handle the file upload process
    toast.info('Bulk upload functionality is under development');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        {job && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Candidates for "{job.title}"
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {job.location} • {job.department}
                </p>
              </div>
              <button
                onClick={() => router.push(`/jobs/${id}`)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Job
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-indigo-500 mr-2" />
              Add Candidates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose how you want to add candidates to this job posting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Create Individual Candidate */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                    <UserPlusIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Create Candidate
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add a single candidate with detailed information including education, experience, skills, and more.
                </p>
                <button
                  onClick={handleNavigateToCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Individual Candidate
                </button>
              </div>
            </div>

            {/* Option 2: Bulk Upload */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mr-4">
                    <DocumentArrowUpIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Bulk Upload
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload multiple candidates at once by importing a CSV file or uploading resumes in bulk.
                </p>
                <div className="mt-1 flex justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md mb-4">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV, Excel, or ZIP files up to 10MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBulkUpload}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center"
                >
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload Candidates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 