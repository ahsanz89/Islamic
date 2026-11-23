// Letter-by-letter breakdown of a Quranic (Uthmani) word.
//
// Nothing here is guessed. The word text comes from the Quran dataset; it is split with Unicode rules
// (a mark is any combining character, and always belongs to the letter before it), and every name below is the
// standard name of that Unicode character. Letter names and sounds come from the Learn Arabic data
// (src/lib/learn-data.js) so the two features always agree.
//
// What this does NOT do: full Tajweed. It shows what each written sign means and how the letter is read on its own;
// merging (idgham/ikhfa) is only pointed out, never worked out, so listen to the recitation for the exact sound.
import { LETTERS } from './learn-data';

const byId = Object.fromEntries(LETTERS.map((l) => [l.id, l]));
const cp = (s) => s.codePointAt(0);

/* ------------------------------------------------------------------ marks (everything that is NOT a letter) */
// kind: vowel | tanween | sukoon | shadda | dagger | madd | small | stop | zero | meem | annot
// Each entry: name (English), urdu name where the school convention has one, how (plain-language reading).
const M = (kind, name, how, extra = {}) => ({ kind, name, how, ...extra });

export const MARKS = {
  0x064e: M('vowel', 'Fatha (Zabar)', 'A short "a" sound, like the "a" in "about".', { short: 'a', urdu: 'زبر' }),
  0x0650: M('vowel', 'Kasra (Zer)', 'A short "i" sound, like the "i" in "sit".', { short: 'i', urdu: 'زیر' }),
  0x064f: M('vowel', 'Damma (Pesh)', 'A short "u" sound, like the "u" in "put".', { short: 'u', urdu: 'پیش' }),
  0x064b: M('tanween', 'Fathatan (Two Zabar)', 'An "an" sound at the end of a word.', { short: 'an', urdu: 'دو زبر' }),
  0x064d: M('tanween', 'Kasratan (Two Zer)', 'An "in" sound at the end of a word.', { short: 'in', urdu: 'دو زیر' }),
  0x064c: M('tanween', 'Dammatan (Two Pesh)', 'An "un" sound at the end of a word.', { short: 'un', urdu: 'دو پیش' }),
  0x08f0: M('tanween', 'Fathatan, open form', 'An "an" sound. The open (side-by-side) form is used in the Madinah script when the nun sound joins the next letter instead of being said clearly (idgham, ikhfa or iqlab).', { short: 'an', urdu: 'دو زبر', open: true }),
  0x08f2: M('tanween', 'Kasratan, open form', 'An "in" sound. The open form means the nun sound joins the next letter instead of being said clearly.', { short: 'in', urdu: 'دو زیر', open: true }),
  0x08f1: M('tanween', 'Dammatan, open form', 'An "un" sound. The open form means the nun sound joins the next letter instead of being said clearly.', { short: 'un', urdu: 'دو پیش', open: true }),
  0x06e1: M('sukoon', 'Sukoon', 'No vowel: the letter is said on its own and joins the letter that follows. (The Uthmani script writes it as a small head of khaa.)', { urdu: 'جزم' }),
  0x0652: M('sukoon', 'Sukoon', 'No vowel: the letter is said on its own and joins the letter that follows.', { urdu: 'جزم' }),
  0x0651: M('shadda', 'Shaddah', 'The letter is doubled: said twice, the first time with no vowel and the second with the vowel written with it.', { urdu: 'تشدید' }),
  0x0670: M('dagger', 'Alif Khanjariyah (small Alif)', 'A small alif above the letter. It lengthens the vowel into a long "aa", just as a full alif would.', { urdu: 'کھڑا زبر', long: 'aa' }),
  0x06e4: M('madd', 'Maddah (wavy madd sign)', 'Madd: hold the long vowel of this letter longer than normal (at least two counts).', { urdu: 'مد' }),
  0x0653: M('madd', 'Maddah above', 'Madd: hold the long vowel longer than normal.', { urdu: 'مد' }),
  0x06e5: M('small', 'Small Waw', 'A small "w" written above: the vowel before it is stretched into a long "oo".', { long: 'oo' }),
  0x06e6: M('small', 'Small Yaa', 'A small "y" written above: the vowel before it is stretched into a long "ee".', { long: 'ee' }),
  0x06e7: M('small', 'Small high Yaa', 'A small "y" above the letter: a "ee" sound is read here.', { long: 'ee' }),
  0x08f3: M('small', 'Small high Waw', 'A small "w" above the letter: an "oo" sound is read here.', { long: 'oo' }),
  0x06df: M('zero', 'Small rounded zero', 'This letter is written but NOT pronounced, neither when continuing nor when stopping.'),
  0x06e0: M('zero', 'Small upright zero', 'This letter is written but NOT pronounced when you continue reading; it is read only when you stop on the word.'),
  0x06e2: M('meem', 'Small high Meem (Iqlab)', 'The nun sound changes into a hidden "m" sound before the letter Baa (iqlab).'),
  0x06ed: M('meem', 'Small low Meem (Iqlab)', 'The nun sound changes into a hidden "m" sound before the letter Baa (iqlab).'),
  0x06d6: M('stop', 'Stop sign: Sala (ۖ)', 'You may stop here, but continuing is preferred.'),
  0x06d7: M('stop', 'Stop sign: Qala (ۗ)', 'You may continue here, but stopping is preferred.'),
  0x06d8: M('stop', 'Stop sign: Meem (ۘ)', 'A required stop (waqf lazim): stop here.'),
  0x06da: M('stop', 'Stop sign: Jeem (ۚ)', 'Stopping or continuing are both allowed here.'),
  0x06db: M('stop', 'Stop sign: three dots (ۛ)', 'The "embracing" stop: stop at one of the two places marked with three dots, not both.'),
  0x06dc: M('stop', 'Stop sign: Seen (ۜ)', 'A short pause without taking a breath (saktah).'),
  0x06e3: M('annot', 'Small low Seen', 'A Quranic annotation: the Seen here is read as a Saad (sad) sound in this word.'),
  0x06e8: M('annot', 'Small high Noon', 'A Quranic annotation for a hidden noon sound.'),
  0x06ea: M('annot', 'Empty-centre low stop', 'A Quranic annotation sign: it marks a special way of reading the word (ishmam/imalah).'),
  0x06eb: M('annot', 'Empty-centre high stop', 'A Quranic annotation sign: it marks a special way of reading the word (ishmam/imalah).'),
  0x06ec: M('annot', 'Rounded high stop with filled centre', 'A Quranic annotation sign: it marks a special way of reading the word (imalah).'),
  0x06e9: M('annot', 'Place of Sajdah', 'A prostration is made here.'),
  0x0305: M('annot', 'Overline', 'A text annotation in this word. It does not change the letters.'),
  0x0654: M('hamza', 'Hamza above', 'A glottal stop sound (a tiny catch in the throat).'),
  0x0655: M('hamza', 'Hamza below', 'A glottal stop sound (a tiny catch in the throat).')
};

