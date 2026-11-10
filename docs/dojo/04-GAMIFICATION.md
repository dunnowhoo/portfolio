# Gamifikasi Dōjō: XP, level, streak, lencana, quest, Daruma

Status: Draft v1 · 9 November 2026

## 1. Prinsip desain

| Mekanik | Tujuan psikologis | Penangkal efek buruk |
|---|---|---|
| **Streak** per jalur | Takut kehilangan sesuatu yang sudah dibangun mendorong untuk muncul setiap hari | Ambang rendah (15 XP), freeze, repair, dan mode sibuk mencegah "sekali putus langsung menyerah" |
| **Daily goal** | Target harian yang jelas dan bisa dicapai | Terpisah dari streak, sehingga hari berat tetap bisa menyelamatkan streak |
| **XP dan level/sabuk** | Rasa maju setiap hari dan identitas ("aku sabuk hijau") | XP hanya untuk aksi nyata, dengan batas harian supaya tidak bisa "farming" |
| **Peta jalur dan pace** | Melihat posisi terhadap tanggal ujian | Rencana mengejar muncul otomatis kalau tertinggal |
| **Daily shuffle dan quest** | Variasi supaya tidak bosan | Jumlahnya kecil, selesai dalam 30–60 menit |
| **SRS dan bintang ★** | Ingatan jangka panjang, bukan hanya "pernah selesai" | Review dibatasi per hari |
| **Daruma (target besar)** | Komitmen yang terlihat. Mata dicat saat target dipasang dan saat tercapai | Target yang gagal bisa "dilepas" dengan refleksi, tanpa rasa malu |

Kejujuran: Dōjō adalah alat untuk dirimu sendiri. Soal DSA dihitung "selesai" kalau kodenya **lulus semua test di LeetCode atau NeetCode**. Hint dicatat apa adanya. Menit yang dicatat adalah waktu fokus nyata.

## 2. Tabel XP

### 2.1 Node jalur (sekali per node)

| Tipe node | XP | Catatan |
|---|---|---|
| [materi] Materi (baca MD) | 20 | Butuh minimal 3 menit terbuka, atau tombol "Sudah dibaca" + rating |
| [video] Video | 10 | |
| [Irodori] Irodori (1 pelajaran) | 40 | Bacaan + audio + latihan di buku, sekitar 60–90 menit |
| [latihan] Latihan bawaan (sprint/recall) | 10, +5 kalau akurasi ≥ 90% | |
| [Duolingo] Target Duolingo (section/unit) | 30 | |
| [Anki] Target Anki (kumulatif Kaishi) | 30 | |
| [checkpoint] Checkpoint unit | 50 | Lulus kalau skor ≥ 80% |
| [boss] Boss (set soal ber-timer, simulasi) | 80 | |
| [boss] Boss section (simulasi JLPT, set besar) | 150 | |
| [milestone] Milestone: terdaftar JLPT | 100 | |
| [milestone] Milestone: ikut ujian JLPT | 300 | |
| [milestone] Milestone: lulus JLPT | 1.000 | |
| [refleksi] Refleksi | 20 | |
| Node dilewati lewat checkpoint | 50% dari XP node | |

### 2.2 Aktivitas berulang

| Aktivitas | XP | Batas |
|---|---|---|
| Soal DSA, solve pertama | Easy 10 · Medium 20 · Hard 40 | Sekali per soal |
| Soal DSA, bonus tanpa hint | +5 | |
| Review soal DSA (SRS) | 10 | 1× per soal per hari |
| Review node (SRS) | 5 | |
| Kartu 日本語 (review) | 1 per kartu | Maks. 30 XP per hari |
| Tebak Pola (5 kartu) | 10 | Maks. 3 sesi per hari |
| Sprint kana/kanji (20 kartu) | 10, +5 kalau ≥ 90% | Maks. 6 sesi per hari |
| Check-in Anki (review hari ini selesai) | 15 | 1× per hari |
| Check-in Duolingo (≥ 1 pelajaran) | 10 | 1× per hari |
| Catat waktu belajar bebas | 1 per 3 menit | Maks. 40 XP per hari per jalur |
| Sesi bicara (italki/teman) | 40 | |
| Baca 1 artikel NHK Easy atau graded reader | 10 | Maks. 3 per hari |
| Ikut kontes (LeetCode/AtCoder) | 60, + XP soal | |
| Mock interview (45–60 menit) | 80 | |

### 2.3 Bonus

