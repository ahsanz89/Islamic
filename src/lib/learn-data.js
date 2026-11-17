// Curriculum data for the Quran Learning Academy (Learn Quran).
// Every Arabic string is written with full vowel marks so it can be read exactly as shown.

const ZWJ = '‍';
export const FATHA = 'َ', KASRA = 'ِ', DAMMA = 'ُ', SUKOON = 'ْ';
export const FATHATAN = 'ً', KASRATAN = 'ٍ', DAMMATAN = 'ٌ';

// id, ar, Arabic name, English name, English sound (roman), simple guidance, Urdu-script name, Roman Urdu hint, mouth position,
// connects (joins to the following letter), example word [ar, roman, meaning], dots description (helps tell look-alikes apart)
const L = (id, ar, arName, name, sound, how, ur, ru, mouth, connects, ex, dots) => ({ id, ar, arName, name, sound, how, ur, ru, mouth, connects, ex, dots });

export const LETTERS = [
  L('alif', 'ا', 'أَلِف', 'Alif', 'aa', 'A tall straight stroke. It carries a long "aa" sound and is the seat for other vowels.', 'الف', 'Alif seedha khara line hai; "aa" ki lambi awaaz deta hai.', 'Open mouth, sound flows from the chest.', false, ['أَسَد', 'asad', 'lion'], 'one straight stroke, no dots'),
  L('ba', 'ب', 'بَاء', 'Ba', 'b', 'Like the "b" in "book". Close both lips, then release.', 'با', 'Dono hont milakar "b" ki awaaz.', 'Both lips close and open.', true, ['بَاب', 'baab', 'door'], 'one dot below'),
  L('ta', 'ت', 'تَاء', 'Ta', 't', 'Like the "t" in "tea", with the tongue tip touching the back of the upper front teeth.', 'تا', 'Zabaan ki nok oopar ke daanton se, halki "t".', 'Tongue tip against the upper front teeth.', true, ['تُفَّاح', 'tuffaah', 'apple'], 'two dots above'),
  L('tha', 'ث', 'ثَاء', 'Tha', 'th', 'Like "th" in "think". Put the tongue tip lightly between the teeth and blow air.', 'ثا', 'Zabaan daanton ke beech, "th" (think) jaisi hawa wali awaaz.', 'Tongue tip between the teeth.', true, ['ثَعْلَب', 'thaʿlab', 'fox'], 'three dots above'),
  L('jeem', 'ج', 'جِيم', 'Jeem', 'j', 'Like the "j" in "jam".', 'جیم', 'English ke "j" jaisi.', 'Middle of the tongue touches the roof of the mouth.', true, ['جَمَل', 'jamal', 'camel'], 'one dot inside the belly'),
  L('haa', 'ح', 'حَاء', 'Haa (heavy h)', 'ḥ', 'A soft, breathy "h" made deep in the throat, as if fogging a mirror. Not the same as the light h (ه).', 'حا', 'Gale ke beech se, saans ke saath dabi hui "h".', 'Middle of the throat.', true, ['حِصَان', 'ḥiṣaan', 'horse'], 'no dot'),
  L('khaa', 'خ', 'خَاء', 'Khaa', 'kh', 'Like the "ch" in Scottish "loch": a rough sound from the back of the throat.', 'خا', 'Gale ke peechhe se khurdari "kh" (jaise "khabar").', 'Back of the throat, near the top.', true, ['خُبْز', 'khubz', 'bread'], 'one dot above'),
  L('dal', 'د', 'دَال', 'Daal', 'd', 'Like the "d" in "door".', 'دال', 'English ke "d" jaisi, zabaan ki nok oopar ke daanton ke paas.', 'Tongue tip touches the gum behind the upper teeth.', false, ['دَجَاجَة', 'dajaajah', 'hen'], 'no dot'),
  L('dhal', 'ذ', 'ذَال', 'Zaal', 'dh', 'Like "th" in "this". The tongue tip rests between the teeth and the voice hums.', 'ذال', '"This" ke "th" jaisi, awaaz ke saath.', 'Tongue tip between the teeth.', false, ['ذُرَة', 'dhurah', 'corn'], 'one dot above'),
  L('ra', 'ر', 'رَاء', 'Raa', 'r', 'A rolled "r": tap the tongue tip once on the roof of the mouth.', 'را', 'Zabaan ko halka sa ghuma kar "r".', 'Tongue tip taps the roof of the mouth.', false, ['رَجُل', 'rajul', 'man'], 'no dot'),
  L('zay', 'ز', 'زَاي', 'Zay', 'z', 'Like the "z" in "zoo".', 'زے', 'English ke "z" jaisi.', 'Tongue behind the lower front teeth, voiced buzz.', false, ['زَهْرَة', 'zahrah', 'flower'], 'one dot above'),
  L('seen', 'س', 'سِين', 'Seen', 's', 'Like the "s" in "sun".', 'سین', 'English ke "s" jaisi.', 'Air hisses between the teeth.', true, ['سَمَك', 'samak', 'fish'], 'no dot'),
  L('sheen', 'ش', 'شِين', 'Sheen', 'sh', 'Like "sh" in "shoe".', 'شین', 'English ke "sh" jaisi.', 'Tongue rises toward the middle of the mouth.', true, ['شَمْس', 'shams', 'sun'], 'three dots above'),
  L('sad', 'ص', 'صَاد', 'Saad (heavy s)', 'ṣ', 'A deep, heavy "s". Pull the back of the tongue up and say "s" with a full, round mouth.', 'صاد', 'Moti, bhari hui "s" (jaise "sabr" mein).', 'Tongue tip near the teeth, back of the tongue raised.', true, ['صَقْر', 'ṣaqr', 'falcon'], 'no dot'),
  L('dad', 'ض', 'ضَاد', 'Daad (heavy d)', 'ḍ', 'A deep, heavy "d" made from the side of the tongue. It is special to Arabic.', 'ضاد', 'Moti, bhari hui "d" (jaise "zarb" mein).', 'Side of the tongue against the upper molars.', true, ['ضِفْدَع', 'ḍifḍaʿ', 'frog'], 'one dot above'),
  L('taa', 'ط', 'طَاء', 'Taa (heavy t)', 'ṭ', 'A deep, heavy "t". Raise the back of the tongue and keep the mouth round.', 'طا', 'Moti, bhari hui "t" (jaise "tair" mein).', 'Tongue tip on the gum, back of tongue raised.', true, ['طَائِر', 'ṭaaʾir', 'bird'], 'no dot'),
  L('zaa', 'ظ', 'ظَاء', 'Zaa (heavy dh)', 'ẓ', 'A deep, heavy "th" as in "this". Tongue tip between the teeth, back of the tongue raised.', 'ظا', 'Moti, bhari hui "z/th" (zaal jaisi lekin bhari).', 'Tongue tip between the teeth, back raised.', true, ['ظَرْف', 'ẓarf', 'envelope'], 'one dot above'),
  L('ain', 'ع', 'عَيْن', 'Ain', 'ʿ', 'A deep, squeezed sound from the middle of the throat. There is no English equivalent; listen and imitate.', 'عین', 'Gale ko dabakar nikalne wali gehri awaaz.', 'Throat tightens in the middle.', true, ['عَيْن', 'ʿayn', 'eye'], 'no dot'),
  L('ghain', 'غ', 'غَيْن', 'Ghain', 'gh', 'Like a soft gargle, similar to the French "r".', 'غین', 'Gargle jaisi, gale ke peechhe se "gh".', 'Back of the throat.', true, ['غُرَاب', 'ghuraab', 'crow'], 'one dot above'),
  L('fa', 'ف', 'فَاء', 'Faa', 'f', 'Like the "f" in "fish". Touch the upper teeth to the lower lip.', 'فا', 'English ke "f" jaisi.', 'Upper teeth touch the lower lip.', true, ['فِيل', 'feel', 'elephant'], 'one dot above'),
  L('qaf', 'ق', 'قَاف', 'Qaaf', 'q', 'A deep "k" from the very back of the tongue, near the throat.', 'قاف', 'Gehri "q", zabaan ke bilkul peechhle hisse se.', 'Back of the tongue touches the soft palate.', true, ['قَمَر', 'qamar', 'moon'], 'two dots above'),
  L('kaf', 'ك', 'كَاف', 'Kaaf', 'k', 'Like the "k" in "kite", lighter than Qaaf.', 'کاف', 'English ke "k" jaisi, qaaf se halki.', 'Back of the tongue, further forward than Qaaf.', true, ['كِتَاب', 'kitaab', 'book'], 'no dot (a small slanted mark)'),
  L('lam', 'ل', 'لَام', 'Laam', 'l', 'Like the "l" in "lamp".', 'لام', 'English ke "l" jaisi.', 'Tongue tip touches the gum behind the upper teeth.', true, ['لَيْمُون', 'laymoon', 'lemon'], 'no dot'),
  L('meem', 'م', 'مِيم', 'Meem', 'm', 'Like the "m" in "moon". Close the lips.', 'میم', 'Dono hont milakar "m".', 'Both lips close.', true, ['مَاء', 'maaʾ', 'water'], 'no dot'),
  L('noon', 'ن', 'نُون', 'Noon', 'n', 'Like the "n" in "noon".', 'نون', 'English ke "n" jaisi.', 'Tongue tip touches the gum behind the upper teeth.', true, ['نَجْم', 'najm', 'star'], 'one dot above'),
  L('waw', 'و', 'وَاو', 'Wao', 'w', 'Like the "w" in "water". Round the lips.', 'واؤ', 'English ke "w" jaisi, hont gol karke.', 'Lips rounded.', false, ['وَرْدَة', 'wardah', 'rose'], 'no dot'),
  L('ha', 'ه', 'هَاء', 'Haa (light h)', 'h', 'A light "h" as in "hat", from the top of the throat.', 'ہا', 'Halki "h", English ke "h" jaisi.', 'Top of the throat.', true, ['هِلَال', 'hilaal', 'crescent'], 'no dot'),
  L('hamza', 'ء', 'هَمْزَة', 'Hamza', 'ʾ', 'A short catch of the breath, like the pause in "uh-oh". It is a tiny stop in the throat.', 'ہمزہ', 'Gale mein saans ka halka sa rukna.', 'Throat closes briefly.', false, ['سَمَاء', 'samaaʾ', 'sky'], 'looks like a tiny head of the letter ع'),
  L('ya', 'ي', 'يَاء', 'Yaa', 'y', 'Like the "y" in "yes".', 'یا', 'English ke "y" jaisi.', 'Middle of the tongue rises toward the roof of the mouth.', true, ['يَد', 'yad', 'hand'], 'two dots below')
];
export const LETTER = Object.fromEntries(LETTERS.map((l) => [l.id, l]));

