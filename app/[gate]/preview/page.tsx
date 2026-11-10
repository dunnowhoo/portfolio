import type { Metadata } from 'next';
import Link from 'next/link';
import HomePage from '@/components/site/HomePage';
import { requireDojo } from '@/lib/dojo/dal';
import { getDraftContent } from '@/lib/site/cms';
import { publicContent } from '@/lib/site/content';

export const metadata: Metadata = { title: 'Pratinjau draf', robots: { index: false, follow: false, nocache: true } };

// Halaman utama dengan isi DRAF (belum terbit). Hanya untuk sesi Dōjō.
export default async function Preview({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const content = publicContent(await getDraftContent());
  return (
    <>
      <HomePage content={content} />
      <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[#1d1d1f]/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-[#ff9f0a]" aria-hidden="true" />
        Pratinjau draf
        <Link href={`/${gate}/cms`} className="font-semibold text-[#64d2ff] hover:underline">
          Kembali ke editor
        </Link>
      </div>
    </>
  );
}
