# PRD: Dōjō 道場, dashboard pribadi di fauzansanjaya.dev

Status: Draft v1 · 9 November 2026 · Pemilik: Fauzan Putra Sanjaya
Dokumen terkait: [02-ARCHITECTURE](02-ARCHITECTURE.md) · [03-DATA-MODEL](03-DATA-MODEL.md) · [04-GAMIFICATION](04-GAMIFICATION.md) · [05-DESIGN](05-DESIGN.md) · [06-ASSETS](06-ASSETS.md) · [curriculum/JP](curriculum/JP.md) · [curriculum/DSA](curriculum/DSA.md)

---

## 1. Ringkasan

Dōjō adalah area privat di portfolio yang hanya bisa dibuka lewat **slug rahasia** dan **login username + password**. Fungsinya ada dua:

1. **CMS portfolio.** Semua konten halaman utama (profil, pengalaman, proyek, organisasi, prestasi, tech stack, Spotify, kontak, SEO) bisa diedit, ditambah, diurutkan ulang, dan diterbitkan tanpa deploy ulang.
2. **Tracker belajar yang digamifikasi** untuk dua jalur:
   - **日本語:** dari kana sampai JLPT N3 pada 2 Juli 2028, lalu bahasa Jepang kerja sebelum mulai di MISUMI pada 1 Oktober 2028.
   - **DSA:** dari fondasi sampai siap coding interview. Targetnya NeetCode 150 selesai 31 Agustus 2027, lalu fase review, kontes, dan mock interview.

Bentuk utamanya **peta jalur bergaya Duolingo** yang dibuat lebih kaya. Setiap node bisa berisi:
- video YouTube yang di-embed;
- link pelajaran Irodori (PDF dan audio);
- target Duolingo atau Anki;
- daftar soal LeetCode/NeetCode;
- materi MD yang ditulis khusus.

Setiap aktivitas memberi **XP**. XP menaikkan **level** (sistem sabuk karate 帯) dan menjaga **dua streak terpisah**. Ada juga quest harian, target mingguan dan bulanan, heatmap ala GitHub, countdown MISUMI dan JLPT, serta **pengingat "war" pendaftaran JLPT**.

## 2. Masalah yang diselesaikan

| Masalah sekarang | Solusi di Dōjō |
|---|---|
| Mengubah portfolio harus edit `constants.tsx` lalu deploy | CMS dengan form, preview, publish, dan riwayat versi |
| Sumber belajar tersebar di Irodori, YouTube, Duolingo, Anki, LeetCode, dan NeetCode | Semua dirangkai dalam satu peta, dan setiap node menunjuk sumber yang tepat |
| Mudah bolong karena tidak ada yang "menagih" | Streak per jalur, daily goal, quest, dan pengingat |
| Tidak tahu apakah progres sesuai jadwal ujian | Garis *pace* di peta: tepat waktu, tertinggal X node, atau unggul X node |
| Soal DSA yang sudah dikerjakan cepat lupa | SRS (*spaced repetition*) untuk soal dan kartu, plus *daily shuffle* |
| Motivasi naik turun | XP, level/sabuk, lencana, Daruma target besar, dan rekap mingguan |

## 3. Tujuan dan metrik sukses

| Tujuan | Metrik | Target |
|---|---|---|
| Konsisten belajar Jepang | Hari aktif 日本語 per minggu | ≥ 6 dari 7 hari |
| Konsisten DSA | Hari aktif DSA per minggu | ≥ 5 dari 7 hari |
| Streak tidak mudah putus | Streak putus tanpa freeze atau repair | ≤ 1× per bulan |
| Lulus JLPT bertahap | Hasil ujian | N5 Jul 2027 dan N4 Des 2027 sebagai checkpoint; **N3 2 Jul 2028** |
| Siap coding interview | Progres NeetCode 150 | 150/150 per 31 Agu 2027; ≥ 80% soal minimal ★2 per Des 2027 |
| Disiplin target | Target mingguan tercapai | ≥ 80% |
| Portfolio selalu terbaru | Waktu untuk satu perubahan konten | < 2 menit, tanpa deploy |

## 4. Pengguna dan konteks

- **Satu pengguna, yaitu pemilik.** Tidak ada registrasi atau multi-user.
- **Perangkat:**
  - MacBook untuk belajar utama, CMS, dan coding;
  - iPhone untuk cek streak, kuis singkat, serta check-in Anki dan Duolingo.