/** The four positional forms of a letter. Non-joining letters look the same at the start as when alone. */
export function forms(l) {
  const c = l.ar;
  if (!l.connects) return { iso: c, ini: c, med: c + '', fin: c, joins: false };
  return { iso: c, ini: c + ZWJ, med: ZWJ + c + ZWJ, fin: ZWJ + c, joins: true };
}
export const NON_JOINERS = LETTERS.filter((l) => !l.connects && l.id !== 'hamza');

/** Groups of letters that look alike; used for the "spot the difference" drill. */
export const LOOKALIKES = [
  ['ba', 'ta', 'tha', 'noon', 'ya'],
  ['jeem', 'haa', 'khaa'],
  ['dal', 'dhal'],
  ['ra', 'zay'],
  ['seen', 'sheen'],
  ['sad', 'dad'],
  ['taa', 'zaa'],
  ['ain', 'ghain'],
  ['fa', 'qaf']
];

// Consonant sound used when building syllables (hamza carried on alif).
const SYL = {};
for (const l of LETTERS) SYL[l.id] = l.sound;
SYL.alif = 'ʾ';
export const SYLLABLE_LETTERS = LETTERS.filter((l) => l.id !== 'alif' && l.id !== 'hamza' && l.id !== 'waw' && l.id !== 'ya')
  .concat(LETTERS.filter((l) => l.id === 'waw' || l.id === 'ya'));
