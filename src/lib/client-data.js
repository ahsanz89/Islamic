'use client';
// Fetches static JSON from /data with an in-memory cache.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const cache = new Map();

export function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(`${BASE}/data/${path}`).then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${path}`);
        return r.json();
      }).catch((e) => { cache.delete(path); throw e; })
    );
  }
  return cache.get(path);
}

export const getCollections = () => getJSON('collections.json');
export const getCollection = (id) => getJSON(`c/${id}.json`);

/** Find which section file holds hadith number n. */
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

export const href = (p) => `${BASE}${p}`;
