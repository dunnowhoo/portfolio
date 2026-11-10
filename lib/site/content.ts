// Model konten halaman utama (CMS, PRD F14). Data awal = isi constants.tsx + Hero/Contact lama,
// sekaligus salinan cadangan kalau DB tidak bisa diakses.
import { ACHIEVEMENTS, EXPERIENCES, ORGANIZATIONS, PROJECTS, TECH_STACK } from './constants';
import type { Achievement, Experience, Organization, Project } from './types';

export type Hideable = { hidden?: boolean };
export type SocialKind = 'github' | 'linkedin' | 'upwork' | 'instagram' | 'email';

export type SiteContent = {
  profile: {
    firstName: string;
    lastName: string;
    roles: string[];
    tagline: string;
    available: boolean;
    availableText: string;
    resumeUrl: string;
    photoUrl: string;
    photoName: string;
    location: string;
  };
  socials: ({ id: number; kind: SocialKind; label: string; url: string } & Hideable)[];
  education: { school: string; degree: string };
  experience: (Experience & Hideable)[];
  organization: (Organization & Hideable)[];
  achievements: (Achievement & Hideable)[];
  techstack: ({ id: number; key: string } & Hideable)[];
  projects: (Project & Hideable)[];
  contact: { headingA: string; headingB: string; text: string; email: string; scheduleUrl: string };
  seo: { title: string; description: string; ogImage: string };
};

export type SectionKey = keyof SiteContent;

export const SECTION_LABEL: Record<SectionKey, string> = {
  profile: 'Profil',
  socials: 'Sosial',
  education: 'Pendidikan',
  experience: 'Pengalaman',
  organization: 'Organisasi',
  achievements: 'Prestasi',
  techstack: 'Tech stack',
  projects: 'Proyek',
  contact: 'Kontak',
  seo: 'SEO',
};

export const SECTION_KEYS = Object.keys(SECTION_LABEL) as SectionKey[];
export const LIST_SECTIONS: SectionKey[] = ['socials', 'experience', 'organization', 'achievements', 'techstack', 'projects'];

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    firstName: 'Fauzan Putra',
    lastName: 'Sanjaya.',
    roles: ['AI Solutions Engineer', 'Mobile Fullstack Developer'],
    tagline: 'building LLM agents, RAG pipelines, and scalable mobile & web systems.',
    available: true,
    availableText: 'Available for work',
    resumeUrl: '/assets/profile/CV_FauzanPutraSanjaya.pdf',
    photoUrl: '/assets/profile/profile.png',
    photoName: 'Fauzan Sanjaya',
    location: 'Depok, Indonesia',
  },
  socials: [
    { id: 1, kind: 'github', label: 'GitHub', url: 'https://github.com/dunnowhoo' },
    { id: 2, kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/fauzansanjaya' },
    { id: 3, kind: 'upwork', label: 'Upwork', url: 'https://www.upwork.com/freelancers/fauzansanjaya' },
    { id: 4, kind: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/fauzanputra.s/' },
    { id: 5, kind: 'email', label: 'Email', url: 'mailto:sanjaya@ristek.cs.ui.ac.id' },
  ],
  education: { school: 'Universitas Indonesia', degree: 'Computer Science' },
  experience: EXPERIENCES,
  organization: ORGANIZATIONS,
  achievements: ACHIEVEMENTS,
  techstack: TECH_STACK.map((key, i) => ({ id: i + 1, key })),
  projects: PROJECTS,
  contact: {
    headingA: "Let's build something",
    headingB: 'amazing together.',
    text: "I'm currently available for projects and opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
    email: 'sanjaya@ristek.cs.ui.ac.id',
    scheduleUrl: 'https://calendar.app.google/WM7cyYYhae7frrwK7',
  },
  seo: {
    title: 'Fauzan Sanjaya | AI Solutions Engineer & Mobile Fullstack Developer',
    description:
      'Portfolio of Fauzan Putra Sanjaya, an AI Solutions Engineer and Mobile Fullstack Developer building LLM agents, RAG pipelines, and scalable mobile & web systems.',
    ogImage: '',
  },
};

export function visible<T extends Hideable>(items: T[]): T[] {
  return items.filter((i) => !i.hidden);
}

/** Isi yang boleh sampai ke browser: item tersembunyi dibuang di server supaya tidak ikut payload RSC. */
export function publicContent(c: SiteContent): SiteContent {
  const strip = <T extends Hideable>(a: T[]) => visible(a).map(({ hidden, ...rest }) => rest as T);
  return {
    ...c,
    socials: strip(c.socials),
    experience: strip(c.experience),
    organization: strip(c.organization),
    achievements: strip(c.achievements),
    techstack: strip(c.techstack),
    projects: strip(c.projects),
  };
}
