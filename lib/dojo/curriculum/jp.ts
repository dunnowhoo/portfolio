// Jalur 日本語 (docs/dojo/curriculum/JP.md): kana → N5 → N4 → N3 → bahasa Jepang kerja.
import { baseXp, spreadDates, type Irodori, type PathNode, type QuizSpec, type Section, type Unit } from './types';

type Book = Irodori['book'];
type Lesson = [Book, number, string];
type GramLevel = 'n5' | 'n4' | 'n3';
type Draft = Omit<PathNode, 'track' | 'sectionId' | 'unitId' | 'targetDate'> & { date?: string };

const pad = (n: number) => String(n).padStart(2, '0');
const BOOK_DIR: Record<Book, { dir: string; prefix: string; name: string }> = {
  X: { dir: 'starter', prefix: 'X_L', name: 'Starter' },
  Y: { dir: 'elementary01', prefix: 'Y_L', name: 'Elementary 1' },
  Z: { dir: 'elementary02', prefix: 'Z_L', name: 'Elementary 2' },
  ZZ: { dir: 'pre-intermediate', prefix: 'ZZ_L', name: 'Pre-Intermediate' },
};
const IRODORI_ROOT = 'https://www.irodori.jpf.go.jp';
export const IRODORI_ID_MATERIALS = 'https://sites.google.com/view/jf-irodori/halaman-pemelajar';
const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

function irodori([book, n, title]: Lesson): Draft {
  const b = BOOK_DIR[book];
  return {
    id: `jp-iro-${book.toLowerCase()}${pad(n)}`,
    type: 'irodori',
    title: `${book} L${pad(n)}: ${title}`,
    subtitle: `Irodori ${b.name} · bacaan + audio + latihan`,
    minutes: 75,
    xp: baseXp('irodori'),
    required: true,
    irodori: {
      book,
      lesson: n,
      title,
      pdf: `${IRODORI_ROOT}/assets/data/${b.dir}/pdf/${b.prefix}${pad(n)}.pdf`,
      audio: `${IRODORI_ROOT}/en/${b.dir}/audio/lesson${pad(n)}.html`,
    },
    links: [{ label: 'Materi Irodori berbahasa Indonesia', url: IRODORI_ID_MATERIALS }],
  };
}

const GRAMMAR_FILE: Record<GramLevel, string> = { n5: 'jp-03-n5-grammar', n4: 'jp-05-n4-grammar', n3: 'jp-06-n3-grammar' };
const gid = (n: number) => `g${pad(n)}`;

function grammar(unitId: string, level: GramLevel, from: number, to: number): Draft {
  return {
    id: `jp-${unitId}-grammar`,
    type: 'materi',
    title: `Grammar ${level.toUpperCase()} ${gid(from)}–${gid(to)}`,
    subtitle: `${to - from + 1} poin dari materi Dōjō`,
    minutes: 30,
    xp: baseXp('materi'),
    required: true,
    material: { id: GRAMMAR_FILE[level], sections: [`Unit ${unitId}`] },
    quiz: { kind: 'grammar', level, from, to },
  };
}

function grammarVideo(unitId: string, level: GramLevel, from: number, to: number): Draft {
  return {
    id: `jp-${unitId}-video`,
    type: 'video',
    title: `Video grammar ${level.toUpperCase()} ${gid(from)}–${gid(to)}`,
    subtitle: 'Japanese Ammo with Misa / ToKini Andy',
    minutes: 15,
    xp: baseXp('video'),
    required: true,
    video: { query: `Japanese Ammo with Misa ${level.toUpperCase()} grammar` },
    material: { id: GRAMMAR_FILE[level], sections: [`Unit ${unitId}`] },
  };
}

function kanjiSprint(unitId: string, batch: number): Draft {
  return {
    id: `jp-${unitId}-kanji`,
    type: 'latihan',
    title: `Sprint kanji batch ${batch}`,
    subtitle: '20 kartu: arti dan bacaan',
    minutes: 10,
    xp: baseXp('latihan'),
    required: true,
    material: { id: 'jp-04-kanji-n5' },
    quiz: { kind: 'kanji', batches: [batch] },
  };
}