export const isMark = (ch) => {
  const c = cp(ch);
  if (MARKS[c]) return true;
  // any other combining character (Arabic extended marks included) is a mark too: it never starts a new letter
  return /\p{M}/u.test(ch) || c === 0x06e5 || c === 0x06e6;
};

/* ------------------------------------------------------------------ base letters */
// codepoint -> { id (learn-data letter), name, sound, note }
const L = (id, over = {}) => ({ id, ...over });
const BASE = {
  0x0627: L('alif'), 0x0628: L('ba'), 0x062a: L('ta'), 0x062b: L('tha'), 0x062c: L('jeem'), 0x062d: L('haa'), 0x062e: L('khaa'),
  0x062f: L('dal'), 0x0630: L('dhal'), 0x0631: L('ra'), 0x0632: L('zay'), 0x0633: L('seen'), 0x0634: L('sheen'), 0x0635: L('sad'),
  0x0636: L('dad'), 0x0637: L('taa'), 0x0638: L('zaa'), 0x0639: L('ain'), 0x063a: L('ghain'), 0x0641: L('fa'), 0x0642: L('qaf'),
  0x0643: L('kaf'), 0x0644: L('lam'), 0x0645: L('meem'), 0x0646: L('noon'), 0x0647: L('ha'), 0x0648: L('waw'), 0x064a: L('ya'), 0x06cc: L('ya'),
  0x0621: L('hamza'),
  0x0623: L('hamza', { name: 'Hamza on Alif', form: 'Hamza above Alif', note: 'A glottal stop (a tiny catch in the throat) with a vowel.' }),
  0x0625: L('hamza', { name: 'Hamza under Alif', form: 'Hamza below Alif', note: 'A glottal stop (a tiny catch in the throat) with a vowel.' }),
  0x0624: L('hamza', { name: 'Hamza on Waw', form: 'Waw with Hamza', note: 'A glottal stop, written on a Waw.' }),
  0x0626: L('hamza', { name: 'Hamza on Yaa', form: 'Yaa with Hamza', note: 'A glottal stop, written on a Yaa.' }),
  0x0629: L('ta', { name: 'Taa Marbuta', form: 'Taa Marbuta', sound: 't', note: 'The round Taa at the end of a word. It sounds like "t" when the word continues and "h" when you stop on it.' }),
  0x0649: L('alif', { name: 'Alif Maqsura', form: 'Alif Maqsura', sound: 'aa', note: 'Looks like a Yaa without dots but is read as a long "aa".' }),
  0x0671: L('alif', { name: 'Alif Wasla (Hamzatul Wasl)', form: 'Alif Wasla (ٱ)', sound: '', silent: true, note: 'The connecting Alif. It is pronounced only if you start reading on it; when you continue from the word before, it is silent.' })
};
const ARABIC_LETTER = /[ء-غف-يٱ-ۓ]/u;
export const isLetter = (ch) => !isMark(ch) && (BASE[cp(ch)] !== undefined || ARABIC_LETTER.test(ch));

