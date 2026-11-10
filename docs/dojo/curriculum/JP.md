# Kurikulum 日本語: dari kana sampai N3 dan bahasa Jepang kerja

Status: Draft v1 · 9 November 2026
Selaras dengan roadmap artifact "Rute N3 Fauzan", dengan satu penyesuaian: Section 1 berakhir di **Irodori Elementary 1 L10** (bukan L9) supaya satu topik tidak terpotong.

## 0. Ringkasan

| Section | Nama | Periode | Ujung |
|---|---|---|---|
| 0 | かな Kana | 9–30 Nov 2026 | Checkpoint かなマスター |
| 1 | N5 | 1 Des 2026 – 4 Jul 2027 | [milestone] JLPT N5 (perkiraan Min, 4 Jul 2027) |
| 2 | N4 | 5 Jul – 5 Des 2027 | [milestone] JLPT N4 (perkiraan Min, 5 Des 2027) |
| 3 | N3 | 6 Des 2027 – 2 Jul 2028 | [milestone] **JLPT N3 (perkiraan Min, 2 Jul 2028)** |
| 4 | ビジネス Bahasa Jepang kerja | 3 Jul – 30 Sep 2028 | [milestone] MISUMI Day 1, 1 Okt 2028 (九段下) |

**Sumber utama:** Irodori (Japan Foundation, gratis). Pendampingnya:
- grammar dan kanji dari materi MD Dōjō;
- video YouTube;
- Kaishi 1.5k (Anki);
- Duolingo sebagai pemanasan harian.

## 1. Pola link sumber

| Sumber | Pola URL |
|---|---|
| Irodori Starter, PDF per pelajaran | `https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L{NN}.pdf` (L0: `X_kyoshitsu.pdf`) |
| Irodori Starter, audio | `https://www.irodori.jpf.go.jp/en/starter/audio/lesson{NN}.html` |
| Irodori Elementary 1 | PDF `.../assets/data/elementary01/pdf/Y_L{NN}.pdf` · audio `.../en/elementary01/audio/lesson{NN}.html` |
| Irodori Elementary 2 | PDF `.../assets/data/elementary02/pdf/Z_L{NN}.pdf` · audio `.../en/elementary02/audio/lesson{NN}.html` |
| Irodori Pre-Intermediate | PDF `.../assets/data/pre-intermediate/pdf/ZZ_L{NN}.pdf` · audio `.../en/pre-intermediate/audio/lesson{NN}.html` |
| Materi Irodori berbahasa Indonesia | `https://sites.google.com/view/jf-irodori/halaman-pemelajar`. Isinya daftar kosakata, tata bahasa, kanji (.xlsx), lembar kerja, dan kunci jawaban untuk Starter, Elementary 1, dan Elementary 2 |
| Kaishi 1.5k versi Indonesia | `https://ankiweb.net/shared/info/1512066033` |
| NHK Easy Japanese (Indonesia) | `https://www.nhk.or.jp/lesson/id/` |
| NHK News Web Easy | `https://www3.nhk.or.jp/news/easy/` |
| Contoh soal JLPT resmi | `https://www.jlpt.jp/e/samples/forlearners.html` |
| Pendaftaran JLPT Indonesia | `https://jlptonline.or.id/` |

**Video YouTube:**
- Channel yang dipakai: Japanese Ammo with Misa (`@JapaneseAmmowithMisa`), ToKini Andy (`@ToKiniAndy`), 日本語の森 (`@nihongonomori2013`), Miku Real Japanese (`@MikuRealJapanese`), dan Comprehensible Japanese.
- Di kurikulum ini video ditulis sebagai **kata kunci pencarian**. ID video persisnya dipilih saat M2 (diverifikasi satu per satu, tidak ditebak), lalu disimpan sebagai `youtubeId` di data kurikulum.

## 2. Template node per unit

Section 1–3 memakai urutan yang sama di setiap unit. Unit 2 minggu berisi ±8 node.