- **Jadwal yang memengaruhi beban:**
  - semester akhir dan skripsi sampai wisuda Agustus 2027;
  - Apple Developer Academy di 2027;
  - pindah ke Tokyo sebelum 1 Okt 2028, sehingga zona waktu berpindah dari WIB ke JST.
- **Kebutuhan emosional:**
  - merasa ada kemajuan nyata setiap hari;
  - punya dorongan untuk tidak bolong;
  - tidak langsung menyerah ketika streak putus. Untuk itu ada freeze, repair, dan mode sibuk.

## 5. Lingkup

### Termasuk MVP (M0–M5)
- Gerbang slug dan login (F1)
- Beranda (F2)
- Jalur 日本語 dan DSA (F3, F4)
- Panel detail node (F5)
- Hari ini dan *daily shuffle* (F6)
- Streak (F7)
- XP, level, lencana, quest, dan Daruma (F8)
- Profil dan statistik (F9)
- Target (F10)
- Kalender dan pengingat war JLPT (F11)
- Pustaka materi (F12)
- Review SRS (F13)
- CMS portfolio (F14)
- Pengaturan dan ekspor data (F15)

### Di luar MVP (fase lanjut)
- **Fase 2:**
  - dark mode;
  - toko kosmetik berbayar koban (小判) untuk tema jalur dan baju maskot;
  - PWA offline penuh;
  - node kustom yang kamu tambahkan sendiri ke jalur. Di MVP baru tersedia "tambah sumber" ke node yang sudah ada.
- **Fase 3:**
  - sinkron otomatis ke LeetCode (soal *accepted*), Duolingo (streak/XP), dan AnkiConnect. Semuanya API tidak resmi yang bisa berubah sewaktu-waktu, jadi MVP memakai check-in manual;
  - tutor AI.
- **Tidak direncanakan:** leaderboard multi-user dan aplikasi native.

## 6. Peta halaman

```
/                         Portfolio publik (tampilan tetap sama, konten dari CMS)
/{SLUG}                   Login, atau langsung ke Beranda kalau sesi aktif
/{SLUG}/beranda           Ringkasan harian
/{SLUG}/nihongo           Peta jalur 日本語
/{SLUG}/dsa               Peta jalur DSA
/{SLUG}/hari-ini          Daily shuffle kedua jalur + timer
/{SLUG}/review            Antrian SRS (soal DSA + kartu JP)
/{SLUG}/target            Target mingguan/bulanan + refleksi
/{SLUG}/kalender          Countdown, sesi JLPT, pengingat, ekspor .ics
/{SLUG}/materi            Pustaka MD + pencarian
/{SLUG}/profil            Level, sabuk, heatmap, lencana, rak Daruma, statistik
/{SLUG}/cms               Editor konten portfolio
/{SLUG}/pengaturan        Zona waktu, daily goal, email, ekspor/backup
```

Slug salah, `/dashboard`, `/admin`, dan path tebakan lain menampilkan **404 biasa** yang tidak bisa dibedakan dari halaman yang memang tidak ada.

## 7. Kebutuhan fungsional

Setiap fitur ditulis sebagai kebutuhan diikuti **kriteria terima (AC)**.

### F1. Gerbang rahasia dan login
- Path masuk adalah `/{DASHBOARD_SLUG}`, diambil dari environment variable. Slug minimal 16 karakter acak dan dibandingkan dengan *constant-time compare*.
- Form berisi username dan password. Verifikasi dilakukan di server terhadap hash **argon2id** yang disimpan di env.
- **Rate limit:**
  - 5 kali gagal dalam 15 menit dari satu IP → kunci 15 menit;
  - 20 kali gagal dalam 1 jam secara global → kunci 1 jam, plus email peringatan kalau Resend aktif.
- **Sesi:**
  - token acak 32 byte; yang disimpan di DB hanya hash-nya;
  - cookie `httpOnly`, `Secure`, `SameSite=Strict`, berlaku 30 hari dan diperpanjang setiap dipakai;
  - ada tombol "Keluar dari semua perangkat".
