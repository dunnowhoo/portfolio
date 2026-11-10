// Jalur DSA (docs/dojo/curriculum/DSA.md). Python 3.
import { baseXp, spreadDates, type Level, type PathNode, type Problem, type Section, type Unit } from './types';

// Taksonomi pola untuk Tebak Pola (§9). "Graph DFS/BFS" ditambahkan untuk graf non-grid.
export const PATTERNS = {
  hash: 'Hash map/set',
  freq: 'Hitung frekuensi',
  prefix: 'Prefix sum',
  two: 'Two pointers',
  sw: 'Sliding window',
  stack: 'Stack',
  mono: 'Monotonic stack/deque',
  bs: 'Binary search',
  bsa: 'Binary search on answer',
  ll: 'Linked list pointer',
  fs: 'Fast & slow',
  tdfs: 'Tree DFS',
  tbfs: 'Tree BFS',
  bst: 'Sifat BST',
  trie: 'Trie',
  heap: 'Heap',
  heap2: 'Dua heap',
  bt: 'Backtracking',
  grid: 'Grid DFS/BFS',
  graph: 'Graph DFS/BFS',
  msbfs: 'Multi-source BFS',
  topo: 'Topological sort',
  uf: 'Union-Find',
  dijk: 'Dijkstra',
  mst: 'MST',
  bf: 'Bellman-Ford',
  dp1: 'DP 1D',
  dp2: 'DP 2D',
  idp: 'Interval DP',
  kadane: 'Kadane',
  greedy: 'Greedy',
  iv: 'Intervals (sort & merge)',
  bit: 'Bit manipulation',
  sim: 'Matriks / simulasi',
  design: 'Desain struktur data',
} as const;
type Pat = keyof typeof PATTERNS;

// [nomor LC, slug, judul, level, pola, ringkasan, ide kunci, nomor LintCode?]
type Row = [number, string, string, Level, Pat, string, string, number?];

type Topic = { id: string; title: string; material: string; start: string; end: string; rows: Row[] };

