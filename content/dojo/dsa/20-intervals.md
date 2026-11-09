---
id: dsa-20-intervals
track: dsa
title: Intervals
order: 20
estMinutes: 30
xp: 20
tags: [intervals, sorting, sweep-line, heap]
---

# Intervals

**Ide inti:** hampir semua soal interval dimulai dengan **mengurutkan**, entah berdasarkan awal atau akhir. Setelah terurut, cukup membandingkan interval dengan interval sebelumnya (atau dengan isi heap).

Dua interval `[a, b]` dan `[c, d]` **tumpang tindih** jika `a <= d and c <= b`. Tanyakan apakah ujung yang bersentuhan (`b == c`) dianggap overlap.

## 1. Sinyal
- Rapat, jadwal, booking, rentang waktu
- "Gabungkan", "sisipkan", "berapa ruang minimum", "hapus minimum agar tidak bertabrakan"

## 2. Urut berdasarkan apa?

| Tujuan | Urutkan berdasarkan |
|---|---|
| Menggabungkan rentang | **Awal** |
| Memilih sebanyak mungkin yang tidak overlap / menghapus paling sedikit | **Akhir** (greedy klasik) |
| Menghitung yang aktif bersamaan | Awal dan akhir **terpisah** (sweep line) |

## 3. Merge Intervals
```python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    res = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= res[-1][1]:                      # overlap dengan yang terakhir
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res
```

## 4. Insert Interval (input sudah terurut dan tidak overlap)
```python
def insert(intervals, new):
    res = []
    for i, (s, e) in enumerate(intervals):
        if e < new[0]:                           # sepenuhnya sebelum
            res.append([s, e])
        elif new[1] < s:                         # sepenuhnya sesudah → selesai
            res.append(new)
            return res + intervals[i:]
        else:                                    # overlap → lebarkan new
            new = [min(s, new[0]), max(e, new[1])]
    res.append(new)
    return res
```

## 5. Non-overlapping Intervals (hapus minimum)
Simpan interval yang **berakhir paling cepat**, karena ia menyisakan ruang terbanyak untuk sisanya.
```python
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])
    removed, prev_end = 0, float('-inf')
    for s, e in intervals:
        if s >= prev_end:
            prev_end = e                         # simpan
        else:
            removed += 1                         # bertabrakan → hapus (yang berakhir lebih lambat)
    return removed
```

## 6. Meeting Rooms II (jumlah ruang minimum)
```python
def min_meeting_rooms(intervals):
    starts = sorted(s for s, _ in intervals)
    ends = sorted(e for _, e in intervals)
    rooms = j = 0
    for s in starts:
        if s < ends[j]:
            rooms += 1                           # belum ada rapat yang selesai → ruang baru
        else:
            j += 1                               # pakai ulang ruang yang sudah kosong
    return rooms
```
Alternatifnya min-heap berisi waktu selesai. Ukuran heap maksimum adalah jawabannya.

## 7. Minimum Interval to Include Each Query (Hard)
Proses query dari kecil ke besar. Masukkan semua interval yang sudah dimulai ke heap `(ukuran, akhir)`, lalu buang yang sudah berakhir.
```python
import heapq
def min_interval(intervals, queries):
    intervals.sort()
    h, ans, i = [], {}, 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(h, (r - l + 1, r))
            i += 1
        while h and h[0][1] < q:                 # sudah berakhir sebelum q
            heapq.heappop(h)
        ans[q] = h[0][0] if h else -1
    return [ans[q] for q in queries]             # kembalikan sesuai urutan asli
```

## 8. Jebakan
- Mengubah `intervals` saat melakukan iterasi pada list yang sama.
- Lupa mengembalikan jawaban query sesuai **urutan asli** setelah diurutkan.
- Salah memilih kunci sort (awal vs akhir).

## 9. Kartu review
- **T:** Syarat dua interval overlap? **J:** `a <= d and c <= b`.
- **T:** Non-overlapping, urut berdasarkan apa? **J:** Akhir.
- **T:** Meeting Rooms II tanpa heap? **J:** Sort start dan end terpisah, dua pointer.
- **T:** Merge Intervals, urut berdasarkan apa? **J:** Awal.
