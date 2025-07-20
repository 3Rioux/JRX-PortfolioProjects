import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Github, Globe } from "lucide-react";


interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
  }


  export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
    const images: string[] = Array.isArray(project.image_url) ? project.image_url : [project.image_url];
  
    return (
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={onClose} className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-4 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
  
              {/* Image Carousel */}
              <div className="mb-4">
                {images.length > 0 && (
                  <div className="w-full overflow-x-auto whitespace-nowrap rounded-xl">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Screenshot ${i + 1}`}
                        className="inline-block w-full sm:w-[300px] aspect-video object-cover rounded-xl mr-2"
                      />
                    ))}
                  </div>
                )}
              </div>
  
              {/* Content */}
              <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
              <p className="text-gray-700 mb-2">{project.description}</p>
  
              {/* Contribution */}
              {project.contribution && (
                <p className="text-sm italic text-gray-600 mb-4">
                  <strong>My Role:</strong> {project.contribution}
                </p>
              )}
  
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
  
              {/* Software Used */}
              {project.software && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Software Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.software.map((soft: any) => (
                      <div key={soft.name} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <img src={soft.icon} alt={soft.name} className="w-4 h-4" />
                        <span className="text-sm">{soft.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* External Links */}
              <div className="flex gap-4">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {project.itch && (
                  <a href={project.itch} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline">
                    <Globe className="w-4 h-4" /> Itch.io
                  </a>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    );
  }