| Bonus | XP |
|---|---|
| Daily goal tercapai (per jalur) | +10 |
| **Perfect day**: kedua daily goal + semua item Hari ini selesai | +20 |
| Target mingguan tercapai (per jalur) | +100 dan +1 freeze |
| **Perfect week**: semua target mingguan di kedua jalur | +150 |
| Target bulanan tercapai | +300 |
| Naik ke ★2 / ★3 | +10 / +20 |
| Milestone streak: 7 · 14 · 30 · 50 · 100 · 200 · 365 · 500 · 700 hari | +50 · 70 · 150 · 200 · 500 · 800 · 1.500 · 2.000 · 3.000 |

**Perkiraan XP per hari:**
- Hari biasa 日本語 ≈ 80 XP: Anki 15 + Duolingo 10 + materi/Irodori/video ±35 + sprint 10 + daily goal 10.
- Hari biasa DSA ≈ 50 XP: 1 Medium 20 + review 10 + tebak pola 10 + daily goal 10.
- Ditambah bonus mingguan dan streak, totalnya **±155 XP per hari**.

## 3. Level dan sabuk 帯

- Naik dari level **L** ke **L+1** butuh `90 × L` XP.
- Total XP untuk mencapai level L adalah `45 × L × (L − 1)`.
- Level maksimal 50 (110.250 XP). Setelah level 50, XP tetap dihitung untuk statistik.

| Level | Total XP | Perkiraan tanggal (±155 XP/hari, mulai 9 Nov 2026) |
|---|---|---|
| 5 | 900 | 15 Nov 2026 |
| 10 | 4.050 | 5 Des 2026 |
| 15 | 9.450 | 9 Jan 2027 |
| 20 | 17.100 | 27 Feb 2027 |
| 25 | 27.000 | 2 Mei 2027 |
| 30 | 39.150 | 20 Jul 2027 |
| 36 | 56.700 | 10 Nov 2027 (**sabuk hitam setelah ±1 tahun konsisten**) |
| 40 | 70.200 | 5 Feb 2028 |
| 45 | 89.100 | 6 Jun 2028 |
| 50 | 110.250 | ±20 Okt 2028 (minggu-minggu awal di MISUMI). Di Fase N3 XP harian lebih tinggi, jadi kemungkinan lebih cepat |

| Level | Sabuk | Warna | Gelar |
|---|---|---|---|
| 1–5 | 白帯 Shiro-obi | `#F2F2F7` (pinggir `#D1D1D6`) | 見習い Minarai, "magang" |
| 6–10 | 黄帯 Ki-obi | `#FFCC00` | 初心者 Shoshinsha, "pemula" |
| 11–15 | 橙帯 Daidai-obi | `#FF9500` | 修行者 Shugyōsha, "yang sedang berlatih" |
| 16–20 | 緑帯 Midori-obi | `#34C759` | 挑戦者 Chōsensha, "penantang" |
| 21–25 | 青帯 Ao-obi | `#0066CC` | 努力家 Doryokuka, "pekerja keras" |
| 26–30 | 紫帯 Murasaki-obi | `#AF52DE` | 中級者 Chūkyūsha, "menengah" |
| 31–35 | 茶帯 Cha-obi | `#A2845E` | 上級者 Jōkyūsha, "mahir" |
| 36–40 | 黒帯 初段 | `#1D1D1F` + 1 garis emas | 初段 Shodan |
| 41–45 | 黒帯 二段 | `#1D1D1F` + 2 garis emas | 二段 Nidan |
| 46–49 | 黒帯 三段 | `#1D1D1F` + 3 garis emas | 三段 Sandan |
| 50 | 紅白帯 Kōhaku-obi | merah `#E8453C` / putih | 師範 Shihan, "guru" |

Maskot Daru memakai sabuk sesuai levelmu di avatar dan di layar naik level. Nama sabuk dan gelar sengaja ditulis dalam bahasa Jepang supaya ikut menjadi kosakata.

## 4. Streak

### 4.1 Definisi
- Ada dua streak terpisah, yaitu **日本語** dan **DSA**, plus penghitung **二刀流 Nitōryū** ("dua pedang") untuk hari ketika keduanya aman.
- Satu hari **aman** untuk suatu jalur kalau XP jalur itu pada tanggal lokal tersebut ≥ `streak_min_xp` (default **15**). Contoh hari minimal yang cukup:
  - 日本語: check-in Anki saja (15);
  - DSA: tebak pola (10) + 1 review (10).
