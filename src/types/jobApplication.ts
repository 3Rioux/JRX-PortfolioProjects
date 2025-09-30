export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';

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
  resumeFile: File | null;
  coverLetterFile: File | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ApplicationFormData {
  jobPosition: string;
  companyName: string;
  jobDescription: string;
  dateApplied: string;
  jobType: JobType;
  resumeFile: File | null;
  coverLetterFile: File | null;
}