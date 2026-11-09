---
id: dsa-14-backtracking
track: dsa
title: Backtracking
order: 14
estMinutes: 40
xp: 20
tags: [backtracking, rekursi, pruning]
---

# Backtracking

**Ide inti:** jelajahi **pohon keputusan** secara DFS. Di setiap langkah: **pilih → rekursi → batalkan**. Dengan *pruning*, cabang yang pasti gagal dipotong lebih awal.

## 1. Sinyal
- "Semua kombinasi / permutasi / subset / partisi / penempatan"
- Constraint kecil (n ≤ 10–20)
- Mencari jalur di grid dengan syarat tidak boleh memakai sel dua kali

## 2. Template universal
```python
def backtrack_template(choices):
    res, cur = [], []
    def bt(state):
        if is_solution(state):
            res.append(cur.copy())        # SALIN, karena cur akan berubah
            return
        for choice in next_choices(state):
            if not valid(choice):         # pruning
                continue
            cur.append(choice)            # pilih
            bt(advance(state, choice))    # rekursi
            cur.pop()                     # batalkan
    bt(initial_state)
    return res
```

## 3. Tiga keluarga utama

### Subset: "start index" supaya tidak ada urutan ganda
```python
def subsets(nums):
    res, cur = [], []
    def bt(start):
        res.append(cur.copy())            # setiap node adalah subset
        for i in range(start, len(nums)):
            cur.append(nums[i])
            bt(i + 1)
            cur.pop()
    bt(0)
    return res
```

### Kombinasi dengan target: boleh diulang (`i`) atau tidak (`i + 1`)
```python
def combination_sum(candidates, target):         # boleh ulang
    candidates.sort()
    res, cur = [], []
    def bt(start, remain):
        if remain == 0:
            res.append(cur.copy()); return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remain:
                break                              # pruning: terurut, sisanya pasti terlalu besar
            cur.append(c)
            bt(i, remain - c)                      # i, bukan i+1 → boleh dipakai lagi
            cur.pop()
    bt(0, target)
    return res
```

**Dengan duplikat di input** (Combination Sum II, Subsets II): urutkan, lalu lewati elemen yang sama **di level yang sama**.
```python
for i in range(start, len(nums)):
    if i > start and nums[i] == nums[i - 1]:
        continue                                   # lewati cabang kembar
    ...
    bt(i + 1, ...)
```

### Permutasi: `used[]` sebagai pengganti start index
```python
def permute(nums):
    res, cur, used = [], [], [False] * len(nums)
    def bt():
        if len(cur) == len(nums):
            res.append(cur.copy()); return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True; cur.append(x)
            bt()
            cur.pop(); used[i] = False
    bt()
    return res
```

## 4. Grid: tandai lalu pulihkan (Word Search)
```python
def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
            return False
        tmp, board[r][c] = board[r][c], '#'        # tandai dipakai
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = tmp                          # pulihkan
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))
```

## 5. N-Queens: set untuk mengecek serangan O(1)
Ratu di (r, c) menyerang kolom `c`, diagonal `r − c`, dan anti-diagonal `r + c`.

```python
def solve_n_queens(n):
    cols, diag, anti = set(), set(), set()
    board = [['.'] * n for _ in range(n)]
    res = []
    def bt(r):
        if r == n:
            res.append([''.join(row) for row in board]); return
        for c in range(n):
            if c in cols or (r - c) in diag or (r + c) in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c); board[r][c] = 'Q'
            bt(r + 1)
            cols.remove(c); diag.remove(r - c); anti.remove(r + c); board[r][c] = '.'
    bt(0)
    return res
```

## 6. Palindrome Partitioning
```python
def partition(s):
    res, cur = [], []
    def bt(i):
        if i == len(s):
            res.append(cur.copy()); return
        for j in range(i, len(s)):
            piece = s[i:j + 1]
            if piece == piece[::-1]:               # hanya potong kalau palindrom
                cur.append(piece)
                bt(j + 1)
                cur.pop()
    bt(0)
    return res
```

## 7. Kompleksitas (sebutkan saat interview)
- Subset: O(n · 2ⁿ)
- Permutasi: O(n · n!)
- Kombinasi berjumlah target: eksponensial, dibatasi oleh pruning

## 8. Jebakan
- `res.append(cur)` tanpa salinan.
- Salah pakai `i` vs `i + 1` (boleh ulang atau tidak).
- Lewati duplikat dengan `i > start`, bukan `i > 0`. Kalau `i > 0`, cabang yang sah ikut terbuang.
- Lupa memulihkan state (sel grid, set kolom).

## 9. Kartu review
- **T:** Tiga langkah backtracking? **J:** Pilih, rekursi, batalkan.
- **T:** Combination Sum, rekursi dengan i atau i+1? **J:** i (boleh ulang).
- **T:** Cara melewati duplikat? **J:** Urutkan; `if i > start and nums[i] == nums[i−1]: continue`.
- **T:** N-Queens, kunci diagonal? **J:** `r − c` dan `r + c`.
