import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, candidates } from '@/utils/api'; // Import the API utilities
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  FunnelIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function InterFix() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('interview_date');
  const [noticePeriodFilter, setNoticePeriodFilter] = useState('all');
  const [resignedFilter, setResignedFilter] = useState('all');
  const [viewType, setViewType] = useState('card');
  
  const router = useRouter();
  const { id: jobId } = router.query;
  const { user } = useAuth();

  // Fetch job and candidates data
  useEffect(() => {
    if (!jobId || !user) return;

    // Redirect if not HR
    if (user.role !== 'HR') {
      toast.error('You do not have permission to access this page');
      router.push(`/jobs/${jobId}`);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job data using the jobs API utility
        const jobResponse = await jobs.getById(jobId);
        setJob(jobResponse.data);
        
        // Fetch candidates with status >= 1 (all interview fix stage candidates)
        const candidatesResponse = await candidates.getByJobId(jobId, {
          status: 1,
          minStatus: true
        });
        
        setCandidates(candidatesResponse.data);
        setFilteredCandidates(candidatesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, router, user]);

  // Apply filters
  const applyFilters = () => {
    let result = [...candidates];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.phone.toLowerCase().includes(term) ||
        (candidate.tech_stack && candidate.tech_stack.some(tech => tech.toLowerCase().includes(term)))
      );
    }
    
    // Status filter - now using numeric status from backend
    if (statusFilter !== 'all') {
      const statusValue = parseInt(statusFilter);
      result = result.filter(candidate => candidate.status === statusValue);
    }
    
    // Notice period filter
    if (noticePeriodFilter !== 'all') {
      if (noticePeriodFilter === 'short') {
        result = result.filter(candidate => parseInt(candidate.notice_period) <= 30);
      } else if (noticePeriodFilter === 'medium') {
        result = result.filter(candidate => parseInt(candidate.notice_period) > 30 && parseInt(candidate.notice_period) <= 60);
      } else if (noticePeriodFilter === 'long') {
        result = result.filter(candidate => parseInt(candidate.notice_period) > 60);
      }
    }
    
    // Resigned filter
    if (resignedFilter !== 'all') {
      const hasResigned = resignedFilter === 'yes';
      result = result.filter(candidate => candidate.has_resigned === hasResigned);
    }
    
    // Sort candidates
    result = sortCandidates(result, sortBy);
    
    setFilteredCandidates(result);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, noticePeriodFilter, resignedFilter, sortBy, candidates]);

  // Sort candidates
  const sortCandidates = (candidatesList, sortType) => {
    switch (sortType) {
      case 'interview_date':
        return [...candidatesList].sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date));
      case 'name':
        return [...candidatesList].sort((a, b) => a.name.localeCompare(b.name));
      case 'experience':
        return [...candidatesList].sort((a, b) => b.years_experience - a.years_experience);
      case 'notice_period':
        return [...candidatesList].sort((a, b) => parseInt(a.notice_period) - parseInt(b.notice_period));
      case 'expected_ctc':
        return [...candidatesList].sort((a, b) => b.expected_ctc - a.expected_ctc);
      default:
        return candidatesList;
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status display based on numeric status
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Interview Fix';
      case 2:
        return 'Interview Taken';
      case 3:
        return 'Rejected';
      case 4:
        return 'Hired';
      default:
        return 'Unknown';
    }
  };

  // Get status style based on numeric status
  const getStatusStyle = (status) => {
    switch (status) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 2:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 3:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 4:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: '1', label: 'Interview Fix' },
    { value: '2', label: 'Interview Taken' },
    { value: '3', label: 'Rejected' },
    { value: '4', label: 'Hired' },
  ];

  const noticePeriodOptions = [
    { value: 'all', label: 'All Notice Periods' },
    { value: 'short', label: '≤ 30 Days' },
    { value: 'medium', label: '31-60 Days' },
    { value: 'long', label: '> 60 Days' },
  ];

  const resignedOptions = [
    { value: 'all', label: 'All Candidates' },
    { value: 'yes', label: 'Resigned' },
    { value: 'no', label: 'Not Resigned' },
  ];

  const sortOptions = [
    { value: 'interview_date', label: 'Interview Date' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'experience', label: 'Experience' },
    { value: 'notice_period', label: 'Notice Period' },
    { value: 'expected_ctc', label: 'Expected CTC' },
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push(`/jobs/${jobId}`)}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Job
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              InterFix Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Schedule and manage interviews for qualified candidates
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/jobs/${jobId}/intervet`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              View InterVet
            </button>
            <button
              onClick={() => router.push(`/jobs/${jobId}/candidates`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              All Candidates
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Candidates</h3>
            <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
              <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                {filteredCandidates.length} Interviews
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            {/* Search Bar and View Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search candidates by name, contact, or tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* View Toggle Buttons */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 flex items-center">
                <button
                  onClick={() => setViewType('card')}
                  className={`p-1.5 rounded-md ${
                    viewType === 'card'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-gray-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-1.5 rounded-md ${
                    viewType === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-gray-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notice Period
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={noticePeriodFilter}
                    onChange={(e) => setNoticePeriodFilter(e.target.value)}
                  >
                    {noticePeriodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resigned Status
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={resignedFilter}
                    onChange={(e) => setResignedFilter(e.target.value)}
                  >
                    {resignedOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List/Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No candidates found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try adjusting your filters to see more candidates.
            </p>
          </div>
        ) : viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                onClick={() => router.push(`/jobs/${jobId}/candidates/${candidate.id}`)}
              >
                {/* Status Bar */}
                <div className={`h-2 ${
                  candidate.status === 1 ? 'bg-yellow-500' : 
                  candidate.status === 2 ? 'bg-purple-500' : 
                  candidate.status === 3 ? 'bg-red-500' : 
                  candidate.status === 4 ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4 flex-shrink-0">
                        {candidate.avatar_url ? (
                          <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{candidate.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(candidate.status)}`}>
                      {getStatusText(candidate.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      <span>
                        {candidate.interview_date ? formatDateTime(candidate.interview_date) : 'No interview scheduled'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <ClockIcon className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400" />
                      <span>Notice: {candidate.notice_period || 'Not specified'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
                      <span>{candidate.preferred_location || 'Location not specified'}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{candidate.phone}</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interview Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notice Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resigned
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => router.push(`/jobs/${jobId}/candidates/${candidate.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {candidate.avatar_url ? (
                            <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {candidate.interview_date ? formatDateTime(candidate.interview_date) : 'Not scheduled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{candidate.notice_period || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.has_resigned 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {candidate.has_resigned ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(candidate.status)}`}>
                        {getStatusText(candidate.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 