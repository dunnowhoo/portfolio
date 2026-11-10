# Desain UI Dōjō

Status: Draft v1 · 9 November 2026
Acuan: tampilan live `www.fauzansanjaya.dev` (screenshot 9 Nov 2026) dan `index.html` portfolio.

## 1. Arah desain

Dōjō harus terasa seperti **ruangan lain di rumah yang sama** dengan portfolio:
- latar abu Apple `#f5f5f7`;
- kartu kaca putih berpojok besar;
- font Inter;
- biru `#0066cc`;
- tombol pill;
- label kecil huruf kapital berjarak;
- ikon di dalam lingkaran putih;
- grid bento.

Yang ditambahkan hanya tiga hal:
1. **Warna jalur:** 朱 merah-vermilion untuk 日本語 dan biru portfolio untuk DSA.
2. **Maskot Daru** (Daruma kecil berikat kepala) sebagai karakter yang memberi semangat.
3. **Detail khas Jepang** yang tetap tenang: papan nama stasiun (駅名標) sebagai header unit, sabuk 帯 sebagai level, dan Daruma sebagai target.

Yang **dihindari:** warna neon, kartu gelap ramai, dan efek berlebihan. Dōjō dipakai setiap hari, jadi harus tenang dan cepat dibaca.

## 2. Token

Token di bawah disalin dari config Tailwind CDN dan CSS portfolio. Di Tailwind v4 semuanya ditulis di `@theme`.

> **Ikon di wireframe.** Sejak revamp ikon (10 November 2026) UI tidak memakai emoji. Wireframe di bawah memakai kode dua huruf untuk ikon ilustrasi (`lib/dojo/icons.ts`): `o-` lihat, `fl` streak, `!!` !, `fz` freeze, `pd` panduan, `ir` Irodori, `mt` materi, `vd` video, `kj` kanji, `lk` terkunci, `ak` Anki, `cp` checkpoint, `tm` timer, `rm` hapus, `lt` latihan, `bs` boss, `rf` refleksi, `dl` Duolingo. Glyph kecil (centang, bintang, panah) memakai Material Symbols.

```css
@theme {
  /* dari portfolio */
  --color-primary: #0066cc;          /* Apple Blue, juga warna jalur DSA */
  --color-primary-hover: #0077ed;
  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-text-main: #1d1d1f;
  --color-text-secondary: #86868b;
  --color-line: #e5e5ea;             /* gray-200 ala Apple */
  --radius-lg: 0.75rem; --radius-xl: 1.25rem; --radius-2xl: 1.75rem; --radius-3xl: 1.5rem;
  --shadow-soft: 0 4px 24px rgba(0,0,0,.04);
  --shadow-hover: 0 12px 32px rgba(0,0,0,.08);
  --font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-jp: "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;   /* teks Jepang */
  --font-mono: "SF Mono", "JetBrains Mono", ui-monospace, monospace;     /* kode, angka countdown */

  /* tambahan Dōjō, mengikuti warna sistem Apple supaya serasi */
  --color-jp: #e8453c;               /* 朱 vermilion: jalur 日本語, Daru */
  --color-jp-soft: #fdecea;
  --color-dsa: #0066cc;              /* biru portfolio: jalur DSA */
  --color-dsa-soft: #e6f0fa;
  --color-flame: #ff9500;            /* streak */
  --color-xp: #ffb800;               /* XP dan bintang */
  --color-ok: #34c759;               /* selesai/aman */
  --color-ice: #32ade6;              /* freeze */
  --color-locked: #d1d1d6;
}
```

- **Kelas komponen yang dipakai ulang:** `.glass-card`, `.glass-card-strong`, `.glass-nav`, dan `.bento-hover` (dari `index.html`). Di Dōjō `.bento-hover` hanya dipakai untuk kartu yang bisa diklik, bukan semua kartu.
- **Skala tipografi:**
  - judul halaman 32/40 bold;
  - judul kartu 20/28 semibold;
  - isi 15/24;
  - label 11 px uppercase, tracking 0,08em, abu `#86868b`;
  - angka besar (streak, countdown) 40–56 px **tabular-nums**.
- **Teks Jepang** selalu memakai `--font-jp` dan `lang="ja"` supaya glyph kanji benar.
- Mode terang menjadi default, sama seperti portfolio. Mode gelap direncanakan di fase 2, dengan token sudah disiapkan berpasangan.

## 3. Navigasi

