import { Briefcase, Calendar, FileText, Building2 } from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types/jobApplication';

interface JobApplicationsListProps {
  applications: JobApplication[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function JobApplicationsList({ applications, onStatusChange }: JobApplicationsListProps) {
  const statuses: ApplicationStatus[] = [
    'Applied',
    'Got Reply',
    'First Interview',
    'Second Interview',
    'Offer',
    'Denied',
  ];

  const getStatusColor = (status: ApplicationStatus): string => {
    const colors: Record<ApplicationStatus, string> = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Got Reply': 'bg-cyan-100 text-cyan-800',
      'First Interview': 'bg-yellow-100 text-yellow-800',
      'Second Interview': 'bg-orange-100 text-orange-800',
      'Offer': 'bg-green-100 text-green-800',
      'Denied': 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
        <p className="text-gray-500">Start by adding your first job application above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h2>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Applied</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Documents</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{app.jobPosition}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-700">{app.companyName}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600 capitalize">{app.jobType}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(app.dateApplied)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {app.resumeFile && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <FileText size={14} />
                        Resume
                      </div>
                    )}
                    {app.coverLetterFile && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <FileText size={14} />
                        Cover
                      </div>
                    )}
                    {!app.resumeFile && !app.coverLetterFile && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">{app.jobPosition}</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 size={16} className="text-gray-400" />
                <span className="text-sm">{app.companyName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>{formatDate(app.dateApplied)}</span>
              </div>
              <span className="text-gray-600 capitalize">{app.jobType}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={app.status}
                onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                  app.status
                )}`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
              <div className="flex items-center gap-2">
                {app.resumeFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <FileText size={14} />
                    Resume
                  </div>
                )}
                {app.coverLetterFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <FileText size={14} />
                    Cover Letter
                  </div>
                )}
                {!app.resumeFile && !app.coverLetterFile && (
                  <span className="text-xs text-gray-400">No documents attached</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}