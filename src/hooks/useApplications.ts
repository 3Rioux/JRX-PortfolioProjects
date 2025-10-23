import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { JobApplication } from '@/types/jobApplication';
import { useAuth } from '@/components/AuthContext';

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
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
  }, [user]);

  return {
    user,
    applications,
    loading,
    error,
    loadApplications,
    setApplications, // optional — to allow manual updates
  };
}