- Semua halaman dan API Dōjō mengirim header `X-Robots-Tag: noindex, nofollow`. Tidak ada link dari portfolio, dan Dōjō tidak tercantum di sitemap maupun robots.txt.
- **AC:**
  1. `/{slug}` tanpa sesi menampilkan form login.
  2. `/dashboard`, `/admin`, dan `/{slug-salah}` mengembalikan 404.
  3. Enam kali password salah menampilkan pesan "Terlalu banyak percobaan. Coba lagi dalam 15 menit."
  4. Endpoint Dōjō tanpa sesi tidak mengembalikan data apa pun.
  5. Logout menghapus sesi di DB, bukan hanya cookie.

### F2. Beranda
- **Sapaan** sesuai jam lokal: おはよう, こんにちは, atau こんばんは. Ditampilkan bersama level, sabuk, XP bar, dan ringkasan hari ini, misalnya "日本語 32/50 XP · DSA 0/30 XP".
- **Dua kartu streak** (日本語 dan DSA), masing-masing berisi:
  - angka streak;
  - status hari ini: aman, belum, atau freeze terpakai;
  - sisa jam sebelum hari berganti;
  - jumlah freeze.
- **Countdown:**
  - **MISUMI**: D-xxx sampai 1 Okt 2028, dengan bar progres sejak offer ditandatangani 8 Nov 2026;
  - **JLPT berikutnya**: D-xx;
  - **status pendaftaran JLPT**.
- **Banner WAR** muncul di paling atas ketika pendaftaran JLPT akan dibuka dalam 7 hari atau sedang dibuka. Isinya checklist persiapan dan link ke jlptonline.or.id.
- **Hari ini:** quest harian, *daily shuffle* per jalur, dan ring daily goal.
- **Target:** ring progres target minggu ini dan bar target bulan ini.
- **Pace per jalur**, misalnya "日本語: tepat waktu" atau "DSA: tertinggal 3 soal". Bisa diklik untuk melihat rencana mengejar.
- **Heatmap setahun** dengan pilihan tampilan gabungan, 日本語 saja, atau DSA saja.
- **Lencana terbaru dan rak Daruma.**
- **AC:**
  1. Semua kartu terisi dari data asli.
  2. Setelah menandai node selesai, XP, streak, ring, dan target ikut berubah tanpa reload.
  3. Tampilan rapi di layar 390 px dan 1440 px.

### F3 dan F4. Peta jalur 日本語 dan DSA
- **Struktur:** Section → Unit → Node. Isi lengkapnya ada di [curriculum/JP.md](curriculum/JP.md) dan [curriculum/DSA.md](curriculum/DSA.md).
- **Tipe node:**

| Ikon | Tipe | Isi |
|---|---|---|
| [materi] | Materi | Materi MD yang ditulis khusus |
| [video] | Video | Video YouTube yang di-embed |
| [Irodori] | Irodori | Link PDF dan halaman audio pelajaran |
| [latihan] | Latihan | Kuis bawaan (kana, kanji, grammar recall, tebak pola) atau daftar soal |
| [Duolingo] | Duolingo | Target section/unit |
| [Anki] | Anki | Target kumulatif kartu Kaishi |
| [checkpoint] | Checkpoint | Kuis penutup unit |
| [boss] | Boss | Set soal ber-timer atau simulasi |
| [milestone] | Milestone | Tanggal ujian atau war pendaftaran, dengan countdown |
| [refleksi] | Refleksi | Catatan singkat |

- **Status node:** terkunci, tersedia, berjalan, selesai (★1), dikuasai (★2/★3), dan perlu review.
- **Aturan buka:**
  - node dalam unit terbuka berurutan;
  - unit berikutnya terbuka kalau checkpoint lulus atau semua node wajib selesai;
  - **lompat unit** bisa dilakukan lewat tes checkpoint. Kalau lulus, node yang dilewati ditandai "dilewati" dan memberi 50% XP.
- **Garis pace:** penanda "seharusnya di sini hari ini" berdasarkan jadwal kurikulum, plus badge "Tepat waktu", "Tertinggal X", atau "Unggul X".
- **Header unit** bergaya papan nama stasiun Jepang (駅名標), lengkap dengan nama unit sebelumnya dan berikutnya.
- **Tombol "Lanjutkan"** menggulir ke node aktif. Ada juga minimap section.
- **AC:**
  1. Klik node membuka panel dalam < 150 ms.
  2. Selesai node memicu animasi XP; status, streak, target, dan pace ikut diperbarui.
  3. Node terkunci menjelaskan syarat membukanya.
  4. Jalur bisa dipakai dengan keyboard (Tab dan Enter).

