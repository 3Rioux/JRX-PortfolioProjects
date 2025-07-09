import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AddPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('posts').insert([{ title, content }]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Post added successfully!');
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Add a Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="p-2 border rounded h-32"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Post
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
