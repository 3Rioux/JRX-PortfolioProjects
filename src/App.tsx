'use client';
import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

import clsx from 'clsx';

//Database GET
import { supabase } from '@/lib/supabaseClient'; // update path if needed

//Multi Page Routing: 
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AddProjectForm from '@/components/AddProjectForm.tsx'; // Adjust the path as needed
import LoginForm from '@/components/LoginForm.tsx';
import ProjectModal from "@/components/ProjectModal.tsx";
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
import { useAuth } from '@/components/AuthContext';

type Project = {
  id: number;
  title: string;
  image_url?: string[];
  tags: string[];
  description: string;
  contribution?: string;
  github_link?: string;
  itch_link?: string;
  software: { name: string; icon: string }[]; // icon is a URL
};


export default function AdvancedSearchPage() {
  //Login:
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Optional: redirect to login after logout
  };
  
  const genres = ['Web', 'Mobile', 'Branding', 'Illustration'];
  const types = ['Client Work', 'Case Study', 'Concept', 'Freelance'];
  const allTags = [...genres, ...types];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // const [isDark, setIsDark] = useState(false);

  // Search Input Logic:
  const [searchQuery, setSearchQuery] = useState('');

  const [projectData, setProjectData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  //Pop-up Model:
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // const projectData = [
  //   {
  //     id: 1,
  //     title: 'Portfolio Website',
  //     description: 'A clean portfolio site for showcasing projects.',
  //     tags: ['Web', 'Client Work'],
  //   },
  //   {
  //     id: 2,
  //     title: 'Mobile App Concept',
  //     description: 'An idea for a productivity-focused mobile app.',
  //     tags: ['Mobile', 'Concept'],
  //   },
  //   {
  //     id: 3,
  //     title: 'Brand Identity',
  //     description: 'Logo and branding for a local business.',
  //     tags: ['Branding', 'Freelance'],
  //   },
  //   {
  //     id: 4,
  //     title: 'Illustration Piece',
  //     description: 'A detailed digital illustration for a client.',
  //     tags: ['Illustration', 'Client Work'],
  //   },
  // ];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching projects:', error.message);
      } else {
        console.debug('successfully fetching projects:');
        setProjectData(data as Project[]);
        console.log('Project data fetched:', data); // Add this line
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(projectData, {
        threshold: 0.3, // Lower = stricter matching
        keys: ['title', 'tags'],
      }),
    [projectData]
  );

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  //Filter Projects With Just the Tags
  // const filteredProjects =
  //   selectedTags.length === 0
  //     ? projectData
  //     : projectData.filter((project) =>
  //         selectedTags.every((tag) => project.tags.includes(tag))
  //       );

  //Filter Projects With Search bar + Tags
  const filteredProjects = useMemo(() => {
    // First fuzzy search with title/tags
    const searchResults =
      searchQuery.trim() === ''
        ? projectData
        : fuse.search(searchQuery).map((result) => result.item);

    // Then filter based on selectedTags
    return searchResults.filter((project) =>
      selectedTags.every((tag) => project.tags.includes(tag))
    );
  }, [fuse, searchQuery, selectedTags, projectData]);

  // const toggleTheme = () => {
  //   const root = document.documentElement;
  //   const isNowDark = !isDark;
  //   if (isNowDark) {
  //     root.classList.add('dark');
  //     localStorage.setItem('theme', 'dark');
  //   } else {
  //     root.classList.remove('dark');
  //     localStorage.setItem('theme', 'light');
  //   }
  //   setIsDark(isNowDark);
  // };

  // //Theme Toggle Button:
  // useEffect(() => {
  //   // On load, detect system or saved preference
  //   const saved = localStorage.getItem('theme');
  //   const systemPrefersDark = window.matchMedia(
  //     '(prefers-color-scheme: dark)'
  //   ).matches;
  //   if (saved === 'dark' || (!saved && systemPrefersDark)) {
  //     document.documentElement.classList.add('dark');
  //     setIsDark(true);
  //   }
  // }, []);
  
  return (
    <div className="bg-background text-foreground">
            <div className="min-h-screen  p-4 md:p-10 text-gray-900">
      {/* Navbar */}
      <header className="header-projects flex justify-between items-center mb-6 sticky top-0 z-10 shadow-sm p-4 rounded-xl">
          <h1 className="text-xl dark:text-white">
            Justin Rioux's{' '}
            <span className="font-bold text-primary">Projects</span>
          </h1>
          <nav className="space-x-4 hidden md:block">
            <a
              href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              Home
            </a>
            <a href="https://jrxportfolioprojects-0y4z--5173--96435430.local-credentialless.webcontainer.io/JRX-PortfolioProjects/" className="text-sm hover:underline">
              Projects
            </a>
            <a
              href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page2"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              About
            </a>
            
            {/* <a href="#" className="text-sm hover:underline">
              Contact
            </a> */}
          </nav>
          {/* <Button variant="outline">☀️</Button> */}
          {/* <div>
            <Button onClick={toggleTheme} variant="outline">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div> */}{' '}
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ModeToggle />
          </ThemeProvider>
        </header>

        {/* Search Bar */}
        <div className="mb-4">
          <Input
            placeholder="Search projects by name or tag..."
            className="rounded-full px-4 py-2 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              onClick={() => handleTagClick(tag)}
              className={clsx('cursor-pointer select-none text-md')}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <p className="text-bg font-bold text-primary">Loading projects...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4 flex flex-col h-full">
                  {Array.isArray(project.image_url) && project.image_url.length > 0  ? (
                    <img
                      src={project.image_url[0]}
                      alt={project.title}
                      className="w-full aspect-video object-cover rounded-xl mb-3"
                    />
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-xl mb-3" />
                  )}
                  <h2 className="font-semibold text-lg mb-1">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {project.description}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Button variant="link" 
                    className="mt-2 p-0 text-blue-600"
                    onClick={() => setSelectedProject(project)}
                    > 
                      View Details →
                    </Button>
                  </div>
                  {/* Show modal if selected */}
                  {selectedProject && (
                    <ProjectModal
                      isOpen={!!selectedProject}
                      onClose={() => setSelectedProject(null)}
                      project={selectedProject}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredProjects.length === 0 && (
              <p className="col-span-full text-gray-500 text-center">
                No projects match the selected tags.
              </p>
            )}
          </div>
        )}
        {/* <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Advanced Search</h2>

          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <ul className="grid gap-4">
              {projectData
                .filter((project) =>
                  project.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .filter((project) =>
                  selectedTags.length === 0
                    ? true
                    : selectedTags.every((tag) => project.tags.includes(tag))
                )
                .map((project) => (
                  <li key={project.id} className="border p-4 rounded shadow">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="flex gap-2 mt-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-200 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div> */}
        {/* Footer */}
        <footer className="mt-16 border-t pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 MyPortfolio</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
            {/* <a href="#">Twitter</a> */}
            {user && (
              <Link
                to="/add-project"
                // className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                className={'cursor-pointer select-none text-md'}
              >
                Add New Project
              </Link>
            )}
            {!user ? (
              <Link
                to="/login"
                // className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                className={clsx('cursor-pointer select-none text-md')}
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className={clsx('cursor-pointer select-none text-md text-red-600')}
              >
                Logout
              </button>
            )}
          </div>
            
        </footer>
        <div>
          <Routes>
            <Route path="/" element={<AdvancedSearchPage />} />
            {/* <Route path="/add-project" element={<AddProjectForm />} /> */}
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/add-project"
              element={
                <ProtectedRoute>
                  <AddProjectForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