- **Daily goal** (default 日本語 50, DSA 30) adalah target terpisah yang memberi +10 XP dan ring penuh. Daily goal tidak diperlukan untuk menjaga streak.
- Hari ditentukan oleh `profile.timezone` dan `day_start_hour`. Dengan `day_start_hour = 3`, belajar pukul 01:00 masih dihitung hari sebelumnya.

### 4.2 Status harian

| Status | Kapan | Tampilan |
|---|---|---|
| Aman | XP ≥ ambang | Api menyala, centang hijau |
| Belum | Sebelum 18:00 dan XP < ambang | Api redup, abu-abu |
| **Berisiko** | Setelah 18:00 dan XP < ambang | Api oranye berdenyut, banner, email (kalau aktif) |
| Dibekukan | Hari bolong tertutup freeze | Ikon es, angka streak tetap |
| **Retak** | Hari kemarin bolong tanpa freeze dan repair masih bisa dipakai | Api retak + tombol "Pulihkan" |
| Mode sibuk | Hari yang ditandai sibuk | Ikon tas, ambang turun ke 5 XP |

### 4.3 Freeze [freeze]
- Mulai dengan **1 freeze per jalur**, maksimal **2**.
- Dapat +1 setiap kali **target mingguan jalur itu tercapai**.
- **Otomatis terpakai** saat pergantian hari kalau hari kemarin tidak aman dan masih ada freeze.
- Hari yang dibekukan tidak menambah angka streak, tapi juga tidak memutusnya.

### 4.4 Repair 七転び八起き ("jatuh tujuh kali, bangkit delapan kali")
- Misalkan hari D bolong dan freeze habis. Pada hari D+1 streak berstatus **retak**.
- Untuk memulihkan, capai **2× daily goal** jalur itu pada hari D+1. Hari D lalu ditandai "dipulihkan" (dihitung aman tapi tanpa XP), dan streak berlanjut.
- Kalau gagal sampai akhir D+1, streak kembali ke 1 (kalau D+1 aman) atau 0.
- Repair bisa dipakai **1× per 30 hari per jalur**. Repair pertama memberi lencana 七転び八起き.

### 4.5 Mode sibuk
- Bisa dipasang **sebelum hari itu dimulai**, maksimal **3 hari per bulan per jalur**. Contohnya untuk hari ujian kampus, demo Apple Academy, perjalanan, atau sakit.
- Pada hari itu ambang streak turun menjadi **5 XP**. Daily goal dan target tidak berubah.

### 4.6 Milestone streak
- XP milestone ada di §2.3.
- Banner perayaan bergambar untuk 7, 30, 100, dan 365 hari (aset di 06-ASSETS). Milestone lain memakai banner umum dengan angka.
- Lencana untuk 7, 30, 100, dan 365 hari per jalur, serta 二刀流 untuk 30 hari kedua jalur bersamaan.

## 5. Lencana

Format: **Nama** · syarat · XP.

**日本語**
- ひらがな修了 · lulus checkpoint hiragana · 50
- カタカナ修了 · lulus checkpoint katakana · 50
- かなマスター · checkpoint akhir Section 0 ≥ 95% · 100
- かな新幹線 *Kana Shinkansen* · 92 kana dasar dalam < 120 detik, akurasi ≥ 95% · 50
- いろどり一歩 · pelajaran Irodori pertama selesai · 20
- 入門修了 · Irodori Starter selesai · 150
- 初級1修了 · Irodori Elementary 1 selesai · 150
- 初級2修了 · Irodori Elementary 2 selesai · 150
- 中級へ · Irodori Pre-Intermediate selesai · 200
- 漢字100 / 漢字300 / 漢字650 · jumlah kartu kanji minimal ★2 · 50 / 100 / 200
- 開始500 / 開始1000 / 開始1500 · kartu Kaishi kumulatif · 30 / 50 / 150
- 申込成功 *War Winner* · status sesi JLPT = terdaftar · 50
- N5受験 / N5合格 · ikut / lulus N5 · 50 / 100 (di luar XP milestone)
- N4受験 / N4合格 · 50 / 100
- N3受験 / N3合格 · 50 / 200
- 初会話 · sesi bicara pertama · 30
- 多読30 · 30 bacaan NHK Easy atau graded reader · 50

**DSA**
- Hello, World · soal pertama · 20
- 10 / 50 / 100 / 150 Solved · 30 / 80 / 150 / 300
- First Medium · 20 · First Hard · 50
- Topic Master (per topik) · semua soal topik ★3 · 100
- NC150 完走 · 150/150 · 500
- Speedrun · Medium < 15 menit tanpa hint · 30
- 復活 *Bangkit* · menyelesaikan ulang dengan "Baik/Mudah" soal yang pernah dinilai "Lupa" · 20
- Contestant · kontes pertama · 50
- Mock Survivor · mock interview pertama · 50
- AtCoder 茶 · rating AtCoder ≥ 400 (diisi manual, opsional) · 100

