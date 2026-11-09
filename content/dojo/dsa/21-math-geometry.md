---
id: dsa-21-math-geometry
track: dsa
title: Math & Geometry
order: 21
estMinutes: 35
xp: 20
tags: [matrix, simulasi, math, fast-pow]
---

# Math & Geometry

**Ide inti:** soal di sini jarang butuh struktur data rumit. Yang dibutuhkan **ketelitian indeks** dan beberapa trik matematika klasik. Gambar matriks kecil (3×3, 4×4) sebelum coding.

## 1. Manipulasi matriks

### Rotate Image 90° searah jarum jam (in-place)
Rotasi = **transpose** (cerminkan terhadap diagonal) lalu **balik setiap baris**.
```python
def rotate(m):
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:
        row.reverse()
```
Berlawanan arah jarum jam: transpose lalu balik urutan **baris** (`m.reverse()`).

### Spiral Matrix: empat batas yang menyempit
```python
def spiral_order(m):
    res = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(m[r][right])
        right -= 1
        if top <= bottom:                       # masih ada baris
            for c in range(right, left - 1, -1):
                res.append(m[bottom][c])
            bottom -= 1
        if left <= right:                       # masih ada kolom
            for r in range(bottom, top - 1, -1):
                res.append(m[r][left])
            left += 1
    return res
```

### Set Matrix Zeroes dengan ruang O(1)
Pakai **baris dan kolom pertama** sebagai penanda. Simpan dulu apakah baris/kolom pertama sendiri punya nol.
```python
def set_zeroes(m):
    R, C = len(m), len(m[0])
    row0 = any(m[0][c] == 0 for c in range(C))
    col0 = any(m[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if m[r][c] == 0:
                m[r][0] = m[0][c] = 0
    for r in range(1, R):
        for c in range(1, C):
            if m[r][0] == 0 or m[0][c] == 0:
                m[r][c] = 0
    if row0:
        for c in range(C):
            m[0][c] = 0
    if col0:
        for r in range(R):
            m[r][0] = 0
```

## 2. Simulasi angka

### Plus One
```python
def plus_one(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0                            # 9 → 0, carry lanjut ke kiri
    return [1] + digits                          # semua 9
```

### Multiply Strings
Digit `a[i]` × `b[j]` jatuh ke posisi `i + j + 1` di array hasil.
```python
def multiply(a, b):
    if a == "0" or b == "0":
        return "0"
    res = [0] * (len(a) + len(b))
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            res[i + j + 1] += int(a[i]) * int(b[j])
            res[i + j] += res[i + j + 1] // 10
            res[i + j + 1] %= 10
    return ''.join(map(str, res)).lstrip('0') or "0"
```

## 3. Fast exponentiation: Pow(x, n) dalam O(log n)
```python
def my_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    res = 1.0
    while n:
        if n & 1:
            res *= x                            # bit ini menyala → kalikan
        x *= x                                  # x, x², x⁴, x⁸, ...
        n >>= 1
    return res
```

## 4. Deteksi siklus angka (Happy Number)
```python
def is_happy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1
```
Bisa juga dengan fast & slow seperti di linked list, dengan ruang O(1).

## 5. Geometri hitung (Detect Squares)
Persegi sejajar sumbu ditentukan oleh titik query dan **satu titik diagonal** `(x, y)` dengan `|dx| == |dy| ≠ 0`. Dua sudut lainnya adalah `(x, py)` dan `(px, y)`.
```python
from collections import Counter
class DetectSquares:
    def __init__(self):
        self.cnt = Counter()
    def add(self, point):
        self.cnt[tuple(point)] += 1
    def count(self, point):
        px, py = point
        total = 0
        for (x, y), c in list(self.cnt.items()):
            if abs(px - x) != abs(py - y) or x == px:
                continue
            total += c * self.cnt[(x, py)] * self.cnt[(px, y)]
        return total
```

## 6. Jebakan
- Spiral: lupa mengecek `top <= bottom` dan `left <= right` di tengah loop, sehingga elemen tercatat dua kali pada matriks yang tidak persegi.
- Set Matrix Zeroes: menimpa penanda di baris/kolom pertama sebelum mencatat apakah keduanya sendiri berisi nol.
- Pow: n negatif. Di bahasa 32-bit, `−n` bisa overflow (di Python aman).

## 7. Kartu review
- **T:** Rotate 90° searah jarum jam? **J:** Transpose, lalu balik setiap baris.
- **T:** Set Matrix Zeroes dengan O(1)? **J:** Baris dan kolom pertama sebagai penanda, plus dua flag.
- **T:** Pow O(log n)? **J:** Kuadrat berulang mengikuti bit n.
- **T:** Multiply Strings, posisi hasil `a[i]·b[j]`? **J:** `i + j + 1`, carry ke `i + j`.
