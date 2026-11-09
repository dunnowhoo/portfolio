# Arsitektur Dōjō

Status: Draft v1 · 9 November 2026 · Baca PRD dulu: [01-PRD.md](01-PRD.md)

---

## 1. Kondisi sekarang

| Aspek | Sekarang |
|---|---|
| Framework | Vite 6 + React 19 SPA (`App.tsx`, 10 komponen, ±1.700 baris) |
| Konten | Ditulis langsung di kode: `constants.tsx` (tech stack, organisasi, prestasi, pengalaman, 17 proyek) dan `Hero.tsx` (nama, judul, sosial, pendidikan) |
| Styling | **Tailwind lewat CDN script** (`cdn.tailwindcss.com`) + `importmap` ke esm.sh di `index.html`, plus CSS kustom `.glass-card`, `.glass-nav`, `.bento-hover` |
| Hosting | Vercel (`www.fauzansanjaya.dev`, region sin1). Belum ada backend maupun database |
| Catatan keamanan | `vite.config.ts` menyuntikkan `GEMINI_API_KEY` ke bundle browser lewat `define`. Isinya sekarang placeholder AI Studio, jadi aman, tapi pola ini akan membocorkan key asli kalau suatu saat diisi. **Dihapus saat migrasi.** |

## 2. Pilihan arsitektur

### Opsi A: tetap Vite + Vercel Functions (`/api/*.ts`)
- **Kelebihan:**
  - perubahan pada situs publik paling kecil.
- **Kekurangan:**
  - router dan kode dashboard ikut dimuat di bundle SPA, dan pengecekan slug terjadi di browser;
  - konten CMS di-fetch di browser, sehingga SEO dan LCP tidak membaik;
  - tidak ada render server, *cache tag*, maupun Server Actions;
  - perlu `vercel dev` untuk menjalankan API lokal;
  - Tailwind CDN tetap ada kecuali dimigrasi juga.

### Opsi B: migrasi ke Next.js 16 App Router (**rekomendasi**)
- **Kelebihan:**
  - slug dan sesi dicek **di server** sebelum ada HTML atau JS dashboard yang terkirim;
  - halaman publik dirender di server dari konten CMS, sehingga SEO dan LCP lebih baik daripada sekarang;
  - Server Actions untuk semua mutasi;
  - *route handler* untuk cron dan `.ics`;
  - Tailwind build menggantikan CDN;
  - `next/font` dan `next/image`.
- **Kekurangan:**
  - ada pekerjaan migrasi. Tapi kodenya kecil, komponennya sudah React, dan risikonya bisa dikontrol dengan perbandingan screenshot.

**Keputusan yang diusulkan: Opsi B.** Langkah migrasinya ada di §15.

## 3. Stack target

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | Runtime Node.js (Fluid Compute), bukan Edge |
| Styling | Tailwind CSS v4 (build) | Token disalin dari config CDN sekarang, lihat [05-DESIGN §2](05-DESIGN.md) |
| Ikon | Material Symbols Outlined | Sama dengan portfolio |
| Animasi | `motion` (Framer Motion) | Menghormati `prefers-reduced-motion` |
| Database | **Neon Postgres** (lewat Vercel Marketplace) | `DATABASE_URL` otomatis masuk ke env Vercel |
| ORM dan migrasi | Drizzle ORM + drizzle-kit | Driver `@neondatabase/serverless` (mendukung transaksi) |
| Validasi | zod | Untuk semua input Server Action dan skema konten CMS |
| Auth | Buatan sendiri: argon2id (`@node-rs/argon2`) + sesi di DB | Satu pengguna, jadi library auth penuh tidak perlu |
| Markdown | unified: remark-gfm → rehype → Shiki | MD di `content/dojo/**`, dirender di server |
| Upload gambar | **Vercel Blob** (alternatif: Cloudflare R2) | Upload langsung dari browser dengan token sementara |
| Email (opsional) | Resend + React Email | Pengingat streak, war JLPT, dan rekap mingguan |
| Cron | Vercel Cron (1× sehari) | `/api/cron/daily` |
| Tes | Vitest (engine), Playwright (smoke e2e + perbandingan visual) | |
| Aset AI | Script lokal + OpenAI Images API | Tidak pernah dijalankan di server, lihat §10 |

