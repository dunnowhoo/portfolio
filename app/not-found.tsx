import Link from 'next/link';

// 404 biasa. Dipakai juga untuk slug Dōjō yang salah, jadi sengaja tidak menyebut apa pun soal Dōjō.
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-10 text-center max-w-md w-full">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-3">Error 404</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-2">Page not found.</h1>
        <p className="text-text-secondary mb-8">The page you are looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#0066cc] text-white hover:bg-[#0077ed] px-6 py-3 rounded-full font-medium transition-all"
        >
          <span>Back to portfolio</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
