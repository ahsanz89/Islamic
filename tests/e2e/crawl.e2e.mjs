// Opens the main pages on desktop and phone: checks for JS errors, broken files, empty pages and sideways scrolling.
import { createRequire } from 'node:module';
const require = createRequire(process.env.PLAYWRIGHT_PATH || import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8099';
const routes = (process.env.ROUTES || '/,/about/,/bookmarks/,/collections/,/duas/,/glossary/,/namaz/,/narrators/,/privacy/,/quran/,/quran/1/,/quran/2/,/quran/112/,/search/,/learn/,/learn/1/,/learn/6/,/c/abudawud/,/404/').split(',');
const b = await chromium.launch(); const bad = [];
for (const vp of [{ w: 1280, h: 900 }, { w: 390, h: 800 }]) {
  const p = await (await b.newContext({ viewport: { width: vp.w, height: vp.h } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET|Failed to load resource: net::/.test(m.text())) errs.push(m.text()); });
  p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE) && !/\/404\/?$/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  for (const r of routes) {
    errs.length = 0;
    await p.goto(BASE + r, { waitUntil: 'load' }); await p.waitForTimeout(400);
    const info = await p.evaluate(() => ({ len: document.body.innerText.length, ov: document.documentElement.scrollWidth - window.innerWidth }));
    const issues = [...errs]; if (info.len < 80) issues.push('page looks empty'); if (info.ov > 2) issues.push('sideways scroll ' + info.ov + 'px');
    console.log(vp.w, r, issues.length ? 'ISSUES ' + issues.join(' | ') : 'ok');
    if (issues.length) bad.push([vp.w, r, issues]);
  }
}
await b.close(); console.log(bad.length ? 'ISSUES FOUND: ' + bad.length : 'ALL PAGES OK'); process.exit(bad.length ? 1 : 0);
