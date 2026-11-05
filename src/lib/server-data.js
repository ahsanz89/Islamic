// Build-time readers (used by generateStaticParams and server components).
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(process.cwd(), 'public', 'data');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

export const readCollections = () => read('collections.json');
let CH_UR = null;
export const readCollection = (id) => {
  const c = read(`c/${id}.json`);
  if (!CH_UR) {
    try { CH_UR = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'chapters-ur.json'), 'utf8')); } catch { CH_UR = {}; }
  }
  const ur = CH_UR[id];
  if (ur) c.sections = c.sections.map((s) => ({ ...s, tu: ur[s.id] || '' }));
  return c;
};
export const readSurahs = () => read('q/surahs.json');
export const readGlossary = () => read('glossary.json');
export const readDuas = () => read('duas.json');
