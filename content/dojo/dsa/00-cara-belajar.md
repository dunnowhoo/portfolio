---
id: dsa-00-cara-belajar
track: dsa
title: Cara Belajar DSA di Dōjō
order: 0
estMinutes: 15
xp: 20
tags: [metode, srs, jurnal]
---

# Cara belajar DSA di Dōjō

Tujuannya **bukan** menghafal 150 jawaban. Tujuannya mengenali **±30 pola** dengan cepat, lalu menulis kode yang benar di bawah tekanan waktu. Semua aturan di bawah melayani dua hal itu.

## 1. Siklus satu soal

```
Baca → Pahami → Tebak pola → Brute force → Optimasi → Kode → Uji → Catat → Review (SRS)
```

- **Batas waktu 25 menit sebelum melihat bantuan.** Lebih dari itu, kamu lebih banyak frustrasi daripada belajar.
- **Urutan bantuan:**
  1. hint di LeetCode;
  2. 2 menit pertama video NeetCode (bagian intuisi saja);
  3. video penuh.
- **Setelah melihat solusi, wajib menulis ulang dari nol tanpa melihat.** Ini yang membuat solusi menempel di kepala.
- Catat dengan jujur di Dōjō: menit, pakai hint atau tidak, dan rating keyakinan.

## 2. Arti rating

| Rating | Arti | Review berikutnya (soal baru) |
|---|---|---|
| **Lupa** | Butuh solusi atau tidak bisa sama sekali | Besok |
| **Sulit** | Bisa, tapi lama atau pakai hint | 2 hari |
| **Baik** | Bisa sendiri dalam waktu wajar | 4 hari |
| **Mudah** | Langsung tahu polanya dan selesai cepat | 7 hari |

Review berarti **mengerjakan ulang dari nol**, maksimal 25 menit. Kalau waktu mepet, pakai mode cepat: tulis pola, ide kunci, dan kompleksitas dalam 3 menit, lalu cek.

## 3. Jurnal pola

Setiap selesai soal, isi tiga baris di tab **Catatan**:

```
Pola: Sliding window (variable)
Sinyal: "substring kontigu terpanjang" + syarat bisa dicek inkremental
Kesalahan: lupa mengecilkan jendela dengan while, bukan if
```

Jurnal ini menjadi bahan Tebak Pola dan bahan bicara saat interview ("aku memilih sliding window karena…").

## 4. Ritme mingguan (fase D1–D18)

| Hari | Fokus | Waktu |
|---|---|---|
| Senin–Jumat | 1 soal baru per hari + Tebak Pola | 45–60 menit |
| Sabtu | 2–3 review SRS | 45 menit |
| Minggu | **Boss**: 2 soal 45 menit ber-timer + refleksi | 60 menit |

Kalau harinya berat, cukup amankan streak: Tebak Pola (10 XP) + 1 review cepat (10 XP).

## 5. Aturan yang sering dilanggar (jangan!)

1. **Langsung coding tanpa contoh.** Selalu tulis 2 contoh kecil dulu, termasuk satu *edge case*.
2. **Menghindari soal Hard.** Hard di NC150 kebanyakan "Medium + satu ide". Coba 25 menit, lalu pelajari idenya.
3. **Menonton tanpa menulis ulang.** Ilusi paham. Kalau tidak bisa menulis ulang, artinya belum paham.
4. **Tidak pernah review.** Tanpa SRS, 60–70% soal akan terlupa dalam sebulan.
5. **Diam saat mengerjakan.** Interview menilai cara berpikir. Latih bicara sejak awal, walaupun hanya ke diri sendiri.
