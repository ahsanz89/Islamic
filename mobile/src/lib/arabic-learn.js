// Learn Arabic academy: levels, questions and text in English / Urdu. Pure logic (no React) so web and mobile share it.
import DATA from './arabic-data.json';
import { shuffle } from './learn-data';

export const LANGS = { en: { name: 'English', dir: 'ltr' }, ur: { name: 'اردو', dir: 'rtl' } };

export const LEVELS = [
  { n: 1, en: 'Everyday Quran words', ur: 'قرآن کے روزمرہ الفاظ', goalEn: 'Learn 39 words that appear again and again in the Quran, and hear each one recited.', goalUr: 'قرآن میں بار بار آنے والے 39 الفاظ سیکھیں اور ہر ایک کو سنیں۔', minutes: 15 },
  { n: 2, en: 'Words of the prayer (Salah)', ur: 'نماز کے الفاظ', goalEn: 'Understand what you say in Salah: the Takbir, Ruku, Sujud, Salam and more, word by word.', goalUr: 'نماز میں جو پڑھتے ہیں اس کا مطلب سمجھیں: تکبیر، رکوع، سجدہ، سلام اور مزید، لفظ بہ لفظ۔', minutes: 15 },
  { n: 3, en: 'Understand short surahs', ur: 'چھوٹی سورتوں کو سمجھیں', goalEn: 'Read and understand Al-Fatiha, Al-Asr, Al-Kawthar, Al-Ikhlas, Al-Falaq and An-Nas.', goalUr: 'الفاتحہ، العصر، الکوثر، الاخلاص، الفلق اور الناس پڑھیں اور سمجھیں۔', minutes: 20 }
];
export const PASS_MARK = 0.7;

export const T = {
  en: {
    title: 'Learn Arabic', intro: 'Learn the Arabic you hear in the Quran and in prayer: words, meanings and sounds. Free for everyone.', chooseTitle: 'Choose your language', chooseHelp: 'Meanings and help will be shown in this language. You can change it any time.',
    hubLang: 'Language', learn: 'Learn', practice: 'Practice', quiz: 'Quiz', listen: 'Listen', hear: 'Hear', start: 'Start Level 1', cont: (n) => `Continue Level ${n}`, review: 'Review Level 3', level: 'Level', of: 'of', complete: (a, b) => `${a} of ${b} levels complete`,
    locked: 'Locked: pass the previous level to open', unlock: 'I already know this: unlock all levels', passPrev: (n) => `This level opens after you pass the quiz for Level ${n}.`, about: (m) => `About ${m} minutes`,
    meaning: 'Meaning', say: 'Sounds like', whenSaid: 'When it is said', correct: 'Correct. ', wrong: 'Not quite. ', goNext: (n) => `Go to Level ${n}`, nextQ: 'Next question', tryAgain: 'Try again',
    qMeaning: 'What does this word mean?', qWord: 'Which Arabic matches this meaning?', qListen: 'Listen. What does it mean?', qPhrase: 'What does this mean?', qPhraseWord: 'Which Arabic phrase matches this meaning?',
    review_note: 'Meanings written by the app team for beginners. Please have a teacher confirm them.', note3: 'Quran translations come from the app\'s verified translators. Word meanings come from the Quran word-by-word data (English only).',
    pass: 'Level complete. Well done! The next level is now open.', fail: (n) => `You need ${n} correct to pass. Review the lessons, practise, and try again.`, wordsHeading: 'Word by word', verseHeading: 'Verse', quizInfo: (n, best) => `10 questions. Get ${n} right to finish this level${best ? ` · best score ${best}%` : ''}.`,
    seen: (n) => `Heard in the Quran ${n} times`, back: 'Learn Arabic', changeLang: 'Change language', continuePractice: 'Continue to practice', ready: 'Ready for the quiz', resetq: 'Reset progress', tip: 'Tap any word to hear it. Words are recited by the same reciter clips used in the Quran reader.'
  },
  ur: {
    title: 'عربی سیکھیں', intro: 'قرآن اور نماز میں جو عربی سنتے ہیں اسے سیکھیں: الفاظ، مطلب اور آواز۔ سب کے لیے مفت۔', chooseTitle: 'اپنی زبان چنیں', chooseHelp: 'مطلب اور مدد اسی زبان میں دکھائی جائے گی۔ آپ کبھی بھی بدل سکتے ہیں۔',
    hubLang: 'زبان', learn: 'سیکھیں', practice: 'مشق', quiz: 'امتحان', listen: 'سنیں', hear: 'سنیں', start: 'لیول 1 شروع کریں', cont: (n) => `لیول ${n} جاری رکھیں`, review: 'لیول 3 دہرائیں', level: 'لیول', of: 'از', complete: (a, b) => `${b} میں سے ${a} لیول مکمل`,
    locked: 'بند ہے: پچھلا لیول پاس کریں', unlock: 'مجھے یہ آتا ہے: سب لیول کھولیں', passPrev: (n) => `یہ لیول لیول ${n} کا امتحان پاس کرنے کے بعد کھلے گا۔`, about: (m) => `تقریباً ${m} منٹ`,
    meaning: 'مطلب', say: 'تلفظ', whenSaid: 'کب پڑھا جاتا ہے', correct: 'درست۔ ', wrong: 'ٹھیک نہیں۔ ', goNext: (n) => `لیول ${n} پر جائیں`, nextQ: 'اگلا سوال', tryAgain: 'دوبارہ کوشش',
    qMeaning: 'اس لفظ کا مطلب کیا ہے؟', qWord: 'اس مطلب کے لیے کون سا عربی لفظ ہے؟', qListen: 'سنیں۔ اس کا مطلب کیا ہے؟', qPhrase: 'اس کا مطلب کیا ہے؟', qPhraseWord: 'اس مطلب کے لیے کون سی عربی عبارت ہے؟',
    review_note: 'یہ مطلب ایپ ٹیم نے ابتدائی طلبہ کے لیے لکھے ہیں۔ براہِ کرم کسی استاد سے تصدیق کروا لیں۔', note3: 'قرآن کے ترجمے ایپ کے مستند مترجمین سے لیے گئے ہیں۔ الفاظ کے مطلب قرآن کے لفظ بہ لفظ ڈیٹا سے ہیں (صرف انگریزی)۔',
    pass: 'لیول مکمل! شاباش! اگلا لیول کھل گیا ہے۔', fail: (n) => `پاس ہونے کے لیے ${n} درست جوابات چاہییں۔ اسباق دیکھیں، مشق کریں اور دوبارہ کوشش کریں۔`, wordsHeading: 'لفظ بہ لفظ', verseHeading: 'آیت', quizInfo: (n, best) => `10 سوالات۔ یہ لیول مکمل کرنے کے لیے ${n} درست کریں${best ? ` · بہترین نتیجہ ${best}%` : ''}۔`,
    seen: (n) => `قرآن میں ${n} بار آیا`, back: 'عربی سیکھیں', changeLang: 'زبان بدلیں', continuePractice: 'مشق پر جائیں', ready: 'امتحان کے لیے تیار', resetq: 'ترقی صاف کریں', tip: 'کسی بھی لفظ پر ٹیپ کر کے سنیں۔ الفاظ قرآن ریڈر والی تلاوت کی کلپس میں ہیں۔'
  }
};
export const tr = (lang) => T[lang] || T.en;
export const ptext = (o, lang) => (lang === 'ur' && o.ur) || o.en;

