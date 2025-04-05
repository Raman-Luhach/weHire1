import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, hiringManagers } from '@/utils/api';
import Layout from '@/components/Layout';
import JobCard from '@/components/JobCard';
import FilterBar from '@/components/FilterBar';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function HRDashboard() {
  const [jobsList, setJobsList] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('card');
  const [hiringManagersList, setHiringManagersList] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'HR') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [jobsResponse, managersResponse] = await Promise.all([
          jobs.getAll(),
          hiringManagers.getAll(),
        ]);
        setJobsList(jobsResponse.data);
        setFilteredJobs(jobsResponse.data);
        setHiringManagersList(managersResponse.data);
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleSearch = (query) => {
    const filtered = jobsList.filter((job) =>
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleStatusChange = (status) => {
    if (!status) {
      setFilteredJobs(jobsList);
      return;
    }
    const filtered = jobsList.filter((job) => job.status === status);
    setFilteredJobs(filtered);
  };

  const handleDelete = (jobId) => {
    setJobsList((prev) => prev.filter((job) => job.id !== jobId));
    setFilteredJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            HR Dashboard
          </h1>
          <button
            onClick={handleCreateJob}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Job
          </button>
        </div>

        <FilterBar
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onViewChange={setView}
          view={view}
        />

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No jobs found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className={view === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                view={view}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 