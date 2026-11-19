import { skeleton, words, wordMatch, align, evaluate, markDone, isDone, nextToPractice } from '../src/lib/recitation-core';

const FATIHA2 = 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ';
const KURSI = 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُ ۚ لَا تَأۡخُذُهُۥ سِنَةࣱ وَلَا نَوۡمࣱۚ';
const heard = (t, c = 0.9) => [{ text: t, confidence: c }];

test('skeleton ignores marks and spelling variants but keeps letters', () => {
  expect(skeleton('ٱلۡحَمۡدُ')).toBe(skeleton('الحمد'));
  expect(skeleton('ٱلۡعَـٰلَمِینَ')).toBe(skeleton('العالمين'));
  expect(skeleton('رَحْمَة')).toBe(skeleton('رحمه'));
  expect(skeleton('قل')).not.toBe(skeleton('كل'));
});
test('words drops stop signs and verse markers', () => {
  expect(words('وَلَا نَوۡمࣱۚ ﴿٢٥٥﴾ ۞').length).toBe(2);
});
test('wordMatch is strict on short words and tolerant on long ones', () => {
  expect(wordMatch('مَالِكِ', 'مالك')).toBe('exact');
  expect(wordMatch('الرحمن', 'الرحمان')).toBe('close');
  expect(wordMatch('رب', 'ربي')).toBe('no');
  expect(wordMatch('قل', 'كل')).toBe('no');
});
test('complete recitation with different spelling is accepted', () => {
  const r = evaluate(FATIHA2, heard('الحمد لله رب العالمين'));
  expect(r.result).toBe('complete');
  expect(r.status).toEqual(['ok', 'ok', 'ok', 'ok']);
});
test('recogniser joining or splitting words is tolerated', () => {
  expect(evaluate(FATIHA2, heard('الحمدلله رب العالمين')).result).toBe('complete');
  expect(evaluate(FATIHA2, heard('الحمد لله رب العا لمين')).result).toBe('complete');
});
test('a stopped-early recitation is incomplete and not an error', () => {
  const r = evaluate(FATIHA2, heard('الحمد لله'));
  expect(r.result).toBe('incomplete');
  expect(r.problems).toEqual([2, 3]);
});
test('a skipped middle word is reported by position', () => {
  const r = evaluate(KURSI, heard('الله لا اله الا هو القيوم لا تاخذه سنه ولا نوم'));
  expect(r.result).toBe('errors');
  expect(r.problems).toEqual([5]);
  expect(r.status[5]).toBe('missing');
});
test('a wrong word is flagged, the others stay ok', () => {
  const r = evaluate(FATIHA2, heard('الحمد لله ربي العالمين'));
  expect(r.result).toBe('errors');
  expect(r.problems).toEqual([2]);
});
test('low confidence asks to repeat and never accuses', () => {
  const r = evaluate(FATIHA2, heard('الحمد لله', 0.2));
  expect(r.result).toBe('retry');
  expect(r.problems).toEqual([]);
});
test('nothing heard is reported as silence', () => {
  expect(evaluate(FATIHA2, []).result).toBe('silence');
  expect(evaluate(FATIHA2, heard('  ')).result).toBe('silence');
});
test('n-best: the best alternative is used', () => {
  const r = evaluate(FATIHA2, [{ text: 'الحمد لله رب', confidence: 0.9 }, { text: 'الحمد لله رب العالمين', confidence: 0.8 }]);
  expect(r.result).toBe('complete');
});
test('unrelated speech does not pass', () => {
  expect(evaluate(KURSI, heard('اليوم الجو جميل جدا في المدينة')).result).not.toBe('complete');
});
test('align gives one status per expected word', () => {
  const e = words(FATIHA2);
  expect(align(e, words('الحمد لله')).status.length).toBe(e.length);
});
test('progress helpers', () => {
  let d = {};
  d = markDone(d, 2, 1); d = markDone(d, 2, 2); d = markDone(d, 2, 2);
  expect(d['2']).toEqual([1, 2]);
  expect(isDone(d, 2, 2)).toBe(true);
  expect(isDone(d, 2, 3)).toBe(false);
  expect(nextToPractice(d, 2, 286)).toBe(3);
  expect(nextToPractice({}, 1, 7)).toBe(1);
});