const TOPICS: Topic[] = [
  {
    id: 'd1', title: 'Arrays & Hashing', material: 'dsa-05-arrays-hashing', start: '2026-11-30', end: '2026-12-13',
    rows: [
      [217, 'contains-duplicate', 'Contains Duplicate', 'E', 'hash', 'Ada nilai yang muncul lebih dari sekali?', 'Masukkan ke set; sudah ada → True'],
      [242, 'valid-anagram', 'Valid Anagram', 'E', 'freq', 'Dua string berisi huruf yang sama persis?', 'Counter(s) == Counter(t) atau array 26'],
      [1, 'two-sum', 'Two Sum', 'E', 'hash', 'Dua indeks yang nilainya berjumlah target', 'Simpan nilai→indeks; cek target − x dulu'],
      [49, 'group-anagrams', 'Group Anagrams', 'M', 'hash', 'Kelompokkan kata yang saling anagram', 'Kunci = tuple hitungan 26 huruf'],
      [347, 'top-k-frequent-elements', 'Top K Frequent Elements', 'M', 'freq', 'k nilai paling sering muncul', 'Bucket berindeks frekuensi, ambil dari belakang'],
      [271, 'encode-and-decode-strings', 'Encode and Decode Strings', 'M', 'design', 'List string → satu string → kembali lagi', 'Awali tiap kata dengan panjang#', 659],
      [238, 'product-of-array-except-self', 'Product of Array Except Self', 'M', 'prefix', 'Hasil kali semua elemen kecuali diri sendiri, tanpa bagi', 'Pass kiri isi prefix, pass kanan kalikan suffix'],
      [36, 'valid-sudoku', 'Valid Sudoku', 'M', 'hash', 'Papan sudoku sebagian sudah valid?', 'Set per baris, kolom, kotak (r//3, c//3)'],
      [128, 'longest-consecutive-sequence', 'Longest Consecutive Sequence', 'M', 'hash', 'Barisan angka berurutan terpanjang dalam O(n)', 'Hitung hanya dari x yang x−1-nya tidak ada'],
    ],
  },
  {
    id: 'd2', title: 'Two Pointers', material: 'dsa-06-two-pointers', start: '2026-12-14', end: '2026-12-20',
    rows: [
      [125, 'valid-palindrome', 'Valid Palindrome', 'E', 'two', 'Palindrom setelah buang karakter non-alfanumerik?', 'Kiri-kanan, lewati non-alnum, bandingkan lower()'],
      [167, 'two-sum-ii-input-array-is-sorted', 'Two Sum II', 'M', 'two', 'Dua angka berjumlah target di array terurut', 'Kurang → geser kiri; lebih → geser kanan'],
      [15, '3sum', '3Sum', 'M', 'two', 'Semua triplet unik yang berjumlah 0', 'Urutkan; per i jalankan two pointers; lewati duplikat'],
      [11, 'container-with-most-water', 'Container With Most Water', 'M', 'two', 'Dua garis yang menampung air terbanyak', 'Luas = lebar × min; geser yang lebih pendek'],
      [42, 'trapping-rain-water', 'Trapping Rain Water', 'H', 'two', 'Total air yang tertampung di antara batang', 'Air i = min(maxL, maxR) − h[i]; geser sisi dengan max lebih kecil'],
    ],
  },
  {
    id: 'd3', title: 'Sliding Window', material: 'dsa-07-sliding-window', start: '2026-12-21', end: '2027-01-03',
    rows: [
      [121, 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'E', 'sw', 'Untung maksimum dengan sekali beli lalu jual', 'Simpan harga terendah sejauh ini'],
      [3, 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'M', 'sw', 'Substring terpanjang tanpa huruf berulang', 'Duplikat → majukan kiri melewati posisi lamanya'],
      [424, 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'M', 'sw', 'Terpanjang yang bisa jadi satu huruf dengan ≤ k penggantian', 'Valid jika panjang − frek_max ≤ k'],
      [567, 'permutation-in-string', 'Permutation in String', 'M', 'sw', 's2 memuat permutasi s1?', 'Jendela sepanjang s1; bandingkan hitungan 26 huruf'],
      [76, 'minimum-window-substring', 'Minimum Window Substring', 'H', 'sw', 'Jendela terpendek yang memuat semua huruf t', 'Perluas sampai lengkap, kecilkan selama masih lengkap'],
      [239, 'sliding-window-maximum', 'Sliding Window Maximum', 'H', 'mono', 'Nilai maksimum di setiap jendela ukuran k', 'Deque indeks dengan nilai menurun'],
    ],
  },
  {
    id: 'd4', title: 'Stack', material: 'dsa-08-stack', start: '2027-01-04', end: '2027-01-14',
    rows: [
      [20, 'valid-parentheses', 'Valid Parentheses', 'E', 'stack', 'Kurung berpasangan dan berurutan dengan benar?', 'Push pembuka; penutup harus cocok dengan puncak'],
      [155, 'min-stack', 'Min Stack', 'M', 'design', 'Stack dengan getMin O(1)', 'Simpan (nilai, min sejauh ini)'],
      [150, 'evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'M', 'stack', 'Hitung ekspresi postfix', 'Operator → pop dua; bagi pakai int(a / b)'],
      [22, 'generate-parentheses', 'Generate Parentheses', 'M', 'bt', 'Semua kurung valid dari n pasang', 'Tambah ( jika open < n; ) jika close < open'],
      [739, 'daily-temperatures', 'Daily Temperatures', 'M', 'mono', 'Berapa hari lagi sampai lebih hangat', 'Stack indeks menurun; pop saat ada yang lebih panas'],
      [853, 'car-fleet', 'Car Fleet', 'M', 'stack', 'Jumlah rombongan mobil yang tiba di tujuan', 'Urut dari dekat tujuan; tiba lebih lama → rombongan baru'],
      [84, 'largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'H', 'mono', 'Persegi panjang terbesar di histogram', 'Saat tinggi turun, pop dan hitung luas sampai i'],
    ],
  },
  {
    id: 'd5', title: 'Binary Search', material: 'dsa-09-binary-search', start: '2027-01-15', end: '2027-01-25',
    rows: [
      [704, 'binary-search', 'Binary Search', 'E', 'bs', 'Indeks target di array terurut', 'l ≤ r, mid, geser batas'],
      [74, 'search-a-2d-matrix', 'Search a 2D Matrix', 'M', 'bs', 'Cari target di matriks yang terurut bersambung', 'Anggap 1D: (mid // n, mid % n)'],
      [875, 'koko-eating-bananas', 'Koko Eating Bananas', 'M', 'bsa', 'Kecepatan minimum agar habis dalam h jam', 'Cari k di [1, max]; cek Σ ceil(p/k) ≤ h'],
      [153, 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'M', 'bs', 'Nilai minimum array terurut yang dirotasi', 'nums[mid] > nums[r] → minimum di kanan'],
      [33, 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'M', 'bs', 'Cari target di array terurut yang dirotasi', 'Salah satu sisi mid pasti terurut'],
      [981, 'time-based-key-value-store', 'Time Based Key-Value Store', 'M', 'bs', 'Nilai terbaru dengan timestamp ≤ t', 'List per kunci sudah terurut → bisect_right'],
      [4, 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'H', 'bs', 'Median dua array terurut dalam O(log)', 'Cari potongan di array pendek: maxKiri ≤ minKanan'],
    ],
  },
  {
    id: 'd6', title: 'Linked List', material: 'dsa-10-linked-list', start: '2027-01-26', end: '2027-02-10',
    rows: [
      [206, 'reverse-linked-list', 'Reverse Linked List', 'E', 'll', 'Balik urutan linked list', 'prev, cur; simpan next; arahkan ke prev'],
      [21, 'merge-two-sorted-lists', 'Merge Two Sorted Lists', 'E', 'll', 'Gabung dua list terurut', 'Dummy + tail, ambil yang lebih kecil'],
      [141, 'linked-list-cycle', 'Linked List Cycle', 'E', 'fs', 'Apakah list punya siklus?', 'Floyd: fast 2 langkah, slow 1'],
      [143, 'reorder-list', 'Reorder List', 'M', 'll', 'Susun ulang L0→Ln→L1→Ln−1…', 'Cari tengah, balik paruh kedua, selang-seling'],
      [19, 'remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'M', 'll', 'Hapus node ke-n dari belakang', 'Dummy; fast maju n+1, lalu jalan bersama'],
      [138, 'copy-list-with-random-pointer', 'Copy List with Random Pointer', 'M', 'hash', 'Salin list yang punya pointer acak', 'Pass 1 buat node baru; pass 2 sambungkan'],
      [2, 'add-two-numbers', 'Add Two Numbers', 'M', 'll', 'Jumlahkan dua angka yang digitnya terbalik', 'Jalan bersama: jumlah + carry → node baru'],
      [287, 'find-the-duplicate-number', 'Find the Duplicate Number', 'M', 'fs', 'Satu angka duplikat dengan ruang O(1)', 'nums[i] sebagai pointer → awal siklus'],
      [146, 'lru-cache', 'LRU Cache', 'M', 'design', 'Cache yang membuang item paling lama tak dipakai', 'Map kunci→node, list ganda untuk urutan'],
      [23, 'merge-k-sorted-lists', 'Merge k Sorted Lists', 'H', 'heap', 'Gabung k list terurut', 'Min-heap (nilai, i, node)'],
      [25, 'reverse-nodes-in-k-group', 'Reverse Nodes in k-Group', 'H', 'll', 'Balik setiap kelompok k node', 'Cek ada k node, balik, sambungkan ujung grup'],
    ],
  },
  {
    id: 'd7', title: 'Trees', material: 'dsa-11-trees', start: '2027-02-11', end: '2027-03-10',
    rows: [
      [226, 'invert-binary-tree', 'Invert Binary Tree', 'E', 'tdfs', 'Cerminkan pohon biner', 'Tukar kiri-kanan secara rekursif'],
      [104, 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'E', 'tdfs', 'Kedalaman maksimum pohon', '1 + max(kiri, kanan)'],
      [543, 'diameter-of-binary-tree', 'Diameter of Binary Tree', 'E', 'tdfs', 'Jalur terpanjang antara dua node', 'Kandidat = tinggiKiri + tinggiKanan'],
      [110, 'balanced-binary-tree', 'Balanced Binary Tree', 'E', 'tdfs', 'Selisih tinggi ≤ 1 di setiap node?', 'Kembalikan tinggi, atau −1 kalau tidak seimbang'],
      [100, 'same-tree', 'Same Tree', 'E', 'tdfs', 'Dua pohon identik?', 'Bandingkan nilai, rekursi kiri dan kanan'],
      [572, 'subtree-of-another-tree', 'Subtree of Another Tree', 'E', 'tdfs', 'Apakah t subpohon dari s?', 'sameTree di setiap node s'],
      [235, 'lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of a BST', 'M', 'bst', 'Leluhur bersama terendah di BST', 'Keduanya < node → kiri; > → kanan; selain itu node ini'],
      [102, 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'M', 'tbfs', 'Nilai pohon per level', 'Queue; proses len(queue) per level'],
      [199, 'binary-tree-right-side-view', 'Binary Tree Right Side View', 'M', 'tbfs', 'Node yang terlihat dari sisi kanan', 'Ambil node terakhir tiap level'],
      [1448, 'count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree', 'M', 'tdfs', 'Node yang ≥ semua leluhurnya', 'Bawa nilai maksimum di jalur'],
      [98, 'validate-binary-search-tree', 'Validate Binary Search Tree', 'M', 'bst', 'Apakah pohon ini BST yang valid?', 'Setiap node harus di rentang (low, high)'],
      [230, 'kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'M', 'bst', 'Elemen terkecil ke-k di BST', 'Inorder iteratif, berhenti di ke-k'],
      [105, 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Binary Tree from Preorder and Inorder Traversal', 'M', 'tdfs', 'Bangun pohon dari dua traversal', 'preorder[0] = akar; posisinya di inorder membagi'],
      [124, 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'H', 'tdfs', 'Jumlah jalur maksimum di pohon', 'Gain = max(0, …); kandidat = node + dua gain'],
      [297, 'serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'H', 'tdfs', 'Ubah pohon ke string dan kembali', 'Preorder dengan penanda "N"; baca ulang pakai iterator'],
    ],
  },
  {
    id: 'd8', title: 'Tries', material: 'dsa-12-tries', start: '2027-03-11', end: '2027-03-15',
    rows: [
      [208, 'implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'M', 'trie', 'Struktur insert, search, startsWith', 'Node: dict anak + flag akhir kata'],
      [211, 'design-add-and-search-words-data-structure', 'Design Add and Search Words Data Structure', 'M', 'trie', 'Cari kata dengan wildcard "."', '"." → coba semua anak'],
      [212, 'word-search-ii', 'Word Search II', 'H', 'trie', 'Semua kata dari daftar yang ada di papan', 'Trie kata, DFS mengikuti trie, pangkas cabang habis'],
    ],
  },
  {
    id: 'd9', title: 'Heap / Priority Queue', material: 'dsa-13-heap', start: '2027-03-16', end: '2027-03-25',
    rows: [
      [703, 'kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'E', 'heap', 'Elemen terbesar ke-k setelah tiap penambahan', 'Puncak min-heap ukuran k = jawaban'],
      [1046, 'last-stone-weight', 'Last Stone Weight', 'E', 'heap', 'Simulasi benturan dua batu terberat', 'heapq dengan nilai negatif'],
      [973, 'k-closest-points-to-origin', 'K Closest Points to Origin', 'M', 'heap', 'k titik terdekat ke (0,0)', 'Max-heap ukuran k pada jarak kuadrat'],
      [215, 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'M', 'heap', 'Elemen terbesar ke-k', 'Min-heap ukuran k, atau quickselect'],
      [621, 'task-scheduler', 'Task Scheduler', 'M', 'greedy', 'Waktu minimum dengan jeda n antar tugas sama', '(maxF−1)(n+1) + jumlahMaxF, minimal len(tasks)'],
      [355, 'design-twitter', 'Design Twitter', 'M', 'heap', 'Follow, post, dan feed 10 terbaru', 'Gabung feed dengan heap waktu'],
      [295, 'find-median-from-data-stream', 'Find Median from Data Stream', 'H', 'heap2', 'Median setelah setiap angka masuk', 'Max-heap kiri, min-heap kanan, seimbangkan'],
    ],
  },
  {
    id: 'd10', title: 'Backtracking', material: 'dsa-14-backtracking', start: '2027-03-26', end: '2027-04-07',
    rows: [
      [78, 'subsets', 'Subsets', 'M', 'bt', 'Semua himpunan bagian', 'Ambil atau tidak per elemen'],
      [39, 'combination-sum', 'Combination Sum', 'M', 'bt', 'Kombinasi (boleh ulang) yang berjumlah target', 'Rekursi dari i, boleh tetap di i'],
      [40, 'combination-sum-ii', 'Combination Sum II', 'M', 'bt', 'Kombinasi unik, tiap angka sekali pakai', 'Urutkan; lewati duplikat di level yang sama'],
      [46, 'permutations', 'Permutations', 'M', 'bt', 'Semua permutasi', 'used[], pilih yang belum dipakai'],
      [90, 'subsets-ii', 'Subsets II', 'M', 'bt', 'Subset unik dari array berduplikat', 'Urutkan; lewati duplikat di level yang sama'],
      [79, 'word-search', 'Word Search', 'M', 'bt', 'Bisakah kata dibentuk dari sel bertetangga?', 'Tandai sel sementara, pulihkan setelahnya'],
      [131, 'palindrome-partitioning', 'Palindrome Partitioning', 'M', 'bt', 'Semua cara memecah string jadi palindrom', 'Dari i coba j dengan s[i:j+1] palindrom'],
      [17, 'letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number', 'M', 'bt', 'Kombinasi huruf dari digit telepon', 'Map digit→huruf, rekursi per posisi'],
      [51, 'n-queens', 'N-Queens', 'H', 'bt', 'Semua penempatan n ratu yang aman', 'Set kolom, r−c, dan r+c'],
    ],
  },
  {
    id: 'd11', title: 'Graphs', material: 'dsa-15-graphs', start: '2027-04-08', end: '2027-05-02',
    rows: [
      [200, 'number-of-islands', 'Number of Islands', 'M', 'grid', 'Hitung jumlah pulau di grid', 'Ketemu 1 → DFS tenggelamkan, hitung +1'],
      [695, 'max-area-of-island', 'Max Area of Island', 'M', 'grid', 'Luas pulau terbesar', 'DFS mengembalikan jumlah sel'],
      [133, 'clone-graph', 'Clone Graph', 'M', 'graph', 'Salin seluruh graf', 'Map lama→baru menahan siklus'],
      [286, 'walls-and-gates', 'Walls and Gates', 'M', 'msbfs', 'Jarak setiap ruang ke gerbang terdekat', 'BFS sekaligus dari semua gerbang', 663],
      [994, 'rotting-oranges', 'Rotting Oranges', 'M', 'msbfs', 'Menit sampai semua jeruk busuk', 'BFS per level dari semua yang busuk'],
      [417, 'pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'M', 'grid', 'Sel yang airnya mengalir ke dua samudra', 'DFS "naik" dari tiap tepi, ambil irisannya'],
      [130, 'surrounded-regions', 'Surrounded Regions', 'M', 'grid', 'Ubah wilayah O yang terkurung', 'Tandai O yang terhubung ke tepi, balik sisanya'],
      [207, 'course-schedule', 'Course Schedule', 'M', 'topo', 'Bisakah semua kuliah diambil?', 'Kahn: in-degree; ada siklus → False'],
      [210, 'course-schedule-ii', 'Course Schedule II', 'M', 'topo', 'Urutan kuliah yang valid', 'Kahn; urutan < n → []'],
      [261, 'graph-valid-tree', 'Graph Valid Tree', 'M', 'uf', 'Apakah n node dan sisi ini membentuk pohon?', 'Tepat n−1 sisi dan tanpa siklus', 178],
      [323, 'number-of-connected-components-in-an-undirected-graph', 'Number of Connected Components in an Undirected Graph', 'M', 'uf', 'Jumlah komponen terhubung', 'Mulai dari n; setiap union berhasil −1', 3651],
      [684, 'redundant-connection', 'Redundant Connection', 'M', 'uf', 'Sisi yang membuat siklus', 'Sisi pertama yang kedua ujungnya sudah satu set'],
      [127, 'word-ladder', 'Word Ladder', 'H', 'graph', 'Langkah terpendek antar kata', 'Pola wildcard h*t → tetangga cepat'],
    ],
  },
  {
    id: 'd12', title: 'Advanced Graphs', material: 'dsa-16-advanced-graphs', start: '2027-05-03', end: '2027-05-14',
    rows: [
      [332, 'reconstruct-itinerary', 'Reconstruct Itinerary', 'H', 'graph', 'Rute dari tiket pesawat, leksikal terkecil', 'Adjacency terurut; tambah bandara saat mundur, lalu balik'],
      [1584, 'min-cost-to-connect-all-points', 'Min Cost to Connect All Points', 'M', 'mst', 'Biaya minimum menghubungkan semua titik', 'Prim dengan min-heap'],
      [743, 'network-delay-time', 'Network Delay Time', 'M', 'dijk', 'Waktu sinyal sampai ke semua node', 'Dijkstra; jawaban = jarak maksimum'],
      [778, 'swim-in-rising-water', 'Swim in Rising Water', 'H', 'dijk', 'Waktu minimum berenang ke pojok kanan bawah', 'Heap pada elevasi maksimum jalur'],
      [269, 'alien-dictionary', 'Alien Dictionary', 'H', 'topo', 'Urutan huruf dari kamus bahasa asing', 'Kata bersebelahan → sisi; awas prefix tidak valid', 892],
      [787, 'cheapest-flights-within-k-stops', 'Cheapest Flights Within K Stops', 'M', 'bf', 'Penerbangan termurah dengan ≤ k transit', 'Relaksasi k+1 kali memakai salinan harga'],
    ],
  },
  {
    id: 'd13', title: '1-D Dynamic Programming', material: 'dsa-17-dp-1d', start: '2027-05-15', end: '2027-06-06',
    rows: [
      [70, 'climbing-stairs', 'Climbing Stairs', 'E', 'dp1', 'Banyak cara naik n anak tangga (1 atau 2 langkah)', 'dp[i] = dp[i−1] + dp[i−2]'],
      [746, 'min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'E', 'dp1', 'Biaya minimum sampai puncak tangga', 'cost[i] + min(dua sebelumnya)'],
      [198, 'house-robber', 'House Robber', 'M', 'dp1', 'Uang maksimum tanpa merampok rumah bersebelahan', 'max(lewati, ambil + dp[i−2])'],
      [213, 'house-robber-ii', 'House Robber II', 'M', 'dp1', 'Sama seperti House Robber, tapi rumahnya melingkar', 'max(rob(nums[1:]), rob(nums[:-1]))'],
      [5, 'longest-palindromic-substring', 'Longest Palindromic Substring', 'M', 'two', 'Substring palindrom terpanjang', 'Perluas dari 2n−1 titik pusat'],
      [647, 'palindromic-substrings', 'Palindromic Substrings', 'M', 'two', 'Banyak substring yang palindrom', 'Hitung setiap perluasan yang berhasil'],
      [91, 'decode-ways', 'Decode Ways', 'M', 'dp1', 'Banyak cara mendekode digit menjadi huruf', '1 digit (≠ 0) + 2 digit (10–26)'],
      [322, 'coin-change', 'Coin Change', 'M', 'dp1', 'Koin paling sedikit untuk membentuk amount', 'dp[a] = min(dp[a−c] + 1)'],
      [152, 'maximum-product-subarray', 'Maximum Product Subarray', 'M', 'dp1', 'Hasil kali subarray terbesar', 'Simpan max dan min (negatif membalik)'],
      [139, 'word-break', 'Word Break', 'M', 'dp1', 'Bisakah string dipecah jadi kata kamus?', 'dp[i] benar jika ada kata w dengan dp[i+len(w)]'],
      [300, 'longest-increasing-subsequence', 'Longest Increasing Subsequence', 'M', 'dp1', 'Panjang subsequence naik terpanjang', 'tails + bisect_left, O(n log n)'],
      [416, 'partition-equal-subset-sum', 'Partition Equal Subset Sum', 'M', 'dp1', 'Bisakah array dibagi dua bagian berjumlah sama?', 'Set jumlah yang bisa dicapai sampai total/2'],
    ],
  },
  {
    id: 'd14', title: '2-D Dynamic Programming', material: 'dsa-18-dp-2d', start: '2027-06-07', end: '2027-07-04',
    rows: [
      [62, 'unique-paths', 'Unique Paths', 'M', 'dp2', 'Banyak jalan dari kiri atas ke kanan bawah', 'dp[r][c] = atas + kiri'],
      [1143, 'longest-common-subsequence', 'Longest Common Subsequence', 'M', 'dp2', 'Subsequence bersama terpanjang', 'Sama → 1 + diagonal; beda → max(kanan, bawah)'],
      [309, 'best-time-to-buy-and-sell-stock-with-cooldown', 'Best Time to Buy and Sell Stock with Cooldown', 'M', 'dp2', 'Untung maksimum dengan jeda setelah menjual', 'State: hold / sold / rest'],
      [518, 'coin-change-ii', 'Coin Change II', 'M', 'dp2', 'Banyak kombinasi koin untuk amount', 'Loop koin di luar, amount di dalam'],
      [494, 'target-sum', 'Target Sum', 'M', 'dp2', 'Banyak cara memberi tanda ± agar sama dengan target', 'Memo (i, total) atau subset sum'],
      [97, 'interleaving-string', 'Interleaving String', 'M', 'dp2', 'Apakah s3 selang-seling dari s1 dan s2?', 'dp[i][j] dari dua kemungkinan huruf'],
      [329, 'longest-increasing-path-in-a-matrix', 'Longest Increasing Path in a Matrix', 'H', 'dp2', 'Jalur naik terpanjang di matriks', 'Cache per sel; jalur naik tidak bisa berputar'],
      [115, 'distinct-subsequences', 'Distinct Subsequences', 'H', 'dp2', 'Banyak subsequence s yang sama dengan t', 'Cocok: pakai + lewati; tidak cocok: lewati'],
      [72, 'edit-distance', 'Edit Distance', 'M', 'dp2', 'Operasi minimum mengubah word1 jadi word2', 'Beda → 1 + min(sisip, hapus, ganti)'],
      [312, 'burst-balloons', 'Burst Balloons', 'H', 'idp', 'Koin maksimum dari memecahkan balon', 'Pilih balon yang pecah terakhir di interval'],
      [10, 'regular-expression-matching', 'Regular Expression Matching', 'H', 'dp2', 'Pencocokan pola dengan "." dan "*"', '"*" → lewati pola (j+2) atau pakai (i+1)'],
    ],
  },
  {
    id: 'd15', title: 'Greedy', material: 'dsa-19-greedy', start: '2027-07-05', end: '2027-07-18',
    rows: [
      [53, 'maximum-subarray', 'Maximum Subarray', 'M', 'kadane', 'Jumlah subarray terbesar', 'cur = max(x, cur + x)'],
      [55, 'jump-game', 'Jump Game', 'M', 'greedy', 'Bisakah sampai indeks terakhir?', 'Dari belakang, geser goal'],
      [45, 'jump-game-ii', 'Jump Game II', 'M', 'greedy', 'Lompatan minimum ke indeks terakhir', 'Jangkauan terjauh per level lompatan'],
      [134, 'gas-station', 'Gas Station', 'M', 'greedy', 'Titik awal untuk memutari seluruh rute', 'Total cukup → ada; reset start saat tangki < 0'],
      [846, 'hand-of-straights', 'Hand of Straights', 'M', 'greedy', 'Bisakah kartu dibagi jadi kelompok berurutan ukuran k?', 'Mulai dari terkecil, kurangi x..x+k−1'],
      [1899, 'merge-triplets-to-form-target-triplet', 'Merge Triplets to Form Target Triplet', 'M', 'greedy', 'Bisakah triplet digabung (max per posisi) jadi target?', 'Abaikan yang melebihi target, cek 3 posisi'],
      [763, 'partition-labels', 'Partition Labels', 'M', 'greedy', 'Potong sebanyak mungkin tanpa huruf menyeberang', 'Potong saat i sama dengan ujung terjauh'],
      [678, 'valid-parenthesis-string', 'Valid Parenthesis String', 'M', 'greedy', 'Kurung dengan "*" bisa valid?', 'Lacak rentang [minOpen, maxOpen]'],
    ],
  },
  {
    id: 'd16', title: 'Intervals', material: 'dsa-20-intervals', start: '2027-07-19', end: '2027-07-26',
    rows: [
      [57, 'insert-interval', 'Insert Interval', 'M', 'iv', 'Sisipkan interval lalu gabungkan', 'Sebelum, overlap, sesudah'],
      [56, 'merge-intervals', 'Merge Intervals', 'M', 'iv', 'Gabungkan interval yang tumpang tindih', 'Urutkan berdasarkan awal; perpanjang yang terakhir'],
      [435, 'non-overlapping-intervals', 'Non-overlapping Intervals', 'M', 'iv', 'Hapus paling sedikit agar tidak ada overlap', 'Overlap → buang yang berakhir lebih lambat'],
      [252, 'meeting-rooms', 'Meeting Rooms', 'E', 'iv', 'Bisakah menghadiri semua rapat?', 'Urutkan; cek start < end sebelumnya', 920],
      [253, 'meeting-rooms-ii', 'Meeting Rooms II', 'M', 'iv', 'Jumlah ruang rapat minimum', 'Start dan end diurutkan terpisah, dua pointer', 919],
      [1851, 'minimum-interval-to-include-each-query', 'Minimum Interval to Include Each Query', 'H', 'iv', 'Interval terkecil yang memuat setiap query', 'Heap (ukuran, end); buang end < q'],
    ],
  },
  {
    id: 'd17', title: 'Math & Geometry', material: 'dsa-21-math-geometry', start: '2027-07-27', end: '2027-08-06',
    rows: [
      [48, 'rotate-image', 'Rotate Image', 'M', 'sim', 'Putar matriks n×n 90° in-place', 'Transpose lalu balik tiap baris'],
      [54, 'spiral-matrix', 'Spiral Matrix', 'M', 'sim', 'Urutan elemen secara spiral', 'Batas atas/bawah/kiri/kanan menyempit'],
      [73, 'set-matrix-zeroes', 'Set Matrix Zeroes', 'M', 'sim', 'Baris dan kolom dari sel 0 dijadikan 0', 'Baris dan kolom pertama sebagai penanda'],
      [202, 'happy-number', 'Happy Number', 'E', 'fs', 'Apakah jumlah kuadrat digit berakhir di 1?', 'Set nilai yang pernah muncul, atau fast-slow'],
      [66, 'plus-one', 'Plus One', 'E', 'sim', 'Tambah 1 pada angka dalam array digit', 'Dari belakang; semua 9 → [1] + nol'],
      [50, 'powx-n', 'Pow(x, n)', 'M', 'sim', 'Hitung x pangkat n', 'Kuadrat berulang; n negatif → 1/x'],
      [43, 'multiply-strings', 'Multiply Strings', 'M', 'sim', 'Kalikan dua angka dalam bentuk string', 'res[i+j+1] += d1·d2, lalu carry'],
      [2013, 'detect-squares', 'Detect Squares', 'M', 'hash', 'Hitung persegi sejajar sumbu dari titik-titik', 'Titik diagonal dengan |dx| == |dy|'],
    ],
  },
  {
    id: 'd18', title: 'Bit Manipulation', material: 'dsa-22-bit-manipulation', start: '2027-08-07', end: '2027-08-16',
    rows: [
      [136, 'single-number', 'Single Number', 'E', 'bit', 'Satu angka yang muncul hanya sekali', 'XOR semua angka'],
      [191, 'number-of-1-bits', 'Number of 1 Bits', 'E', 'bit', 'Hitung bit bernilai 1', 'n &= n − 1'],
      [338, 'counting-bits', 'Counting Bits', 'E', 'bit', 'Jumlah bit 1 untuk 0..n', 'dp[i] = dp[i >> 1] + (i & 1)'],
      [190, 'reverse-bits', 'Reverse Bits', 'E', 'bit', 'Balik urutan 32 bit', '32× geser dan OR'],
      [268, 'missing-number', 'Missing Number', 'E', 'bit', 'Angka yang hilang dari 0..n', 'n(n+1)/2 − sum, atau XOR'],
      [371, 'sum-of-two-integers', 'Sum of Two Integers', 'M', 'bit', 'Jumlahkan tanpa + dan −', 'XOR + carry (a & b) << 1, mask 32 bit'],
      [7, 'reverse-integer', 'Reverse Integer', 'M', 'sim', 'Balik digit bilangan 32-bit', 'Cek batas sebelum overflow'],
    ],
  },
];

// D19: 34 soal ekstra (dikelompokkan per pola)
const EXTRA: { title: string; rows: Row[] }[] = [
  { title: 'Array & two pointers', rows: [
    [283, 'move-zeroes', 'Move Zeroes', 'E', 'two', 'Pindahkan semua nol ke belakang tanpa mengubah urutan lainnya', 'Pointer tulis untuk elemen bukan nol'],
    [169, 'majority-element', 'Majority Element', 'E', 'freq', 'Elemen yang muncul lebih dari n/2 kali', 'Boyer–Moore: kandidat + hitungan'],
    [75, 'sort-colors', 'Sort Colors', 'M', 'two', 'Urutkan 0, 1, 2 dalam satu lintasan', 'Dutch flag: tiga pointer'],
    [31, 'next-permutation', 'Next Permutation', 'M', 'two', 'Permutasi leksikal berikutnya', 'Cari penurunan dari kanan, tukar, balik sufiks'],
  ] },
  { title: 'Prefix sum + hash map', rows: [
    [560, 'subarray-sum-equals-k', 'Subarray Sum Equals K', 'M', 'prefix', 'Banyak subarray yang berjumlah k', 'Hitung prefix; cari prefix − k di map'],
    [525, 'contiguous-array', 'Contiguous Array', 'M', 'prefix', 'Subarray terpanjang dengan jumlah 0 dan 1 sama', '0 → −1; indeks pertama tiap prefix'],
    [974, 'subarray-sums-divisible-by-k', 'Subarray Sums Divisible by K', 'M', 'prefix', 'Banyak subarray yang jumlahnya habis dibagi k', 'Hitung sisa prefix mod k'],
    [437, 'path-sum-iii', 'Path Sum III', 'M', 'prefix', 'Banyak jalur ke bawah di pohon yang berjumlah target', 'Prefix sum di sepanjang jalur DFS'],
  ] },
  { title: 'Sliding window', rows: [
    [438, 'find-all-anagrams-in-a-string', 'Find All Anagrams in a String', 'M', 'sw', 'Semua posisi awal anagram p di s', 'Jendela tetap + hitungan 26 huruf'],
    [209, 'minimum-size-subarray-sum', 'Minimum Size Subarray Sum', 'M', 'sw', 'Subarray terpendek dengan jumlah ≥ target', 'Perluas, lalu kecilkan selagi cukup'],
    [1004, 'max-consecutive-ones-iii', 'Max Consecutive Ones III', 'M', 'sw', 'Deret 1 terpanjang jika boleh membalik k nol', 'Jendela dengan maksimal k nol'],
  ] },
  { title: 'Monotonic stack', rows: [
    [496, 'next-greater-element-i', 'Next Greater Element I', 'E', 'mono', 'Elemen lebih besar berikutnya untuk tiap angka', 'Stack menurun + map jawaban'],
    [503, 'next-greater-element-ii', 'Next Greater Element II', 'M', 'mono', 'Sama, tapi array melingkar', 'Putar dua kali dengan indeks mod n'],
    [901, 'online-stock-span', 'Online Stock Span', 'M', 'mono', 'Berapa hari berturut-turut harga ≤ hari ini', 'Stack (harga, rentang) menurun'],
  ] },
  { title: 'Binary search', rows: [
    [34, 'find-first-and-last-position-of-element-in-sorted-array', 'Find First and Last Position of Element in Sorted Array', 'M', 'bs', 'Posisi pertama dan terakhir target', 'Dua kali binary search: batas kiri dan kanan'],
    [162, 'find-peak-element', 'Find Peak Element', 'M', 'bs', 'Indeks puncak lokal mana pun', 'Naik ke arah tetangga yang lebih besar'],
    [1011, 'capacity-to-ship-packages-within-d-days', 'Capacity To Ship Packages Within D Days', 'M', 'bsa', 'Kapasitas kapal minimum agar selesai dalam d hari', 'Binary search kapasitas, cek greedy jumlah hari'],
  ] },
  { title: 'Linked list', rows: [
    [92, 'reverse-linked-list-ii', 'Reverse Linked List II', 'M', 'll', 'Balik bagian list dari posisi left sampai right', 'Dummy; pindahkan node satu per satu ke depan'],
    [234, 'palindrome-linked-list', 'Palindrome Linked List', 'E', 'fs', 'Apakah linked list palindrom?', 'Cari tengah, balik paruh kedua, bandingkan'],
  ] },
  { title: 'Trees', rows: [
    [101, 'symmetric-tree', 'Symmetric Tree', 'E', 'tdfs', 'Apakah pohon simetris terhadap pusatnya?', 'Bandingkan kiri.kiri dengan kanan.kanan secara rekursif'],
    [112, 'path-sum', 'Path Sum', 'E', 'tdfs', 'Ada jalur akar–daun dengan jumlah target?', 'Kurangi target saat turun, cek di daun'],
    [236, 'lowest-common-ancestor-of-a-binary-tree', 'Lowest Common Ancestor of a Binary Tree', 'M', 'tdfs', 'Leluhur bersama terendah di pohon biasa', 'Kembalikan node jika ketemu; kedua sisi tidak kosong → node ini'],
    [662, 'maximum-width-of-binary-tree', 'Maximum Width of Binary Tree', 'M', 'tbfs', 'Lebar level terbesar, termasuk celah kosong', 'Beri indeks heap 2i dan 2i+1 per level'],
  ] },
  { title: 'Graphs', rows: [
    [547, 'number-of-provinces', 'Number of Provinces', 'M', 'uf', 'Banyak kelompok kota yang saling terhubung', 'Union-Find atau DFS dari matriks ketetanggaan'],
    [721, 'accounts-merge', 'Accounts Merge', 'M', 'uf', 'Gabungkan akun yang punya email sama', 'Union email; kelompokkan per akar'],
    [1091, 'shortest-path-in-binary-matrix', 'Shortest Path in Binary Matrix', 'M', 'grid', 'Jalur terpendek di grid 0/1 dengan 8 arah', 'BFS dari pojok kiri atas'],
    [785, 'is-graph-bipartite', 'Is Graph Bipartite?', 'M', 'graph', 'Bisakah node diwarnai dua warna tanpa bentrok?', 'BFS/DFS mewarnai bergantian'],
    [815, 'bus-routes', 'Bus Routes', 'H', 'graph', 'Bus paling sedikit dari halte asal ke tujuan', 'BFS pada rute bus, bukan pada halte'],
  ] },
  { title: 'Dynamic programming', rows: [
    [64, 'minimum-path-sum', 'Minimum Path Sum', 'M', 'dp2', 'Jumlah jalur minimum di grid', 'dp = sel + min(atas, kiri)'],
    [221, 'maximal-square', 'Maximal Square', 'M', 'dp2', 'Persegi 1 terbesar di matriks', 'dp = 1 + min(atas, kiri, diagonal)'],
    [516, 'longest-palindromic-subsequence', 'Longest Palindromic Subsequence', 'M', 'dp2', 'Subsequence palindrom terpanjang', 'LCS antara s dan kebalikannya'],
    [279, 'perfect-squares', 'Perfect Squares', 'M', 'dp1', 'Bilangan kuadrat paling sedikit yang berjumlah n', 'dp[i] = min(dp[i − k²] + 1)'],
    [1235, 'maximum-profit-in-job-scheduling', 'Maximum Profit in Job Scheduling', 'H', 'dp1', 'Untung maksimum dari pekerjaan yang tidak bertabrakan', 'Urutkan per akhir; dp + binary search pekerjaan sebelumnya'],
    [140, 'word-break-ii', 'Word Break II', 'H', 'bt', 'Semua kalimat dari pemecahan string jadi kata kamus', 'Backtracking + memo per indeks'],
  ] },
];

const leetUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;
const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

function toProblem(r: Row, topic: string): Problem {
  const [lc, slug, title, level, pat, summary, idea, lintcode] = r;
  return { lc, slug, title, level, pattern: PATTERNS[pat], summary, idea, lintcode, topic };
}

export function problemLinks(p: Problem) {
  const links = [{ label: 'LeetCode', url: leetUrl(p.slug) }];
  if (p.lintcode) links.unshift({ label: `LintCode ${p.lintcode} (gratis)`, url: `https://www.lintcode.com/problem/${p.lintcode}/` });
  links.push({ label: 'NeetCode (cari)', url: `https://neetcode.io/practice` });
  links.push({ label: 'Video solusi (YouTube)', url: ytSearch(`neetcode ${p.title}`) });
  return links;
}

type Draft = Omit<PathNode, 'track' | 'sectionId' | 'unitId' | 'targetDate'> & { date?: string };

function unit(sectionId: string, id: string, title: string, start: string | undefined, end: string | undefined, drafts: Draft[], jp?: string): Unit {
  const dates = start && end ? spreadDates(start, end, drafts.length) : [];
  return {
    id,
    sectionId,
    title,
    jp,
    start,
    end,
    nodes: drafts.map(({ date, ...d }, i) => ({ ...d, track: 'dsa', sectionId, unitId: id, targetDate: date ?? dates[i] })),
  };
}

const materi = (id: string, matId: string, title: string, minutes = 25): Draft => ({ id, type: 'materi', title, minutes, xp: baseXp('materi'), required: true, material: { id: matId } });
const video = (id: string, title: string, query: string): Draft => ({ id, type: 'video', title, minutes: 15, xp: baseXp('video'), required: true, video: { query } });
const soal = (p: Problem): Draft => ({
  id: `lc-${p.lc}`,
  type: 'soal',
  title: p.title,
  subtitle: `#${p.lc} · ${p.level === 'E' ? 'Easy' : p.level === 'M' ? 'Medium' : 'Hard'}`,
  minutes: p.level === 'E' ? 20 : p.level === 'M' ? 35 : 50,
  xp: baseXp('soal', { level: p.level }),
  required: true,
  problem: p,
});

export const PROBLEMS: Problem[] = [
  ...TOPICS.flatMap((t) => t.rows.map((r) => toProblem(r, t.id))),
  ...EXTRA.flatMap((g) => g.rows.map((r) => toProblem(r, 'd19'))),
];

const WARMUP: Row[] = [
  [1480, 'running-sum-of-1d-array', 'Running Sum of 1d Array', 'E', 'prefix', 'Jumlah berjalan dari awal array', 'out[i] = out[i−1] + nums[i]'],
  [1672, 'richest-customer-wealth', 'Richest Customer Wealth', 'E', 'sim', 'Total harta nasabah terkaya', 'max(sum(baris))'],
  [412, 'fizz-buzz', 'Fizz Buzz', 'E', 'sim', 'Cetak Fizz/Buzz/FizzBuzz untuk 1..n', 'Cek habis dibagi 15, 3, lalu 5'],
];
export const WARMUP_PROBLEMS = WARMUP.map((r) => toProblem(r, 'd0'));

function buildD0(): Section {
  const s = 'D0';
  return {
    id: s,
    track: 'dsa',
    title: 'Fondasi',
    jp: '基礎',
    start: '2026-11-09',
    end: '2026-11-29',
    units: [
      unit(s, 'd0', 'Fondasi: Big-O, Python, rekursi', '2026-11-09', '2026-11-29', [
        materi('dsa-d0-cara', 'dsa-00-cara-belajar', 'Cara belajar DSA', 20),
        materi('dsa-d0-bigo', 'dsa-01-big-o', 'Big-O dan batas input', 30),
        video('dsa-d0-bigo-video', 'Video: Big-O notation', 'neetcode big o notation'),
        materi('dsa-d0-python', 'dsa-02-python-toolkit', 'Toolkit Python', 30),
        ...WARMUP_PROBLEMS.map(soal),
        materi('dsa-d0-rekursi', 'dsa-03-rekursi', 'Rekursi, call stack, memo', 30),
        materi('dsa-d0-umpire', 'dsa-04-problem-solving', 'Metode UMPIRE + bicara saat interview', 25),
        {
          id: 'dsa-d0-checkpoint',
          type: 'checkpoint',
          title: 'Checkpoint fondasi',
          subtitle: '10 soal Big-O + 1 Easy dalam 15 menit',
          minutes: 30,
          xp: baseXp('checkpoint'),
          required: true,
          quiz: { kind: 'bigo' },
          passPct: 80,
          checklist: ['Selesaikan 1 soal Easy baru dalam ≤ 15 menit tanpa hint'],
        },
      ], '基礎'),
    ],
  };
}

function buildNc150(): Section {
  const s = 'NC150';
  return {
    id: s,
    track: 'dsa',
    title: 'NeetCode 150',
    start: '2026-11-30',
    end: '2027-08-16',
    units: TOPICS.map((t) => {
      const probs = t.rows.map((r) => toProblem(r, t.id));
      return unit(s, t.id, `${t.id.toUpperCase()} · ${t.title}`, t.start, t.end, [
        materi(`dsa-${t.id}-materi`, t.material, `Materi: ${t.title}`),
        video(`dsa-${t.id}-video`, `Video konsep: ${t.title}`, `neetcode ${t.title}`),
        ...probs.map(soal),
        { id: `dsa-${t.id}-pola`, type: 'latihan', title: `Tebak Pola: ${t.title}`, subtitle: '5 kartu', minutes: 10, xp: baseXp('latihan'), required: true, quiz: { kind: 'pattern', topics: [t.id] } },
        { id: `dsa-${t.id}-boss`, type: 'boss', title: `Boss: ${t.title}`, subtitle: '2 soal acak topik, 45 menit, tanpa melihat solusi', minutes: 45, xp: baseXp('boss'), required: true, timeLimitS: 45 * 60 },
        { id: `dsa-${t.id}-refleksi`, type: 'refleksi', title: 'Refleksi: kapan aku pakai pola ini?', subtitle: '3 kalimat di catatan', minutes: 10, xp: baseXp('refleksi'), required: true },
      ]);
    }),
  };
}

function buildMastery(): Section {
  const s = 'D19';
  const groups = EXTRA.map((g, i) => {
    const start = ['2027-09-01', '2027-09-12', '2027-09-24', '2027-10-04', '2027-10-14', '2027-10-24', '2027-11-01', '2027-11-12', '2027-11-26'][i];
    const end = ['2027-09-11', '2027-09-23', '2027-10-03', '2027-10-13', '2027-10-23', '2027-10-31', '2027-11-11', '2027-11-25', '2027-12-20'][i];
    return unit(s, `d19-${i + 1}`, `Ekstra: ${g.title}`, start, end, g.rows.map((r) => soal(toProblem(r, 'd19'))));
  });
  const mocks: Draft[] = [1, 2, 3, 4].map((n) => ({
    id: `dsa-d19-mock-${n}`,
    type: 'boss',
    title: `Mock interview #${n}`,
    subtitle: '45 menit, 2 soal, bicara sambil mengerjakan, direkam',
    minutes: 60,
    xp: 80,
    required: true,
    date: ['2027-09-26', '2027-10-24', '2027-11-21', '2027-12-19'][n - 1],
  }));
  const contests: Draft[] = Array.from({ length: 8 }, (_, i) => ({
    id: `dsa-d19-kontes-${i + 1}`,
    type: 'boss',
    title: `Kontes #${i + 1}`,
    subtitle: 'LeetCode Weekly/Biweekly',
    minutes: 90,
    xp: 60,
    required: true,
    date: spreadDates('2027-09-01', '2027-12-31', 8)[i],
    links: [{ label: 'LeetCode Contest', url: 'https://leetcode.com/contest/' }],
  }));
  return {
    id: s,
    track: 'dsa',
    title: 'Interview Mastery',
    jp: '面接',
    start: '2027-09-01',
    end: '2027-12-31',
    units: [
      unit(s, 'd19-0', 'Playbook interview', '2027-09-01', '2027-09-05', [materi('dsa-d19-playbook', 'dsa-23-interview-playbook', 'Interview playbook', 30)]),
      ...groups,
      unit(s, 'd19-mock', 'Mock interview & kontes', undefined, undefined, [...mocks, ...contests].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))),
    ],
  };
}

function buildContest(): Section {
  const s = 'D20';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'];
  return {
    id: s,
    track: 'dsa',
    title: 'Kontes & Jepang',
    jp: 'AtCoder',
    start: '2028-01-01',
    end: '2028-09-30',
    units: months.map((m, i) => {
      const mm = String(i + 1).padStart(2, '0');
      const last = new Date(Date.UTC(2028, i + 1, 0)).getUTCDate();
      return unit(s, `d20-${i + 1}`, `${m} 2028 · perawatan`, `2028-${mm}-01`, `2028-${mm}-${last}`, [
        { id: `dsa-d20-${i + 1}-abc1`, type: 'boss', title: 'AtCoder ABC (baca soal dalam bahasa Jepang)', subtitle: 'Target A–C stabil, lalu D', minutes: 100, xp: 60, required: true, links: [{ label: 'AtCoder', url: 'https://atcoder.jp/contests/' }] },
        { id: `dsa-d20-${i + 1}-abc2`, type: 'boss', title: 'AtCoder ABC #2', subtitle: 'Kosakata baru (整数, 配列, 制約…) masuk Anki', minutes: 100, xp: 60, required: true, links: [{ label: 'AtCoder', url: 'https://atcoder.jp/contests/' }] },
        { id: `dsa-d20-${i + 1}-paiza`, type: 'latihan', title: 'paiza スキルチェック', subtitle: 'Target rank A', minutes: 60, xp: 30, required: true, links: [{ label: 'paiza', url: 'https://paiza.jp/challenges/' }] },
      ]);
    }),
  };
}

function buildSystemDesign(): Section {
  const s = 'D21';
  const topics = ['Skala vertikal dan horizontal', 'Load balancer, cache, CDN', 'Indeks dan replikasi database', 'Antrian pesan', 'Consistent hashing', 'Rate limiter', 'Desain URL shortener', 'Desain feed'];
  return {
    id: s,
    track: 'dsa',
    title: 'System design (opsional)',
    optional: true,
    units: [
      unit(s, 'd21', 'Dasar system design', undefined, undefined, topics.map((t, i) => ({
        id: `dsa-d21-${i + 1}`,
        type: 'materi' as const,
        title: t,
        minutes: 45,
        xp: 20,
        required: false,
        links: [
          { label: 'system-design-primer', url: 'https://github.com/donnemartin/system-design-primer' },
          { label: 'ByteByteGo (YouTube)', url: ytSearch(`ByteByteGo ${t}`) },
        ],
      }))),
    ],
  };
}

export const DSA_SECTIONS: Section[] = [buildD0(), buildNc150(), buildMastery(), buildContest(), buildSystemDesign()];
export const TOPIC_TITLES: Record<string, string> = Object.fromEntries([['d0', 'Fondasi'], ...TOPICS.map((t) => [t.id, t.title]), ['d19', 'Ekstra']]);
