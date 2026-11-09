'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { addResource, completeNode, getNodeDetail, logAttempt, removeResource, saveNote, startNode, type NodeDetail } from '@/app/actions/dojo';
import { emitAward } from '@/components/dojo/AwardToaster';
import Prose from '@/components/dojo/Prose';
import { NODE_ICON, NODE_LABEL, type PathNode } from '@/lib/dojo/curriculum/types';
import { RATING_LABEL, type Rating } from '@/lib/dojo/engine/srs';

type Tab = 'materi' | 'video' | 'latihan' | 'sumber' | 'catatan';
const TAB_LABEL: Record<Tab, string> = { materi: 'Materi', video: 'Video', latihan: 'Latihan', sumber: 'Sumber', catatan: 'Catatan' };
export const TRACK_COLOR = { jp: '#e8453c', dsa: '#0066cc' } as const;

const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const fmtDate = (d?: string | null) => (d ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${d}T00:00:00`)) : '');
const pad2 = (n: number) => String(n).padStart(2, '0');

function problemLinks(n: PathNode) {
  const p = n.problem!;
  const links = [{ label: 'LeetCode', url: `https://leetcode.com/problems/${p.slug}/` }];
  if (p.lintcode) links.unshift({ label: `LintCode ${p.lintcode} (gratis)`, url: `https://www.lintcode.com/problem/${p.lintcode}/` });
  links.push({ label: 'NeetCode', url: 'https://neetcode.io/practice' }, { label: 'Video solusi', url: ytSearch(`neetcode ${p.title}`) });
  return links;
}

