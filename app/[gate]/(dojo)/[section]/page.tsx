import { notFound } from 'next/navigation';
import ComingSoon from '@/components/dojo/ComingSoon';
import { requireDojo } from '@/lib/dojo/dal';

const SECTIONS: Record<string, { title: string; milestone: string; points: string[] }> = {
  cms: { title: 'Editor portfolio', milestone: 'M4', points: ['Edit & tambah konten halaman utama', 'Upload gambar ke Neon Object Storage', 'Preview, terbitkan, riwayat versi'] },
};

export default async function SectionPage({ params }: { params: Promise<{ gate: string; section: string }> }) {
  const { gate, section } = await params;
  await requireDojo(gate);
  const s = SECTIONS[section];
  if (!s) notFound();
  return <ComingSoon gate={gate} title={s.title} milestone={`Dibangun di ${s.milestone}`} points={s.points} />;
}