const base = (l) => (l.id === 'hamza' ? 'أ' : l.ar);

export const VOWELS = [
  { id: 'fatha', mark: FATHA, name: 'Fatha (Zabar)', short: 'a', urdu: 'زبر', ru: 'Zabar: harf ke oopar ka nishaan, "a" ki awaaz.', how: 'A small slanted stroke above the letter. It adds a short "a" sound, like the "a" in "cat".' },
  { id: 'kasra', mark: KASRA, name: 'Kasra (Zer)', short: 'i', urdu: 'زیر', ru: 'Zer: harf ke neeche ka nishaan, "i" ki awaaz.', how: 'A small slanted stroke below the letter. It adds a short "i" sound, like the "i" in "sit".' },
  { id: 'damma', mark: DAMMA, name: 'Damma (Pesh)', short: 'u', urdu: 'پیش', ru: 'Pesh: harf ke oopar chhota "wao", "u" ki awaaz.', how: 'A tiny "waw" shape above the letter. It adds a short "u" sound, like the "u" in "put".' }
];
export const TANWEEN = [
  { id: 'fathatan', mark: FATHATAN, name: 'Double Fatha (Fathatan)', ending: 'an', ru: 'Do zabar: "an" ki awaaz.', how: 'Two stacked slanted strokes. The letter ends with an "an" sound.' },
  { id: 'kasratan', mark: KASRATAN, name: 'Double Kasra (Kasratan)', ending: 'in', ru: 'Do zer: "in" ki awaaz.', how: 'Two stacked strokes below the letter. The letter ends with an "in" sound.' },
  { id: 'dammatan', mark: DAMMATAN, name: 'Double Damma (Dammatan)', ending: 'un', ru: 'Do pesh: "un" ki awaaz.', how: 'Two tiny waw shapes above the letter. The letter ends with an "un" sound.' }
];