Versi persis dipasang (*pinned*) saat implementasi.

## 4. Struktur folder

```
app/
  (site)/
    layout.tsx               Metadata publik, font, globals
    page.tsx                 Portfolio, membaca konten "published" dari DB (dengan cache)
  [gate]/
    layout.tsx               ① slug cocok? kalau tidak → notFound()  ② header noindex
    page.tsx                 Login (atau redirect ke /beranda kalau sesi aktif)
    (dojo)/
      layout.tsx             Cek sesi → redirect ke login. Shell: nav pill/tab bar
      beranda/page.tsx
      nihongo/page.tsx       Peta jalur; panel node dibuka lewat ?node=ID (bisa di-bookmark)
      dsa/page.tsx
      hari-ini/page.tsx
      review/page.tsx
      target/page.tsx
      kalender/page.tsx
      materi/[[...slug]]/page.tsx
      profil/page.tsx
      cms/[[...section]]/page.tsx
      pengaturan/page.tsx
  api/
    cron/daily/route.ts      Pengingat + pembersihan (Bearer CRON_SECRET)
    dojo/cal/[token]/route.ts  Feed kalender .ics
    dojo/upload/route.ts     Token upload Blob (butuh sesi)
    dojo/export/route.ts     Ekspor JSON (butuh sesi)
  not-found.tsx              404 biasa untuk semua path asing
components/
  site/                      Port 1:1 dari components/* portfolio
  dojo/                      PathMap, NodeSheet, StreakCard, Heatmap, XPBar, ...
content/dojo/{dsa,jp}/*.md   Materi (sudah ditulis)
curriculum/{jp,dsa}.ts       Data jalur (diturunkan dari docs/dojo/curriculum/*.md)
db/schema.ts · db/client.ts · drizzle/  (migrasi SQL)
lib/
  auth/                      gate.ts, password.ts, session.ts, rate-limit.ts
  engine/                    xp.ts, level.ts, streak.ts, srs.ts, shuffle.ts, pace.ts, goals.ts, badges.ts
  content/                   load-md.ts, render-md.ts
  site-content/              schema.ts (zod), seed.ts, get-published.ts
  time.ts                    Tanggal lokal dari zona waktu dan jam pergantian hari
scripts/
  hash-password.ts           Meminta password di terminal → mencetak hash argon2id
  seed-site-content.ts       constants.tsx + Hero → tabel site_section
  seed-dojo.ts               Profil awal, sesi JLPT, countdown, Daruma, template target
  generate-assets.ts         OpenAI → public/dojo/*.webp
public/dojo/                 Maskot, banner, lencana (hasil generate)
docs/dojo/                   Dokumen ini
```

**Kenapa `[gate]` aman:**
- Segmen dinamis di root menangkap semua path yang tidak dikenali.
- `layout.tsx`-nya membandingkan `params.gate` dengan `DASHBOARD_SLUG` memakai `timingSafeEqual`. Kalau tidak cocok, `notFound()` dipanggil, sehingga path asing mendapat 404 yang sama persis dengan 404 biasa.
- Route statis (`/`, `/api/...`, file di `public/`) tetap diprioritaskan oleh router Next.
- Kode JS dashboard hanya dikirim setelah slug cocok dan sesi valid.

## 5. Alur auth

```
Browser                         Server (Next.js, Node)                     Neon
  │ GET /{slug}                    │                                          │
  │───────────────────────────────▶│ gate: slug == env? (constant-time)       │
  │                                │   tidak → 404                            │
  │                                │ cookie __Host-dojo ada? → cek sesi ──────▶│ session (hash token)
  │◀── form login ─────────────────│                                          │
  │ POST (Server Action) user+pass │                                          │
  │───────────────────────────────▶│ rate-limit (login_attempt) ──────────────▶│
  │                                │ argon2id.verify(ADMIN_PASSWORD_HASH)     │
  │                                │ username == ADMIN_USERNAME (const-time)  │
  │                                │ token = 32 byte acak; simpan sha256 ─────▶│ session
  │◀── Set-Cookie __Host-dojo ─────│   (httpOnly, Secure, SameSite=Strict,    │
  │    redirect /{slug}/beranda    │    Path=/, Max-Age 30 hari)              │
```