function checkpoint(id: string, title: string, quiz: QuizSpec, passPct = 80, extra: Partial<Draft> = {}): Draft {
  return { id, type: 'checkpoint', title, subtitle: `Lulus ≥ ${passPct}%`, minutes: 20, xp: baseXp('checkpoint'), required: true, quiz, passPct, ...extra };
}

const anki = (id: string, target: string, date?: string): Draft => ({
  id,
  type: 'anki',
  title: `Anki: ${target}`,
  subtitle: 'Target kumulatif Kaishi 1.5k',
  minutes: 20,
  xp: baseXp('anki'),
  required: true,
  date,
  links: [{ label: 'Kaishi 1.5k versi Indonesia', url: 'https://ankiweb.net/shared/info/1512066033' }],
});
const duolingo = (id: string, target: string): Draft => ({
  id,
  type: 'duolingo',
  title: `Duolingo: ${target}`,
  minutes: 15,
  xp: baseXp('duolingo'),
  required: true,
  links: [{ label: 'Duolingo', url: 'https://www.duolingo.com/learn' }],
});
const war = (id: string, title: string, date?: string): Draft => ({
  id,
  type: 'milestone',
  milestone: 'jlpt-reg',
  title,
  subtitle: 'Status sesi JLPT = terdaftar',
  minutes: 30,
  xp: baseXp('milestone', { milestone: 'jlpt-reg' }),
  required: true,
  date,
  material: { id: 'jp-07-jlpt-strategi', sections: ['5.'] },
  links: [{ label: 'jlptonline.or.id', url: 'https://jlptonline.or.id/' }],
});
const exam = (id: string, level: string, date: string): Draft => ({
  id,
  type: 'milestone',
  milestone: 'jlpt-exam',
  title: `JLPT ${level}`,
  subtitle: `Ujian, Minggu ${date} (perkiraan)`,
  minutes: 240,
  xp: baseXp('milestone', { milestone: 'jlpt-exam' }),
  required: true,
  date,
  material: { id: 'jp-07-jlpt-strategi', sections: ['6.'] },
});
const sim = (id: string, title: string, big = false, extra: Partial<Draft> = {}): Draft => ({
  id,
  type: 'boss',
  title,
  subtitle: big ? 'Simulasi penuh ber-timer' : 'Contoh soal resmi',
  minutes: big ? 120 : 60,
  xp: baseXp('boss', { big }),
  big,
  required: true,
  links: [{ label: 'Contoh soal resmi JLPT', url: 'https://www.jlpt.jp/e/samples/forlearners.html' }],
  ...extra,
});
const write = (id: string, title: string, extra: Partial<Draft> = {}): Draft => ({ id, type: 'refleksi', title, minutes: 20, xp: baseXp('refleksi'), required: true, ...extra });
const talk = (id: string, title: string): Draft => ({ id, type: 'bicara', title, minutes: 45, xp: baseXp('bicara'), required: true, links: [{ label: 'italki', url: 'https://www.italki.com/' }] });
const video = (id: string, title: string, query: string): Draft => ({ id, type: 'video', title, minutes: 20, xp: baseXp('video'), required: true, video: { query }, links: [{ label: 'Cari di YouTube', url: ytSearch(query) }] });
const TOFUGU: Record<string, { label: string; url: string }> = {
  'jp-01-hiragana': { label: 'Mnemonik hiragana (Tofugu)', url: 'https://www.tofugu.com/japanese/learn-hiragana/' },
  'jp-02-katakana': { label: 'Mnemonik katakana (Tofugu)', url: 'https://www.tofugu.com/japanese/learn-katakana/' },
};
const materi = (id: string, matId: string, title: string, sections?: string[], minutes = 25): Draft => ({
  id,
  type: 'materi',
  title,
  minutes,
  xp: baseXp('materi'),
  required: true,
  material: { id: matId, sections },
  links: TOFUGU[matId] ? [TOFUGU[matId]] : undefined,
});
const kana = (id: string, title: string, set: Extract<QuizSpec, { kind: 'kana' }>['set']): Draft => ({ id, type: 'latihan', title, subtitle: '20 kartu, pilih bacaannya', minutes: 8, xp: baseXp('latihan'), required: true, quiz: { kind: 'kana', set } });

