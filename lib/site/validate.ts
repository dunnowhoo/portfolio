// Validasi konten CMS (dipakai server action dan editor). Konten dirender ke halaman publik,
// jadi semua URL dibatasi ke skema aman dan kode embed hanya boleh iframe dari host tepercaya.
import { z } from 'zod';
import type { SectionKey } from './content';

// ---------- URL ----------
/** http(s), path relatif "/..." (bukan "//"), atau mailto: bila diizinkan. */
export function isSafeUrl(u: string, opts: { mailto?: boolean } = {}): boolean {
  const v = u.trim();
  if (v.startsWith('/')) return !v.startsWith('//') && !v.startsWith('/\\');
  if (opts.mailto && /^mailto:[^\s<>"']+@[^\s<>"']+$/i.test(v)) return true;
  try {
    const p = new URL(v);
    return (p.protocol === 'https:' || p.protocol === 'http:') && !!p.hostname;
  } catch {
    return false;
  }
}

// ---------- Embed ----------
export const EMBED_HOSTS = [
  'www.canva.com',
  'canva.com',
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.figma.com',
  'embed.figma.com',
  'docs.google.com',
  'www.loom.com',
];
const EMBED_TAGS = new Set(['div', 'iframe', 'a', 'p', 'span', 'br']);

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_, h: string) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d{1,7});?/g, (_, d: string) => safeChar(Number(d)))
    .replace(/&colon;/gi, ':')
    .replace(/&sol;/gi, '/')
    .replace(/&(tab|newline);/gi, '')
    .replace(/&amp;/gi, '&');
}
function safeChar(n: number): string {
  return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
}
function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

