// Build-time readers (used by generateStaticParams and server components).
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(process.cwd(), 'public', 'data');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

export const readCollections = () => read('collections.json');
export const readCollection = (id) => read(`c/${id}.json`);
export const readSurahs = () => read('q/surahs.json');
export const readGlossary = () => read('glossary.json');
export const readDuas = () => read('duas.json');