function unit(sectionId: string, id: string, title: string, start: string, end: string, drafts: Draft[], note?: string): Unit {
  const dates = spreadDates(start, end, drafts.length);
  return {
    id,
    sectionId,
    title,
    start,
    end,
    note,
    nodes: drafts.map(({ date, ...d }, i) => ({ ...d, track: 'jp', sectionId, unitId: id, targetDate: date ?? dates[i] })),
  };
}

// ---------- Section 0: かな ----------
function section0(): Section {
  const s = 'S0';
  return {
    id: s,
    track: 'jp',
    title: 'Kana',
    jp: 'かな',
    start: '2026-11-09',
    end: '2026-11-30',
    units: [
      unit(s, '0.1', 'ひらがな dasar', '2026-11-09', '2026-11-15', [
        materi('jp-0.1-hira-a', 'jp-01-hiragana', 'Hiragana §1–3: cara kerja kana, baris あ–の', ['§1', '§2', '§3']),
        video('jp-0.1-video', 'Video: hiragana', 'hiragana lesson Japanese Ammo with Misa'),
        kana('jp-0.1-sprint-a', 'Sprint あ–の', 'hira-a-no'),
        materi('jp-0.1-hira-h', 'jp-01-hiragana', 'Hiragana §4: baris は–ん', ['§4']),
        kana('jp-0.1-sprint-h', 'Sprint は–ん', 'hira-ha-n'),
        write('jp-0.1-tulis', 'Tulis tangan 46 huruf ×5', { checklist: ['あ–の ×5', 'は–ん ×5', 'Foto hasil tulisan untuk dibandingkan minggu depan'] }),
        checkpoint('jp-0.1-checkpoint', 'Checkpoint hiragana dasar', { kind: 'kana', set: 'hira-all' }),
      ]),
      unit(s, '0.2', 'Variasi + カタカナ dasar', '2026-11-16', '2026-11-22', [
        materi('jp-0.2-hira-var', 'jp-01-hiragana', 'Hiragana §5: ゛゜, ゃゅょ, っ, bunyi panjang', ['§5']),
        kana('jp-0.2-sprint-var', 'Sprint variasi', 'hira-var'),
        checkpoint('jp-0.2-checkpoint', 'Checkpoint ひらがな修了', { kind: 'mix', parts: [{ kind: 'kana', set: 'hira-all' }, { kind: 'kana', set: 'hira-var' }] }),
        materi('jp-0.2-kata', 'jp-02-katakana', 'Katakana §1–3', ['§1', '§2', '§3']),
        video('jp-0.2-video', 'Video: katakana', 'katakana lesson Japanese Ammo with Misa'),
        kana('jp-0.2-sprint-kata', 'Sprint katakana dasar', 'kata-basic'),
      ], 'Mulai 16 Nov romaji berhenti dipakai.'),
      unit(s, '0.3', 'Katakana serapan + persiapan', '2026-11-23', '2026-11-30', [
        materi('jp-0.3-kata-serapan', 'jp-02-katakana', 'Katakana §4–6: ー, ティ/ファ/ウィ, kata IT', ['§4', '§5', '§6']),
        kana('jp-0.3-sprint-kata', 'Sprint katakana penuh', 'kata-full'),
        write('jp-0.3-nama', 'Tulis nama: ファウザン・プトラ・サンジャヤ'),
        anki('jp-0.3-anki', 'pasang Kaishi, mulai 5 kartu/hari'),
        duolingo('jp-0.3-duolingo', 'tab Huruf hiragana + katakana'),
        {
          id: 'jp-iro-x00',
          type: 'irodori',
          title: 'X L00: Japanese in the classroom',
          subtitle: 'Irodori Starter · ungkapan kelas',
          minutes: 45,
          xp: baseXp('irodori'),
          required: true,
          irodori: { book: 'X', lesson: 0, title: 'Japanese in the classroom', pdf: `${IRODORI_ROOT}/assets/data/starter/pdf/X_kyoshitsu.pdf` },
          links: [{ label: 'Materi Irodori berbahasa Indonesia', url: IRODORI_ID_MATERIALS }],
        },
        materi('jp-0.3-cara', 'jp-00-cara-belajar', 'Cara belajar 日本語'),
        checkpoint('jp-0.3-checkpoint', 'Checkpoint かなマスター', { kind: 'kana', set: 'kana-all' }, 95, { subtitle: 'Semua kana dasar + variasi, ≥ 95%, ≤ 4 menit', timeLimitS: 240 }),
      ]),
    ],
  };
}

