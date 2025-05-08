import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, candidates as candidatesApi } from '@/utils/api'; // Import the API utilities
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
  ChevronRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function InterviewFix() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [callStatusFilter, setCallStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('interview_date');
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
        
        // Fetch candidates with status = 1 (interview fix stage candidates)
        const candidatesResponse = await candidatesApi.getByJobId(jobId, {
          status: 1
        });
        
        // Add isSelected property to each candidate for selection tracking
        const candidatesWithSelection = candidatesResponse.data.map(candidate => ({
          ...candidate,
          isSelected: false,
          // If candidate has no call_status, default to 'pending'
          call_status: candidate.call_status || 'pending'
        }));
        
        setCandidates(candidatesWithSelection);
        setFilteredCandidates(candidatesWithSelection);
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
    
    // Call status filter
    if (callStatusFilter !== 'all') {
      result = result.filter(candidate => candidate.call_status === callStatusFilter);
    }
    
    // Sort candidates
    result = sortCandidates(result, sortBy);
    
    // Add isSelected property to each candidate
    result = result.map(candidate => ({
      ...candidate,
      isSelected: selectedCandidates.includes(candidate.id)
    }));
    
    setFilteredCandidates(result);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, callStatusFilter, sortBy, candidates, selectedCandidates]);

  // Toggle candidate selection
  const toggleCandidateSelection = (id) => {
    setSelectedCandidates(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(candidateId => candidateId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Clear selections when turning off selection mode
      setSelectedCandidates([]);
    }
  };
  
  // Make calls to selected candidates
  const makeCallsToSelected = () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    
    // Find the first selected candidate
    const firstCandidate = candidates.find(c => c.id === selectedCandidates[0]);
    if (firstCandidate && firstCandidate.phone) {
      // Open the phone dialer with the first candidate's number
      window.open(`tel:${firstCandidate.phone}`);
      
      // Show a notification about handling the rest
      if (selectedCandidates.length > 1) {
        toast.success(`Calling first candidate. Continue with the rest after this call.`);
      }
    } else {
      toast.error('Selected candidate has no phone number');
    }
  };
  
  // Update call status for selected candidates
  const updateCallStatus = async (status) => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update each selected candidate in our local state first
      const updatedCandidates = candidates.map(candidate => {
        if (selectedCandidates.includes(candidate.id)) {
          return { ...candidate, call_status: status };
        }
        return candidate;
      });
      
      setCandidates(updatedCandidates);
      
      // In a real app, you would also update the backend
      // For each selected candidate, update their call_status in the database
      /* Example API call if backend supports it:
      const updatePromises = selectedCandidates.map(candidateId => 
        candidatesApi.update(candidateId, { call_status: status })
      );
      await Promise.all(updatePromises);
      */
      
      // Show success message
      toast.success(`Updated ${selectedCandidates.length} candidate(s) status to "${getCallStatusText(status)}"`);
      
      // Reset selection after update
      setSelectedCandidates([]);
      
    } catch (error) {
      console.error('Error updating call status:', error);
      toast.error('Failed to update call status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort candidates
  const sortCandidates = (candidatesList, sortType) => {
    switch (sortType) {
      case 'interview_date':
        return [...candidatesList].sort((a, b) => new Date(a.interview_date || 0) - new Date(b.interview_date || 0));
      case 'name':
        return [...candidatesList].sort((a, b) => a.name.localeCompare(b.name));
      case 'experience':
        return [...candidatesList].sort((a, b) => b.years_experience - a.years_experience);
      case 'recent':
        return [...candidatesList].sort((a, b) => new Date(b.application_date) - new Date(a.application_date));
      default:
        return candidatesList;
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
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

  // Get call status text
  const getCallStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled Successfully';
      case 'not_responded':
        return 'Not Responded';
      case 'declined':
        return 'Candidate Declined';
      case 'failed':
        return 'Call Failed';
      case 'pending':
      default:
        return 'Pending Call';
    }
  };

  // Get call status style
  const getCallStatusStyle = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'not_responded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'failed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Get call status icon
  const getCallStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'not_responded':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'declined':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'pending':
      default:
        return <PhoneIcon className="h-5 w-5 text-blue-500" />;
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

  const callStatusOptions = [
    { value: 'all', label: 'All Call Statuses' },
    { value: 'pending', label: 'Pending Call' },
    { value: 'scheduled', label: 'Scheduled Successfully' },
    { value: 'not_responded', label: 'Not Responded' },
    { value: 'declined', label: 'Candidate Declined' },
    { value: 'failed', label: 'Call Failed' },
  ];

  const sortOptions = [
    { value: 'interview_date', label: 'Interview Date' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'experience', label: 'Experience' },
    { value: 'recent', label: 'Recently Applied' },
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
              InterviewFix Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and track interview scheduling for {job?.title}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleSelectionMode}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                selectionMode 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700' 
                : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {selectionMode ? 'Exit Selection' : 'Select Candidates'}
            </button>
            
            {selectionMode && (
              <>
                <button
                  onClick={makeCallsToSelected}
                  disabled={selectedCandidates.length === 0}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    selectedCandidates.length > 0
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-green-400 cursor-not-allowed'
                  }`}
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call Selected ({selectedCandidates.length})
                </button>
                
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      disabled={selectedCandidates.length === 0}
                      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        selectedCandidates.length > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-indigo-400 cursor-not-allowed'
                      }`}
                      id="menu-button"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={() => document.getElementById('status-dropdown').classList.toggle('hidden')}
                    >
                      Update Status
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                  <div
                    id="status-dropdown"
                    className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex="-1"
                  >
                    <div className="py-1" role="none">
                      <button
                        onClick={() => updateCallStatus('scheduled')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                        Scheduled Successfully
                      </button>
                      <button
                        onClick={() => updateCallStatus('not_responded')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <ClockIcon className="h-4 w-4 mr-2 text-yellow-500" />
                        Not Responded
                      </button>
                      <button
                        onClick={() => updateCallStatus('declined')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2 text-red-500" />
                        Candidate Declined
                      </button>
                      <button
                        onClick={() => updateCallStatus('failed')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <ExclamationCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Call Failed
                      </button>
                      <button
                        onClick={() => updateCallStatus('pending')}
                        className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <PhoneIcon className="h-4 w-4 mr-2 text-blue-500" />
                        Reset to Pending
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Candidates</h3>
            <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
              <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                {filteredCandidates.length} Candidates
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            {/* Search Bar and View Controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search candidates by name, email, phone, or skills"
                />
              </div>
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-md h-[38px]">
                <button
                  onClick={() => setViewType('card')}
                  className={`flex items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 ${
                    viewType === 'card'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Card view"
                  title="Card view"
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewType('list')}
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
            
            {/* Filter options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Call Status Filter */}
              <div>
                <label htmlFor="call-status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Call Status
                </label>
                <select
                  id="call-status-filter"
                  value={callStatusFilter}
                  onChange={(e) => setCallStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200"
                >
                  {callStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Candidate Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Candidate Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort By Filter */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No interviews found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No candidates match your current filter criteria. Try adjusting your filters or add new candidates.
            </p>
          </div>
        ) : viewType === 'card' ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="relative group">
                {/* Selection checkbox - outside the card */}
                {selectionMode && (
                  <div 
                    className="absolute top-2 left-2 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCandidateSelection(candidate.id);
                    }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer ${
                        candidate.isSelected 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}>
                        {candidate.isSelected && <CheckIcon className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  className={`
                    bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 border ${
                    candidate.isSelected && selectionMode
                      ? 'border-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                  } cursor-pointer flex flex-col h-full
                  `}
                  onClick={() => {
                    if (selectionMode) {
                      toggleCandidateSelection(candidate.id);
                    } else {
                      router.push(`/jobs/${jobId}/interview-fix/${candidate.id}`);
                    }
                  }}
                >
                  {/* Status Bar */}
                  <div className={`h-2 ${
                    candidate.status === 1 ? 'bg-yellow-500' : 
                    candidate.status === 2 ? 'bg-purple-500' : 
                    candidate.status === 3 ? 'bg-red-500' : 
                    candidate.status === 4 ? 'bg-green-500' : 'bg-gray-500'
                  } relative z-0`}></div>
                  
                  <div className="p-6 relative">
                    {/* Candidate Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex">
                        <div className="mr-3">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500">
                            {candidate.avatar_url ? (
                              <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <UserIcon className="h-7 w-7 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h3>
                          <div className="flex items-center mt-1.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusStyle(candidate.call_status)}`}>
                              {getCallStatusText(candidate.call_status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {getCallStatusIcon(candidate.call_status)}
                      </div>
                    </div>
                    
                    {/* Candidate Details */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Contact</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mt-1.5">
                          <PhoneIcon className="h-3.5 w-3.5 text-indigo-500" />
                          {candidate.phone || 'Not provided'}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Interview Date</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mt-1.5 truncate">
                          <CalendarIcon className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          {candidate.interview_date 
                            ? formatDateTime(candidate.interview_date).split(' at ')[0]
                            : 'Not scheduled'}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mt-1.5">
                          <BriefcaseIcon className="h-3.5 w-3.5 text-indigo-500" />
                          {candidate.years_experience ? `${candidate.years_experience} years` : 'Not specified'}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Education</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mt-1.5 truncate">
                          <AcademicCapIcon className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          {candidate.education || 'Not specified'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Card footer */}
                    <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                        View Interview Details
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {selectionMode && (
                    <th scope="col" className="pl-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                      {/* Select All Checkbox */}
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          if (selectedCandidates.length === filteredCandidates.length) {
                            setSelectedCandidates([]);
                          } else {
                            setSelectedCandidates(filteredCandidates.map(c => c.id));
                          }
                        }}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          selectedCandidates.length === filteredCandidates.length 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedCandidates.length === filteredCandidates.length && 
                            <CheckIcon className="w-3 h-3" />
                          }
                        </div>
                      </div>
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="relative px-6 py-3 w-10">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                      candidate.isSelected && selectionMode ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400' : ''
                    }`}
                    onClick={() => {
                      if (selectionMode) {
                        toggleCandidateSelection(candidate.id);
                      } else {
                        router.push(`/jobs/${jobId}/interview-fix/${candidate.id}`);
                      }
                    }}
                  >
                    {selectionMode && (
                      <td className="pl-6 py-4 whitespace-nowrap">
                        {/* Checkbox */}
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCandidateSelection(candidate.id);
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            candidate.isSelected 
                              ? 'bg-indigo-500 border-indigo-500 text-white' 
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                          }`}>
                            {candidate.isSelected && <CheckIcon className="w-3 h-3" />}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                          {candidate.avatar_url ? (
                            <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                            <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                            <span className="truncate max-w-[180px]">{candidate.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusStyle(candidate.call_status)}`}>
                          {getCallStatusText(candidate.call_status)}
                        </span>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
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