import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs } from '@/utils/api';
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
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Mock data for candidates
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
  const [candidates, setCandidates] = useState(mockCandidates);
  const [filteredCandidates, setFilteredCandidates] = useState(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applied-latest');
  const [viewType, setViewType] = useState('card'); // 'card' or 'list'
  
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await jobs.getById(id);
        setJob(response.data);
      } catch (error) {
        toast.error('Failed to fetch job details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    // In a real app, we would fetch candidates from the API
    // For now, we use the mock data
  }, [id, router]);

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
    let result = [...candidates];
    
    // Apply search term filter
    if (term) {
      const lowerTerm = term.toLowerCase();
      result = result.filter(
        candidate => 
          candidate.name.toLowerCase().includes(lowerTerm) ||
          candidate.email.toLowerCase().includes(lowerTerm) ||
          candidate.education.toLowerCase().includes(lowerTerm) ||
          candidate.experience.toLowerCase().includes(lowerTerm) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(lowerTerm))
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      result = result.filter(candidate => candidate.status === status);
    }
    
    // Apply performance filter
    if (performance !== 'all') {
      const performanceFilterMap = {
        'recommended': candidate => candidate.rating * 2 >= 8,
        'maybe': candidate => candidate.rating * 2 >= 6 && candidate.rating * 2 < 8,
        'rejected': candidate => candidate.rating * 2 < 6
      };
      
      result = result.filter(performanceFilterMap[performance]);
    }
    
    // Apply sorting
    switch (sort) {
      case 'applied-latest':
        result.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
        break;
      case 'applied-oldest':
        result.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
        break;
      case 'name-az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating-high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        // Default sort by application date (newest first)
        result.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    }
    
    setFilteredCandidates(result);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Job
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job?.title || 'Job'} - Candidates</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Review and manage candidates for this position
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-indigo-800 dark:text-indigo-300">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-medium">{filteredCandidates.length} Candidates</span>
                </div>
                
                {/* View Toggle */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex">
                  <button
                    onClick={() => setViewType('card')}
                    className={`p-2 ${
                      viewType === 'card'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    } rounded-l-lg`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`p-2 ${
                      viewType === 'list'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    } rounded-r-lg`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters - Reorganized with search on top */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            {/* Search Bar - Top */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search candidates by name, skills, education, or experience..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
            </div>
            
            {/* Filters - Bottom */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4">              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-5">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Performance
                  </label>
                  <select
                    value={performanceFilter}
                    onChange={handlePerformanceFilter}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  >
                    <option value="all">All Candidates</option>
                    <option value="recommended" className="text-green-600 font-medium">Recommended (8+)</option>
                    <option value="maybe" className="text-yellow-600 font-medium">Maybe (6-8)</option>
                    <option value="rejected" className="text-red-600 font-medium">Rejected (Below 6)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-5">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSort}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  >
                    <option value="applied-latest">Latest Applications</option>
                    <option value="applied-oldest">Oldest Applications</option>
                    <option value="name-az">Name (A-Z)</option>
                    <option value="name-za">Name (Z-A)</option>
                    <option value="rating-high">Highest Score</option>
                    <option value="rating-low">Lowest Score</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-5">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Candidates Display */}
          {filteredCandidates.length > 0 ? (
            viewType === 'card' ? (
              // Card View - Improved Design
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCandidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    onClick={() => router.push(`/jobs/${id}/candidates/${candidate.id}`)}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-t-4 ${getPerformanceColor(candidate.rating)} overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer h-full flex flex-col`}
                  >
                    <div className="p-6 flex-grow">
                      {/* Header with Avatar */}
                      <div className="flex items-start mb-6">
                        <div className="relative">
                          <Image 
                            src={candidate.avatar} 
                            alt={candidate.name}
                            className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            width={80}
                            height={80}
                          />
                        </div>
                        
                        <div className="ml-5 flex-grow">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xl line-clamp-1" title={candidate.name}>
                            {candidate.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span 
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(candidate.status)}`}
                            >
                              {candidate.status}
                            </span>
                            
                            {/* Score out of 10 with color coding */}
                            <span 
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRatingColorClass(candidate.rating)}`}
                            >
                              {formatRatingScore(candidate.rating)}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Main Info */}
                      <div className="space-y-4 text-base">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate" title={candidate.experience}>
                            {candidate.experience.split(',')[0]}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                          <span>Applied: {formatDate(candidate.appliedDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700 mt-auto">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {candidate.interviewScheduled ? 
                            `Interview: ${formatDate(candidate.interviewDate)}` : 
                            'No interview scheduled'}
                        </div>
                        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View with updated rating display
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Experience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredCandidates.map((candidate) => (
                        <tr 
                          key={candidate.id} 
                          onClick={() => router.push(`/jobs/${id}/candidates/${candidate.id}`)}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-150 border-t-4 ${getPerformanceColor(candidate.rating)}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 relative">
                                <Image 
                                  src={candidate.avatar} 
                                  alt="" 
                                  className="h-12 w-12 rounded-full object-cover"
                                  width={48}
                                  height={48}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-medium text-gray-900 dark:text-white">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900 dark:text-white truncate max-w-xs">
                              {candidate.experience.split(',')[0]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">
                            {formatDate(candidate.appliedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRatingColorClass(candidate.rating)}`}
                            >
                              {formatRatingScore(candidate.rating)}/10
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center border border-gray-200 dark:border-gray-700">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No candidates found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || performanceFilter !== 'all' ? 'Try adjusting your search filters' : 'There are no candidates for this job yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 