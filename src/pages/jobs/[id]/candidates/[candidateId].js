import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Mock data for a single candidate
const getMockCandidate = (id) => {
  return {
    id: parseInt(id),
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    phone: "(555) 123-4567",
    education: "Master of Computer Science, Stanford University",
    experience: "5 years at Google, 3 years at Amazon",
    appliedDate: "2023-04-15",
    status: "Screening",
    resume: "/resumes/emily_johnson.pdf",
    coverLetter: true,
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "JavaScript", "GraphQL", "PostgreSQL", "Docker"],
    rating: 4.7,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    interviewScheduled: true,
    interviewDate: "2023-05-01",
    notes: "Strong technical background, excellent communication skills",
    interviewFix: {
      noticePeriod: "1 Month",
      resigned: false,
      locationPreference: "Remote, Open to Relocation",
      offersHeld: "Google (Senior Developer)",
      currentCTC: "$120,000",
      expectedCTC: "$150,000",
      reasonToSwitch: "Looking for more challenging technical problems and growth opportunities"
    },
    interviewRating: 92,
    interviewVideos: [
      { id: 1, title: "Introduction & Background", thumbnail: "/thumbnails/video1.jpg", duration: "2:45" },
      { id: 2, title: "Technical Assessment", thumbnail: "/thumbnails/video2.jpg", duration: "5:12" },
      { id: 3, title: "Problem Solving Approach", thumbnail: "/thumbnails/video3.jpg", duration: "4:33" },
      { id: 4, title: "Team Collaboration Style", thumbnail: "/thumbnails/video4.jpg", duration: "3:18" }
    ],
    wordCloud: ["React", "Frontend", "Architecture", "Performance", "TypeScript", "Leadership", "Collaboration", "Testing", "CI/CD", "Microservices"],
    interviewInsights: [
      { category: "Technical Skills", score: 95, details: "Exceptional knowledge of React ecosystem and modern JavaScript" },
      { category: "Problem Solving", score: 90, details: "Structured approach to complex problems with clear communication" },
      { category: "Communication", score: 88, details: "Articulate and concise, explains complex concepts well" },
      { category: "Cultural Fit", score: 92, details: "Values align with company culture, collaborative mindset" }
    ],
    jdMatchScore: 94,
  };
};

