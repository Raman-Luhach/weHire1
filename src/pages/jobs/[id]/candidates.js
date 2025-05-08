import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, candidates } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  ChevronDownIcon,
  UserGroupIcon,
  EyeIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Keep mock data as a fallback
const mockCandidates = [
  {
    id: 1,
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '(555) 123-4567',
    education: 'Master of Computer Science, Stanford University',
    experience: '5 years at Google, 3 years at Amazon',
    appliedDate: '2023-04-15',
    status: 'Screening',
    resume: '/resumes/emily_johnson.pdf',
    coverLetter: true,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    rating: 4.8,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    interviewScheduled: true,
    interviewDate: '2023-05-01',
    notes: 'Strong technical background, excellent communication skills'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 987-6543',
    education: 'Bachelor of Engineering, MIT',
    experience: '4 years at Facebook, 2 years at Microsoft',
    appliedDate: '2023-04-16',
    status: 'Interview',
    resume: '/resumes/michael_chen.pdf',
    coverLetter: true,
    skills: ['JavaScript', 'React', 'Redux', 'GraphQL', 'CSS'],
    rating: 4.5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    interviewScheduled: true,
    interviewDate: '2023-05-03',
    notes: 'Good problem solver, strong front-end skills'
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    phone: '(555) 456-7890',
    education: 'PhD in Machine Learning, UC Berkeley',
    experience: '3 years at Tesla, 2 years at IBM',
    appliedDate: '2023-04-17',
    status: 'Hired',
    resume: '/resumes/sophia_martinez.pdf',
    coverLetter: false,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Machine Learning'],
    rating: 5.0,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    interviewScheduled: false,
    notes: 'Exceptional AI expertise, great leadership potential'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '(555) 789-0123',
    education: 'Bachelor of Science, University of Washington',
    experience: '2 years at Adobe, 1 year at Oracle',
    appliedDate: '2023-04-18',
    status: 'Rejected',
    resume: '/resumes/david_wilson.pdf',
    coverLetter: true,
    skills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Docker'],
    rating: 3.2,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    interviewScheduled: false,
    notes: 'Limited experience in required technologies'
  },
  {
    id: 5,
    name: 'Olivia Brown',
    email: 'olivia.brown@example.com',
    phone: '(555) 234-5678',
    education: 'Master of Information Technology, Carnegie Mellon',
    experience: '6 years at Salesforce, 2 years at Twitter',
    appliedDate: '2023-04-19',
    status: 'Screening',
    resume: '/resumes/olivia_brown.pdf',
    coverLetter: true,
    skills: ['Angular', 'TypeScript', 'Firebase', 'Jest', 'CI/CD'],
    rating: 4.7,
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    interviewScheduled: false,
    notes: 'Impressive technical breadth, good collaborative approach'
  },
  {
    id: 6,
    name: 'Ethan Davis',
    email: 'ethan.davis@example.com',
    phone: '(555) 345-6789',
    education: 'Bachelor of Computer Science, Georgia Tech',
    experience: '3 years at Apple, 1 year at Netflix',
    appliedDate: '2023-04-20',
    status: 'Interview',
    resume: '/resumes/ethan_davis.pdf',
    coverLetter: false,
    skills: ['Swift', 'iOS Development', 'Objective-C', 'Firebase', 'XCode'],
    rating: 4.0,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    interviewScheduled: true,
    interviewDate: '2023-05-05',
    notes: 'Strong mobile development experience, good problem-solving skills'
  },
  {
    id: 7,
    name: 'Ava Thompson',
    email: 'ava.thompson@example.com',
    phone: '(555) 567-8901',
    education: 'Master of Data Science, University of Michigan',
    experience: '4 years at Uber, 2 years at Lyft',
    appliedDate: '2023-04-21',
    status: 'Hired',
    resume: '/resumes/ava_thompson.pdf',
    coverLetter: true,
    skills: ['Python', 'R', 'SQL', 'Tableau', 'Big Data'],
    rating: 4.9,
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
    interviewScheduled: false,
    notes: 'Excellent data expertise, outstanding analytical skills'
  },
  {
    id: 8,
    name: 'Noah Garcia',
    email: 'noah.garcia@example.com',
    phone: '(555) 678-9012',
    education: 'Bachelor of Engineering, Purdue University',
    experience: '2 years at LinkedIn, 1 year at Dropbox',
    appliedDate: '2023-04-22',
    status: 'Rejected',
    resume: '/resumes/noah_garcia.pdf',
    coverLetter: false,
    skills: ['JavaScript', 'Vue.js', 'PHP', 'Laravel', 'MySQL'],
    rating: 3.5,
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    interviewScheduled: false,
    notes: 'Good technical skills but not a culture fit'
  },
  {
    id: 9,
    name: 'Isabella Wong',
    email: 'isabella.wong@example.com',
    phone: '(555) 789-0123',
    education: 'Master of Software Engineering, USC',
    experience: '5 years at Intel, 2 years at HP',
    appliedDate: '2023-04-23',
    status: 'Screening',
    resume: '/resumes/isabella_wong.pdf',
    coverLetter: true,
    skills: ['C++', 'Python', 'CUDA', 'Machine Learning', 'Embedded Systems'],
    rating: 4.6,
    avatar: 'https://randomuser.me/api/portraits/women/75.jpg',
    interviewScheduled: false,
    notes: 'Strong hardware experience, excellent technical depth'
  },
  {
    id: 10,
    name: 'Liam Roberts',
    email: 'liam.roberts@example.com',
    phone: '(555) 890-1234',
    education: 'Bachelor of Science in CS, University of Texas',
    experience: '3 years at Dell, 2 years at IBM',
    appliedDate: '2023-04-24',
    status: 'Interview',
    resume: '/resumes/liam_roberts.pdf',
    coverLetter: true,
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS'],
    rating: 4.3,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    interviewScheduled: true,
    interviewDate: '2023-05-07',
    notes: 'Good full-stack skills, highly motivated'
  },
  {
    id: 11,
    name: 'Charlotte Kim',
    email: 'charlotte.kim@example.com',
    phone: '(555) 901-2345',
    education: 'Master of Computer Engineering, Cornell University',
    experience: '4 years at Cisco, 2 years at Oracle',
    appliedDate: '2023-04-25',
    status: 'Screening',
    resume: '/resumes/charlotte_kim.pdf',
    coverLetter: true,
    skills: ['Java', 'Spring', 'Kubernetes', 'Docker', 'REST APIs'],
    rating: 4.2,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    interviewScheduled: false,
    notes: 'Good backend development skills, strong systems knowledge'
  },
  {
    id: 12,
    name: 'Mason Edwards',
    email: 'mason.edwards@example.com',
    phone: '(555) 012-3456',
    education: 'Bachelor of Arts in Human-Computer Interaction, NYU',
    experience: '3 years at Airbnb, 2 years at Spotify',
    appliedDate: '2023-04-26',
    status: 'Interview',
    resume: '/resumes/mason_edwards.pdf',
    coverLetter: true,
    skills: ['UI/UX Design', 'Figma', 'Sketch', 'CSS', 'React'],
    rating: 4.4,
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    interviewScheduled: true,
    interviewDate: '2023-05-09',
    notes: 'Excellent design skills, strong attention to detail'
  }
];

