---
id: dsa-05-arrays-hashing
track: dsa
title: Arrays & Hashing
order: 5
estMinutes: 35
xp: 20
tags: [hash-map, hash-set, frekuensi, prefix]
---

# Arrays & Hashing

**Ide inti:** tukar **memori** dengan **waktu**. Hash map dan set memberi lookup O(1) rata-rata, sehingga pertanyaan "apakah aku pernah melihat X?" bisa dijawab tanpa loop kedua.

## 1. Kapan dipakai (sinyal)
- "Apakah ada duplikat / pernah muncul?"
- "Cari pasangan yang berjumlah target" pada array **tidak terurut**
- "Kelompokkan berdasarkan sifat yang sama" (anagram, pola)
- "Hitung frekuensi" atau "k paling sering"
- Butuh O(n) padahal brute force O(n²)

## 2. Lima template

### a) Pernah lihat? (set)
```python
def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
```

### b) Komplemen (map nilai → indeks)
```python
def two_sum(nums, target):
    idx = {}                       # nilai -> indeks
    for i, x in enumerate(nums):
        if target - x in idx:      # cek DULU, sebelum menyimpan x sendiri
            return [idx[target - x], i]
        idx[x] = i
    return []
```

### c) Hitung frekuensi
```python
from collections import Counter
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - 97] += 1
        count[ord(b) - 97] -= 1
    return all(c == 0 for c in count)
```

### d) Kunci kanonik untuk mengelompokkan
```python
from collections import defaultdict
def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = [0] * 26
        for ch in w:
            key[ord(ch) - 97] += 1
        groups[tuple(key)].append(w)   # tuple bisa jadi kunci, list tidak
    return list(groups.values())
```

### e) Bucket berdasarkan frekuensi (top-k tanpa sort)
```python
def top_k_frequent(nums, k):
    freq = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]   # indeks = frekuensi
    for val, f in freq.items():
        buckets[f].append(val)
    res = []
    for f in range(len(buckets) - 1, 0, -1):
        for val in buckets[f]:
            res.append(val)
            if len(res) == k:
                return res
    return res
```

## 3. Dua trik array tanpa hash

### Prefix dan suffix (Product of Array Except Self)
```python
def product_except_self(nums):
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):          # res[i] = hasil kali semua di KIRI i
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):   # kalikan dengan semua di KANAN i
        res[i] *= suffix
        suffix *= nums[i]
    return res                  # O(n) waktu, O(1) ruang tambahan (selain output)
```

### Awal barisan (Longest Consecutive Sequence)
```python
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:          # x adalah AWAL sebuah barisan
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best                     # O(n): setiap angka "dijalani" paling banyak dua kali
```

## 4. Jebakan
- Two Sum: menyimpan `x` dulu baru mengecek bisa memasangkan elemen dengan dirinya sendiri, padahal target = 2x dan x hanya ada sekali.
- Memakai `list` sebagai kunci dict → `TypeError`. Pakai `tuple`.
- `Counter` membandingkan isi dengan benar, tapi untuk 26 huruf kecil, array berukuran 26 lebih cepat dan jelas.
- Encode/Decode Strings: pemisah biasa seperti `,` bisa muncul di dalam kata. Awali tiap kata dengan panjangnya: `f"{len(w)}#{w}"`.

## 5. Walkthrough: Valid Sudoku
Setiap angka harus unik di barisnya, kolomnya, dan kotak 3×3-nya. Pakai satu set untuk tiap kategori. Kotak diidentifikasi dengan `(r // 3, c // 3)`.

```python
def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            b = (r // 3) * 3 + c // 3
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v); cols[c].add(v); boxes[b].add(v)
    return True
```

## 6. Kartu review
- **T:** Two Sum, kenapa cek dulu baru simpan? **J:** Supaya tidak memasangkan elemen dengan dirinya sendiri.
- **T:** Top K Frequent dalam O(n)? **J:** Bucket berindeks frekuensi.
- **T:** Longest Consecutive, kenapa O(n)? **J:** Barisan hanya dimulai dari x yang `x−1`-nya tidak ada.
- **T:** Kunci Group Anagrams? **J:** Tuple hitungan 26 huruf, atau `tuple(sorted(w))` dengan O(k log k).
- **T:** Product Except Self tanpa pembagian? **J:** Prefix dari kiri, lalu suffix dari kanan.
