---
id: dsa-04-problem-solving
track: dsa
title: Metode UMPIRE dan Cara Bicara saat Interview
order: 4
estMinutes: 25
xp: 20
tags: [fondasi, interview, metode]
---

# Metode UMPIRE dan cara bicara saat interview

Interviewer tidak hanya menilai apakah kodemu benar. Yang dinilai: **cara memahami masalah, memilih pendekatan, berkomunikasi, menulis kode bersih, dan menguji.** UMPIRE membuat semua itu terlihat.

## U · Understand (2–5 menit)
- Ulangi soal dengan kata sendiri: "Jadi aku perlu…, betul?"
- Tanyakan **constraint**:
  - ukuran n;
  - rentang nilai (ada negatif? nol?);
  - ada duplikat?;
  - input kosong?;
  - sudah terurut?;
  - harus in-place?;
  - kalau ada banyak jawaban, yang mana yang dikembalikan?
- Buat **2–3 contoh**: satu normal, satu *edge case* (kosong, satu elemen, semua sama, negatif).

## M · Match (1–3 menit)
Cocokkan sinyal di soal dengan pola:

| Sinyal di soal | Pola pertama yang dicoba |
|---|---|
| "pernah muncul", "pasangan berjumlah", "kelompokkan" | Hash map / set |
| Array **terurut**, cari pasangan | Two pointers / binary search |
| Subarray/substring **kontigu** terpanjang/terpendek | Sliding window |
| Kurung, "elemen berikutnya yang lebih besar" | Stack / monotonic stack |
| "Minimum/maksimum yang memenuhi syarat" dengan jawaban monoton | Binary search on answer |
| k terbesar/terkecil, median berjalan | Heap |
| Semua kombinasi/permutasi/subset | Backtracking |
| Grid, pulau, jaringan, prasyarat | BFS/DFS, topological sort, Union-Find |
| Jalur terpendek berbobot | Dijkstra |
| "Jumlah cara", "minimum biaya", pilihan bertingkat | Dynamic programming |
| Rentang waktu atau jadwal | Intervals (sort + merge/heap) |

## P · Plan (2–5 menit)
- Sebutkan **brute force** dan kompleksitasnya terlebih dulu. Ini menunjukkan kamu paham masalahnya.
- Jelaskan optimasinya dan **kenapa** lebih cepat.
- Tulis langkah dalam 3–6 baris komentar sebelum coding. Minta persetujuan: "Boleh aku mulai menulis kodenya?"

## I · Implement (10–20 menit)
- Nama variabel jelas: `left`, `right`, `seen`, `count`, bukan `a`, `b`, `x2`.
- Fungsi bantu kecil kalau logikanya bercabang, misalnya `in_bounds(r, c)`.
- **Terus bicara**: "Di sini aku mengecilkan jendela selama hurufnya masih duplikat…"

## R · Review (3–5 menit)
- Jalankan contoh dengan tangan baris per baris (*dry run*). Jangan langsung bilang "sudah benar".
- Cek *off-by-one*, indeks keluar batas, dan input kosong.

## E · Evaluate (1–2 menit)
- Sebutkan kompleksitas **waktu dan ruang** akhir.
- Sebutkan trade-off dan perbaikan yang mungkin, misalnya "Kalau inputnya streaming, aku akan memakai heap."

## Kalimat yang berguna saat interview (EN)

- "Let me restate the problem to make sure I understand…"
- "Can the input be empty? Are there negative numbers? Duplicates?"
- "The brute force would be O(n²) by checking every pair. We can do better with a hash map."
- "I'll walk through an example to verify."
- "The time complexity is O(n) and space is O(n) for the map."
- "If I had more time, I would…"

## Kalau buntu saat interview
1. Kembali ke contoh kecil dan selesaikan **dengan tangan**. Pola sering terlihat dari situ.
2. Sederhanakan masalahnya: "Bagaimana kalau array-nya sudah terurut?" atau "Bagaimana kalau k = 1?"
3. Ucapkan hipotesis dengan jujur: "Aku curiga ini bisa pakai heap karena…". Interviewer sering memberi petunjuk kalau kamu terus bicara.

## Rubrik penilaian mandiri (dipakai di mock interview)

| Aspek | 1 | 3 | 5 |
|---|---|---|---|
| Pemahaman | Langsung coding | Tanya sebagian constraint | Constraint dan contoh lengkap |
| Pendekatan | Tidak jelas | Brute force saja | Brute force → optimal, beserta alasannya |
| Kode | Banyak bug | Jalan dengan perbaikan | Bersih, jalan sekali |
| Uji | Tidak ada | Contoh normal | Normal + edge case, dry run |
| Komunikasi | Diam | Sesekali | Terus menjelaskan dengan jelas |
