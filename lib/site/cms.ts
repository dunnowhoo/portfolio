import 'server-only';
import { cache } from 'react';
import { and, desc, eq, lte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { siteRevision, siteSection } from '@/db/schema';
import { DEFAULT_CONTENT, SECTION_KEYS, type SectionKey, type SiteContent } from './content';

// CMS halaman utama: satu baris site_section per bagian (draft + published), riwayat di site_revision.
// Halaman publik hanya membaca `published`; editor menulis `draft` lalu menerbitkannya.

const KEEP_REVISIONS = 50;
type Row = typeof siteSection.$inferSelect;
const isKey = (k: string): k is SectionKey => (SECTION_KEYS as string[]).includes(k);

function mergeSection<K extends SectionKey>(key: K, value: unknown): SiteContent[K] {
  const base = DEFAULT_CONTENT[key];
  if (Array.isArray(base)) return (Array.isArray(value) ? value : base) as SiteContent[K];
  // Objek: field baru yang belum ada di DB tetap terisi nilai bawaan
  return { ...base, ...(value && typeof value === 'object' ? value : {}) } as SiteContent[K];
}

function merge(rows: Row[], field: 'draft' | 'published'): SiteContent {
  const out: Record<string, unknown> = { ...DEFAULT_CONTENT };
  for (const r of rows) if (isKey(r.key)) out[r.key] = mergeSection(r.key, r[field]);
  return out as SiteContent;
}

/** Konten terbit untuk halaman publik. Saat build tanpa DB → konten bawaan; saat runtime error dilempar
 *  supaya ISR tetap menyajikan versi terakhir yang berhasil, bukan konten lama. */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  try {
    return merge(await getDb().select().from(siteSection), 'published');
  } catch (e) {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      console.warn('[cms] DB tidak bisa diakses, memakai konten bawaan');
      return DEFAULT_CONTENT;
    }
    throw e;
  }
});

export async function getDraftContent(): Promise<SiteContent> {
  return merge(await getDb().select().from(siteSection), 'draft');
}

/** Mengisi bagian yang belum ada di DB dari konten bawaan (versi 1). */
export async function ensureSiteSeeded(): Promise<void> {
  const db = getDb();
  const have = new Set((await db.select({ key: siteSection.key }).from(siteSection)).map((r) => r.key));
  const missing = SECTION_KEYS.filter((k) => !have.has(k));
  if (!missing.length) return;
  await db
    .insert(siteSection)
    .values(missing.map((k) => ({ key: k, draft: DEFAULT_CONTENT[k], published: DEFAULT_CONTENT[k], version: 1 })))
    .onConflictDoNothing();
  await db
    .insert(siteRevision)
    .values(missing.map((k) => ({ key: k, version: 1, content: DEFAULT_CONTENT[k], note: 'Awal, dari situs lama' })))
    .onConflictDoNothing();
}

export type SectionMeta = { version: number; dirty: boolean; draftUpdatedAt: string; publishedAt: string };

export async function getEditorState(): Promise<{ draft: SiteContent; meta: Record<SectionKey, SectionMeta> }> {
  await ensureSiteSeeded();
  const rows = await getDb()
    .select({ row: siteSection, same: sql<boolean>`${siteSection.draft} = ${siteSection.published}` })
    .from(siteSection);
  const meta = {} as Record<SectionKey, SectionMeta>;
  for (const { row: r, same } of rows) {
    if (!isKey(r.key)) continue;
    meta[r.key] = {
      version: r.version,
      dirty: !same,
      draftUpdatedAt: r.draftUpdatedAt.toISOString(),
      publishedAt: r.publishedAt.toISOString(),
    };
  }
  return { draft: merge(rows.map((x) => x.row), 'draft'), meta };
}

/** Menyimpan draf; hasilnya true kalau draf sekarang berbeda dari versi terbit. */
export async function writeDraft(key: SectionKey, value: unknown): Promise<boolean> {
  await ensureSiteSeeded();
  const [r] = await getDb()
    .update(siteSection)
    .set({ draft: value, draftUpdatedAt: new Date() })
    .where(eq(siteSection.key, key))
    .returning({ same: sql<boolean>`${siteSection.draft} = ${siteSection.published}` });
  return !r?.same;
}

/** Menerbitkan draf yang berubah. Mengembalikan bagian yang benar-benar diterbitkan. */
export async function publishDrafts(keys: SectionKey[], note: string | null): Promise<SectionKey[]> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const done: SectionKey[] = [];
    for (const key of keys) {
      const [x] = await tx
        .select({ row: siteSection, same: sql<boolean>`${siteSection.draft} = ${siteSection.published}` })
        .from(siteSection)
        .where(eq(siteSection.key, key))
        .for('update');
      if (!x || x.same) continue;
      const row = x.row;
      const version = row.version + 1;
      await tx.update(siteSection).set({ published: row.draft, version, publishedAt: new Date() }).where(eq(siteSection.key, key));
      await tx.insert(siteRevision).values({ key, version, content: row.draft, note });
      await tx.delete(siteRevision).where(and(eq(siteRevision.key, key), lte(siteRevision.version, version - KEEP_REVISIONS)));
      done.push(key);
    }
    return done;
  });
}

/** Mengembalikan draf ke versi terbit; hasilnya isi bagian setelah dibuang. */
export async function discardDraft(key: SectionKey): Promise<unknown> {
  const [row] = await getDb().select().from(siteSection).where(eq(siteSection.key, key));
  if (!row) return DEFAULT_CONTENT[key];
  await getDb().update(siteSection).set({ draft: row.published, draftUpdatedAt: new Date() }).where(eq(siteSection.key, key));
  return mergeSection(key, row.published);
}

export async function listRevisions(key: SectionKey) {
  const rows = await getDb()
    .select({ version: siteRevision.version, note: siteRevision.note, createdAt: siteRevision.createdAt })
    .from(siteRevision)
    .where(eq(siteRevision.key, key))
    .orderBy(desc(siteRevision.version))
    .limit(KEEP_REVISIONS);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Memuat isi revisi lama ke draf (belum terbit sampai diterbitkan lagi). */
export async function restoreRevisionToDraft(key: SectionKey, version: number): Promise<unknown | null> {
  const [rev] = await getDb()
    .select()
    .from(siteRevision)
    .where(and(eq(siteRevision.key, key), eq(siteRevision.version, version)));
  if (!rev) return null;
  await writeDraft(key, rev.content);
  return rev.content;
}