export const syllable = (l, v) => ({ ar: base(l) + v.mark, roman: (l.id === 'hamza' ? 'ʾ' : SYL[l.id]) + v.short });
export const sukoonForm = (a, b, v) => {
  const x = syllable(a, v), y = b;
  return { ar: x.ar + y.ar + SUKOON, roman: x.roman + SYL[y.id] };
};

export const SUKOON_WORDS = [
  ['بَحْر', 'baḥr', 'sea'], ['نَهْر', 'nahr', 'river'], ['قَلْب', 'qalb', 'heart'], ['عِلْم', 'ʿilm', 'knowledge'],
  ['كَلْب', 'kalb', 'dog'], ['شَمْس', 'shams', 'sun'], ['نَجْم', 'najm', 'star'], ['خُبْز', 'khubz', 'bread'],
  ['بَدْر', 'badr', 'full moon'], ['رُمْح', 'rumḥ', 'spear'], ['سَهْل', 'sahl', 'easy'], ['فَجْر', 'fajr', 'dawn']
];

export const LONG_VOWELS = [
  { ar: 'بَا', roman: 'baa', rule: 'Fatha + Alif (ا) = long "aa"' },
  { ar: 'بِي', roman: 'bee', rule: 'Kasra + Yaa (ي) = long "ee"' },
  { ar: 'بُو', roman: 'boo', rule: 'Damma + Wao (و) = long "oo"' }
];

