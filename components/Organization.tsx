import React from 'react';
import { ORGANIZATIONS } from '../constants';

const Organization = () => {
  return (
    <div className="glass-card bento-hover rounded-3xl p-6 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10 shrink-0">
        <div className="p-2 bg-white rounded-xl text-black border border-gray-200 shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-[#0066cc]">groups</span>
        </div>
        <h3 className="text-lg font-semibold text-text-main">Organization</h3>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 relative z-10 pr-1 space-y-4">
        {ORGANIZATIONS.map((org) => (
          <div key={org.id} className="relative pl-3 border-l-2 border-gray-100 hover:border-[#0066cc] transition-colors group">
            <div className="mb-1">
              <h4 className="text-sm font-bold text-text-main leading-tight group-hover:text-[#0066cc] transition-colors">{org.role}</h4>
              <div className="flex justify-between items-baseline mt-0.5">
                {org.link ? (
                  <a href={org.link} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-700 hover:text-[#0066cc] hover:underline transition-colors flex items-center gap-1">
                    {org.org}
                    <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-xs font-medium text-gray-700">{org.org}</span>
                )}
                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">{org.period}</span>
              </div>
            </div>
            {org.description && (
              <p className="text-[11px] text-text-secondary leading-snug mt-1.5">
                {org.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organization;