import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// const { data: { user } } = await supabase.auth.getUser(); //Get Logged in user 

export default function AddProjectForm() {
  const [user, setUser] = useState<User | null>(null); // 👈 new user state

  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [members, setMembers] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [contribution, setContribution] = useState('');
  // const [softwareList, setSoftwareList] = useState([{ name: '', icon: '' }]);
  const [softwareList, setSoftwareList] = useState<{ name: string; icon: string }[]>([]);
  // Sample list of Lucide icon names to choose from (you can expand this)
  const iconsList = [
    { label: 'AWS', value: 'faAws' },
    { label: 'CSS3', value: 'faCss3Alt' },
    { label: 'Jira', value: 'faJira' },
    { label: 'Meta (Facebook)', value: 'faMeta' },
    { label: 'PHP', value: 'faPhp' },
    { label: 'Sass', value: 'faSass' },
    { label: 'Ubuntu', value: 'faUbuntu' },
    { label: 'Steam', value: 'faSteam' },
    { label: 'Trello', value: 'faTrello' },
    { label: 'Unity', value: 'faUnity' },
    { label: 'Atlassian', value: 'faAtlassian' },
    { label: 'Node.js', value: 'faNode' },
    { label: 'Microsoft', value: 'faMicrosoft' },
    { label: 'Java', value: 'faJava' },
    { label: 'JavaScript', value: 'faSquareJs' },
    { label: 'React', value: 'faReact' },
    { label: 'HTML5', value: 'faHtml5' },
    { label: 'LinkedIn', value: 'faLinkedin' },
    { label: 'Itch.io', value: 'faItchIo' },
    { label: 'GitHub', value: 'faGithub' },
    { label: 'GitHub Square', value: 'faSquareGithub' },
    { label: 'Twitter', value: 'faTwitter' },
    { label: 'Font Awesome', value: 'faFontAwesome' },
  ];

  const [githubLink, setGithubLink] = useState('');
  const [itchLink, setItchLink] = useState('');
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
    const safeTitle = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''); // sanitize folder name
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
    //const filePath = `${fileName}`;
    const filePath = `${safeTitle}/${fileName}`; // 👈 uploads to subfolder named by title

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // prevents overwriting existing files
        contentType: file.type,
      });

    if (uploadError) {
      setMessage('❌Image Upload failed: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    imageUrls.push(publicUrlData?.publicUrl || '');
   
  }


  const { error } = await supabase.from('projects').insert([
    {
      title,
      members,
      description,
      tags: tags.split(',').map((tag) => tag.trim()),
      image_url: imageUrls, 
      user_id: user?.id,
      contribution,
      software: softwareList,
      github_link: githubLink,
      itch_link: itchLink,
      // Optionally store more images in a separate table
    },
  ]);

  if (error) {
    setMessage('❌ Submission failed: ' + error.message);
  } else {
    setMessage('✅ Project added!');
    setTitle('');
    setMembers('');
    setDescription('');
    setTags('');
    setContribution('');
    setGithubLink('');
    setItchLink('');
    setImageFiles([]);
    setPreviewUrls([]);
  }

  setLoading(false);
};

  return (
    <div className="bg-muted text-foreground border shadow-sm p-4 rounded-xl max-w-xl mx-auto mt-10">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        ← Back
      </button>
      
      <div className="flex flex-col gap-2 max-w-md mx-auto dark:text-violet-500">
        {user ? (
          <p className='border-4 border-solid text-center'>Adding Under User - {user.email}</p>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 max-w-md mx-auto"
      >
        <h2 className="font-bold mb-1 text-xl dark:text-white">Add a Project</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <input
          type="number"
          placeholder="# of members working of project (int)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
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

        <textarea
          placeholder="Your Role / Contribution (Role 1 - Role 2 - Role 3 - ...)"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />

        {/* Dynamic Software List */}
        <div className="space-y-2">
          <label className="block font-medium text-sm dark:text-white">Software Used</label>
          {softwareList.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Name"
                value={item.name}
                onChange={(e) => {
                  const newList = [...softwareList];
                  newList[index].name = e.target.value;
                  setSoftwareList(newList);
                }}
                className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white w-1/2"
              />
              
              <select
                value={item.icon}
                // onChange={(e) => setSoftwareIcon(e.target.value)}
                onChange={(e) => {
                  const newList = [...softwareList];
                  newList[index].icon = e.target.value;
                  setSoftwareList(newList);
                }}
                className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white flex-1"
              >
                <option value="">Select icon</option>
                {iconsList.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Icon URL or file name"
                value={item.icon}
                onChange={(e) => {
                  const newList = [...softwareList];
                  newList[index].icon = e.target.value;
                  setSoftwareList(newList);
                }}
                className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white w-1/2"
              />
              <button
                type="button"
                onClick={() => {
                  const newList = softwareList.filter((_, i) => i !== index);
                  setSoftwareList(newList);
                }}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSoftwareList([...softwareList, { name: '', icon: '' }])}
            className="text-blue-600 text-sm mt-1"
          >
            + Add Software
          </button>
        </div>

        {/* Optional links */}
        <input
          type="url"
          placeholder="Project GitHub Link"
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <input
          type="url"
          placeholder="Project Itch.io Link"
          value={itchLink}
          onChange={(e) => setItchLink(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />

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
      
    </div>
  );
}
