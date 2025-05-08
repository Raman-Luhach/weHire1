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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();
  const { user } = useAuth();

  // Get unique locations from jobs list
  const locations = [...new Set(jobsList.map(job => job.location))].filter(Boolean);

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
        
        // Sort jobs by creation date (newest first by default)
        const sortedJobs = jobsResponse.data.sort((a, b) => 
          new Date(b.created_at || b.created) - new Date(a.created_at || a.created)
        );
        
        setJobsList(sortedJobs);
        setFilteredJobs(sortedJobs);
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
    setSearchTerm(query);
    applyFilters(query, statusFilter, locationFilter, sortBy);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status, locationFilter, sortBy);
  };
  
  const handleLocationChange = (location) => {
    setLocationFilter(location);
    applyFilters(searchTerm, statusFilter, location, sortBy);
  };
  
  const handleSortChange = (sort) => {
    setSortBy(sort);
    applyFilters(searchTerm, statusFilter, locationFilter, sort);
  };
  
  const applyFilters = (term, status, location, sort) => {
    let result = [...jobsList];
    
    // Filter by search term
    if (term) {
      term = term.toLowerCase();
      result = result.filter(job => 
        (job.title && job.title.toLowerCase().includes(term)) || 
        (job.description && job.description.toLowerCase().includes(term)) ||
        (job.department && job.department.toLowerCase().includes(term)) ||
        (job.location && job.location.toLowerCase().includes(term))
      );
    }
    
    // Filter by status
    if (status) {
      result = result.filter(job => job.status === status);
    }
    
    // Filter by location
    if (location) {
      result = result.filter(job => job.location === location);
    }
    
    // Sort jobs
    result = sortJobs(result, sort);
    
    setFilteredJobs(result);
  };
  
  const sortJobs = (jobs, sortType) => {
    switch (sortType) {
      case 'newest':
        return [...jobs].sort((a, b) => new Date(b.created_at || b.created) - new Date(a.created_at || a.created));
      case 'oldest':
        return [...jobs].sort((a, b) => new Date(a.created_at || a.created) - new Date(b.created_at || b.created));
      case 'title-asc':
        return [...jobs].sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return [...jobs].sort((a, b) => b.title.localeCompare(a.title));
      default:
        return jobs;
    }
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Job
          </button>
        </div>

        <FilterBar
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onLocationChange={handleLocationChange}
          onSortChange={handleSortChange}
          onViewChange={setView}
          view={view}
          locations={locations}
          jobCount={filteredJobs.length}
        />

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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