// Data layer for the single-page preview: the same API as src/lib/client-data.js,
// but reading a compact, gzip-packed copy of the data published next to the page.
import { normalizeText } from '@/lib/arabic.mjs';
import { gradeClass } from '@/lib/grades.mjs';

const files = new Map();
const virtual = new Map();

// Packed files are gzip, base64-encoded so they can be served as plain text.
async function gunzipJSON(b64) {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }
  return JSON.parse(new TextDecoder().decode(bytes)); // already decoded by the server
}

function file(name) {
  if (!files.has(name)) {
    files.set(name, fetch(`data/${name}`).then(async (r) => {
      if (!r.ok) throw new Error(`${r.status} ${name}`);
      return name.endsWith('.gz.txt') ? gunzipJSON(await r.text()) : r.json();
    }).catch((e) => { files.delete(name); throw e; }));
  }
  return files.get(name);
}

function memo(key, fn) {
  if (!virtual.has(key)) virtual.set(key, fn().catch((e) => { virtual.delete(key); throw e; }));
  return virtual.get(key);
}

async function sectionItems(cid, sid) {
  const col = await file(`c/${cid}.json`);
  const sec = col.sections.find((s) => s.id === sid);
  if (!sec) return [];
  const part = await file(`c/${cid}-${sec.part}.gz.txt`);
  return part[sid] || [];
}

async function allItems(cid) {
  const col = await file(`c/${cid}.json`);
  const parts = [...new Set(col.sections.map((s) => s.part))];
  const loaded = await Promise.all(parts.map((p) => file(`c/${cid}-${p}.gz.txt`)));
  const out = [];
  for (const s of col.sections) for (const h of loaded[parts.indexOf(s.part)][s.id] || []) out.push({ ...h, sec: s.id });
  return out;
}

const quran = () => file('q/quran.gz.txt');

export function getJSON(path) {
  let m;
  if ((m = path.match(/^c\/([^/]+)\/([^/]+)\.json$/))) return memo(path, () => sectionItems(m[1], m[2]));
  if ((m = path.match(/^s\/quran\/([^/]+)\.json$/))) {
    const key = m[1];
    return memo(path, async () => {
      const q = await quran();
      const lang = key === 'simple' ? 'ar' : key.replace(/2$/, '');
      const rows = [];
      for (const [s, verses] of Object.entries(q)) for (const v of verses) {
        const txt = key === 'simple' ? v.ar : v.t[key];
        if (txt) rows.push([`${s}:${v.v}`, normalizeText(txt, lang), v.juz]);
      }
      return rows;
    });
  }
  if ((m = path.match(/^s\/([a-z]+)\/([^/]+)\.json$/))) {
    const [, lang, cid] = m;
    return memo(path, async () => (await allItems(cid))
      .map((h) => [h.n, lang === 'ar' ? h.ar : h.t?.[lang], gradeClass(h.g, cid), h.sec])
      .filter((r) => r[1])
      .map(([n, txt, g, sec]) => [n, normalizeText(txt, lang), g, sec]));
  }
  if ((m = path.match(/^q\/(\d+)\.json$/))) return memo(path, async () => (await quran())[m[1]]);
  if (path === 'q/roots.json') return file('q/roots.gz.txt');
  return file(path);
}

export const getCollections = () => getJSON('collections.json');
export const getCollection = (id) => getJSON(`c/${id}.json`);

export function sectionFor(col, n) {
  const num = Number(n);
  return col.sections.find((s) => num >= s.from && num <= s.to) || null;
}

export async function getHadith(cid, n) {
  const col = await getCollection(cid);
  const num = Number(n);
  // Ranges can overlap in the source data, so check every section that could hold n.
  const candidates = col.sections.filter((s) => num >= s.from && num <= s.to);
  for (const sec of candidates) {
    const items = await getJSON(`c/${cid}/${sec.id}.json`);
    const idx = items.findIndex((h) => String(h.n) === String(n));
    if (idx >= 0) return { col, sec, items, idx, hadith: items[idx] };
  }
  return { col, sec: candidates[0] || null, items: [], idx: -1, hadith: null };
}

export const href = (p) => p;