### F5. Panel detail node (pemutar materi)
- **Header:** ikon tipe, judul, estimasi menit, XP, dan tanggal target.
- **Tab:**
  - **Materi:** MD dirender dengan *syntax highlight* untuk kode;
  - **Video:** embed `youtube-nocookie.com`, ukuran 16:9;
  - **Latihan:** daftar soal dengan chip Easy/Medium/Hard, status, link LeetCode/NeetCode/LintCode, dan ringkasan pola;
  - **Sumber:** link Irodori (PDF dan audio), target Duolingo/Anki, serta link tambahan;
  - **Catatan:** editor MD pribadi dengan simpan otomatis.
- **Timer belajar** (mulai/jeda) dan input menit manual.
- **"Tandai selesai"** meminta rating keyakinan: Lupa, Sulit, Baik, atau Mudah. Rating ini mengatur jadwal review SRS.
- **Tambah sumber sendiri** (URL atau video YouTube) ke node mana pun.
- **AC:**
  1. Video bisa diputar di dalam Dōjō.
  2. Link eksternal terbuka di tab baru.
  3. Catatan tersimpan dalam ≤ 1 detik setelah berhenti mengetik.
  4. Untuk node soal DSA, kamu bisa mencatat waktu pengerjaan, apakah melihat hint, dan link solusi atau submission.

### F6. Hari ini (daily shuffle 日替わり)
- Set harian dibuat otomatis per tanggal dengan seed `tanggal + jalur`, sehingga hasilnya **sama di semua perangkat** dan tidak berubah saat reload.
- **DSA:**
  - 1 soal berikutnya di jalur;
  - 1 soal acak dari topik yang sudah terbuka, diutamakan topik dengan keyakinan terendah;
  - maksimal 2 soal review yang jatuh tempo;
  - **5 kartu "Tebak Pola"**: diberi ringkasan soal, lalu memilih pola yang tepat dari 4 pilihan.
- **日本語:**
  - **sprint** 20 kartu kana atau kanji dari set yang sudah terbuka;
  - 5 kartu *grammar recall*;
  - 1 item listening atau reading;
  - check-in Anki (review hari ini selesai);
  - check-in Duolingo (minimal 1 pelajaran).
- **Reroll** 1× per hari per jalur. Review yang jatuh tempo tidak ikut di-reroll.
- **AC:**
  1. Set tidak berubah saat reload.
  2. Menyelesaikan semua item memberi bonus *Perfect day*.
  3. Kuis bawaan memberi umpan balik langsung (benar/salah + jawaban) dan mencatat akurasi.

### F7. Streak
- Dua streak terpisah, yaitu 日本語 dan DSA, plus penghitung bonus **二刀流 (Nitōryū)** untuk hari ketika keduanya aman. Aturan lengkap ada di [04-GAMIFICATION](04-GAMIFICATION.md).
- Satu hari dihitung aman kalau XP jalur itu ≥ **ambang streak** (default 15 XP, sekitar 10–15 menit). **Daily goal** (default 日本語 50 XP, DSA 30 XP) adalah target terpisah yang memberi bonus.
- **Freeze:**
  - mulai dengan 1, maksimal 2 per jalur;
  - didapat dari setiap target mingguan yang tercapai;
  - terpakai otomatis ketika satu hari bolong.
- **Repair (七転び八起き):**
  - kalau streak putus dan tidak ada freeze, streak bisa dipulihkan dalam 48 jam dengan mencapai 2× daily goal jalur itu;
  - maksimal 1× per 30 hari per jalur.
- **Mode sibuk:** pada hari yang dipilih (ujian, sakit, perjalanan), ambang streak turun menjadi 5 XP. Maksimal 3 hari per bulan dan harus dipasang sebelum hari itu.
- Batas hari mengikuti zona waktu di pengaturan (default Asia/Jakarta, nanti Asia/Tokyo). Ada opsi "hari berganti pukul 03:00" untuk belajar larut.
- **AC:**
  1. Streak tidak bertambah dua kali dalam sehari.
  2. Pindah zona waktu tidak merusak riwayat, karena tanggal lokal disimpan per event.
  3. Status "berisiko" muncul setelah 18:00 kalau ambang belum tercapai.

