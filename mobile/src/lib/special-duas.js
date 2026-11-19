// Special Duas & Accepted Supplications: shared helpers (web and app use the same data file).
import DATA from './special-duas.json';

export const SD = DATA;
export const TX = {
  en: { title: 'Special Duas & Accepted Supplications', sub: 'Supplications from the Quran and the authentic Sunnah, each taken from a real narration with its source and grading.', search: 'Search duas…', all: 'All', fromQuran: 'Quran', fromHadith: 'Prophet ﷺ', back: 'All special duas', arabic: 'Arabic', translit: 'Transliteration', translitNote: 'Approximate, generated from the vowelled Arabic. Please learn the pronunciation from a teacher.', translation: 'Translation', source: 'Source', grading: 'Authenticity', graders: 'Gradings by scholars', differ: 'Scholars differ on the grading of this narration. Read the gradings below.', virtue: 'Why it matters', occasion: 'When to recite', also: 'Also reported in', audio: 'Audio', audioQuran: 'Listen to this verse in the Quran reader', audioNone: 'No audio recitation is available for this narration yet.', save: 'Save', share: 'Share', fullHadith: 'Open the full hadith', noteHeader: 'Please note', note: 'Acceptance of a dua is in Allah\'s hands. A dua is never a guarantee that a request will be granted in the way we expect; the Prophet ﷺ taught that Allah answers in different ways.', kindVirtue: 'A saying of the Prophet ﷺ about duas that are answered', kindDua: 'Words of supplication', kindQuran: 'Quran', none: 'No duas match your search.', count: (n) => `${n} duas`, notes: 'Notes by the DALIL team (occasion and explanation) are short summaries of the narration; the Arabic, translation, source and grading come directly from the hadith data.', grade: { s: 'Sahih (authentic)', h: 'Hasan (good)', d: 'Daif (weak)', q: 'Quran', '': 'Not graded' }, copied: 'Copied', section: 'Special duas' },
  ur: { title: 'خاص دعائیں اور مقبول دعائیں', sub: 'قرآن اور مستند سنت کی دعائیں، ہر دعا ایک حقیقی روایت سے لی گئی ہے اور حوالہ و درجہ دیا گیا ہے۔', search: 'دعائیں تلاش کریں…', all: 'سب', fromQuran: 'قرآن', fromHadith: 'نبی ﷺ', back: 'تمام خاص دعائیں', arabic: 'عربی', translit: 'رومن تلفظ', translitNote: 'یہ تقریبی ہے اور حرکات والی عربی سے بنایا گیا ہے۔ درست تلفظ کسی استاد سے سیکھیں۔', translation: 'ترجمہ', source: 'حوالہ', grading: 'درجۂ صحت', graders: 'علما کے درجات', differ: 'اس روایت کے درجے میں علما کا اختلاف ہے۔ نیچے درجات دیکھیں۔', virtue: 'فضیلت اور وضاحت', occasion: 'کب پڑھیں', also: 'یہ روایت یہاں بھی ہے', audio: 'آڈیو', audioQuran: 'قرآن ریڈر میں اس آیت کی تلاوت سنیں', audioNone: 'اس روایت کی آڈیو ابھی دستیاب نہیں۔', save: 'محفوظ کریں', share: 'شیئر کریں', fullHadith: 'مکمل حدیث کھولیں', noteHeader: 'ضروری بات', note: 'دعا کی قبولیت اللہ کے ہاتھ میں ہے۔ دعا اس بات کی ضمانت نہیں کہ مانگی ہوئی چیز اسی صورت میں ملے گی؛ نبی ﷺ نے سکھایا کہ اللہ مختلف طریقوں سے دعا قبول فرماتا ہے۔', kindVirtue: 'قبولیتِ دعا کے بارے میں نبی ﷺ کا ارشاد', kindDua: 'دعا کے الفاظ', kindQuran: 'قرآن', none: 'تلاش سے کوئی دعا نہیں ملی۔', count: (n) => `${n} دعائیں`, notes: 'وقت اور وضاحت کے نوٹ دلیل ٹیم کے مختصر خلاصے ہیں؛ عربی، ترجمہ، حوالہ اور درجہ براہِ راست حدیث کے ڈیٹا سے ہیں۔', grade: { s: 'صحیح', h: 'حسن', d: 'ضعیف', q: 'قرآن', '': 'درجہ نہیں' }, copied: 'کاپی ہو گیا', section: 'خاص دعائیں' }
};
export const tx = (ui) => TX[ui] || TX.en;
export const pick = (o, ui) => (o && (o[ui] || o.en)) || '';
export const catName = (c, ui) => c[ui] || c.en;

export function matches(d, q, cat, kind) {
  if (cat !== 'all' && !d.cats.includes(cat)) return false;
  if (kind === 'quran' && d.kind !== 'quran') return false;
  if (kind === 'hadith' && d.kind === 'quran') return false;
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const hay = `${d.id} ${d.title.en} ${d.title.ur} ${d.en || ''} ${d.tl || ''} ${d.occ.en} ${d.virt.en} ${d.virt.ur} ${d.occ.ur} ${d.src.book} ${d.src.ref}`.toLowerCase();
  const arabic = d.ar.replace(/[ً-ٰٟۖ-ۭـ]/g, '');
  const tq = term.replace(/[ً-ٰٟۖ-ۭـ]/g, '');
  return hay.includes(term) || arabic.includes(tq);
}

export const titleOf = (d, ui) => (d.title && (d.title[ui] || d.title.en)) || d.id;
export const shareText = (d, ui) => `${d.ar}\n\n${d.tl ? d.tl + '\n\n' : ''}${d.en || ''}\n\n${d.src.book} ${d.src.ref} · ${d.grade.label}`;
