// Finds narrations with near-identical wording (an automatic takhrij aid).
// MinHash over word 2-gram shingles + locality-sensitive hashing.
// Input: array of normalised Arabic matn strings. Output: per item, [[otherIndex, score%], ...].

const NUM_HASH = 48;
const BANDS = 16;
const ROWS = NUM_HASH / BANDS;
const MIN_WORDS = 8;
const MIN_SCORE = 0.4;
const MAX_BUCKET = 300; // ignore buckets for formulaic phrases shared by hundreds of texts
const MAX_LINKS = 12;

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const SEEDS = Array.from({ length: NUM_HASH }, (_, i) => fnv('seed' + i) | 1);

function mix(h, seed) {
  h = Math.imul(h ^ seed, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

function signature(text) {
  const words = text.split(' ');
  if (words.length < MIN_WORDS) return null;
  const shingles = new Set();
  for (let i = 0; i + 1 < words.length; i++) shingles.add(fnv(words[i] + ' ' + words[i + 1]));
  const sig = new Uint32Array(NUM_HASH).fill(0xffffffff);
  for (const s of shingles) {
    for (let k = 0; k < NUM_HASH; k++) {
      const v = mix(s, SEEDS[k]);
      if (v < sig[k]) sig[k] = v;
    }
  }
  return sig;
}

export function findSimilar(texts) {
  const sigs = texts.map(signature);
  const results = texts.map(() => new Map());
  for (let b = 0; b < BANDS; b++) {
    const buckets = new Map();
    sigs.forEach((sig, i) => {
      if (!sig) return;
      let key = '';
      for (let r = 0; r < ROWS; r++) key += sig[b * ROWS + r].toString(36) + '.';
      let arr = buckets.get(key);
      if (!arr) buckets.set(key, (arr = []));
      arr.push(i);
    });
    for (const arr of buckets.values()) {
      if (arr.length < 2 || arr.length > MAX_BUCKET) continue;
      for (let x = 0; x < arr.length; x++) {
        for (let y = x + 1; y < arr.length; y++) {
          const i = arr[x], j = arr[y];
          if (results[i].has(j)) continue;
          let same = 0;
          const a = sigs[i], c = sigs[j];
          for (let k = 0; k < NUM_HASH; k++) if (a[k] === c[k]) same++;
          const score = same / NUM_HASH;
          if (score >= MIN_SCORE) {
            results[i].set(j, score);
            results[j].set(i, score);
          }
        }
      }
    }
  }
  return results.map((m) =>
    [...m.entries()].sort((p, q) => q[1] - p[1]).slice(0, MAX_LINKS).map(([j, s]) => [j, Math.round(s * 100)])
  );
}
