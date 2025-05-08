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
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function InterviewFixCandidate() {
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('interview');
  const router = useRouter();
  const { id: jobId, candidateId } = router.query;
  const { user } = useAuth();
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [notes, setNotes] = useState('');
  
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
        
        if (candidateResponse.data.interviewDate) {
          setInterviewDate(new Date(candidateResponse.data.interviewDate));
          setInterviewTime(candidateResponse.data.interviewTime);
        }
        
        if (candidateResponse.data.interviewNotes) {
          setInterviewNotes(candidateResponse.data.interviewNotes);
        }
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
  
  const renderRating = (rating) => {
    if (!rating) return 'Not rated';
    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < fullStars ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ) : i === fullStars && remainder >= 0.5 ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400 fill-yellow-400 opacity-60" />
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
  
  const moveToInterviewTaken = async () => {
    if (!candidate) return;
    
    try {
      setUpdating(true);
      
      // Update candidate status to 2 (Interview Taken)
      await candidatesApi.update(candidateId, {
        status: 2 // Move to Interview Taken stage
      });
      
      toast.success('Candidate moved to Interview Taken successfully');
      // Refresh candidate data to show updated status
      const updatedCandidate = await candidatesApi.getById(candidateId);
      setCandidate(updatedCandidate.data);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Failed to move candidate to Interview Taken');
    } finally {
      setUpdating(false);
    }
  };
  
  const scheduleInterview = async () => {
    if (!candidate) return;
    
    try {
      // Combine date and time
      const dateTime = new Date(interviewDate);
      const [hours, minutes] = interviewTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      const updatedCandidate = { 
        ...candidate, 
        interviewScheduled: true,
        interviewDateTime: dateTime,
        interviewNotes: interviewNotes
      };
      
      await candidatesApi.update(candidateId, updatedCandidate);
      setCandidate(updatedCandidate);
      toast.success('Interview scheduled successfully');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
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
              onClick={() => router.push(`/jobs/${jobId}/interview-fix`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Interview Fix
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
            onClick={() => router.push(`/jobs/${jobId}/interview-fix`)}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Interview Fix
          </button>
          
          {job && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {job.title} • {job.location || 'Remote'}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{candidate.name}</h1>
                  
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
                {candidate.status === 1 && (
                  <button
                    onClick={() => window.open(`tel:${candidate.phone}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Make Call
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs - Removing other tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <div className="whitespace-nowrap py-4 px-6 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                Interview Details
              </div>
            </nav>
          </div>
          
          {/* Content - Only showing interview details */}
          <div className="p-6">
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interview Details</h2>
              
              {/* Interview Schedule */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Interview Schedule</h3>
                <div className="flex items-start gap-3 mb-4">
                  <CalendarIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {candidate.interview_date ? formatDateTime(candidate.interview_date) : 'Not scheduled yet'}
                    </div>
                    {candidate.interview_location && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Location: {candidate.interview_location}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Call button instead of schedule button */}
                {!candidate.interview_date && (
                  <button
                    onClick={() => window.open(`tel:${candidate.phone}`)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <PhoneIcon className="h-3.5 w-3.5 mr-1.5" />
                    Call Candidate
                  </button>
                )}
              </div>
              
              {/* Interview Availability & Notice Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Notice Period</h3>
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {candidate.notice_period ? `${candidate.notice_period} days` : 'Not specified'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {candidate.has_resigned 
                          ? `Resigned: ${candidate.resignation_date ? formatDate(candidate.resignation_date) : 'Date not provided'}`
                          : 'Not resigned yet'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Location Preference</h3>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {candidate.location_preference || 'Not specified'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {job && (
                          <>Job location: {job.location || 'Remote'}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Compensation & Offers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Compensation Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current CTC</div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {candidate.current_ctc ? `${candidate.current_ctc.toLocaleString()} INR` : 'Not provided'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Expected CTC</div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {candidate.expected_ctc ? `${candidate.expected_ctc.toLocaleString()} INR` : 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Other Offers</h3>
                  <div className="flex items-start gap-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {candidate.has_other_offers 
                          ? `Has ${candidate.offer_count || 'multiple'} other offers` 
                          : 'No other offers'}
                      </div>
                      {candidate.has_other_offers && candidate.offer_details && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {candidate.offer_details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reason for Job Change */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Reason to Switch Jobs</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  {candidate.switch_reason || 'Not provided'}
                </div>
              </div>
              
              {/* Interview Rating */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Interview Rating</h3>
                <div className="mb-3">
                  {renderRating(candidate.rating)}
                </div>
                {candidate.rating === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Interview not rated yet. Rate after completing the interview.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 