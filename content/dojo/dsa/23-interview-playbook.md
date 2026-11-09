---
id: dsa-23-interview-playbook
track: dsa
title: Interview Playbook, Mock Interview, dan Tes Coding Jepang
order: 23
estMinutes: 40
xp: 20
tags: [interview, mock, kontes, atcoder, paiza]
---

# Interview playbook: mock interview dan tes coding Jepang

## 1. Format yang akan kamu temui

| Format | Ciri | Persiapan di Dōjō |
|---|---|---|
| Live coding (global, gaya LeetCode) | 45–60 menit, 1–2 soal, berbicara dengan interviewer | Mock mingguan (D19), rubrik di `dsa-04` |
| Online assessment (HackerRank, CodeSignal, dll.) | 60–90 menit, 2–4 soal, test case tersembunyi | Boss ber-timer setiap topik |
| **paiza** (banyak dipakai perusahaan Jepang) | Soal skill check rank D–S; input dari stdin, output ke stdout | D20: 1× per bulan, target rank A |
| **AtCoder-style** | Soal berbahasa Jepang (sering juga ada versi Inggris), batas waktu ketat, input stdin | D20: ABC 1× per 2 minggu |
| Take-home | Proyek kecil 1–3 hari | Kualitas kode, README, tes, dan alasan desain |

## 2. Protokol mock interview (45 menit)

1. Pilih **2 soal acak** dari topik yang sudah selesai: 1 Medium, lalu 1 Medium/Hard. Dōjō bisa memilihkannya.
2. Nyalakan perekam layar dan mikrofon. **Bicara dalam bahasa Inggris** (dan sesekali coba bahasa Jepang di 2028).
3. Jalankan UMPIRE (`dsa-04`). Jangan buka solusi.
4. Setelah 45 menit, tonton ulang 10 menit pertama rekamanmu, lalu isi rubrik 1–5.
5. Catat **satu** hal yang akan diperbaiki di mock berikutnya.

Lebih baik lagi kalau bisa bertukar peran dengan teman sesama pejuang interview: satu jadi interviewer, satu jadi kandidat.

## 3. Checklist H-1 interview
- [ ] Review 10 soal ★ terendah dalam mode cepat (pola + kompleksitas).
- [ ] Baca ulang lembar "Sinyal → pola" di `dsa-04`.
- [ ] Siapkan 3 cerita proyek dengan format STAR (Situation, Task, Action, Result). Contohnya Halo AI dan Propago (62 pengguna dalam 3 minggu).
- [ ] Siapkan pertanyaan untuk interviewer: tim, cara kerja, tantangan teknis.
- [ ] Tes kamera, mikrofon, dan editor yang akan dipakai.
- [ ] Tidur cukup. Performa interview jauh lebih dipengaruhi kondisi daripada 1 soal tambahan.

## 4. Template input untuk AtCoder dan paiza (Python)
```python
import sys
input = sys.stdin.readline

def main():
    n, k = map(int, input().split())
    a = list(map(int, input().split()))
    # ... logika ...
    print(answer)

main()
```
- Kalau tersedia, pilih **PyPy** untuk soal berat, karena loop di PyPy jauh lebih cepat.
- Untuk rekursi dalam, pakai `sys.setrecursionlimit(10**6)`, atau lebih aman ubah ke iteratif.
- Output banyak baris: `print("\n".join(map(str, res)))`.

## 5. Kosakata soal kompetitif dalam bahasa Jepang (masuk deck Anki)

| Jepang | Baca | Arti |
|---|---|---|
| 問題文 | もんだいぶん | Teks soal |
| 制約 | せいやく | Batasan (constraint) |
| 入力 / 出力 | にゅうりょく / しゅつりょく | Input / output |
| 入力例 / 出力例 | にゅうりょくれい / しゅつりょくれい | Contoh input / output |
| 整数 | せいすう | Bilangan bulat |
| 文字列 | もじれつ | String |
| 数列 / 配列 | すうれつ / はいれつ | Barisan / array |
| 最大 / 最小 | さいだい / さいしょう | Maksimum / minimum |
| 個数 | こすう | Jumlah (banyaknya) |
| 求めよ / 求めてください | もとめよ | Hitunglah / carilah |
| 満たす | みたす | Memenuhi |
| 存在する | そんざいする | Ada |
| 以上 / 以下 | いじょう / いか | ≥ / ≤ |
| 未満 / より大きい | みまん / よりおおきい | < / > |
| 異なる | ことなる | Berbeda (distinct) |
| 昇順 / 降順 | しょうじゅん / こうじゅん | Urutan naik / turun |
| 部分列 / 連続部分列 | ぶぶんれつ / れんぞくぶぶんれつ | Subsequence / subarray kontigu |
| 頂点 / 辺 | ちょうてん / へん | Vertex / edge |
| 木 / 最短経路 | き / さいたんけいろ | Pohon / jalur terpendek |
| 空白区切り / 改行 | くうはくくぎり / かいぎょう | Dipisah spasi / baris baru |

## 6. Kontes
- **LeetCode Weekly Contest** biasanya Minggu pagi WIB. **Biweekly** biasanya Sabtu malam WIB.
- **AtCoder Beginner Contest (ABC)** biasanya Sabtu 21:00 JST (19:00 WIB), 100 menit.
- **Tujuan kontes bukan peringkat.** Tujuannya terbiasa dengan tekanan waktu dan membaca soal baru dengan cepat. Setelah kontes, kerjakan **satu soal yang tidak selesai** sampai tuntas (*upsolve*). Upsolve memberi pelajaran paling banyak.
- **Target realistis:**
  - LeetCode: Q1–Q2 stabil, Q3 sesekali;
  - AtCoder: A–C stabil, lalu D.

## 7. Kesalahan umum saat interview (dan penangkalnya)

| Kesalahan | Penangkal |
|---|---|
| Langsung coding | Wajib tulis 2 contoh + brute force dulu |
| Diam saat berpikir | Ucapkan hipotesis, walaupun belum yakin |
| Panik saat buntu | Kembali ke contoh kecil, atau sederhanakan soal |
| Tidak menguji | *Dry run* dengan contoh, lalu edge case |
| Lupa kompleksitas | Selalu tutup dengan "waktu O(…), ruang O(…)" |

## 8. Kartu review
- **T:** Isi rubrik mock? **J:** Pemahaman, pendekatan, kode, uji, komunikasi (masing-masing 1–5).
- **T:** Arti 制約? **J:** Batasan (constraint).
- **T:** 以下 vs 未満? **J:** ≤ vs <.
- **T:** Apa itu upsolve? **J:** Menyelesaikan soal kontes yang gagal setelah kontes selesai.
