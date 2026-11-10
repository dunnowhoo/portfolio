'use client';

import { useEffect, useRef } from 'react';

// HTML materi (dari server) + tombol "Salin" di setiap blok kode.
export default function Prose({ html, className = '' }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const buttons: HTMLButtonElement[] = [];
    root.querySelectorAll('pre').forEach((pre) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Salin';
      btn.className = 'absolute right-2 top-2 rounded-full border border-[#e5e5ea] bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-[#6e6e73] hover:text-[#0066cc]';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? pre.textContent ?? '');
          btn.textContent = 'Tersalin';
          window.setTimeout(() => (btn.textContent = 'Salin'), 1400);
        } catch {
          btn.textContent = 'Gagal';
        }
      });
      pre.appendChild(btn);
      buttons.push(btn);
    });
    root.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noreferrer');
    });
    return () => buttons.forEach((b) => b.remove());
  }, [html]);

  return <div ref={ref} className={`dojo-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