- Prefix `__Host-` memaksa cookie `Secure`, tanpa `Domain`, dan `Path=/`, sehingga tidak bisa ditimpa subdomain lain.
- Sesi diperpanjang (*rolling*) kalau sisa umurnya < 15 hari. `last_seen_at` diperbarui paling sering 1× per jam.
- Semua Server Action Dōjō memanggil `requireSession()` di baris pertama. Next juga membandingkan `Origin` dengan `Host` pada Server Action, yang menjadi perlindungan CSRF ditambah `SameSite=Strict`.
- Password **tidak pernah lewat chat atau repo.** Pemilik menjalankan `npm run hash-password` di terminalnya sendiri lalu menempel hasilnya ke env Vercel.
- **Fase 2 (opsional):** TOTP 2FA dengan aplikasi authenticator.

## 6. Engine: fungsi murni yang bisa dites

Semua logika gamifikasi ada di `lib/engine/` sebagai fungsi murni, tanpa I/O, dan dites dengan Vitest. Server Action hanya memanggil engine lalu menyimpan hasilnya.

| Modul | Fungsi utama | Detail |
|---|---|---|
| `xp.ts` | `xpFor(event)` | Tabel di GAMIFICATION §2. Mencegah XP ganda (node yang sama, check-in di hari yang sama) |
| `level.ts` | `levelFromXp(total)`, `beltForLevel(L)` | XP untuk naik dari L ke L+1 = `90·L`; total ke L = `45·L·(L−1)` |
| `streak.ts` | `computeStreak(dailyStats, freezes, busyDays, repairs, today)` | Dihitung ulang dari `daily_stat` (paling banyak ±1.000 baris, murah) |
| `srs.ts` | `schedule(card, grade, today)` | Varian SM-2, lihat GAMIFICATION §7 |
| `shuffle.ts` | `dailySet(track, date, state)` | PRNG `mulberry32(hash(date+track))`, sehingga hasilnya deterministik |
| `pace.ts` | `pace(track, today, progress)` | Membandingkan node selesai dengan node yang dijadwalkan sampai hari ini |
| `goals.ts` | `progressFor(goal, events)` | Metrik otomatis dari event |
| `badges.ts` | `newBadges(state, event)` | Aturan lencana di GAMIFICATION §5 |

**Penulisan event:** setiap aksi membuat satu baris di `activity_event` dan memperbarui `daily_stat` serta `streak_state` dalam **satu transaksi**. Kalau ada bug, `scripts/recompute.ts` bisa membangun ulang semua turunan dari log event.

**Tanggal lokal:**
- `local_date` dihitung saat menulis event dari `profile.timezone` dan `profile.day_start_hour`.
- Contoh: dengan jam pergantian 03:00, aktivitas pukul 01:30 WIB tanggal 10 Nov dicatat sebagai 9 Nov.
- Pindah ke JST tidak mengubah tanggal event yang sudah tersimpan.

## 7. Data, cache, dan render

- **Dōjō:**
  - Server Components membaca DB langsung dengan Drizzle;
  - mutasi lewat Server Actions + `useOptimistic`, sehingga centang dan animasi XP terasa instan;
  - halaman Dōjō selalu dinamis, tidak di-cache.
- **Portfolio publik:**
  - membaca `site_section.published` dengan cache bertag `site-content`;
  - "Terbitkan" di CMS menginvalidasi tag itu, sehingga konten baru tampil tanpa deploy. Next 16 menyediakan `'use cache'`, `cacheTag`, dan `updateTag`/`revalidateTag`; API persisnya dicek saat implementasi;
  - **fallback:** kalau DB tidak bisa diakses, `page.tsx` memakai `lib/site-content/snapshot.json` (salinan konten terakhir yang dibuat saat build), sehingga situs publik tidak pernah kosong.
- **Kurikulum dan materi** ada di repo (bukan DB), jadi bisa direview lewat git. Progres disimpan di DB dan dikaitkan lewat **ID node yang stabil** (lihat [03-DATA-MODEL §2](03-DATA-MODEL.md)).

