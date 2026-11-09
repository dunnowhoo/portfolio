import Link from 'next/link';

export default function ComingSoon({ gate, title, milestone, points }: { gate: string; title: string; milestone: string; points: string[] }) {
  return (
    <div className="glass-card rounded-3xl p-8 md:p-10 max-w-2xl">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/60 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{milestone}</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-main font-jp">{title}</h1>
      <p className="mt-2 text-text-secondary">Bagian ini sedang dibangun. Yang akan ada di sini:</p>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm text-text-main">
            <span className="material-symbols-outlined text-[18px] text-[#0066cc]">check_circle</span>
            {p}
          </li>
        ))}
      </ul>
      <Link href={`/${gate}/beranda`} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>Kembali ke Beranda
      </Link>
    </div>
  );
}