// ---------- Section 1–3: template per unit ----------
type U = {
  id: string;
  title: string;
  start: string;
  end: string;
  lessons?: Lesson[];
  gram?: [GramLevel, number, number];
  kanji?: number;
  extra?: Draft[];
  note?: string;
  noCheckpoint?: boolean;
};

function templUnit(sectionId: string, u: U): Unit {
  const d: Draft[] = [];
  const [a, b] = u.lessons ?? [];
  if (a) d.push(irodori(a));
  if (u.gram) d.push(grammar(u.id, ...u.gram), grammarVideo(u.id, ...u.gram));
  if (b) d.push(irodori(b));
  if (u.kanji) d.push(kanjiSprint(u.id, u.kanji));
  d.push(...(u.extra ?? []));
  if (!u.noCheckpoint && u.gram) {
    const parts: QuizSpec[] = [{ kind: 'grammar', level: u.gram[0], from: u.gram[1], to: u.gram[2] }];
    if (u.kanji) parts.push({ kind: 'kanji', batches: [u.kanji] });
    d.push(checkpoint(`jp-${u.id}-checkpoint`, `Checkpoint unit ${u.id}`, parts.length === 1 ? parts[0] : { kind: 'mix', parts }));
  }
  return unit(sectionId, u.id, u.title, u.start, u.end, d, u.note);
}

const S1: U[] = [
  { id: '1.1', title: 'Starting to Speak Japanese', start: '2026-12-01', end: '2026-12-13', lessons: [['X', 1, 'Good morning!'], ['X', 2, "I'm sorry, I don't really understand."]], gram: ['n5', 1, 4], kanji: 1, extra: [video('jp-1.1-ci', 'Comprehensible Japanese: complete beginner', 'Comprehensible Japanese complete beginner')] },
  { id: '1.2', title: 'About Myself', start: '2026-12-14', end: '2026-12-27', lessons: [['X', 3, 'Nice to meet you.'], ['X', 4, 'I live in Tokyo.']], gram: ['n5', 5, 8], kanji: 2, extra: [anki('jp-1.2-anki', 'Kaishi 270 kartu', '2026-12-31')] },
  { id: '1.3', title: 'My Favorite Foods', start: '2026-12-28', end: '2027-01-10', lessons: [['X', 5, 'I like udon.'], ['X', 6, "I'd like a cheeseburger, please."]], gram: ['n5', 9, 12], kanji: 3 },
  { id: '1.4', title: 'Homes and Workplaces', start: '2027-01-11', end: '2027-01-24', lessons: [['X', 7, 'There are four rooms.'], ['X', 8, 'Where is Yamada-san?']], gram: ['n5', 13, 16], kanji: 4, extra: [anki('jp-1.4-anki', 'Kaishi 520 kartu', '2027-01-31')] },
  { id: '1.5', title: 'Daily Life', start: '2027-01-25', end: '2027-02-07', lessons: [['X', 9, "Lunch is from noon to 1 o'clock."], ['X', 10, 'Please lend me the stapler.']], gram: ['n5', 17, 20], kanji: 5 },
  { id: '1.6', title: 'What I Like to Do', start: '2027-02-08', end: '2027-02-21', lessons: [['X', 11, 'What kind of manga do you like?'], ['X', 12, 'Do you want to go for a drink together?']], gram: ['n5', 21, 24], kanji: 6, extra: [anki('jp-1.6-anki', 'Kaishi 740 kartu', '2027-02-28')] },
  { id: '1.7', title: 'Walking around Town', start: '2027-02-22', end: '2027-03-07', lessons: [['X', 13, 'Does this bus go to the airport?'], ['X', 14, "It's a big building, isn't it."]], gram: ['n5', 25, 28], kanji: 7 },
  { id: '1.8', title: 'At Stores', start: '2027-03-08', end: '2027-03-21', lessons: [['X', 15, 'I need some batteries.'], ['X', 16, 'How much is this?']], gram: ['n5', 29, 32], kanji: 8, extra: [war('jp-1.8-war', 'WAR: pendaftaran JLPT Juli 2027 (N5)')] },
  { id: '1.9', title: 'Holidays', start: '2027-03-22', end: '2027-03-31', lessons: [['X', 17, 'I went to see a movie.'], ['X', 18, 'I want to go to a hot spring.']], gram: ['n5', 33, 36], kanji: 9, extra: [duolingo('jp-1.9-duolingo', 'Section 1 selesai'), anki('jp-1.9-anki', 'Kaishi 990 kartu')] },
  { id: '1.10', title: 'My Current Self (E1)', start: '2027-04-01', end: '2027-04-14', lessons: [['Y', 1, 'I work in a restaurant.'], ['Y', 2, 'I like playing video games.']], gram: ['n5', 37, 40], kanji: 10, extra: [anki('jp-1.10-anki', 'Kaishi 1.230 kartu', '2027-04-30')] },
  { id: '1.11', title: 'Seasons and Weather (E1)', start: '2027-04-15', end: '2027-04-28', lessons: [['Y', 3, 'It gets very cold in winter.'], ['Y', 4, 'It rained heavily yesterday.']], gram: ['n5', 41, 44], kanji: 11 },
  { id: '1.12', title: 'My Town (E1)', start: '2027-04-29', end: '2027-05-12', lessons: [['Y', 5, 'It is very lively and convenient.'], ['Y', 6, 'Please tell me how to get to the post office.']], gram: ['n5', 45, 48], kanji: 12, extra: [anki('jp-1.12-anki', 'Kaishi 1.480 kartu', '2027-05-31')] },
  { id: '1.13', title: 'Going Out Together (E1)', start: '2027-05-13', end: '2027-05-26', lessons: [['Y', 7, 'I will be a bit late because I got lost.'], ['Y', 8, 'Have you ever played baseball?']], gram: ['n5', 49, 52], kanji: 13 },
  { id: '1.14', title: 'Studying Japanese (E1)', start: '2027-05-27', end: '2027-06-09', lessons: [['Y', 9, 'Will you tell me how to read this?'], ['Y', 10, 'I would like to take a Japanese-language class.']], gram: ['n5', 53, 56], kanji: 14, extra: [anki('jp-1.14-anki', 'Kaishi 1.500 selesai', '2027-06-15')] },
];

