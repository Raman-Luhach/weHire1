import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs, candidates } from '@/utils/api';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

// Interview stages and their colors
const interviewStages = [
  { key: 'Screening', label: 'Screening', color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { key: 'InterviewVet', label: 'Interview Vet', color: 'bg-indigo-500', lightColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
  { key: 'InterviewFix', label: 'Interview Fix', color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-800' },
  { key: 'InterviewX', label: 'Interview X', color: 'bg-teal-500', lightColor: 'bg-teal-100', textColor: 'text-teal-800' },
  { key: 'Hired', label: 'Hired', color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-800' },
  { key: 'Rejected', label: 'Rejected', color: 'bg-red-500', lightColor: 'bg-red-100', textColor: 'text-red-800' }
];

// Performance categories
const performanceCategories = [
  { range: [4.5, 5], label: 'Outstanding', color: 'bg-emerald-500' },
  { range: [4, 4.5], label: 'Excellent', color: 'bg-green-500' },
  { range: [3.5, 4], label: 'Very Good', color: 'bg-lime-500' },
  { range: [3, 3.5], label: 'Good', color: 'bg-yellow-500' },
  { range: [2, 3], label: 'Average', color: 'bg-orange-500' },
  { range: [0, 2], label: 'Below Average', color: 'bg-red-500' }
];

export default function InterviewSummary() {
  const [job, setJob] = useState(null);
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    byStageCounts: {},
    byPerformance: {},
    interviewProgress: 0,
    avgRating: 0,
    timeToHire: 0,
    totalCandidates: 0,
    topPerformers: []
  });
  
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Redirect if not HR
  useEffect(() => {
    if (user && user.role !== 'HR') {
      toast.error('You do not have permission to access this page');
      router.push(`/jobs/${id}`);
    }
  }, [user, id, router]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch job details and candidates
        const [jobResponse, candidatesResponse] = await Promise.all([
          jobs.getById(id),
          candidates.getByJobId(id)
        ]);
        
        setJob(jobResponse.data);
        setCandidatesList(candidatesResponse.data);
        
        // Calculate statistics
        calculateStatistics(candidatesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateStatistics = (candidates) => {
    // Initialize stage counts
    const byStageCounts = {};
    interviewStages.forEach(stage => {
      byStageCounts[stage.key] = 0;
    });
    
    // Initialize performance categories
    const byPerformance = {};
    performanceCategories.forEach(category => {
      byPerformance[category.label] = 0;
    });
    
    // Default values for empty data
    let totalCandidates = 0;
    let avgRating = 3.5; // Default average rating for visualization
    let avgTimeToHire = 0;
    let interviewProgress = 0;
    let topPerformers = [];
    
    if (candidates && candidates.length > 0) {
      // Find top performers
      const sortedByRating = [...candidates].sort((a, b) => b.rating - a.rating);
      topPerformers = sortedByRating.slice(0, 5);
      
      // Calculate statistics
      let totalRating = 0;
      let hiredCount = 0;
      let totalTimeToHire = 0;
      
      candidates.forEach(candidate => {
        // Count by stage
        const stage = candidate.status || 'Screening';
        byStageCounts[stage] = (byStageCounts[stage] || 0) + 1;
        
        // Count by performance
        totalRating += candidate.rating || 0;
        const performanceCategory = getPerformanceCategory(candidate.rating || 0);
        byPerformance[performanceCategory] = (byPerformance[performanceCategory] || 0) + 1;
        
        // Calculate time to hire for hired candidates
        if (candidate.status === 'Hired' && candidate.hired_date && candidate.applied_date) {
          const hiredDate = new Date(candidate.hired_date);
          const appliedDate = new Date(candidate.applied_date);
          const daysToHire = Math.round((hiredDate - appliedDate) / (1000 * 60 * 60 * 24));
          totalTimeToHire += daysToHire;
          hiredCount++;
        }
      });
      
      // Calculate average metrics
      totalCandidates = candidates.length;
      avgRating = totalRating / totalCandidates;
      avgTimeToHire = hiredCount > 0 ? totalTimeToHire / hiredCount : 0;
      
      // Calculate interview progress (percentage of candidates past screening)
      const screeningCount = byStageCounts['Screening'] || 0;
      interviewProgress = Math.round(((totalCandidates - screeningCount) / totalCandidates) * 100);
    } else {
      // Create sample top performers for visualization when no data exists
      topPerformers = Array(3).fill(null).map((_, i) => ({
        id: `sample-${i}`,
        name: `Sample Candidate ${i+1}`,
        email: 'sample@example.com',
        status: interviewStages[i % interviewStages.length].key,
        rating: 4.0 - (i * 0.5),
        applied_date: new Date().toISOString()
      }));
    }
    
    setStatistics({
      byStageCounts,
      byPerformance,
      interviewProgress,
      avgRating,
      timeToHire: avgTimeToHire,
      totalCandidates: Math.max(totalCandidates, 1), // Ensure non-zero for calculations
      topPerformers
    });
  };
  
  const getPerformanceCategory = (rating) => {
    for (const category of performanceCategories) {
      if (rating >= category.range[0] && rating < category.range[1]) {
        return category.label;
      }
    }
    return performanceCategories[performanceCategories.length - 1].label;
  };

  const renderCandidatesByStageBarChart = () => {
    const maxValue = Math.max(...Object.values(statistics.byStageCounts), 1);
    
    return (
      <div className="space-y-2">
        {interviewStages.map(stage => {
          const count = statistics.byStageCounts[stage.key] || 0;
          const percentage = Math.round((count / statistics.totalCandidates) * 100) || 0;
          const width = `${Math.max((count / maxValue) * 100, 3)}%`;
          
          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${stage.color} mr-2`}></span>
                  {stage.label}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{count} ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${stage.color} h-2.5 rounded-full`} style={{ width }}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push(`/jobs/${id}`)}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Job
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Interview Summary for {job?.title || 'This Job'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Overview of interview progress and candidate performance
            </p>
          </div>
          
          <button
            onClick={() => router.push(`/jobs/${id}/candidates`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            View All Candidates
          </button>
        </div>

        {statistics.totalCandidates === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There are no candidates for this job yet. Add candidates to view interview statistics.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push(`/jobs/${id}/candidates/upload`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Candidates
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Candidates */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <UserGroupIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Candidates</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.totalCandidates}</p>
                  </div>
                </div>
              </div>
              
              {/* Interview Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interview Progress</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.interviewProgress}%</p>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${statistics.interviewProgress}%` }}></div>
                </div>
              </div>
              
              {/* Average Rating */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <ChartBarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.avgRating.toFixed(1)}</p>
                      <div className="ml-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="inline-block">
                            {i < Math.floor(statistics.avgRating) ? (
                              <span>★</span>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">★</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Time to Hire */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <CalendarDaysIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Hire</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {statistics.timeToHire > 0 ? `${Math.round(statistics.timeToHire)} days` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Candidates by Stage */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Candidates by Stage
                </h2>
                {renderCandidatesByStageBarChart()}
              </div>
              
              {/* Stage Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <PresentationChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Stage Distribution
                </h2>
                
                {/* New implementation with fixed heights */}
                <div className="h-80 pt-6">
                  {/* Chart bars */}
                  <div className="relative h-full">
                    <div className="flex-1 flex items-end justify-around h-full max-w-4xl mx-auto">
                      {interviewStages
                        .filter(stage => stage.key !== 'Hired' && stage.key !== 'Rejected' && stage.key !== 'Screening')
                        .map((stage, index) => {
                        const count = statistics.byStageCounts[stage.key] || 0;
                        const totalCandidates = statistics.totalCandidates || 1;
                        
                        // Calculate actual percentage of candidates in this stage
                        const stagePercentage = Math.round((count / totalCandidates) * 100) || 0;
                        
                        // Use actual stage percentage for height, with 0% for empty data
                        const heightPercentage = count > 0 ? stagePercentage : 0;
                        
                        return (
                          <div key={stage.key} className="group flex flex-col items-center mx-3" style={{ width: '25%', maxWidth: '120px' }}>
                            {/* Bar with proper height */}
                            <div className="relative w-full" style={{ height: `${heightPercentage}%`, minHeight: heightPercentage > 0 ? '5px' : '0' }}>
                              <div className={`absolute inset-0 ${stage.color} rounded-t-lg 
                                ${count === 0 ? 'opacity-30' : 'opacity-100'} 
                                shadow-md border border-white/10 dark:border-black/10
                                transition-all duration-300 hover:shadow-xl`}
                              >
                                {/* Label inside bar */}
                                {heightPercentage > 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white font-bold text-xs drop-shadow-md">
                                      {heightPercentage}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Show 0% label for empty bars */}
                            {heightPercentage === 0 && (
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                0%
                              </div>
                            )}
                            
                            {/* Stage label - positioned below the chart with fixed spacing */}
                            <div className="mt-3 flex flex-col items-center text-center h-8">
                              <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: stage.color.replace('bg-', '') || '#6366f1' }}></div>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 w-full truncate">
                                {stage.label}
                              </div>
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-auto">
                              <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg whitespace-nowrap">
                                <div className="font-medium">{stage.label}</div>
                                <div className="flex items-center justify-between">
                                  <span>{count} candidate{count !== 1 ? 's' : ''}</span>
                                  <span className="ml-3 text-gray-300">{heightPercentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Data indicator */}
                {Object.values(statistics.byStageCounts).every(count => count === 0) && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      Sample visualization (no candidate data yet)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Top Performers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Top Performers
              </h2>
              
              {statistics.topPerformers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stage
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rating
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {statistics.topPerformers.map((candidate, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => router.push(`/jobs/${id}/candidates/${candidate.id}`)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {candidate.avatar_url ? (
                                  <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                                ) : (
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColorClass(candidate.status)}`}>
                              {candidate.status || 'Screening'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 dark:text-white mr-2">
                                {candidate.rating.toFixed(1)}
                              </span>
                              <div className="text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="inline-block">
                                    {i < Math.floor(candidate.rating) ? (
                                      <span>★</span>
                                    ) : (
                                      <span className="text-gray-300 dark:text-gray-600">★</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(candidate.applied_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No performers data available
                </p>
              )}
            </div>
            
            {/* Candidates Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Recent Candidate Activity
                </h2>
                <button
                  onClick={() => router.push(`/jobs/${id}/candidates`)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {candidatesList.slice(0, 5).map((candidate, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => router.push(`/jobs/${id}/candidates/${candidate.id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                              {candidate.avatar_url ? (
                                <img src={candidate.avatar_url} alt={candidate.name} className="h-full w-full object-cover" />
                              ) : (
                                <UserIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {candidate.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColorClass(candidate.status)}`}>
                            {candidate.status || 'Screening'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 dark:text-white mr-2">
                              {candidate.rating?.toFixed(1) || 'N/A'}
                            </span>
                            {candidate.rating && (
                              <div className="text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="inline-block">
                                    {i < Math.floor(candidate.rating) ? (
                                      <span>★</span>
                                    ) : (
                                      <span className="text-gray-300 dark:text-gray-600">★</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper function to get stage color class
function getStageColorClass(stage) {
  switch(stage) {
    case 'Screening':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'InterviewFix':
    case 'Interview Fix':
    case 'Interview':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'InterviewVet':
    case 'Interview Vet':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    case 'InterviewX':
    case 'Interview X':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
    case 'Hired':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
} 