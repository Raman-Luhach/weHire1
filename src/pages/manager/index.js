import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs } from '@/utils/api';
import Layout from '@/components/Layout';
import JobCard from '@/components/JobCard';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ViewColumnsIcon, 
  ListBulletIcon, 
  ChevronDownIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function ManagerDashboard() {
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewType, setViewType] = useState('cards');
  const router = useRouter();
  const { user } = useAuth();

  // Get unique locations from all jobs
  const locations = [...new Set(allJobs.map(job => job.location))].filter(Boolean);

  useEffect(() => {
    // Check if the user is logged in and is a Hiring Manager
    if (!user) {
      return;
    }

    if (user.role !== 'Hiring Manager') {
      router.push('/');
      toast.error('You must be a Hiring Manager to view this page');
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      try {
        // In a real app, we would use the user's ID
        const managerId = user.id;
        
        if (!managerId) {
          console.error('No manager ID available, cannot fetch jobs');
          toast.error('User ID not found. Please try logging in again.');
          return;
        }
        
        console.log('Fetching jobs for manager ID:', managerId);
        
        // Use the dedicated API endpoint for manager jobs
        const response = await jobs.getByManagerId(managerId);
        console.log(`Retrieved ${response.data.length} jobs for manager ID ${managerId}`);
        
        // Sort jobs by creation date (newest first by default)
        const sortedJobs = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setAllJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to fetch jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, router]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, statusFilter, locationFilter, sortBy);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    applyFilters(searchTerm, status, locationFilter, sortBy);
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setLocationFilter(location);
    applyFilters(searchTerm, statusFilter, location, sortBy);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    applyFilters(searchTerm, statusFilter, locationFilter, sort);
  };

  const applyFilters = (term, status, location, sort) => {
    let result = [...allJobs];
    
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
    if (status !== 'all') {
      result = result.filter(job => job.status === status);
    }
    
    // Filter by location
    if (location !== 'all') {
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

  const handleDeleteJob = (id) => {
    setAllJobs(prev => prev.filter(job => job.id !== id));
    setFilteredJobs(prev => prev.filter(job => job.id !== id));
    toast.success('Job deleted successfully');
  };

  const handleViewChange = (type) => {
    setViewType(type);
  };

  // Total jobs count
  const totalJobs = filteredJobs.length;

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'in_review', label: 'In Review' },
    { value: 'draft', label: 'Draft' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hiring Manager Dashboard</h1>
          <div className="mt-3 md:mt-0 flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">
            <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-indigo-800 dark:text-indigo-300 font-medium">
              {totalJobs} Jobs Available
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Jobs</h3>
            <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
              <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                {totalJobs} Jobs Available
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            {/* Search Bar with View Toggle */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search job titles or descriptions..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-md h-[38px]">
                <button
                  onClick={() => handleViewChange('cards')}
                  className={`flex items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 ${
                    viewType === 'cards'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Card view"
                  title="Card view"
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewChange('list')}
                  className={`flex items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 ${
                    viewType === 'list'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort by Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Filter by Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Filter by Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Location
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                    value={locationFilter}
                    onChange={handleLocationChange}
                  >
                    <option value="all" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                        {location}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className={viewType === 'cards' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" 
            : "flex flex-col space-y-4 mt-6"
          }>
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                view={viewType === 'cards' ? 'card' : 'list'}
                onDelete={handleDeleteJob}
                isManager={true}
                expandable={false}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6 text-center border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                ? "Try adjusting your search or filter criteria" 
                : "You don't have any jobs assigned to you yet."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
} 