---
id: dsa-12-tries
track: dsa
title: Tries (Prefix Tree)
order: 12
estMinutes: 30
xp: 20
tags: [trie, prefix, backtracking]
---

# Tries (prefix tree)

**Ide inti:** simpan banyak kata dalam pohon yang tiap sisinya satu huruf. Kata-kata dengan awalan sama **berbagi jalur**. Pencarian kata atau awalan sepanjang L butuh O(L), tidak bergantung pada jumlah kata.

## 1. Sinyal
- "Apakah ada kata yang diawali…", autocomplete, kamus
- Mencari **banyak kata sekaligus** di grid/teks (Word Search II)
- Wildcard per huruf (`.`)

## 2. Template
```python
class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}          # huruf -> TrieNode
        self.end = False            # ada kata yang berakhir di sini?

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix):
        return self._walk(prefix) is not None
```

## 3. Wildcard (Design Add and Search Words)
```python
def search(self, word):
    def dfs(i, node):
        if i == len(word):
            return node.end
        ch = word[i]
        if ch == '.':
            return any(dfs(i + 1, child) for child in node.children.values())
        nxt = node.children.get(ch)
        return nxt is not None and dfs(i + 1, nxt)
    return dfs(0, self.root)
```
Kasus terburuk dengan banyak `.` memang eksponensial, tapi dibatasi oleh jumlah node yang benar-benar ada.

## 4. Word Search II (Hard): trie + backtracking grid
Alih-alih menjalankan Word Search untuk setiap kata, masukkan semua kata ke trie, lalu satu DFS dari setiap sel **mengikuti trie**. Cabang yang tidak ada di trie langsung berhenti.

```python
def find_words(board, words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node['$'] = w                       # penanda akhir kata menyimpan katanya

    R, C, res = len(board), len(board[0]), []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent[ch]
        if '$' in node:
            res.append(node.pop('$'))       # pop supaya kata tidak tercatat dua kali
        board[r][c] = '#'                   # tandai sedang dipakai
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in node:
                dfs(nr, nc, node)
        board[r][c] = ch                    # pulihkan
        if not node:                        # pangkas cabang trie yang sudah habis
            parent.pop(ch)

    for r in range(R):
        for c in range(C):
            if board[r][c] in root:
                dfs(r, c, root)
    return res
```

Pemangkasan (`parent.pop(ch)`) membuat solusi ini lolos batas waktu. Tanpanya, cabang yang sudah habis dijelajahi berulang kali.

## 5. Jebakan
- `search` lupa mengecek `end`: kata "app" dianggap ada hanya karena "apple" ada.
- Tidak memulihkan sel grid setelah DFS.
- Kata duplikat di hasil Word Search II, karena penanda tidak dihapus.

## 6. Kartu review
- **T:** Kompleksitas insert/search di trie? **J:** O(L), panjang kata.
- **T:** Beda `search` dan `startsWith`? **J:** `search` butuh `end == True`.
- **T:** Word Search II, kenapa trie? **J:** Satu DFS menelusuri semua kata sekaligus, dan cabang bisa dipangkas.
