// Tiny in-memory router for the single-page preview build.
// Paths look like the real site ('/hadith/?c=bukhari&n=1'); the address bar only gets a
// short ASCII name (e.g. #h-bukhari-1) so links can be bookmarked inside an artifact.
import { useSyncExternalStore } from 'react';

let current = '/';
const stack = [];
const subs = new Set();

export function pathToName(p) {
  const [pathAndQuery, frag] = p.split('#');
  const [path, query = ''] = pathAndQuery.split('?');
  const qs = new URLSearchParams(query);
  const seg = path.split('/').filter(Boolean);
  if (!seg.length) return 'home';
  switch (seg[0]) {
    case 'collections': return 'collections';
    case 'c': return seg[2] ? `s-${seg[1]}-${seg[2]}` : `c-${seg[1]}`;
    case 'hadith': return `h-${qs.get('c')}-${String(qs.get('n')).replace('.', 'p')}`;
    case 'quran':
      if (seg[1] === 'roots') {
        const r = qs.get('r');
        return r ? 'root-' + [...r].map((ch) => ch.charCodeAt(0).toString(16)).join('x') : 'roots';
      }
      if (seg[1]) return `q-${seg[1]}${frag && frag.startsWith('v') ? '-' + frag.slice(1) : ''}`;
      return 'quran';
    case 'bookmarks': return 'saved';
    default: return seg[0];
  }
}

export function nameToPath(name) {
  if (!name || name === 'home') return '/';
  const [k, ...rest] = name.split('-');
  switch (k) {
    case 'collections': return '/collections/';
    case 'c': return `/c/${rest[0]}/`;
    case 's': return `/c/${rest[0]}/${rest[1]}/`;
    case 'h': return `/hadith/?c=${rest[0]}&n=${(rest[1] || '1').replace('p', '.')}`;
    case 'q': return `/quran/${rest[0]}/${rest[1] ? '#v' + rest[1] : ''}`;
    case 'roots': return '/quran/roots/';
    case 'root': return '/quran/roots/?r=' + encodeURIComponent(rest.join('-').split('x').map((h) => String.fromCharCode(parseInt(h, 16))).join(''));
    case 'saved': return '/bookmarks/';
    default: return `/${name}/`;
  }
}

function emit() { subs.forEach((f) => f()); }

function scrollToFragment(frag) {
  let tries = 0;
  const go = () => {
    const el = frag && document.getElementById(frag);
    if (el) el.scrollIntoView({ block: 'start' });
    else if (tries++ < 40) setTimeout(go, 100);
  };
  if (frag) go(); else window.scrollTo(0, 0);
}

export function navigate(p, { replace = false } = {}) {
  if (!replace && p !== current) stack.push(current);
  current = p;
  // The artifact host reloads the page when the hash changes, so navigation stays in memory.
  emit();
  scrollToFragment(p.split('#')[1]);
}

export function initRouter() {
  try { current = nameToPath(location.hash.slice(1)); } catch { current = '/'; }
  window.addEventListener('hashchange', () => {
    const p = nameToPath(location.hash.slice(1));
    if (pathToName(p) !== pathToName(current)) { current = p; emit(); scrollToFragment(p.split('#')[1]); }
  });
}

export const useLocationPath = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => current, () => current);

export function goBack() {
  const p = stack.pop() || '/';
  current = p;
  emit();
  scrollToFragment(p.split('#')[1]);
}
