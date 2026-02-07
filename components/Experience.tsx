import React from 'react';
import { EXPERIENCES } from '../constants';

const Experience = () => {
  return (
    <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-3 relative h-full" id="experience">

      <div className="h-full flex flex-col gap-6 relative z-10 glass-card-strong rounded-3xl p-0 overflow-hidden">
        {/* Header - Fixed */}
        <div className="p-6 pb-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl text-black border border-gray-100 shadow-sm">
              <span className="material-symbols-outlined text-[20px] text-[#0066cc]">work_history</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">Experience</h2>
          </div>
          <p className="text-text-secondary text-xs ml-1">My professional journey and career milestones.</p>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-6 pt-2 space-y-6 flex-1 custom-scrollbar">
          {EXPERIENCES.map((exp) => (
            <div key={exp.id} className="relative pl-6 group">
              {/* Timeline Line */}
              <div className="absolute left-[9px] top-7 bottom-[-24px] w-[2px] bg-gray-200 group-last:bottom-auto group-last:h-full"></div>

              {/* Timeline Dot */}
              <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white bg-[#0066cc] shadow-sm z-10"></div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                <h3 className="text-sm font-bold text-text-main">{exp.role}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-50 rounded-full text-gray-500 border border-gray-100 w-fit shadow-sm">{exp.period}</span>
              </div>

              <div className="flex items-center gap-2 mb-2 text-xs text-text-secondary font-medium">
                <span className="material-symbols-outlined text-[14px]">business</span>
                {exp.link ? (
                  <a href={exp.link} target="_blank" rel="noreferrer" className="hover:text-[#0066cc] hover:underline transition-colors flex items-center gap-1">
                    {exp.company}
                    <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
                ) : (
                  <span>{exp.company}</span>
                )}
              </div>

              <p className="text-gray-600 text-xs leading-relaxed mb-3 bg-white/50 p-3 rounded-lg border border-gray-100 shadow-sm">
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {exp.tech.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white text-gray-500 text-[10px] font-medium border border-gray-100 shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fade at bottom - match liquid card bg */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Experience;