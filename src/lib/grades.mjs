// Turns a hadith's list of gradings into one simple class for filtering.
// s = sahih (sound), h = hasan (good), d = da'if (weak: daif, munkar, shadh, matruk…), m = mawdu' (fabricated), '' = not graded.
// Nothing is guessed: a class comes only from a recorded grading word (or, for Sahih al-Bukhari and Sahih Muslim, from the
// scholarly consensus that every hadith in them is sahih). A book with no recorded gradings stays '' (not graded).

const ALWAYS_SAHIH = new Set(['bukhari', 'muslim']);
const PRIORITY = ['Al-Albani', 'Zubair Ali Zai', 'Shuaib Al Arnaut', 'Darussalam'];

export function gradeOf(word) {
  const s = (word || '').toLowerCase();
  if (!s) return '';
  if (/(maudu|mawdu|maudhu|mawdhu|fabricat|موضوع)/.test(s)) return 'm';
  if (/(da.?if|daeef|weak|munkar|shadh|matruk|ضعيف|منكر)/.test(s)) return 'd';
  if (/(hasan|حسن)/.test(s) && !/sahih/.test(s)) return 'h';
  if (/(sahih|صحيح)/.test(s)) return 's';
  if (/hasan/.test(s)) return 'h';
  return '';
}

/** The recorded grading that decides the class: the first scholar in the priority list who graded it, else the first one. */
export function pickGrade(grades) {
  if (!grades || !grades.length) return null;
  return PRIORITY.map((p) => grades.find(([who]) => who === p)).find(Boolean) || grades[0];
}

export function gradeClass(grades, collectionId) {
  if (ALWAYS_SAHIH.has(collectionId)) return 's';
  const pick = pickGrade(grades);
  return pick ? gradeOf(pick[1]) : '';
}

/** The four categories, in order, with plain-language meanings. */
export const GRADE_CLASSES = ['s', 'h', 'd', 'm'];
export const GRADE_INFO = {
  s: { en: 'Sahih', ar: 'صحيح', ur: 'صحیح', meaning: 'Sound / authentic' },
  h: { en: 'Hasan', ar: 'حسن', ur: 'حسن', meaning: 'Good' },
  d: { en: "Da'if", ar: 'ضعيف', ur: 'ضعیف', meaning: 'Weak' },
  m: { en: "Mawdu'", ar: 'موضوع', ur: 'موضوع', meaning: 'Fabricated' }
};
export const GRADE_NONE = { en: 'Not graded', ar: 'غير مصنَّف', ur: 'بغیر حکم' };
