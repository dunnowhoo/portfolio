// Ikon ilustrasi Dōjō (pengganti emoji): public/assets/dojo/icons/<nama>.webp, 128 px transparan,
// dibuat sekali dengan OpenAI Images lewat scripts/icon-gen.mjs (gaya sama dengan maskot Daru).
export const DOJO_ICON_NAMES = [
  'materi',
  'video',
  'irodori',
  'target',
  'duolingo',
  'anki',
  'castle',
  'oni',
  'banner',
  'brush',
  'speech',
  'flame',
  'flame-blue',
  'ice',
  'medal',
  'lock',
  'briefcase',
] as const;

export type DojoIconName = (typeof DOJO_ICON_NAMES)[number];

export const dojoIconSrc = (name: DojoIconName) => `/assets/dojo/icons/${name}.webp`;