```
ir Irodori pelajaran A        (PDF + audio, 40 XP)
mt Grammar batch (MD)         (poin grammar dari content/dojo/jp/*, 20 XP)
vd Video grammar              (10 XP)
ir Irodori pelajaran B        (40 XP)
kj Sprint kanji batch         (kuis bawaan, 10–15 XP)
ak Target Anki (kalau unit ini menutup bulan)   (30 XP)
dl Target Duolingo (kalau ada)                  (30 XP)
cp Checkpoint unit            (grammar recall + kanji + 5 soal pilihan ganda, ≥ 80%, 50 XP)
```

- `targetDate` setiap node = tanggal unit dibagi rata. Garis pace dihitung dari sini.
- Poin grammar (`n5-g01` …) didefinisikan di materi MD. **Urutan grammar adalah urutan umum belajar N5/N4/N3 yang dicocokkan dengan tema Irodori, bukan isi persis buku Irodori.** Kalau buku memperkenalkan pola lebih awal, langsung saja dipakai.

## 3. Section 0: かな Kana (9–30 Nov 2026)

**Target mingguan:** 7 hari aktif · ±5 jam · ≥ 3 sprint kana · tulis tangan semua huruf baru · romaji berhenti dipakai mulai 16 Nov.

| Unit | Tanggal | Node |
|---|---|---|
| **0.1 ひらがな dasar** | 9–15 Nov | [materi] `jp-01-hiragana` §1–3 (cara kerja kana, baris あ–の) · [video] "hiragana lesson Japanese Ammo with Misa" · [latihan] Sprint あ–の · [materi] `jp-01-hiragana` §4 (baris は–ん) · [latihan] Sprint は–ん · [refleksi] Tulis tangan 46 huruf ×5 (checklist) · [checkpoint] Checkpoint hiragana dasar |
| **0.2 Variasi + カタカナ dasar** | 16–22 Nov | [materi] `jp-01-hiragana` §5 (゛゜, ゃゅょ, っ, bunyi panjang) · [latihan] Sprint variasi · [checkpoint] Checkpoint ひらがな修了 · [materi] `jp-02-katakana` §1–3 · [video] "katakana lesson Japanese Ammo with Misa" · [latihan] Sprint katakana dasar |
| **0.3 Katakana serapan + persiapan** | 23–30 Nov | [materi] `jp-02-katakana` §4–6 (ー, ティ/ファ/ウィ, kata IT) · [latihan] Sprint katakana penuh · [refleksi] Tulis nama: ファウザン・プトラ・サンジャヤ · [Anki] Pasang Anki + Kaishi versi Indonesia, mulai 5 kartu/hari · [Duolingo] Duolingo: tab Huruf hiragana + katakana · [Irodori] Irodori L0 *Japanese in the classroom* (`X_kyoshitsu.pdf`) · [materi] `jp-00-cara-belajar` · [checkpoint] **Checkpoint かなマスター** (semua kana dasar + variasi, ≥ 95%, ≤ 4 menit) |

## 4. Section 1: N5 (1 Des 2026 – 4 Jul 2027)

**Target mingguan:**
- ≥ 6 hari aktif · ±7 jam;
- 1 pelajaran Irodori;
- 4 poin grammar + 1 video;
- 56 kartu Kaishi baru (8/hari);
- 2 sprint kanji;
- Duolingo 5 hari.

