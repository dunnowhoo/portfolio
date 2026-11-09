---
id: dsa-02-python-toolkit
track: dsa
title: Toolkit Python untuk Interview
order: 2
estMinutes: 35
xp: 20
tags: [fondasi, python]
---

# Toolkit Python untuk interview

Python dipilih karena ringkas. Tapi keringkasan itu hanya membantu kalau kamu **hafal alat standarnya** dan tahu biayanya.

## 1. List

```python
a = [0] * n                 # array berisi n nol
grid = [[0] * c for _ in range(r)]   # BENAR. Jangan [[0]*c]*r (barisnya berbagi objek yang sama!)
a.append(x); a.pop()        # O(1) di ujung
a.pop(0); a.insert(0, x)    # O(n). Hindari, pakai deque
a.sort()                    # in-place, O(n log n), stabil
b = sorted(a, key=lambda x: (-x[1], x[0]))   # urut menurun kolom 1, lalu naik kolom 0
a[::-1]                     # salinan terbalik
for i, x in enumerate(a): ...
for x, y in zip(a, b): ...
```

## 2. Dict, set, dan Counter

```python
from collections import defaultdict, Counter

d = {}
d[k] = d.get(k, 0) + 1          # hitung manual
g = defaultdict(list)           # g[k].append(v) tanpa cek ada atau tidak
cnt = Counter("banana")         # {'a': 3, 'n': 2, 'b': 1}
cnt.most_common(2)              # [('a', 3), ('n', 2)]
s = set(); s.add(x); x in s     # O(1) rata-rata
key = tuple(sorted(word))       # list/dict tidak bisa jadi kunci, tuple bisa
```

## 3. deque untuk antrian dan BFS

```python
from collections import deque
q = deque([start])
q.append(x); q.popleft()        # O(1) di kedua ujung
q.appendleft(x); q.pop()
```

## 4. heapq (min-heap)

```python
import heapq
h = []
heapq.heappush(h, (prioritas, item))   # tuple dibandingkan per elemen
p, item = heapq.heappop(h)              # ambil yang terkecil
heapq.heapify(arr)                      # O(n)
# Max-heap: simpan nilai negatif
heapq.heappush(h, -x); terbesar = -heapq.heappop(h)
heapq.nlargest(k, arr); heapq.nsmallest(k, arr)
```

Kalau item tidak bisa dibandingkan (misalnya node linked list), tambahkan penengah: `(nilai, i, node)`.

## 5. bisect untuk binary search siap pakai

```python
import bisect
i = bisect.bisect_left(a, x)    # indeks pertama dengan a[i] >= x
j = bisect.bisect_right(a, x)   # indeks pertama dengan a[j] > x
count_x = j - i                 # jumlah x di array terurut
bisect.insort(a, x)             # sisipkan sambil menjaga urutan (O(n) karena geser)
```

## 6. String

```python
s.isalnum(); s.isdigit(); s.lower()
ord('a'); chr(97)                       # indeks huruf: ord(c) - ord('a')
''.join(parts)                          # gabung O(total)
s.split(); "-".join(words)
```

String di Python **tidak bisa diubah** (*immutable*). Kalau perlu mengubah per karakter, ubah ke list dulu: `chars = list(s)`.

## 7. Angka dan lain-lain

```python
float('inf'); -float('inf')
a // b      # pembagian lantai. Hati-hati negatif: -7 // 2 == -4
int(a / b)  # pembulatan ke nol (dipakai di RPN): int(-7 / 2) == -3
divmod(a, b)
abs(x); max(a, key=len); min(a, default=0)
from functools import cache    # @cache untuk memo rekursi
import sys; sys.setrecursionlimit(10**6)   # kalau rekursi dalam (hati-hati di platform)
```

## 8. Pola kode yang sering dipakai

```python
# Arah 4 tetangga di grid
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]
for dr, dc in DIRS:
    nr, nc = r + dr, c + dc
    if 0 <= nr < R and 0 <= nc < C: ...

# Swap tanpa variabel sementara
a[i], a[j] = a[j], a[i]

# Memo rekursi
from functools import cache
@cache
def dp(i): ...
```

## 9. Kartu review

- **T:** Kenapa `[[0]*c]*r` salah? **J:** Semua baris menunjuk ke list yang sama, jadi mengubah satu baris mengubah semuanya.
- **T:** Bagaimana membuat max-heap dengan heapq? **J:** Simpan nilai negatif.
- **T:** Antrian BFS memakai apa? **J:** `collections.deque` dengan `popleft()`.
- **T:** `bisect_left` vs `bisect_right`? **J:** Pertama yang ≥ x vs pertama yang > x.
- **T:** Kunci dict untuk anagram? **J:** `tuple(sorted(w))` atau tuple hitungan 26 huruf.
