# Aset gambar Dōjō (OpenAI Images)

Status: Draft v1 · 9 November 2026 · Dijalankan **sekali, di laptop**, saat M5. Bukan di server.

## 1. Aturan pakai key

1. Kamu sendiri yang menaruh key di `portfolio-web/.env.local` sebagai `OPENAI_API_KEY=...`. File ini sudah di-gitignore lewat pola `*.local`.
2. Script `npm run assets:generate` hanya membaca env itu. Key tidak ditulis ke repo, Vercel, log, atau bundle.
3. Pasang batas biaya (*usage limit*) di project OpenAI sebelum menjalankan script.
4. Setelah semua aset jadi, **rotate key** di platform.openai.com → API keys. Key yang sudah pernah ditempel di chat sebaiknya dianggap bocor.

## 2. Gaya visual (berlaku untuk semua prompt)

```
STYLE = "soft 3D clay render, rounded friendly shapes, subtle glossy highlights,
gentle studio lighting from top-left, Apple-like minimal aesthetic, clean, calm,
pastel-leaning palette with vermilion red (#E8453C) and Apple blue (#0066CC) accents,
no text, no letters, no logos, no watermark, centered composition"
```

- **Kenapa gaya clay 3D:** paling serasi dengan kartu kaca, bayangan lembut, dan ikon bulat di portfolio.
- **Tidak ada teks di gambar.** Teks dari generator gambar sering salah eja, apalagi kanji. Semua teks ditambahkan lewat HTML.
- **Latar:**
  - transparan untuk maskot, lencana, dan Daruma;
  - gradasi `#f5f5f7` → putih untuk banner.
- Maskot dibuat dulu sebagai **master**. Varian lain dibuat dengan *image edit* yang memakai master sebagai referensi, supaya karakternya konsisten.

## 3. Karakter: Daru ダル

> A small round Daruma doll character named Daru: glossy vermilion-red body, white face with
> big determined friendly eyes, small thick eyebrows, tiny smile, a white hachimaki headband
> tied at the back, short stubby arms, sitting upright. Cute but not childish, mature and calm.

- Daru untuk DSA memakai tubuh **biru** `#0066CC`. Wajah dan ikat kepalanya sama.
- Sabuk 帯 di perut Daru dibuat sebagai **lapisan SVG terpisah** yang warnanya mengikuti level. Dengan begitu tidak perlu 10 gambar berbeda.

## 4. Daftar aset

Format: **ID** · ukuran · latar · deskripsi singkat untuk prompt (selalu ditambah `STYLE`).

### 4.1 Maskot (transparan, 1024×1024 → WebP 512 dan 256)

| ID | Deskripsi |
|---|---|
| `daru-master` | Daru duduk tegak menghadap depan, netral tersenyum (**master referensi**) |
| `daru-cheer` | Daru melompat kecil, kedua tangan terangkat, mata berbinar |
| `daru-study` | Daru memegang buku terbuka kecil, ada pensil di samping |
| `daru-code` | Daru biru duduk di depan laptop kecil, ada simbol kurung kurawal melayang samar (bukan huruf) |
| `daru-fire` | Daru dengan aura api oranye lembut di belakangnya (streak) |
| `daru-ice` | Daru memeluk kristal es biru muda (freeze) |
| `daru-cracked` | Daru miring dengan retakan kecil lucu yang ditempel plester (streak retak) |
| `daru-sleep` | Daru tertidur dengan bantal kecil (status "belum belajar" di malam hari) |
| `daru-belt` | Daru mengikat sabuk dengan kedua tangan, pose bangga (modal naik level; sabuknya putih supaya bisa diwarnai) |
| `daru-peek` | Daru mengintip dari tepi bawah (login, keadaan kosong) |
| `daru-graduate` | Daru memakai topi toga kecil (lulus JLPT) |
| `daru-suit` | Daru memakai jas kerja kecil dan tas, siap ke kantor (MISUMI Day 1) |

### 4.2 Banner (1536×640 → WebP 1536 dan 768, latar gradasi terang)