| Unit | Tanggal | [Irodori] Irodori | [materi] Grammar | [kanji] Kanji (dari `jp-04-kanji-n5`) | Node khusus |
|---|---|---|---|---|---|
| 1.1 Starting to Speak Japanese | 1–13 Des | X L01 *Good morning!* · X L02 *I'm sorry, I don't really understand.* | n5-g01–g04 | Batch 1: 一二三四五六 | [video] "Comprehensible Japanese complete beginner" |
| 1.2 About Myself | 14–27 Des | X L03 *Nice to meet you.* · X L04 *I live in Tokyo.* | g05–g08 | Batch 2: 七八九十百千 | [Anki] Kaishi 270 (31 Des) |
| 1.3 My Favorite Foods | 28 Des – 10 Jan | X L05 *I like udon.* · X L06 *I'd like a cheeseburger, please.* | g09–g12 | Batch 3: 万円日月火水 | |
| 1.4 Homes and Workplaces | 11–24 Jan | X L07 *There are four rooms.* · X L08 *Where is Yamada-san?* | g13–g16 | Batch 4: 木金土上下中 | [Anki] Kaishi 520 (31 Jan) |
| 1.5 Daily Life | 25 Jan – 7 Feb | X L09 *Lunch is from noon to 1 o'clock.* · X L10 *Please lend me the stapler.* | g17–g20 | Batch 5: 時分半午前後 | |
| 1.6 What I Like to Do | 8–21 Feb | X L11 *What kind of manga do you like?* · X L12 *Do you want to go for a drink together?* | g21–g24 | Batch 6: 今毎年週何人 | [Anki] Kaishi 740 (28 Feb) |
| 1.7 Walking around Town | 22 Feb – 7 Mar | X L13 *Does this bus go to the airport?* · X L14 *It's a big building, isn't it.* | g25–g28 | Batch 7: 大小高長山川 | |
| 1.8 At Stores | 8–21 Mar | X L15 *I need some batteries.* · X L16 *How much is this?* | g29–g32 | Batch 8: 白天気雨電車 | [milestone] **WAR: pendaftaran JLPT Juli 2027** (perkiraan Mar–Apr) |
| 1.9 Holidays | 22–31 Mar | X L17 *I went to see a movie.* · X L18 *I want to go to a hot spring.* | g33–g36 | Batch 9: 行来出入見聞 | [Duolingo] Duolingo Section 1 selesai · [Anki] Kaishi 990 · [lencana] lencana 入門修了 |
| 1.10 My Current Self (E1) | 1–14 Apr | Y L01 *I work in a restaurant.* · Y L02 *I like playing video games.* | g37–g40 | Batch 10: 読書話食飲休 | [Anki] Kaishi 1.230 (30 Apr) |
| 1.11 Seasons and Weather (E1) | 15–28 Apr | Y L03 *It gets very cold in winter.* · Y L04 *It rained heavily yesterday.* | g41–g44 | Batch 11: 東西南北外左 | |
| 1.12 My Town (E1) | 29 Apr – 12 Mei | Y L05 *It is very lively and convenient.* · Y L06 *Please tell me how to get to the post office.* | g45–g48 | Batch 12: 右名先生学校 | [Anki] Kaishi 1.480 (31 Mei) |
| 1.13 Going Out Together (E1) | 13–26 Mei | Y L07 *I will be a bit late because I got lost.* · Y L08 *Have you ever played baseball?* | g49–g52 | Batch 13: 友語国男女子 | |
| 1.14 Studying Japanese (E1) | 27 Mei – 9 Jun | Y L09 *Will you tell me how to read this?* · Y L10 *I would like to take a Japanese-language class.* | g53–g56 | Batch 14: 父母言立間本 + review semua | [Anki] **Kaishi 1.500 selesai** (±15 Jun) |
| 1.15 Persiapan N5 | 10 Jun – 4 Jul | | Review g01–g56 (SRS) | Review 84 kanji | [materi] `jp-07-jlpt-strategi` · [video] "日本語の森 N5" · [boss] Simulasi 1 (contoh soal resmi N5) · [boss] Simulasi 2 (ber-timer, 90 menit) · [milestone] **JLPT N5, Min 4 Jul 2027** |

## 5. Section 2: N4 (5 Jul – 5 Des 2027)

**Target mingguan:**
- ≥ 6 hari aktif · ±6 jam (berbarengan dengan Apple Academy);
- 1–1,5 pelajaran Irodori;
- 4 poin grammar;
- 70 kartu baru (deck pribadi dari Irodori);
- 2 sprint kanji;
- 1 sesi bicara mulai September.

