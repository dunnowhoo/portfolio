---
id: dsa-10-linked-list
track: dsa
title: Linked List
order: 10
estMinutes: 40
xp: 20
tags: [linked-list, fast-slow, dummy-node, desain]
---

# Linked List

**Ide inti:** tidak ada indeks, hanya **pointer**. Hampir semua soal menjadi mudah dengan empat alat: **node dummy**, **membalik pointer**, **fast & slow**, dan **dua pointer berjarak**.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
```

## 1. Alat 1: membalik list
```python
def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next      # 1) simpan sambungan berikutnya
        cur.next = prev     # 2) balik arah
        prev, cur = cur, nxt   # 3) maju
    return prev
```
Hafalkan sampai bisa ditulis dalam 30 detik. Ia dipakai di Reorder List, Palindrome List, dan k-Group.

## 2. Alat 2: node dummy
Menghilangkan kasus khusus "kepala berubah".
```python
def merge_two_lists(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next
```

## 3. Alat 3: fast & slow (Floyd)
```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

def middle(head):                 # untuk panjang genap, hasilnya tengah kedua
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow
```

**Awal siklus:** setelah bertemu, satu pointer kembali ke kepala, lalu keduanya maju satu langkah. Titik temu kedua adalah awal siklus. Ini dipakai di **Find the Duplicate Number**, dengan `nums[i]` dianggap sebagai pointer `next`.

```python
def find_duplicate(nums):
    slow = fast = 0
    while True:
        slow, fast = nums[slow], nums[nums[fast]]
        if slow == fast:
            break
    p = 0
    while p != slow:
        p, slow = nums[p], nums[slow]
    return p
```

## 4. Alat 4: dua pointer berjarak n
```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):        # buat jarak n+1 supaya slow berhenti TEPAT SEBELUM target
        fast = fast.next
    while fast:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next
```

## 5. Kombinasi: Reorder List (L0→Ln→L1→Ln−1…)
```python
def reorder_list(head):
    slow, fast = head, head.next
    while fast and fast.next:                 # 1) cari tengah
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:                             # 2) balik paruh kedua
        nxt = second.next
        second.next = prev
        prev, second = second, nxt
    first, second = head, prev
    while second:                             # 3) gabung selang-seling
        n1, n2 = first.next, second.next
        first.next, second.next = second, n1
        first, second = n1, n2
```

## 6. Desain: LRU Cache (hash map + doubly linked list)
```python
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.left, self.right = Node(), Node()       # left = paling lama, right = paling baru
        self.left.next, self.right.prev = self.right, self.left

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_recent(self, node):                     # sisipkan sebelum right
        p = self.right.prev
        p.next = node; node.prev = p
        node.next = self.right; self.right.prev = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node); self._add_recent(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_recent(node)
        if len(self.map) > self.cap:
            lru = self.left.next
            self._remove(lru)
            del self.map[lru.key]                    # karena itu node menyimpan key
```

Di interview, sebutkan bahwa `OrderedDict` bisa dipakai, tapi tunjukkan bahwa kamu bisa membangunnya sendiri.

## 7. Merge k Sorted Lists dengan heap
```python
import heapq
def merge_k_lists(lists):
    h = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(h)
    dummy = tail = ListNode()
    while h:
        _, i, node = heapq.heappop(h)
        tail.next = tail = node
        if node.next:
            heapq.heappush(h, (node.next.val, i, node.next))   # i sebagai penengah agar node tidak dibandingkan
    return dummy.next          # O(N log k)
```

## 8. Reverse Nodes in k-Group (Hard)
```python
def reverse_k_group(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):                      # cek masih ada k node
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next # balik grup; ujungnya disambung ke group_next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        first = group_prev.next                 # dulu kepala, sekarang ekor grup
        group_prev.next = kth
        group_prev = first
```

## 9. Jebakan
- Kehilangan sisa list karena tidak menyimpan `next` sebelum memutus sambungan.
- Lupa `slow.next = None` saat memotong list (Reorder) → terjadi siklus.
- Membandingkan objek `ListNode` di heap → `TypeError`. Tambahkan indeks penengah.

## 10. Kartu review
- **T:** Tiga langkah membalik list? **J:** Simpan next, balik arah, maju.
- **T:** Kenapa node dummy? **J:** Supaya kepala yang berubah atau terhapus tidak jadi kasus khusus.
- **T:** Remove Nth from End, jaraknya berapa? **J:** n+1 dari dummy.
- **T:** LRU Cache, dua struktur apa? **J:** Hash map + doubly linked list.
- **T:** Find Duplicate dengan O(1) ruang? **J:** Floyd: `nums[i]` dianggap pointer.
