---
id: dsa-09-binary-search
track: dsa
title: Binary Search
order: 9
estMinutes: 40
xp: 20
tags: [binary-search, on-answer, rotated]
---

# Binary Search

**Ide inti:** kalau ada sifat **monoton** (sebelum titik tertentu "tidak", sesudahnya "ya"), ruang pencarian bisa dibuang setengahnya setiap langkah. Hasilnya O(log n).

## 1. Sinyal
- Array **terurut** (atau terurut lalu dirotasi)
- "Cari nilai **minimum/maksimum** yang memenuhi syarat", dan kalau x memenuhi, semua yang lebih besar juga memenuhi → **binary search on answer**
- Constraint nilai sangat besar (10⁹) tapi pengecekan per kandidat murah

## 2. Template A: cari nilai persis
```python
def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:                    # ruang [l, r] inklusif
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[m] < target:
            l = m + 1
        else:
            r = m - 1
    return -1
```

## 3. Template B: batas pertama yang "ya" (lower bound)
Ini template paling serbaguna. Pikirkan predikat `ok(x)` yang bernilai False…False True…True. Cari True pertama.

```python
def first_true(lo, hi, ok):          # mencari di [lo, hi], dijamin ok(hi) True
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                 # mid mungkin jawaban; jangan dibuang
        else:
            lo = mid + 1
    return lo
```

**Binary search on answer**, contohnya Koko Eating Bananas:
```python
def min_eating_speed(piles, h):
    def ok(k):                                   # dengan kecepatan k, cukupkah h jam?
        return sum((p + k - 1) // k for p in piles) <= h   # ceil tanpa float
    return first_true(1, max(piles), ok)
```

Soal sejenis: kapasitas kapal minimum (LC 1011), memecah array untuk meminimalkan jumlah maksimum, dan hari minimum membuat buket.

## 4. Array terurut yang dirotasi
**Minimum:** bandingkan `mid` dengan ujung **kanan**.
```python
def find_min(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:
            l = m + 1          # minimum ada di kanan mid
        else:
            r = m              # mid bisa jadi minimum
    return nums[l]
```

**Cari target:** salah satu sisi mid **pasti terurut**. Cek apakah target ada di sisi itu.
```python
def search_rotated(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:                 # kiri terurut
            if nums[l] <= target < nums[m]:
                r = m - 1
            else:
                l = m + 1
        else:                                  # kanan terurut
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1
```

## 5. Matriks 2D sebagai array 1D
```python
def search_matrix(matrix, target):
    R, C = len(matrix), len(matrix[0])
    l, r = 0, R * C - 1
    while l <= r:
        m = (l + r) // 2
        v = matrix[m // C][m % C]
        if v == target:
            return True
        if v < target:
            l = m + 1
        else:
            r = m - 1
    return False
```

## 6. Time Based Key-Value Store (bisect)
```python
import bisect
from collections import defaultdict
class TimeMap:
    def __init__(self):
        self.times = defaultdict(list)
        self.vals = defaultdict(list)
    def set(self, key, value, timestamp):     # timestamp dijamin naik
        self.times[key].append(timestamp)
        self.vals[key].append(value)
    def get(self, key, timestamp):
        i = bisect.bisect_right(self.times[key], timestamp)   # pertama yang > timestamp
        return self.vals[key][i - 1] if i else ""
```

## 7. Median of Two Sorted Arrays (Hard)
Binary search **jumlah elemen yang diambil dari array pendek** sebagai bagian kiri. Posisi yang benar memenuhi `maxKiri ≤ minKanan` di kedua array.

```python
def find_median_sorted_arrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2               # ambil i dari a
        j = half - i                     # sisanya dari b
        a_l = a[i - 1] if i > 0 else float('-inf')
        a_r = a[i] if i < m else float('inf')
        b_l = b[j - 1] if j > 0 else float('-inf')
        b_r = b[j] if j < n else float('inf')
        if a_l <= b_r and b_l <= a_r:
            if (m + n) % 2:
                return max(a_l, b_l)
            return (max(a_l, b_l) + min(a_r, b_r)) / 2
        if a_l > b_r:
            hi = i - 1
        else:
            lo = i + 1
```

## 8. Jebakan
- Mencampur `while l <= r` dengan `r = m`. Gunakan sepasang yang konsisten: `l <= r` dengan `m ± 1`, atau `l < r` dengan `hi = mid`.
- `ceil(p / k)` dengan float bisa meleset untuk angka besar. Pakai `(p + k − 1) // k`.
- Lupa bahwa binary search on answer butuh **monoton**. Buktikan dulu: "kalau kecepatan k cukup, k+1 pasti cukup."

## 9. Kartu review
- **T:** Template lower bound: kalau `ok(mid)`, apa yang dilakukan? **J:** `hi = mid`.
- **T:** Koko, rentang pencarian? **J:** `[1, max(piles)]`.
- **T:** Rotated: minimum dibandingkan dengan ujung mana? **J:** Kanan.
- **T:** Rotated search, ide kunci? **J:** Salah satu sisi mid selalu terurut.
- **T:** Median dua array, binary search di array yang mana? **J:** Yang lebih pendek.