| Unit | Tanggal | [Irodori] Irodori | [materi] Grammar (`jp-05-n4-grammar`) | Node khusus |
|---|---|---|---|---|
| 2.1 Delicious Dishes (E1) | 5–18 Jul | Y L11 *I will bring meat and vegetables.* · Y L12 *Your bento looks delicious.* | n4-g01–g04 | [Duolingo] Duolingo Section 2 selesai |
| 2.2 Communication at Work (E1) | 19 Jul – 1 Agu | Y L13 *It will probably end in about ten minutes.* · Y L14 *May I take a day off?* | g05–g08 | |
| 2.3 Healthy Life (E1) | 2–15 Agu | Y L15 *I have a fever, and my throat is sore.* · Y L16 *I try not to eat too much.* | g09–g12 | Wisuda (Agu). Mode sibuk boleh dipakai |
| 2.4 Personal Relationships (E1) | 16–29 Agu | Y L17 *This is a personal amulet my older brother gave me.* · Y L18 *How about giving something as a gift?* | g13–g16 | [milestone] **WAR: pendaftaran JLPT Des 2027** (perkiraan Agu–Sep) · [lencana] 初級1修了 |
| 2.5 People around Me (E2) | 30 Agu – 8 Sep | Z L01 *I just came to Japan last week.* · Z L02 *He looks a serious person.* | g17–g20 | [bicara] Sesi bicara pertama (italki/teman) |
| 2.6 At a Restaurant (E2) | 9–18 Sep | Z L03 *I cannot eat it because of an allergy.* · Z L04 *Please eat it without soy sauce.* | g21–g24 | |
| 2.7 Let's Go on a Trip (E2) | 19–28 Sep | Z L05 *You should make a reservation early.* · Z L06 *I am glad that I went to a lot of different places.* | g25–g28 | |
| 2.8 Local Events (E2) | 29 Sep – 8 Okt | Z L07 *If it rains, it will be held at the hall.* · Z L08 *Do you know where the food stands are?* | g29–g32 | |
| 2.9 Annual Events and Manners (E2) | 9–18 Okt | Z L09 *What do people do on Coming-of-Age Day?* · Z L10 *What kind of clothes should I wear?* | g33–g36 | |
| 2.10 Shopping Wisely (E2) | 19–28 Okt | Z L11 *I forgot to bring my point card.* · Z L12 *This vacuum cleaner is light and easy to move around.* | g37–g40 | |
| 2.11 Various Services (E2) | 29 Okt – 7 Nov | Z L13 *They display a lot of materials.* · Z L14 *Will you cut my bangs a little shorter?* | g41–g44 | [boss] Simulasi N4 #1 (akhir pekan) |
| 2.12 Nature and Environment (E2) | 8–17 Nov | Z L15 *The lights in the meeting room were left on.* · Z L16 *Do not panic in case of an earthquake.* | g45–g48 | |
| 2.13 My Life (E2) | 18–27 Nov | Z L17 *I can speak Japanese better than before.* · Z L18 *I am thinking about starting my own company in the future.* | g49–g52 | [lencana] 初級2修了 · [boss] Simulasi N4 #2 |
| 2.14 Persiapan N4 | 28 Nov – 5 Des | | g53–g60 + review | [materi] `jp-07-jlpt-strategi` §N4 · [video] "日本語の森 N4" · [boss] Simulasi N4 #3 (ber-timer) · [milestone] **JLPT N4, Min 5 Des 2027** |

**Kanji N4:** dari 84 ke ±250 kanji (±8 per minggu). Sumbernya:
- deck kanji bawaan Dōjō, dibuat dari KANJIDIC2 (lisensi CC BY-SA 4.0, EDRDG) dengan tag level JLPT lama, saat M3;
- atau lanjut WaniKani.

## 6. Section 3: N3 (6 Des 2027 – 2 Jul 2028)

**Target mingguan:**
- 7 hari aktif · **14–18 jam** (Apple Academy sudah selesai);
- 1 pelajaran Irodori (sampai April);
- 4 poin grammar;
- 5 artikel NHK Easy;
- 2 sesi bicara;
- 1 bab buku N3;
- ±13 kanji baru.
- Mulai Mei: 1 simulasi penuh setiap 2 minggu.