const S2: U[] = [
  { id: '2.1', title: 'Delicious Dishes (E1)', start: '2027-07-05', end: '2027-07-18', lessons: [['Y', 11, 'I will bring meat and vegetables.'], ['Y', 12, 'Your bento looks delicious.']], gram: ['n4', 1, 4], extra: [duolingo('jp-2.1-duolingo', 'Section 2 selesai')] },
  { id: '2.2', title: 'Communication at Work (E1)', start: '2027-07-19', end: '2027-08-01', lessons: [['Y', 13, 'It will probably end in about ten minutes.'], ['Y', 14, 'May I take a day off?']], gram: ['n4', 5, 8] },
  { id: '2.3', title: 'Healthy Life (E1)', start: '2027-08-02', end: '2027-08-15', lessons: [['Y', 15, 'I have a fever, and my throat is sore.'], ['Y', 16, 'I try not to eat too much.']], gram: ['n4', 9, 12], note: 'Wisuda bulan Agustus. Mode sibuk boleh dipakai.' },
  { id: '2.4', title: 'Personal Relationships (E1)', start: '2027-08-16', end: '2027-08-29', lessons: [['Y', 17, 'This is a personal amulet my older brother gave me.'], ['Y', 18, 'How about giving something as a gift?']], gram: ['n4', 13, 16], extra: [war('jp-2.4-war', 'WAR: pendaftaran JLPT Desember 2027 (N4)')] },
  { id: '2.5', title: 'People around Me (E2)', start: '2027-08-30', end: '2027-09-08', lessons: [['Z', 1, 'I just came to Japan last week.'], ['Z', 2, 'He looks a serious person.']], gram: ['n4', 17, 20], extra: [talk('jp-2.5-bicara', 'Sesi bicara pertama (italki/teman)')] },
  { id: '2.6', title: 'At a Restaurant (E2)', start: '2027-09-09', end: '2027-09-18', lessons: [['Z', 3, 'I cannot eat it because of an allergy.'], ['Z', 4, 'Please eat it without soy sauce.']], gram: ['n4', 21, 24] },
  { id: '2.7', title: "Let's Go on a Trip (E2)", start: '2027-09-19', end: '2027-09-28', lessons: [['Z', 5, 'You should make a reservation early.'], ['Z', 6, 'I am glad that I went to a lot of different places.']], gram: ['n4', 25, 28] },
  { id: '2.8', title: 'Local Events (E2)', start: '2027-09-29', end: '2027-10-08', lessons: [['Z', 7, 'If it rains, it will be held at the hall.'], ['Z', 8, 'Do you know where the food stands are?']], gram: ['n4', 29, 32] },
  { id: '2.9', title: 'Annual Events and Manners (E2)', start: '2027-10-09', end: '2027-10-18', lessons: [['Z', 9, 'What do people do on Coming-of-Age Day?'], ['Z', 10, 'What kind of clothes should I wear?']], gram: ['n4', 33, 36] },
  { id: '2.10', title: 'Shopping Wisely (E2)', start: '2027-10-19', end: '2027-10-28', lessons: [['Z', 11, 'I forgot to bring my point card.'], ['Z', 12, 'This vacuum cleaner is light and easy to move around.']], gram: ['n4', 37, 40] },
  { id: '2.11', title: 'Various Services (E2)', start: '2027-10-29', end: '2027-11-07', lessons: [['Z', 13, 'They display a lot of materials.'], ['Z', 14, 'Will you cut my bangs a little shorter?']], gram: ['n4', 41, 44], extra: [sim('jp-2.11-sim', 'Simulasi N4 #1 (akhir pekan)')] },
  { id: '2.12', title: 'Nature and Environment (E2)', start: '2027-11-08', end: '2027-11-17', lessons: [['Z', 15, 'The lights in the meeting room were left on.'], ['Z', 16, 'Do not panic in case of an earthquake.']], gram: ['n4', 45, 48] },
  { id: '2.13', title: 'My Life (E2)', start: '2027-11-18', end: '2027-11-27', lessons: [['Z', 17, 'I can speak Japanese better than before.'], ['Z', 18, 'I am thinking about starting my own company in the future.']], gram: ['n4', 49, 52], extra: [sim('jp-2.13-sim', 'Simulasi N4 #2')] },
];

