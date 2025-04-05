import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'in_review', label: 'In Review' },
  { value: 'draft', label: 'Draft' },
];

export default function FilterBar({ onSearch, onStatusChange, onViewChange, view = 'card' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
              value={status}
              onChange={handleStatusChange}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button
              onClick={() => onViewChange('card')}
              className={`p-2 rounded-md transition-all duration-200 ${
                view === 'card'
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label="Card view"
              title="Card view"
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                view === 'list'
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
      </div>
    </div>
  );
} 