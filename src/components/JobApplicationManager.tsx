import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { JobApplicationForm } from './JobApplicationForm';
import { AnalyticsDashboard } from './JobAnalyticsDashboard';
import { JobApplicationsList } from './JobApplicationsList';
import type { JobApplication, ApplicationFormData, ApplicationStatus } from '../types/jobApplication';

export function JobApplicationManager() {

    const navigate = useNavigate();
    const [applications, setApplications] = useState<JobApplication[]>([]);

    const handleAddApplication = (formData: ApplicationFormData) => {
        const newApplication: JobApplication = {
        id: crypto.randomUUID(),
        ...formData,
        status: 'Applied',
        createdAt: new Date().toISOString(),
        };

        setApplications((prev) => [newApplication, ...prev]);
    };

    const handleStatusChange = (id: string, status: ApplicationStatus) => {
        setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        {/* Back Button */}
        <button
            type="button"
            onClick={() => navigate("/JRX-PortfolioProjects/")}
            className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
            ← Back
        </button>
        
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
            <p className="text-gray-600">Manage your job applications and track your progress</p>
            </div>

            <JobApplicationForm onSubmit={handleAddApplication} />

            <AnalyticsDashboard applications={applications} />

            <JobApplicationsList applications={applications} onStatusChange={handleStatusChange} />
        </div>
        </div>
    );
}