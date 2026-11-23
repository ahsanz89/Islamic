// Builds the grade indexes used by the "Hadith by grade" page:
//   public/data/grades.json        { <book>: { s, h, d, m, u } }   counts for every book
//   public/data/grades/<book>.json { s: [numbers], h: [...], d: [...], m: [...], u: count }
// It reads the hadith files that build-data.mjs already wrote, so run it after `npm run data` (the `data` script does).
// A hadith is put in a class only from its recorded grading (see src/lib/grades.mjs); books with no gradings count as "not graded".
import fs from 'node:fs';
import path from 'node:path';
import { gradeClass } from '../src/lib/grades.mjs';

const DATA = path.resolve('public/data');
const cols = JSON.parse(fs.readFileSync(path.join(DATA, 'collections.json'), 'utf8')).collections;
fs.mkdirSync(path.join(DATA, 'grades'), { recursive: true });
const summary = {};
for (const c of cols) {
  const book = JSON.parse(fs.readFileSync(path.join(DATA, 'c', `${c.id}.json`), 'utf8'));
  const lists = { s: [], h: [], d: [], m: [] };
  let u = 0;
  for (const sec of book.sections) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA, 'c', c.id, `${sec.id}.json`), 'utf8'));
    for (const h of items) {
      const k = gradeClass(h.g, c.id);
      if (k) lists[k].push(h.n); else u += 1;
    }
  }
  for (const k of Object.keys(lists)) lists[k] = [...new Set(lists[k])];
  fs.writeFileSync(path.join(DATA, 'grades', `${c.id}.json`), JSON.stringify({ ...lists, u }));
  summary[c.id] = { s: lists.s.length, h: lists.h.length, d: lists.d.length, m: lists.m.length, u };
}
fs.writeFileSync(path.join(DATA, 'grades.json'), JSON.stringify(summary));
const total = Object.values(summary).reduce((a, x) => ({ s: a.s + x.s, h: a.h + x.h, d: a.d + x.d, m: a.m + x.m, u: a.u + x.u }), { s: 0, h: 0, d: 0, m: 0, u: 0 });
console.log('grades built', total);
