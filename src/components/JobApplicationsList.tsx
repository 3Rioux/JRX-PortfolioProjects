import { useState, useRef } from 'react';
import { Briefcase, Calendar, FileText, Building2, Tag, StickyNote, Save, CreditCard as Edit2, RefreshCw } from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types/jobApplication';

import  { indexedDBService } from '../lib/fileDBIndexed';
import type { StoredDocument } from '../lib/fileDBIndexed';
import { DocumentPreview } from './DocumentPreview';
import { supabase } from '@/lib/supabaseClient';


// import { useApplications } from '@/hooks/useApplications';

interface JobApplicationsListProps {
  applications: JobApplication[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onNotesUpdate: (id: string, notes: string) => void;
  loadApplications: () => void;
  loading: any;
  // firstJobRefList: RefObject<HTMLDivElement | null>; // 👈 accept the ref
}

export function JobApplicationsList({applications, onStatusChange, onNotesUpdate, loadApplications }: JobApplicationsListProps) {

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>('');
  // const [previewDocument, setPreviewDocument] = useState<StoredDocument | null>(null);
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);

  const firstJobRef = useRef<HTMLDivElement | null>(null);

  const statuses: ApplicationStatus[] = [
    'Applied',
    'Got Reply',
    'First Interview',
    'Second Interview',
    'Offer',
    'Denied',
  ];

  //Document Preview: 
  const handleOpenDocument = async (supabaseFileUrl: string | null, type: 'resume' | 'coverLetter') => {
    try {
      if (!supabaseFileUrl) {
        console.error("No file URL provided");
        return;
      }
      // var doc = application.coverLetterFile;
      // if(type == 'resume') doc = application.resumeFile;

      //ACCESS Supabase Storage for File:
      // Fetch the file from Supabase public URL
      const response = await fetch(supabaseFileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Convert response to Blob
      const blob = await response.blob();

      // Derive a filename from the URL (or set a custom one)
      const fileName = supabaseFileUrl.split('/').pop() || `${type}.txt`;

      // Convert Blob → File (so your DocumentPreview works)
      const file = new File([blob], fileName, { type: blob.type });


      if (file) {
        setPreviewDocument(file);
      }else {
        console.error("Failled to set Preview File");
      }

    } catch (error) {
      console.error("Error fetching document from Supabase:", error);
    }
  };

  // Notes State Event Handling 
  const handleEditNotes = (application: JobApplication) => {
    setEditingNotes(application.id);
    setNotesValue(application.notes || '');
  };
 
  const handleSaveNotes = (id: string) => {
    onNotesUpdate(id, notesValue);
    setEditingNotes(null);
    setNotesValue('');
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesValue('');
  };

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
        <button
        onClick={loadApplications}
        className="flex items-center gap-1 px-4 py-2 text-primary-foreground shadow-xs bg-blue-600 hover:bg-blue-700 cursor-pointer select-none rounded-lg transition-colors border border-gray-300"
        title="Refresh applications"
      >
        <RefreshCw size={18} />
        Refresh
      </button>
        <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
        <p className="text-gray-500">Start by adding your first job application above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
    <div className='flex items-center justify-between pt-2' > 
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h2>
      <button
        onClick={loadApplications}
        className="flex items-center gap-1 px-4 py-2 text-primary-foreground shadow-xs bg-blue-600 hover:bg-blue-700 cursor-pointer select-none rounded-lg transition-colors border border-gray-300"
        title="Refresh applications"
      >
        <RefreshCw size={18} />
        Refresh
      </button>
    </div>

    <div className="space-y-4">
      {applications.map((application, index) => (
        <div 
        key={application.id} 
        ref={index === 0 ? firstJobRef : null}
        tabIndex={-1}
        onFocus={ () =>
          index === 0 && firstJobRef.current ?
          firstJobRef.current.focus() : console.error('-Error accessing first job element ' +  firstJobRef.current)
        }
         className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={18} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{application.jobPosition}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="text-sm">{application.companyName}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {application.jobCategory && (
                  <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    <Tag size={12} />
                    {application.jobCategory}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  <Calendar size={12} />
                  {formatDate(application.dateApplied)}
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                  {application.jobType}
                </span>
                <div className="flex items-center gap-1">
                  {application.resumeFile && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <FileText size={12} />
                      Resume
                    </div>
                  )}
                  {application.coverLetterFile && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <FileText size={12} />
                      Cover
                    </div>
                  )}
                </div>
              </div>

              {editingNotes === application.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Add notes about this application..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveNotes(application.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {application.notes ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-xs text-yellow-700 font-medium mb-1">
                            <StickyNote size={12} />
                            Notes
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.notes}</p>
                        </div>
                        <button
                          onClick={() => handleEditNotes(application)}
                          className="text-yellow-700 hover:text-yellow-800"
                          title="Edit notes"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditNotes(application)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <StickyNote size={14} />
                      Add notes
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="md:w-48">
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={application.status}
                onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                  application.status
                )}`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div >
              <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
              <div className="flex items-center gap-2">
                {application.resumeFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <FileText size={14} />
                    Resume
                  </div>
                )}
                {application.coverLetterFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <FileText size={14} />
                    Cover Letter
                  </div>
                )}
                {!application.resumeFile && !application.coverLetterFile && (
                  <span className="text-xs text-gray-400">No documents attached</span>
                )}
              </div>
            </div>

            <div>
            {application.resumeFile && (
                      <button
                        onClick={() => {
                          handleOpenDocument(application.resumeURL, 'resume')
                        }
                      }
                        className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={12} />
                        Resume: {application.resumeFileName}
                      </button>
            )}
            {application.coverLetterFile && (
                      <button
                        onClick={() => {
                          
                          handleOpenDocument(application.coverLetterURL, 'coverLetter')
                        }
                      }
                        className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={12} />
                        Cover: {application.coverLetterFileName}
                      </button>
            )}
            {!application.resumeFile && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <FileText size={12} />
                        Resume
                      </div>
            )}
            {!application.coverLetterFile && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <FileText size={12} />
                        Cover
                      </div>
            )}
            {!application.resumeFile && !application.coverLetterFile && (
                  <span className="text-xs text-gray-400">No documents attached</span>
            )}
            </div>



          </div>
          {previewDocument && (
            <DocumentPreview
              document={previewDocument}
              onClose={() => setPreviewDocument(null)}
            />
          )}


        </div>
      ))}
    </div>
  </div>
  );
}