/** null kalau aman; selain itu pesan kesalahan. */
export function checkEmbed(html: string): string | null {
  if (/<\s*(script|style|object|embed|form|link|meta|base|svg|math|template)\b/i.test(html)) return 'Kode embed berisi tag yang tidak diizinkan.';
  if (/\son[a-z]+\s*=/i.test(html) || /\ssrcdoc\s*=/i.test(html)) return 'Kode embed tidak boleh berisi atribut event atau srcdoc.';
  for (const m of html.matchAll(/<\/?\s*([a-zA-Z][\w-]*)/g)) {
    if (!EMBED_TAGS.has(m[1].toLowerCase())) return `Tag <${m[1]}> tidak diizinkan di embed.`;
  }
  const iframes = [...html.matchAll(/<iframe\b[^>]*>/gi)].map((m) => m[0]);
  if (iframes.length === 0) return 'Kode embed harus berisi <iframe>.';
  for (const tag of iframes) {
    const src = decodeEntities(attr(tag, 'src') ?? '').replace(/[\s\u0000-\u001f]/g, '');
    let host = '';
    try {
      const u = new URL(src);
      if (u.protocol !== 'https:') return 'Sumber iframe harus https.';
      host = u.hostname.toLowerCase();
    } catch {
      return 'Sumber iframe tidak valid.';
    }
    if (!EMBED_HOSTS.includes(host)) return `Host ${host} belum diizinkan (Canva, YouTube, Vimeo, Figma, Google Docs, Loom).`;
  }
  for (const m of html.matchAll(/<[a-z][^>]*>/gi)) {
    for (const name of ['href', 'src', 'action', 'formaction', 'xlink:href']) {
      const v = attr(m[0], name);
      if (v === null) continue;
      const clean = decodeEntities(v).replace(/[\s\u0000-\u001f]/g, '');
      if (!/^https?:\/\//i.test(clean)) return 'Semua link di embed harus http(s).';
    }
  }
  return null;
}

const YT_ATTRS = 'title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen';
const RESPONSIVE = (src: string) =>
  `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%; padding-bottom: 0; overflow: hidden; border-radius: 8px;">\n  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0;" src="${src}" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>\n</div>`;

/** Link biasa (YouTube/Canva/Figma/…) diubah jadi kode embed; kode embed dibiarkan. */
export function normalizeEmbed(input: string): string {
  const v = input.trim();
  if (!v || v.startsWith('<')) return v;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return v;
  }
  const host = u.hostname.toLowerCase().replace(/^m\./, 'www.');
  const yt =
    (host.endsWith('youtube.com') && (u.searchParams.get('v') || /^\/(?:embed|shorts|live)\/([\w-]{11})/.exec(u.pathname)?.[1])) ||
    (host === 'youtu.be' && /^\/([\w-]{11})/.exec(u.pathname)?.[1]);
  if (yt) return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${encodeURIComponent(yt)}" ${YT_ATTRS}></iframe>`;
  const canva = host.endsWith('canva.com') && /^\/design\/([\w-]+)\/([\w-]+)/.exec(u.pathname);
  if (canva) return RESPONSIVE(`https://www.canva.com/design/${canva[1]}/${canva[2]}/view?embed`);
  if (host === 'www.figma.com' || host === 'figma.com') return RESPONSIVE(`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(v)}`);
  const vimeo = host.endsWith('vimeo.com') && /\/(\d{5,})/.exec(u.pathname);
  if (vimeo) return RESPONSIVE(`https://player.vimeo.com/video/${vimeo[1]}`);
  if (EMBED_HOSTS.includes(host) && u.protocol === 'https:') return RESPONSIVE(u.toString().replace(/"/g, '%22'));
  return v;
}

// ---------- Skema per bagian ----------
const msg = { required: 'Wajib diisi.' };
const text = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`);
const req = (max: number) => text(max).min(1, msg.required);
const url = (opts: { mailto?: boolean; required?: boolean } = {}) =>
  z
    .string()
    .trim()
    .max(2000)
    .refine((v) => (v === '' ? !opts.required : isSafeUrl(v, opts)), opts.mailto ? 'Pakai https://…, /path, atau mailto:alamat.' : 'Pakai https://… atau path /….');
const hidden = z.boolean().optional();
const id = z.number().int().min(0).max(1_000_000);
const uniqueIds = <T extends { id: number }>(a: T[]) => new Set(a.map((x) => x.id)).size === a.length;
const list = <T extends z.ZodType<{ id: number }>>(item: T, max: number) =>
  z.array(item).max(max, `Maksimal ${max} item.`).refine(uniqueIds, 'ID item ganda.');

const embed = z
  .string()
  .max(6000, 'Kode embed terlalu panjang.')
  .optional()
  .transform((v) => (v ? normalizeEmbed(v) : undefined))
  .superRefine((v, ctx) => {
    const e = v ? checkEmbed(v) : null;
    if (e) ctx.addIssue({ code: 'custom', message: e });
  });

export const PROJECT_CATEGORIES = ['Web', 'Mobile', 'AI/Data', 'Smart City'] as const;
export const LINK_TYPES = ['github', 'url', 'playstore', 'appstore', 'postman', 'docs', 'youtube', 'figma'] as const;
export const SOCIAL_KINDS = ['github', 'linkedin', 'upwork', 'instagram', 'email'] as const;

export const SECTION_SCHEMAS = {
  profile: z.object({
    firstName: req(80),
    lastName: text(80),
    roles: z.array(req(80)).min(1, 'Minimal satu peran.').max(4),
    tagline: text(300),
    available: z.boolean(),
    availableText: text(60),
    resumeUrl: url(),
    photoUrl: url({ required: true }),
    photoName: text(80),
    location: text(80),
  }),
  socials: list(z.object({ id, kind: z.enum(SOCIAL_KINDS), label: req(30), url: url({ mailto: true, required: true }), hidden }), 8),
  education: z.object({ school: req(120), degree: text(120) }),
  experience: list(
    z.object({ id, role: req(120), company: req(120), period: text(60), description: text(4000), tech: z.array(req(40)).max(30), link: url().optional(), hidden }),
    40,
  ),
  organization: list(
    z.object({ id, role: req(120), org: req(120), period: text(60), description: text(4000), category: text(40), link: url().optional(), hidden }),
    40,
  ),
  achievements: list(z.object({ id, title: req(160), description: text(1000), icon: z.string().regex(/^[a-z0-9_]{1,40}$/, 'Nama ikon Material Symbols, mis. emoji_events.'), hidden }), 40),
  techstack: list(z.object({ id, key: z.string().regex(/^[\w.+#-]{1,30}$/, 'Nama ikon tidak valid.'), hidden }), 60),
  projects: list(
    z.object({
      id,
      title: req(160),
      description: text(4000),
      image: url({ required: true }),
      images: z.array(url({ required: true })).max(24),
      embed,
      category: z.enum(PROJECT_CATEGORIES),
      techStack: z.array(req(40)).max(30),
      links: z.array(z.object({ type: z.enum(LINK_TYPES), url: url({ required: true }) })).max(10),
      hidden,
    }),
    60,
  ),
  contact: z.object({
    headingA: text(80),
    headingB: text(80),
    text: text(600),
    email: z.string().trim().regex(/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/, 'Email tidak valid.'),
    scheduleUrl: url(),
  }),
  seo: z.object({ title: req(120), description: text(300), ogImage: url() }),
} satisfies Record<SectionKey, z.ZodType>;

/** Ringkas error zod jadi daftar "jalur: pesan" yang bisa ditampilkan editor. */
export function issuesOf(err: z.ZodError): { path: string; message: string }[] {
  return err.issues.slice(0, 12).map((i) => ({ path: i.path.join('.'), message: i.message }));
}