| Unit | Tanggal | [Irodori] Irodori Pre-Intermediate | [materi] Grammar (`jp-06-n3-grammar`) | Node khusus |
|---|---|---|---|---|
| 3.1 Things you like… | 6–19 Des | ZZ L01 *What is futsal again?* · ZZ L02 *I like watching TV dramas the most.* | n3-g01–g08 | [materi] `jp-00-cara-belajar` §N3 (cara belajar membaca) |
| 3.2 Where will you live? | 20 Des – 2 Jan | ZZ L03 *How are preparations for your move going?* · ZZ L04 *It seems like the air conditioner is broken...* | g09–g16 | |
| 3.3 Daily meals | 3–16 Jan | ZZ L05 *What kind of restaurant would be good?* · ZZ L06 *I cook for myself every day.* | g17–g24 | [buku] Buku N3: mulai bab 1 (Shin Kanzen Master / Sou Matome, pilih satu) |
| 3.4 Meeting people | 17–30 Jan | ZZ L07 *I hope I can become friends with many people.* · ZZ L08 *May I sit next to you?* | g25–g32 | |
| 3.5 Japanese and me | 31 Jan – 13 Feb | ZZ L09 *What made you interested in studying Japanese?* · ZZ L10 *How do you study Japanese?* | g33–g40 | |
| 3.6 What do you do in situations like this? | 14–27 Feb | ZZ L11 *This is a scam email.* · ZZ L12 *I need an ambulance.* | g41–g48 | |
| 3.7 Relationships with others | 28 Feb – 12 Mar | ZZ L13 *Congratulations on your marriage.* · ZZ L14 *I'm troubled about a friend.* | g49–g56 | [milestone] **WAR: pendaftaran JLPT Juli 2028** (perkiraan Mar–Apr) |
| 3.8 Joys of traveling | 13–26 Mar | ZZ L15 *I want to see Sakurajima.* · ZZ L16 *I was able to take lots of good photos.* | g57–g64 | |
| 3.9 Working in Japan | 27 Mar – 9 Apr | ZZ L17 *I will explain the work of the floor staff.* · ZZ L18 *I would be happy if you would allow me to work there.* | g65–g72 | [lencana] 中級へ |
| 3.10 Buku N3 intensif | 10 Apr – 14 Mei | | Review semua (SRS) | [buku] Grammar, kosakata, membaca, dan choukai: 1 bab per hari kerja · [video] "日本語の森 N3" |
| 3.11 Simulasi dan strategi | 15 Mei – 2 Jul | | | [materi] `jp-07-jlpt-strategi` §N3 · [boss] Simulasi penuh #1–#4 (setiap 2 minggu) · [refleksi] Analisis kesalahan per bagian · [milestone] **JLPT N3, Min 2 Jul 2028** |

**Membaca dan mendengar setiap minggu (Section 3):**
- NHK News Web Easy 5 artikel;
- graded reader Tadoku level 2–3;
- Comprehensible Japanese tingkat menengah;
- Miku Real Japanese;
- film Jepang dengan subtitle Jepang, misalnya *Perfect Days*, *Shoplifters*, *Drive My Car*.

## 7. Section 4: ビジネス Bahasa Jepang kerja (3 Jul – 30 Sep 2028)

| Unit | Tanggal | Node |
|---|---|---|
| 4.1 敬語 Keigo dasar | 3–16 Jul | [materi] `jp-08-bahasa-kerja` §1–2 · [latihan] Kartu keigo (尊敬語/謙譲語) · [bicara] Latihan bicara: menelepon dan menerima tamu |
| 4.2 報連相 Komunikasi kantor | 17–30 Jul | [materi] §3 (aisatsu, 報告・連絡・相談) · [bicara] Simulasi melapor progres |
| 4.3 Chat dan email kerja | 31 Jul – 13 Agu | [materi] §4 (template Slack/email) · [refleksi] Tulis 5 pesan kerja, lalu dikoreksi tutor |
| 4.4 Kosakata IT dan dokumen | 14–27 Agu | [materi] §5 (デプロイ, 仕様, 実装, 不具合, 本番環境 …) · [latihan] Kartu IT 100 kata · [lintas jalur] Lintas jalur: baca 3 soal AtCoder dalam bahasa Jepang |
| 4.5 Hasil N3 dan rencana N2 | ±akhir Agu | [milestone] Cek hasil JLPT N3 · [refleksi] Rencana N2 (Des 2028 atau Jul 2029) · kalau belum lulus: daftar JLPT Des 2028 di Jepang (pendaftaran ±Agu–Sep) |
| 4.6 Persiapan hari pertama | 1–30 Sep | [refleksi] Jikoshōkai 1 menit, dihafal · [materi] Baca ulang offer letter MISUMI tanpa terjemahan · [milestone] **1 Okt 2028 MISUMI Day 1** |