## 8. Alur CMS

```
Edit form ──zod──▶ saveDraft(section)         → site_section.draft (+ draft_updated_at)
Preview      ◀──── komponen site/* dirender dengan data draf (hanya di Dōjō)
Terbitkan    ────▶ publish(section)           → published = draft, version++
                                              → site_revision (snapshot)
                                              → invalidasi tag 'site-content'
Pulihkan     ────▶ restoreRevision(id)        → draft = snapshot (lalu terbitkan)
```

- **Upload gambar:**
  - di browser: kompres ke WebP (sisi terpanjang ≤ 1.600 px, kualitas 0,82);
  - minta token ke `/api/dojo/upload` (butuh sesi);
  - unggah langsung ke Blob;
  - simpan URL dan metadata di `media_asset`.
- **Seed awal:** `scripts/seed-site-content.ts` membaca data dari `constants.tsx` dan `Hero.tsx`, memvalidasinya dengan skema zod, lalu menulis draft + published versi 1.

## 9. Pengingat

| Kanal | Kapan | Isi |
|---|---|---|
| Banner Dōjō | Selalu, dihitung saat render | Streak berisiko, war JLPT, target hampir lewat |
| Email (Resend, opsional) | Cron harian **11:00 UTC** (18:00 WIB / 20:00 JST) | ① streak berisiko kalau ambang hari ini belum tercapai ② war JLPT: H-14, H-7, H-1 sebelum buka, hari buka, H-1 sebelum tutup ③ rekap mingguan setiap Minggu |
| Kalender `.ics` | Diimpor sekali atau dilanggan (URL berisi token rahasia) | Tanggal ujian, buka/tutup pendaftaran, MISUMI Day 1, countdown kustom, dengan **alarm (VALARM)** |

- Cron Vercel paket Hobby hanya berjalan sekali sehari dan jamnya tidak presisi. Karena itu alarm "tepat jam buka pendaftaran" diserahkan ke **kalender HP**, sedangkan email cron berfungsi sebagai pengingat malam sebelumnya.
- **Idempoten:** setiap pengingat dicatat di `reminder_log (kind, ref_id, for_date)` dengan *unique constraint*, sehingga tidak ada pengingat ganda.
- Cron juga membersihkan `login_attempt` yang lebih tua dari 7 hari dan sesi yang kedaluwarsa.

## 10. Pipeline aset AI (lokal, sekali jalan)

```
docs/dojo/06-ASSETS.md ──▶ scripts/assets.manifest.json (id, prompt, ukuran, referensi)
                           │
npm run assets:generate ───┤ baca OPENAI_API_KEY dari .env.local (TIDAK di Vercel)
                           │ 1) generate maskot master  2) varian via image edit + referensi master
                           ▼
                     tmp/assets/*.png ──sharp──▶ public/dojo/*.webp (+ ukuran @1x/@2x)
```

- Model gambar terbaru dipilih saat implementasi. Beberapa model lama sudah atau akan pensiun pada 2026, jadi daftar model dicek lewat API dulu.
- Kalau model tidak mendukung latar transparan, latar dihapus dengan *remove background* (Canva atau `rembg` lokal).
- **Key OpenAI:**
  - kamu yang menaruhnya di `.env.local` (sudah di-gitignore lewat `*.local`);
  - tidak masuk ke repo, tidak ke env Vercel, dan tidak ke bundle;
  - setelah aset selesai, **rotate key** di platform.openai.com karena key sudah pernah ditempel di chat.

## 11. Checklist keamanan