export const SHORT_WORDS = [
  ['أَب', 'ab', 'father'], ['أَخ', 'akh', 'brother'], ['يَد', 'yad', 'hand'], ['دَم', 'dam', 'blood'], ['فَم', 'fam', 'mouth'],
  ['مَنْ', 'man', 'who'], ['عَنْ', 'ʿan', 'from / about'], ['لَمْ', 'lam', 'did not'], ['قَدْ', 'qad', 'indeed'], ['هَلْ', 'hal', 'is it? (question)'],
  ['بَلْ', 'bal', 'rather'], ['لَنْ', 'lan', 'will never'], ['كَمْ', 'kam', 'how many'], ['مِنْ', 'min', 'from'], ['فِي', 'fee', 'in'],
  ['لَا', 'laa', 'no'], ['مَا', 'maa', 'what'], ['بَاب', 'baab', 'door'], ['نُور', 'noor', 'light'], ['فِيل', 'feel', 'elephant'],
  ['مَاء', 'maaʾ', 'water'], ['بَيْت', 'bayt', 'house'], ['قَلَم', 'qalam', 'pen'], ['كَتَبَ', 'kataba', 'he wrote'], ['ذَهَبَ', 'dhahaba', 'he went'],
  ['جَلَسَ', 'jalasa', 'he sat'], ['فَتَحَ', 'fataḥa', 'he opened'], ['نَصَرَ', 'naṣara', 'he helped'], ['عَلِمَ', 'ʿalima', 'he knew'],
  ['سَمِعَ', 'samiʿa', 'he heard'], ['حَمِدَ', 'ḥamida', 'he praised'], ['كَرُمَ', 'karuma', 'he was generous']
];
export const COMBOS = [
  ['بَتَ', 'bata'], ['كَتَ', 'kata'], ['مَلَ', 'mala'], ['نَصَ', 'naṣa'], ['سَمِ', 'sami'], ['جَلِ', 'jali'], ['فَتُ', 'fatu'], ['قَدُ', 'qadu'], ['رِبَ', 'riba'], ['دُمِ', 'dumi'], ['هَدَ', 'hada'], ['لَبِ', 'labi']
];

export const LEVELS = [
  { n: 1, id: 'alphabet', title: 'The Arabic Alphabet', ur: 'حروفِ تہجی', goal: 'Meet all 29 letters: name, sound, and how to tell look-alikes apart.', minutes: 60 },
  { n: 2, id: 'forms', title: 'Letter Forms', ur: 'حروف کی شکلیں', goal: 'See how each letter changes at the start, middle and end of a word.', minutes: 30 },
  { n: 3, id: 'harakaat', title: 'Short Vowels (Harakaat)', ur: 'حرکات', goal: 'Read any letter with Fatha, Kasra and Damma.', minutes: 40 },
  { n: 4, id: 'tanween', title: 'Tanween', ur: 'تنوین', goal: 'Read double vowels that end in -an, -in, -un.', minutes: 20 },
  { n: 5, id: 'sukoon', title: 'Sukoon (Jazm)', ur: 'سکون / جزم', goal: 'Stop a letter without a vowel and read joined sounds.', minutes: 25 },
  { n: 6, id: 'words', title: 'Combining Letters and Reading Words', ur: 'حروف ملانا اور الفاظ پڑھنا', goal: 'Join letters into syllables, then read short real words.', minutes: 60 }
];
export const PASS_MARK = 0.7;

/* ---------- helpers for quizzes ---------- */
export const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
export const pick = (a, n) => shuffle(a).slice(0, n);
const options = (correct, pool, n = 4) => shuffle([correct, ...pick(pool.filter((x) => x.key !== correct.key), n - 1)]);

