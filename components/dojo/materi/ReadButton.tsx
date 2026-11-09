'use client';

import { useState, useTransition } from 'react';
import { markMaterialRead } from '@/app/actions/dojo';

export default function ReadButton({ id, read }: { id: string; read: boolean }) {
  const [done, setDone] = useState(read);
  const [pending, start] = useTransition();
  if (done) return <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf8ee] px-4 py-2 text-sm font-semibold text-[#1f7a3a]">Sudah dibaca ✓</span>;
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => { await markMaterialRead(id); setDone(true); })} className="rounded-full bg-[#0066cc] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0077ed] disabled:opacity-60">
      Tandai sudah dibaca
    </button>
  );
}
