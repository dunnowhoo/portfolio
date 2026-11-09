import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/db/client';
import { materialRead } from '@/db/schema';
import ReadButton from '@/components/dojo/materi/ReadButton';
import Prose from '@/components/dojo/Prose';
import { NODES } from '@/lib/dojo/curriculum';
import { getMaterial } from '@/lib/dojo/content';
import { requireDojo } from '@/lib/dojo/dal';
import { mdToHtml, tocFromHtml } from '@/lib/dojo/markdown';

export default async function MateriReader({ params }: { params: Promise<{ gate: string; id: string }> }) {
  const { gate, id } = await params;
  await requireDojo(gate);
  const m = await getMaterial(id);
  if (!m) notFound();
  const [html, [read]] = await Promise.all([mdToHtml(m.body), getDb().select().from(materialRead).where(eq(materialRead.materialId, id))]);
  const toc = tocFromHtml(html);
  const nodes = [...NODES.values()].filter((n) => n.material?.id === id);
  const seg = m.track === 'jp' ? 'nihongo' : 'dsa';
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <article className="glass-card min-w-0 rounded-3xl p-6 md:p-10">
        <Link href={`/${gate}/materi`} className="text-[13px] font-medium text-[#0066cc]">
          ← Semua materi
        </Link>
        <div className="mx-auto mt-4 max-w-[70ch]">
          <Prose html={html} />
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/5 pt-6">
            <ReadButton id={id} read={!!read} />
            <span className="text-[13px] text-text-secondary">±{m.estMinutes} menit</span>
          </div>
        </div>
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4">
          {toc.length > 0 && (
            <nav className="glass-card max-h-[60vh] overflow-y-auto rounded-3xl p-5" aria-label="Daftar isi">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Daftar isi</p>
              <ul className="space-y-1.5">
                {toc.map((t) => (
                  <li key={t.id} className={t.depth === 3 ? 'pl-3' : ''}>
                    <a href={`#${t.id}`} className="text-[13px] leading-snug text-text-main hover:text-[#0066cc]">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {nodes.length > 0 && (
            <div className="glass-card rounded-3xl p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Dipakai di jalur</p>
              <ul className="space-y-1.5">
                {nodes.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <Link href={`/${gate}/${seg}`} className="text-[13px] text-[#0066cc] hover:underline">
                      Unit {n.unitId} · {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
