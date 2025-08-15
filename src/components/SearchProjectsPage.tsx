'use client';
import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { supabase } from '@/lib/supabaseClient';
import ProjectModal from '@/components/ProjectModal';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

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
    software: { name: string; icon: string }[];
  };

export function SearchProjectsPage() {

  const { user } = useAuth();
  const genres = ['Web', 'Mobile', 'Branding', 'Illustration'];
  const types = ['Client Work', 'Case Study', 'Concept', 'Freelance'];
  const allTags = [...genres, ...types];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching projects:', error.message);
      } else {
        setProjectData(data as Project[]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(projectData, {
        threshold: 0.3,
        keys: ['title', 'tags'],
      }),
    [projectData]
  );

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredProjects = useMemo(() => {
    const searchResults =
      searchQuery.trim() === ''
        ? projectData
        : fuse.search(searchQuery).map((result) => result.item);

    return searchResults.filter((project) =>
      selectedTags.every((tag) => project.tags.includes(tag))
    );
  }, [fuse, searchQuery, selectedTags, projectData]);

  return (
    <div>
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

      {/* Project Cards */}
      {loading ? (
        <p className="font-bold text-primary">Loading projects...</p>
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
                <h2 className="font-semibold text-lg mb-1">{project.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto">
                  <Button
                    variant="link"
                    className="mt-2 p-0 text-blue-600"
                    onClick={() => setSelectedProject(project)}
                  >
                    View Details →
                  </Button>
                </div>

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
    </div>
  );
}
