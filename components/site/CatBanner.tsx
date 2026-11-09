'use client';

import React, { useCallback, useState } from 'react';
import SecretLogin from './SecretLogin';
import CatScene from './cats/CatScene';
import { NARROW, WIDE } from './cats/layouts';

// Menggantikan kartu Spotify: tiga kucing seal point + kucing hitam yang ngoding.
// Kursor jadi titik laser yang dikejar kucing. Lonceng di kalung si jantan adalah
// pintu masuk Dōjō: klik 3x dalam 1,5 detik, atau tekan lama ±0,9 detik (HP).

const CatBanner = () => {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);
  const openLogin = useCallback(() => setOpen(true), []);
  const hideHint = useCallback(() => setHint(false), []);

  return (
    <div className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 relative overflow-hidden p-0 aspect-[520/440] md:aspect-auto md:h-[400px] lg:h-auto lg:min-h-[420px]">
      <p className="sr-only">
        Illustration: three seal point cats and a black coder cat playing in front of a code editor.
      </p>
      <CatScene layout={NARROW} className="md:hidden" onSecret={openLogin} onInteract={hideHint} />
      <CatScene layout={WIDE} className="hidden md:block" onSecret={openLogin} onInteract={hideHint} />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-4 top-4 md:right-5 md:top-5 inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm transition-opacity duration-500 ${hint ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
        <span className="hidden [@media(hover:hover)]:inline">Move your cursor. They chase it.</span>
        <span className="[@media(hover:hover)]:hidden">Tap anywhere. They chase it.</span>
      </div>
      <SecretLogin open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default CatBanner;
