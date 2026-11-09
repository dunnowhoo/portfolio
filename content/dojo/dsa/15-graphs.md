---
id: dsa-15-graphs
track: dsa
title: Graphs (BFS, DFS, Topological Sort, Union-Find)
order: 15
estMinutes: 50
xp: 20
tags: [graph, bfs, dfs, grid, topological-sort, union-find]
---

# Graphs: BFS, DFS, topological sort, Union-Find

**Ide inti:** ubah soal menjadi **node dan sisi**, lalu pilih alat yang tepat:
- DFS atau BFS untuk menjelajah;
- BFS untuk jarak terpendek tanpa bobot;
- topological sort untuk ketergantungan;
- Union-Find untuk keterhubungan yang dibangun bertahap.

## 1. Representasi
```python
from collections import defaultdict, deque
adj = defaultdict(list)
for a, b in edges:            # graf tak berarah
    adj[a].append(b)
    adj[b].append(a)

DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]   # grid: tetangga dihitung, bukan disimpan
```

## 2. DFS di grid (Number of Islands)
```python
def num_islands(grid):
    R, C = len(grid), len(grid[0])
    def sink(r, c):
        if not (0 <= r < R and 0 <= c < C) or grid[r][c] != '1':
            return
        grid[r][c] = '0'                     # tandai dikunjungi (boleh ubah input? tanyakan!)
        for dr, dc in DIRS:
            sink(r + dr, c + dc)
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == '1':
                sink(r, c)
                count += 1
    return count
```
Untuk grid besar, rekursi bisa terlalu dalam. Versi BFS dengan `deque` lebih aman.

## 3. BFS: jarak terpendek tanpa bobot, termasuk multi-source
```python
def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    q, fresh = deque(), 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                q.append((r, c))             # SEMUA sumber masuk di awal
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):              # satu level = satu menit
            r, c = q.popleft()
            for dr, dc in DIRS:
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
```
**Tandai dikunjungi saat masuk queue**, bukan saat keluar. Kalau saat keluar, node yang sama bisa masuk queue berkali-kali.

## 4. "Telusuri dari tepi" (Pacific Atlantic, Surrounded Regions)
Kalau pertanyaannya "sel mana yang bisa mencapai tepi", balik arahnya: **mulai dari tepi** dan telusuri ke dalam.
```python
def pacific_atlantic(h):
    R, C = len(h), len(h[0])
    pac, atl = set(), set()
    def dfs(r, c, seen, prev):
        if (r, c) in seen or not (0 <= r < R and 0 <= c < C) or h[r][c] < prev:
            return
        seen.add((r, c))
        for dr, dc in DIRS:
            dfs(r + dr, c + dc, seen, h[r][c])     # air mengalir turun → kita naik
    for c in range(C):
        dfs(0, c, pac, h[0][c]); dfs(R - 1, c, atl, h[R - 1][c])
    for r in range(R):
        dfs(r, 0, pac, h[r][0]); dfs(r, C - 1, atl, h[r][C - 1])
    return [list(p) for p in pac & atl]
```

## 5. Topological sort (Kahn): ketergantungan dan deteksi siklus
```python
def find_order(n, prerequisites):
    adj, indeg = defaultdict(list), [0] * n
    for course, pre in prerequisites:          # pre → course
        adj[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []    # kurang dari n → ada siklus
```
Course Schedule (bisa atau tidak) = `len(order) == n`.

## 6. Union-Find (Disjoint Set Union)
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                                   # sudah satu set → sisi ini membuat siklus
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True
```
- **Redundant Connection:** sisi pertama yang `union`-nya False.
- **Connected Components:** mulai dari n, kurangi 1 setiap union berhasil.
- **Graph Valid Tree:** `len(edges) == n − 1` dan tidak ada union yang gagal.

## 7. Clone Graph: map lama → baru menahan siklus
```python
def clone_graph(node):
    if not node:
        return None
    copies = {}
    def dfs(n):
        if n in copies:
            return copies[n]
        copy = Node(n.val)
        copies[n] = copy                          # daftarkan SEBELUM rekursi ke tetangga
        copy.neighbors = [dfs(nb) for nb in n.neighbors]
        return copy
    return dfs(node)
```

## 8. Word Ladder (Hard): BFS dengan pola wildcard
```python
def ladder_length(begin, end, word_list):
    words = set(word_list)
    if end not in words:
        return 0
    buckets = defaultdict(list)                  # "h*t" -> ["hot", "hit", ...]
    for w in words | {begin}:
        for i in range(len(w)):
            buckets[w[:i] + '*' + w[i + 1:]].append(w)
    q, seen = deque([(begin, 1)]), {begin}
    while q:
        w, d = q.popleft()
        if w == end:
            return d
        for i in range(len(w)):
            for nxt in buckets[w[:i] + '*' + w[i + 1:]]:
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, d + 1))
    return 0
```

## 9. Memilih alat

| Pertanyaan | Alat |
|---|---|
| Berapa komponen / pulau? | DFS/BFS atau Union-Find |
| Jarak terpendek, semua sisi bobot sama | BFS |
| Ada siklus? Urutan pengerjaan? | Topological sort (berarah), Union-Find (tak berarah) |
| Sisi masuk bertahap, cek keterhubungan | Union-Find |
| Jarak terpendek berbobot | Dijkstra (materi berikutnya) |

## 10. Kartu review
- **T:** Kapan menandai visited di BFS? **J:** Saat dimasukkan ke queue.
- **T:** Multi-source BFS? **J:** Masukkan semua sumber ke queue di awal.
- **T:** Kahn mendeteksi siklus bagaimana? **J:** Panjang urutan < n.
- **T:** Union-Find, dua optimasi? **J:** Path compression/halving dan union by rank.
- **T:** Pacific Atlantic, trik utamanya? **J:** Telusuri dari tepi, naik ke sel yang lebih tinggi.
