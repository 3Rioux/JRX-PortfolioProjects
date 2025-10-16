import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ApplicationFormData, JobType, JobCategory } from '../types/jobApplication';

interface JobApplicationFormProps {
  onSubmit: (application: ApplicationFormData) => void;
}

export function JobApplicationForm({ onSubmit }: JobApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    jobPosition: '',
    companyName: '',
    jobDescription: '',
    dateApplied: new Date().toISOString().split('T')[0],
    jobType: 'full-time',
    jobCategory: null,
    notes: null,
    resumeFile: null,
    coverLetterFile: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobPosition.trim()) {
      newErrors.jobPosition = 'Job position is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }

    if (!formData.dateApplied) {
      newErrors.dateApplied = 'Date applied is required';
    }

    if (formData.resumeFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(formData.resumeFile.type)) {
        newErrors.resumeFile = 'Resume must be PDF or DOC/DOCX format';
      }
    }

    if (formData.coverLetterFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(formData.coverLetterFile.type)) {
        newErrors.coverLetterFile = 'Cover letter must be PDF or DOC/DOCX format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        jobPosition: '',
        companyName: '',
        jobDescription: '',
        dateApplied: new Date().toISOString().split('T')[0],
        jobType: 'full-time',
        jobCategory: null,
        notes: null,
        resumeFile: null,
        coverLetterFile: null,
      });
      setErrors({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'resumeFile' | 'coverLetterFile') => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Application</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
{/* Job Position - Company Name  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 mb-1">
              Job Position *
            </label>
            <input
              id="jobPosition"
              type="text"
              value={formData.jobPosition}
              onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.jobPosition ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Software Engineer"
            />
            {errors.jobPosition && <p className="text-red-500 text-sm mt-1">{errors.jobPosition}</p>}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Tech Corp"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
          </div>
        </div>
        
{/* Description */}
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.jobDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
          {errors.jobDescription && <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>}
        </div>

{/* Date - Type - Category  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dateApplied" className="block text-sm font-medium text-gray-700 mb-1">
              Date Applied *
            </label>
            <input
              id="dateApplied"
              type="date"
              value={formData.dateApplied}
              onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                errors.dateApplied ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateApplied && <p className="text-red-500 text-sm mt-1">{errors.dateApplied}</p>}
          </div>

          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type *
            </label>
            <select
              id="jobType"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Job Category
            </label>
            <select
              id="jobCategory"
              value={formData.jobCategory || ''}
              onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value as JobCategory || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category...</option>
              <option value="Game Development">Game Development</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend Development">Backend Development</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="DevOps">DevOps</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Project Management">Project Management</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
{/* Notes  */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
            <span className="text-gray-500 text-xs ml-1">(Optional - track follow-ups, interview feedback, etc.)</span>
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any notes about this application..."
          />
        </div>

{/* Resume - Cover Letter  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Resume (PDF, DOC, DOCX)
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'resumeFile')}
              className="file:cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100  cursor-pointer"
            />
            {errors.resumeFile && <p className="text-red-500 text-sm mt-1">{errors.resumeFile}</p>}
            {formData.resumeFile && <p className="text-sm text-gray-600 mt-1">{formData.resumeFile.name}</p>}
          </div>

          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter (PDF, DOC, DOCX)
            </label>
            <input
              id="coverLetter"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'coverLetterFile')}
              className="file:cursor-pointer cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.coverLetterFile && <p className="text-red-500 text-sm mt-1">{errors.coverLetterFile}</p>}
            {formData.coverLetterFile && <p className="text-sm text-gray-600 mt-1">{formData.coverLetterFile.name}</p>}
          </div>
        </div>
        
{/* Submit Button  */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} />
            Add Application
          </button>
        </div>
      </form>
    </div>
  );
}