/** Items of a level: { id, a (arabic), tl, en, ur, ref, phrase } */
export function itemsOf(level) {
  if (level === 1) return DATA.vocab.flatMap((g) => g.words.map((w, i) => ({ id: `${g.id}${i}`, a: w.a, tl: w.tl, en: w.en, ur: w.ur, ref: w.ref, count: w.count })));
  if (level === 2) return DATA.phrases.map((p) => ({ id: p.id, a: p.ar, tl: p.tl, en: p.en, ur: p.ur, phrase: true }));
  const out = [];
  for (const s of DATA.surahs) for (const v of s.verses) out.push({ id: `${s.n}:${v.v}`, a: v.ar, tl: v.tl, en: v.en, ur: v.ur, phrase: true, verse: true, surah: s });
  return out;
}
/** Single words used by the "word" questions of level 3 (English meaning only). */
export function wordItems3() {
  const out = []; const seen = new Set();
  for (const s of DATA.surahs) for (const v of s.verses) v.words.forEach((w, i) => {
    const k = w.a + w.en; if (seen.has(k) || !w.en) return; seen.add(k);
    out.push({ id: `${s.n}:${v.v}:${i + 1}`, a: w.a, tl: w.tl, en: w.en, ur: null, ref: v.na ? null : [s.n, v.v, i + 1] });
  });
  return out;
}

const keyOf = (it, lang) => ptext(it, lang);
function pickOthers(pool, it, lang, n = 3) {
  const seen = new Set([keyOf(it, lang)]); const out = [];
  for (const o of shuffle(pool)) { const k = keyOf(o, lang); if (seen.has(k) || o.a === it.a) continue; seen.add(k); out.push(o); if (out.length === n) break; }
  return out;
}

/** One random question for a level. gen(level) form is made by makeGen(lang). */
export function question(level, lang = 'en', rnd = Math.random) {
  const t = tr(lang);
  const pool = level === 3 ? wordItems3() : itemsOf(level);
  const it = pool[Math.floor(rnd() * pool.length)];
  const kind = Math.floor(rnd() * 3); // 0 meaning, 1 find the word, 2 listen
  const others = pickOthers(pool, it, lang);
  const phrase = !!it.phrase;
  const audio = it.ref ? { text: it.a, ref: it.ref, label: t.listen } : { text: it.a, id: undefined };
  if (kind === 1) {
    const opts = shuffle([it, ...others]).map((o) => ({ key: o.id, label: o.a, big: true }));
    return { prompt: phrase ? t.qPhraseWord : t.qWord, big: null, text: keyOf(it, lang), options: opts, answer: it.id, explain: `${it.a} = ${keyOf(it, lang)}`, kind: 'word', audio: null, textBig: keyOf(it, lang) };
  }
  const opts = shuffle([it, ...others]).map((o) => ({ key: o.id, label: keyOf(o, lang) }));
  const base = { options: opts, answer: it.id, explain: `${it.a} = ${keyOf(it, lang)}`, kind: kind === 0 ? 'meaning' : 'listen' };
  if (kind === 2) return { ...base, prompt: t.qListen, big: null, audio };
  return { ...base, prompt: phrase ? t.qPhrase : t.qMeaning, big: it.a, audio };
}
export const makeGen = (lang) => (level) => {
  const q = question(level, lang);
  // "find the word" shows the meaning as the big line (not Arabic), so move it into the prompt
  if (q.kind === 'word') return { ...q, prompt: `${q.prompt}  “${q.textBig}”`, big: null };
  return q;
};

export const STORE_KEY = 'dalil.arabic.v1';
