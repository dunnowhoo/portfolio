'use client';

import { useEffect, useRef, useState } from 'react';
import { discardSectionDraft, publishSections, restoreSectionRevision, saveSectionDraft, sectionRevisions } from '@/app/actions/cms';
import { LIST_SECTIONS, SECTION_KEYS, SECTION_LABEL, type SectionKey, type SiteContent } from '@/lib/site/content';
import type { SectionMeta } from '@/lib/site/cms';
import SectionForm, { ITEM_TITLE } from './SectionForm';
import { btnPrimary, btnSecondary, TextField } from './fields';

type Issue = { path: string; message: string };
type Revision = { version: number; note: string | null; createdAt: string };
type Sections = Record<SectionKey, unknown>;

const label = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary';
const fmt = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(iso));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const FIELD_LABEL: Record<string, string> = {
  firstName: 'Nama depan', lastName: 'Nama belakang', roles: 'Peran', tagline: 'Kalimat pembuka', availableText: 'Teks status', resumeUrl: 'CV',
  photoUrl: 'Foto profil', photoName: 'Nama di foto', location: 'Lokasi', kind: 'Jenis ikon', label: 'Label', url: 'URL', school: 'Kampus',
  degree: 'Jurusan', role: 'Peran', company: 'Perusahaan', period: 'Periode', description: 'Deskripsi', tech: 'Tech', link: 'Link', org: 'Organisasi',
  category: 'Kategori', title: 'Judul', icon: 'Ikon', key: 'Ikon', image: 'Gambar sampul', images: 'Galeri', embed: 'Embed', techStack: 'Tech stack',
  links: 'Link proyek', headingA: 'Judul baris 1', headingB: 'Judul baris 2', text: 'Teks', email: 'Email', scheduleUrl: 'Link jadwal call', ogImage: 'Gambar dibagikan',
  variant: 'Banner', name: 'Nama robot', greeting: 'Sapaan', suggestions: 'Contoh pertanyaan', notes: 'Catatan',
};

function describe(k: SectionKey, path: string, value: unknown): string {
  const segs = path.split('.').filter(Boolean);
  const parts: string[] = [];
  if (LIST_SECTIONS.includes(k) && segs.length && /^\d+$/.test(segs[0])) {
    const i = Number(segs.shift());
    const item = (value as unknown[])[i];
    const t = item ? ITEM_TITLE[k]?.(item as never) : '';
    parts.push(`#${i + 1}${t ? ` ${t}` : ''}`);
  }
  for (const s of segs) if (!/^\d+$/.test(s)) parts.push(FIELD_LABEL[s] ?? s);
  return parts.join(' · ') || SECTION_LABEL[k];
}