const S3: U[] = [
  { id: '3.1', title: 'Things you like…', start: '2027-12-06', end: '2027-12-19', lessons: [['ZZ', 1, 'What is futsal again?'], ['ZZ', 2, 'I like watching TV dramas the most.']], gram: ['n3', 1, 8], extra: [materi('jp-3.1-baca', 'jp-00-cara-belajar', 'Cara belajar membaca untuk N3', ['6.'])] },
  { id: '3.2', title: 'Where will you live?', start: '2027-12-20', end: '2028-01-02', lessons: [['ZZ', 3, 'How are preparations for your move going?'], ['ZZ', 4, 'It seems like the air conditioner is broken...']], gram: ['n3', 9, 16] },
  { id: '3.3', title: 'Daily meals', start: '2028-01-03', end: '2028-01-16', lessons: [['ZZ', 5, 'What kind of restaurant would be good?'], ['ZZ', 6, 'I cook for myself every day.']], gram: ['n3', 17, 24], extra: [write('jp-3.3-buku', 'Buku N3: mulai bab 1', { subtitle: 'Shin Kanzen Master atau Sou Matome, pilih satu' })] },
  { id: '3.4', title: 'Meeting people', start: '2028-01-17', end: '2028-01-30', lessons: [['ZZ', 7, 'I hope I can become friends with many people.'], ['ZZ', 8, 'May I sit next to you?']], gram: ['n3', 25, 32] },
  { id: '3.5', title: 'Japanese and me', start: '2028-01-31', end: '2028-02-13', lessons: [['ZZ', 9, 'What made you interested in studying Japanese?'], ['ZZ', 10, 'How do you study Japanese?']], gram: ['n3', 33, 40] },
  { id: '3.6', title: 'What do you do in situations like this?', start: '2028-02-14', end: '2028-02-27', lessons: [['ZZ', 11, 'This is a scam email.'], ['ZZ', 12, 'I need an ambulance.']], gram: ['n3', 41, 48] },
  { id: '3.7', title: 'Relationships with others', start: '2028-02-28', end: '2028-03-12', lessons: [['ZZ', 13, 'Congratulations on your marriage.'], ['ZZ', 14, "I'm troubled about a friend."]], gram: ['n3', 49, 56], extra: [war('jp-3.7-war', 'WAR: pendaftaran JLPT Juli 2028 (N3)')] },
  { id: '3.8', title: 'Joys of traveling', start: '2028-03-13', end: '2028-03-26', lessons: [['ZZ', 15, 'I want to see Sakurajima.'], ['ZZ', 16, 'I was able to take lots of good photos.']], gram: ['n3', 57, 64] },
  { id: '3.9', title: 'Working in Japan', start: '2028-03-27', end: '2028-04-09', lessons: [['ZZ', 17, 'I will explain the work of the floor staff.'], ['ZZ', 18, 'I would be happy if you would allow me to work there.']], gram: ['n3', 65, 72] },
];