export default function NodeSheet({ node, onClose, onChanged }: { node: PathNode; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('materi');
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [minutes, setMinutes] = useState<string>('');
  const [rating, setRating] = useState<Rating | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [solutionUrl, setSolutionUrl] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteState, setNoteState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [resUrl, setResUrl] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [showPattern, setShowPattern] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [pending, startTransition] = useTransition();
  const noteTimer = useRef<number | null>(null);
  const started = useRef(false);
  const color = TRACK_COLOR[node.track];

  const reload = async () => {
    try {
      const d = await getNodeDetail(node.id);
      setDetail(d);
      setNoteText((t) => t || d.note);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Gagal memuat node.');
    }
  };

  useEffect(() => {
    void reload();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const tabs: Tab[] = [];
  if (detail?.html || detail?.kanji.length || (detail?.grammar.length && !detail.html)) tabs.push('materi');
  if (node.type === 'video' || detail?.resources.some((r) => r.youtubeId)) tabs.push('video');
  if (node.problem || node.quiz || node.checklist) tabs.push('latihan');
  tabs.push('sumber', 'catatan');
  const activeTab = tabs.includes(tab) ? tab : tabs[0];

  const status = detail?.status ?? 'available';
  const locked = status === 'locked';
  const completed = status === 'completed' || status === 'skipped';
  const skipTest = locked && node.type === 'checkpoint';
  const needsScore = !!node.passPct;
  const ytIds = (detail?.resources ?? []).filter((r) => r.youtubeId);

  const toggleTimer = () => {
    if (!started.current) {
      started.current = true;
      void startNode(node.id);
    }
    setRunning((r) => !r);
  };

  const onNoteChange = (v: string) => {
    setNoteText(v);
    setNoteState('saving');
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(async () => {
      const r = await saveNote({ nodeId: node.id, body: v });
      setNoteState(r.ok ? 'saved' : 'idle');
    }, 700);
  };

  const effectiveMinutes = () => Math.max(Number(minutes) || 0, Math.round(secs / 60));

  const submit = () => {
    if (!rating) return setError('Pilih dulu seberapa yakin kamu.');
    if (needsScore && score === '') return setError('Isi skor (%) dulu.');
    setError(null);
    startTransition(async () => {
      const r = await completeNode({
        nodeId: node.id,
        rating,
        minutes: effectiveMinutes(),
        usedHint: node.problem ? usedHint : undefined,
        solutionUrl: solutionUrl || undefined,
        score: needsScore ? Number(score) : undefined,
        skipTest: skipTest || undefined,
      });
      if (!r.ok) return setError(r.error);
      setRunning(false);
      emitAward(r.result);
      setDoneMsg(r.skipped ? `Lulus tes lompat. ${r.skipped} node ditandai dilewati.` : 'お疲れさま！ Node selesai.');
      await reload();
      onChanged();
    });
  };

  const submitAttempt = () =>
    startTransition(async () => {
      const r = await logAttempt({ nodeId: node.id, minutes: effectiveMinutes(), usedHint, solutionUrl: solutionUrl || undefined });
      setError(r.ok ? null : 'Gagal mencatat percobaan.');
      if (r.ok) {
        setDoneMsg('Percobaan dicatat. Kalau sudah lulus semua test, tandai selesai.');
        await reload();
      }
    });

  const addRes = () =>
    startTransition(async () => {
      const r = await addResource({ nodeId: node.id, url: resUrl, title: resTitle });
      if (!r.ok) return setError(r.error);
      setResUrl('');
      setResTitle('');
      setError(null);
      await reload();
    });

  const body = (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`${NODE_LABEL[node.type]}: ${node.title}`}>
      <button type="button" aria-label="Tutup panel" className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex h-[92vh] flex-col overflow-hidden rounded-t-3xl bg-[#f8f8fa] shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[560px] md:rounded-none md:rounded-l-3xl">
        {/* header */}
        <div className="border-b border-black/5 bg-white/80 px-5 pb-3 pt-4 backdrop-blur">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-black/10 md:hidden" aria-hidden="true" />
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: `${color}14` }} aria-hidden="true">
              {NODE_ICON[node.type]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color }}>
                {NODE_LABEL[node.type]} · Unit {node.unitId}
              </p>
              <h2 className="text-lg font-bold leading-snug text-text-main">{node.title}</h2>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                {node.minutes ? `${node.minutes} mnt · ` : ''}+{node.xp} XP{node.problem ? ' (+5 tanpa hint)' : ''}
                {node.targetDate ? ` · target ${fmtDate(node.targetDate)}` : ''}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-text-secondary hover:bg-black/5" aria-label="Tutup">
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeTab === t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${activeTab === t ? 'bg-[#0066cc]/10 text-[#0066cc]' : 'text-text-secondary hover:bg-black/5'}`}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* isi */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loadError && <p className="rounded-2xl bg-[#fdecea] p-4 text-sm text-[#a3271f]">{loadError}</p>}
          {!detail && !loadError && <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-black/5" style={{ width: `${90 - i * 18}%` }} />)}</div>}
          {detail && (
            <>
              {node.subtitle && <p className="mb-4 text-sm text-text-secondary">{node.subtitle}</p>}
              {activeTab === 'materi' && (
                <>
                  {detail.kanji.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {detail.kanji.map((k) => (
                        <div key={k.kanji} className="rounded-2xl border border-black/5 bg-white p-3">
                          <p className="font-jp text-3xl font-bold text-text-main" lang="ja">{k.kanji}</p>
                          <p className="mt-1 text-sm font-semibold text-text-main">{k.meaning}</p>
                          <p className="font-jp text-[12px] text-text-secondary" lang="ja">ON {k.on || '—'} · kun {k.kun || '—'}</p>
                          {k.examples && <p className="mt-1 font-jp text-[12px] text-[#3a3a3c]" lang="ja">{k.examples}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.html && <Prose html={detail.html} />}
                </>
              )}
              {activeTab === 'video' && (
                <div className="space-y-4">
                  {ytIds.map((r) => (
                    <div key={r.id}>
                      <iframe
                        className="aspect-video w-full rounded-2xl bg-black"
                        src={`https://www.youtube-nocookie.com/embed/${r.youtubeId}`}
                        title={r.title}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <p className="mt-1.5 text-[13px] text-text-secondary">{r.title}</p>
                    </div>
                  ))}
                  {!ytIds.length && node.video && (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-sm text-text-secondary">
                      <p className="font-medium text-text-main">Belum ada video yang dipilih.</p>
                      <p className="mt-1">Cari videonya, lalu tempel link YouTube di tab Sumber supaya bisa diputar langsung di sini.</p>
                      <a href={ytSearch(node.video.query)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0077ed]">
                        Cari di YouTube <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    </div>
                  )}
                  {detail.grammar.length > 0 && (
                    <div className="rounded-2xl bg-white p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Cari video per poin</p>
                      <ul className="space-y-1.5">
                        {detail.grammar.map((g) => (
                          <li key={g.id}>
                            <a href={ytSearch(`${g.pattern.split('/')[0]} Japanese grammar`)} target="_blank" rel="noreferrer" className="font-jp text-sm text-[#0066cc] hover:underline" lang="ja">
                              {g.id.split('-')[1]} · {g.pattern}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'latihan' && (
                <div className="space-y-4">
                  {node.problem && (
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${node.problem.level === 'E' ? 'bg-[#eaf8ee] text-[#1f7a3a]' : node.problem.level === 'M' ? 'bg-[#fff4e0] text-[#9a5b00]' : 'bg-[#fdecea] text-[#a3271f]'}`}>
                          {node.problem.level === 'E' ? 'Easy' : node.problem.level === 'M' ? 'Medium' : 'Hard'}
                        </span>
                        <span className="text-[13px] text-text-secondary">LeetCode #{node.problem.lc}</span>
                      </div>
                      <p className="mt-2 text-[15px] text-text-main">{node.problem.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {problemLinks(node).map((l) => (
                          <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-text-main hover:border-[#0066cc] hover:text-[#0066cc]">
                            {l.label} <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          </a>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <button type="button" onClick={() => setShowPattern((v) => !v)} className="rounded-xl bg-[#f2f2f7] px-3 py-2 text-left text-[13px] text-text-main">
                          <span className="text-text-secondary">Pola: </span>
                          {showPattern ? <strong>{node.problem.pattern}</strong> : 'ketuk untuk melihat'}
                        </button>
                        <button type="button" onClick={() => setShowIdea((v) => !v)} className="rounded-xl bg-[#f2f2f7] px-3 py-2 text-left text-[13px] text-text-main">
                          <span className="text-text-secondary">Ide kunci: </span>
                          {showIdea ? node.problem.idea : 'ketuk untuk melihat'}
                        </button>
                      </div>
                      {detail.problem && (
                        <p className="mt-3 text-[13px] text-text-secondary">
                          Percobaan {detail.problem.attempts}× {detail.problem.bestMinutes ? `· terbaik ${detail.problem.bestMinutes} mnt` : ''} {detail.problem.usedHint ? '· pernah pakai hint' : ''}
                        </p>
                      )}
                    </div>
                  )}
                  {node.quiz && (
                    <div className="rounded-2xl bg-white p-4 text-sm text-text-secondary">
                      <p className="font-medium text-text-main">Kuis bawaan</p>
                      <p className="mt-1">Mainkan kuisnya dari halaman Hari ini, atau kerjakan latihannya sendiri lalu isi skor dan tandai selesai di bawah.</p>
                    </div>
                  )}
                  {node.checklist && (
                    <ul className="space-y-2 rounded-2xl bg-white p-4">
                      {node.checklist.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-text-main">
                          <span className="material-symbols-outlined text-[18px] text-text-secondary">check_box_outline_blank</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeTab === 'sumber' && (
                <div className="space-y-4">
                  {node.irodori && (
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Irodori</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a href={node.irodori.pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#0066cc] px-3.5 py-1.5 text-[13px] font-semibold text-white">
                          PDF pelajaran <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        </a>
                        {node.irodori.audio && (
                          <a href={node.irodori.audio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3.5 py-1.5 text-[13px] font-medium text-text-main">
                            Audio <span className="material-symbols-outlined text-[15px]">headphones</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {(node.links?.length || node.video) && (
                    <ul className="space-y-1 rounded-2xl bg-white p-4">
                      {node.video && (
                        <li>
                          <a href={ytSearch(node.video.query)} target="_blank" rel="noreferrer" className="text-sm text-[#0066cc] hover:underline">
                            Cari di YouTube: {node.video.query}
                          </a>
                        </li>
                      )}
                      {node.links?.map((l) => (
                        <li key={l.url}>
                          <a href={l.url} target="_blank" rel="noreferrer" className="text-sm text-[#0066cc] hover:underline">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Sumber tambahanmu</p>
                    {detail.resources.length === 0 && <p className="mt-2 text-sm text-text-secondary">Belum ada. Tempel link video YouTube atau artikel di bawah.</p>}
                    <ul className="mt-2 space-y-1.5">
                      {detail.resources.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2">
                          <a href={r.url ?? '#'} target="_blank" rel="noreferrer" className="truncate text-sm text-[#0066cc] hover:underline">
                            {r.youtubeId ? '▶ ' : ''}
                            {r.title}
                          </a>
                          <button type="button" onClick={() => startTransition(async () => { await removeResource(r.id); await reload(); })} className="rounded-full p-1 text-text-secondary hover:text-[#c2452d]" aria-label={`Hapus ${r.title}`}>
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 grid gap-2">
                      <input value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="rounded-xl border-black/10 text-sm" inputMode="url" aria-label="Link sumber" />
                      <div className="flex gap-2">
                        <input value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="Judul (opsional)" className="min-w-0 flex-1 rounded-xl border-black/10 text-sm" aria-label="Judul sumber" />
                        <button type="button" onClick={addRes} disabled={!resUrl || pending} className="rounded-full bg-[#1d1d1f] px-4 text-[13px] font-semibold text-white disabled:opacity-40">
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'catatan' && (
                <div>
                  <textarea
                    value={noteText}
                    onChange={(e) => onNoteChange(e.target.value)}
                    rows={12}
                    placeholder={node.type === 'refleksi' ? 'Tulis refleksimu di sini (3 kalimat cukup).' : 'Catatan pribadi: pola, kesalahan, kosakata baru…'}
                    className="w-full rounded-2xl border-black/10 text-[15px] leading-relaxed"
                    aria-label="Catatan"
                  />
                  <p className="mt-1 text-[12px] text-text-secondary">{noteState === 'saving' ? 'Menyimpan…' : noteState === 'saved' ? 'Tersimpan' : 'Tersimpan otomatis saat berhenti mengetik'}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* footer: timer + selesai */}
        {detail && (
          <div className="border-t border-black/5 bg-white/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
            {error && <p className="mb-2 rounded-xl bg-[#fdecea] px-3 py-2 text-[13px] text-[#a3271f]">{error}</p>}
            {doneMsg && <p className="mb-2 rounded-xl bg-[#eaf8ee] px-3 py-2 text-[13px] text-[#1f7a3a]">{doneMsg}</p>}
            {completed ? (
              <p className="py-2 text-sm text-text-main">
                <span className="font-semibold text-[#1f7a3a]">{status === 'skipped' ? 'Dilewati' : 'Selesai ✓'}</span>
                {detail.progress?.mastery ? ` · ${'★'.repeat(detail.progress.mastery)}` : ''}
                {detail.progress?.srsDue ? ` · review ${fmtDate(detail.progress.srsDue)}` : ''}
              </p>
            ) : locked && !skipTest ? (
              <p className="flex items-start gap-2 py-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {detail.lockReason ?? 'Node ini masih terkunci.'}
              </p>
            ) : (
              <div className="space-y-3">
                {skipTest && (
                  <p className="rounded-xl bg-[#fff4e0] px-3 py-2 text-[13px] text-[#7a4a00]">
                    Tes lompat: lulus ≥ {node.passPct ?? 80}% untuk melewati {detail.skipCount} node sebelumnya (masing-masing dapat 50% XP).
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={toggleTimer} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[13px] font-medium tabular-nums text-text-main">
                    <span className="material-symbols-outlined text-[18px]">{running ? 'pause' : 'timer'}</span>
                    {pad2(Math.floor(secs / 3600))}:{pad2(Math.floor((secs % 3600) / 60))}:{pad2(secs % 60)}
                  </button>
                  <label className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                    atau
                    <input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" className="w-14 rounded-lg border-black/10 px-2 py-1 text-[13px]" aria-label="Menit belajar" placeholder="0" />
                    menit
                  </label>
                  {needsScore && (
                    <label className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                      Skor
                      <input value={score} onChange={(e) => setScore(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} inputMode="numeric" className="w-14 rounded-lg border-black/10 px-2 py-1 text-[13px]" aria-label="Skor dalam persen" placeholder="%" />%
                    </label>
                  )}
                </div>
                {node.problem && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[13px] text-text-main">
                      <input type="checkbox" checked={usedHint} onChange={(e) => setUsedHint(e.target.checked)} className="rounded border-black/20 text-[#0066cc]" />
                      Pakai hint / lihat solusi
                    </label>
                    <input value={solutionUrl} onChange={(e) => setSolutionUrl(e.target.value)} placeholder="Link submission (opsional)" className="min-w-0 flex-1 rounded-lg border-black/10 px-2 py-1 text-[13px]" inputMode="url" aria-label="Link submission" />
                  </div>
                )}
                <div>
                  <p className="mb-1.5 text-[12px] text-text-secondary">Seberapa yakin?</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([1, 2, 3, 4] as Rating[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        aria-pressed={rating === r}
                        className={`rounded-xl border py-2 text-[13px] font-medium transition-colors ${rating === r ? 'border-[#0066cc] bg-[#0066cc]/10 text-[#0066cc]' : 'border-black/10 text-text-main hover:bg-black/[0.03]'}`}
                      >
                        {RATING_LABEL[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {node.problem && (
                    <button type="button" onClick={submitAttempt} disabled={pending} className="rounded-full border border-black/10 px-4 py-3 text-[13px] font-semibold text-text-main disabled:opacity-50">
                      Catat percobaan
                    </button>
                  )}
                  <button type="button" onClick={submit} disabled={pending} className="flex-1 rounded-full py-3 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60" style={{ background: '#0066cc' }}>
                    {pending ? 'Menyimpan…' : skipTest ? 'Lulus tes lompat' : `Tandai selesai · +${node.xp}${node.problem && !usedHint ? '+5' : ''} XP`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