- **Desktop (≥ 768 px):** pill melayang di atas, sama seperti navbar portfolio.
  - Ikon: Beranda · 日本語 · DSA · Hari ini · Target · Kalender · Profil · ⋯ (Materi, Review, CMS, Pengaturan).
  - Item aktif berupa pill biru muda dengan label, sama seperti tombol "Profile" di portfolio.
- **HP (< 768 px):** tab bar bawah berisi 5 item (Beranda, 日本語, DSA, Hari ini, Profil) dengan *safe-area inset*. Menu lain ada di sheet ⋯.
- **Chip streak di kanan atas nav** ([streak]12 · [streak]8). Bisa diklik dan selalu terlihat dari halaman mana pun.

## 4. Layar

### 4.1 Login `/{slug}`
```
┌──────────────────────── #f5f5f7 ────────────────────────┐
│                 ┌────── glass-card-strong ─────┐        │
│                 │   [Daru mengintip di atas]   │        │
│                 │   道場 · Dōjō                │        │
│                 │   Username  [____________]   │        │
│                 │   Password  [____________]o- │        │
│                 │   ( Masuk → )  pill biru     │        │
│                 │   pesan error abu, 1 baris   │        │
│                 └──────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```
Tidak ada "lupa password", "daftar", atau link apa pun ke luar.

### 4.2 Beranda (grid bento 6 kolom, mengikuti portfolio)
```
┌ nav pill ─────────────────────────────────────────────────────────────┐
[!] Banner WAR JLPT (hanya muncul H-7 s.d. tutup pendaftaran) ─ full width
┌──────── Hero sapaan (col 4) ───────────────┐ ┌─ Daru + sabuk (col 2) ─┐
│ LABEL: SELASA · 10 NOV                     │ │  ilustrasi maskot      │
│ こんばんは、Fauzan                         │ │  sabuk = warna level   │
│ Lv 12 · 橙帯 修行者   [=======---] 62%     │ │  "Lv 12 · 修行者"       │
│ Hari ini: 日本語 32/50 · DSA 0/30          │ └────────────────────────┘
│ ( Lanjut 日本語 ) ( Lanjut DSA )           │
└────────────────────────────────────────────┘
┌ Streak 日本語 (2) ┐┌ Streak DSA (2) ┐┌ MISUMI (1) ┐┌ JLPT (1) ┐
│ fl 12 hari  ✓     ││ fl 8  !! berisiko││ D-691      ││ D-237    │
│ fzfz  sisa 5j 12m ││ fz   ( Mulai ) ││ ▓▓░░ 1%    ││ N5·perk. │
└───────────────────┘└────────────────┘└────────────┘└──────────┘
┌──── Hari ini (col 3) ─────────┐ ┌──── Target minggu ini (col 3) ───┐
│ 3 quest + item shuffle + ring │ │ ring per target + bar bulanan    │
└───────────────────────────────┘ └──────────────────────────────────┘
┌──────────────────── Heatmap 52 minggu (col 6) ───────────────────────┐
│ [Gabungan | 日本語 | DSA]   ░▒▓█ ...                                │
└──────────────────────────────────────────────────────────────────────┘
┌ Pace (col 2) ┐ ┌ Lencana terbaru (col 2) ┐ ┌ Rak Daruma (col 2) ┐
```
Di HP semuanya menjadi satu kolom dengan urutan: banner → hero → streak (2 kolom kecil) → countdown → hari ini → target → heatmap (gulir horizontal) → sisanya.

### 4.3 Peta jalur `/nihongo` dan `/dsa`
```
┌ Header section ───────────────────────────────────────────────┐
│ SECTION 1 · N5   入門 → 初級1    ▓▓▓▓░░░░ 34%   Tepat waktu ✓ │
│ [banner section bergambar]   Target ujian: 4 Jul 2027 (D-237) │
└───────────────────────────────────────────────────────────────┘
        ┌── Papan stasiun (header unit) 駅名標 ──────┐
        │  ◀ はじめまして         好きなもの ▶       │
        │        じぶんのこと                         │
        │    About Myself · Unit 1.2 · 2/7 ✓          │
        │   ( pd Panduan unit )                        │
        └─────────────────────────────────────────────┘
                     ●  ir Irodori L3       ✓ ★★
                         ●  mt Grammar G05–G08  ✓ ★
                              ◉  vd Video は vs が   ← MULAI (berdenyut)
   - - - - - - - - - - - - - - - - - - - - - - -  "seharusnya di sini hari ini"
                         ○  kj Kanji batch 2   lk
                     ○  ak Kaishi 250       lk
                 ⬢  cp Checkpoint 1.2      lk
```
- **Node:** lingkaran 72 px (HP 64 px) dengan jarak vertikal 96 px. Offset horizontal mengikuti pola sinus `[0, 56, 84, 56, 0, −56, −84, −56]` px.
- **Warna status:**
  - terkunci: `--color-locked` + ikon gembok;
  - tersedia: warna jalur + cincin berdenyut + gelembung "MULAI";
  - berjalan: cincin progres;
  - selesai: isi warna jalur + centang;
  - dikuasai: bintang emas di bawah node (★–★★★);
  - perlu review: titik oranye di kanan atas.
