// Builds the single-page preview (dist/) from public/data and src/.
// node spa/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'public', 'data');
const OUT = path.join(ROOT, 'spa', 'dist');
const INCLUDE = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'nawawi', 'qudsi', 'dehlawi',
  'ahmad', 'mishkat', 'adab', 'shamail', 'humaydi', 'hammam'];
const PART_BYTES = 9 * 1024 * 1024;

const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));
const write = (rel, data, gz = false) => {
  const p = path.join(OUT, 'data', rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const s = JSON.stringify(data);
  fs.writeFileSync(p, gz ? zlib.gzipSync(s, { level: 9 }).toString('base64') : s);
};

fs.rmSync(OUT, { recursive: true, force: true });

// ---- hadith
const all = read('collections.json');
const keep = new Set(INCLUDE);
const summary = all.collections.filter((c) => keep.has(c.id));
write('collections.json', { ...all, collections: summary });
for (const c of summary) {
  const idx = read(`c/${c.id}.json`);
  let part = 1, size = 0, bucket = {};
  const flush = () => { if (Object.keys(bucket).length) { write(`c/${c.id}-${part}.gz.txt`, bucket, true); part++; size = 0; bucket = {}; } };
  for (const s of idx.sections) {
    const items = read(`c/${c.id}/${s.id}.json`).map((h) => (h.sim ? { ...h, sim: h.sim.filter(([x]) => keep.has(x)) } : h));
    const bytes = JSON.stringify(items).length;
    if (size && size + bytes > PART_BYTES) flush();
    bucket[s.id] = items;
    size += bytes;
    s.part = part;
  }
  flush();
  write(`c/${c.id}.json`, idx);
  console.log(c.id, part - 1, 'parts');
}

// ---- quran
const surahs = read('q/surahs.json');
write('q/surahs.json', surahs);
const q = {};
for (const s of surahs.surahs) q[s.n] = read(`q/${s.n}.json`);
write('q/quran.gz.txt', q, true);
write('q/roots.gz.txt', read('q/roots.json'), true);

// ---- content
for (const f of ['glossary.json', 'duas.json', 'narrators/index.json', 'commentary/index.json']) write(f, read(f));

// ---- app bundle
const r = await esbuild.build({
  entryPoints: [path.join(ROOT, 'spa', 'main.js')],
  bundle: true,
  minify: true,
  keepNames: true,
  write: false,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.mjs': 'js' },
  alias: {
    '@/lib/client-data': path.join(ROOT, 'spa', 'client-data.js'),
    'next/link': path.join(ROOT, 'spa', 'shims', 'next-link.js'),
    'next/navigation': path.join(ROOT, 'spa', 'shims', 'next-navigation.js'),
    '@': path.join(ROOT, 'src')
  },
  define: { 'process.env.NEXT_PUBLIC_BASE_PATH': '""', 'process.env.NODE_ENV': '"production"' }
});
const js = r.outputFiles[0].text;

// CSS: drop the self-hosted font imports (Google Fonts is linked instead)
let css = fs.readFileSync(path.join(ROOT, 'src', 'app', 'globals.css'), 'utf8')
  .replace(/^@import .*$/gm, '')
  .replace(/@font-face \{[\s\S]*?\}\n/, '')
  .replace(/'Salawat', 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans',/, "'Plus Jakarta Sans', Amiri,")
  .replace(/'Salawat', var\(--font-ur\)/, 'var(--font-ur)');

const html = `<title>Hadith Library</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Amiri+Quran&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap">
<style>
${css}
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 30; background: var(--surface); }
</style>
<div id="root"></div>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);

let total = 0, count = 0;
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else { total += fs.statSync(p).size; count++; } } };
walk(OUT);
console.log('dist:', count, 'files,', (total / 1048576).toFixed(1), 'MB; page', (html.length / 1024).toFixed(0), 'KB');
