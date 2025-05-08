import React from 'react';
import { CheckCircleIcon, ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

/**
 * Component to display interview status on candidate profiles
 * 
 * @param {Object} props Component props
 * @param {boolean} props.hasInterviewed Whether the candidate has completed an interview
 * @param {Date|string} props.interviewDate Date of the interview if completed
 */
const InterviewStatus = ({ hasInterviewed, interviewDate }) => {
  if (hasInterviewed) {
    return (
      <div className="flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-400">
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        <div>
          <p className="font-medium">Interview Completed</p>
          {interviewDate && (
            <p className="text-xs text-green-600 dark:text-green-500">
              {new Date(interviewDate).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400">
      <ClockIcon className="h-5 w-5 mr-2" />
      <div>
        <p className="font-medium">Interview Pending</p>
        <p className="text-xs text-yellow-600 dark:text-yellow-500">
          No interview has been conducted yet
        </p>
      </div>
    </div>
  );
};

export default InterviewStatus; 