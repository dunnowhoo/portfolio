---
id: dsa-03-rekursi
track: dsa
title: Rekursi, Call Stack, dan Memo
order: 3
estMinutes: 30
xp: 20
tags: [fondasi, rekursi, memo]
---

# Rekursi, call stack, dan memo

Rekursi adalah fondasi untuk tree, backtracking, DFS graph, dan DP. Kalau rekursi sudah nyaman, separuh NeetCode 150 menjadi jauh lebih mudah.

## 1. Tiga pertanyaan sebelum menulis fungsi rekursif

1. **Apa arti fungsi ini?** Tulis kontraknya dalam satu kalimat. Contoh: "`depth(node)` mengembalikan kedalaman maksimum subpohon dari node."
2. **Apa base case-nya?** Input terkecil yang jawabannya langsung diketahui. Contoh: `node is None → 0`.
3. **Bagaimana jawaban besar dibangun dari jawaban kecil?** Contoh: `1 + max(depth(kiri), depth(kanan))`.

Lalu **percayai** pemanggilan rekursifnya (*leap of faith*). Jangan menelusuri semua level di kepala.

```python
def depth(node):
    if node is None:            # base case
        return 0
    return 1 + max(depth(node.left), depth(node.right))   # bangun dari submasalah
```

## 2. Call stack

Setiap pemanggilan menumpuk satu *frame* di stack. Kedalaman rekursi = ruang O(kedalaman).
- Pohon seimbang punya kedalaman O(log n).
- Pohon miring (seperti linked list) punya kedalaman O(n).
- Batas rekursi default Python ±1.000. Untuk input besar, ubah ke iteratif dengan stack sendiri, atau naikkan batasnya dengan hati-hati.

## 3. Dua gaya mengembalikan hasil

**a) Mengembalikan nilai** (fungsional), cocok untuk tinggi, jumlah, atau boolean.

**b) Mengisi variabel luar** (akumulasi), cocok saat jawaban bukan nilai kembalian. Contohnya diameter atau "max path sum".

```python
def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)    # catat kandidat di variabel luar
        return 1 + max(l, r)       # yang dikembalikan tetap tinggi
    height(root)
    return best
```

## 4. Dari rekursi ke memo (pintu masuk DP)

Fibonacci naif menghitung ulang submasalah yang sama berulang kali (O(2ⁿ)):

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Dengan memo, setiap `n` dihitung sekali (O(n)):

```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Lalu bisa diubah menjadi tabel *bottom-up* (O(n) waktu, O(1) ruang):

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

Urutan berpikir ini (**rekursi → memo → tabel**) dipakai lagi di semua materi DP.

## 5. Rekursi bercabang = pohon keputusan

Untuk subset: setiap elemen punya dua pilihan, ambil atau tidak, sehingga ada 2ⁿ daun.

```python
def subsets(nums):
    res, cur = [], []
    def go(i):
        if i == len(nums):
            res.append(cur.copy())   # salin! cur akan berubah
            return
        cur.append(nums[i]); go(i + 1)   # ambil
        cur.pop();           go(i + 1)   # tidak ambil (setelah undo)
    go(0)
    return res
```

Pola **pilih → rekursi → batalkan** inilah inti backtracking.

## 6. Kesalahan umum

- Lupa base case, atau base case tidak pernah tercapai → rekursi tak berujung.
- Menambahkan `cur` (referensi) ke hasil, bukan `cur.copy()`.
- Memakai list atau dict yang bisa berubah (*mutable*) sebagai argumen `@cache` → error, karena argumen harus *hashable*.
- Mengubah variabel luar tanpa `nonlocal` di fungsi dalam.

## 7. Kartu review

- **T:** Tiga pertanyaan sebelum rekursi? **J:** Arti fungsi, base case, cara membangun dari submasalah.
- **T:** Ruang DFS pohon tinggi h? **J:** O(h) untuk call stack.
- **T:** Kapan pakai `nonlocal best`? **J:** Saat jawaban dikumpulkan di variabel luar, sementara nilai kembalian dipakai untuk hal lain.
- **T:** Kenapa `res.append(cur.copy())`? **J:** `cur` terus diubah. Tanpa salinan, semua isi `res` menjadi list yang sama.
