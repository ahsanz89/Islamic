// Segments an OpenITI mARkdown text into numbered hadith.
// Strategy: find every paragraph that starts with a printed number, keep the
// longest increasing runs (so editors' numbered intros are dropped), and
// attach following paragraphs to the hadith they belong to.

const DIGITS = { '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9 };
const toInt = (s) => parseInt(s.replace(/[٠-٩]/g, (d) => DIGITS[d]), 10);

const clean = (s) =>
  s
    .replace(/PageV\d+P\d+/g, ' ')
    .replace(/\bms\d+\b/g, ' ')
    .replace(/\bAUTO\b/g, ' ')
    .replace(/\(¬?[0-9٠-٩]{1,3}\)/g, ' ') // editors' footnote markers
    .replace(/«[0-9٠-٩]{1,3}»/g, ' ')
    .replace(/[|#~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function parseOpenITI(raw, { minRun = 20 } = {}) {
  const body = raw.split('#META#Header#End#').pop();
  const lines = body.split(/\r?\n/);

  // 1. Build paragraphs: {kind: 'h'|'p', text}
  const paras = [];
  for (const line of lines) {
    if (line.startsWith('~~')) {
      if (paras.length) paras[paras.length - 1].text += ' ' + line.slice(2);
      continue;
    }
    if (line.startsWith('### ')) {
      paras.push({ kind: 'h', text: line.replace(/^###\s*\|*/, '') });
    } else if (line.startsWith('# ')) {
      paras.push({ kind: 'p', text: line.slice(2) });
    }
  }

  // 2. Candidate hadith starts.
  const numRe = /^\s*[\[(]?\s*([0-9٠-٩]{1,5})\s*[\])]?\s*(?:[-–ـ]\s*|\s+(?=[؀-ۿ]))/;
  const cands = [];
  paras.forEach((p, i) => {
    const t = p.text.replace(/^\s*\|+\s*/, '');
    const m = p.kind === 'h' ? t.match(/^\s*[\[]?\s*([0-9٠-٩]{1,5})\s*[\]]?\s*[-–ـ]\s*/) : t.match(numRe);
    if (m) cands.push({ i, n: toInt(m[1]), rest: t.slice(m[0].length) });
    else if (p.kind === 'h' && /^\s*[\[(]?\s*[0-9٠-٩]{1,5}\s*[\])]?\s*$/.test(t)) {
      cands.push({ i, n: toInt(t), rest: '' });
    }
  });

  // 3. Increasing runs (next number within +1..+60 of the last one).
  const runs = [];
  let cur = [];
  for (const c of cands) {
    const last = cur[cur.length - 1];
    if (last && c.n > last.n && c.n <= last.n + 60) cur.push(c);
    else {
      if (cur.length) runs.push(cur);
      cur = [c];
    }
  }
  if (cur.length) runs.push(cur);
  const keep = new Set(runs.filter((r) => r.length >= minRun).flat().map((c) => c.i));
  const byIndex = new Map(cands.filter((c) => keep.has(c.i)).map((c) => [c.i, c]));

  // 4. Walk paragraphs, assigning text and chapter headings.
  const out = [];
  let chapter = '';
  let current = null;
  paras.forEach((p, i) => {
    const c = byIndex.get(i);
    if (c) {
      current = { printed: c.n, chapter, text: clean(c.rest) };
      out.push(current);
      return;
    }
    if (p.kind === 'h') {
      const h = clean(p.text);
      if (h && !/^[0-9٠-٩\s\-–]+$/.test(h)) chapter = h.slice(0, 200);
      current = current && h === '' ? current : current; // headings end nothing
      return;
    }
    if (current) {
      const t = clean(p.text);
      // Footnote blocks in Shamela exports start with a long underscore rule.
      if (/^_{5,}/.test(p.text)) { current.footnotes = true; return; }
      if (!current.footnotes && t) current.text += ' ' + t;
    }
  });

  return out
    .filter((h) => h.text.length > 15)
    .map((h, idx) => ({ n: idx + 1, printed: h.printed, chapter: h.chapter, text: h.text }));
}