// Helper functions
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Screening':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    case 'Interview':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
    case 'Hired':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Screening':
      return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
    case 'Interview':
      return <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-500" />;
    case 'Hired':
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    case 'Rejected':
      return <UserIcon className="h-4 w-4 text-red-500" />;
    default:
      return <UserIcon className="h-4 w-4 text-gray-500" />;
  }
};

// Helper function for rating score color
const getRatingColorClass = (score) => {
  // Convert 5-scale rating to 10-scale
  const scoreOutOf10 = score * 2;
  
  if (scoreOutOf10 >= 8) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
  } else if (scoreOutOf10 >= 6) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  } else {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
  }
};

// Get performance color class based on rating
const getPerformanceColor = (rating) => {
  // Convert 5-scale rating to 10-scale
  const scoreOutOf10 = rating * 2;
  
  if (scoreOutOf10 >= 8) {
    return 'border-green-500 dark:border-green-600';
  } else if (scoreOutOf10 >= 6) {
    return 'border-yellow-500 dark:border-yellow-600';
  } else {
    return 'border-red-500 dark:border-red-600';
  }
};

// Format rating to score out of 10
const formatRatingScore = (rating) => {
  // Convert 5-scale rating to 10-scale
  return (rating * 2).toFixed(1);
};

export default function JobCandidates() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applied-latest');
  const [viewType, setViewType] = useState('card'); // 'card' or 'list'
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  // Check if the current user is HR
  const isHR = user?.role === 'HR';

  // Fetch job and candidates data
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setCandidatesLoading(true);

    const fetchJob = async () => {
      try {
        const response = await jobs.getById(id);
        setJob(response.data);
      } catch (error) {
        toast.error('Failed to fetch job details');
        setError('Failed to load job details. Please try again.');
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCandidates = async () => {
      try {
        const response = await candidates.getByJobId(id);
        const candidatesData = response.data;
        setAllCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        
        // Use mock data as fallback
        console.log('Using mock data as fallback');
        setAllCandidates(mockCandidates);
        setFilteredCandidates(mockCandidates);
        
        // Only show error if candidates couldn't be fetched (not using fallback)
        if (error.response && error.response.status !== 404) {
          toast.error('Failed to fetch candidates');
        }
      } finally {
        setCandidatesLoading(false);
      }
    };

    fetchJob();
    fetchCandidates();
  }, [id]);

  const handlePerformanceFilter = (e) => {
    const performance = e.target.value;
    setPerformanceFilter(performance);
    applyFilters(searchTerm, statusFilter, performance, sortBy);
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    applyFilters(searchTerm, status, performanceFilter, sortBy);
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    applyFilters(searchTerm, statusFilter, performanceFilter, sort);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, statusFilter, performanceFilter, sortBy);
  };

  const applyFilters = (term, status, performance, sort) => {
    let filtered = [...allCandidates];
    
    // Search filter
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(lowerTerm) ||
        candidate.email.toLowerCase().includes(lowerTerm) ||
        candidate.education?.toLowerCase().includes(lowerTerm) ||
        candidate.experience?.toLowerCase().includes(lowerTerm) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(lowerTerm))
      );
    }
    
    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === status);
    }
    
    // Performance filter
    if (performance && performance !== 'all') {
      if (performance === 'high') {
        filtered = filtered.filter(candidate => candidate.rating >= 4.0);
      } else if (performance === 'medium') {
        filtered = filtered.filter(candidate => candidate.rating >= 3.0 && candidate.rating < 4.0);
      } else if (performance === 'low') {
        filtered = filtered.filter(candidate => candidate.rating < 3.0);
      }
    }
    
    // Sorting
    filtered = sortCandidates(filtered, sort);
    
    setFilteredCandidates(filtered);
  };

  const sortCandidates = (candidates, sortType) => {
    const sorted = [...candidates];
    
    switch (sortType) {
      case 'applied-latest':
        return sorted.sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date));
      case 'applied-earliest':
        return sorted.sort((a, b) => new Date(a.applied_date) - new Date(b.applied_date));
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };
  
  const handleCreateCandidate = () => {
    router.push(`/jobs/${id}/candidates/create`);
  };
  
  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await candidates.delete(candidateId);
        toast.success('Candidate deleted successfully');
        
        // Update the lists to remove the deleted candidate
        const updatedCandidates = allCandidates.filter(c => c.id !== candidateId);
        setAllCandidates(updatedCandidates);
        setFilteredCandidates(filteredCandidates.filter(c => c.id !== candidateId));
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Failed to delete candidate');
      }
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

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <p>{error}</p>
          <button 
            onClick={() => router.push('/jobs')}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Go back to jobs
          </button>
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
                  {job.title}
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
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Candidates
              </h3>
              {!candidatesLoading && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {filteredCandidates.length}
                </span>
              )}
            </div>
            
            {isHR && (
              <button
                onClick={handleCreateCandidate}
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Candidate
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">            
            <div className="p-4">
              {/* Job Count Display */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Candidates</h3>
                <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                  <UserGroupIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                    {filteredCandidates.length} Candidates 
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
                      id="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                      placeholder="Search candidates by name, skills, education..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  
                  {/* View Toggle Buttons */}
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
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        id="status-filter"
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                        value={statusFilter}
                        onChange={handleStatusFilter}
                      >
                        <option value="all">All Statuses</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Performance Filter */}
                  <div>
                    <label htmlFor="performance-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Performance
                    </label>
                    <div className="relative">
                      <select
                        id="performance-filter"
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                        value={performanceFilter}
                        onChange={handlePerformanceFilter}
                      >
                        <option value="all">All Ratings</option>
                        <option value="high">High (4.0+)</option>
                        <option value="medium">Medium (3.0-3.9)</option>
                        <option value="low">Low (&lt;3.0)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        id="sort-by"
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                        value={sortBy}
                        onChange={handleSort}
                      >
                        <option value="applied-latest">Applied (Newest)</option>
                        <option value="applied-earliest">Applied (Oldest)</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="rating-high">Rating (High-Low)</option>
                        <option value="rating-low">Rating (Low-High)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state for candidates */}
          {candidatesLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredCandidates.length > 0 ? (
            <div className={viewType === 'card' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-5'}>
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`
                    bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer
                    ${viewType === 'card' ? 'flex flex-col h-full' : 'flex items-center p-5'}
                  `}
                  onClick={() => router.push(`/jobs/${id}/candidates/${candidate.id}`)}
                >
                  {viewType === 'card' ? (
                    // Card View
                    <div className="flex flex-col h-full w-full">
                      {/* Status Bar */}
                      <div className={`h-2.5 ${getStatusBadgeClass(candidate.status).split(' ').slice(0, 2).join(' ')}`}></div>
                      
                      <div className="p-5 sm:p-6 flex-grow">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center max-w-full">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mr-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600 shadow-sm">
                              {candidate.avatar_url ? (
                                <Image
                                  src={candidate.avatar_url}
                                  alt={candidate.name}
                                  layout="fill"
                                  objectFit="cover"
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
                            <span className="truncate">Applied: {new Date(candidate.applied_date).toLocaleDateString()}</span>
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
                            {candidate.skills && candidate.skills.slice(0, 3).map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md px-2.5 py-1 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills && candidate.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs font-medium">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-5 py-4 mt-auto border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {candidate.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>{candidate.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end">
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div className="w-full flex items-center justify-between overflow-hidden">
                      <div className="flex items-center min-w-0 max-w-[65%]">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mr-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600 shadow-sm">
                          {candidate.avatar_url ? (
                            <Image
                              src={candidate.avatar_url}
                              alt={candidate.name}
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate mb-0.5">
                            {candidate.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <EnvelopeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate max-w-[250px]">{candidate.email}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.skills && candidate.skills.slice(0, 2).map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md px-2 py-0.5 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills && candidate.skills.length > 2 && (
                              <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs font-medium">
                                +{candidate.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="inline-block text-sm">
                              {i < Math.floor(candidate.rating) ? (
                                <span className="text-yellow-400">★</span>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">★</span>
                              )}
                            </span>
                          ))}
                          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {candidate.rating.toFixed(1)}
                          </span>
                        </div>
                        
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // No results
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || performanceFilter !== 'all'
                  ? 'Try adjusting your filters or search criteria'
                  : 'Add candidates to this job to start tracking applicants'}
              </p>
              <div className="mt-6">
                {isHR && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleCreateCandidate}
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Candidate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 