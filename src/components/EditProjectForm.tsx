import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge';

export default function EditProjectForm() {
  const [user, setUser] = useState<User | null>(null); // 👈 new user state

  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string>('');
  const [github_link, setGithub] = useState('');
  const [itch_link, setItch] = useState('');
  const [software, setSoftware] = useState<string>(''); // store as JSON string or comma-separated

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


  

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Failed to load project');
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setTags(data.tags?.join(', ') || '');
      setImageUrls(data.image_url?.join(', ') || '');
      setGithub(data.github_link || '');
      setItch(data.itch_link || '');
      setSoftware(
        data.software ? data.software.map((s: any) => s.name).join(', ') : ''
      );

      setLoading(false);
    };

    fetchProject();
  }, [id]);




  const handleUpdate = async () => {
    const { error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        tags: tags.split(',').map((tag) => tag.trim()),
        image_url: imageUrls.split(',').map((url) => url.trim()),
        github_link,
        itch_link,
        software: software.split(',').map((name) => ({ name: name.trim() })),
      })
      .eq('id', id);

    if (error) {
        console.error(error); // helpful debug
        setError(`Failed to update project: ${error.message} + Project UUID: ${id}`);
    } else {
      setIsSaved(true); // Switch to Done button
      setMessage(`Update Successfull`)
    }
  };

  // return to projects list button but still have time to review and see a success message 
  const handleDone = () => {
    navigate('/searchprojects'); // redirect to homepage or project view
  };
  
  if (loading) return <p className="text-center mt-10">Loading project...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  //CHECK LOGGIN  
  if (!user) {
    setMessage('User not authenticated');
    return;
  }

  return (
    // <div className="max-w-3xl mx-auto p-6">
    <div className="bg-muted text-foreground border shadow-sm p-4 rounded-xl max-w-xl mx-auto mt-10">
      
      {/* Who is trying to Update the Project */}
      <div className="flex flex-col gap-2 max-w-md mx-auto dark:text-violet-500">
        {user ? (
          <p className='border-2 border-solid text-center'>Adding Under User - {user.email}</p>
        ) : (
          <p>Not logged in</p>
        )}

        {/* Who Created the Project */}
        {user ? (
          <p className='border-4 border-solid text-center'>Project Creator - {user.email}</p>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      <div className="flex flex-col gap-2 max-w-md mx-auto dark:text-violet-500">
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>

        <label className="block font-medium text-sm dark:text-white">Title:</label>
        <Input
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">Description:</label>    
        <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">Tags (comma separated)</label>
        <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">Image URLs (comma separated):</label>
        <Input
            placeholder="Image URLs (comma separated)"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">GitHub URL:</label>
        <Input
            placeholder="GitHub URL"
            value={github_link}
            onChange={(e) => setGithub(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">Itch.io URL:</label>
        <Input
            placeholder="Itch.io URL"
            value={itch_link}
            onChange={(e) => setItch(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        <label className="block font-medium text-sm dark:text-white">Software (comma separated):</label>
        <Input
            placeholder="Software (comma separated)"
            value={software}
            onChange={(e) => setSoftware(e.target.value)}
            className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white mb-4"
        />

        {message && <p className="md:border-1 bg-indigo-200 rounded-xl text-center text-md mt-2 mb-4">{message}</p>}

        {/* <Button onClick={handleUpdate}>Save Changes</Button> */}
        {isSaved ? (
          <Button className="bg-green-500 text-lg" onClick={handleDone}>
            Return Home
          </Button>
          ) : (
            <Button className="bg-sky-500" onClick={handleUpdate}>
              Save Changes
            </Button>
          )}

          
        </div>
        
    </div>
  );
}