## 8. Target bulanan

| Bulan | Irodori | Grammar | Kanji (kumulatif) | Anki | Duolingo | Lainnya |
|---|---|---|---|---|---|---|
| Nov 2026 | L0 | Kana | 0 | Kaishi mulai (±20) | Tab Huruf | かなマスター |
| Des 2026 | X L1–L4 (+L5) | n5 g01–g08 | 12 | Kaishi 270 | S1 ±30% | |
| Jan 2027 | X L5–L8 | g09–g16 | 24 | 520 | S1 ±55% | |
| Feb 2027 | X L9–L12 | g17–g24 | 36 | 740 | S1 ±80% | |
| Mar 2027 | X L13–L18 ✓ | g25–g36 | 54 | 990 | **S1 ✓** | War pendaftaran N5 |
| Apr 2027 | Y L1–L4 | g37–g44 | 66 | 1.230 | S2 ±30% | |
| Mei 2027 | Y L5–L8 | g45–g52 | 78 | 1.480 | S2 ±65% | |
| Jun 2027 | Y L9–L10 | g53–g56 + review | 84 | **1.500 ✓** | S2 ±90% | 2 simulasi N5 |
| Jul 2027 | Y L11–L14 | n4 g01–g08 | ±100 | Deck pribadi 10/hari | **S2 ✓** | **N5 (4 Jul)** |
| Agu 2027 | Y L15–L18 ✓ | g09–g16 | ±135 | | S3 ±25% | War N4 · wisuda |
| Sep 2027 | Z L1–L6 | g17–g28 | ±170 | | S3 ±50% | Sesi bicara mulai |
| Okt 2027 | Z L7–L12 | g29–g40 | ±205 | | S3 ±75% | |
| Nov 2027 | Z L13–L18 ✓ | g41–g52 | ±240 | | **S3 ✓** | 2 simulasi N4 |
| Des 2027 | ZZ L1–L4 | n4 review + n3 g01–g16 | ±270 | Deck N3 10/hari | Jaga streak | **N4 (5 Des)** |
| Jan 2028 | ZZ L5–L8 | g17–g32 | ±330 | | | Buku N3 mulai |
| Feb 2028 | ZZ L9–L12 | g33–g48 | ±390 | | | |
| Mar 2028 | ZZ L13–L16 | g49–g64 | ±450 | | | War N3 |
| Apr 2028 | ZZ L17–L18 ✓ | g65–g72 | ±520 | | | Buku N3 intensif |
| Mei 2028 | | Review | ±590 | | | Simulasi #1–#2 |
| Jun 2028 | | Review | ±650 | | | Simulasi #3–#4 |
| Jul 2028 | | Keigo | | | | **N3 (2 Jul)** |
| Agu 2028 | | Bahasa kerja | | | | Hasil N3 |
| Sep 2028 | | Hari pertama | | | | Siap ke 九段下 |

Target Duolingo ditulis per *section*. Struktur kursus Duolingo bisa berubah, jadi sesuaikan di Pengaturan kalau isinya berbeda.

## 9. Sesi JLPT awal (seed `jlpt_session`, semua `is_estimate = true`)

| Ujian | Level | Pendaftaran (perkiraan) | Kota |
|---|---|---|---|
| Min, 4 Jul 2027 | N5 | Mar–Apr 2027 | Jakarta/Bogor/Tangerang (pilih saat daftar) |
| Min, 5 Des 2027 | N4 | Agu–Sep 2027 | sama |
| Min, 2 Jul 2028 | **N3** | Mar–Apr 2028 | sama |
| Min, 3 Des 2028 | Cadangan N3 / N2 | Agu–Sep 2028, **di Jepang** | Tokyo |

JLPT di Indonesia diselenggarakan The Japan Foundation Jakarta di 16 kota. Jepang sedang mengkaji tambahan sesi ujian mulai 2027, jadi cek `jlptonline.or.id` dan `jlpt.jp`, lalu ubah tabelnya kalau ada perubahan.
