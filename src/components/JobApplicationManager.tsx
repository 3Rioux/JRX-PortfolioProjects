import { useState, useEffect } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { JobApplicationForm } from './JobApplicationForm';
import { AnalyticsDashboard } from './JobAnalyticsDashboard';
import { JobApplicationsList } from './JobApplicationsList';
import type { JobApplication, ApplicationFormData, ApplicationStatus } from '../types/jobApplication';
import { useAuth } from '@/contexts/AuthContextJobs.tsx';
import { supabase } from '../lib/supabaseClient.ts';

export function JobApplicationManager() {
  const { user, signOut } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_applications')
        .select('*')
        .order('date_applied', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedApplications: JobApplication[] = (data || []).map((app) => ({
        id: app.id,
        jobPosition: app.job_position,
        companyName: app.company_name,
        jobDescription: app.job_description,
        dateApplied: app.date_applied,
        jobType: app.job_type,
        status: app.status,
        resumeFile: null,
        coverLetterFile: null,
        createdAt: app.created_at,
      }));

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleAddApplication = async (formData: ApplicationFormData) => {
    if (!user) {
      setError('You must be logged in to add applications');
      return;
    }

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_position: formData.jobPosition,
          company_name: formData.companyName,
          job_description: formData.jobDescription,
          date_applied: formData.dateApplied,
          job_type: formData.jobType,
          status: 'Applied',
          resume_file_name: formData.resumeFile?.name || null,
          cover_letter_file_name: formData.coverLetterFile?.name || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newApplication: JobApplication = {
        id: data.id,
        jobPosition: data.job_position,
        companyName: data.company_name,
        jobDescription: data.job_description,
        dateApplied: data.date_applied,
        jobType: data.job_type,
        status: data.status,
        resumeFile: formData.resumeFile,
        coverLetterFile: formData.coverLetterFile,
        createdAt: data.created_at,
      };

      setApplications((prev) => [newApplication, ...prev]);
    } catch (err) {
      console.error('Error adding application:', err);
      setError('Failed to add application. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    if (!user) {
      setError('You must be logged in to update applications');
      return;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
            <p className="text-gray-600">Manage your job applications and track your progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
              title="Refresh applications"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <JobApplicationForm onSubmit={handleAddApplication} />

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : (
          <>
            <AnalyticsDashboard applications={applications} />
            <JobApplicationsList applications={applications} onStatusChange={handleStatusChange} />
          </>
        )}
      </div>
    </div>
  );
}















// import { useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import { JobApplicationForm } from './JobApplicationForm';
// import { AnalyticsDashboard } from './JobAnalyticsDashboard';
// import { JobApplicationsList } from './JobApplicationsList';
// import type { JobApplication, ApplicationFormData, ApplicationStatus } from '../types/jobApplication';

// export function JobApplicationManager() {

//     const navigate = useNavigate();
//     const [applications, setApplications] = useState<JobApplication[]>([]);

//     const handleAddApplication = (formData: ApplicationFormData) => {
//         const newApplication: JobApplication = {
//         id: crypto.randomUUID(),
//         ...formData,
//         status: 'Applied',
//         createdAt: new Date().toISOString(),
//         };

//         setApplications((prev) => [newApplication, ...prev]);
//     };

//     const handleStatusChange = (id: string, status: ApplicationStatus) => {
//         setApplications((prev) =>
//         prev.map((app) => (app.id === id ? { ...app, status } : app))
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
//         {/* Back Button */}
//         <button
//             type="button"
//             onClick={() => navigate("/JRX-PortfolioProjects/")}
//             className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
//         >
//             ← Back
//         </button>
        
//         <div className="max-w-7xl mx-auto space-y-8">
//             <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
//             <p className="text-gray-600">Manage your job applications and track your progress</p>
//             </div>

//             <JobApplicationForm onSubmit={handleAddApplication} />

//             <AnalyticsDashboard applications={applications} />

//             <JobApplicationsList applications={applications} onStatusChange={handleStatusChange} />
//         </div>
//         </div>
//     );
// }