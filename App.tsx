import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Organization from './components/Organization';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Spotify from './components/Spotify';
import { SectionId } from './types';

const App = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('home');

  useEffect(() => {
    const handleScroll = () => {
      // Reordered and filtered to match Navbar items: Profile (home), Experience, Project, Contact
      const sections: SectionId[] = ['home', 'experience', 'projects', 'contact'];

      // Use a smaller offset for triggering "active" state to make it feel more responsive
      const scrollPosition = window.scrollY + 250;

      let currentSection: SectionId = 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          // Check if scrollPosition is within the element's vertical bounds
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = section;
            break;
          }
        }
      }

      // Edge case: if we are very close to bottom, force contact
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
        currentSection = 'contact';
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: SectionId) => {
    const el = document.getElementById(id);
    if (el) {
      // Offset for sticky navbar visibility
      const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Clean White Background - No ambient blobs */}

      <Navbar activeSection={activeSection} scrollTo={scrollTo} />

      <main className="relative z-10 container mx-auto px-4 md:px-6 pt-28 pb-20 max-w-7xl overflow-x-hidden">
        {/* Compact row height (120px) and dense flow for Tetris-like packing */}
        {/* Mobile: 1 col, Tablet: 4 cols, Desktop: 6 cols */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 auto-rows-[minmax(auto,auto)] md:auto-rows-[minmax(120px,auto)] grid-flow-dense">
          <Hero scrollTo={scrollTo} />

          {/* Left Column Area */}
          <Experience />

          {/* Right Column Stack */}
          <TechStack />
          <Organization />

          {/* Bottom Row Area */}
          <Spotify />
          <Achievements />

          <Projects />
          <Contact />
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs font-medium tracking-wide relative z-10">
        <p>© 2026 Fauzan Putra Sanjaya. All rights reserved.</p>
      </footer>
    </>
  );
};

export default App;