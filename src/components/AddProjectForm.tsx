import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// const { data: { user } } = await supabase.auth.getUser(); //Get Logged in user 

export default function AddProjectForm() {
  const [user, setUser] = useState<User | null>(null); // 👈 new user state

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  //Drag & Drop
  const dropRef = useRef<HTMLDivElement>(null);
  // const handleFileSelect = (file: File) => {
  //   setImageFile(file);
  //   const reader = new FileReader();
  //   reader.onloadend = () => setPreviewUrl(reader.result as string);
  //   reader.readAsDataURL(file);
  // };
  // Handle selected or dropped files
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    setImageFiles((prev) => [...prev, ...fileArray]);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const file = e.dataTransfer.files?.[0];
  //   if (file && file.type.startsWith('image/')) {
  //     handleFileSelect(file);
  //   }
  // };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
//Drag & Drop ---END

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

//CHECK LOGGIN  
  if (!user) {
    setMessage('User not authenticated');
    setLoading(false);
    return;
  }

  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) {
      setMessage('❌Image Upload failed: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    imageUrls.push(publicUrl?.publicUrl || '');
  }


  const { error } = await supabase.from('projects').insert([
    {
      title,
      description,
      tags: tags.split(',').map((tag) => tag.trim()),
      image_url: imageUrls[0], // You can store the first image as a cover
      user_id: user?.id,
      // Optionally store more images in a separate table
    },
  ]);

  if (error) {
    setMessage('❌ Submission failed: ' + error.message);
  } else {
    setMessage('✅ Project added!');
    setTitle('');
    setDescription('');
    setTags('');
    setImageFiles([]);
    setPreviewUrls([]);
  }

  setLoading(false);
};

  return (
    <div className="bg-muted text-foreground border shadow-sm p-4 rounded-xl max-w-xl mx-auto mt-10">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 max-w-md mx-auto"
      >
        <h2 className="font-semibold mb-1 text-xl dark:text-white">Add a Project</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        {/* <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        /> */}

        {/* Drag & Drop Upload Area */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="p-4 border-2 border-dashed border-gray-400 rounded cursor-pointer bg-gray-100 dark:bg-gray-800 text-center"
        >
          <p className="mb-2 text-sm">Drag & drop an image here, or click to select one.</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" 
          className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded cursor-pointer">
            Browse
          </label>

        {/* Image Gallery Preview */}
        {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {previewUrls.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx}`}
                  className="w-full h-32 object-cover rounded shadow"
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Add Project'
          )}
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
      <div>
      {user ? (
        <p>Adding Under User - {user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
    </div>
  );
}
