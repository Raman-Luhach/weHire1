import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import { jobs, candidates as candidatesApi } from '@/utils/api';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  StarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export default function CandidateDetails() {
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { id: jobId, candidateId } = router.query;
  const { user } = useAuth();
  
  // Fetch candidate and job data when component mounts
  useEffect(() => {
    if (!jobId || !candidateId || !user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await jobs.getById(jobId);
        setJob(jobResponse.data);
        
        // Fetch candidate details
        const candidateResponse = await candidatesApi.getById(candidateId);
        setCandidate(candidateResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load candidate details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, candidateId, user]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const renderRating = (rating) => {
    if (!rating) return 'Not rated';
    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < fullStars ? (
              <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ) : i === fullStars && remainder >= 0.5 ? (
              <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400 opacity-60" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const moveToInterviewFix = async () => {
    if (!candidate) return;
    
    try {
      setUpdating(true);
      
      // Update candidate status to 1 (InterviewFix)
      await candidatesApi.update(candidateId, {
        status: 1 // Move to Interview Fix stage
      });
      
      toast.success('Candidate moved to Interview Fix successfully');
      // Refresh candidate data to show updated status
      const updatedCandidate = await candidatesApi.getById(candidateId);
      setCandidate(updatedCandidate.data);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Failed to move candidate to Interview Fix');
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Post-InterVet';
      case 1: return 'Interview Fix';
      case 2: return 'Interview Taken';
      case 3: return 'Rejected';
      case 4: return 'Hired';
      default: return 'Unknown';
    }
  };

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
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!candidate) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Candidate Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The candidate you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push(`/jobs/${jobId}/candidates`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Candidates
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/jobs/${jobId}/candidates`)}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Candidates
          </button>
          
          {job && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {job.title} • {job.location || 'Remote'}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Status color bar */}
          <div className={`h-2 ${
            candidate.status === 0 ? 'bg-blue-500' : 
            candidate.status === 1 ? 'bg-yellow-500' : 
            candidate.status === 2 ? 'bg-purple-500' : 
            candidate.status === 3 ? 'bg-red-500' : 
            candidate.status === 4 ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          
          {/* Candidate Profile Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 mr-4 flex-shrink-0">
                  {candidate.avatar_url ? (
                    <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{candidate.name}</h1>
                  
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(candidate.status)}`}>
                      {getStatusText(candidate.status)}
                    </span>
                    <div className="ml-3">
                      {renderRating(candidate.rating)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {candidate.status === 0 && (
                  <button
                    onClick={moveToInterviewFix}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {updating ? 'Processing...' : 'Move to Interview Fix'}
                  </button>
                )}
                
                <button
                  onClick={() => router.push(`/jobs/${jobId}/candidates/edit/${candidateId}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-2" />
                  Edit Candidate
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-6">
            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.phone}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Application Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(candidate.application_date)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Education & Experience */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education & Experience</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Education</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {candidate.education || 'No education information provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <BriefcaseIcon className="h-6 w-6 text-indigo-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Work Experience</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {candidate.experience || 'No experience information provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                {candidate.skills && candidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md px-3 py-1 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No skills listed</p>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <div className="flex items-start">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {candidate.notes || 'No notes available for this candidate'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resume & Documents */}
            {(candidate.resume_url || candidate.cover_letter_url) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.resume_url && (
                    <a 
                      href={candidate.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                        <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Resume</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View or download resume</p>
                      </div>
                    </a>
                  )}
                  
                  {candidate.cover_letter_url && (
                    <a 
                      href={candidate.cover_letter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                        <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Cover Letter</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View or download cover letter</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 