export default function CandidateProfile() {
  const router = useRouter();
  const { id, candidateId } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [manualRating, setManualRating] = useState(0);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    if (!candidateId) return;
    
    // Simulate API call to fetch candidate data
    const fetchCandidate = async () => {
      try {
        // In a real app, you would call your API here
        // const response = await api.candidates.getById(candidateId);
        
        // Using mock data for demonstration
        const mockCandidate = getMockCandidate(candidateId);
        setCandidate(mockCandidate);
        
        // Initialize manual rating with the current rating
        setManualRating(mockCandidate.rating);
      } catch (error) {
        console.error('Error fetching candidate:', error);
        toast.error('Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidate();
  }, [candidateId]);

  const handleSaveRating = () => {
    // In a real app, you would save this to your API
    console.log('Saving rating:', manualRating);
    toast.success('Rating saved successfully');
    setShowRatingInput(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Screening':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'Interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'Hired':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
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
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with back button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Candidates
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column - Candidate Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                {/* Candidate Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className="relative mr-5">
                      <img 
                        src={candidate.avatar} 
                        alt={candidate.name}
                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        <span className={`flex items-center justify-center h-7 w-7 rounded-full border ${getStatusColor(candidate.status)}`}>
                          {candidate.status === 'Hired' ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <UserIcon className="h-5 w-5" />
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{candidate.name}</h1>
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                              {candidate.status}
                            </span>
                            <span className="mx-2">•</span>
                            <span>Applied {formatDate(candidate.appliedDate)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 md:mt-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                            <span className="font-bold mr-1">{candidate.jdMatchScore}%</span> JD Match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Candidate Overview Content */}
                <div className="p-6">
                  {/* Contact info */}
                  <div className="flex flex-col md:flex-row md:space-x-8 mb-6">
                    <div className="flex items-center mb-3 md:mb-0">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">{candidate.email}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">{candidate.phone}</span>
                    </div>
                  </div>
                  
                  {/* Education & Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex">
                      <AcademicCapIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{candidate.education}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <BriefcaseIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{candidate.experience}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {candidate.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        {candidate.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Interview Content Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Highlights</h2>
                    <button className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center hover:text-indigo-700 dark:hover:text-indigo-300">
                      View Full Interview
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Video Carousel */}
                  <div className="relative mb-6">
                    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-6 px-6 scrollbar-hide">
                      {candidate.interviewVideos.map((video, index) => (
                        <div 
                          key={video.id}
                          className={`flex-shrink-0 w-64 group cursor-pointer relative rounded-lg overflow-hidden border-2 ${index === activeVideoIndex ? 'border-indigo-500 dark:border-indigo-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'} transition-all duration-200`}
                          onClick={() => setActiveVideoIndex(index)}
                        >
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                            {/* Placeholder for video thumbnail */}
                            <div className="w-full h-full flex items-center justify-center">
                              <img 
                                src="https://via.placeholder.com/640x360?text=Video+Thumbnail" 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-black/50 p-2">
                                <PlayIcon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{video.title}</h4>
                            <div className="flex items-center mt-1">
                              <ClockIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{video.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Navigation Arrows */}
                    <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none">
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none">
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Word Cloud */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Key Interview Terms</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap justify-center">
                      {candidate.wordCloud.map((word, index) => {
                        // Randomize size for visualization
                        const fontSize = 14 + Math.random() * 10;
                        const fontWeight = Math.random() > 0.5 ? 'medium' : 'normal';
                        return (
                          <span 
                            key={index}
                            className="m-1.5 text-indigo-600 dark:text-indigo-400"
                            style={{ fontSize: `${fontSize}px`, fontWeight }}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Interview Insights */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Detailed Interview Insights</h3>
                    <div className="space-y-4">
                      {candidate.interviewInsights.map((insight, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{insight.category}</h4>
                            <span className={`font-bold ${getScoreColor(insight.score)}`}>{insight.score}%</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{insight.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* InterviewFix Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">InterviewFix</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Notice Period</h3>
                    <p className="mt-1 text-gray-900 dark:text-white font-medium">{candidate.interviewFix.noticePeriod}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Resignation Status</h3>
                    <p className="mt-1 text-gray-900 dark:text-white font-medium">
                      {candidate.interviewFix.resigned ? 'Resigned' : 'Not Resigned'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Location Preference</h3>
                    <p className="mt-1 text-gray-900 dark:text-white font-medium">{candidate.interviewFix.locationPreference}</p>
                  </div>
                  
                  {candidate.interviewFix.offersHeld && (
                    <div>
                      <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Offers Held</h3>
                      <p className="mt-1 text-gray-900 dark:text-white font-medium">{candidate.interviewFix.offersHeld}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Current CTC</h3>
                      <p className="text-gray-900 dark:text-white font-medium">{candidate.interviewFix.currentCTC}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Expected CTC</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 font-medium">{candidate.interviewFix.expectedCTC}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Reason to Switch</h3>
                    <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">{candidate.interviewFix.reasonToSwitch}</p>
                  </div>
                </div>
              </div>
              
              {/* Interview Rating Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Rating</h2>
                </div>
                
                <div className="p-6 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-green-600">{candidate.interviewRating}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">(Based on InterviewX Analysis)</div>
                  
                  {showRatingInput ? (
                    <div className="mt-4 w-full">
                      <div className="flex items-center justify-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                          Your Rating:
                        </label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setManualRating(rating)}
                              className="focus:outline-none"
                            >
                              {rating <= manualRating ? (
                                <StarIconSolid className="h-6 w-6 text-yellow-400" />
                              ) : (
                                <StarIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveRating}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowRatingInput(false)}
                          className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRatingInput(true)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-2" />
                      Add Your Rating
                    </button>
                  )}
                </div>
              </div>
              
              {/* Actions Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Actions</h2>
                </div>
                
                <div className="p-4 space-y-3">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                    Schedule Interview
                  </button>
                  
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                    Download Resume
                  </button>
                  
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                    Contact Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 