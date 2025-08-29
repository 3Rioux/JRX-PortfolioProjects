'use client';
import jrxLogoImage from './assets/Default_Logo_1024x1024.jpg';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

import { Menu, X, RefreshCw } from "lucide-react"; // icon library (shadcn/lucide)

import clsx from 'clsx';

//Database GET
import { supabase } from '@/lib/supabaseClient'; // update path if needed

//Multi Page Routing: 
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AddProjectForm from '@/components/AddProjectForm.tsx'; // Adjust the path as needed
import LoginForm from '@/components/LoginForm.tsx';
import ProjectModal from "@/components/ProjectModal.tsx";
import EditProjectForm from "@/components/EditProjectForm.tsx";
import TagManagerForm from "@/components/TagManagerForm.tsx";
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
import { useAuth } from '@/components/AuthContext';


type TagObj = {
  id: string; // uuid
  name: string;
  category: string;
};

type Project = {
  id: number;
  title: string;
  members: number;
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

  const genres = ['Website', 'Mobile', 'Game Dev'];
  //const types = ['Client Work', 'Case Study', 'Concept', 'Freelance'];
  const types = ['Consept'];

  const [allTags, setAllTags] = useState<string[]>([]);

  // const allTags = [...genres, ...types];

  // Set default tags incase cant access database? but if i cant access i cant search anyway right?
  const defaultTags = Array.from(
    new Set([...genres, ...types])
  );
  // setAllTags(defaultTags);


  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // const [isDark, setIsDark] = useState(false);

  // Search Input Logic:
  const [searchQuery, setSearchQuery] = useState('');

  const [projectData, setProjectData] = useState<Project[]>([]);
  const [tagsData, setTagsData] = useState<TagObj[]>([]);
  const [loading, setLoading] = useState(true);

  //Pop-up Model:
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // useEffect(() => {
  //   const fetchProjects = async () => {

  //     setAllTags(defaultTags);

  //     setLoading(true);
  //     const { data, error } = await supabase.from('projects').select('*');
  //     if (error) {
  //       console.error('Error fetching projects:', error.message);
  //     } else {
  //       console.debug('successfully fetching projects:');
  //       setProjectData(data as Project[]);
  //       console.log('Project data fetched:', data); // Add this line

  //       // Extract all tags from the database
  //       const dbTags = data
  //       .flatMap((project) => project.tags || []) // Flatten tags arrays
  //       .filter(Boolean); // Remove null/undefined

  //       // Merge with genres & types, remove duplicates
  //       const uniqueTags = Array.from(
  //         new Set([...genres, ...types, ...dbTags])
  //       );

  //       // Sort alphabetically
  //       uniqueTags.sort((a, b) => a.localeCompare(b));

  //       //Set tags to the unique tags found in the database 
  //       setAllTags(uniqueTags);
  //     }//end if else 
      
  //     setLoading(false);
  //   };

  //   fetchProjects();
  // }, []);

  // Extract fetch function so it can be reused form load + Reload button 
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch projects
      const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*');

      if (projectError) {
        console.error('Error fetching projects:', projectError.message);
      } else {
        setProjectData(projectData as Project[]);
        console.log('Project data fetched:', projectData);
      }

      // 2. Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (tagsError) {
        console.error('Error fetching tags:', tagsError.message);
      } else {
        console.log('Tags fetched:', tagsData);
        
        //store the full tag objects
        setTagsData(tagsData as TagObj[]);

        // Extract names
        const tagNames = (tagsData || []).map((tag) => tag.name);

        // Merge with defaultTags, remove duplicates
        const uniqueTags = Array.from(new Set([...defaultTags, ...tagNames]));

        // Sort alphabetically
        uniqueTags.sort((a, b) => a.localeCompare(b));

        // ✅ Set tags state
        setAllTags(uniqueTags);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }

    setLoading(false);
  }, []);


  // === Get Projects On Load ===
  useEffect(() => {
    //Call to load project on page load 
    fetchData();
  }, [fetchData]);

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

  // === Menu ===
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); //for clicking off the menu

  // Close menu if clicked outside
  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    } else {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isMenuOpen]);



  // Group tags by category
  const groupedTags = useMemo(() => {
    return tagsData.reduce<Record<string, TagObj[]>>((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {});
  }, [tagsData]);


  return (
    <div className="bg-background text-foreground">
      <div className="min-h-screen  p-4 md:p-10 text-gray-900">
      {/*  Content CLick Capture */}
      <div className="click-capture"></div>

      
      {/* Logo + Title */}
      <header className="header-projects min-w- flex justify-between items-center mb-6 sticky top-0 z-10 shadow-sm p-4 rounded-xl backdrop-blur-sm">
        <h1 className="text-xl dark:text-white">
          <div className="flex items-center gap-2">
            <a className="h-12 w-12 "  href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1">
                <img className='flex-shrink-0'  alt="Logo" src={jrxLogoImage}></img>  
            </a>
            {/* <span className="hidden sm:inline">Justin Rioux's{' '}</span> */}
            {/* <span className="font-bold text-primary">Projects Page</span> */}
            {/* NOT Perfect but close enaugh for now  */}
            <span className="text-primary font-bold text-sm xxs:text-xl xs:text-3xl sm:text-2xl md:text-3xl max-[360px]:hidden">Projects Page</span>
            {/* <span className=" text-primary font-bold text-[clamp(0.2rem, 1.5vw, 1.25rem)]">
              Projects Page
            </span> */}
          </div>
        </h1>

        {/* Desktop Nav */}
        <nav className="space-x-4 hidden md:block">
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1"
            rel="noopener noreferrer"
            className="text-lg md:text-xl hover:underline"
          >
            Home
          </a>
          <a 
            href="/JRX-PortfolioProjects/" 
            className="text-lg md:text-xl hover:underline">
            Projects
          </a>
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page2"
            rel="noopener noreferrer"
            className="text-lg md:text-xl hover:underline"
          >
            About
          </a>

            {/* <a href="#" className="text-lg md:text-xl hover:underline">
              Contact
            </a> */}
        </nav>
        {/* <Button variant="outline">☀️</Button> */}
          {/* <div>
            <Button onClick={toggleTheme} variant="outline">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div> */}{' '}
        {/* <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ModeToggle />
        </ThemeProvider> */}

      {/* !!!Hate that i have to double create this because of the click off menu breaks the close button !!!*/}
      <div className="flex items-center gap-2 hidden md:block">
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ModeToggle />
        </ThemeProvider>
      </div>
      

      <div ref={menuRef} className="relative md:hidden">
        {/* Theme + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ModeToggle />
          </ThemeProvider>

              {/* Mobile Menu Toggle */}
              <button
                
                className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6 text-black dark:text-white"  strokeWidth={2} /> : <Menu className="h-6 w-6 text-black dark:text-white" strokeWidth={2} />}
              </button>
        </div>

        {/* Mobile Dropdown Menu with Slide Animation */}
        <div
          className={clsx(
            "absolute top-full right-4 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col space-y-2 md:hidden transform transition-all duration-300 origin-top",
            isMenuOpen
              ? "scale-y-100 opacity-100 max-h-96 p-4"
              : "scale-y-0 opacity-0 max-h-0 p-0"
          )}
        >
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="/JRX-PortfolioProjects/"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            Projects
          </a>
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page2"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {/* {isMenuOpen && (
        //OG
        //  className="absolute top-full right-4 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col space-y-2 md:hidden">
        
        <div
            ref={menuRef}
            className={clsx(
              "absolute top-full right-4 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col space-y-2 md:hidden transform transition-all duration-1000 origin-top",
              isMenuOpen
                ? "scale-y-100 opacity-100 max-h-96 p-4"
                : "scale-y-0 opacity-0 max-h-0 p-0"
            )}
         
        >
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="/"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            Projects
          </a>
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page2"
            className="text-lg hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
        </div>
      )} */}
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
        {/* <div className="flex flex-wrap gap-2 mb-6">
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
        </div> */}
{/* Tags Display */}
        <div className="flex flex-col gap-4 ml-2 mb-6">
          {Object.entries(groupedTags).map(([category, tags]) => (
            <div key={category}>
              {/* Category heading */}
              <h3 className="font-semibold text-lg mb-2 border-b-2 border-primary/65 dark:text-white">
                {category.toUpperCase()}:
              </h3>

              {/* Tags inside this category */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                    onClick={() => handleTagClick(tag.name)}
                    className={clsx("cursor-pointer select-none text-md")}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider between projects and tags  */}
        <div className='font-semibold text-lg mb-4 text-primary border-b-4 border-primary/80 dark:text-white'></div>

{/* Project Display Cards Grid */}
        {loading ? (
          <p className="text-bg font-bold text-primary">Loading projects...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4 flex flex-col h-full">
                  {Array.isArray(project.image_url) && project.image_url.length > 0 ? (
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
                  {user && (
                    <Link
                      to={`/edit-project/${project.id}`}
                      className="text-sm text-blue-600 hover:underline ml-auto"
                    >
                      Edit
                    </Link>
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

{/* Reload Projects button */}
      <div className="flex flex-col mx-auto text-center pt-2">
          <Button 
            className="text-xl "
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className="min-w-6 min-h-6"  strokeWidth={3}></RefreshCw>
            {loading ? 'Reloading...' : 'Reload Projects'}
            <RefreshCw className="min-w-6 min-h-6"  strokeWidth={3}></RefreshCw>
          </Button>
      </div>
       
      {/* Footer */}
      <footer className="mt-16 border-t pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 MyPortfolio</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#">LinkedIn</a>
          <a href="#">GitHub</a>
      {/* <a href="#">Twitter</a> */}
          {user && (
             <Link
                  to={'/tags-manager'}
                  // className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  className={'cursor-pointer select-none text-md rounded hover:bg-primary/30'}
                >
                Tags Manager
              </Link>
          )}
          
          {user && (
            <Link
                to="/add-project"
                // className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                className={'cursor-pointer select-none text-md rounded hover:bg-primary/30'}
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
            <Route path="/searchprojects" element={<AdvancedSearchPage />} />
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
            <Route path="/tags-manager" element={
                <ProtectedRoute>
                  <TagManagerForm />
                </ProtectedRoute>
              }
            />
            <Route path="/edit-project/:id" element={<EditProjectForm />} />
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
