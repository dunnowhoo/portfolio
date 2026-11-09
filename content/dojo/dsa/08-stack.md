---
id: dsa-08-stack
track: dsa
title: Stack dan Monotonic Stack
order: 8
estMinutes: 35
xp: 20
tags: [stack, monotonic-stack, desain]
---

# Stack dan monotonic stack

**Ide inti:** stack (LIFO) cocok untuk masalah yang **bersarang**, misalnya kurung, ekspresi, dan undo. Atau masalah yang menanyakan **"elemen terdekat sebelumnya/berikutnya yang lebih besar/kecil"**. Untuk yang kedua, jaga stack tetap **monoton** (naik atau turun).

## 1. Sinyal
- Kurung, tag, ekspresi postfix, atau path seperti `a/./b/../c`
- "Berapa hari/indeks sampai nilai **berikutnya yang lebih besar**"
- Histogram atau area dengan batas oleh elemen yang lebih pendek
- Desain stack dengan operasi tambahan O(1) (min, max)

## 2. Template A: pasangan kurung
```python
def is_valid(s):
    pair = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pair:
            if not stack or stack[-1] != pair[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack            # sisa pembuka berarti tidak valid
```

## 3. Template B: monotonic stack ("next greater")
Simpan **indeks** yang belum menemukan jawabannya. Ketika datang nilai yang lebih besar, nilai itulah jawaban untuk semua indeks yang lebih kecil di puncak stack.

```python
def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []                       # indeks, suhunya menurun dari bawah ke atas
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res                       # O(n): setiap indeks masuk dan keluar sekali
```

Variasi:

| Yang dicari | Kondisi pop |
|---|---|
| Next **greater** | `nums[top] < x` (stack menurun) |
| Next **smaller** | `nums[top] > x` (stack naik) |
| Array melingkar | Loop `2n` kali dengan `i % n` |

## 4. Template C: desain (Min Stack)
```python
class MinStack:
    def __init__(self):
        self.st = []                          # isi: (nilai, minimum_sampai_sini)
    def push(self, val):
        cur_min = val if not self.st else min(val, self.st[-1][1])
        self.st.append((val, cur_min))
    def pop(self):
        self.st.pop()
    def top(self):
        return self.st[-1][0]
    def getMin(self):
        return self.st[-1][1]
```

## 5. Evaluate RPN
```python
def eval_rpn(tokens):
    st = []
    for tok in tokens:
        if tok in "+-*/":
            b, a = st.pop(), st.pop()      # urutan penting: a dulu, lalu b
            if tok == '+': st.append(a + b)
            elif tok == '-': st.append(a - b)
            elif tok == '*': st.append(a * b)
            else: st.append(int(a / b))    # pembulatan ke nol, BUKAN a // b
        else:
            st.append(int(tok))
    return st[0]
```

## 6. Car Fleet: stack yang diringkas jadi satu variabel
Urutkan mobil dari yang **paling dekat** tujuan. Mobil di belakang yang waktu tibanya ≤ mobil di depan akan tersusul dan menjadi satu rombongan.

```python
def car_fleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)
    fleets, slowest = 0, 0.0
    for p, s in cars:
        t = (target - p) / s
        if t > slowest:            # tidak tersusul → rombongan baru
            fleets += 1
            slowest = t
    return fleets
```

## 7. Largest Rectangle in Histogram (Hard)
Stack berisi `(indeks_mulai, tinggi)` dengan tinggi naik. Saat tinggi turun, batang yang lebih tinggi **tidak bisa diperpanjang lagi ke kanan**: hitung luasnya, lalu wariskan indeks mulainya ke batang baru.

```python
def largest_rectangle_area(heights):
    stack, best = [], 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx                     # batang baru bisa memanjang ke kiri sampai idx
        stack.append((start, h))
    n = len(heights)
    for idx, height in stack:               # sisanya memanjang sampai ujung
        best = max(best, height * (n - idx))
    return best
```

## 8. Jebakan
- RPN: `a // b` di Python membulatkan ke bawah (−7 // 2 = −4). Soal meminta pembulatan ke nol, jadi pakai `int(a / b)`.
- Menyimpan **nilai** padahal yang dibutuhkan **indeks**, misalnya untuk menghitung jarak hari.
- Lupa memproses sisa stack di akhir (histogram).

## 9. Kartu review
- **T:** Next greater element, stack naik atau turun? **J:** Turun (pop selama puncak < x).
- **T:** Min Stack O(1)? **J:** Simpan pasangan (nilai, min sampai sini).
- **T:** Histogram, kapan luas dihitung? **J:** Saat batang di puncak lebih tinggi dari batang baru.
- **T:** Car Fleet, urutkan dari mana? **J:** Dari posisi terdekat tujuan.