**Disiplin**
- 日本語 7 / 30 / 100 / 365 · streak 日本語
- DSA 7 / 30 / 100 / 365 · streak DSA
- 二刀流30 · kedua streak ≥ 30 bersamaan · 100
- 七転び八起き · repair pertama · 20
- Perfect Week · pertama / 4 kali · 50 / 150
- 早起き · 10 sesi yang dimulai sebelum 07:00 · 30
- Weekend Warrior · aktif Sabtu dan Minggu, 4 akhir pekan berturut-turut · 50
- 振り返り10 · 10 refleksi mingguan · 50

## 6. Quest harian

- **Tiga quest per hari:** satu dari pool 日本語, satu dari pool DSA, dan satu dari pool umum.
- Dipilih dengan PRNG ber-seed tanggal, sehingga hasilnya sama di semua perangkat.
- Quest yang sudah muncul kemarin tidak dipilih lagi hari ini.

| Pool | ID | Quest | XP |
|---|---|---|---|
| 日本語 | `jp_goal` | Capai daily goal 日本語 | 10 |
| | `jp_sprint90` | Sprint kana/kanji dengan akurasi ≥ 90% | 10 |
| | `jp_shadow` | Shadowing audio Irodori 5 menit | 10 |
| | `jp_video` | Tonton 1 video grammar sampai habis | 10 |
| | `jp_cards20` | Review 20 kartu 日本語 | 10 |
| | `jp_read` | Baca 1 artikel NHK Easy (Section 3 ke atas) | 15 |
| DSA | `dsa_goal` | Capai daily goal DSA | 10 |
| | `dsa_medium` | Selesaikan 1 soal Medium | 15 |
| | `dsa_review2` | Selesaikan 2 review | 15 |
| | `dsa_pattern5` | Tebak Pola 5/5 benar | 15 |
| | `dsa_nohint` | Selesaikan 1 soal tanpa hint | 15 |
| | `dsa_explain` | Tulis penjelasan solusi 3 kalimat di catatan | 10 |
| Umum | `early` | Mulai belajar sebelum 08:00 | 15 |
| | `both_before_20` | Amankan kedua streak sebelum 20:00 | 15 |
| | `focus25` | Satu sesi timer fokus 25 menit | 10 |
| | `note` | Tulis catatan atau refleksi singkat | 10 |
| | `perfect` | Selesaikan semua item Hari ini | 20 |

## 7. SRS (varian SM-2)

- Rating setelah mengerjakan atau me-review: **1 Lupa · 2 Sulit · 3 Baik · 4 Mudah**.
- **Item baru:** interval awal 1 / 2 / 4 / 7 hari sesuai rating, dengan `ease = 2.5`.
- **Item lama:**
  - Lupa → interval 1, `ease −0.20`, `lapses+1`, bintang turun satu (minimal ★1);
  - Sulit → `max(2, interval × 1.2)`, `ease −0.15`;
  - Baik → `interval × ease`;
  - Mudah → `interval × ease × 1.3`, `ease +0.15`.
- `ease` minimal 1.3. Interval maksimal 180 hari. Ada *fuzz* deterministik ±5% supaya review tidak menumpuk di hari yang sama.
- **Bintang:**
  - ★1 saat pertama selesai;
  - ★2 saat review berhasil (Baik/Mudah) dengan interval ≥ 7 hari;
  - ★3 saat review berhasil dengan interval ≥ 30 hari, atau lulus boss topik itu.
- **Soal DSA saat review:**
  - kerjakan ulang dari nol dengan batas waktu 25 menit;
  - kalau waktu mepet, cukup **recall pola dan kompleksitasnya** (mode cepat). XP tetap 10, tapi item ini tidak bisa naik ke ★3.
- **Batas harian:** di Hari ini maksimal 2 review DSA; di halaman Review tidak dibatasi. Kartu 日本語 maksimal 50 review dan 10 kartu baru per hari.

## 8. Daily shuffle

### DSA (seed = `hash(tanggal + 'dsa')`)
1. **Jalur:** soal belum selesai berikutnya di unit aktif.
2. **Acak:** satu soal belum selesai dari topik lain yang sudah terbuka.
   - Bobot per topik = `1 + (3 − rata-rata ★ topik) + min(3, hari sejak topik terakhir dilatih / 7)`.
   - Kalau tidak ada lagi soal yang belum selesai, ambil soal ★ terendah sebagai review.
