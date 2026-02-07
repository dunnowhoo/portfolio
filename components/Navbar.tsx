import React from 'react';
import { SectionId } from '../types';

interface NavbarProps {
  activeSection: SectionId;
  scrollTo: (id: SectionId) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, scrollTo }) => {
  // Updated nav items: Profile (was Home), Experience, Project (singular), Contact.
  // 'Tech' removed from navbar as requested.
  const navItems: { id: SectionId; icon: string; label: string }[] = [
    { id: 'home', icon: 'person', label: 'Profile' },
    { id: 'experience', icon: 'work_history', label: 'Experience' },
    { id: 'projects', icon: 'grid_view', label: 'Project' },
    { id: 'contact', icon: 'mail', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto transition-all duration-300">
      <div className="glass-nav rounded-full p-1.5 flex items-center gap-1.5 shadow-lg border border-white/40">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] group relative overflow-hidden
                ${isActive 
                  ? 'bg-[#0066cc]/10 px-4 py-2.5 text-[#0066cc]' 
                  : 'hover:bg-gray-100 px-2.5 py-2.5 text-text-secondary hover:text-text-main'
                }`}
            >
              <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-[#0066cc]' : 'text-text-secondary group-hover:text-text-main'}`}>
                {item.icon}
              </span>
              
              <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${isActive ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
                <span className="text-[13px] font-medium whitespace-nowrap pl-1">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;