- [ ] Slug ≥ 16 karakter acak dari env; dibandingkan constant-time; tidak pernah muncul di HTML publik, sitemap, robots.txt, atau log.
- [ ] Password argon2id (memoryCost ≥ 19 MiB, timeCost ≥ 2); username dibandingkan constant-time.
- [ ] Rate limit login per IP dan global, dengan pesan error yang sama untuk username atau password salah.
- [ ] Cookie `__Host-dojo` (httpOnly, Secure, SameSite=Strict); token disimpan sebagai hash SHA-256; ada "logout semua".
- [ ] `requireSession()` di setiap Server Action dan route handler Dōjō.
- [ ] Header Dōjō: `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, CSP `frame-src https://www.youtube-nocookie.com`.
- [ ] `/api/cron/*` hanya menerima `Authorization: Bearer ${CRON_SECRET}`.
- [ ] URL feed `.ics` memakai token acak terpisah dan bisa di-rotate.
- [ ] Input divalidasi zod di server; konten CMS dirender sebagai teks atau MD tersanitasi di halaman publik.
- [ ] Tidak ada secret dengan prefix `NEXT_PUBLIC_`; `define` GEMINI di `vite.config.ts` dihapus.
- [ ] Upload: hanya `image/*`, ≤ 5 MB, nama file acak.

## 12. Environment variables

| Nama | Lingkungan | Isi |
|---|---|---|
| `DATABASE_URL` | Vercel (otomatis dari Neon) + `.env.local` | Koneksi Postgres |
| `DASHBOARD_SLUG` | Vercel | Slug rahasia |
| `ADMIN_USERNAME` | Vercel | Username |
| `ADMIN_PASSWORD_HASH` | Vercel | Hash argon2id dari `npm run hash-password` |
| `CRON_SECRET` | Vercel | Untuk `/api/cron/*` |
| `CALENDAR_FEED_TOKEN` | Vercel | Token URL `.ics` |
| `BLOB_READ_WRITE_TOKEN` | Vercel (otomatis dari Blob) | Upload gambar |
| `RESEND_API_KEY`, `REMINDER_EMAIL_TO`, `REMINDER_EMAIL_FROM` | Vercel (opsional) | Email pengingat |
| `OPENAI_API_KEY` | **Hanya `.env.local`** | Generate aset, lalu di-rotate |

## 13. Infrastruktur dan biaya

| Layanan | Perlu? | Dipakai untuk | Biaya |
|---|---|---|---|
| Vercel (Hobby) | Ya, sudah dipakai | Hosting, Functions, Cron | Gratis |
| **Neon Postgres** | **Ya** | Semua data Dōjō + konten CMS + sesi | Free plan cukup; data kita hanya ribuan baris |
| **Vercel Blob** | Disarankan (untuk upload di CMS) | Foto, gambar proyek, OG image | Free tier cukup untuk ratusan gambar |
| Cloudflare R2 | Alternatif Blob, tidak dua-duanya | Sama dengan Blob | Free tier; egress gratis |
| Resend | Opsional | Email pengingat | Free tier cukup (beberapa email per hari) |
| OpenAI Images | Sekali, lokal | ±40 aset maskot, banner, dan lencana | Perkiraan ±US$1–6 total, tergantung model dan kualitas |
| Upstash Redis | **Tidak perlu** | Rate limit cukup di Postgres | Tidak ada |

**Jawaban singkat untuk "perlu Neon, R2, dll?":**
- **Neon perlu.**
- **R2 tidak wajib.** Pakai Vercel Blob kalau ingin upload gambar dari CMS. Aset maskot disimpan di repo.
- **Resend opsional.**
- **Redis tidak perlu.**

Integrasi Neon dan Blob dipasang lewat Vercel Marketplace/Storage saat M1, supaya env-nya otomatis.

## 14. Kualitas dan tes

- **Vitest untuk engine:**
  - streak (lintas zona waktu, freeze, repair, mode sibuk, jam pergantian hari);
  - level/sabuk;
  - SRS;
  - shuffle (deterministik per tanggal);
  - pace.
- **Playwright:**
  - smoke login → selesaikan node → XP bertambah;
  - path asing → 404;
  - **perbandingan visual portfolio** sebelum dan sesudah migrasi (1440 px dan 390 px).
- Lint dan typecheck di CI (GitHub Actions) sebelum merge.

## 15. Rencana migrasi M0 (Vite → Next.js)

1. Buat branch `feat/dojo-m0-nextjs`. Ambil screenshot produksi sekarang sebagai acuan (1440 px dan 390 px).
2. Pasang Next 16 + Tailwind v4.
   - Pindahkan token dari `tailwind.config` CDN ke `@theme`.
   - Pindahkan CSS `.glass-*` dan `.bento-hover` ke `app/globals.css`.
