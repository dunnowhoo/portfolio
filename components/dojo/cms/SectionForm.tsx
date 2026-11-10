'use client';

import type { SectionKey, SiteContent } from '@/lib/site/content';
import { PROJECT_CATEGORIES, SOCIAL_KINDS } from '@/lib/site/validate';
import { TECH_ICON_KEYS } from '@/components/site/TechIcon';
import { EmbedField, GalleryField, IconField, ImageField, LinksEditor, ListEditor, SelectField, TagsField, TechStackEditor, TextField, ToggleField, UrlField } from './fields';

type C = SiteContent;
const two = 'grid gap-3 sm:grid-cols-2';

/** Judul item daftar, dipakai di editor dan di pesan error. */
export const ITEM_TITLE: Partial<Record<SectionKey, (x: never) => string>> = {
  socials: (s: C['socials'][number]) => s.label,
  experience: (e: C['experience'][number]) => [e.role, e.company].filter(Boolean).join(' · '),
  organization: (o: C['organization'][number]) => [o.role, o.org].filter(Boolean).join(' · '),
  achievements: (a: C['achievements'][number]) => a.title,
  techstack: (t: C['techstack'][number]) => t.key,
  projects: (p: C['projects'][number]) => p.title,
};

export default function SectionForm({ k, value, onChange, errorIdx }: { k: SectionKey; value: unknown; onChange: (v: unknown) => void; errorIdx: Set<number> }) {
  switch (k) {
    case 'profile': {
      const v = value as C['profile'];
      const set = (p: Partial<C['profile']>) => onChange({ ...v, ...p });
      return (
        <div className="grid gap-4">
          <div className={two}>
            <TextField label="Nama depan" value={v.firstName} onChange={(firstName) => set({ firstName })} />
            <TextField label="Nama belakang" value={v.lastName} onChange={(lastName) => set({ lastName })} hint="Tampil abu-abu di baris kedua." />
          </div>
          <TagsField label="Peran" value={v.roles} onChange={(roles) => set({ roles })} max={4} hint="Ditulis tebal dan digabung dengan &." />
          <TextField label="Kalimat pembuka" value={v.tagline} onChange={(tagline) => set({ tagline })} multiline rows={2} />
          <ToggleField label="Tampilkan status tersedia" checked={v.available} onChange={(available) => set({ available })} hint="Lencana hijau berkedip di atas nama." />
          {v.available && <TextField label="Teks status" value={v.availableText} onChange={(availableText) => set({ availableText })} />}
          <ImageField label="Foto profil" value={v.photoUrl} onChange={(photoUrl) => set({ photoUrl })} hint="Rasio potret; dipotong otomatis untuk kartu." />
          <div className={two}>
            <TextField label="Nama di foto" value={v.photoName} onChange={(photoName) => set({ photoName })} />
            <TextField label="Lokasi" value={v.location} onChange={(location) => set({ location })} />
          </div>
          <ImageField kind="pdf" label="CV (tombol Download Resume)" value={v.resumeUrl} onChange={(resumeUrl) => set({ resumeUrl })} />
        </div>
      );
    }
    case 'socials': {
      const items = value as C['socials'];
      return (
        <ListEditor
          items={items}
          onChange={onChange}
          errorIdx={errorIdx}
          addAt="end"
          addLabel="Tambah tautan"
          title={(s) => s.label}
          subtitle={(s) => s.url}
          create={(id) => ({ id, kind: 'github' as const, label: '', url: '' })}
          render={(s, patch) => (
            <>
              <div className={two}>
                <SelectField label="Jenis ikon" value={s.kind} options={SOCIAL_KINDS} onChange={(kind) => patch({ kind })} />
                <TextField label="Label" value={s.label} onChange={(label) => patch({ label })} />
              </div>
              <UrlField label="URL" value={s.url} onChange={(url) => patch({ url })} mailto placeholder={s.kind === 'email' ? 'mailto:nama@domain.com' : 'https://…'} />
            </>
          )}
        />
      );
    }
    case 'education': {
      const v = value as C['education'];
      return (
        <div className={two}>
          <TextField label="Kampus" value={v.school} onChange={(school) => onChange({ ...v, school })} />
          <TextField label="Jurusan" value={v.degree} onChange={(degree) => onChange({ ...v, degree })} />
        </div>
      );
    }
    case 'experience': {
      const items = value as C['experience'];
      return (
        <ListEditor
          items={items}
          onChange={onChange}
          errorIdx={errorIdx}
          addLabel="Tambah pengalaman"
          title={(e) => [e.role, e.company].filter(Boolean).join(' · ')}
          subtitle={(e) => e.period}
          create={(id) => ({ id, role: '', company: '', period: '', description: '', tech: [], link: '' })}
          render={(e, patch) => (
            <>
              <div className={two}>
                <TextField label="Peran" value={e.role} onChange={(role) => patch({ role })} />
                <TextField label="Perusahaan" value={e.company} onChange={(company) => patch({ company })} />
                <TextField label="Periode" value={e.period} onChange={(period) => patch({ period })} placeholder="Jan 2025 - Present" />
                <UrlField label="Link perusahaan (opsional)" value={e.link ?? ''} onChange={(link) => patch({ link })} />
              </div>
              <TextField label="Deskripsi" value={e.description} onChange={(description) => patch({ description })} multiline rows={6} />
              <TagsField label="Tech" value={e.tech} onChange={(tech) => patch({ tech })} />
            </>
          )}
        />
      );
    }
    case 'organization': {
      const items = value as C['organization'];
      return (
        <ListEditor
          items={items}
          onChange={onChange}
          errorIdx={errorIdx}
          addLabel="Tambah organisasi"
          title={(o) => [o.role, o.org].filter(Boolean).join(' · ')}
          subtitle={(o) => o.period}
          create={(id) => ({ id, role: '', org: '', period: '', description: '', category: 'Tech', link: '' })}
          render={(o, patch) => (
            <>
              <div className={two}>
                <TextField label="Peran" value={o.role} onChange={(role) => patch({ role })} />
                <TextField label="Organisasi" value={o.org} onChange={(org) => patch({ org })} />
                <TextField label="Periode" value={o.period} onChange={(period) => patch({ period })} />
                <TextField label="Kategori" value={o.category} onChange={(category) => patch({ category })} hint="Mis. Tech, Leadership, Education." />
              </div>
              <UrlField label="Link (opsional)" value={o.link ?? ''} onChange={(link) => patch({ link })} />
              <TextField label="Deskripsi" value={o.description} onChange={(description) => patch({ description })} multiline rows={5} />
            </>
          )}
        />
      );
    }
    case 'achievements': {
      const items = value as C['achievements'];
      return (
        <ListEditor
          items={items}
          onChange={onChange}
          errorIdx={errorIdx}
          addLabel="Tambah prestasi"
          title={(a) => a.title}
          create={(id) => ({ id, title: '', description: '', icon: 'emoji_events' })}
          render={(a, patch) => (
            <>
              <TextField label="Judul" value={a.title} onChange={(title) => patch({ title })} />
              <TextField label="Deskripsi" value={a.description} onChange={(description) => patch({ description })} multiline rows={3} />
              <IconField value={a.icon} onChange={(icon) => patch({ icon })} />
            </>
          )}
        />
      );
    }
    case 'techstack':
      return <TechStackEditor items={value as C['techstack']} onChange={onChange} />;
    case 'projects': {
      const items = value as C['projects'];
      return (
        <ListEditor
          items={items}
          onChange={onChange}
          errorIdx={errorIdx}
          addLabel="Tambah proyek"
          title={(p) => p.title}
          subtitle={(p) => p.category}
          create={(id) => ({ id, title: '', description: '', image: '', images: [], category: 'Web' as const, techStack: [], links: [] })}
          render={(p, patch) => (
            <>
              <div className={two}>
                <TextField label="Judul" value={p.title} onChange={(title) => patch({ title })} />
                <SelectField label="Kategori" value={p.category} options={PROJECT_CATEGORIES} onChange={(category) => patch({ category })} />
              </div>
              <TextField label="Deskripsi" value={p.description} onChange={(description) => patch({ description })} multiline rows={6} />
              <ImageField label="Gambar sampul" value={p.image} onChange={(image) => patch({ image })} hint="Tampil di kartu proyek." />
              <GalleryField label="Galeri (di jendela detail)" value={p.images} onChange={(images) => patch({ images })} />
              <EmbedField value={p.embed ?? ''} onChange={(embed) => patch({ embed })} />
              <TagsField label="Tech stack" value={p.techStack} onChange={(techStack) => patch({ techStack })} suggestions={TECH_ICON_KEYS} hint="Pakai nama ikon yang dikenal (mis. flutter, nextjs, py) supaya logonya muncul." />
              <LinksEditor value={p.links} onChange={(links) => patch({ links })} />
            </>
          )}
        />
      );
    }
    case 'contact': {
      const v = value as C['contact'];
      const set = (p: Partial<C['contact']>) => onChange({ ...v, ...p });
      return (
        <div className="grid gap-4">
          <div className={two}>
            <TextField label="Judul baris 1" value={v.headingA} onChange={(headingA) => set({ headingA })} />
            <TextField label="Judul baris 2 (abu-abu)" value={v.headingB} onChange={(headingB) => set({ headingB })} />
          </div>
          <TextField label="Teks" value={v.text} onChange={(text) => set({ text })} multiline rows={3} />
          <TextField label="Email" type="email" value={v.email} onChange={(email) => set({ email })} hint="Dipakai untuk tautan email dan form kirim pesan." />
          <UrlField label="Link jadwal call" value={v.scheduleUrl} onChange={(scheduleUrl) => set({ scheduleUrl })} hint="Kosongkan untuk menyembunyikan baris “Schedule a call”." />
        </div>
      );
    }
    case 'seo': {
      const v = value as C['seo'];
      const set = (p: Partial<C['seo']>) => onChange({ ...v, ...p });
      return (
        <div className="grid gap-4">
          <TextField label="Judul halaman" value={v.title} onChange={(title) => set({ title })} softMax={60} />
          <TextField label="Deskripsi" value={v.description} onChange={(description) => set({ description })} multiline rows={3} softMax={160} />
          <ImageField label="Gambar saat dibagikan (opsional)" value={v.ogImage} onChange={(ogImage) => set({ ogImage })} hint="Ukuran ideal 1200×630." />
          <div className="rounded-2xl border border-black/5 bg-white p-4" aria-label="Contoh tampilan di hasil pencarian">
            <p className="text-[12px] text-[#4d5156]">www.fauzansanjaya.dev</p>
            <p className="truncate text-[18px] leading-snug text-[#1a0dab]">{v.title || 'Judul halaman'}</p>
            <p className="line-clamp-2 text-[13px] leading-snug text-[#4d5156]">{v.description}</p>
          </div>
        </div>
      );
    }
  }
}
