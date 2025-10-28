import { useState, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { toast } from "sonner";
import { LogOut, RefreshCw } from 'lucide-react';

//Unused could remove but is a better approch for the future: (using webhooks /hooks)
import { useApplications } from '@/hooks/useApplications';

import { JobApplicationForm } from './JobApplicationForm';
import { AnalyticsDashboard } from './JobAnalyticsDashboard';
import { JobApplicationsList } from './JobApplicationsList';
import { JobSearchAndFilters } from './JobSearchAndFilters';
import type { JobApplication, ApplicationFormData, ApplicationStatus, SearchFilters } from '../types/jobApplication';
import { useAuth } from '@/contexts/AuthContextJobs.tsx';
import { supabase } from '../lib/supabaseClient.ts';

export function JobApplicationManager() {
  const { user, signOut } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    jobType: 'all',
    status: 'all',
    jobCategory: 'all',
  });

  //const jobAppList = document.getElementById("jobApplicationList");
  const jobAppListRef = useRef<HTMLDivElement | null>(null);

  const loadApplications = async () => {
    
    //Check if user is logged in (if not dont allow access to page)
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
        jobCategory: app.job_category,
        notes: app.notes,
        status: app.status,
        resumeURL: app.resume_url,
        resumeFile: null,
        coverLetterURL: app.cover_letter_url,
        coverLetterFile: null,
        createdAt: app.created_at,
      }));



      setApplications(mappedApplications);
      // mappedApplications[0].focus();
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  //need seperate to stop infinit loop of loading application 
  useEffect(() => {
    if (!loading && applications.length > 0 && jobAppListRef.current) {
      // ✅ runs AFTER DOM renders
      jobAppListRef.current.scrollIntoView({ behavior: "smooth"});
    }
  }, [loading, applications]);

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleAddApplication = async (formData: ApplicationFormData) => {
    if (!user) {
      setError('You must be logged in to add applications');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      //Start With Uploading Files: 
      
      const fileResumePath = `${formData.resumeFile?.name}`; // 👈 uploads to subfolder named by title

      // const ext = `${formData.resumeFile?.type}`;
      //const fileName = `${Date.now()}-${fileResumePath}-${Math.random().toString(8).substr(2, 5)}.${ext}`;

      //Check if we have a resume if so upload it
      if(formData.resumeFile) {
        const { error: uploadError } = await supabase.storage
        .from('JobApplications')
        .upload(fileResumePath, formData.resumeFile, {
          cacheControl: '3600',
          upsert: false, // prevents overwriting existing files
          contentType: formData.resumeFile?.type,
        });
      

        if (uploadError) {
          // setMessage('❌Image Upload failed: ' + uploadError.message);
          setError('Failled Upload Resume File');
          setLoading(false);
          return;
        }
      }
//backhere
      //Get URL
      const { data: publicResumeUrlData } = supabase.storage
      .from('JobApplications')
      .getPublicUrl(fileResumePath);

      const fileCoverLetterPath = `${formData.coverLetterFile?.name}`; // 👈 uploads to subfolder named by title

      if(formData.coverLetterFile) {
        const { error: uploadError } = await supabase.storage
        .from('JobApplications')
        .upload(fileCoverLetterPath, formData.coverLetterFile, {
          cacheControl: '3600',
          upsert: false, // prevents overwriting existing files
          contentType: formData.coverLetterFile?.type,
        });
      

        if (uploadError) {
          // setMessage('❌Image Upload failed: ' + uploadError.message);
          setLoading(false);
          return;
        }

      }

      //Get Cover Letter URL
      const { data: publicCoverLetterUrlData } = supabase.storage
      .from('JobApplications')
      .getPublicUrl(fileCoverLetterPath);

      const { data, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_position: formData.jobPosition,
          company_name: formData.companyName,
          job_description: formData.jobDescription,
          date_applied: formData.dateApplied,
          job_type: formData.jobType,
          job_category: formData.jobCategory,
          notes: formData.notes,
          status: 'Applied',
          resume_url: publicResumeUrlData,
          resume_file_name: formData.resumeFile?.name || null,
          cover_letter_url: publicCoverLetterUrlData,
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
        jobCategory: data.job_category,
        notes: data.notes,
        status: data.status,
        resumeURL: data.resume_url,        
        resumeFile: formData.resumeFile,
        coverLetterURL: data.cover_letter_url,
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

  const handleNotesUpdate = async (id: string, notes: string) => {
    if (!user) {
      setError('You must be logged in to update applications');
      return;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ notes })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, notes } : app))
      );
    } catch (err) {
      console.error('Error updating notes:', err);
      setError('Failed to update notes. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };


  //=== Search/Filter Jobs: ===
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        filters.searchQuery === '' ||
        app.companyName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        app.jobPosition.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (app.jobCategory && app.jobCategory.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      const matchesJobType = filters.jobType === 'all' || app.jobType === filters.jobType;
      const matchesStatus = filters.status === 'all' || app.status === filters.status;
      const matchesCategory = filters.jobCategory === 'all' || app.jobCategory === filters.jobCategory;

      return matchesSearch && matchesJobType && matchesStatus && matchesCategory;
    });
  }, [applications, filters]);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8 p-8 bg-background border rounded-xl">
        <div className="flex flex-wrap items-center justify-center md:justify-between mb-8 gap-4">
          <div className="text-center flex-1 ">
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2 md:text-sm sm:text-xs">Job Application Tracker</h1>
            <p className="text-gray-600 dark:text-violet-500">Manage your job applications and track your progress</p>
          </div>
          <div className="flex flex-wrap items-center justify-center w-full md:w-auto gap-3 ">
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-4 py-2 text-primary-foreground shadow-xs bg-blue-600 hover:bg-blue-700 cursor-pointer select-none rounded-lg transition-colors border border-gray-300"
              title="Refresh applications"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-primary-foreground shadow-xs rounded-lg hover:bg-red-700 cursor-pointer select-none transition-colors"
            >
              <LogOut size={18} />
              Logout
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

            <JobSearchAndFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={filteredApplications.length}
              totalCount={applications.length}
            />

            {/* old JobList Call */}
            {/* <JobApplicationsList applications={applications} onStatusChange={handleStatusChange} /> */}
            <div id="jobApplicationList" ref={jobAppListRef}>
              <JobApplicationsList
                loadApplications={loadApplications}
                loading={loading}
                applications={filteredApplications}
                // firstJobRefList= {firstJobRef}
                onStatusChange={handleStatusChange}
                onNotesUpdate={handleNotesUpdate}
              />
            </div>
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