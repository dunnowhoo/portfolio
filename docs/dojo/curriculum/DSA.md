# Kurikulum DSA: dari fondasi sampai siap coding interview

Status: Draft v1 · 9 November 2026 · Bahasa latihan: **Python 3**

## 0. Ringkasan

| Section | Isi | Periode | Ujung |
|---|---|---|---|
| D0 | Fondasi: Big-O, toolkit Python, rekursi, cara memecahkan soal | 9–29 Nov 2026 | Checkpoint fondasi |
| D1–D18 | **NeetCode 150**, dikelompokkan dalam 18 topik | 30 Nov 2026 – 16 Agu 2027 | 🎌 **NC150 selesai** (Daruma, tenggat 31 Agu 2027) |
| D19 | Interview Mastery: review SRS, 34 soal ekstra, mock interview, kontes | Sep – Des 2027 | 80% soal ★2, 4 mock interview |
| D20 | Kontes dan Jepang: AtCoder ABC (soal berbahasa Jepang), paiza, perawatan | Jan – Sep 2028 | Rating dan kebiasaan terjaga saat fokus N3 |
| D21 | (Opsional) System design dasar, untuk target AWS atau luar negeri | 2028+ | |

**Jalur ini dirancang untuk:**
- coding test perusahaan global (gaya LeetCode, 45–60 menit, 1–2 soal);
- tes perusahaan Jepang (paiza, AtCoder-style, take-home);
- tujuan jangka panjang AWS atau kerja di luar negeri.

Urutan topik mengikuti pohon prasyarat NeetCode Roadmap (`https://neetcode.io/roadmap`).

## 1. Cara mengerjakan satu soal

Detailnya ada di `dsa-04-problem-solving`.

1. **Pahami (≤ 5 menit).** Tulis ulang soal dengan kata sendiri, tanyakan *constraint*, dan buat 2 contoh termasuk *edge case*.
2. **Cocokkan pola (≤ 5 menit).** Lihat sinyal di soal, misalnya "subarray kontigu → sliding window", lalu tulis brute force dan kompleksitasnya.
3. **Rencanakan.** Tulis langkah dalam bahasa Indonesia atau pseudocode, beserta kompleksitas target.
4. **Kerjakan (≤ 20 menit).** Kode Python yang rapi dengan nama variabel jelas.
5. **Uji.** Jalankan contoh dengan tangan, lalu *submit*.
6. **Kalau buntu 25 menit:**
   - lihat hint (dicatat "pakai hint");
   - masih buntu → tonton penjelasan NeetCode;
   - **tutup videonya, tulis ulang dari nol**.
7. **Catat:**
   - pola dan ide kunci dalam satu kalimat;
   - kesalahan yang terjadi;
   - rating Lupa/Sulit/Baik/Mudah, yang dipakai untuk menjadwalkan review SRS.

