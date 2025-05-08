import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ViewColumnsIcon, 
  ListBulletIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'in_review', label: 'In Review' },
  { value: 'draft', label: 'Draft' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
];

export default function FilterBar({ 
  onSearch, 
  onStatusChange, 
  onLocationChange, 
  onSortChange,
  onViewChange, 
  view = 'card',
  locations = [],
  jobCount = 0
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
  
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (onLocationChange) onLocationChange(value);
  };
  
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    if (onSortChange) onSortChange(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
      {/* Job Count Display */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Jobs</h3>
        <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
          <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">
            {jobCount} Jobs Available
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Search Bar with View Toggle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              placeholder="Search job titles, descriptions, or departments..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-md h-[38px]">
            <button
              onClick={() => onViewChange('card')}
              className={`flex items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 ${
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
              className={`flex items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 ${
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
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort by
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                value={sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <div className="relative">
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Filter by Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Location
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-colors duration-200"
                value={location}
                onChange={handleLocationChange}
                disabled={locations.length === 0}
              >
                <option value="" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                    {loc}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 dark:text-indigo-400">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 