### F8. XP, level, sabuk, lencana, quest, dan Daruma
- Semua angka ada di [04-GAMIFICATION](04-GAMIFICATION.md):
  - tabel XP per aktivitas;
  - kurva level: naik dari level L ke L+1 butuh `90 × L` XP; level 50 di 110.250 XP;
  - 10 sabuk (白帯 sampai 師範);
  - sekitar 40 lencana;
  - quest harian;
  - **Daruma** untuk target besar. Mata kiri dicat saat target dipasang, mata kanan saat tercapai.
- Ada perayaan untuk naik level (modal sabuk baru), milestone streak (banner), dan rekap mingguan setiap Minggu malam.
- **AC:**
  1. XP tidak bisa didapat dua kali dari aksi yang sama, misalnya menyelesaikan ulang node yang sama. Review punya XP sendiri.
  2. Lencana muncul segera setelah syaratnya terpenuhi.
  3. Total XP selalu bisa dihitung ulang dari log event.

### F9. Profil dan statistik
- Avatar (Daru dengan warna sabukmu), nama, level, sabuk, dan judul (misalnya 修行者 Shugyōsha).
- Statistik:
  - total jam per jalur;
  - streak sekarang dan terpanjang;
  - jumlah soal per difficulty dan per topik (★);
  - kana dan kanji yang dikuasai;
  - progres Irodori per jilid;
  - kartu Kaishi;
  - akurasi kuis.
- Heatmap 1 tahun (bisa pilih tahun), grafik XP 12 minggu, riwayat level, rak Daruma, dan galeri lencana (yang terkunci tampil abu-abu beserta syaratnya).

### F10. Target mingguan dan bulanan
- Setiap fase kurikulum punya **template target**. Contohnya untuk 日本語 fase N5: 7 hari aktif, 7 jam, 1–2 pelajaran Irodori, 56 kartu Kaishi baru, dan 3 video grammar.
- Target dibuat otomatis setiap Senin (mingguan) dan tanggal 1 (bulanan). Isinya bisa diubah, ditambah, atau dihapus.
- **Tipe metrik:** XP, menit, hari aktif, node, soal (berdasarkan difficulty), review, pelajaran Irodori, kartu Anki, kanji, dan checklist manual.
- Progres dihitung otomatis dari event. Target manual dicentang sendiri.
- **Hadiah:**
  - target mingguan tercapai: +100 XP dan +1 freeze;
  - *Perfect week*: +150 XP;
  - target bulanan tercapai: +300 XP.
- Setiap Minggu ada refleksi mingguan: apa yang berhasil, apa yang menghambat, dan rencana minggu depan (+20 XP).

### F11. Kalender, countdown, dan pengingat war JLPT
- Tabel **sesi JLPT** bisa diedit, karena tanggal resmi baru keluar belakangan. Datanya meliputi:
  - tanggal ujian dan level rencana;
  - waktu buka dan tutup pendaftaran;
  - status: rencana, pendaftaran buka, terdaftar, sudah bayar, kartu ujian, sudah ujian, lulus/tidak;
  - skor;
  - flag "perkiraan".
- **Data awal (perkiraan):**
  - 4 Jul 2027 (N5), pendaftaran Mar–Apr 2027;
  - 5 Des 2027 (N4), pendaftaran Agu–Sep 2027;
  - 2 Jul 2028 (N3), pendaftaran Mar–Apr 2028;
  - 3 Des 2028 (cadangan, di Jepang).
- **Pengingat war:**
  - H-14 dan H-7 sebelum pendaftaran buka (checklist dokumen);
  - H-1;
  - hari H pada jam buka;
  - H-1 sebelum tutup kalau status belum "terdaftar".
- **Kanal pengingat:**
  - banner di Dōjō;
  - email (opsional, Resend);
  - file `.ics` dan URL langganan kalender (Apple/Google Calendar) dengan alarm.
- **Countdown tambahan** bisa ditambah sendiri, misalnya wisuda, mulai Apple Academy, atau keberangkatan ke Jepang.
- **AC:**
  1. Countdown benar menurut zona waktu.
  2. Pengingat yang sama tidak terkirim dua kali (ada log idempoten).
  3. File `.ics` bisa diimpor ke Apple Calendar beserta alarmnya.