export function letterInfo(ch) {
  const b = BASE[cp(ch)];
  if (!b) return { ch, name: 'Arabic letter', sound: '', how: '', id: '', known: false };
  const l = byId[b.id];
  return {
    ch, id: b.id, known: true,
    name: b.name || l.name.replace(/ \(.*\)$/, ''),
    fullName: b.name || l.name,
    arName: l.arName,
    sound: b.sound !== undefined ? b.sound : l.sound,
    how: b.note || l.how,
    mouth: l.mouth,
    silent: !!b.silent,
    form: b.form || ''
  };
}

/* ------------------------------------------------------------------ segmentation */
/**
 * Splits a word into letter clusters: [{ ch, marks: [{ch, ...MARKS entry}], ...}].
 * A mark always belongs to the letter before it. A word that starts with a mark (never happens in the Quran data)
 * keeps those marks on an empty cluster instead of dropping them.
 */
export function segment(word) {
  const out = [];
  for (const ch of Array.from(word || '')) {
    if (ch === 'ـ') { // tatweel (kashida) is only a stretched joining stroke, never a letter
      if (out.length) out[out.length - 1].stretch = true;
      continue;
    }
    if (isMark(ch)) {
      const m = MARKS[cp(ch)] || M('annot', 'Quranic sign', 'A Quranic annotation sign.');
      if (!out.length) out.push({ ch: '', marks: [] });
      out[out.length - 1].marks.push({ ch, code: cp(ch), ...m });
    } else out.push({ ch, marks: [] });
  }
  return out;
}

const has = (c, kind) => c.marks.some((m) => m.kind === kind);
const get = (c, kind) => c.marks.find((m) => m.kind === kind);
const vowelOf = (c) => get(c, 'vowel') || get(c, 'tanween');
const isCarrier = (ch) => ch === 'ا' || ch === 'ٱ' || ch === 'و' || ch === 'ي' || ch === 'ی' || ch === 'ى';

/**
 * Full breakdown of one word. Each cluster gets:
 *  letter   - standard letter info (name, sound)
 *  marks    - its signs, each with a plain-language explanation
 *  sound    - how the letter and its signs read together, as a short romanised syllable (null when it is silent or merged)
 *  role     - 'consonant' | 'long-vowel' | 'silent' | 'merged' | 'madd' | 'carrier'
 *  syllableAr - the letter with only its vowel / sukoon / shadda, for the teaching recording (null when none fits)
 *  notes    - extra plain-language sentences
 */
