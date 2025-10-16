import { Search, Filter, X } from 'lucide-react';
import type { JobType, ApplicationStatus, JobCategory, SearchFilters } from '@/types/jobApplication';


interface SearchAndFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    resultsCount: number;
    totalCount: number;
  }
  
  export function JobSearchAndFilters({ filters, onFiltersChange, resultsCount, totalCount }: SearchAndFiltersProps) {
    const hasActiveFilters =
      filters.searchQuery !== '' ||
      filters.jobType !== 'all' ||
      filters.status !== 'all' ||
      filters.jobCategory !== 'all';
  
    const handleClearFilters = () => {
      onFiltersChange({
        searchQuery: '',
        jobType: 'all',
        status: 'all',
        jobCategory: 'all',
      });
    };
  
    const jobTypes: Array<{ value: JobType | 'all'; label: string }> = [
      { value: 'all', label: 'All Types' },
      { value: 'full-time', label: 'Full-Time' },
      { value: 'part-time', label: 'Part-Time' },
      { value: 'internship', label: 'Internship' },
      { value: 'contract', label: 'Contract' },
    ];
  
    const statuses: Array<{ value: ApplicationStatus | 'all'; label: string }> = [
      { value: 'all', label: 'All Statuses' },
      { value: 'Applied', label: 'Applied' },
      { value: 'Got Reply', label: 'Got Reply' },
      { value: 'First Interview', label: 'First Interview' },
      { value: 'Second Interview', label: 'Second Interview' },
      { value: 'Offer', label: 'Offer' },
      { value: 'Denied', label: 'Denied' },
    ];
  
    const categories: Array<{ value: JobCategory | 'all'; label: string }> = [
      { value: 'all', label: 'All Categories' },
      { value: 'Game Development', label: 'Game Development' },
      { value: 'Frontend Development', label: 'Frontend Development' },
      { value: 'Backend Development', label: 'Backend Development' },
      { value: 'Data Analytics', label: 'Data Analytics' },
      { value: 'Mobile Development', label: 'Mobile Development' },
      { value: 'DevOps', label: 'DevOps' },
      { value: 'UI/UX Design', label: 'UI/UX Design' },
      { value: 'Quality Assurance', label: 'Quality Assurance' },
      { value: 'Project Management', label: 'Project Management' },
      { value: 'Other', label: 'Other' },
    ];
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Search & Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
  
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by company name or job category..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              id="jobType"
              value={filters.jobType}
              onChange={(e) => onFiltersChange({ ...filters, jobType: e.target.value as JobType | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Application Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as ApplicationStatus | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Job Category
            </label>
            <select
              id="category"
              value={filters.jobCategory}
              onChange={(e) => onFiltersChange({ ...filters, jobCategory: e.target.value as JobCategory | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{resultsCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalCount}</span> applications
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filters active</span>
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    );
  }







