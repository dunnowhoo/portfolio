---
id: dsa-16-advanced-graphs
track: dsa
title: Advanced Graphs (Dijkstra, MST, Bellman-Ford, Euler)
order: 16
estMinutes: 45
xp: 20
tags: [graph, dijkstra, mst, bellman-ford, eulerian, topological-sort]
---

# Advanced Graphs: Dijkstra, MST, Bellman-Ford, Euler

Topik ini lebih jarang muncul di interview dibanding BFS/DFS. Tapi kalau muncul, templatenya hampir selalu sama. **Hafalkan templatenya**, lalu fokus mengenali kapan dipakai.

| Masalah | Algoritma | Kompleksitas |
|---|---|---|
| Jarak terpendek, bobot **≥ 0** | Dijkstra (heap) | O(E log V) |
| Jarak terpendek dengan **batas jumlah sisi**, atau bobot negatif | Bellman-Ford | O(k · E) |
| Hubungkan semua node dengan biaya minimum | MST: Prim atau Kruskal | O(E log V) |
| Pakai **setiap sisi tepat sekali** | Hierholzer (Eulerian path) | O(E log E) |
| Urutan dari aturan "a sebelum b" | Topological sort | O(V + E) |

## 1. Dijkstra
```python
import heapq
from collections import defaultdict

def network_delay_time(times, n, k):
    adj = defaultdict(list)
    for u, v, w in times:
        adj[u].append((v, w))
    dist = {}
    h = [(0, k)]
    while h:
        d, u = heapq.heappop(h)
        if u in dist:
            continue                   # sudah final dengan jarak lebih kecil
        dist[u] = d                    # pertama kali keluar heap = jarak terpendek
        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(h, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1
```

**Variasi minimax (Swim in Rising Water):** "biaya" jalur adalah **maksimum** elevasi, bukan jumlah. Template Dijkstra tetap berlaku, cukup ganti `d + w` dengan `max(d, grid[nr][nc])`.
```python
def swim_in_water(grid):
    n = len(grid)
    h, seen = [(grid[0][0], 0, 0)], {(0, 0)}
    while h:
        t, r, c = heapq.heappop(h)
        if (r, c) == (n - 1, n - 1):
            return t
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(h, (max(t, grid[nr][nc]), nr, nc))
```

## 2. Bellman-Ford dengan batas k transit
Relaksasi semua sisi sebanyak `k + 1` kali (k transit = k + 1 penerbangan). **Pakai salinan array harga** supaya satu iterasi hanya menambah satu sisi.
```python
def find_cheapest_price(n, flights, src, dst, k):
    INF = float('inf')
    prices = [INF] * n
    prices[src] = 0
    for _ in range(k + 1):
        tmp = prices.copy()
        for u, v, w in flights:
            if prices[u] != INF and prices[u] + w < tmp[v]:
                tmp[v] = prices[u] + w          # baca dari prices (iterasi lama), tulis ke tmp
        prices = tmp
    return -1 if prices[dst] == INF else prices[dst]
```

## 3. MST: Prim (graf padat seperti "semua titik terhubung")
```python
def min_cost_connect_points(points):
    n = len(points)
    in_tree = [False] * n
    best = [float('inf')] * n
    best[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=best.__getitem__)
        in_tree[u] = True
        total += best[u]
        x1, y1 = points[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(x1 - points[v][0]) + abs(y1 - points[v][1])
                if d < best[v]:
                    best[v] = d
    return total          # O(n²): pas untuk graf lengkap n ≤ 1000
```
**Kruskal:** urutkan sisi berdasarkan bobot, lalu `union` dengan DSU. Sisi yang gagal di-union dilewati. Cocok untuk graf jarang (*sparse*).

## 4. Eulerian path: Reconstruct Itinerary (Hierholzer)
Setiap tiket dipakai tepat sekali. Telusuri secara greedy (tujuan leksikal terkecil dulu). **Tambahkan bandara ke rute saat mundur** dari rekursi, lalu balik hasilnya.
```python
def find_itinerary(tickets):
    adj = defaultdict(list)
    for a, b in sorted(tickets, reverse=True):
        adj[a].append(b)                 # terbalik → pop() memberi yang terkecil
    route = []
    def dfs(a):
        while adj[a]:
            dfs(adj[a].pop())
        route.append(a)                  # post-order
    dfs("JFK")
    return route[::-1]
```

## 5. Alien Dictionary: topological sort dari perbandingan kata
```python
from collections import deque
def alien_order(words):
    adj = {c: set() for w in words for c in w}
    for w1, w2 in zip(words, words[1:]):
        if len(w1) > len(w2) and w1.startswith(w2):
            return ""                    # "abc" sebelum "ab" → tidak valid
        for a, b in zip(w1, w2):
            if a != b:
                adj[a].add(b)            # hanya huruf berbeda PERTAMA yang memberi info
                break
    indeg = {c: 0 for c in adj}
    for a in adj:
        for b in adj[a]:
            indeg[b] += 1
    q = deque(c for c in adj if indeg[c] == 0)
    out = []
    while q:
        c = q.popleft()
        out.append(c)
        for d in adj[c]:
            indeg[d] -= 1
            if indeg[d] == 0:
                q.append(d)
    return "".join(out) if len(out) == len(adj) else ""
```
Versi LintCode 892 meminta urutan leksikal terkecil kalau jawabannya lebih dari satu. Ganti `deque` dengan min-heap.

## 6. Jebakan
- Dijkstra dengan bobot negatif menghasilkan jawaban salah. Pakai Bellman-Ford.
- Bellman-Ford tanpa salinan array: satu iterasi bisa menambah banyak sisi, sehingga batas k terlanggar.
- Hierholzer: menambahkan node **sebelum** rekursi (pre-order) memberi rute salah kalau ada jalan buntu.

## 7. Kartu review
- **T:** Dijkstra, kapan jarak node final? **J:** Saat pertama kali keluar dari heap.
- **T:** Cheapest Flights, kenapa salinan array? **J:** Supaya setiap iterasi hanya menambah satu penerbangan.
- **T:** Prim O(n²) dipakai kapan? **J:** Graf padat atau lengkap (semua titik saling terhubung).
- **T:** Reconstruct Itinerary? **J:** Hierholzer: DFS, tambahkan saat mundur, lalu balik.
- **T:** Alien Dictionary, kasus tidak valid? **J:** Kata panjang muncul sebelum prefiksnya sendiri, atau ada siklus.
