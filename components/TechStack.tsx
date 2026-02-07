import React from 'react';
import { TECH_STACK } from '../constants';
import { TechIcon } from './TechIcon';

const TechStack = () => {
  return (
    <div className="glass-card bento-hover rounded-3xl p-6 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col h-full" id="tech">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="p-2 bg-white rounded-full text-black border border-gray-200 shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-[#0066cc]">code</span>
        </div>
        <h3 className="text-lg font-semibold text-text-main">Tech Arsenal</h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 content-start">
        {TECH_STACK.map((tech) => (
          <div 
            key={tech} 
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 border border-gray-100 hover:scale-110 hover:shadow-lg hover:bg-white transition-all duration-300 w-[64px] h-[64px] group cursor-pointer"
          >
            <TechIcon name={tech} size={6} />
            <span className="text-[8px] font-medium text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 text-[#0066cc]">
              {tech}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;