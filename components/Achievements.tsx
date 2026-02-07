import React from 'react';
import { ACHIEVEMENTS } from '../constants';

const Achievements = () => {
  return (
    <div className="glass-card bento-hover rounded-3xl md:col-span-2 lg:col-span-2 row-span-1 p-5 flex flex-col overflow-hidden relative">
       
       <div className="flex items-center gap-2 mb-3 relative z-10">
           <div className="p-1.5 bg-white rounded-lg text-black border border-gray-200 shadow-sm">
               <span className="material-symbols-outlined text-[18px] text-[#0066cc]">emoji_events</span>
           </div>
           <h3 className="text-base font-bold text-text-main">Achievements</h3>
       </div>
       
       <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1 relative z-10">
          {ACHIEVEMENTS.map(ach => (
              <div key={ach.id} className="flex items-start gap-3 p-2 rounded-xl bg-white/40 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group shrink-0">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0 border border-gray-100 group-hover:text-[#0066cc] transition-colors">
                      <span className="material-symbols-outlined text-[14px]">{ach.icon}</span>
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-text-main leading-tight mb-0.5 group-hover:text-[#0066cc] transition-colors">{ach.title}</h4>
                      <p className="text-[10px] text-text-secondary font-medium leading-snug">{ach.description}</p>
                  </div>
              </div>
          ))}
       </div>
    </div>
  );
};

export default Achievements;