**Soal premium LeetCode** (#271, #286, #261, #323, #269, #252, #253) dikerjakan di NeetCode (gratis) atau versi gratis di LintCode. Nomor LintCode tertulis di tabel.

## 2. Target mingguan per fase

| Fase | Hari aktif | Soal baru | Review | Lainnya |
|---|---|---|---|---|
| D0 (Nov 2026) | ≥ 5 | 3 pemanasan | | 4 materi fondasi, 1 checkpoint |
| D1–D18 (Des 2026 – Agu 2027) | ≥ 5 | **5** | 3 | 1 boss ber-timer di akhir pekan, 3 sesi Tebak Pola, materi saat topik baru |
| D19 (Sep – Des 2027) | ≥ 5 | 3 (daftar ekstra/Hard) | 5 | 1 mock 45 menit per minggu, 2 kontes per bulan |
| D20 (2028, prioritas N3) | ≥ 4 | 2 | 4 | 1 AtCoder ABC per 2 minggu, paiza 1× per bulan |

**Target bulanan (soal NC150 kumulatif):**

| Bulan | Kumulatif | Topik selesai |
|---|---|---|
| Nov 2026 | 0 (+3 pemanasan) | D0 |
| Des 2026 | ±17 | Arrays & Hashing, Two Pointers |
| Jan 2027 | ±36 | Sliding Window, Stack, Binary Search |
| Feb 2027 | ±56 | Linked List |
| Mar 2027 | ±73 | Trees, Tries, Heap. **Mock interview pertama** |
| Apr 2027 | ±91 | Backtracking |
| Mei 2027 | ±106 | Graphs, Advanced Graphs |
| Jun 2027 | ±118 | 1-D DP |
| Jul 2027 | ±137 | 2-D DP, Greedy, Intervals |
| Agu 2027 | **150** | Math & Geometry, Bit Manipulation. Buffer wisuda 17–31 Agu |
| Sep – Des 2027 | +34 ekstra | ≥ 80% ★2, 4 mock, ±8 kontes |

Mock interview dilakukan 1× per bulan mulai Maret 2027 dan setiap minggu di D19. Formatnya 45 menit, 2 soal, berbicara sambil mengerjakan, dan direkam untuk dievaluasi.

## 3. Template node per topik

```
📖 Materi topik (MD)                         20 XP
🎬 Video konsep NeetCode untuk topik         10 XP
🎯 Soal 1..n (urutan Easy → Medium → Hard)   10/20/40 XP per soal
🎯 Tebak Pola topik (5 kartu)                10 XP
👹 Boss: 2 soal acak topik, 45 menit, tanpa melihat solusi    80 XP
✍️ Refleksi: tulis "kapan aku pakai pola ini" (3 kalimat)    20 XP
```

Link per soal: `https://leetcode.com/problems/{slug}/`. Video solusi dicari dengan kata kunci `neetcode {judul soal}`, lalu ID-nya disimpan saat M2. Kolom **Ringkasan** adalah parafrase singkat buatan sendiri (bukan salinan soal), dan dipakai di kartu Tebak Pola.

## 4. D0: Fondasi (9–29 Nov 2026)

| Node | Isi |
|---|---|
| 📖 `dsa-00-cara-belajar` | Cara belajar DSA, SRS, batas waktu, jurnal pola |
| 📖 `dsa-01-big-o` | Big-O, menghitung kompleksitas, tabel batas input |
| 🎬 | "neetcode big o notation" |
| 📖 `dsa-02-python-toolkit` | list, dict, set, deque, heapq, bisect, Counter, defaultdict, sort key |
| 🎯 Pemanasan | `1480 running-sum-of-1d-array` (E) · `1672 richest-customer-wealth` (E) · `412 fizz-buzz` (E) |
| 📖 `dsa-03-rekursi` | Rekursi, call stack, base case, memo |
| 📖 `dsa-04-problem-solving` | Metode UMPIRE + cara bicara saat interview |
| 🏯 Checkpoint | 10 soal kuis Big-O bawaan + 1 soal Easy dalam 15 menit |

## 5. D1–D18: NeetCode 150

Kolom tabel: **#** · **LC** (nomor) · **Soal** · **Lv** (E/M/H) · **Pola** · **Ringkasan** · **Ide kunci**

### D1 · Arrays & Hashing (30 Nov – 13 Des 2026) · `dsa-05-arrays-hashing`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 1 | 217 | Contains Duplicate | E | Hash set | Ada nilai yang muncul > 1 kali? | Masukkan ke set; sudah ada → True |
| 2 | 242 | Valid Anagram | E | Hitung frekuensi | Dua string berisi huruf yang sama persis? | `Counter(s) == Counter(t)` atau array 26 |
| 3 | 1 | Two Sum | E | Hash map | Dua indeks yang nilainya berjumlah target | Simpan nilai→indeks; cek `target − x` dulu |
| 4 | 49 | Group Anagrams | M | Hash map, kunci kanonik | Kelompokkan kata yang saling anagram | Kunci = tuple hitungan 26 huruf |
| 5 | 347 | Top K Frequent Elements | M | Bucket sort / heap | k nilai paling sering muncul | Bucket berindeks frekuensi, ambil dari belakang, O(n) |
| 6 | 271 | Encode and Decode Strings (LintCode 659) | M | Desain string | List string → satu string → kembali | Awali tiap kata dengan `panjang#` |
| 7 | 238 | Product of Array Except Self | M | Prefix/suffix | Hasil kali semua kecuali diri sendiri, tanpa bagi | Pass kiri isi prefix, pass kanan kalikan suffix |
| 8 | 36 | Valid Sudoku | M | Hash set | Papan sudoku sebagian valid? | Set per baris, kolom, kotak `(r//3, c//3)` |
| 9 | 128 | Longest Consecutive Sequence | M | Hash set | Barisan angka berurutan terpanjang, O(n) | Hitung hanya dari x yang `x−1` tidak ada |

### D2 · Two Pointers (14–20 Des) · `dsa-06-two-pointers`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 10 | 125 | Valid Palindrome | E | Two pointers | Palindrom setelah buang non-alfanumerik? | Kiri-kanan, lewati non-alnum, bandingkan `lower()` |
| 11 | 167 | Two Sum II | M | Two pointers (terurut) | Dua angka berjumlah target di array terurut | Kecil → geser kiri; besar → geser kanan |
| 12 | 15 | 3Sum | M | Sort + two pointers | Semua triplet unik berjumlah 0 | Urutkan; per i jalankan two pointers; lewati duplikat |
| 13 | 11 | Container With Most Water | M | Two pointers greedy | Dua garis penampung air terbanyak | Luas = lebar × min; geser yang lebih pendek |
| 14 | 42 | Trapping Rain Water | H | Two pointers | Total air di antara batang | Air i = `min(maxL, maxR) − h[i]`; geser sisi dengan max lebih kecil |

### D3 · Sliding Window (21 Des – 3 Jan) · `dsa-07-sliding-window`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 15 | 121 | Best Time to Buy and Sell Stock | E | Sliding window | Untung maksimum, sekali beli lalu jual | Simpan harga terendah sejauh ini |
| 16 | 3 | Longest Substring Without Repeating Characters | M | Variable window | Substring terpanjang tanpa huruf berulang | Duplikat → majukan kiri melewati posisi lamanya |
| 17 | 424 | Longest Repeating Character Replacement | M | Variable window | Terpanjang yang bisa jadi satu huruf dengan ≤ k ganti | Valid jika `panjang − frek_max ≤ k` |
| 18 | 567 | Permutation in String | M | Fixed window | s2 memuat permutasi s1? | Jendela sepanjang s1; bandingkan hitungan 26 huruf |
| 19 | 76 | Minimum Window Substring | H | Variable window | Jendela terpendek memuat semua huruf t | Perluas sampai lengkap, kecilkan selama masih lengkap |
| 20 | 239 | Sliding Window Maximum | H | Monotonic deque | Maksimum tiap jendela ukuran k | Deque indeks dengan nilai menurun |

### D4 · Stack (4–14 Jan 2027) · `dsa-08-stack`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 21 | 20 | Valid Parentheses | E | Stack | Kurung berpasangan dan berurutan benar? | Push pembuka; penutup harus cocok dengan puncak |
| 22 | 155 | Min Stack | M | Desain stack | Stack dengan `getMin` O(1) | Simpan `(nilai, min_sejauh_ini)` |
| 23 | 150 | Evaluate Reverse Polish Notation | M | Stack | Hitung ekspresi postfix | Operator → pop dua; bagi pakai `int(a / b)` |
| 24 | 22 | Generate Parentheses | M | Backtracking | Semua kurung valid dari n pasang | Tambah `(` jika open < n; `)` jika close < open |
| 25 | 739 | Daily Temperatures | M | Monotonic stack | Berapa hari sampai lebih hangat | Stack indeks menurun; pop saat ada yang lebih panas |
| 26 | 853 | Car Fleet | M | Sort + stack | Jumlah rombongan mobil di tujuan | Urut dari dekat tujuan; waktu tiba lebih lama → rombongan baru |
| 27 | 84 | Largest Rectangle in Histogram | H | Monotonic stack | Persegi panjang terbesar | Saat tinggi turun, pop dan hitung luas sampai i |

### D5 · Binary Search (15–25 Jan) · `dsa-09-binary-search`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 28 | 704 | Binary Search | E | Binary search | Indeks target di array terurut | `l ≤ r`, mid, geser batas |
| 29 | 74 | Search a 2D Matrix | M | Binary search | Target di matriks yang terurut bersambung | Anggap 1D: `(mid // n, mid % n)` |
| 30 | 875 | Koko Eating Bananas | M | Binary search on answer | Kecepatan minimum agar habis dalam h jam | Cari k di [1, max]; cek `Σ ceil(p/k) ≤ h` |
| 31 | 153 | Find Minimum in Rotated Sorted Array | M | Binary search | Minimum array terurut yang dirotasi | `nums[mid] > nums[r]` → minimum di kanan |
| 32 | 33 | Search in Rotated Sorted Array | M | Binary search | Cari target di array terurut yang dirotasi | Salah satu sisi mid pasti terurut |
| 33 | 981 | Time Based Key-Value Store | M | Hash map + bisect | Nilai terbaru dengan timestamp ≤ t | List per kunci sudah terurut → `bisect_right` |
| 34 | 4 | Median of Two Sorted Arrays | H | Binary search partisi | Median dua array terurut, O(log) | Cari potongan di array pendek: maxKiri ≤ minKanan |

### D6 · Linked List (26 Jan – 10 Feb) · `dsa-10-linked-list`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 35 | 206 | Reverse Linked List | E | Pointer | Balik linked list | `prev, cur`; simpan next; arahkan ke prev |
| 36 | 21 | Merge Two Sorted Lists | E | Dummy node | Gabung dua list terurut | Dummy + tail, ambil yang lebih kecil |
| 37 | 141 | Linked List Cycle | E | Fast & slow | Ada siklus? | Floyd: fast 2 langkah, slow 1 |
| 38 | 143 | Reorder List | M | Tengah + balik + gabung | L0→Ln→L1→Ln−1… | Cari tengah, balik paruh kedua, selang-seling |
| 39 | 19 | Remove Nth Node From End | M | Two pointers berjarak | Hapus node ke-n dari belakang | Dummy; fast maju n+1, lalu jalan bersama |
| 40 | 138 | Copy List with Random Pointer | M | Hash map | Salin list dengan pointer acak | Pass 1 buat node baru; pass 2 sambungkan |
| 41 | 2 | Add Two Numbers | M | Simulasi + carry | Jumlahkan dua angka berdigit terbalik | Jalan bersama: jumlah + carry → node baru |
| 42 | 287 | Find the Duplicate Number | M | Fast & slow (indeks) | Satu duplikat, ruang O(1) | `nums[i]` sebagai pointer → awal siklus |
| 43 | 146 | LRU Cache | M | Hash map + doubly linked list | Cache, buang yang paling lama tak dipakai | Map kunci→node, list ganda untuk urutan |
| 44 | 23 | Merge k Sorted Lists | H | Heap | Gabung k list terurut | Min-heap `(nilai, i, node)` |
| 45 | 25 | Reverse Nodes in k-Group | H | Pointer | Balik setiap k node | Cek ada k node, balik, sambungkan ujung grup |

### D7 · Trees (11 Feb – 10 Mar) · `dsa-11-trees`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 46 | 226 | Invert Binary Tree | E | Tree DFS | Cerminkan pohon | Tukar kiri-kanan, rekursif |
| 47 | 104 | Maximum Depth of Binary Tree | E | Tree DFS | Kedalaman maksimum | `1 + max(kiri, kanan)` |
| 48 | 543 | Diameter of Binary Tree | E | Tree DFS + global | Jalur terpanjang antar dua node | Kandidat = tinggiKiri + tinggiKanan |
| 49 | 110 | Balanced Binary Tree | E | Tree DFS | Selisih tinggi ≤ 1 di setiap node? | Kembalikan tinggi atau −1 kalau tidak seimbang |
| 50 | 100 | Same Tree | E | Tree DFS | Dua pohon identik? | Bandingkan nilai, rekursi kiri dan kanan |
| 51 | 572 | Subtree of Another Tree | E | Tree DFS | t subpohon s? | `sameTree` di setiap node s |
| 52 | 235 | LCA of a BST | M | Sifat BST | Leluhur bersama terendah di BST | Keduanya < node → kiri; > → kanan; selain itu node ini |
| 53 | 102 | Level Order Traversal | M | Tree BFS | Nilai per level | Queue; proses `len(queue)` per level |
| 54 | 199 | Right Side View | M | Tree BFS | Yang terlihat dari kanan | Ambil node terakhir tiap level |
| 55 | 1448 | Count Good Nodes | M | Tree DFS | Node ≥ semua leluhurnya | Bawa nilai max di jalur |
| 56 | 98 | Validate BST | M | Tree DFS + batas | BST valid? | Setiap node di rentang `(low, high)` |
| 57 | 230 | Kth Smallest in a BST | M | Inorder | Terkecil ke-k | Inorder iteratif, berhenti di ke-k |
| 58 | 105 | Construct from Preorder and Inorder | M | Rekursi + map | Bangun pohon dari dua traversal | `preorder[0]` = akar; posisi di inorder membagi |
| 59 | 124 | Binary Tree Maximum Path Sum | H | Tree DFS + global | Jumlah jalur maksimum | Gain = `max(0, …)`; kandidat = node + dua gain |
| 60 | 297 | Serialize and Deserialize | H | Preorder + penanda null | Pohon ↔ string | Preorder dengan "N"; baca ulang dengan iterator |

### D8 · Tries (11–15 Mar) · `dsa-12-tries`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 61 | 208 | Implement Trie | M | Trie | insert/search/startsWith | Node: dict anak + flag akhir |
| 62 | 211 | Add and Search Words | M | Trie + DFS | Cari dengan wildcard `.` | `.` → coba semua anak |
| 63 | 212 | Word Search II | H | Trie + backtracking | Semua kata daftar di papan | Trie kata, DFS mengikuti trie, pangkas cabang habis |

### D9 · Heap / Priority Queue (16–25 Mar) · `dsa-13-heap`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 64 | 703 | Kth Largest in a Stream | E | Min-heap ukuran k | Terbesar ke-k setelah tiap tambah | Puncak heap = jawaban |
| 65 | 1046 | Last Stone Weight | E | Max-heap | Simulasi benturan dua batu terberat | heapq dengan nilai negatif |
| 66 | 973 | K Closest Points to Origin | M | Heap | k titik terdekat (0,0) | Max-heap ukuran k pada jarak kuadrat |
| 67 | 215 | Kth Largest in an Array | M | Heap / quickselect | Terbesar ke-k | Min-heap k, atau quickselect O(n) rata-rata |
| 68 | 621 | Task Scheduler | M | Greedy + hitung | Waktu minimum dengan jeda n | `(maxF−1)(n+1) + jumlahMaxF`, min `len(tasks)` |
| 69 | 355 | Design Twitter | M | Heap + hash map | Follow/post/feed 10 terbaru | Gabung feed dengan heap waktu |
| 70 | 295 | Find Median from Data Stream | H | Dua heap | Median setelah tiap angka | Max-heap kiri, min-heap kanan, seimbangkan |

### D10 · Backtracking (26 Mar – 7 Apr) · `dsa-14-backtracking`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 71 | 78 | Subsets | M | Backtracking | Semua himpunan bagian | Ambil/tidak per elemen |
| 72 | 39 | Combination Sum | M | Backtracking | Kombinasi (boleh ulang) = target | Rekursi dari i, boleh tetap di i |
| 73 | 40 | Combination Sum II | M | Backtracking + skip dup | Kombinasi unik sekali pakai | Urutkan; lewati duplikat di level sama |
| 74 | 46 | Permutations | M | Backtracking | Semua permutasi | `used[]`, pilih yang belum dipakai |
| 75 | 90 | Subsets II | M | Backtracking + skip dup | Subset unik dengan duplikat | Urutkan; skip duplikat di level sama |
| 76 | 79 | Word Search | M | DFS grid + backtrack | Kata dari sel bertetangga? | Tandai sel sementara, pulihkan setelah |
| 77 | 131 | Palindrome Partitioning | M | Backtracking | Semua pecahan palindrom | Dari i coba j dengan `s[i:j+1]` palindrom |
| 78 | 17 | Letter Combinations of a Phone Number | M | Backtracking | Kombinasi huruf dari digit | Map digit→huruf, rekursi per posisi |
| 79 | 51 | N-Queens | H | Backtracking + set | Penempatan n ratu aman | Set kolom, `r−c`, `r+c` |

### D11 · Graphs (8 Apr – 2 Mei) · `dsa-15-graphs`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 80 | 200 | Number of Islands | M | Grid DFS/BFS | Hitung pulau | Ketemu `1` → DFS tenggelamkan, +1 |
| 81 | 695 | Max Area of Island | M | Grid DFS | Luas pulau terbesar | DFS mengembalikan jumlah sel |
| 82 | 133 | Clone Graph | M | DFS + map | Salin graf | Map lama→baru menahan siklus |
| 83 | 286 | Walls and Gates (LintCode 663) | M | Multi-source BFS | Jarak ke gerbang terdekat | BFS sekaligus dari semua gerbang |
| 84 | 994 | Rotting Oranges | M | Multi-source BFS | Menit sampai semua busuk | BFS per level dari semua yang busuk |
| 85 | 417 | Pacific Atlantic Water Flow | M | DFS dari tepi | Sel yang mengalir ke dua samudra | DFS "naik" dari tiap tepi, ambil irisan |
| 86 | 130 | Surrounded Regions | M | DFS dari tepi | Ubah `O` yang terkurung | Tandai `O` yang terhubung ke tepi, balik sisanya |
| 87 | 207 | Course Schedule | M | Topological sort | Semua kuliah bisa diambil? | Kahn: in-degree; ada siklus → False |
| 88 | 210 | Course Schedule II | M | Topological sort | Urutan kuliah valid | Kahn; urutan < n → `[]` |
| 89 | 261 | Graph Valid Tree (LintCode 178) | M | Union-Find | n node + sisi = pohon? | Tepat n−1 sisi dan tanpa siklus |
| 90 | 323 | Number of Connected Components (LintCode 3651) | M | Union-Find | Jumlah komponen | Mulai n; setiap union berhasil −1 |
| 91 | 684 | Redundant Connection | M | Union-Find | Sisi yang membuat siklus | Sisi pertama yang ujungnya sudah satu set |
| 92 | 127 | Word Ladder | H | BFS | Langkah terpendek antar kata | Pola wildcard `h*t` → tetangga cepat |

### D12 · Advanced Graphs (3–14 Mei) · `dsa-16-advanced-graphs`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 93 | 332 | Reconstruct Itinerary | H | Eulerian path (Hierholzer) | Rute dari tiket, leksikal terkecil | Adjacency terurut; tambah bandara saat mundur, balik |
| 94 | 1584 | Min Cost to Connect All Points | M | MST (Prim) | Biaya minimum hubungkan semua titik | Prim dengan min-heap |
| 95 | 743 | Network Delay Time | M | Dijkstra | Waktu sinyal ke semua node | Dijkstra; jawaban = jarak maksimum |
| 96 | 778 | Swim in Rising Water | H | Dijkstra minimax | Waktu minimum berenang ke ujung | Heap pada elevasi maksimum jalur |
| 97 | 269 | Alien Dictionary (LintCode 892) | H | Topological sort | Urutan huruf kamus asing | Kata bersebelahan → sisi; awas prefix tidak valid |
| 98 | 787 | Cheapest Flights Within K Stops | M | Bellman-Ford terbatas | Termurah dengan ≤ k transit | Relaksasi k+1 kali memakai salinan harga |

### D13 · 1-D Dynamic Programming (15 Mei – 6 Jun) · `dsa-17-dp-1d`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 99 | 70 | Climbing Stairs | E | DP 1D | Cara naik n tangga (1/2 langkah) | `dp[i] = dp[i−1] + dp[i−2]` |
| 100 | 746 | Min Cost Climbing Stairs | E | DP 1D | Biaya minimum ke puncak | `cost[i] + min(dua sebelumnya)` |
| 101 | 198 | House Robber | M | DP 1D | Uang maksimum, tanpa rumah bersebelahan | `max(skip, ambil + dp[i−2])` |
| 102 | 213 | House Robber II | M | DP 1D (dua kasus) | Sama tapi melingkar | `max(rob(nums[1:]), rob(nums[:-1]))` |
| 103 | 5 | Longest Palindromic Substring | M | Expand around center | Substring palindrom terpanjang | Perluas dari 2n−1 pusat |
| 104 | 647 | Palindromic Substrings | M | Expand around center | Hitung substring palindrom | Hitung setiap perluasan yang berhasil |
| 105 | 91 | Decode Ways | M | DP 1D | Cara mendekode digit ke huruf | 1 digit (≠ 0) + 2 digit (10–26) |
| 106 | 322 | Coin Change | M | DP unbounded knapsack | Koin minimum untuk amount | `dp[a] = min(dp[a−c] + 1)` |
| 107 | 152 | Maximum Product Subarray | M | DP max/min | Hasil kali subarray terbesar | Simpan max dan min (negatif membalik) |
| 108 | 139 | Word Break | M | DP 1D | Dipecah jadi kata kamus? | `dp[i]` = ada kata w dengan `dp[i+len(w)]` |
| 109 | 300 | Longest Increasing Subsequence | M | DP / patience | Panjang LIS | `tails` + `bisect_left`, O(n log n) |
| 110 | 416 | Partition Equal Subset Sum | M | DP subset sum | Dibagi dua bagian sama? | Set jumlah yang bisa dicapai sampai total/2 |

### D14 · 2-D Dynamic Programming (7 Jun – 4 Jul) · `dsa-18-dp-2d`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 111 | 62 | Unique Paths | M | DP grid | Jumlah jalan kiri atas → kanan bawah | `dp[r][c] = atas + kiri` |
| 112 | 1143 | Longest Common Subsequence | M | DP dua string | LCS | Sama → 1 + diagonal; beda → max(kanan, bawah) |
| 113 | 309 | Buy/Sell Stock with Cooldown | M | DP state machine | Untung dengan jeda setelah jual | State: hold / sold / rest |
| 114 | 518 | Coin Change II | M | DP kombinasi | Jumlah kombinasi koin | Loop koin di luar, amount di dalam |
| 115 | 494 | Target Sum | M | DP / memo | Cara memberi ± agar = target | Memo `(i, total)` atau subset sum |
| 116 | 97 | Interleaving String | M | DP 2D | s3 selang-seling s1 dan s2? | `dp[i][j]` dari dua kemungkinan huruf |
| 117 | 329 | Longest Increasing Path in a Matrix | H | DFS + memo | Jalur naik terpanjang | Cache per sel; jalur naik tidak bisa berputar |
| 118 | 115 | Distinct Subsequences | H | DP 2D | Subsequence s yang sama dengan t | Cocok: pakai + lewati; tidak: lewati |
| 119 | 72 | Edit Distance | M | DP 2D | Operasi minimum word1 → word2 | Beda → 1 + min(sisip, hapus, ganti) |
| 120 | 312 | Burst Balloons | H | Interval DP | Koin maksimum memecah balon | Pilih balon yang pecah **terakhir** di interval |
| 121 | 10 | Regular Expression Matching | H | DP / memo | Cocokkan dengan `.` dan `*` | `*` → lewati pola (j+2) atau pakai (i+1) |

### D15 · Greedy (5–18 Jul) · `dsa-19-greedy`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 122 | 53 | Maximum Subarray | M | Kadane | Jumlah subarray terbesar | `cur = max(x, cur + x)` |
| 123 | 55 | Jump Game | M | Greedy | Bisa sampai indeks terakhir? | Dari belakang geser goal |
| 124 | 45 | Jump Game II | M | Greedy level | Lompatan minimum | Jangkauan terjauh per level lompatan |
| 125 | 134 | Gas Station | M | Greedy | Titik awal memutari rute | Total cukup → ada; reset start saat tangki < 0 |
| 126 | 846 | Hand of Straights | M | Greedy + hitung | Kartu → kelompok berurutan ukuran k? | Mulai dari terkecil, kurangi x..x+k−1 |
| 127 | 1899 | Merge Triplets to Form Target | M | Greedy | Gabung triplet (max per posisi) = target? | Abaikan yang melebihi target, cek 3 posisi |
| 128 | 763 | Partition Labels | M | Greedy + indeks terakhir | Potong sebanyak mungkin, huruf tidak menyeberang | Potong saat `i == ujung terjauh` |
| 129 | 678 | Valid Parenthesis String | M | Greedy rentang | Kurung dengan `*` valid? | Lacak rentang `[minOpen, maxOpen]` |

### D16 · Intervals (19–26 Jul) · `dsa-20-intervals`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 130 | 57 | Insert Interval | M | Intervals | Sisipkan dan gabungkan | Sebelum, overlap, sesudah |
| 131 | 56 | Merge Intervals | M | Sort + merge | Gabungkan yang tumpang tindih | Urut berdasarkan awal; perpanjang yang terakhir |
| 132 | 435 | Non-overlapping Intervals | M | Greedy berdasarkan akhir | Hapus minimum agar tidak overlap | Overlap → buang yang berakhir lebih lambat |
| 133 | 252 | Meeting Rooms (LintCode 920) | E | Sort | Bisa hadiri semua rapat? | Urutkan; cek `start < end` sebelumnya |
| 134 | 253 | Meeting Rooms II (LintCode 919) | M | Sweep line / heap | Jumlah ruang minimum | Start dan end diurutkan terpisah, dua pointer |
| 135 | 1851 | Minimum Interval to Include Each Query | H | Sort + heap | Interval terkecil yang memuat query | Heap `(ukuran, end)`; buang `end < q` |

### D17 · Math & Geometry (27 Jul – 6 Agu) · `dsa-21-math-geometry`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 136 | 48 | Rotate Image | M | Matriks | Putar n×n 90° in-place | Transpose lalu balik tiap baris |
| 137 | 54 | Spiral Matrix | M | Simulasi batas | Urutan spiral | Batas atas/bawah/kiri/kanan menyempit |
| 138 | 73 | Set Matrix Zeroes | M | Penanda in-place | Baris dan kolom sel 0 jadi 0 | Baris dan kolom pertama sebagai penanda |
| 139 | 202 | Happy Number | E | Deteksi siklus | Jumlah kuadrat digit berakhir di 1? | Set nilai yang pernah muncul / fast-slow |
| 140 | 66 | Plus One | E | Simulasi carry | +1 pada array digit | Dari belakang; semua 9 → `[1] + nol` |
| 141 | 50 | Pow(x, n) | M | Fast exponentiation | Hitung x^n | Kuadrat berulang; n negatif → 1/x |
| 142 | 43 | Multiply Strings | M | Simulasi | Kalikan dua angka string | `res[i+j+1] += d1·d2`, lalu carry |
| 143 | 2013 | Detect Squares | M | Hash map hitung | Jumlah persegi sejajar sumbu | Titik diagonal dengan `|dx| == |dy|` |

### D18 · Bit Manipulation (7–16 Agu) · `dsa-22-bit-manipulation`
| # | LC | Soal | Lv | Pola | Ringkasan | Ide kunci |
|---|---|---|---|---|---|---|
| 144 | 136 | Single Number | E | XOR | Satu angka muncul sekali | XOR semua |
| 145 | 191 | Number of 1 Bits | E | Bit | Hitung bit 1 | `n &= n − 1` |
| 146 | 338 | Counting Bits | E | DP bit | Bit 1 untuk 0..n | `dp[i] = dp[i >> 1] + (i & 1)` |
| 147 | 190 | Reverse Bits | E | Bit | Balik 32 bit | 32× geser dan OR |
| 148 | 268 | Missing Number | E | XOR / jumlah | Angka hilang dari 0..n | `n(n+1)/2 − sum` |
| 149 | 371 | Sum of Two Integers | M | Bit | Jumlah tanpa + dan − | XOR + carry `(a & b) << 1`, mask 32 bit di Python |
| 150 | 7 | Reverse Integer | M | Math + overflow | Balik digit 32-bit | Cek batas sebelum overflow |

## 6. D19: Interview Mastery (Sep – Des 2027) · `dsa-23-interview-playbook`

**34 soal ekstra** yang memperkuat pola paling sering muncul:

| Pola | Soal (LC · Lv) |
|---|---|
| Array / two pointers | 283 Move Zeroes · E; 169 Majority Element · E (Boyer–Moore); 75 Sort Colors · M (Dutch flag); 31 Next Permutation · M |
| Prefix sum + hash map | 560 Subarray Sum Equals K · M; 525 Contiguous Array · M; 974 Subarray Sums Divisible by K · M; 437 Path Sum III · M |
| Sliding window | 438 Find All Anagrams in a String · M; 209 Minimum Size Subarray Sum · M; 1004 Max Consecutive Ones III · M |
| Monotonic stack | 496 Next Greater Element I · E; 503 Next Greater Element II · M; 901 Online Stock Span · M |
| Binary search | 34 Find First and Last Position · M; 162 Find Peak Element · M; 1011 Capacity To Ship Packages Within D Days · M |
| Linked list | 92 Reverse Linked List II · M; 234 Palindrome Linked List · E |
| Trees | 101 Symmetric Tree · E; 112 Path Sum · E; 236 LCA of a Binary Tree · M; 662 Maximum Width of Binary Tree · M |
| Graphs | 547 Number of Provinces · M; 721 Accounts Merge · M; 1091 Shortest Path in Binary Matrix · M; 785 Is Graph Bipartite? · M; 815 Bus Routes · H |
| DP | 64 Minimum Path Sum · M; 221 Maximal Square · M; 516 Longest Palindromic Subsequence · M; 279 Perfect Squares · M; 1235 Maximum Profit in Job Scheduling · H; 140 Word Break II · H |

**Rutinitas D19:**
- Review SRS setiap hari (target **≥ 80% soal NC150 minimal ★2** pada akhir Desember).
- **Mock interview mingguan:** 2 soal dalam 45 menit, bicara sambil mengerjakan, direkam, lalu dinilai dengan rubrik di `dsa-23`.
- **Kontes 2× per bulan:** LeetCode Weekly (biasanya Minggu pagi WIB) atau Biweekly (Sabtu malam WIB).
- Soal Hard NC150 dikerjakan ulang dari nol (pass kedua).

## 7. D20: Kontes dan Jepang (Jan – Sep 2028)

DSA masuk mode **perawatan** karena prioritasnya N3.

- **AtCoder Beginner Contest** (biasanya Sabtu 21:00 JST, 19:00 WIB), 1× per 2 minggu. Targetnya soal A–C stabil, lalu D.
  - **Soalnya dibaca dalam bahasa Jepang**, sehingga sekaligus menjadi latihan membaca teknis. Kosakata seperti 整数, 配列, 文字列, 出力, dan 制約 masuk deck Anki.
- **paiza スキルチェック** 1× per bulan. paiza dipakai banyak perusahaan Jepang untuk rekrutmen engineer, dengan rank S/A/B/C/D. Targetnya rank A.
- Setiap minggu: 2 soal baru dari daftar ekstra atau AtCoder, dan 4 review SRS.
- Lintas jalur: node "baca 3 soal AtCoder dalam bahasa Jepang" juga muncul di 日本語 Section 4.

## 8. D21 (opsional): System design dasar

Untuk target AWS atau luar negeri setelah mulai kerja:
- konsep skala (*vertical* dan *horizontal*);
- load balancer, cache, CDN;
- indeks dan replikasi database;
- antrian pesan;
- *consistent hashing*;
- rate limiter;
- URL shortener;
- desain feed.

**Sumber:** repo GitHub `donnemartin/system-design-primer` dan channel YouTube ByteByteGo. Bagian ini sengaja tidak dijadwalkan sebelum Oktober 2028.

## 9. Taksonomi pola (pilihan di Tebak Pola)

Hash map/set · Hitung frekuensi · Prefix sum · Two pointers · Sliding window · Stack · Monotonic stack/deque · Binary search · Binary search on answer · Linked list pointer · Fast & slow · Tree DFS · Tree BFS · Sifat BST · Trie · Heap · Dua heap · Backtracking · Grid DFS/BFS · Multi-source BFS · Topological sort · Union-Find · Dijkstra · MST · Bellman-Ford · DP 1D · DP 2D · Interval DP · Kadane · Greedy · Intervals (sort & merge) · Bit manipulation · Matriks / simulasi · Desain struktur data