export default function CmsEditor({ gate, initial, meta: initialMeta }: { gate: string; initial: SiteContent; meta: Record<SectionKey, SectionMeta> }) {
  const [saved, setSaved] = useState<Sections>(initial);
  const [work, setWork] = useState<Sections>(initial);
  const [meta, setMeta] = useState(initialMeta);
  const [active, setActive] = useState<SectionKey>('profile');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string; link?: boolean } | null>(null);
  const [issues, setIssues] = useState<{ key: SectionKey; list: Issue[] } | null>(null);
  const [history, setHistory] = useState<{ key: SectionKey; rows: Revision[] } | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set());
  const [note, setNote] = useState('');

  const workRef = useRef(work);
  workRef.current = work;
  const savedRef = useRef(saved);
  savedRef.current = saved;

  const unsavedKeys = SECTION_KEYS.filter((k) => !same(work[k], saved[k]));
  const dirtyKeys = SECTION_KEYS.filter((k) => meta[k]?.dirty);
  const candidates = SECTION_KEYS.filter((k) => unsavedKeys.includes(k) || dirtyKeys.includes(k));

  /** Simpan draf beberapa bagian. false kalau ada yang gagal (bagian itu lalu dibuka). */
  async function saveKeys(keys: SectionKey[]): Promise<boolean> {
    setBusy('save');
    setMsg(null);
    try {
      for (const k of keys) {
        const sent = workRef.current[k];
        const r = await saveSectionDraft(k, sent);
        if (!r.ok) {
          setActive(k);
          setIssues({ key: k, list: r.issues ?? [] });
          setMsg({ tone: 'err', text: `${SECTION_LABEL[k]}: ${r.error}` });
          return false;
        }
        const { value, dirty } = r.value;
        setSaved((s) => ({ ...s, [k]: value }));
        // Isi dinormalisasi server (spasi dipangkas, link embed diubah); jangan timpa ketikan baru.
        setWork((w) => (same(w[k], sent) ? { ...w, [k]: value } : w));
        setMeta((m) => ({ ...m, [k]: { ...m[k], dirty, draftUpdatedAt: new Date().toISOString() } }));
        setIssues((cur) => (cur?.key === k ? null : cur));
      }
      setMsg({ tone: 'ok', text: keys.length === 1 ? `Draf ${SECTION_LABEL[keys[0]]} tersimpan.` : `${keys.length} draf tersimpan.` });
      return true;
    } catch {
      setMsg({ tone: 'err', text: 'Gagal menyimpan. Periksa koneksi lalu coba lagi.' });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    const keys = SECTION_KEYS.filter((k) => selected.has(k));
    const toSave = keys.filter((k) => !same(workRef.current[k], savedRef.current[k]));
    if (toSave.length && !(await saveKeys(toSave))) return;
    setBusy('publish');
    try {
      const r = await publishSections(keys, note);
      if (!r.ok) {
        setMsg({ tone: 'err', text: r.error });
        return;
      }
      setMeta((m) => {
        const next = { ...m };
        const now = new Date().toISOString();
        for (const k of r.value) next[k] = { ...next[k], dirty: false, version: next[k].version + 1, publishedAt: now };
        return next;
      });
      setPublishOpen(false);
      setNote('');
      setHistory(null);
      setMsg(r.value.length ? { tone: 'ok', text: `Terbit: ${r.value.map((k) => SECTION_LABEL[k]).join(', ')}. Halaman utama sudah diperbarui.`, link: true } : { tone: 'ok', text: 'Tidak ada perubahan untuk diterbitkan.' });
    } catch {
      setMsg({ tone: 'err', text: 'Gagal menerbitkan. Coba lagi.' });
    } finally {
      setBusy(null);
    }
  }

  async function discard(k: SectionKey) {
    setBusy('discard');
    try {
      const r = await discardSectionDraft(k);
      if (!r.ok) return setMsg({ tone: 'err', text: r.error });
      setSaved((s) => ({ ...s, [k]: r.value }));
      setWork((w) => ({ ...w, [k]: r.value }));
      setMeta((m) => ({ ...m, [k]: { ...m[k], dirty: false } }));
      setIssues(null);
      setMsg({ tone: 'ok', text: `Draf ${SECTION_LABEL[k]} dibuang; isinya kembali ke versi terbit.` });
    } finally {
      setBusy(null);
      setConfirmDiscard(false);
    }
  }

  async function toggleHistory(k: SectionKey) {
    if (history?.key === k) return setHistory(null);
    setBusy('history');
    try {
      const r = await sectionRevisions(k);
      if (r.ok) setHistory({ key: k, rows: r.value });
      else setMsg({ tone: 'err', text: r.error });
    } finally {
      setBusy(null);
    }
  }

  async function restore(k: SectionKey, version: number) {
    setBusy('restore');
    try {
      const r = await restoreSectionRevision(k, version);
      if (!r.ok) return setMsg({ tone: 'err', text: r.error });
      setSaved((s) => ({ ...s, [k]: r.value }));
      setWork((w) => ({ ...w, [k]: r.value }));
      setMeta((m) => ({ ...m, [k]: { ...m[k], dirty: version !== m[k].version } }));
      setIssues(null);
      setMsg({ tone: 'ok', text: `Versi ${version} dimuat ke draf ${SECTION_LABEL[k]}. Terbitkan untuk memakainya.` });
    } finally {
      setBusy(null);
    }
  }

  async function openPreview() {
    const w = window.open('', '_blank');
    const pending = SECTION_KEYS.filter((k) => !same(workRef.current[k], savedRef.current[k]));
    if (pending.length && !(await saveKeys(pending))) {
      w?.close();
      return;
    }
    if (w) w.location.href = `/${gate}/preview`;
  }

  // Cmd/Ctrl+S menyimpan; peringatan saat menutup tab dengan perubahan yang belum disimpan.
  const hasUnsaved = unsavedKeys.length > 0;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const pending = SECTION_KEYS.filter((k) => !same(workRef.current[k], savedRef.current[k]));
        if (pending.length) void saveKeys(pending);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // saveKeys membaca ref, jadi cukup dipasang sekali
  }, []);
  useEffect(() => {
    if (!hasUnsaved) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [hasUnsaved]);

  const m = meta[active];
  const activeIssues = issues?.key === active ? issues.list : [];
  const errorIdx = new Set(activeIssues.map((i) => i.path.split('.')[0]).filter((s) => /^\d+$/.test(s)).map(Number));
  const statusLine =
    candidates.length === 0
      ? 'Semua bagian sama dengan yang tampil di situs.'
      : `${candidates.length} bagian berbeda dari situs: ${candidates.map((k) => SECTION_LABEL[k]).join(', ')}.`;

  return (
    <div className="pb-16">
      <div className="glass-card mb-6 flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className={label} lang="ja">
            編集
          </p>
          <h1 className="text-3xl font-bold text-text-main md:text-4xl">Editor portfolio</h1>
          <p className="mt-1 text-sm text-text-secondary">{statusLine}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openPreview} disabled={!!busy} className={btnSecondary}>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              open_in_new
            </span>
            Pratinjau draf
          </button>
          <button
            type="button"
            disabled={!candidates.length || !!busy}
            onClick={() => {
              setSelected(new Set(candidates));
              setPublishOpen((o) => !o);
            }}
            className={btnPrimary}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              publish
            </span>
            Terbitkan{candidates.length ? ` (${candidates.length})` : ''}
          </button>
        </div>
      </div>

      {publishOpen && (
        <section className="glass-card-strong mb-6 rounded-3xl p-6" aria-label="Terbitkan perubahan">
          <h2 className="text-lg font-bold text-text-main">Terbitkan ke fauzansanjaya.dev</h2>
          <p className="text-sm text-text-secondary">Bagian yang dicentang langsung tampil di situs. Versi sebelumnya tetap tersimpan di riwayat.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {candidates.map((k) => (
              <li key={k}>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(k)}
                    onChange={(e) =>
                      setSelected((s) => {
                        const n = new Set(s);
                        if (e.target.checked) n.add(k);
                        else n.delete(k);
                        return n;
                      })
                    }
                    className="h-4 w-4 rounded border-black/20 text-[#0066cc]"
                  />
                  <span className="flex-1 text-sm font-semibold text-text-main">{SECTION_LABEL[k]}</span>
                  <span className="text-[12px] text-text-secondary">{unsavedKeys.includes(k) ? 'disimpan otomatis' : 'draf'}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 max-w-xl">
            <TextField label="Catatan versi (opsional)" value={note} onChange={setNote} placeholder="Mis. tambah proyek Westeros App" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={publish} disabled={!selected.size || !!busy} className={btnPrimary}>
              {busy === 'publish' ? 'Menerbitkan…' : busy === 'save' ? 'Menyimpan…' : `Terbitkan ${selected.size} bagian`}
            </button>
            <button type="button" onClick={() => setPublishOpen(false)} className={btnSecondary}>
              Batal
            </button>
          </div>
        </section>
      )}

      {msg && (
        <div role="status" className={`mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 text-sm ${msg.tone === 'ok' ? 'border-[#b7e4c4] bg-[#eaf8ee] text-[#1f7a3a]' : 'border-[#f3c1bd] bg-[#fdeceb] text-[#a8322a]'}`}>
          <span className="flex-1">{msg.text}</span>
          {msg.link && (
            <a href="/" target="_blank" rel="noreferrer" className="font-semibold underline">
              Lihat situs
            </a>
          )}
          <button type="button" onClick={() => setMsg(null)} aria-label="Tutup pesan" className="material-symbols-outlined text-[18px] opacity-60 hover:opacity-100">
            close
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Bagian halaman utama" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {SECTION_KEYS.map((k) => {
            const unsaved = unsavedKeys.includes(k);
            const dirty = meta[k]?.dirty;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setActive(k);
                  setHistory(null);
                  setConfirmDiscard(false);
                }}
                aria-current={active === k ? 'page' : undefined}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-full px-4 py-2 text-left text-sm font-medium transition-colors md:rounded-2xl ${
                  active === k ? 'bg-[#1d1d1f] text-white' : 'bg-white/70 text-text-main hover:bg-white'
                }`}
              >
                {SECTION_LABEL[k]}
                {(unsaved || dirty) && (
                  <span className={`h-2 w-2 rounded-full ${unsaved ? 'bg-[#0a84ff]' : 'bg-[#ff9f0a]'}`} title={unsaved ? 'Belum disimpan' : 'Draf belum terbit'} aria-label={unsaved ? 'belum disimpan' : 'draf belum terbit'} />
                )}
              </button>
            );
          })}
          <div className="hidden space-y-1 px-2 pt-3 text-[11px] text-text-secondary md:block">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0a84ff]" aria-hidden="true" /> Belum disimpan
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff9f0a]" aria-hidden="true" /> Draf belum terbit
            </p>
          </div>
        </nav>

        <section className="glass-card min-w-0 rounded-3xl p-5 md:p-6" aria-labelledby="cms-section-title">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="cms-section-title" className="text-xl font-bold text-text-main">
                {SECTION_LABEL[active]}
              </h2>
              {m && (
                <p className="text-[12px] text-text-secondary">
                  Versi terbit {m.version} · {fmt(m.publishedAt)}
                  {m.dirty ? ' · ada draf belum terbit' : ''}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleHistory(active)} disabled={busy === 'history'} aria-expanded={history?.key === active} className={btnSecondary}>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  history
                </span>
                Riwayat
              </button>
              {(m?.dirty || unsavedKeys.includes(active)) &&
                (confirmDiscard ? (
                  <span className="flex items-center gap-1">
                    <button type="button" onClick={() => discard(active)} disabled={!!busy} className="rounded-full bg-[#c4352b] px-4 py-2 text-[13px] font-semibold text-white">
                      Buang draf
                    </button>
                    <button type="button" onClick={() => setConfirmDiscard(false)} className={btnSecondary}>
                      Batal
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDiscard(true)} className={btnSecondary}>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      undo
                    </span>
                    Kembalikan ke versi terbit
                  </button>
                ))}
            </div>
          </div>

          {history?.key === active && (
            <div className="mb-5 rounded-2xl bg-white p-4">
              <p className={`${label} mb-2`}>Riwayat terbit</p>
              <ol className="divide-y divide-black/5">
                {history.rows.map((r) => (
                  <li key={r.version} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                    <span className="w-10 font-semibold tabular-nums text-text-main">v{r.version}</span>
                    <span className="text-text-secondary">{fmt(r.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate text-text-main">{r.note}</span>
                    {r.version === m?.version ? (
                      <span className="rounded-full bg-[#eaf8ee] px-2.5 py-0.5 text-[12px] font-semibold text-[#1f7a3a]">Tampil di situs</span>
                    ) : (
                      <button type="button" onClick={() => restore(active, r.version)} disabled={!!busy} className="text-[13px] font-semibold text-[#0066cc] hover:underline">
                        Muat ke draf
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeIssues.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#f3c1bd] bg-[#fdeceb] p-4 text-sm text-[#a8322a]" role="alert">
              <p className="font-semibold">Perbaiki dulu sebelum menyimpan:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {activeIssues.map((i, n) => (
                  <li key={n}>
                    <span className="font-medium">{describe(active, i.path, work[active])}</span>: {i.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SectionForm key={active} k={active} value={work[active]} onChange={(v) => setWork((w) => ({ ...w, [active]: v }))} errorIdx={errorIdx} />
        </section>
      </div>

      {hasUnsaved && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-[#1d1d1f]/90 py-2 pl-5 pr-2 text-sm text-white shadow-xl backdrop-blur-md md:bottom-6">
          <span className="truncate">{unsavedKeys.length === 1 ? `${SECTION_LABEL[unsavedKeys[0]]} belum disimpan` : `${unsavedKeys.length} bagian belum disimpan`}</span>
          <button type="button" onClick={() => saveKeys(unsavedKeys)} disabled={!!busy} className="shrink-0 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-[#1d1d1f] disabled:opacity-60">
            {busy === 'save' ? 'Menyimpan…' : 'Simpan draf'}
          </button>
        </div>
      )}
    </div>
  );
}