- **Bentuk tipe:** checkpoint berupa segi enam, boss lebih besar (88 px) dengan mahkota, milestone berupa bendera dengan countdown kecil.
- Jalur antar-node digambar sebagai **garis rel** tipis putus-putus warna jalur (SVG), bukan garis tebal. Ini menyambung dengan tema stasiun.
- **Papan stasiun** meniru gaya umum 駅名標: nama unit besar dalam bahasa Jepang, romaji atau Indonesia di bawahnya, unit sebelumnya dan sesudahnya di kiri-kanan, garis warna jalur di bawah. Gaya ini umum dan tidak memakai logo operator kereta mana pun.
- **Garis pace** berupa garis putus-putus horizontal bertuliskan "Seharusnya di sini hari ini".
- **Tombol mengambang "Lanjutkan ↓"** muncul kalau node aktif tidak terlihat di layar.
- **Desktop ≥ 1200 px:** panel samping kanan yang *sticky* berisi streak jalur, daily goal, target minggu ini, countdown ujian, dan "Hari ini" jalur itu.

### 4.4 Panel node (sheet)
- Desktop: panel kanan selebar 560 px. HP: *bottom sheet* 92% tinggi layar.
```
┌ vd  Video: Partikel は dan が                 ✕ ┐
│ 12 mnt · +10 XP · target 14 Des                  │
│ [Materi] [Video] [Latihan] [Sumber] [Catatan]    │
│ ┌───────────── youtube-nocookie 16:9 ──────────┐ │
│ └──────────────────────────────────────────────┘ │
│ tm 00:12:41  (Jeda)        + catat menit         │
│ ──────────────────────────────────────────────── │
│ Seberapa yakin?  (Lupa)(Sulit)(Baik)(Mudah)       │
│ (        Tandai selesai  +10 XP        )  biru   │
└──────────────────────────────────────────────────┘
```
- **Tab Latihan (DSA):** satu baris per soal berisi chip difficulty, judul, pola, status, waktu terbaik, tombol "LeetCode ↗" dan "NeetCode ↗", serta tombol "Catat percobaan" (menit, hint?, link submission, rating).

### 4.5 Hari ini
- Dua kolom di desktop (日本語 | DSA), tab di HP.
- Item ditampilkan sebagai checklist kartu.
- Tombol **"Mulai sprint"** membuka **kuis layar penuh**:
  - kartu besar di tengah, input romaji/arti (atau pilihan ganda);
  - timer di atas, progres 1/20;
  - umpan balik hijau/merah dengan jawaban;
  - layar hasil menampilkan akurasi, waktu, XP, dan kartu yang salah.
- **Tebak Pola:** ringkasan soal di kartu, 4 tombol pola, lalu penjelasan singkat "Kenapa: …" setelah menjawab.

### 4.6 Profil
- Hero berisi avatar Daru bersabuk, nama, level, gelar, dan total XP.
- Statistik dalam kartu: jam, soal per difficulty (donut), kana/kanji, Irodori per jilid (bar), dan akurasi.
- Heatmap tahunan dengan pemilih tahun.
- **Rak Daruma:** Daruma berjajar dengan mata kosong, satu, atau dua. Hover menampilkan target dan tanggal.
- Galeri lencana dalam grid 6 kolom. Lencana terkunci tampil abu-abu beserta syaratnya.

### 4.7 Kalender
- **Kartu countdown** besar: MISUMI, ujian JLPT berikutnya, dan pendaftaran berikutnya.
- **Tabel sesi JLPT** bisa diedit: tanggal, level, kota, buka/tutup pendaftaran, status, dan badge "perkiraan".
- **Pengingat:** daftar jadwal kirim, toggle email, tombol "Unduh .ics", dan tombol "Salin URL langganan".
- **Checklist war** (disunting sendiri):
  - akun jlptonline siap;
  - dokumen sesuai syarat terbaru;
  - foto sesuai ketentuan;
  - metode bayar;
  - pilihan kota cadangan;
  - alarm HP H-0.

