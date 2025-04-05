import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { jobs as jobsApi } from '@/utils/api';
import Link from 'next/link';
import {
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function JobCard({ job, view = 'card', onDelete, isManager = false, expandable = true }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // Format the end date
  const formattedDate = job.end_date
    ? new Date(job.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No end date';
    
  // Format creation date
  const formattedCreationDate = job.created_at || job.created
    ? new Date(job.created_at || job.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  // Navigate to job details
  const navigateToDetails = () => {
    router.push(`/jobs/${job.id}`);
  };

  // Get the status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'closed':
        return 'text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'draft':
        return 'text-gray-800 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      case 'in_review':
        return 'text-yellow-800 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-gray-800 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return (
          <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
          </svg>
        );
      case 'closed':
        return (
          <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        );
      case 'in_review':
        return (
          <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
          </svg>
        );
      case 'draft':
        return (
          <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Check if user has permission to edit/delete
  const canEdit = user?.role === 'HR' || (isManager && user?.role === 'Hiring Manager');
  const isHR = user?.role === 'HR';

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (view === 'list') {
    return (
      <div 
        onClick={navigateToDetails}
        className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer relative group"
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <div className={`flex items-center ml-3 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm whitespace-nowrap ${getStatusColor(job.status)}`}>
                  {getStatusIcon(job.status)}
                  <span>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem]">
                {job.description ? truncateText(job.description, 150) : 'No description provided for this position.'}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <MapPinIcon className="h-4 w-4 mr-1.5" />
                  {job.location || 'Remote'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1.5" />
                  {job.department || 'General'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  Closes: {formattedDate}
                </span>
                {job.salary && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                    ${job.salary.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {formattedCreationDate && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4 mr-1.5" />
                Posted: {formattedCreationDate}
              </div>
            )}
            
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium ml-auto">
              View Details
              <ChevronRightIcon className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={navigateToDetails} 
      className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 flex flex-col h-full group cursor-pointer relative"
    >
      {/* Card header with colored accent based on status */}
      <div className={`h-2 ${getStatusColor(job.status).split(' ').slice(0, 2).join(' ')}`}></div>
      
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {job.title}
          </h3>
          <div className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${getStatusColor(job.status)}`}>
            {getStatusIcon(job.status)}
            <span>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
          </div>
        </div>
        
        <div className="min-h-[4.5rem] mb-5">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {job.description ? truncateText(job.description, 150) : 'No description provided for this position.'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <MapPinIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
            <span className="truncate">{job.department || 'General'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <CalendarIcon className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
            <span className="truncate">Closes: {formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-emerald-500 dark:text-emerald-400" />
            <span className="truncate">{job.salary ? `$${job.salary.toLocaleString()}` : 'Not specified'}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
        {formattedCreationDate && (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            Posted: {formattedCreationDate}
          </div>
        )}
        
        {!formattedCreationDate && (
          <div className="flex-grow"></div>
        )}
        
        <button
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium"
        >
          View Details
          <ChevronRightIcon className="h-5 w-5 ml-1.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}