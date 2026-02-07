import React, { useState, useRef, useEffect } from 'react';
import { PROJECTS } from '../constants';
import { TechIcon } from './TechIcon';
import { Project } from '../types';

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [showLeftGradient, setShowLeftGradient] = useState(false);

  // Modal States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter projects
  const filteredProjects = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory);

  // Reset scroll when category changes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      setShowLeftGradient(false);
    }
  }, [activeCategory]);

  // Auto scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;

    const scroll = () => {
      if (el) {
        // Calculate max scrollable width
        const maxScroll = el.scrollWidth - el.clientWidth;

        // Check conditions:
        // 1. Not paused by user
        // 2. Current scroll is less than max (with 1px buffer to prevent vibration/sub-pixel issues)
        if (!isPaused && !selectedProject && el.scrollLeft < maxScroll - 1) {
          el.scrollLeft += 1; // Smooth scroll speed
        }
        // If condition fails (reached end), it simply does nothing ("diam")
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Only start animation if there is enough content to scroll
    if (el.scrollWidth > el.clientWidth) {
      animationFrameId = requestAnimationFrame(scroll);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, selectedProject, activeCategory]);

  // Modal Handlers
  const openModal = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setIsPaused(true); // Pause background scrolling
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
    setIsPaused(false);
    document.body.style.overflow = 'auto'; // Restore body scroll
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  return (
    <div className="md:col-span-4 lg:col-span-6 flex flex-col gap-6 my-4" id="projects">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl text-black border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-[24px] text-[#0066cc]">grid_view</span>
          </div>
          <h2 className="text-3xl font-bold text-text-main">My Projects</h2>
        </div>

        {/* Filter Chips - Segmented Control Style */}
        <div className="p-1 bg-white border border-gray-200 rounded-full flex overflow-x-auto no-scrollbar max-w-full shadow-sm">
          {['All', 'Web', 'Mobile', 'AI/Data', 'Smart City'].map((category) => {
            const count = category === 'All'
              ? PROJECTS.length
              : PROJECTS.filter(p => p.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2
                  ${activeCategory === category
                    ? 'bg-[#0066cc] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-white animate-in fade-in duration-200">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliding Container */}
      <div
        className="relative group/container"
        onMouseEnter={() => {
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          setIsPaused(true);
        }}
        onMouseLeave={() => {
          scrollTimer.current = setTimeout(() => setIsPaused(false), 1000);
        }}
        onTouchStart={() => {
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          setIsPaused(true);
        }}
        onTouchEnd={() => {
          scrollTimer.current = setTimeout(() => setIsPaused(false), 1000);
        }}
      >
        {/* Gradients to hint scroll - match liquid card background */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-[#f5f5f7] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftGradient ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-[#f5f5f7] to-transparent z-10 pointer-events-none"></div>

        <div
          ref={scrollRef}
          onScroll={() => {
            if (scrollRef.current) {
              const shouldShow = scrollRef.current.scrollLeft > 10;
              if (shouldShow !== showLeftGradient) {
                setShowLeftGradient(shouldShow);
              }
            }
          }}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openModal(project)}
              className="min-w-[280px] md:min-w-[380px] h-[400px] md:h-[420px] glass-card bento-hover rounded-3xl overflow-hidden group flex flex-col cursor-pointer"
            >
              {/* Image Section */}
              <div className="h-44 md:h-48 overflow-hidden relative shrink-0">
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-text-main shadow-sm backdrop-blur-md border border-gray-200">
                    {project.category}
                  </span>
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>

                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* View Gallery Hint */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">photo_library</span>
                    View Gallery
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 md:p-5 flex flex-col flex-1 relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-text-main leading-tight">{project.title}</h3>

                  {/* Link Icons */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {project.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-[#0066cc] hover:text-white transition-colors border border-gray-100 text-gray-500 shadow-sm relative z-30"
                        title={link.type}
                      >
                        {link.type === 'github' && (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        )}
                        {link.type === 'url' && <span className="material-symbols-outlined text-[16px]">language</span>}
                        {link.type === 'playstore' && <span className="material-symbols-outlined text-[16px]">android</span>}
                        {link.type === 'appstore' && <span className="material-symbols-outlined text-[16px]">ios</span>}
                        {link.type === 'postman' && <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" className="w-4 h-4" alt="Postman" />}
                        {link.type === 'docs' && <span className="material-symbols-outlined text-[16px]">description</span>}
                        {link.type === 'youtube' && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                        {link.type === 'figma' && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8.333 0C6.035 0 4.167 1.865 4.167 4.167c0 2.302 1.868 4.166 4.167 4.166V0zm0 8.333H4.167C1.865 8.333 0 10.198 0 12.5s1.865 4.167 4.167 4.167h4.166V8.333zM12.5 16.667v-4.167H8.333v4.167c0 2.302 1.868 4.166 4.167 4.166s4.167-1.864 4.167-4.166c0-2.302-1.865-4.167-4.167-4.167zM16.667 8.333h-4.167V4.167C12.5 1.865 14.365 0 16.667 0s4.167 1.865 4.167 4.167c0 2.302-1.865 4.166-4.167 4.166z" /></svg>}
                      </a>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2 overflow-hidden text-ellipsis">
                  {project.description}
                </p>

                {/* Tech Stack Icons */}
                <div className="mt-auto">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Built With</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map(tech => (
                      <div key={tech} className="p-1.5 rounded-lg bg-white/60 border border-gray-100 shadow-sm" title={tech}>
                        <TechIcon name={tech} size={5} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Decor */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-[#0066cc]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          ))}

          {/* Spacer for right padding in scrolling */}
          <div className="min-w-[20px]"></div>
        </div>
      </div>

      {/* Project Gallery Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl bg-white/10 backdrop-filter backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Left: Image Gallery or Embed */}
            <div className="w-full md:w-2/3 bg-black relative flex items-center justify-center h-[40vh] md:h-[80vh] group overflow-hidden">
              {selectedProject.embed ? (
                <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
                  <div
                    className="w-full h-full [&>div]:!h-full [&>div]:!w-full [&>div]:!p-0 [&>div]:!m-0 [&>div]:!box-border [&>div]:!shadow-none [&>div]:!rounded-none [&>div]:!overflow-hidden [&>iframe]:!w-full [&>iframe]:!h-full [&>iframe]:!object-contain [&+a]:hidden [&>a]:hidden"
                    dangerouslySetInnerHTML={{ __html: selectedProject.embed }}
                  />
                </div>
              ) : (
                <>
                  {/* Main Image */}
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={`${selectedProject.title} screenshot ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />

                  {/* Navigation Buttons (Show only if multiple images) */}
                  {selectedProject.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedProject.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right: Project Details */}
            <div className="w-full md:w-1/3 bg-white p-6 md:p-8 flex flex-col h-auto md:h-[80vh] overflow-y-auto">
              <div className="mb-6">
                <span className="px-3 py-1 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  {selectedProject.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-2">{selectedProject.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2 text-sm font-medium text-text-main hover:bg-[#0066cc] hover:text-white hover:border-[#0066cc] transition-all"
                    >
                      {link.type === 'github' && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>}
                      {link.type === 'url' && <span className="material-symbols-outlined text-[16px]">language</span>}
                      {link.type === 'playstore' && <span className="material-symbols-outlined text-[16px]">android</span>}
                      {link.type === 'appstore' && <span className="material-symbols-outlined text-[16px]">ios</span>}
                      {link.type === 'docs' && <span className="material-symbols-outlined text-[16px]">description</span>}
                      {link.type === 'youtube' && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                      {link.type === 'figma' && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8.333 0C6.035 0 4.167 1.865 4.167 4.167c0 2.302 1.868 4.166 4.167 4.166V0zm0 8.333H4.167C1.865 8.333 0 10.198 0 12.5s1.865 4.167 4.167 4.167h4.166V8.333zM12.5 16.667v-4.167H8.333v4.167c0 2.302 1.868 4.166 4.167 4.166s4.167-1.864 4.167-4.166c0-2.302-1.865-4.167-4.167-4.167zM16.667 8.333h-4.167V4.167C12.5 1.865 14.365 0 16.667 0s4.167 1.865 4.167 4.167c0 2.302-1.865 4.166-4.167 4.166z" /></svg>}
                      <span className="capitalize">{link.type}</span>
                    </a>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About Project</h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                  {selectedProject.description}
                </p>
              </div>

              <div className="mt-auto">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.techStack.map(tech => (
                    <div key={tech} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2">
                      <TechIcon name={tech} size={4} />
                      <span className="text-xs font-medium text-gray-600 capitalize">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;