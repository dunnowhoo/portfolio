import { notFound } from 'next/navigation';
import ComingSoon from '@/components/dojo/ComingSoon';
import { requireDojo } from '@/lib/dojo/dal';

const SECTIONS: Record<string, { title: string; milestone: string; points: string[] }> = {
  'hari-ini': { title: 'Hari ini · 日替わり', milestone: 'M3', points: ['Daily shuffle kedua jalur', 'Sprint kana/kanji dan Tebak Pola', 'Check-in Anki & Duolingo'] },
  review: { title: 'Review SRS', milestone: 'M3', points: ['Soal DSA dan kartu 日本語 yang jatuh tempo'] },
  target: { title: 'Target', milestone: 'M3', points: ['Target mingguan & bulanan per fase', 'Refleksi mingguan'] },
  kalender: { title: 'Kalender & JLPT', milestone: 'M3', points: ['Countdown MISUMI & JLPT', 'Sesi JLPT yang bisa diedit + pengingat war', 'Ekspor kalender .ics'] },
  profil: { title: 'Profil', milestone: 'M3', points: ['Level & sabuk, heatmap, lencana, rak Daruma'] },
  cms: { title: 'Editor portfolio', milestone: 'M4', points: ['Edit & tambah konten halaman utama', 'Upload gambar ke Neon Object Storage', 'Preview, terbitkan, riwayat versi'] },
  pengaturan: { title: 'Pengaturan', milestone: 'M3', points: ['Zona waktu, jam pergantian hari, daily goal'] },
};

export default async function SectionPage({ params }: { params: Promise<{ gate: string; section: string }> }) {
  const { gate, section } = await params;
  await requireDojo(gate);
  const s = SECTIONS[section];
  if (!s) notFound();
  return <ComingSoon gate={gate} title={s.title} milestone={`Dibangun di ${s.milestone}`} points={s.points} />;
}
