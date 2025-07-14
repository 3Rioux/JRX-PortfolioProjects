import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AddProjectForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setMessage('Image upload failed: ' + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl?.publicUrl || '';
    }

    const { error } = await supabase.from('projects').insert([
      {
        title,
        description,
        tags: tags.split(',').map((tag) => tag.trim()),
        image_url: imageUrl,
      },
    ]);

    if (error) {
      setMessage('Failed to add project: ' + error.message);
    } else {
      setMessage('Project added successfully!');
      setTitle('');
      setDescription('');
      setTags('');
      setImageFile(null);
    }
  };

  return (
    <div className="bg-muted text-foreground border shadow-sm p-4 rounded-xl">
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
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Project
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
