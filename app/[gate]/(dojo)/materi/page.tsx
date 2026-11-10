import { getDb } from '@/db/client';
import { materialRead } from '@/db/schema';
import MateriList from '@/components/dojo/materi/MateriList';
import { NODES } from '@/lib/dojo/curriculum';
import { loadMaterials } from '@/lib/dojo/content';
import { requireDojo } from '@/lib/dojo/dal';

export default async function MateriPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const [materials, reads] = await Promise.all([loadMaterials(), getDb().select().from(materialRead)]);
  const readSet = new Set(reads.map((r) => r.materialId));
  const usage = new Map<string, number>();
  for (const n of NODES.values()) if (n.material) usage.set(n.material.id, (usage.get(n.material.id) ?? 0) + 1);
  const items = materials
    .sort((a, b) => (a.track === b.track ? a.order - b.order : a.track === 'jp' ? -1 : 1))
    .map((m) => ({ id: m.id, track: m.track, title: m.title, estMinutes: m.estMinutes, tags: m.tags, read: readSet.has(m.id), nodes: usage.get(m.id) ?? 0 }));
  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Pustaka</p>
        <h1 className="text-3xl font-bold text-text-main md:text-4xl">Materi</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {items.length} materi orisinal Dōjō · {readSet.size} sudah dibaca
        </p>
      </div>
      <MateriList gate={gate} items={items} />
    </div>
  );
}
