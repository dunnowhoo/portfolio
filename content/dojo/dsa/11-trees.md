---
id: dsa-11-trees
track: dsa
title: Trees (DFS, BFS, BST)
order: 11
estMinutes: 45
xp: 20
tags: [tree, dfs, bfs, bst, rekursi]
---

# Trees: DFS, BFS, BST

**Ide inti:** hampir semua soal pohon adalah **satu fungsi rekursif** yang menjawab "apa yang perlu aku ketahui dari anak kiri dan kanan untuk menjawab node ini?" Sisanya BFS per level atau sifat BST.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
```

## 1. Memilih traversal

| Kebutuhan | Pakai |
|---|---|
| Info dari anak dulu, baru node (tinggi, seimbang, diameter) | DFS **post-order** (kembalikan nilai) |
| Info dari leluhur turun ke anak (batas BST, max di jalur) | DFS dengan **parameter** yang dibawa turun |
| Per level, terdekat dari akar, tampak kanan | **BFS** dengan queue |
| Urutan terurut dari BST | **Inorder** (kiri, node, kanan) |

## 2. Template DFS: kembalikan nilai
```python
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def is_balanced(root):
    def h(node):                      # tinggi, atau -1 kalau sudah tidak seimbang
        if not node:
            return 0
        l, r = h(node.left), h(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return h(root) != -1
```

## 3. Template DFS: jawaban global + nilai kembali berbeda
**Binary Tree Maximum Path Sum** (Hard). Yang dikembalikan adalah "gain" satu cabang ke atas, sedangkan yang dicatat adalah jalur melengkung lewat node.
```python
def max_path_sum(root):
    best = float('-inf')
    def gain(node):
        nonlocal best
        if not node:
            return 0
        l = max(gain(node.left), 0)      # cabang negatif lebih baik tidak diambil
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)      # ke atas hanya boleh satu cabang
    gain(root)
    return best
```

## 4. Template DFS: membawa info turun
```python
def is_valid_bst(root):
    def ok(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return ok(node.left, low, node.val) and ok(node.right, node.val, high)
    return ok(root, float('-inf'), float('inf'))

def good_nodes(root):
    def dfs(node, mx):
        if not node:
            return 0
        good = 1 if node.val >= mx else 0
        mx = max(mx, node.val)
        return good + dfs(node.left, mx) + dfs(node.right, mx)
    return dfs(root, root.val)
```

## 5. Template BFS per level
```python
from collections import deque
def level_order(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # tepat satu level
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res
# Right Side View = ambil level[-1] di setiap level
```

## 6. BST: manfaatkan urutan
```python
def lca_bst(root, p, q):
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left
        elif p.val > node.val and q.val > node.val:
            node = node.right
        else:
            return node                  # p dan q terpisah (atau salah satunya node ini)

def kth_smallest(root, k):               # inorder iteratif
    stack, cur = [], root
    while stack or cur:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val
        cur = cur.right
```

## 7. Membangun dan menyerialisasi
```python
def build_tree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}
    it = iter(preorder)                  # preorder: akar selalu berikutnya
    def build(lo, hi):
        if lo > hi:
            return None
        val = next(it)
        node = TreeNode(val)
        m = pos[val]
        node.left = build(lo, m - 1)     # urutan kiri lalu kanan WAJIB sama dengan preorder
        node.right = build(m + 1, hi)
        return node
    return build(0, len(inorder) - 1)

class Codec:
    def serialize(self, root):
        out = []
        def dfs(n):
            if not n:
                out.append("N"); return
            out.append(str(n.val)); dfs(n.left); dfs(n.right)
        dfs(root)
        return ",".join(out)

    def deserialize(self, data):
        vals = iter(data.split(","))
        def dfs():
            v = next(vals)
            if v == "N":
                return None
            node = TreeNode(int(v))
            node.left, node.right = dfs(), dfs()
            return node
        return dfs()
```

## 8. Jebakan
- Validate BST: hanya membandingkan dengan anak langsung itu **salah**. Setiap node harus berada di rentang yang diwarisi dari semua leluhur.
- Diameter dihitung dalam jumlah **sisi**, bukan node.
- BFS: memakai `len(q)` yang berubah di dalam loop. Ambil `for _ in range(len(q))` di awal level.
- Pohon miring sedalam 10⁵ melewati batas rekursi Python. Sebutkan solusi iteratif kalau ditanya.

## 9. Kartu review
- **T:** Diameter, apa yang dicatat dan apa yang dikembalikan? **J:** Catat `l + r`, kembalikan `1 + max(l, r)`.
- **T:** Validate BST? **J:** Bawa batas `(low, high)` turun.
- **T:** k-th smallest di BST? **J:** Inorder, berhenti di elemen ke-k.
- **T:** Max Path Sum, kenapa `max(gain, 0)`? **J:** Cabang negatif lebih baik dibuang.
- **T:** Bangun dari preorder + inorder? **J:** Preorder memberi akar, posisinya di inorder membagi kiri dan kanan.
