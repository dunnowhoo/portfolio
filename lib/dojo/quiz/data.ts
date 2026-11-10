// Data kuis statis: kana dan soal Big-O. Kanji & grammar diambil dari materi MD (lib/dojo/content.ts).

type K = [string, string]; // [kana, romaji]

const H_BASIC: K[] = [
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
  ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
  ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
  ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
  ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
  ['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
  ['わ', 'wa'], ['を', 'wo'], ['ん', 'n'],
];
const H_DAKUTEN: K[] = [
  ['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go'],
  ['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo'],
  ['だ', 'da'], ['ぢ', 'ji (ぢ)'], ['づ', 'zu (づ)'], ['で', 'de'], ['ど', 'do'],
  ['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo'],
  ['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po'],
];
const H_YOON: K[] = [
  ['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'], ['しゃ', 'sha'], ['しゅ', 'shu'], ['しょ', 'sho'],
  ['ちゃ', 'cha'], ['ちゅ', 'chu'], ['ちょ', 'cho'], ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo'],
  ['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'], ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo'],
  ['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'], ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo'],
  ['じゃ', 'ja'], ['じゅ', 'ju'], ['じょ', 'jo'], ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'],
  ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
];
const K_SPECIAL: K[] = [
  ['ティ', 'ti'], ['ディ', 'di'], ['ファ', 'fa'], ['フィ', 'fi'], ['フェ', 'fe'], ['フォ', 'fo'],
  ['ウィ', 'wi'], ['ウェ', 'we'], ['ウォ', 'wo (ウォ)'], ['ヴ', 'vu'], ['チェ', 'che'], ['シェ', 'she'],
  ['ジェ', 'je'], ['トゥ', 'tu'], ['ドゥ', 'du'],
];

// Hiragana → katakana: geser kode Unicode +0x60
const toKata = (s: string) => [...s].map((c) => (c >= 'ぁ' && c <= 'ゖ' ? String.fromCharCode(c.charCodeAt(0) + 0x60) : c)).join('');
const kata = (list: K[]): K[] => list.map(([k, r]) => [toKata(k), r]);

export type KanaItem = { id: string; kana: string; romaji: string };
const items = (list: K[]): KanaItem[] => list.map(([k, r]) => ({ id: `kana:${k}`, kana: k, romaji: r }));

const NO_IDX = H_BASIC.findIndex(([k]) => k === 'の');
export const KANA_SETS: Record<string, KanaItem[]> = {
  'hira-a-no': items(H_BASIC.slice(0, NO_IDX + 1)),
  'hira-ha-n': items(H_BASIC.slice(NO_IDX + 1)),
  'hira-all': items(H_BASIC),
  'hira-var': items([...H_DAKUTEN, ...H_YOON]),
  'kata-basic': items(kata(H_BASIC)),
  'kata-full': items([...kata(H_BASIC), ...kata(H_DAKUTEN), ...kata(H_YOON), ...K_SPECIAL]),
  'kana-all': items([...H_BASIC, ...H_DAKUTEN, ...H_YOON, ...kata(H_BASIC), ...kata(H_DAKUTEN), ...kata(H_YOON)]),
};

// Kuis Big-O untuk checkpoint fondasi (soal orisinal)
export const BIGO: { q: string; a: string; options: string[]; why: string }[] = [
  { q: 'for i in range(n):\n    for j in range(n):\n        total += i * j', a: 'O(n²)', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], why: 'Dua loop bersarang, masing-masing n kali.' },
  { q: 'Binary search pada array terurut berisi n elemen', a: 'O(log n)', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'Setiap langkah membuang separuh ruang pencarian.' },
  { q: 'for i in range(n):\n    for j in range(i, n):\n        ...', a: 'O(n²)', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'], why: 'n + (n−1) + … + 1 = n(n+1)/2.' },
  { q: 'i = 1\nwhile i < n:\n    i *= 2', a: 'O(log n)', options: ['O(1)', 'O(log n)', 'O(n)', 'O(√n)'], why: 'i berlipat dua sampai n: log₂ n langkah.' },
  { q: 'sorted(nums) untuk list berisi n angka', a: 'O(n log n)', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], why: 'Timsort: O(n log n) di kasus umum.' },
  { q: 'def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)', a: 'O(2ⁿ)', options: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(n log n)'], why: 'Tanpa memo, setiap pemanggilan bercabang dua.' },
  { q: 'fib(n) yang sama, tetapi memakai @cache', a: 'O(n)', options: ['O(1)', 'O(log n)', 'O(n)', 'O(2ⁿ)'], why: 'Setiap fib(k) dihitung sekali.' },
  { q: 'Rata-rata waktu `x in s` kalau s adalah set Python', a: 'O(1)', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'Set memakai hash table.' },
  { q: 'Rata-rata waktu `x in arr` kalau arr adalah list Python', a: 'O(n)', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], why: 'List diperiksa satu per satu.' },
  { q: 'n ≤ 10⁵ dan batas waktu ±1 detik. Kompleksitas mana yang paling aman?', a: 'O(n log n)', options: ['O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'], why: '10⁵ × 17 ≈ 1,7 juta operasi; n² = 10¹⁰ terlalu lambat.' },
];
