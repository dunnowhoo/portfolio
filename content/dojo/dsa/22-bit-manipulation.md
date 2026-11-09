---
id: dsa-22-bit-manipulation
track: dsa
title: Bit Manipulation
order: 22
estMinutes: 30
xp: 20
tags: [bit, xor, mask]
---

# Bit Manipulation

**Ide inti:** bilangan adalah deretan bit. Operasi bit (`& | ^ ~ << >>`) bersifat O(1) dan membuka trik yang ringkas, terutama untuk **XOR**.

## 1. Operator dan identitas penting

| Ekspresi | Arti |
|---|---|
| `x & 1` | Bit terendah (ganjil?) |
| `x >> 1`, `x << 1` | Bagi 2 (lantai), kali 2 |
| `x & (x - 1)` | **Hapus bit 1 terendah** |
| `x & -x` | Ambil bit 1 terendah saja |
| `(x >> i) & 1` | Bit ke-i |
| `x | (1 << i)` / `x & ~(1 << i)` | Nyalakan / matikan bit ke-i |
| `a ^ a = 0`, `a ^ 0 = a` | XOR membatalkan pasangan; urutan bebas |

## 2. XOR: pasangan saling membatalkan
```python
def single_number(nums):          # semua muncul dua kali kecuali satu
    res = 0
    for x in nums:
        res ^= x
    return res

def missing_number(nums):         # 0..n dengan satu hilang
    res = len(nums)
    for i, x in enumerate(nums):
        res ^= i ^ x               # indeks dan nilai berpasangan, sisanya yang hilang
    return res
# Alternatif: n*(n+1)//2 - sum(nums)
```

## 3. Menghitung bit
```python
def hamming_weight(n):            # Number of 1 Bits
    count = 0
    while n:
        n &= n - 1                 # setiap iterasi menghapus satu bit 1
        count += 1
    return count

def count_bits(n):                 # Counting Bits 0..n dalam O(n)
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)   # bit i = bit (i // 2) + bit terendah
    return dp
```

## 4. Membalik bit
```python
def reverse_bits(n):
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    return res
```

## 5. Penjumlahan tanpa + (Sum of Two Integers)
- `a ^ b` = jumlah tanpa carry.
- `(a & b) << 1` = carry.
- Ulangi sampai carry nol.

Integer Python **tidak terbatas** ukurannya, jadi kita harus mensimulasikan 32 bit dengan mask.
```python
def get_sum(a, b):
    MASK, MAX = 0xFFFFFFFF, 0x7FFFFFFF
    a, b = a & MASK, b & MASK
    while b:
        a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
    return a if a <= MAX else ~(a ^ MASK)     # ubah kembali ke negatif kalau bit tanda menyala
```

## 6. Reverse Integer (cek batas 32-bit)
```python
def reverse(x):
    sign = -1 if x < 0 else 1
    x, res = abs(x), 0
    while x:
        res = res * 10 + x % 10
        x //= 10
    res *= sign
    return res if -2**31 <= res <= 2**31 - 1 else 0
```
Di bahasa dengan integer 32-bit (Java/C++), batas harus dicek **sebelum** `res * 10` supaya tidak overflow. Sebutkan ini saat interview.

## 7. Bonus: subset dengan bitmask
Untuk n ≤ 20, setiap subset bisa diwakili angka 0..2ⁿ−1.
```python
def subsets_bitmask(nums):
    n = len(nums)
    return [[nums[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]
```

## 8. Kartu review
- **T:** `x & (x − 1)` gunanya? **J:** Menghapus bit 1 terendah.
- **T:** Single Number O(1) ruang? **J:** XOR semua elemen.
- **T:** Counting Bits, rumus DP? **J:** `dp[i] = dp[i >> 1] + (i & 1)`.
- **T:** Kenapa Sum of Two Integers butuh mask di Python? **J:** Integer Python tidak terbatas; mask mensimulasikan 32 bit.
