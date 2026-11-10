'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Experience from './Experience';
import Projects from './Projects';
import TechStack from './TechStack';
import Organization from './Organization';
import Achievements from './Achievements';
import Contact from './Contact';
import CatBanner from './CatBanner';
import RobotBanner from './RobotBanner';
import { SectionId } from '@/lib/site/types';
import type { SiteContent } from '@/lib/site/content';

const App = ({ content }: { content: SiteContent }) => {
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
          <Hero scrollTo={scrollTo} profile={content.profile} socials={content.socials} education={content.education} />

          {/* Left Column Area */}
          <Experience items={content.experience} />

          {/* Right Column Stack */}
          <TechStack items={content.techstack} />
          <Organization items={content.organization} />

          {/* Bottom Row Area */}
          {content.assistant.variant === 'cats' ? <CatBanner /> : <RobotBanner content={content} />}
          <Achievements items={content.achievements} />

          <Projects items={content.projects} />
          <Contact contact={content.contact} />
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs font-medium tracking-wide relative z-10">
        <p>© 2026 Fauzan Putra Sanjaya. All rights reserved.</p>
      </footer>
    </>
  );
};

export default App;