export function breakdown(word) {
  const cl = segment(word);
  return cl.map((c, i) => {
    const letter = letterInfo(c.ch);
    const prev = cl[i - 1];
    const next = cl[i + 1];
    const v = vowelOf(c);
    const shadda = has(c, 'shadda');
    const dagger = get(c, 'dagger');
    const small = get(c, 'small');
    const zero = get(c, 'zero');
    const notes = [];
    let role = 'consonant';
    let sound = null;

    const long = (dagger && dagger.long) || (small && small.long) || null;
    const pv = prev && vowelOf(prev);
    const carriesLong = isCarrier(c.ch) && !v && !shadda && !has(c, 'sukoon');
    const matches = pv && ((pv.short === 'a' && (c.ch === 'ا' || c.ch === 'ى')) || (pv.short === 'u' && c.ch === 'و') || (pv.short === 'i' && (c.ch === 'ي' || c.ch === 'ی')));
    const prevLong = prev && (get(prev, 'dagger') || get(prev, 'small'));

    if (!c.ch) role = 'carrier';
    else if (letter.silent) { role = 'silent'; notes.push(letter.how); }
    else if (zero) { role = 'silent'; notes.push(zero.how); }
    else if (carriesLong && (matches || prevLong)) {
      role = 'long-vowel';
      const lv = c.ch === 'و' ? 'oo' : c.ch === 'ا' || c.ch === 'ى' ? 'aa' : 'ee';
      sound = lv;
      notes.push(`This ${letter.name} is not a consonant here. It stretches the vowel before it into a long "${lv}" (a natural madd).`);
    } else if (carriesLong && c.ch === 'ا') {
      role = 'long-vowel'; sound = 'aa';
      notes.push('Alif with no sign of its own lengthens the vowel before it.');
    } else {
      // an ordinary letter
      const base = letter.sound || '';
      let tail = '';
      if (v) tail = v.short;
      if (long) tail = tail.replace(/[aiu]$/, '') + long; // vowel + small alif/waw/yaa written on it = long vowel
      if (long && !v) tail = long;
      sound = base + (shadda ? base : '') + tail;
      if (!v && !long && !has(c, 'sukoon') && !shadda && next && has(next, 'shadda') && !isCarrier(c.ch)) {
        role = 'merged'; sound = null;
        notes.push(`${letter.name} has no sign and the next letter carries a Shaddah: its sound merges into that letter (idgham, for example the Laam of "Al" before a sun letter). Listen to the recitation for the exact sound.`);
      } else if (!v && !long && !has(c, 'sukoon') && !shadda && !isCarrier(c.ch)) {
        if (!next) { sound = base; } else { notes.push('No vowel sign is written here, so its sound follows the word\'s recitation.'); sound = base; }
      }
      if ((c.ch === 'و' || c.ch === 'ی' || c.ch === 'ي') && has(c, 'sukoon') && pv && ((pv.short === 'a'))) {
        role = 'consonant'; sound = pv.short === 'a' && c.ch === 'و' ? 'w (as in "aw")' : 'y (as in "ay")';
        notes.push(`With Sukoon after a Fatha this ${letter.name} makes a gliding vowel sound ("${c.ch === 'و' ? 'aw' : 'ay'}"), called a soft madd.`);
      }
    }
    if (c.marks.some((m) => m.kind === 'madd')) notes.push('Madd sign: hold this sound longer than a normal vowel.');

    // a recording-friendly syllable: letter + only its vowel/sukoon/shadda (no stop signs, small letters or annotations)
    let syllableAr = null;
    if (c.ch && role === 'consonant') {
      const keep = c.marks.filter((m) => ['vowel', 'tanween', 'sukoon', 'shadda'].includes(m.kind)).map((m) => m.ch);
      const bare = c.ch === 'ی' ? 'ي' : c.ch;
      const order = keep.sort((a, b) => (a === 'ّ' ? -1 : b === 'ّ' ? 1 : 0)); // shadda first, as in the written order
      syllableAr = keep.length ? bare + order.join('') : null;
    }
    return { ...c, i, letter, sound, role, notes, syllableAr, hasMarks: c.marks.length > 0 };
  });
}

/** The letters of a word as "ا + ل + ح + م + د" (base letters only, no signs). */
export const lettersLine = (word) => segment(word).filter((c) => c.ch).map((c) => c.ch).join(' + ');

/** Unicode-safe sanity check used in tests: the clusters, joined back together, give exactly the original word (tatweel aside). */
export const rebuild = (word) => segment(word).map((c) => c.ch + c.marks.map((m) => m.ch).join('')).join('');

/** What one letter sounds like with each of the main signs, for the "try the marks" practice strip. */
export const SIGN_PRACTICE = [
  { id: 'fatha', mark: 'َ', label: 'Zabar (Fatha)', short: 'a' },
  { id: 'kasra', mark: 'ِ', label: 'Zer (Kasra)', short: 'i' },
  { id: 'damma', mark: 'ُ', label: 'Pesh (Damma)', short: 'u' },
  { id: 'sukoon', mark: 'ْ', label: 'Sukoon', short: '' },
  { id: 'shadda', mark: 'ّ', label: 'Shaddah (with Zabar)', short: 'double', extra: 'َ' },
  { id: 'fathatan', mark: 'ً', label: 'Two Zabar', short: 'an' },
  { id: 'kasratan', mark: 'ٍ', label: 'Two Zer', short: 'in' },
  { id: 'dammatan', mark: 'ٌ', label: 'Two Pesh', short: 'un' }
];
export function practiceRows(ch) {
  const info = letterInfo(ch);
  const s = info.sound || '';
  const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
  const bare = ch === 'ی' ? 'ي' : ch;
  return SIGN_PRACTICE.map((p) => ({
    ...p,
    ar: bare + (p.id === 'shadda' ? p.mark + p.extra : p.mark),
    roman: p.id === 'shadda' ? cap(s + s + 'a') : p.id === 'sukoon' ? `${cap(s)} (no vowel)` : cap(s + p.short)
  }));
}
