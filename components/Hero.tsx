import React from 'react';
import { SectionId } from '../types';

interface HeroProps {
  scrollTo: (id: SectionId) => void;
}

const Hero: React.FC<HeroProps> = ({ scrollTo }) => {
  return (
    <>
      {/* Bio Card - Large (Span 2 rows vertical) */}
      <div className="glass-card bento-hover rounded-3xl p-6 md:p-10 md:col-span-4 lg:col-span-4 row-span-2 flex flex-col justify-center relative overflow-hidden group min-h-[400px] md:min-h-0" id="home">
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-gray-600 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Available for work
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4 text-text-main">
              Fauzan Putra <br />
              <span className="text-[#86868b]">Sanjaya.</span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg lg:text-xl max-w-lg leading-relaxed font-normal">
              Software Engineer specializing in <span className="text-text-main font-semibold">Mobile Development</span>, AI Integration, and scalable Fullstack Systems.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 mt-2">
            <a href="/assets/profile/CV_FauzanPutraSanjaya.pdf" download className="flex items-center gap-2 bg-[#0066cc] text-white hover:bg-[#0077ed] px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20">
              <span>Download Resume</span>
              <span className="material-symbols-outlined text-lg">download</span>
            </a>
            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-2 bg-white text-[#1d1d1f] hover:bg-gray-50 px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base border border-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <span>Let's Talk</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Image Card (Span 2 rows vertical) */}
      <div className="glass-card bento-hover rounded-3xl md:col-span-2 lg:col-span-2 row-span-2 relative overflow-hidden group min-h-[250px] md:min-h-0">
        <img alt="Fauzan Putra Sanjaya" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="/assets/profile/profile.png" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white font-semibold text-lg">Fauzan Sanjaya</p>
            <p className="text-gray-200 text-sm font-medium">Depok, Indonesia</p>
          </div>
        </div>
      </div>

      {/* Social Links - Compact (row-span-1) */}
      <div className="glass-card bento-hover rounded-3xl p-4 md:p-5 md:col-span-2 lg:col-span-2 row-span-1 flex items-center justify-between gap-2 min-h-[100px]">
        <a className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#1d1d1f] transition-colors group/icon w-full" href="https://github.com/dunnowhoo" target="_blank" rel="noreferrer">
          <div className="p-2 md:p-2.5 rounded-full bg-white border border-gray-100 group-hover/icon:scale-110 transition-transform shadow-sm">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">GitHub</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#0077b5] transition-colors group/icon w-full" href="https://www.linkedin.com/in/fauzansanjaya" target="_blank" rel="noreferrer">
          <div className="p-2 md:p-2.5 rounded-full bg-white border border-gray-100 group-hover/icon:scale-110 transition-transform shadow-sm">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path></svg>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">LinkedIn</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#14a800] transition-colors group/icon w-full" href="https://www.upwork.com/freelancers/fauzansanjaya" target="_blank" rel="noreferrer">
          <div className="p-2 md:p-2.5 rounded-full bg-white border border-gray-100 group-hover/icon:scale-110 transition-transform shadow-sm">
            <img src="/assets/upwork.png" className="w-5 h-5 object-contain" alt="Upwork" />
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">Upwork</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#E1306C] transition-colors group/icon w-full" href="https://www.instagram.com/fauzanputra.s/" target="_blank" rel="noreferrer">
          <div className="p-2 md:p-2.5 rounded-full bg-white border border-gray-100 group-hover/icon:scale-110 transition-transform shadow-sm">
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">Instagram</span>
        </a>
        <a className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#0066cc] transition-colors group/icon w-full" href="mailto:sanjaya@ristek.cs.ui.ac.id">
          <div className="p-2 md:p-2.5 rounded-full bg-white border border-gray-100 group-hover/icon:scale-110 transition-transform shadow-sm">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">Email</span>
        </a>
      </div>

      {/* Education - Compact (row-span-1) */}
      <div className="glass-card bento-hover rounded-3xl p-4 md:p-5 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col justify-center relative overflow-hidden min-h-[100px]">
        <div className="flex items-start gap-4 h-full">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-sm text-[#0066cc]">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div className="flex flex-col justify-center h-full">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Education</span>
            <h3 className="text-sm font-bold text-text-main leading-snug">Universitas Indonesia</h3>
            <p className="text-xs text-text-secondary mt-0.5">Computer Science</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;