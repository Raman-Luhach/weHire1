import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, candidates as candidatesApi } from '@/utils/api'; // Rename the import to avoid conflict
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ArrowUpRightIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  PhoneIcon,
  ChevronRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function InterVet() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [selectionMode, setSelectionMode] = useState(false); // Toggle selection mode
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('application_date');
  const [ratingFilter, setRatingFilter] = useState('all');
  
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
        
        // Fetch candidates with status >= 0 (all post-intervet candidates)
        const candidatesResponse = await candidatesApi.getByJobId(jobId, {
          status: 0
        });
        
        // Transform data if needed and set state
        const processedCandidates = candidatesResponse.data.map(candidate => ({
          ...candidate,
          isSelected: false
        }));
        
        setCandidates(processedCandidates);
        setFilteredCandidates(processedCandidates);
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
  useEffect(() => {
    let result = [...candidates];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.summary.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      const statusValue = parseInt(statusFilter);
      result = result.filter(candidate => candidate.status === statusValue);
    }
    
    // Rating filter
    if (ratingFilter !== 'all') {
      if (ratingFilter === 'high') {
        result = result.filter(candidate => candidate.rating >= 4.0);
      } else if (ratingFilter === 'medium') {
        result = result.filter(candidate => candidate.rating >= 3.0 && candidate.rating < 4.0);
      } else if (ratingFilter === 'low') {
        result = result.filter(candidate => candidate.rating < 3.0);
      }
    }
    
    // Sort candidates
    result = sortCandidates(result, sortBy);
    
    // Keep the selection state
    result = result.map(candidate => ({
      ...candidate,
      isSelected: selectedCandidates.includes(candidate.id)
    }));
    
    setFilteredCandidates(result);
  }, [searchTerm, statusFilter, ratingFilter, sortBy, candidates, selectedCandidates]);

  // Sort candidates
  const sortCandidates = (candidatesList, sortType) => {
    switch (sortType) {
      case 'application_date':
        return [...candidatesList].sort((a, b) => new Date(b.application_date) - new Date(a.application_date));
      case 'name':
        return [...candidatesList].sort((a, b) => a.name.localeCompare(b.name));
      case 'experience':
        return [...candidatesList].sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
      case 'rating':
        return [...candidatesList].sort((a, b) => b.rating - a.rating);
      default:
        return candidatesList;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
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
  
  // Move selected candidates to InterviewFix
  const moveToInterviewFix = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the API to update candidate statuses using the proper API method
      // Since there's no direct method for bulk updates, update each candidate
      const updatePromises = selectedCandidates.map(candidateId => 
        candidatesApi.update(candidateId, { status: 1 }) // Move to Interview Fix stage
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const updatedCandidates = candidates.map(candidate => {
        if (selectedCandidates.includes(candidate.id)) {
          return { ...candidate, status: 1 };
        }
        return candidate;
      });
      
      setCandidates(updatedCandidates);
      
      // Show success message
      toast.success(`${selectedCandidates.length} candidate(s) moved to InterviewFix successfully`);
      
      // Reset selection
      setSelectedCandidates([]);
      
      // Optionally navigate to InterviewFix page
      router.push(`/jobs/${jobId}/interview-fix`);
    } catch (error) {
      console.error('Error moving candidates:', error);
      toast.error('Failed to move candidates to InterviewFix: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: '0', label: 'Post-InterVet' },
    { value: '1', label: 'Interview Fix' },
    { value: '2', label: 'Interview Taken' },
    { value: '3', label: 'Rejected' },
    { value: '4', label: 'Hired' },
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: 'high', label: '4.0 and above' },
    { value: 'medium', label: '3.0 - 3.9' },
    { value: 'low', label: 'Below 3.0' },
  ];

  const sortOptions = [
    { value: 'application_date', label: 'Application Date' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'experience', label: 'Experience' },
    { value: 'rating', label: 'Rating' },
  ];

  // Get status style
  const getStatusStyle = (status) => {
    switch (status) {
      case 0:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
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

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Post-InterVet';
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

  // Render rating stars
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-500 fill-yellow-500'
                : i < rating
                ? 'text-yellow-500 fill-yellow-500 opacity-60'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedCandidates([]);
    }
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
              InterVet Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Review and evaluate candidates for {job?.title}
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
              <button
                onClick={moveToInterviewFix}
                disabled={selectedCandidates.length === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedCandidates.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Move to InterviewFix ({selectedCandidates.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="w-full relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search candidates by name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="ml-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 flex">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`flex items-center justify-center p-1.5 rounded-md ${
                      viewMode === 'card'
                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="Card View"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center justify-center p-1.5 rounded-md ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="List View"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="w-1/3 px-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="w-1/3 px-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="w-1/3 px-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex mt-2 items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
              <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                {filteredCandidates.length} Candidates
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Cards */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No candidates match your current filter criteria. Try adjusting your filters or add new candidates.
            </p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border ${
                    candidate.isSelected && selectionMode
                      ? 'border-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  } cursor-pointer flex flex-col h-full
                  `}
                  onClick={() => {
                    if (selectionMode) {
                      toggleCandidateSelection(candidate.id);
                    } else {
                      router.push(`/jobs/${jobId}/candidates/${candidate.id}`);
                    }
                  }}
                >
                  {/* Status Bar */}
                  <div className={`h-2.5 ${
                    candidate.status === 0 ? 'bg-blue-500' : 
                    candidate.status === 1 ? 'bg-yellow-500' : 
                    candidate.status === 2 ? 'bg-purple-500' : 
                    candidate.status === 3 ? 'bg-red-500' : 
                    candidate.status === 4 ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  
                  <div className="p-5 sm:p-6 flex-grow">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center max-w-full">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 mr-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600 shadow-sm">
                          {candidate.avatar_url ? (
                            <img
                              src={candidate.avatar_url}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors truncate mb-1">
                            {candidate.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <EnvelopeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{candidate.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-hidden">
                        <AcademicCapIcon className="h-5 w-5 mr-3 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{candidate.education || 'No education info'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-hidden">
                        <BriefcaseIcon className="h-5 w-5 mr-3 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                        <span className="truncate">{candidate.experience || 'No experience info'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-hidden">
                        <CalendarIcon className="h-5 w-5 mr-3 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                        <span className="truncate">Applied: {formatDate(candidate.application_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-hidden">
                        <div className="flex items-center w-full">
                          <StarIcon className="h-5 w-5 mr-3 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
                          <div className="flex items-center">
                            <div className="text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="inline-block">
                                  {i < Math.floor(candidate.rating) ? (
                                    <span className="text-yellow-400">★</span>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">★</span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="font-medium">{candidate.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills && candidate.skills.length > 0 ? (
                          <>
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md px-2.5 py-1 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs font-medium">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs font-medium">
                            No skills listed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer with Contact Info */}
                  <div className="px-5 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{candidate.phone}</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
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
                        router.push(`/jobs/${jobId}/candidates/${candidate.id}`);
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
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-14 w-14 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                          {candidate.avatar_url ? (
                            <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                            <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                            <span className="truncate max-w-[180px]">{candidate.email}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {candidate.skills && candidate.skills.length > 0 ? (
                              <>
                                {candidate.skills.slice(0, 2).map((skill, index) => (
                                  <span 
                                    key={index} 
                                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md px-2.5 py-1 text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {candidate.skills.length > 2 && (
                                  <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs font-medium">
                                    +{candidate.skills.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs font-medium">
                                No skills listed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-5">
                        {/* Status indicator moved to the left of rating */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(candidate.status)}`}>
                          {getStatusText(candidate.status)}
                        </span>
                        
                        {/* Rating display */}
                        <div className="flex items-center">
                          <div className="text-yellow-500 dark:text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="inline-block text-lg">
                                {i < Math.floor(candidate.rating) ? (
                                  <span className="text-yellow-400">★</span>
                                ) : (
                                  <span className="text-gray-300 dark:text-gray-600">★</span>
                                )}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{candidate.rating.toFixed(1)}</span>
                        </div>
                        
                        <ChevronRightIcon className="h-6 w-6 text-gray-400" />
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