/** Build one question for a level. Question: { prompt, big?, audio?, options:[{key,label,big?}], answer, explain } */
export function question(level) {
  const lt = pick(LETTERS.filter((l) => l.id !== 'hamza'), 1)[0];
  const letOpt = (l) => ({ key: l.id, label: l.ar, big: true });
  if (level === 1) {
    const kind = Math.floor(Math.random() * 4);
    if (kind === 0) { // listen and pick the letter
      const pool = LETTERS.map(letOpt);
      return { prompt: 'Listen, then choose the letter you heard.', audio: { text: lt.arName, id: `letter-${lt.id}` }, options: options(letOpt(lt), pool), answer: lt.id, explain: `${lt.ar} is ${lt.name}: ${lt.sound}.` };
    }
    if (kind === 1) { // name -> letter
      return { prompt: `Which letter is ${lt.name}?`, options: options(letOpt(lt), LETTERS.map(letOpt)), answer: lt.id, explain: `${lt.ar} is ${lt.name}.` };
    }
    if (kind === 2) { // letter -> name
      const nm = (l) => ({ key: l.id, label: l.name });
      return { prompt: 'What is the name of this letter?', big: lt.ar, options: options(nm(lt), LETTERS.map(nm)), answer: lt.id, explain: `${lt.ar} is ${lt.name}.` };
    }
    const g = pick(LOOKALIKES, 1)[0].map((id) => LETTER[id]); // look-alikes
    const t = pick(g, 1)[0];
    return { prompt: `Spot the difference: which one is ${t.name}? (${t.dots})`, options: shuffle([t, ...pick(g.filter((x) => x.id !== t.id), 3)].map(letOpt)), answer: t.id, explain: `${t.name} (${t.ar}) has: ${t.dots}.` };
  }
  if (level === 2) {
    const c = pick(LETTERS.filter((l) => l.connects), 1)[0];
    const f = forms(c);
    const kind = Math.floor(Math.random() * 3);
    if (kind === 0) {
      const pos = pick([['ini', 'start'], ['med', 'middle'], ['fin', 'end']], 1)[0];
      const near = LOOKALIKES.find((g) => g.includes(c.id)) || [];
      const pool = [...near.map((id) => LETTER[id]), ...pick(LETTERS.filter((l) => l.connects), 3)];
      const uniq = [...new Map(pool.map((l) => [l.id, l])).values()];
      return { prompt: `This is a letter at the ${pos[1]} of a word. Which letter is it?`, big: f[pos[0]], options: options(letOpt(c), uniq.map(letOpt)), answer: c.id, explain: `${c.name}: ${f.iso}  ${f.ini}  ${f.med}  ${f.fin}` };
    }
    if (kind === 1) {
      const nj = pick(NON_JOINERS, 1)[0];
      const j = pick(LETTERS.filter((l) => l.connects), 3);
      return { prompt: 'Which of these letters does NOT join to the letter after it?', options: shuffle([letOpt(nj), ...j.map(letOpt)]), answer: nj.id, explain: `${nj.ar} (${nj.name}) never joins forward. The six non-joiners are ا د ذ ر ز و.` };
    }
    const pos = pick([['ini', 'beginning'], ['med', 'middle'], ['fin', 'end']], 1)[0];
    const others = pick(LETTERS.filter((l) => l.id !== c.id && l.connects), 3);
    return { prompt: `Which one shows ${c.name} (${c.ar}) at the ${pos[1]} of a word?`, options: shuffle([{ key: 'ok', label: f[pos[0]], big: true }, ...others.map((o, i) => ({ key: 'x' + i, label: forms(o)[pos[0]], big: true }))]), answer: 'ok', explain: `${c.name} at the ${pos[1]}: ${f[pos[0]]}` };
  }
  if (level === 3) {
    const l = pick(SYLLABLE_LETTERS, 1)[0], v = pick(VOWELS, 1)[0], s = syllable(l, v);
    const kind = Math.floor(Math.random() * 2);
    const rom = (a, b) => ({ key: `${a.id}-${b.id}`, label: syllable(a, b).roman });
    if (kind === 0) {
      const opts = shuffle([rom(l, v), ...VOWELS.filter((x) => x.id !== v.id).map((x) => rom(l, x)), rom(pick(SYLLABLE_LETTERS.filter((x) => x.id !== l.id), 1)[0], v)]);
      return { prompt: 'How is this read?', big: s.ar, audio: { text: s.ar, id: `syl-${l.id}-${v.id}` }, options: opts, answer: `${l.id}-${v.id}`, explain: `${s.ar} = ${s.roman}` };
    }
    const opts = shuffle([{ key: 'ok', label: s.ar, big: true }, ...pick(SYLLABLE_LETTERS.filter((x) => x.id !== l.id), 1).map((x) => ({ key: 'a', label: syllable(x, v).ar, big: true })), ...VOWELS.filter((x) => x.id !== v.id).map((x) => ({ key: x.id, label: syllable(l, x).ar, big: true }))]);
    return { prompt: `Which one is read "${s.roman}"?`, options: opts, answer: 'ok', explain: `${s.ar} = ${s.roman}` };
  }
  if (level === 4) {
    const l = pick(SYLLABLE_LETTERS, 1)[0], tw = pick(TANWEEN, 1)[0];
    const ar = base(l) + tw.mark + (tw.id === 'fathatan' ? 'ا' : '');
    const end = (x) => ({ key: x.id, label: `${SYL[l.id]}${x.ending}` });
    return { prompt: 'How is this read?', big: ar, audio: { text: ar, id: `tw-${l.id}-${tw.id}` }, options: TANWEEN.map(end), answer: tw.id, explain: `${tw.name}: the letter ends with "${tw.ending}". ${ar} = ${SYL[l.id]}${tw.ending}` };
  }
  if (level === 5) {
    if (Math.random() < 0.5) {
      const w = pick(SUKOON_WORDS, 1)[0];
      return { prompt: 'Read this word. Which is it?', big: w[0], audio: { text: w[0], id: null }, options: shuffle([w, ...pick(SUKOON_WORDS.filter((x) => x[0] !== w[0]), 3)]).map((x) => ({ key: x[0], label: `${x[1]} (${x[2]})` })), answer: w[0], explain: `${w[0]} = ${w[1]} (${w[2]})` };
    }
    const a = pick(SYLLABLE_LETTERS, 1)[0], b = pick(SYLLABLE_LETTERS.filter((x) => x.id !== 'alif'), 1)[0], v = pick(VOWELS, 1)[0];
    const s = sukoonForm(a, b, v);
    const sw = (x) => ({ key: x, label: x });
    return { prompt: 'The second letter has a sukoon (ْ). How is this read?', big: s.ar, audio: { text: s.ar, id: null }, options: shuffle([sw(s.roman), sw(s.roman + 'a'), sw(syllable(a, v).roman + SYL[b.id] + 'i'), sw(SYL[a.id] + 'a' + SYL[b.id])]).filter((o, i, arr) => arr.findIndex((q) => q.key === o.key) === i), answer: s.roman, explain: `${s.ar} = ${s.roman}: with sukoon the second letter stops, with no vowel.` };
  }
  // level 6
  const w = pick(SHORT_WORDS, 1)[0];
  if (Math.random() < 0.5) {
    return { prompt: 'Read this word. What does it mean?', big: w[0], audio: { text: w[0], id: null }, options: shuffle([w, ...pick(SHORT_WORDS.filter((x) => x[0] !== w[0]), 3)]).map((x) => ({ key: x[0], label: x[2] })), answer: w[0], explain: `${w[0]} (${w[1]}) = ${w[2]}` };
  }
  return { prompt: `Which word is read "${w[1]}"?`, options: shuffle([w, ...pick(SHORT_WORDS.filter((x) => x[0] !== w[0]), 3)]).map((x) => ({ key: x[0], label: x[0], big: true })), answer: w[0], explain: `${w[0]} = ${w[1]} (${w[2]})` };
}