const reviewGrammar = (id: string, level: GramLevel, to: number): Draft => ({ id, type: 'latihan', title: `Review grammar ${level.toUpperCase()} g01–${gid(to)}`, subtitle: 'Grammar recall dari semua poin', minutes: 15, xp: baseXp('latihan'), required: true, quiz: { kind: 'grammar', level, from: 1, to } });

function section1(): Section {
  const s = 'S1';
  return {
    id: s,
    track: 'jp',
    title: 'N5',
    start: '2026-12-01',
    end: '2027-07-04',
    units: [
      ...S1.map((u) => templUnit(s, u)),
      unit(s, '1.15', 'Persiapan N5', '2027-06-10', '2027-07-04', [
        reviewGrammar('jp-1.15-grammar', 'n5', 56),
        { id: 'jp-1.15-kanji', type: 'latihan', title: 'Review 84 kanji N5', subtitle: 'Sprint dari semua batch', minutes: 10, xp: baseXp('latihan'), required: true, quiz: { kind: 'kanji', batches: Array.from({ length: 14 }, (_, i) => i + 1) } },
        materi('jp-1.15-strategi', 'jp-07-jlpt-strategi', 'Strategi JLPT'),
        video('jp-1.15-video', 'Video: 日本語の森 N5', '日本語の森 N5'),
        sim('jp-1.15-sim1', 'Simulasi 1: contoh soal resmi N5'),
        sim('jp-1.15-sim2', 'Simulasi 2: ber-timer 90 menit', true, { timeLimitS: 90 * 60 }),
        exam('jp-1.15-exam', 'N5', '2027-07-04'),
      ]),
    ],
  };
}

function section2(): Section {
  const s = 'S2';
  return {
    id: s,
    track: 'jp',
    title: 'N4',
    start: '2027-07-05',
    end: '2027-12-05',
    units: [
      ...S2.map((u) => templUnit(s, u)),
      unit(s, '2.14', 'Persiapan N4', '2027-11-28', '2027-12-05', [
        grammar('2.14', 'n4', 53, 60),
        reviewGrammar('jp-2.14-review', 'n4', 60),
        materi('jp-2.14-strategi', 'jp-07-jlpt-strategi', 'Strategi JLPT: fokus N4'),
        video('jp-2.14-video', 'Video: 日本語の森 N4', '日本語の森 N4'),
        sim('jp-2.14-sim', 'Simulasi N4 #3 (ber-timer)', true, { timeLimitS: 115 * 60 }),
        exam('jp-2.14-exam', 'N4', '2027-12-05'),
      ]),
    ],
  };
}