### F12. Pustaka materi
- Semua MD dari `content/dojo/**` ditampilkan, bisa dicari berdasarkan judul dan tag, ditandai "sudah dibaca", dan ditautkan ke node terkait.
- Mode baca nyaman: lebar teks sekitar 70 karakter, daftar isi melayang, dan tombol salin pada blok kode.

### F13. Review SRS
- Isi antrian SRS:
  - soal DSA yang sudah selesai, dikerjakan ulang dari nol atau minimal di-*recall* polanya;
  - kartu 日本語 bawaan, yaitu kana, kanji N5, dan grammar recall;
  - kartu yang kamu buat sendiri.
- Algoritma varian SM-2 (detail di GAMIFICATION §7) dengan rating Lupa, Sulit, Baik, dan Mudah.
- **AC:** jatuh tempo dihitung per tanggal lokal, dan review yang terlewat menumpuk dengan prioritas yang paling lama tertunda.

### F14. CMS portfolio
- **Bagian yang bisa diedit:**
  - Profil/Hero: nama, judul, tagline, badge "Available for work", file resume, foto, dan lokasi;
  - Sosial;
  - Pendidikan;
  - Pengalaman;
  - Organisasi;
  - Prestasi;
  - Tech stack;
  - Proyek: judul, deskripsi, kategori, gambar utama, galeri, embed, link, dan tech stack;
  - Spotify: track ID, detik mulai, judul, dan subjudul;
  - Kontak: email dan link jadwal;
  - SEO: title, description, dan OG image.
- **Operasi:**
  - tambah, edit, hapus, duplikat;
  - urutkan dengan *drag-and-drop*;
  - sembunyikan atau tampilkan item;
  - upload gambar, yang dikompres ke WebP di browser sebelum diunggah.
- **Draf dan terbit:**
  - "Simpan draf" tidak mengubah situs publik;
  - "Terbitkan" memperbarui halaman publik dalam beberapa detik tanpa deploy;
  - **preview** draf memakai komponen asli portfolio;
  - **riwayat versi** per bagian bisa dipulihkan.
- **Data awal** diimpor dari `constants.tsx` dan `Hero.tsx`, sehingga tidak ada konten yang hilang. Kalau DB tidak bisa diakses, halaman publik memakai salinan konten terakhir yang dibundel.
- **AC:**
  1. Setelah publish, perubahan terlihat di `/` dalam < 10 detik.
  2. Field wajib dan URL divalidasi.
  3. Restore versi lama bisa dilakukan dengan satu klik.
  4. Tampilan publik sebelum dan sesudah migrasi identik.

### F15. Pengaturan dan data
- Zona waktu, jam pergantian hari, daily goal per jalur, ambang streak, email pengingat, dan jam pengingat streak.
- **Ekspor JSON** seluruh data. Impor ulang tersedia untuk pemulihan.
- Progres dari artifact roadmap lama bisa diimpor sekali (dokumen `progress/fauzan`).

## 8. Kebutuhan non-fungsional
- **Desain:** mengikuti portfolio, yaitu glass ala Apple, `#f5f5f7`, Inter, biru `#0066cc`, kartu `rounded-3xl`, dan tombol pill. Detailnya di [05-DESIGN](05-DESIGN.md).
- **Performa:** LCP halaman publik < 2,5 detik di 4G; interaksi Dōjō terasa < 100 ms dengan *optimistic UI*.
- **Keamanan:** checklist di [02-ARCHITECTURE §11](02-ARCHITECTURE.md).
- **Aksesibilitas:**
  - kontras minimal AA;
  - fokus keyboard terlihat;
  - status tidak hanya dibedakan dengan warna, tapi juga ikon dan teks;
  - menghormati `prefers-reduced-motion`.
- **Responsif:** 360 px sampai 1440 px. Di HP memakai tab bar bawah.
- **Keandalan data:**
  - semua aktivitas disimpan sebagai event *append-only*, sehingga XP dan streak bisa dihitung ulang;
  - ekspor JSON manual;
  - backup mingguan otomatis (fase 2).
- **Privasi:** tidak ada analytics pihak ketiga di Dōjō, dan semua data hanya untuk pemilik.

