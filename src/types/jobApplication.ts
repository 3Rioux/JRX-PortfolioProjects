export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';

export type JobCategory =
  | 'Game Development'
  | 'Frontend Development'
  | 'Backend Development'
  | 'Data Analytics'
  | 'Mobile Development'
  | 'DevOps'
  | 'UI/UX Design'
  | 'Quality Assurance'
  | 'Project Management'
  | 'Other';

export type ApplicationStatus =
  | 'Applied'
  | 'Got Reply'
  | 'First Interview'
  | 'Second Interview'
  | 'Offer'
  | 'Denied';

export interface JobApplication {
  id: string;
  jobPosition: string;
  companyName: string;
  jobDescription: string;
  dateApplied: string;
  jobType: JobType;
  jobCategory: JobCategory | null;
  notes: string | null;
  resumeURL: string | null;
  resumeFile: File | null;
  resumeFileName: string | null;
  coverLetterURL: string | null;
  coverLetterFile: File | null;
  coverLetterFileName: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ApplicationFormData {
  jobPosition: string;
  companyName: string;
  jobDescription: string;
  dateApplied: string;
  jobType: JobType;
  jobCategory: JobCategory | null;
  notes: string | null;
  resumeFile: File | null;
  coverLetterFile: File | null;
}

// Job Application Job Search 
export interface SearchFilters {
  searchQuery: string;
  jobType: JobType | 'all';
  status: ApplicationStatus | 'all';
  jobCategory: JobCategory | 'all';
}