3. **Review:** maksimal 2 item jatuh tempo, diurutkan dari yang paling lama tertunda lalu yang ★-nya paling rendah.
4. **Tebak Pola:** 5 kartu dari soal di topik yang sudah terbuka. Pilihannya pola yang benar ditambah 3 pengecoh dari pola lain yang sudah dipelajari.

### 日本語 (seed = `hash(tanggal + 'jp')`)
1. **Sprint:** kana sampai lencana かなマスター didapat, setelah itu kanji dari batch yang sudah terbuka. Isinya 20 kartu: 60% jatuh tempo atau lemah, 40% acak.
2. **Grammar recall:** 5 kartu dari poin grammar yang sudah terbuka, didahulukan yang jatuh tempo.
3. **Dengar/baca:** 1 item dari unit aktif, misalnya audio Irodori pelajaran sekarang, Comprehensible Japanese, atau NHK Easy (mulai Section 3).
4. **Check-in Anki.**
5. **Check-in Duolingo.**

**Reroll** 1× per hari memakai `seed + 1` untuk item non-review.

## 9. Pace

- Setiap node wajib punya `targetDate`, yaitu tanggal unitnya dibagi rata ke node-node di dalamnya (lihat kurikulum).
- `expected` = jumlah node wajib dengan `targetDate ≤ hari ini`. `actual` = jumlah node wajib yang sudah selesai, dalam urutan apa pun.
- Hasilnya `selisih = actual − expected`:
  - |selisih| ≤ 1 → **Tepat waktu**;
  - selisih positif → **Unggul n**;
  - selisih negatif → **Tertinggal n**, disertai rencana "n/7 node per hari selama 7 hari".
- Untuk DSA, pace juga dihitung dari jumlah soal yang sudah selesai dibanding jadwal mingguan (misalnya 5 soal per minggu).

## 10. Daruma: target besar 達磨

- **Data awal:**

| Target | Tanggal |
|---|---|
| JLPT N5 | 4 Jul 2027 |
| NeetCode 150 | 31 Agu 2027 |
| JLPT N4 | 5 Des 2027 |
| **JLPT N3** | **2 Jul 2028** |
| **MISUMI Day 1** | **1 Okt 2028** |

- **Mata kiri** dicat (dengan animasi kuas) ketika target dipasang. **Mata kanan** dicat ketika tercapai, baik otomatis dari event (lulus JLPT, NC150 selesai) maupun dikonfirmasi manual.
- Kalau target lewat, pilih salah satu:
  - **Perpanjang**: tanggal baru, mata kiri tetap;
  - **Lepas**: tulis satu paragraf refleksi, lalu Daruma pindah ke rak "pelajaran".
- Rak Daruma tampil di Profil dan sebagai mini-rak di Beranda.

## 11. Perayaan dan umpan balik

| Momen | Efek |
|---|---|
| Node selesai | Chip "+20 XP" terbang ke XP bar, node berubah warna, bintang muncul |
| Daily goal | Ring penuh + kilau + Daru bersorak |
| Naik level | Modal layar penuh: Daru mengikat sabuk baru, gelar baru, dan confetti (tanpa animasi kalau *reduced motion*) |
| Milestone streak | Banner bergambar + kartu streak yang bisa diunduh (PNG) |
| Rekap mingguan (Minggu ≥ 18:00) | XP minggu ini dibanding minggu lalu ("bayangan"), hari aktif, hari terbaik, soal, kanji, dan status streak → tombol tulis refleksi |
| Tertinggal | Banner tenang (bukan merah menakutkan) dengan rencana mengejar |

Nada teks memakai bahasa Indonesia santai dengan sedikit bahasa Jepang, misalnya がんばって！, お疲れさま！, dan よくできました！.

## 12. Koban 小判 (fase 2, opsional)

- **Dapat dari:**
  - naik level +50;
  - target mingguan +30;
  - Perfect week +50;
  - lencana +10–50.
- **Dipakai untuk:**
  - freeze tambahan (100, selama di bawah batas);
  - tiket repair tambahan (150);
  - **tema jalur**: 桜 Sakura, 紅葉 Momiji, 雪 Yuki, 夜 Yoru (300);
  - **baju Daru**: hachimaki warna, yukata, hoodie, dan jas kerja untuk MISUMI (200).
