import { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Maximize2, Minimize2, Save, Edit3, GripVertical } from 'lucide-react';

//this needs to be checked 
// import type { StoredDocument } from '../lib/fileDBIndexed';
import  { formatFileSize } from '../lib/fileDBIndexed';
import type { JobApplication } from '@/types/jobApplication';

interface DocumentPreviewProps {
    // document: StoredDocument;
    document: File;
    onClose: () => void;
    onUpdate?: (content: string) => void;
  }


  export function DocumentPreview({ document: selectedFile, onClose, onUpdate }: DocumentPreviewProps) {
    const [content, setContent] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    
    // Draggable and resizable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      loadDocument();
    }, [selectedFile]);
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }
        if (isResizing) {
          const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
          const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
          setSize({ width: newWidth, height: newHeight });
        }
      };
  
      const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
      };
  
      if (isDragging || isResizing) {
        window.document.addEventListener('mousemove', handleMouseMove);
        window.document.addEventListener('mouseup', handleMouseUp);
      }
  
      return () => {
        window.document.removeEventListener('mousemove', handleMouseMove);
        window.document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, isResizing, dragStart, resizeStart]);
  
    const loadDocument = async () => {
      try {
        setLoading(true);
        // const text = await document.blob.text();
        const text = await selectedFile.text();
        if(text) {
            setContent(text);
            setEditedContent(text);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        //toast.error('Failed to load document content');
        setContent('Unable to load document content. The file may be binary or corrupted.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleClose = () => {
      if (hasUnsavedChanges) {
        setShowCloseConfirm(true);
      } else {
        onClose();
      }
    };
  
    const handleDownload = () => {
    //   const url = URL.createObjectURL(document.blob);
    //   const a = window.document.createElement('a');
    //   a.href = url;
    //   a.download = document.fileName;
    //   window.document.body.appendChild(a);
    //   a.click();
    //   window.document.body.removeChild(a);
    //   URL.revokeObjectURL(url);

      //toast.success('Document downloaded');
    };
  
    const handleCopyContent = async () => {
      try {
        await navigator.clipboard.writeText(isEditing ? editedContent : content);
        //toast.success('Content copied to clipboard');
      } catch (error) {
        //toast.error('Failed to copy content');
      }
    };
  
    const handleEdit = () => {
      setIsEditing(true);
      setEditedContent(content);
    };
  
    const handleSave = () => {
      if (onUpdate) {
        onUpdate(editedContent);
      }
      setContent(editedContent);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      //toast.success('Changes saved');
    };
  
    const handleCancel = () => {
      setEditedContent(content);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    };
  
    const handleContentChange = (value: string) => {
      setEditedContent(value);
      setHasUnsavedChanges(value !== content);
    };
  
    const handleDragStart = (e: React.MouseEvent) => {
      if (isFullscreen) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    };
  
    const handleResizeStart = (e: React.MouseEvent) => {
      if (isFullscreen) return;
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      });
    };
  
    const containerStyle = isFullscreen
      ? { width: '100vw', height: '100vh', top: 0, left: 0 }
      : {
          width: `${size.width}px`,
          height: `${size.height}px`,
          top: `${position.y}px`,
          left: `${position.x}px`,
        };
  
    const isPDF = selectedFile.type === 'application/pdf';
    console.log('isPDF? ' + selectedFile.type);
  
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
  
        {/* Preview Container */}
        <div
          ref={containerRef}
          className="fixed bg-background rounded-lg shadow-2xl z-50 flex flex-col"
          style={containerStyle}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b bg-muted/30 rounded-t-lg cursor-move"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <GripVertical className="text-muted-foreground flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{selectedFile.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{new Date(selectedFile.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
  
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isPDF && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit document"
                >
                  <Edit3 size={18} className="text-muted-foreground" />
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Save size={16} className="inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={handleCopyContent}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Copy content"
              >
                <Copy size={18} className="text-muted-foreground" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Download file"
              >
                <Download size={18} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 size={18} className="text-muted-foreground" />
                ) : (
                  <Maximize2 size={18} className="text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Close"
              >
                <X size={18} className="text-destructive" />
              </button>
            </div>
          </div>
  
          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-background">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : isPDF ? (
              <iframe
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-full border-0"
                title={selectedFile.name}
              />
            ) : isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                spellCheck={false}
              />
            ) : (
              <pre className="font-mono text-sm whitespace-pre-wrap break-words text-foreground">
                {content}
              </pre>
            )}
          </div>
  
          {/* Resize Handle */}
          {!isFullscreen && (
            <div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
              onMouseDown={handleResizeStart}
            >
              <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-muted-foreground/50" />
            </div>
          )}
        </div>
  
        {/* Close Confirmation Modal */}
        {showCloseConfirm && (
          <>
            <div className="fixed inset-0 bg-black/70 z-50" />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-2xl p-6 z-50 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Unsaved Changes</h3>
              <p className="text-muted-foreground mb-6">
                You have unsaved changes. Are you sure you want to close?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCloseConfirm(false);
                    setHasUnsavedChanges(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Close Without Saving
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
  








