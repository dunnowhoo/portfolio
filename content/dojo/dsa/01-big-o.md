---
id: dsa-01-big-o
track: dsa
title: Big-O dan Menghitung Kompleksitas
order: 1
estMinutes: 30
xp: 20
tags: [fondasi, kompleksitas]
---

# Big-O dan menghitung kompleksitas

Big-O menjawab satu pertanyaan: **kalau input membesar, seberapa cepat kerja (atau memori) algoritma ikut membesar?** Konstanta dan suku kecil dibuang, karena yang dilihat hanya bentuk pertumbuhannya.

## 1. Kelas yang wajib dikenali

| Big-O | Nama | Contoh |
|---|---|---|
| O(1) | Konstan | Akses `arr[i]`, `dict[k]`, `set` lookup (rata-rata) |
| O(log n) | Logaritmik | Binary search, operasi heap |
| O(n) | Linear | Satu loop, two pointers, sliding window |
| O(n log n) | Linearitmik | Sorting, n operasi heap |
| O(n²) | Kuadratik | Dua loop bersarang, DP 2D n×n |
| O(2ⁿ) | Eksponensial | Semua subset, rekursi bercabang dua tanpa memo |
| O(n!) | Faktorial | Semua permutasi |

## 2. Aturan menghitung

1. **Loop berurutan dijumlahkan:** O(n) + O(n) = O(n).
2. **Loop bersarang dikalikan:** for i in n, for j in n → O(n²).
3. **Membagi masalah menjadi setengah setiap langkah** → O(log n).
4. **Rekursi:** jumlah pemanggilan × kerja per pemanggilan.
   - Fibonacci naif: ±2ⁿ pemanggilan × O(1) = O(2ⁿ).
   - Dengan memo: n state × O(1) = O(n).
5. **Dua input berbeda punya dua variabel.** Loop atas string a lalu b adalah O(a + b), bukan O(n).
6. **Biaya tersembunyi di Python:**
   - `x in list` = O(n), sedangkan `x in set` = O(1);
   - `s[i:j]` (slicing) = O(j − i);
   - `list.pop(0)` = O(n); pakai `deque.popleft()` yang O(1);
   - `s1 + s2` di dalam loop bisa menjadi O(n²); kumpulkan dulu di list, lalu `''.join(...)`.

## 3. Kompleksitas ruang

Hitung memori **tambahan**: struktur bantu (dict, set, array dp) dan **kedalaman call stack** rekursi. DFS di pohon berkedalaman h memakai O(h) stack.

## 4. Membaca constraint untuk menebak target

Asumsikan ±10⁷–10⁸ operasi sederhana per detik (Python lebih lambat, jadi pakai batas bawah).

| n maksimum | Target kompleksitas | Petunjuk pola |
|---|---|---|
| ≤ 10–12 | O(n!) atau O(2ⁿ·n) | Backtracking penuh |
| ≤ 20–25 | O(2ⁿ) | Subset, bitmask |
| ≤ 500 | O(n³) | DP 3 indeks |
| ≤ 5.000 | O(n²) | DP 2D, dua loop |
| ≤ 10⁵ – 10⁶ | O(n log n) atau O(n) | Sort, heap, hash map, two pointers |
| ≤ 10⁹ (nilai, bukan panjang) | O(log n) | Binary search on answer, matematika |

Kebiasaan bagus saat interview: tanyakan "n-nya sampai berapa?" sebelum memilih pendekatan.

## 5. Contoh analisis

```python
def has_pair_with_sum(nums, target):        # n = len(nums)
    seen = set()                            # ruang O(n)
    for x in nums:                          # n kali
        if target - x in seen:              # O(1) rata-rata
            return True
        seen.add(x)                         # O(1) rata-rata
    return False                            # waktu O(n), ruang O(n)
```

Bandingkan dengan dua loop bersarang (O(n²) waktu, O(1) ruang). Ini **trade-off** klasik: ruang ditukar dengan waktu.

## 6. Kartu review

- **T:** `x in my_list` di dalam loop n kali, kompleksitasnya? **J:** O(n²). Ganti dengan set.
- **T:** Binary search pada 1 juta elemen, berapa langkah? **J:** ±20 (2²⁰ ≈ 10⁶).
- **T:** Fibonacci rekursif tanpa memo? **J:** Waktu O(2ⁿ), ruang O(n) untuk stack.
- **T:** n ≤ 10⁵, target kompleksitas? **J:** O(n log n) atau O(n).
- **T:** Sorting lalu satu loop? **J:** O(n log n).
