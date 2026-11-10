'use client';

// Komponen isian untuk editor CMS. Semua terkontrol: value + onChange.
import { useId, useRef, useState, type ReactNode } from 'react';
import { TechIcon, TECH_ICON_KEYS } from '@/components/site/TechIcon';
import { checkEmbed, isSafeUrl, LINK_TYPES, normalizeEmbed } from '@/lib/site/validate';
import type { ProjectLink } from '@/lib/site/types';

export const inputCls =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-text-main placeholder:text-text-secondary/60 focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20';
const labelCls = 'block text-[13px] font-medium text-text-main';
const hintCls = 'mt-1 block text-[11px] leading-snug text-text-secondary';
const badCls = '!border-[#c4352b]/60 focus:!ring-[#c4352b]/20';
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-40';
export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-semibold text-text-main transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-40';

export function IconBtn({ icon, label, onClick, disabled, tone }: { icon: string; label: string; onClick: () => void; disabled?: boolean; tone?: 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-secondary transition-colors hover:bg-[#f5f5f7] disabled:pointer-events-none disabled:opacity-25 ${tone === 'danger' ? 'hover:text-[#c4352b]' : 'hover:text-text-main'}`}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

// ---------- Teks ----------
export function TextField({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows = 4,
  placeholder,
  softMax,
  type = 'text',
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  softMax?: number;
  type?: 'text' | 'email' | 'url';
  invalid?: boolean;
}) {
  const cls = `${inputCls} mt-1 ${invalid ? badCls : ''}`;
  return (
    <label className={labelCls}>
      <span className="flex items-baseline justify-between gap-2">
        {label}
        {softMax && <span className={`text-[11px] tabular-nums ${value.length > softMax ? 'text-[#c25e00]' : 'text-text-secondary'}`}>{value.length}/{softMax}</span>}
      </span>
      {multiline ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-y leading-relaxed`} />
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      {hint && <span className={hintCls}>{hint}</span>}
    </label>
  );
}

export function UrlField({ label, value, onChange, mailto, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; mailto?: boolean; hint?: ReactNode; placeholder?: string }) {
  const bad = value.trim() !== '' && !isSafeUrl(value, { mailto });
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      invalid={bad}
      placeholder={placeholder ?? 'https://…'}
      hint={bad ? <span className="text-[#c4352b]">{mailto ? 'Pakai https://…, /path, atau mailto:alamat.' : 'Pakai https://… atau path yang diawali /.'}</span> : hint}
    />
  );
}

export function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className={labelCls}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={`${inputCls} mt-1`}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-black/15 transition-colors peer-checked:bg-[#34c759] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0066cc]/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
      <span>
        <span className="block text-[13px] font-medium text-text-main">{label}</span>
        {hint && <span className={hintCls}>{hint}</span>}
      </span>
    </label>
  );
}

// ---------- Tag ----------
export function TagsField({ label, value, onChange, suggestions, hint, max = 30 }: { label: string; value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; hint?: string; max?: number }) {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const add = (raw: string) => {
    const next = [...value];
    for (const p of raw.split(',').map((s) => s.trim()).filter(Boolean)) if (!next.includes(p)) next.push(p);
    onChange(next.slice(0, max));
    setDraft('');
  };
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 py-1.5 focus-within:border-[#0066cc] focus-within:ring-2 focus-within:ring-[#0066cc]/20">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] py-0.5 pl-2.5 pr-1 text-[12px] font-medium text-text-main">
            {t}
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-5 w-5 place-items-center rounded-full text-text-secondary hover:bg-black/5 hover:text-[#c4352b]">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                close
              </span>
            </button>
          </span>
        ))}
        <input
          value={draft}
          list={suggestions ? listId : undefined}
          aria-label={label}
          placeholder={value.length ? '' : 'Ketik lalu Enter'}
          onChange={(e) => (e.target.value.includes(',') ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft.trim()) add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft.trim() && add(draft)}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-1 text-sm focus:outline-none focus:ring-0"
        />
      </div>
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      {hint && <span className={hintCls}>{hint}</span>}
    </div>
  );
}

// ---------- Upload ----------
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return { blob: file, width: 0, height: 0 };
  const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const toBlob = (type: string, q?: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  // Gambar ulang lewat canvas = metadata EXIF (termasuk lokasi GPS) ikut terbuang.
  let out = await toBlob('image/webp', 0.86);
  if (!out || out.type !== 'image/webp') out = await toBlob(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
  return { blob: out ?? file, width: w, height: h };
}

export async function uploadFile(file: File): Promise<string> {
  let blob: Blob = file;
  let width = 0;
  let height = 0;
  if (/^image\/(png|jpeg|webp|avif)$/.test(file.type)) ({ blob, width, height } = await compress(file));
  if (blob.size > 8 * 1024 * 1024) throw new Error('File lebih dari 8 MB.');
  const fd = new FormData();
  fd.append('file', blob, file.name);
  if (width) {
    fd.append('width', String(width));
    fd.append('height', String(height));
  }
  const res = await fetch('/api/dojo/upload', { method: 'POST', body: fd });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !j.url) throw new Error(j.error ?? `Upload gagal (${res.status}).`);
  return j.url;
}

function useUpload(onDone: (url: string) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      for (const f of Array.from(files)) onDone(await uploadFile(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload gagal.');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };
  return { ref, busy, err, run, pick: () => ref.current?.click() };
}

export function ImageField({ label, value, onChange, hint, kind = 'image' }: { label: string; value: string; onChange: (v: string) => void; hint?: string; kind?: 'image' | 'pdf' }) {
  const up = useUpload(onChange);
  const bad = value.trim() !== '' && !isSafeUrl(value);
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="mt-1 flex items-start gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/10 bg-[#f5f5f7]">
          {kind === 'image' && value && !bad ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[28px] text-text-secondary" aria-hidden="true">
              {kind === 'pdf' ? 'picture_as_pdf' : 'image'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label}: URL`} placeholder="https://… atau /assets/…" className={`${inputCls} ${bad ? badCls : ''}`} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={up.pick} disabled={up.busy} className={btnSecondary}>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                upload
              </span>
              {up.busy ? 'Mengunggah…' : kind === 'pdf' ? 'Unggah PDF' : 'Unggah gambar'}
            </button>
            {value && kind === 'pdf' && !bad && (
              <a href={value} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-[#0066cc] hover:underline">
                Buka
              </a>
            )}
          </div>
          {up.err && <p className="text-[12px] text-[#c4352b]">{up.err}</p>}
          {bad && <p className="text-[12px] text-[#c4352b]">Pakai https://… atau path yang diawali /.</p>}
          {hint && <span className={hintCls}>{hint}</span>}
        </div>
      </div>
      <input ref={up.ref} type="file" accept={kind === 'pdf' ? 'application/pdf' : 'image/png,image/jpeg,image/webp,image/gif,image/avif'} hidden onChange={(e) => up.run(e.target.files)} />
    </div>
  );
}

export function GalleryField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const latest = useRef(value);
  latest.current = value;
  const up = useUpload((url) => {
    latest.current = [...latest.current, url];
    onChange(latest.current);
  });
  const [url, setUrl] = useState('');
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <ul className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((src, i) => (
          <li key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <img src={isSafeUrl(src) ? src : ''} alt={`Gambar ${i + 1}`} className="aspect-video w-full bg-[#f5f5f7] object-cover" />
            <div className="flex items-center justify-between px-1">
              <IconBtn icon="arrow_back" label="Geser ke kiri" onClick={() => move(i, -1)} disabled={i === 0} />
              <span className="text-[11px] tabular-nums text-text-secondary">{i + 1}</span>
              <IconBtn icon="arrow_forward" label="Geser ke kanan" onClick={() => move(i, 1)} disabled={i === value.length - 1} />
              <IconBtn icon="delete" tone="danger" label={`Hapus gambar ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={up.pick} disabled={up.busy} className={btnSecondary}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            add_photo_alternate
          </span>
          {up.busy ? 'Mengunggah…' : 'Unggah gambar'}
        </button>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="atau tempel URL gambar" aria-label="URL gambar galeri" className={`${inputCls} min-w-0 flex-1`} />
        <button type="button" disabled={!isSafeUrl(url)} onClick={() => (onChange([...value, url.trim()]), setUrl(''))} className={btnSecondary}>
          Tambah
        </button>
      </div>
      {up.err && <p className="mt-1 text-[12px] text-[#c4352b]">{up.err}</p>}
      <input ref={up.ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => up.run(e.target.files)} />
    </div>
  );
}

// ---------- Khusus ----------
export function EmbedField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const norm = value.trim() ? normalizeEmbed(value) : '';
  const err = norm ? checkEmbed(norm) : null;
  return (
    <div>
      <label className={labelCls}>
        Embed (opsional)
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Tempel link Canva, YouTube, Figma, atau kode embed" className={`${inputCls} mt-1 resize-y font-mono text-[12px] ${err ? badCls : ''}`} />
      </label>
      {norm &&
        (err ? (
          <p className="mt-1 text-[12px] text-[#c4352b]">{err}</p>
        ) : (
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#1f7a3a]">
            {norm !== value.trim() ? 'Link ini diubah jadi embed saat disimpan.' : 'Kode embed valid.'}
            <button type="button" onClick={() => setShow((s) => !s)} className="font-semibold text-[#0066cc] hover:underline">
              {show ? 'Tutup pratinjau' : 'Pratinjau'}
            </button>
          </p>
        ))}
      {show && norm && !err && (
        <div
          className="mt-2 aspect-video overflow-hidden rounded-xl border border-black/10 bg-black [&>a]:hidden [&>div]:!m-0 [&>div]:!h-full [&>div]:!p-0 [&>iframe]:!h-full [&>iframe]:!w-full"
          dangerouslySetInnerHTML={{ __html: norm }}
        />
      )}
    </div>
  );
}

export function IconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ok = /^[a-z0-9_]{1,40}$/.test(value);
  return (
    <label className={labelCls}>
      Ikon
      <span className="mt-1 flex items-center gap-2">
        <span className="material-symbols-outlined grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5f5f7] text-[22px] text-[#0066cc]" aria-hidden="true">
          {ok ? value : 'help'}
        </span>
        <input value={value} onChange={(e) => onChange(e.target.value.trim().toLowerCase())} className={`${inputCls} ${ok ? '' : badCls}`} />
      </span>
      <span className={hintCls}>Nama ikon Material Symbols (fonts.google.com/icons), mis. emoji_events, trophy, military_tech.</span>
    </label>
  );
}

export function LinksEditor({ value, onChange }: { value: ProjectLink[]; onChange: (v: ProjectLink[]) => void }) {
  const set = (i: number, patch: Partial<ProjectLink>) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div>
      <span className={labelCls}>Link proyek</span>
      <ul className="mt-1 space-y-2">
        {value.map((l, i) => {
          const bad = l.url.trim() !== '' && !isSafeUrl(l.url);
          return (
            <li key={i} className="flex items-center gap-2">
              <select value={l.type} onChange={(e) => set(i, { type: e.target.value as ProjectLink['type'] })} aria-label={`Jenis link ${i + 1}`} className={`${inputCls} w-32 shrink-0`}>
                {LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input value={l.url} onChange={(e) => set(i, { url: e.target.value })} aria-label={`URL link ${i + 1}`} placeholder="https://…" className={`${inputCls} min-w-0 flex-1 ${bad ? badCls : ''}`} />
              <IconBtn icon="delete" tone="danger" label={`Hapus link ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))} />
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => onChange([...value, { type: 'url', url: '' }])} className={`${btnSecondary} mt-2`}>
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          add_link
        </span>
        Tambah link
      </button>
    </div>
  );
}

export function TechStackEditor({ items, onChange }: { items: { id: number; key: string; hidden?: boolean }[]; onChange: (v: { id: number; key: string; hidden?: boolean }[]) => void }) {
  const used = new Set(items.map((i) => i.key));
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <li key={t.id} className="flex w-[92px] flex-col items-center gap-1 rounded-2xl border border-black/5 bg-white px-1 pb-1 pt-3">
            <TechIcon name={t.key} size={7} />
            <span className="max-w-full truncate text-[11px] font-medium text-text-main">{t.key}</span>
            <span className="flex">
              <IconBtn icon="chevron_left" label={`Geser ${t.key} ke kiri`} onClick={() => move(i, -1)} disabled={i === 0} />
              <IconBtn icon="close" tone="danger" label={`Hapus ${t.key}`} onClick={() => onChange(items.filter((x) => x.id !== t.id))} />
              <IconBtn icon="chevron_right" label={`Geser ${t.key} ke kanan`} onClick={() => move(i, 1)} disabled={i === items.length - 1} />
            </span>
          </li>
        ))}
      </ul>
      <label className={`${labelCls} mt-4 max-w-xs`}>
        Tambah ikon
        <select
          value=""
          onChange={(e) => {
            const key = e.target.value;
            if (!key || used.has(key)) return;
            onChange([...items, { id: Math.max(0, ...items.map((x) => x.id)) + 1, key }]);
          }}
          className={`${inputCls} mt-1`}
        >
          <option value="">Pilih…</option>
          {TECH_ICON_KEYS.filter((k) => !used.has(k)).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

// ---------- Daftar item ----------
export function ListEditor<T extends { id: number; hidden?: boolean }>({
  items,
  onChange,
  title,
  subtitle,
  render,
  create,
  addLabel,
  addAt = 'start',
  errorIdx,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  render: (item: T, patch: (p: Partial<T>) => void) => ReactNode;
  create: (id: number) => T;
  addLabel: string;
  addAt?: 'start' | 'end';
  errorIdx?: Set<number>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const add = () => {
    const id = Math.max(0, ...items.map((x) => x.id)) + 1;
    onChange(addAt === 'start' ? [create(id), ...items] : [...items, create(id)]);
    setOpen(id);
  };
  const addBtn = (
    <button type="button" onClick={add} className={btnSecondary}>
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        add
      </span>
      {addLabel}
    </button>
  );
  return (
    <div className="space-y-3">
      {addAt === 'start' && addBtn}
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-text-secondary">Belum ada item. Tambahkan yang pertama.</p>}
      <ol className="space-y-2">
        {items.map((it, i) => {
          const bad = errorIdx?.has(i);
          const isOpen = open === it.id || bad;
          return (
            <li key={it.id} className={`rounded-2xl border bg-white ${bad ? 'border-[#c4352b]/50' : 'border-black/5'}`}>
              <div className="flex items-center gap-1 py-2 pl-2 pr-2">
                <button type="button" onClick={() => setOpen(isOpen ? null : it.id)} aria-expanded={isOpen} className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl p-1 text-left ${it.hidden ? 'opacity-50' : ''}`}>
                  <span className={`material-symbols-outlined text-[20px] text-text-secondary transition-transform ${isOpen ? 'rotate-90' : ''}`} aria-hidden="true">
                    chevron_right
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-main">{title(it) || 'Tanpa judul'}</span>
                    {subtitle && <span className="block truncate text-[12px] text-text-secondary">{subtitle(it)}</span>}
                  </span>
                </button>
                {it.hidden && <span className="hidden rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] font-medium text-text-secondary sm:inline">Disembunyikan</span>}
                <IconBtn icon="arrow_upward" label="Naikkan" onClick={() => move(i, -1)} disabled={i === 0} />
                <IconBtn icon="arrow_downward" label="Turunkan" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
                <IconBtn icon={it.hidden ? 'visibility_off' : 'visibility'} label={it.hidden ? 'Tampilkan di situs' : 'Sembunyikan dari situs'} onClick={() => onChange(items.map((x) => (x.id === it.id ? { ...x, hidden: !x.hidden } : x)))} />
                {confirm === it.id ? (
                  <span className="flex items-center gap-1 pl-1">
                    <button type="button" onClick={() => (onChange(items.filter((x) => x.id !== it.id)), setConfirm(null))} className="rounded-full bg-[#c4352b] px-3 py-1 text-[12px] font-semibold text-white">
                      Hapus
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="rounded-full px-2 py-1 text-[12px] font-medium text-text-secondary hover:bg-[#f5f5f7]">
                      Batal
                    </button>
                  </span>
                ) : (
                  <IconBtn icon="delete" tone="danger" label="Hapus item" onClick={() => setConfirm(it.id)} />
                )}
              </div>
              {isOpen && <div className="grid gap-3 border-t border-black/5 p-4">{render(it, (p) => onChange(items.map((x) => (x.id === it.id ? { ...x, ...p } : x))))}</div>}
            </li>
          );
        })}
      </ol>
      {addAt === 'end' && addBtn}
    </div>
  );
}
