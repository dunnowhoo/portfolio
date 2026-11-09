---
id: dsa-19-greedy
track: dsa
title: Greedy
order: 19
estMinutes: 40
xp: 20
tags: [greedy, kadane, exchange-argument]
---

# Greedy

**Ide inti:** di setiap langkah, ambil pilihan yang **terbaik secara lokal** dan jangan pernah mengubahnya, dengan keyakinan hasilnya optimal secara global. Bagian sulitnya adalah **meyakinkan diri (dan interviewer) bahwa greedy-nya benar.**

## 1. Cara memeriksa greedy
1. Coba 3–4 contoh kecil, termasuk yang "jahat".
2. Cari **contoh tandingan**. Kalau ketemu, kemungkinan soalnya DP.
3. **Exchange argument:** andaikan solusi optimal berbeda dari pilihan greedy di langkah pertama, lalu tunjukkan menukarnya ke pilihan greedy tidak membuat hasil lebih buruk.

## 2. Sinyal
- Interval/jadwal: "maksimum yang tidak overlap", "minimum yang dihapus"
- "Bisa mencapai…?" dengan jangkauan yang bisa dilacak
- Ada satu besaran yang bisa dijaga sambil jalan (jumlah berjalan, jangkauan terjauh, indeks terakhir)

## 3. Kadane (Maximum Subarray)
Jumlah berjalan yang negatif hanya akan merugikan subarray berikutnya, jadi buang.
```python
def max_sub_array(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)          # mulai baru di x, atau lanjutkan
        best = max(best, cur)
    return best
```

## 4. Jangkauan (Jump Game I dan II)
```python
def can_jump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i                   # dari i bisa sampai goal → goal baru adalah i
    return goal == 0

def jump(nums):                        # lompatan minimum = BFS per level jangkauan
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:                   # level sekarang habis → wajib lompat
            jumps += 1
            end = far
    return jumps
```

## 5. Gas Station
- Kalau total bensin ≥ total biaya, **pasti ada** titik awal.
- Kalau tangki menjadi negatif di i, semua titik awal antara start..i juga gagal, jadi titik awal baru adalah i + 1.
```python
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            tank, start = 0, i + 1
    return start
```

## 6. Hitung dan pakai dari yang terkecil (Hand of Straights)
```python
from collections import Counter
def is_n_straight_hand(hand, k):
    if len(hand) % k:
        return False
    count = Counter(hand)
    for x in sorted(count):
        n = count[x]
        if n:                                # x harus jadi AWAL dari n kelompok
            for y in range(x, x + k):
                if count[y] < n:
                    return False
                count[y] -= n
    return True
```

## 7. Indeks terakhir (Partition Labels)
```python
def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    res, start, end = [], 0, 0
    for i, c in enumerate(s):
        end = max(end, last[c])              # bagian ini minimal sampai kemunculan terakhir c
        if i == end:
            res.append(end - start + 1)
            start = i + 1
    return res
```

## 8. Rentang kemungkinan (Valid Parenthesis String)
Lacak rentang jumlah kurung buka yang mungkin: `[lo, hi]`.
```python
def check_valid_string(s):
    lo = hi = 0
    for ch in s:
        if ch == '(':
            lo += 1; hi += 1
        elif ch == ')':
            lo -= 1; hi -= 1
        else:                                # '*' bisa ')', kosong, atau '('
            lo -= 1; hi += 1
        if hi < 0:
            return False                     # terlalu banyak ')'
        lo = max(lo, 0)
    return lo == 0
```

## 9. Saring yang merusak (Merge Triplets)
```python
def merge_triplets(triplets, target):
    found = set()
    for t in triplets:
        if all(t[i] <= target[i] for i in range(3)):   # triplet yang melebihi target dibuang
            found |= {i for i in range(3) if t[i] == target[i]}
    return len(found) == 3
```

## 10. Jebakan
- Menganggap greedy benar tanpa mencari contoh tandingan. Contohnya Coin Change dengan koin [1, 3, 4] dan target 6: greedy memberi 4+1+1 (3 koin), padahal optimalnya 3+3.
- Jump Game II: menambah lompatan di indeks terakhir. Loop sampai `len − 1` saja.

## 11. Kartu review
- **T:** Kadane, kapan mulai ulang? **J:** Saat `cur + x < x`, yaitu jumlah berjalan negatif.
- **T:** Gas Station, kenapa start = i + 1? **J:** Semua awal sebelumnya di segmen itu pasti gagal juga.
- **T:** Partition Labels? **J:** Perpanjang ujung ke indeks terakhir setiap huruf, potong saat `i == ujung`.
- **T:** Cara membuktikan greedy? **J:** Exchange argument, dan cari contoh tandingan.