function section3(): Section {
  const s = 'S3';
  return {
    id: s,
    track: 'jp',
    title: 'N3',
    start: '2027-12-06',
    end: '2028-07-02',
    units: [
      ...S3.map((u) => templUnit(s, u)),
      unit(s, '3.10', 'Buku N3 intensif', '2028-04-10', '2028-05-14', [
        reviewGrammar('jp-3.10-review', 'n3', 72),
        write('jp-3.10-buku', 'Buku N3: grammar, kosakata, membaca, choukai', { subtitle: '1 bab per hari kerja', checklist: ['Grammar', 'Kosakata', 'Membaca', 'Choukai (mendengar)'] }),
        video('jp-3.10-video', 'Video: 日本語の森 N3', '日本語の森 N3'),
      ]),
      unit(s, '3.11', 'Simulasi dan strategi', '2028-05-15', '2028-07-02', [
        materi('jp-3.11-strategi', 'jp-07-jlpt-strategi', 'Strategi JLPT: fokus N3'),
        sim('jp-3.11-sim1', 'Simulasi penuh #1', true, { timeLimitS: 140 * 60 }),
        sim('jp-3.11-sim2', 'Simulasi penuh #2', true, { timeLimitS: 140 * 60 }),
        write('jp-3.11-analisis', 'Analisis kesalahan per bagian'),
        sim('jp-3.11-sim3', 'Simulasi penuh #3', true, { timeLimitS: 140 * 60 }),
        sim('jp-3.11-sim4', 'Simulasi penuh #4', true, { timeLimitS: 140 * 60 }),
        exam('jp-3.11-exam', 'N3', '2028-07-02'),
      ]),
    ],
  };
}

function section4(): Section {
  const s = 'S4';
  return {
    id: s,
    track: 'jp',
    title: 'Bahasa Jepang kerja',
    jp: 'ビジネス',
    start: '2028-07-03',
    end: '2028-10-01',
    units: [
      unit(s, '4.1', '敬語 Keigo dasar', '2028-07-03', '2028-07-16', [
        materi('jp-4.1-keigo', 'jp-08-bahasa-kerja', 'Keigo §1–2', ['§1', '§2']),
        { id: 'jp-4.1-kartu', type: 'latihan', title: 'Kartu keigo (尊敬語/謙譲語)', minutes: 20, xp: baseXp('latihan'), required: true },
        talk('jp-4.1-bicara', 'Latihan bicara: menelepon dan menerima tamu'),
      ]),
      unit(s, '4.2', '報連相 Komunikasi kantor', '2028-07-17', '2028-07-30', [
        materi('jp-4.2-horenso', 'jp-08-bahasa-kerja', 'Aisatsu dan 報告・連絡・相談', ['§3']),
        talk('jp-4.2-bicara', 'Simulasi melapor progres'),
      ]),
      unit(s, '4.3', 'Chat dan email kerja', '2028-07-31', '2028-08-13', [
        materi('jp-4.3-chat', 'jp-08-bahasa-kerja', 'Template Slack dan email', ['§4']),
        write('jp-4.3-pesan', 'Tulis 5 pesan kerja, lalu dikoreksi tutor'),
      ]),
      unit(s, '4.4', 'Kosakata IT dan dokumen', '2028-08-14', '2028-08-27', [
        materi('jp-4.4-it', 'jp-08-bahasa-kerja', 'Kosakata kerja engineering', ['§5']),
        { id: 'jp-4.4-kartu', type: 'latihan', title: 'Kartu IT 100 kata', minutes: 20, xp: baseXp('latihan'), required: true },
        write('jp-4.4-atcoder', 'Lintas jalur: baca 3 soal AtCoder dalam bahasa Jepang', { links: [{ label: 'AtCoder', url: 'https://atcoder.jp/contests/' }] }),
      ]),
      unit(s, '4.5', 'Hasil N3 dan rencana N2', '2028-08-28', '2028-08-31', [
        write('jp-4.5-hasil', 'Cek hasil JLPT N3', { links: [{ label: 'jlptonline.or.id', url: 'https://jlptonline.or.id/' }] }),
        write('jp-4.5-n2', 'Rencana N2 (Des 2028 atau Jul 2029)', { subtitle: 'Kalau belum lulus N3: daftar JLPT Des 2028 di Jepang' }),
      ]),
      unit(s, '4.6', 'Persiapan hari pertama', '2028-09-01', '2028-09-30', [
        write('jp-4.6-jikoshokai', 'Jikoshōkai 1 menit, dihafal', { material: { id: 'jp-08-bahasa-kerja', sections: ['§6'] } }),
        write('jp-4.6-offer', 'Baca ulang offer letter MISUMI tanpa terjemahan'),
        { id: 'jp-4.6-misumi', type: 'milestone', milestone: 'misumi', title: 'MISUMI Day 1 (九段下)', subtitle: '1 Oktober 2028', minutes: 0, xp: 300, required: true, date: '2028-10-01' },
      ]),
    ],
  };
}

export const JP_SECTIONS: Section[] = [section0(), section1(), section2(), section3(), section4()];
