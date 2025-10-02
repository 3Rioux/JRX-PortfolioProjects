export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string
          user_id: string
          job_position: string
          company_name: string
          job_description: string
          date_applied: string
          job_type: 'full-time' | 'part-time' | 'internship' | 'contract'
          status: 'Applied' | 'Got Reply' | 'First Interview' | 'Second Interview' | 'Offer' | 'Denied'
          resume_file_name: string | null
          cover_letter_file_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_position: string
          company_name: string
          job_description: string
          date_applied: string
          job_type: 'full-time' | 'part-time' | 'internship' | 'contract'
          status?: 'Applied' | 'Got Reply' | 'First Interview' | 'Second Interview' | 'Offer' | 'Denied'
          resume_file_name?: string | null
          cover_letter_file_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_position?: string
          company_name?: string
          job_description?: string
          date_applied?: string
          job_type?: 'full-time' | 'part-time' | 'internship' | 'contract'
          status?: 'Applied' | 'Got Reply' | 'First Interview' | 'Second Interview' | 'Offer' | 'Denied'
          resume_file_name?: string | null
          cover_letter_file_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}