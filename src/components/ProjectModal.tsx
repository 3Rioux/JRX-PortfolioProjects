import {DialogPanel, Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { X, Github, Globe, SquareArrowOutUpRight } from "lucide-react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAws, faCss3Alt, faJira, faMeta, faPhp, faSass, faUbuntu, faSteam, faTrello, faUnity, faAtlassian, faNode, faMicrosoft, faJava, faSquareJs, faReact, faHtml5, faLinkedin, faItchIo, faGithub, faSquareGithub, faTwitter, faFontAwesome } from '@fortawesome/free-brands-svg-icons';

const iconMap: Record<string, any> = {
  faAws,
  faCss3Alt,
  faJira,
  faMeta,
  faPhp,
  faSass,
  faUbuntu,
  faSteam,
  faTrello,
  faUnity,
  faAtlassian,
  faNode,
  faMicrosoft,
  faJava,
  faSquareJs,
  faReact,
  faHtml5,
  faLinkedin,
  faItchIo,
  faGithub,
  faSquareGithub,
  faTwitter,
  faFontAwesome,
};


interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
  }


export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
    
    const images: string[] = Array.isArray(project.image_url) ? project.image_url : [project.image_url];
    //Big size image 
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Image Carousel:
    const [current, setCurrent] = useState(0);

    //Stop at last image
    // const next = () => setCurrent((c) => Math.min(c + 1, images.length - 1));
    // const prev = () => setCurrent((c) => Math.max(c - 1, 0));

    //Full loop back to start image:
    const next = () => setCurrent((c) => (c + 1) % images.length);
    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

    return (
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={onClose} className="fixed inset-0 z-50">
          <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto ">
            <DialogPanel className="w-full max-w-screen-md max-h-9/10 overflow-y-auto max-w-7xl bg-white rounded-2xl shadow-xl p-4 relative">
              {/* Close Button */}
              <div className="mb-5">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Image Carousel */}
              {/* <div className="mb-4">
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
              </div> */}

              {/* Main Carousel */}
              <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-4">
                    {/* Main Image */}
                    <img
                      src={images[current]}
                      alt={`Screenshot ${current + 1}`}
                      className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
                      onClick={() => setIsLightboxOpen(true)} // open lightbox on click
                    />

                    {/* Prev */}
                    <button
                      onClick={prev}
                      // disabled={current === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full p-2 disabled:opacity-50"
                      aria-label="Previous image"
                    >
                      ❮
                    </button>

                    {/* Next */}
                    <button
                      onClick={next}
                      // disabled={current === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full p-2 disabled:opacity-50"
                      aria-label="Next image"
                    >
                      ❯
                    </button>
              </div>

              {/* Thumbnail Previews */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`flex-shrink-0 border-2 rounded-lg overflow-hidden ${
                      current === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-20 h-14 object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Lightbox Modal */}
              {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-4 right-4 text-white text-3xl"
                  >
                    <X className="w-8 h-8" />
                  </button>

                  {/* Large Image */}
                  <img
                    src={images[current]}
                    alt={`Screenshot ${current + 1}`}
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                  />

                  {/* Prev */}
                  <button
                    onClick={prev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-black rounded-full p-3"
                    aria-label="Previous image"
                  >
                    ❮
                  </button>

                  {/* Next */}
                  <button
                    onClick={next}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-black rounded-full p-3"
                    aria-label="Next image"
                  >
                    ❯
                  </button>
                </div>
              )}
  
              {/* Content */}
              <div className="flex flex-wrap gap-2 mb-4">
                <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
                <h2 className="text-gray-700 text-2xl font-bold mb-1"> - </h2>
                {project.members <= 1 ? (
                  <h2 className="text-gray-700 text-2xl font-bold mb-1">Team Members 1</h2>
                ) : (
                  <h2 className="text-gray-700 text-2xl font-bold mb-1">Team Members {project.members}</h2>
                )}
              </div>
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
                  <h4 className="font-semibold mb-1">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.software.map((soft: any) => (
                      <div key={soft.name} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        {/* <img src={soft.icon} alt={soft.name} className="w-4 h-4" /> */}
                        {iconMap[soft.icon] && (
                          <FontAwesomeIcon icon={iconMap[soft.icon]} className="w-4 h-4" />
                        )}
                        <span className="text-sm"> {soft.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* External Links */}
              
                <div className="flex gap-4">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline" style={{ cursor: 'pointer' }}>
                      <SquareArrowOutUpRight /><Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {project.itch_link && (
                    <a href={project.itch_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline" style={{ cursor: 'pointer' }}>
                    <SquareArrowOutUpRight /> <FontAwesomeIcon icon={faItchIo} className="w-4 h-4"  /> Itch.io
                    </a>
                  )}
                  {project.extra_link && (
                    <a href={project.extra_link} target="_blank" rel="noopener noreferrer" className="flex items-center p-1 gap-1 text-blue-600 hover:underline bg-cyan-100 rounded" style={{ cursor: 'pointer' }}>
                      <SquareArrowOutUpRight /> Extra Link
                    </a>
                  )}
                </div> 
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    );
  }













