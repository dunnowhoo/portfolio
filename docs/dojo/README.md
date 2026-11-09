# Dōjō 道場: dokumen perencanaan

Dōjō adalah halaman pribadi tersembunyi di **fauzansanjaya.dev**. Isinya:

1. **Editor portfolio (CMS).** Konten halaman utama bisa diedit dan ditambah tanpa mengubah kode.
2. **Self-tracker** dua jalur belajar dengan peta bergaya Duolingo, XP, level, dan streak:
   - **日本語**: dari kana sampai JLPT N3 (2 Juli 2028), lalu bahasa Jepang kerja untuk MISUMI (1 Oktober 2028).
   - **DSA**: Data Structures & Algorithms sampai siap coding interview (NeetCode 150 + latihan lanjutan).

Status: **draft v1, 9 November 2026. Belum ada kode yang ditulis.** Dokumen ini dibuat untuk direview dulu sebelum implementasi.

## Urutan baca

| # | Dokumen | Isi |
|---|---|---|
| 1 | [01-PRD.md](01-PRD.md) | Apa yang dibangun dan kenapa. Fitur, kriteria terima, milestone, dan keputusan yang perlu kamu ambil |
| 2 | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | Stack, migrasi ke Next.js, auth slug + login, infrastruktur (Neon, Blob/R2, dll), keamanan, dan biaya |
| 3 | [03-DATA-MODEL.md](03-DATA-MODEL.md) | Skema database (Postgres/Neon), format ID kurikulum, dan event aktivitas |
| 4 | [04-GAMIFICATION.md](04-GAMIFICATION.md) | Aturan XP, level dan sabuk (帯), streak, freeze, lencana, quest, dan Daruma |
| 5 | [05-DESIGN.md](05-DESIGN.md) | UI yang mengikuti desain portfolio: token, layar, peta jalur, dan komponen |
| 6 | [06-ASSETS.md](06-ASSETS.md) | Daftar maskot, banner, dan ikon yang akan di-generate dengan OpenAI, beserta prompt dan pipeline-nya |
| 7 | [curriculum/JP.md](curriculum/JP.md) | Kurikulum 日本語: section, unit, node, sumber, serta target mingguan dan bulanan |
| 8 | [curriculum/DSA.md](curriculum/DSA.md) | Kurikulum DSA: 150 soal inti + 34 ekstra, pola, ide kunci, jadwal, dan target |

## Materi bacaan (ditulis orisinal, dipakai langsung oleh aplikasi)

- `content/dojo/dsa/*.md`: 24 materi DSA, dari fondasi sampai interview playbook. Kode memakai Python.
- `content/dojo/jp/*.md`: 9 materi bahasa Jepang, yaitu cara belajar, kana, grammar N5/N4/N3, kanji N5, strategi JLPT, dan bahasa Jepang kerja.

Setiap file punya *frontmatter* (`id`, `track`, `title`, `estMinutes`, `xp`, `tags`) sehingga bisa langsung dirender di tab **Materi** pada node.

## Ringkasan keputusan yang menunggu jawabanmu

Detailnya ada di PRD §10.

1. Migrasi portfolio ke **Next.js** (rekomendasi) atau tetap Vite.
2. Bahasa latihan DSA: **Python** (rekomendasi, semua materi sudah ditulis dalam Python) atau TypeScript.
3. Penyimpanan gambar CMS: **Vercel Blob** (rekomendasi), Cloudflare R2, atau belum perlu upload.
4. Pengingat email lewat Resend: ya atau tidak. Kalender `.ics` tetap tersedia.
5. Slug dan username kamu tentukan sendiri. Password **tidak pernah dikirim lewat chat**; kamu meng-hash-nya sendiri dengan script.
