'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { guard } from '@/lib/dojo/guard';
import { SECTION_KEYS, SECTION_LABEL, type SectionKey } from '@/lib/site/content';
import { SECTION_SCHEMAS, issuesOf } from '@/lib/site/validate';
import * as cms from '@/lib/site/cms';

type Issue = { path: string; message: string };
export type CmsResult<T = unknown> = { ok: true; value: T } | { ok: false; error: string; issues?: Issue[] };

const Key = z.enum(SECTION_KEYS as [SectionKey, ...SectionKey[]]);

function parseKey(raw: unknown): SectionKey | null {
  const k = Key.safeParse(raw);
  return k.success ? k.data : null;
}

export async function saveSectionDraft(rawKey: string, raw: unknown): Promise<CmsResult<{ value: unknown; dirty: boolean }>> {
  await guard();
  const key = parseKey(rawKey);
  if (!key) return { ok: false, error: 'Bagian tidak dikenal.' };
  const parsed = SECTION_SCHEMAS[key].safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Ada isian yang belum valid.', issues: issuesOf(parsed.error) };
  const dirty = await cms.writeDraft(key, parsed.data);
  return { ok: true, value: { value: parsed.data, dirty } };
}

export async function publishSections(rawKeys: string[], rawNote?: string): Promise<CmsResult<SectionKey[]>> {
  await guard();
  const keys = z.array(Key).max(SECTION_KEYS.length).safeParse(rawKeys);
  if (!keys.success || keys.data.length === 0) return { ok: false, error: 'Tidak ada bagian yang dipilih.' };
  // Validasi ulang draf sebelum terbit: draf lama bisa dibuat sebelum aturan validasi berubah.
  const draft = await cms.getDraftContent();
  for (const k of keys.data) {
    const r = SECTION_SCHEMAS[k].safeParse(draft[k]);
    if (!r.success) return { ok: false, error: `${SECTION_LABEL[k]}: ${issuesOf(r.error)[0]?.message ?? 'belum valid'}`, issues: issuesOf(r.error) };
  }
  const note = (rawNote ?? '').trim().slice(0, 200) || null;
  const published = await cms.publishDrafts(keys.data, note);
  if (published.length) revalidatePath('/');
  return { ok: true, value: published };
}

export async function discardSectionDraft(rawKey: string): Promise<CmsResult> {
  await guard();
  const key = parseKey(rawKey);
  if (!key) return { ok: false, error: 'Bagian tidak dikenal.' };
  return { ok: true, value: await cms.discardDraft(key) };
}

export async function sectionRevisions(rawKey: string): Promise<CmsResult<Awaited<ReturnType<typeof cms.listRevisions>>>> {
  await guard();
  const key = parseKey(rawKey);
  if (!key) return { ok: false, error: 'Bagian tidak dikenal.' };
  return { ok: true, value: await cms.listRevisions(key) };
}

export async function restoreSectionRevision(rawKey: string, version: number): Promise<CmsResult> {
  await guard();
  const key = parseKey(rawKey);
  if (!key || !Number.isInteger(version) || version < 1) return { ok: false, error: 'Revisi tidak dikenal.' };
  const content = await cms.restoreRevisionToDraft(key, version);
  if (content === null) return { ok: false, error: 'Revisi tidak ditemukan.' };
  return { ok: true, value: content };
}
