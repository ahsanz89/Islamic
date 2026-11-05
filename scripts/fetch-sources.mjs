// Downloads every open data source into raw/. Safe to re-run (skips files that exist).
// Sources and licences: see docs/DATA.md.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { COLLECTIONS, HADITH_API_LANGS, LANG3 } from './collections.config.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RAW = path.join(ROOT, 'raw');
const GH = 'https://raw.githubusercontent.com';

async function get(url, dest) {
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log('  saved', path.relative(ROOT, dest));
}

async function pool(tasks, n = 6) {
  const q = [...tasks];
  await Promise.all(Array.from({ length: n }, async () => { while (q.length) await q.shift()(); }));
}

// 1. hadith-api (Arabic + translations)
console.log('hadith-api…');
const tasks = [];
for (const c of COLLECTIONS.filter((x) => x.source === 'hadith-api')) {
  for (const l of ['ar', ...HADITH_API_LANGS]) {
    const name = `${LANG3[l]}-${c.id}`;
    tasks.push(() => get(`${GH}/fawazahmed0/hadith-api/1/editions/${name}.json`, path.join(RAW, 'hadith', `${name}.json`)).catch(() => {}));
  }
}
await pool(tasks);

// 2. OpenITI (Arabic-only books)
console.log('OpenITI…');
const binFor = (uri) => {
  const year = parseInt(uri.slice(0, 4), 10);
  return String(Math.ceil(year / 25) * 25).padStart(4, '0') + 'AH';
};
await pool(COLLECTIONS.filter((x) => x.source === 'openiti').map((c) => async () => {
  const [author, book] = c.file.split('.');
  const dir = `${GH}/OpenITI/${binFor(c.file)}/master/data/${author}/${author}.${book}`;
  const dest = path.join(RAW, 'openiti', c.file);
  for (const suffix of ['', '.completed', '.mARkdown']) {
    try { await get(`${dir}/${c.file}${suffix}`, dest); return; } catch {}
  }
  console.warn('  could not download', c.file);
}), 3);

// 3. Quran text and translations
console.log('Quran…');
const QEDS = ['ara-quranuthmanienc', 'ara-quransimple', 'ara-quran-la', 'urd-fatehmuhammadja', 'urd-muhammadjunagar',
  'eng-mohammedmarmadu', 'eng-abdullahyusufal', 'ben-muhiuddinkhan', 'ind-indonesianislam', 'tur-diyanetisleri',
  'fra-muhammadhamidul', 'rus-elmirkuliev', 'tam-janturstfoundat', 'hin-suhelfarooqkhan'];
await pool([...QEDS.map((e) => () => get(`${GH}/fawazahmed0/quran-api/1/editions/${e}.json`, path.join(RAW, 'quran', `${e}.json`))),
  () => get(`${GH}/fawazahmed0/quran-api/1/info.json`, path.join(RAW, 'quran', 'info.json'))]);

// 4. Word-by-word meanings and roots (npm packages)
const tmp = path.join(RAW, '.npm');
if (!fs.existsSync(path.join(RAW, 'quran', 'wbw.json')) || !fs.existsSync(path.join(RAW, 'quran', 'morphology.json'))) {
  console.log('word-by-word + morphology…');
  fs.mkdirSync(tmp, { recursive: true });
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"name":"wbw-tmp","version":"1.0.0","private":true}');
  execSync('npm i --no-save @kmaslesa/holy-quran-word-by-word-full-data quran-search-engine', { cwd: tmp, stdio: 'inherit', shell: true });
  fs.copyFileSync(path.join(tmp, 'node_modules/@kmaslesa/holy-quran-word-by-word-full-data/data.json'), path.join(RAW, 'quran', 'wbw.json'));
  const qse = await import(path.join(tmp, 'node_modules/quran-search-engine/dist/index.mjs'));
  const mm = await qse.loadMorphology();
  fs.writeFileSync(path.join(RAW, 'quran', 'morphology.json'), JSON.stringify([...mm.values()]));
}
console.log('done. Next: npm run data');
