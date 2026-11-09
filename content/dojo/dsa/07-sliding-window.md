---
id: dsa-07-sliding-window
track: dsa
title: Sliding Window
order: 7
estMinutes: 35
xp: 20
tags: [sliding-window, hash-map, deque]
---

# Sliding Window

**Ide inti:** untuk subarray/substring **kontigu**, jangan mengecek semua pasangan (l, r). Geser jendela `[l, r]`: perluas dengan `r`, kecilkan dengan `l`, dan jaga **status** jendela (hitungan huruf, jumlah, maksimum) secara inkremental.

## 1. Sinyal
- "Substring/subarray **kontigu** terpanjang/terpendek/jumlah" dengan syarat tertentu
- Syarat bisa diperbarui saat menambah atau membuang satu elemen
- Jendela ukuran tetap k ("setiap jendela k")

## 2. Template A: jendela variabel (terpanjang yang valid)
```python
def longest_valid(s):
    state = {}                 # status jendela, misalnya hitungan huruf
    l = best = 0
    for r, ch in enumerate(s):
        state[ch] = state.get(ch, 0) + 1          # 1) masukkan s[r]
        while not valid(state):                   # 2) WHILE (bukan if) jendela tidak valid
            state[s[l]] -= 1
            l += 1                                # kecilkan dari kiri
        best = max(best, r - l + 1)               # 3) jendela sekarang valid
    return best
```

Contoh nyata, **Longest Substring Without Repeating Characters**:
```python
def length_of_longest_substring(s):
    last = {}                  # huruf -> indeks terakhir
    l = best = 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= l:
            l = last[ch] + 1   # lompat langsung melewati duplikat
        last[ch] = r
        best = max(best, r - l + 1)
    return best
```

## 3. Template B: jendela variabel (terpendek yang valid)
Perluas sampai valid, lalu **kecilkan selama masih valid** sambil mencatat jawaban.

```python
from collections import Counter
def min_window(s, t):
    need = Counter(t)
    missing = len(t)               # jumlah huruf t yang belum terpenuhi
    l = 0
    best = (float('inf'), 0, 0)
    for r, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1              # boleh negatif: kelebihan di jendela
        while missing == 0:        # jendela valid → coba kecilkan
            if r - l + 1 < best[0]:
                best = (r - l + 1, l, r)
            need[s[l]] += 1
            if need[s[l]] > 0:     # membuang huruf yang dibutuhkan
                missing += 1
            l += 1
    return "" if best[0] == float('inf') else s[best[1]:best[2] + 1]
```

## 4. Template C: jendela ukuran tetap
```python
def check_inclusion(s1, s2):          # Permutation in String
    if len(s1) > len(s2):
        return False
    a, b = [0] * 26, [0] * 26
    for i in range(len(s1)):
        a[ord(s1[i]) - 97] += 1
        b[ord(s2[i]) - 97] += 1
    if a == b:
        return True
    for r in range(len(s1), len(s2)):
        b[ord(s2[r]) - 97] += 1                   # masuk
        b[ord(s2[r - len(s1)]) - 97] -= 1         # keluar
        if a == b:
            return True
    return False
```

## 5. Trik penting: Character Replacement
Jendela valid kalau `panjang − frek_terbanyak ≤ k`. `max_f` **tidak perlu diturunkan** saat jendela mengecil, karena jawaban hanya membaik kalau `max_f` naik.

```python
def character_replacement(s, k):
    count = {}
    l = max_f = best = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        max_f = max(max_f, count[ch])
        while (r - l + 1) - max_f > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best
```

## 6. Maksimum tiap jendela: monotonic deque
```python
from collections import deque
def max_sliding_window(nums, k):
    dq, res = deque(), []          # isi: indeks, nilainya menurun dari depan
    for r, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()               # yang lebih kecil dari x tidak akan pernah jadi maksimum
        dq.append(r)
        if dq[0] <= r - k:
            dq.popleft()           # keluar dari jendela
        if r >= k - 1:
            res.append(nums[dq[0]])
    return res                     # O(n)
```

## 7. Jebakan
- Memakai `if` alih-alih `while` saat mengecilkan jendela.
- Lupa bahwa sliding window untuk **jumlah** hanya bekerja kalau semua angka **positif**. Kalau ada negatif, pakai prefix sum + hash map (lihat LC 560 di daftar ekstra).
- Salah menghitung panjang: yang benar `r − l + 1`.

## 8. Kartu review
- **T:** Kecilkan jendela pakai if atau while? **J:** While.
- **T:** Syarat valid di Character Replacement? **J:** `panjang − frek_max ≤ k`.
- **T:** Minimum Window, kapan jendela dikecilkan? **J:** Selama masih memuat semua huruf t (`missing == 0`).
- **T:** Sliding Window Maximum dalam O(n)? **J:** Deque indeks dengan nilai menurun.
- **T:** Kapan sliding window jumlah tidak bisa dipakai? **J:** Saat ada angka negatif.
