import { BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types/jobApplication';

interface AnalyticsDashboardProps {
  applications: JobApplication[];
}

export function AnalyticsDashboard({ applications }: AnalyticsDashboardProps) {
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const jobTypeCounts = applications.reduce((acc, app) => {
    acc[app.jobType] = (acc[app.jobType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalApplications = applications.length;
  const offersReceived = statusCounts['Offer'] || 0;
  const deniedCount = statusCounts['Denied'] || 0;
  const activeApplications = totalApplications - offersReceived - deniedCount;

  const statuses: ApplicationStatus[] = [
    'Applied',
    'Got Reply',
    'First Interview',
    'Second Interview',
    'Offer',
    'Denied',
  ];

  const statusColors: Record<ApplicationStatus, string> = {
    'Applied': 'bg-blue-500',
    'Got Reply': 'bg-cyan-500',
    'First Interview': 'bg-yellow-500',
    'Second Interview': 'bg-orange-500',
    'Offer': 'bg-green-500',
    'Denied': 'bg-red-500',
  };

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Applications</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalApplications}</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{activeApplications}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Offers</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">{offersReceived}</p>
            </div>
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Denied</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{deniedCount}</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {statuses.map((status) => {
              const count = statusCounts[status] || 0;
              const percentage = totalApplications > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{status}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status]} transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {Object.keys(jobTypeCounts).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications by Job Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(jobTypeCounts).map(([type, count]) => (
                <div
                  key={type}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center"
                >
                  <p className="text-sm font-medium text-gray-600 capitalize">{type}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}