### 4.8 CMS `/cms`
```
┌ Sidebar bagian ─────┐ ┌ Editor ───────────────────────────────┐ ┌ Preview ───────────┐
│ Profil          ●   │ │ PROYEK · 17 item      (+ Tambah)       │ │ komponen asli      │
│ Sosial              │ │ ≡ DKE Smart Sales & CRM   Web   o- ✎ ⧉ rm│ │ portfolio dengan   │
│ Pendidikan          │ │ ≡ Saka                    Mobile o- ✎ ⧉ rm│ │ data draf          │
│ Pengalaman          │ │ ...                                    │ │ (lebar 390/1440)   │
│ Organisasi          │ │ ── form item terpilih ──               │ │                    │
│ Prestasi            │ │ Judul / Deskripsi / Kategori / Tech    │ │                    │
│ Tech stack          │ │ Gambar utama [drop zone] + galeri      │ │                    │
│ Proyek          ●   │ │ Link (+)  Embed                        │ │                    │
│ Spotify             │ │                                        │ │                    │
│ Kontak · SEO        │ │ (Simpan draf)  (Terbitkan) biru        │ │                    │
└─────────────────────┘ └────────────────────────────────────────┘ └────────────────────┘
```
- Titik ● menandai bagian yang punya draf belum terbit.
- "Riwayat" membuka daftar versi dengan tombol Pulihkan.
- Di HP: daftar bagian → editor → preview sebagai tab.

## 5. Komponen inti

| Komponen | Deskripsi |
|---|---|
| `StreakCard` | Api (SVG animasi ringan), angka streak tabular, status, sisa jam, ikon freeze |
| `XPBar` | Badge level dengan warna sabuk + bar progres + "1.240 / 1.980 XP" |
| `CountdownCard` | Label, angka "D-xxx" mono, tanggal, bar progres sejak titik mulai, badge "perkiraan" |
| `GoalRing` | Ring SVG per target; warna jalur; selesai = hijau + centang |
| `Heatmap` | 53×7 kotak 11 px, jarak 3 px, 5 tingkat warna dari token jalur (gabungan memakai biru), label bulan, tooltip |
| `PathMap` | SVG rel + node absolut; virtualisasi per unit supaya ringan |
| `NodeSheet` | Panel/sheet bertab, timer, rating, tombol selesai |
| `QuizRunner` | Mesin kuis untuk sprint, recall, tebak pola, dan checkpoint |
| `StationSign` | Header unit gaya 駅名標 |
| `DarumaShelf` | Daruma SVG + mata (lapisan SVG yang dianimasikan seperti kuas) |
| `XPToast` | Chip "+20 XP" yang terbang ke XPBar |
| `LevelUpModal` | Daru mengikat sabuk baru + confetti |
| `WarBanner` | Merah lembut `--color-jp-soft`, ikon [milestone], countdown jam:menit, checklist, tombol jlptonline ↗ |

## 6. Gerak

- Pegas lembut: `stiffness 300, damping 30`. Durasi 150–300 ms.
- Animasi besar hanya untuk naik level, milestone streak, dan Perfect week.
- Kalau `prefers-reduced-motion` aktif, semua animasi berpindah dan confetti dimatikan; yang tersisa hanya *fade*.

## 7. Bahasa dan nada

- Antarmuka berbahasa Indonesia santai. Istilah Jepang dipakai sebagai aksen yang sekaligus menjadi kosakata, misalnya 日本語, 帯, 駅, がんばって, お疲れさま.
- Tombol menyebut hasilnya: "Tandai selesai", "Terbitkan", "Pulihkan".
- Pesan error menjelaskan apa yang salah dan cara memperbaikinya.
- Tidak menyalahkan. Contohnya: "Streak retak. Capai 100 XP hari ini untuk memulihkannya."

## 8. Aksesibilitas

- Kontras teks minimal 4.5:1. Teks abu `#86868b` hanya dipakai di atas putih untuk teks ≥ 14 px.
- Node jalur berupa `button` dengan `aria-label`, misalnya "Video Partikel は dan が, tersedia, 10 XP". Urutan Tab mengikuti jalur.
- Status selalu ditandai ikon dan teks, tidak hanya warna.
- Fokus terlihat (ring biru 2 px).
- Video memakai judul iframe yang jelas.
