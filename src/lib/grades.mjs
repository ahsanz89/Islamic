// Turns a hadith's list of gradings into one simple class for filtering.
// s = sahih, h = hasan, d = da'if (weak, fabricated, munkar…), '' = not graded.

const ALWAYS_SAHIH = new Set(['bukhari', 'muslim']);
const PRIORITY = ['Al-Albani', 'Zubair Ali Zai', 'Shuaib Al Arnaut', 'Darussalam'];

export function gradeOf(word) {
  const s = (word || '').toLowerCase();
  if (!s) return '';
  if (/(da.?if|daeef|weak|munkar|maudu|mawdu|fabricat|shadh|matruk|ضعيف|موضوع|منكر)/.test(s)) return 'd';
  if (/(hasan|حسن)/.test(s) && !/sahih/.test(s)) return 'h';
  if (/(sahih|صحيح)/.test(s)) return 's';
  if (/hasan/.test(s)) return 'h';
  return '';
}

export function gradeClass(grades, collectionId) {
  if (ALWAYS_SAHIH.has(collectionId)) return 's';
  if (!grades || !grades.length) return '';
  const pick = PRIORITY.map((p) => grades.find(([who]) => who === p)).find(Boolean) || grades[0];
  return gradeOf(pick[1]);
}