| ID | Deskripsi |
|---|---|
| `banner-home` | Siluet kota Tokyo yang tenang saat pagi, gedung rendah dan pepohonan Chiyoda, langit pastel, Daru kecil di kanan bawah melambai |
| `banner-jp-kana` | Kuas kaligrafi, batu tinta, dan kertas washi melayang lembut (tanpa huruf) |
| `banner-jp-n5` | Jalan kecil kampung Jepang dengan lentera dan sepeda, nuansa hangat |
| `banner-jp-n4` | Peron stasiun kecil dengan kereta pastel dan pohon sakura |
| `banner-jp-n3` | Perpustakaan modern bergaya Jepang dengan jendela besar, cahaya sore |
| `banner-jp-biz` | Kantor modern terang dengan meja kerja, laptop, dan tanaman, pemandangan kota di jendela |
| `banner-dsa-foundation` | Balok-balok bangun 3D tersusun rapi seperti fondasi, nuansa biru |
| `banner-dsa-linear` | Deretan kotak array dan rel yang memanjang ke kejauhan |
| `banner-dsa-trees` | Pohon bonsai yang cabangnya rapi seperti struktur pohon biner |
| `banner-dsa-graphs` | Jaringan simpul bulat terhubung garis halus, seperti peta kereta abstrak |
| `banner-dsa-dp` | Tangga dan kotak-kotak tabel 3D yang tersusun bertingkat |
| `banner-dsa-mastery` | Puncak gunung dengan bendera kecil di bawah langit cerah |

### 4.3 Streak dan perayaan (1200×630, latar terang)

| ID | Deskripsi |
|---|---|
| `streak-7` | Api kecil menyala hangat dengan Daru bersorak |
| `streak-30` | Api lebih besar dan obor, Daru memakai hachimaki merah |
| `streak-100` | Api megah berbentuk phoenix kecil yang lembut, Daru berpose bangga |
| `streak-365` | Matahari terbit di belakang Gunung Fuji yang abstrak, Daru di depan |
| `perfect-week` | Tujuh lentera kecil menyala berjajar |
| `levelup-bg` | Latar dojo kayu terang dengan tirai noren polos (tanpa tulisan) |

### 4.4 Lencana (transparan, 512×512 → WebP 256)
Bentuknya seragam: medali bulat clay dengan pita. Yang berbeda hanya **simbol di tengahnya**. Nama lencana tetap ditulis di HTML.

| ID | Simbol di tengah |
|---|---|
| `badge-kana` | Kuas dan batu tinta |
| `badge-irodori` | Buku terbuka dengan pembatas warna-warni |
| `badge-kanji` | Stempel hanko bulat merah polos |
| `badge-jlpt` | Kertas ujian dengan pensil dan centang |
| `badge-war` | Bendera kecil di atas tumpukan formulir |
| `badge-dsa-first` | Kurung kurawal clay |
| `badge-dsa-100` | Tumpukan kubus bertingkat |
| `badge-topic-master` | Mahkota kecil di atas kubus |
| `badge-streak` | Api di dalam lingkaran |
| `badge-nitoryu` | Dua pedang kayu bokken bersilang |
| `badge-repair` | Daruma kecil bangkit dari posisi miring |
| `badge-perfect-week` | Tujuh bintang melingkar |

### 4.5 Daruma target (transparan, 1024×1024)

| ID | Deskripsi |
|---|---|
| `daruma-goal-red` | Boneka Daruma tradisional merah **tanpa bola mata** (lingkaran putih kosong). Mata kiri dan kanan digambar dengan SVG di atasnya |
| `daruma-goal-blue` | Sama, warna biru (untuk target DSA) |
| `daruma-goal-gold` | Sama, warna emas (untuk MISUMI Day 1) |

**Total: ±48 gambar.**
- Perkiraan biaya: ±US$1–6, tergantung model dan kualitas. Harga per gambar 1024² berkisar sekitar US$0,01–0,21 menurut sumber per November 2026.
- Biaya dicek ulang di halaman harga OpenAI sebelum script dijalankan.

## 5. Pipeline

```
scripts/assets.manifest.json
  [{ "id": "daru-cheer", "size": "1024x1024", "background": "transparent",
     "quality": "high", "prompt": "...", "reference": "daru-master" }, ...]

npm run assets:generate -- --only daru-master   # buat master dulu, review manual
npm run assets:generate -- --group mascot       # varian dengan referensi master
npm run assets:generate -- --group banner,badge,streak,daruma
npm run assets:optimize                          # sharp → WebP + ukuran @1x/@2x → public/dojo/
```

- Kalau hasilnya jelek, ubah prompt di manifest lalu jalankan ulang hanya ID itu (`--only`). Biaya per gambar kecil.
- Hasil PNG asli disimpan di `tmp/assets/` (di-gitignore). Yang di-commit hanya WebP yang sudah dioptimasi di `public/dojo/`.
- **Fallback latar transparan:** kalau model yang dipakai tidak mendukungnya, generate dengan latar putih polos lalu hapus latarnya dengan Canva *remove background* atau `rembg` lokal.
- Setiap aset diberi `alt` di kode, misalnya `alt="Daru, maskot Dōjō, bersorak"`.
