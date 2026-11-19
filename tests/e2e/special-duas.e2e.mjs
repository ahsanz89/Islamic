// Special duas: build, serve out/ on :8099, run `node tests/e2e/special-duas.e2e.mjs`.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PLAYWRIGHT_PATH || import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8099';
const DATA = JSON.parse(fs.readFileSync('src/lib/special-duas.json', 'utf8'));
const fails = [], errors = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL', m); } };
const browser = await chromium.launch();
for (const vp of [{ n: 'desktop', width: 1280, height: 850 }, { n: 'phone', width: 390, height: 800 }]) for (const ui of ['en', 'ur']) {
  const tag = `${vp.n}/${ui}`;
  const ctx = await browser.newContext({ viewport: vp, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript((u) => { try { localStorage.setItem('hl.settings', JSON.stringify({ ui: u })); } catch {} }, ui);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(tag + ' ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET|Failed to load resource/.test(m.text())) errors.push(tag + ' console: ' + m.text()); });
  await page.goto(BASE + '/duas/special/');
  await page.waitForSelector('.sd-card');
  ok(await page.locator('.sd-card').count() === DATA.duas.length, `${tag}: all ${DATA.duas.length} duas listed`);
  ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `${tag}: no sideways scroll`);
  // search / filter
  await page.fill('#sdq', ui === 'ur' ? 'استغفار' : 'forgiveness');
  const n1 = await page.locator('.sd-card').count(); ok(n1 > 0 && n1 < DATA.duas.length, `${tag}: search narrows (${n1})`);
  await page.fill('#sdq', 'zzzqq'); ok(await page.locator('.sd-card').count() === 0 && await page.locator('.empty').count() === 1, `${tag}: empty state`);
  await page.fill('#sdq', '');
  await page.locator('[aria-label="Source"] .chip').nth(2).click();
  ok(await page.locator('.sd-card').count() === 10, `${tag}: Quran filter shows 10`);
  await page.locator('[aria-label="Source"] .chip').nth(0).click();
  const ism = DATA.duas.filter((d) => d.cats.includes('ism')).length;
  await page.locator('[aria-label="Categories"] .chip').nth(2).click();
  ok(await page.locator('.sd-card').count() === ism, `${tag}: Ism-e-Azam category shows ${ism}`);
  // detail
  await page.goto(BASE + '/duas/special/sayyid-istighfar/');
  await page.waitForSelector('.sd-ar');
  ok((await page.locator('.sd-ar').innerText()).includes('سَيِّدُ') || (await page.locator('.sd-ar').innerText()).includes('اللَّهُمَّ'), `${tag}: Arabic shown`);
  ok(await page.locator('.sd-tl').count() === 1, `${tag}: transliteration shown`);
  ok((await page.locator('main').innerText()).includes('Sahih al-Bukhari') , `${tag}: source shown`);
  ok(await page.locator('a:has-text("Hadith"), a.btn').count() > 0, `${tag}: source link`);
  if (ui === 'en') ok(vp.n !== 'x', 'x');
  // bookmark + bookmarks page link
  await page.locator('.page-head button[aria-pressed]').first().click();
  ok(await page.locator('.page-head button[aria-pressed="true"]').count() === 1, `${tag}: bookmarked`);
  await page.goto(BASE + '/bookmarks/');
  await page.waitForSelector('a[href*="/duas/special/sayyid-istighfar"]', { timeout: 5000 }).then(() => {}, () => ok(false, `${tag}: bookmark appears with link`));
  // share/copy fallback
  await page.goto(BASE + '/duas/special/yunus/');
  await page.waitForSelector('.sd-ar');
  await page.locator('.page-head .btn.ghost:last-child').click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes('Tirmidhi') || clip.includes('3505'), `${tag}: copied text has the source (${clip.slice(0, 40)})`);
  // differing gradings warning
  await page.goto(BASE + '/duas/special/ilman-nafian/');
  await page.waitForSelector('.sd-warn'); ok(true, '');
  if (ui === 'ur') { ok(await page.evaluate(() => document.documentElement.dir) === 'rtl', `${tag}: rtl`); }
  await ctx.close();
}
// every detail page loads with an Arabic text
const ctx = await browser.newContext(); const pg = await ctx.newPage();
pg.on('pageerror', (e) => errors.push('detail ' + e.message));
for (const d of DATA.duas) { const r = await pg.goto(`${BASE}/duas/special/${d.id}/`); ok(r.status() === 200, `detail ${d.id} ${r.status()}`); ok((await pg.locator('.sd-ar').count()) === 1, `detail ${d.id} has Arabic`); }
ok((await (await pg.goto(BASE + '/duas/')).status()) === 200, 'duas page');
await pg.goto(BASE + '/duas/'); ok(await pg.locator('.sd-banner').count() === 1, 'banner on /duas/');
await browser.close();
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no console errors');
console.log(fails.length ? `${fails.length} FAILED` : 'ALL PASSED');
process.exit(fails.length || errors.length ? 1 : 0);
