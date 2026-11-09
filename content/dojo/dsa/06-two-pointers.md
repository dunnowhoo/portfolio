---
id: dsa-06-two-pointers
track: dsa
title: Two Pointers
order: 6
estMinutes: 30
xp: 20
tags: [two-pointers, sorting, greedy]
---

# Two Pointers

**Ide inti:** dua indeks bergerak di array (biasanya dari dua ujung, atau satu cepat dan satu lambat). Setiap langkah **membuang sebagian kemungkinan** dengan alasan yang pasti, sehingga O(n²) menjadi O(n).

## 1. Sinyal
- Array/string **terurut**, atau boleh diurutkan, dan mencari pasangan/triplet dengan syarat jumlah
- Palindrom: bandingkan ujung kiri dan kanan
- "Area/volume maksimum" antara dua batas
- Menulis ulang array in-place (pointer baca dan pointer tulis)

## 2. Template A: dua ujung yang saling mendekat
```python
def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l + 1, r + 1]    # LeetCode 167 memakai indeks mulai 1
        if s < target:
            l += 1                   # butuh lebih besar → satu-satunya cara: geser kiri
        else:
            r -= 1                   # butuh lebih kecil → geser kanan
    return []
```

**Kenapa benar?** Kalau `nums[l] + nums[r] < target`, maka `nums[l]` dipasangkan dengan apa pun di kiri `r` pasti lebih kecil lagi. Jadi `l` tidak mungkin bagian dari jawaban, dan aman dibuang.

## 3. Template B: sort + satu pointer tetap + dua pointer (3Sum)
```python
def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break                              # sisanya positif semua
        if i > 0 and nums[i] == nums[i - 1]:
            continue                           # lewati duplikat untuk elemen pertama
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1                     # lewati duplikat untuk elemen kedua
    return res                                 # O(n²)
```

## 4. Template C: pointer baca dan pointer tulis
```python
def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

## 5. Walkthrough: Container With Most Water
Luas = `(r − l) × min(h[l], h[r])`. Menggeser pointer yang **lebih tinggi** tidak pernah menambah luas, karena lebar berkurang dan tingginya tetap dibatasi yang pendek. Jadi selalu geser yang **lebih pendek**.

```python
def max_area(h):
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(h[l], h[r]))
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    return best
```

## 6. Trapping Rain Water (Hard) dengan two pointers
Air di posisi i = `min(maxKiri, maxKanan) − h[i]`. Proses sisi yang max-nya **lebih kecil**, karena sisi itulah yang membatasi.

```python
def trap(h):
    l, r = 0, len(h) - 1
    max_l = max_r = water = 0
    while l < r:
        if h[l] < h[r]:
            max_l = max(max_l, h[l])
            water += max_l - h[l]
            l += 1
        else:
            max_r = max(max_r, h[r])
            water += max_r - h[r]
            r -= 1
    return water      # O(n) waktu, O(1) ruang
```

## 7. Jebakan
- Lupa mengurutkan dulu untuk 3Sum.
- Duplikat: lewati di level elemen pertama **dan** setelah menemukan jawaban.
- Valid Palindrome: memakai `while` (bukan `if`) untuk melewati karakter non-alfanumerik, dan tetap dicek `l < r`.

## 8. Kartu review
- **T:** Kenapa Two Sum II boleh menggeser kiri saat jumlah < target? **J:** Semua pasangan `l` dengan elemen lain di kiri `r` juga terlalu kecil.
- **T:** Container: pointer mana yang digeser? **J:** Yang lebih pendek.
- **T:** 3Sum kompleksitasnya? **J:** O(n²) setelah sort O(n log n).
- **T:** Trapping Rain Water, rumus air di i? **J:** `min(maxKiri, maxKanan) − h[i]`.