## 9. Konten dan hak cipta
- Materi MD **ditulis orisinal**, bukan salinan Irodori, NeetCode, LeetCode, atau buku. Ringkasan soal DSA adalah parafrase satu kalimat.
- Irodori, LeetCode, NeetCode, dan YouTube **hanya ditautkan atau di-embed lewat embed resmi**.
- Tanggal JLPT 2027–2028 adalah **perkiraan** dan ditandai begitu di UI sampai kamu menggantinya dengan tanggal resmi.

## 10. Keputusan yang perlu kamu ambil

| # | Keputusan | Rekomendasi | Alasan singkat |
|---|---|---|---|
| 1 | Framework | **Migrasi ke Next.js 16** | Auth di server, slug tersembunyi, render konten CMS di server (SEO lebih baik), cron, dan Tailwind build. Kodenya kecil (±1.700 baris), jadi migrasi murah |
| 2 | Bahasa DSA | **Python** | Paling ringkas untuk interview, dipakai di video NeetCode, dan semua materi sudah ditulis dalam Python |
| 3 | Upload gambar CMS | **Vercel Blob** | Satu platform dengan Vercel, env otomatis, dan free tier cukup. R2 masuk akal kalau kamu sudah memakai Cloudflare |
| 4 | Email pengingat (Resend) | Opsional, **disarankan** | Perlu verifikasi domain (DNS). Tanpa email tetap ada banner dan kalender `.ics` |
| 5 | Daily goal default | 日本語 50 XP, DSA 30 XP, ambang streak 15 XP | Bisa diubah di pengaturan |
| 6 | Slug, username, password | Kamu tentukan sendiri | Password tidak pernah dikirim ke chat; kamu menjalankan `npm run hash-password` sendiri |
| 7 | API key OpenAI | Simpan sendiri di `.env.local` | Hanya dipakai lokal untuk generate aset sekali, lalu key-nya di-rotate |

## 11. Rencana rilis

| Milestone | Isi | Selesai kalau |
|---|---|---|
| **M0** Migrasi | Next.js + Tailwind build; komponen portfolio dipindah 1:1; konten masih statis | Screenshot publik sebelum dan sesudah identik; Lighthouse tidak turun |
| **M1** Fondasi | Neon + Drizzle, gerbang slug + login + sesi, layout Dōjō, Beranda dengan data dummy, seed kurikulum | Bisa login dari HP; slug salah → 404 |
| **M2** Jalur | Data kurikulum JP + DSA, peta jalur, panel node (materi/video/latihan/sumber/catatan), mesin XP + level + streak | Menyelesaikan node menambah XP dan streak; pace tampil |
| **M3** Kebiasaan | Hari ini (shuffle + kuis bawaan), SRS, target mingguan/bulanan, heatmap, countdown, sesi JLPT, profil, lencana, Daruma | Satu minggu penuh bisa dijalani di Dōjō |
| **M4** CMS | Editor semua bagian, upload gambar, preview, publish, riwayat, migrasi data dari `constants.tsx` | Mengubah satu proyek dari HP dan langsung tampil |
| **M5** Pengingat dan polish | Cron harian, email, `.ics`, aset maskot dari OpenAI, animasi, tes engine (Vitest) dan smoke e2e | Pengingat war JLPT terkirim di lingkungan uji |

Urutan ini membuat tracker sudah bisa dipakai sejak M2–M3, sambil CMS dikerjakan.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Lingkup besar sehingga tidak selesai | Milestone kecil yang masing-masing langsung bisa dipakai. Fitur fase 2/3 jelas dipisah |
| Burnout karena target terlalu tinggi | Ambang streak rendah (15 XP), freeze, repair, mode sibuk, dan target per fase menyesuaikan jadwal skripsi/Academy |
| Tanggal JLPT berubah, atau ada sesi tambahan mulai 2027 | Tabel sesi bisa diedit dan diberi flag "perkiraan"; pengingat mengikuti tabel |
| API tidak resmi (LeetCode/Duolingo) berubah | MVP memakai check-in manual; sinkron otomatis baru di fase 3 |
| Key OpenAI bocor | Hanya ada di `.env.local` (sudah di-gitignore), tidak pernah ke Vercel atau bundle; key di-rotate setelah generate |
| Slug bocor | Slug hanya lapisan tambahan. Proteksi utamanya login + rate limit; slug bisa diganti lewat env kapan saja |
| Data hilang | Event log, ekspor JSON, dan *point-in-time restore* Neon |
