---
id: dsa-13-heap
track: dsa
title: Heap / Priority Queue
order: 13
estMinutes: 35
xp: 20
tags: [heap, top-k, two-heaps, desain]
---

# Heap / priority queue

**Ide inti:** heap memberi **elemen terkecil (atau terbesar) dalam O(1)** dan menambah atau membuang elemen dalam O(log n). Cocok kalau yang dibutuhkan hanya "yang paling …" secara berulang, bukan urutan lengkap.

`heapq` di Python adalah **min-heap**. Untuk max-heap, simpan nilai negatif.

## 1. Sinyal
- "k terbesar/terkecil/terdekat/paling sering"
- Menggabungkan k sumber yang masing-masing sudah terurut
- Median atau statistik dari data yang terus masuk (*stream*)
- Penjadwalan: "selalu proses yang paling mendesak dulu"
- Dijkstra dan Prim (lihat Advanced Graphs)

## 2. Template A: top-k dengan heap berukuran k
Untuk k **terbesar**, pakai **min-heap** berukuran k. Puncaknya adalah yang terkecil di antara k terbesar, sehingga mudah dibuang.

```python
import heapq
def kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return h[0]                      # O(n log k)
```

**K Closest Points:** untuk k **terkecil**, pakai **max-heap** berukuran k. Jarak dihitung kuadrat, tanpa akar.
```python
def k_closest(points, k):
    h = []
    for x, y in points:
        heapq.heappush(h, (-(x * x + y * y), x, y))
        if len(h) > k:
            heapq.heappop(h)         # buang yang terjauh
    return [[x, y] for _, x, y in h]
```

**Alternatif:** quickselect rata-rata O(n). Sebutkan di interview sebagai optimasi.

## 3. Template B: dua heap (median dari stream)
```python
class MedianFinder:
    def __init__(self):
        self.lo = []                 # max-heap (negatif): separuh bawah
        self.hi = []                 # min-heap: separuh atas

    def addNum(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))   # pastikan max(lo) <= min(hi)
        if len(self.hi) > len(self.lo):                     # lo boleh lebih banyak 1
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2
```

## 4. Template C: gabung k sumber terurut (heap berisi "kepala" tiap sumber)
Lihat Merge k Sorted Lists di materi Linked List. Pola yang sama dipakai di **Design Twitter**: ambil 10 tweet terbaru dari beberapa user.

```python
import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)      # user -> [(waktu, tweetId)]
        self.follows = defaultdict(set)

    def postTweet(self, userId, tweetId):
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId):
        h = []
        for u in self.follows[userId] | {userId}:
            if self.tweets[u]:
                i = len(self.tweets[u]) - 1
                t, tid = self.tweets[u][i]
                h.append((-t, tid, u, i))    # -t: yang terbaru keluar duluan
        heapq.heapify(h)
        feed = []
        while h and len(feed) < 10:
            _, tid, u, i = heapq.heappop(h)
            feed.append(tid)
            if i > 0:
                t, tid2 = self.tweets[u][i - 1]
                heapq.heappush(h, (-t, tid2, u, i - 1))
        return feed

    def follow(self, a, b):
        if a != b:
            self.follows[a].add(b)

    def unfollow(self, a, b):
        self.follows[a].discard(b)
```

## 5. Task Scheduler: rumus lebih cepat daripada simulasi
Tugas dengan frekuensi terbesar `maxF` membentuk `maxF − 1` "blok" berukuran `n + 1`, ditambah baris terakhir berisi semua tugas yang frekuensinya `maxF`.

```python
from collections import Counter
def least_interval(tasks, n):
    freq = Counter(tasks).values()
    max_f = max(freq)
    count_max = sum(1 for f in freq if f == max_f)
    return max(len(tasks), (max_f - 1) * (n + 1) + count_max)
```
`max(len(tasks), …)` dipakai karena kalau jenis tugas banyak, tidak ada waktu menganggur.

## 6. Jebakan
- Membandingkan objek yang tidak bisa dibandingkan di dalam tuple heap. Tambahkan penengah (indeks atau counter).
- Lupa tanda negatif saat **mengeluarkan** nilai dari max-heap.
- `heapq.heapify` adalah O(n), lebih cepat daripada n kali push.

## 7. Kartu review
- **T:** k terbesar memakai min-heap atau max-heap? **J:** Min-heap berukuran k.
- **T:** Median stream? **J:** Dua heap: max-heap bawah, min-heap atas, ukuran seimbang.
- **T:** Max-heap di Python? **J:** Simpan `-x`.
- **T:** Rumus Task Scheduler? **J:** `max(len(tasks), (maxF − 1)(n + 1) + jumlahMaxF)`.