3. Pindahkan `components/*` ke `components/site/*`.
   - Komponen interaktif diberi `'use client'`: Navbar (scroll spy), Projects (filter + modal), Spotify (iFrame API), dan Contact (mailto).
4. `App.tsx` → `app/(site)/page.tsx`; meta di `index.html` → `export const metadata`; Inter → `next/font`.
5. Hapus `vite.config.ts`, `index.html`, `importmap`, dan `define` GEMINI. Hapus `dist/` dari repo kalau ikut ter-commit.
6. Bandingkan screenshot preview dengan acuan. Selisih harus ≈ 0 (font rendering boleh sedikit beda).
7. Deploy preview → cek → merge. Framework project di Vercel otomatis terdeteksi Next.js.

---

## 16. Catatan implementasi M0–M1 (9 November 2026)

Perubahan dari rencana awal di atas:

| Rencana | Yang dipakai | Alasan |
|---|---|---|
| Vercel Blob / Cloudflare R2 | **Neon Object Storage**, bucket `assets` (private) | Permintaan pemilik. Satu backend dengan Postgres, dan ikut bercabang bersama database |
| Driver `@neondatabase/serverless` | **`pg` (node-postgres) + `attachDatabasePool`** dari `@vercel/functions`, koneksi pooled | Rekomendasi skill `neon-postgres` untuk Vercel Fluid Compute. Migrasi memakai `DATABASE_URL_UNPOOLED` |
| Vercel Cron | **Neon Functions** (fungsi `hello` sudah ter-deploy, jadwal cron menyusul di M3/M5) | Neon Function Triggers mendukung cron, dan paket Hobby Vercel hanya 1× sehari |
| Tailwind v4 | **Tailwind v3.4** | Supaya hasil render identik dengan Tailwind CDN lama (v3) |
| `next/font` | `@import` Google Fonts di baris paling atas `app/globals.css` | Urutan CSS harus sama dengan situs lama. Kalau tidak, `.material-symbols-outlined` mengalahkan `text-[14px]` |
| Pintu masuk lewat slug | **Mata kanan Daruma** di banner (klik 3× / tekan lama) membuka form login. Slug baru dikirim server setelah login berhasil | Permintaan pemilik. Slug tidak pernah ada di HTML publik |
| `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` | `AUTH_SECRET`, `ADMIN_PASSWORD_HASH_B64` (base64) | Karakter `$` di hash argon2 bisa diekspansi oleh loader `.env` |

**Temuan keamanan saat uji E2E:**
- Next.js merender layout dan page **secara paralel**. Akibatnya `notFound()`/`redirect()` di layout tidak mencegah page ikut dirender, dan payload RSC halaman Beranda sempat ikut terkirim untuk `/<slug-salah>/beranda`.
- Diperbaiki dengan dua lapis:
  1. `proxy.ts`: sub-path di bawah slug yang salah di-rewrite ke 404, dan path di bawah slug yang benar wajib membawa cookie sesi.
  2. `requireDojo(gate)` (`lib/dojo/dal.ts`) dipanggil di **setiap** page sebelum mengambil data.
- **Aturan untuk M2 ke atas:** setiap page dan Server Action Dōjō baru wajib memanggil `requireDojo()` di baris pertama.

**Env yang dipakai:**
- Diisi oleh `neon deploy`/`neon env pull`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`.
- **Di Vercel**, kredensial storage disimpan sebagai `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_ENDPOINT`, dan `STORAGE_REGION`, karena nama `AWS_*` dipakai runtime Vercel sendiri. `lib/storage.ts` memakai `STORAGE_*` dulu, lalu fallback ke `AWS_*` di lokal.
- `DATABASE_URL_UNPOOLED` tidak dipasang di Vercel; hanya dipakai untuk migrasi dari laptop.
- Diisi oleh `npm run setup:secrets`: `DASHBOARD_SLUG`, `AUTH_SECRET`, `CRON_SECRET`.
- Diisi oleh `npm run hash-password`: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH_B64`.
