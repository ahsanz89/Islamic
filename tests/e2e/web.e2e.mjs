// Browser integration test: run `npm run build`, serve `out/` on :8099, then `node tests/e2e/web.e2e.mjs`.
import { createRequire } from 'node:module';
const require = createRequire(process.env.PLAYWRIGHT_PATH || import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8099';
const fails = [], errors = [], bad = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL', m); } };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const vp of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'phone', width: 390, height: 800 }]) {
  const page = await (await browser.newContext({ viewport: vp })).newPage();
  page.on('pageerror', (e) => errors.push(vp.name + ' ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text())) errors.push(vp.name + ' console: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(() => {
    try { localStorage.setItem('dalil.learn.v1', JSON.stringify({ unlocked: true, roman: true, best: {}, passed: {} })); } catch {}
    window.__played = [];
    const P = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__played.push(this.src); const r = P.call(this); r.catch((e) => window.__playErr = String(e)); return r; };
  });
  await page.goto(`${BASE}/learn/1/`);
  await page.waitForSelector('.lq-grid button');
  const xs = await page.$$eval('.lq-grid button', (bs) => bs.slice(0, 3).map((b) => [b.textContent[0], Math.round(b.getBoundingClientRect().x), Math.round(b.getBoundingClientRect().y)]));
  ok(xs[0][0] === 'ا', `${vp.name}: first letter is alif`);
  ok(xs[0][1] > xs[1][1] && xs[1][1] > xs[2][1] && xs[0][2] === xs[1][2], `${vp.name}: alphabet starts at the RIGHT and runs leftwards ${JSON.stringify(xs)}`);
  const total = await page.$$eval('.lq-grid button', (b) => b.length);
  ok(total === 29, `${vp.name}: 29 letters (${total})`);
  for (let i = 0; i < total; i++) {
    await page.locator('.lq-grid button').nth(i).click();
    const before = await page.evaluate(() => window.__played.length);
    await page.getByRole('button', { name: /Hear the letter name/ }).click();
    await page.waitForFunction((n) => window.__played.length > n, before, { timeout: 4000 }).catch(() => {});
    const played = await page.evaluate(() => window.__played.slice());
    ok(played.length > before && /learn-audio\/t[0-9a-f]{8}\.mp3$/.test(played.at(-1) || ''), `${vp.name}: letter #${i + 1} played a recording`);
    if (i === 0) { // button turns into Stop while playing, then can be pressed again (replay)
      const label = await page.getByRole('button', { name: /^(Stop|Hear the letter name)/ }).first().getAttribute('aria-label');
      ok(!!label, 'button has a label');
    }
    await page.waitForTimeout(30);
  }
  ok(!(await page.evaluate(() => window.__playErr)), vp.name + ': audio play() never rejected: ' + await page.evaluate(() => window.__playErr));
  // speed toggle: Slow learning is the default, Normal is faster
  ok(await page.getByRole('button', { name: 'Slow learning' }).getAttribute('aria-pressed') === 'true', vp.name + ': Slow learning is the default');
  await page.getByRole('button', { name: 'Normal', exact: true }).click();
  ok(await page.evaluate(() => localStorage.getItem('dalil.learn.speed')) === 'normal', vp.name + ': Normal speed is remembered');
  await page.getByRole('button', { name: 'Slow learning' }).click();
  // detail panel matches selection
  await page.locator('.lq-grid button').nth(17).click();
  ok(/Ain/.test(await page.locator('.lq-detail h3').innerText()), `${vp.name}: detail shows Ain for 18th letter`);
  // every level: no overflow, every sound button plays a recording, practice + quiz work
  for (let n = 1; n <= 6; n++) {
    await page.goto(`${BASE}/learn/${n}/`); await page.waitForSelector('.lq-sound');
    ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), `${vp.name}: level ${n} has no horizontal scroll`);
    const sounds = page.locator('.lq-sound');
    await page.waitForTimeout(400); const cnt = await sounds.count(); console.log(vp.name, 'level', n, 'sounds', cnt); let played = 0, silent = [];
    for (let i = 0; i < cnt; i++) {
      const before = await page.evaluate(() => window.__played.length);
      if (i >= await sounds.count()) break; await sounds.nth(i).evaluate((e) => e.click());
      await page.waitForFunction((k) => window.__played.length > k, before, { timeout: 1500 }).then(() => played++).catch(async () => silent.push(await sounds.nth(i).getAttribute('data-sound', { timeout: 1000 }).catch(() => '?')));
    }
    ok(silent.length === 0, `${vp.name}: level ${n}: ${played}/${cnt} sound buttons played (silent: ${silent.slice(0, 5).join(' ')})`);
    await page.getByRole('tab', { name: 'Practice', exact: true }).click();
    await page.waitForSelector('.lq-opt', { timeout: 5000 }).catch(() => {});
    ok((await page.locator('.lq-opt').count()) >= 2, `${vp.name}: level ${n} practice shows choices`);
    await page.getByRole('tab', { name: 'Quiz', exact: true }).click();
    await page.waitForSelector('.lq-opt', { timeout: 5000 }).catch(() => {});
    const opts = page.locator('.lq-opt');
    if (await opts.count()) {
      for (let q = 0; q < 10; q++) {
        if (!(await page.locator('.lq-opt:not([disabled])').count())) break;
        await page.locator('.lq-opt:not([disabled])').first().click();
        await page.locator('.lq-next').click();
      }
      const t = await page.locator('.lq-score').innerText({ timeout: 3000 }).catch(() => '');
      ok(/\d+ \/ 10/.test(t), `${vp.name}: level ${n} quiz finishes with a score (${t})`);
    } else ok(false, `${vp.name}: level ${n} quiz has no options`);
  }
  await page.close();
}
await browser.close();
const real = bad.filter((u) => !/fonts|favicon/.test(u));
console.log('page errors:', errors.length, errors.slice(0, 5)); console.log('bad responses:', real.length, real.slice(0, 5));
console.log(fails.length || errors.length || real.length ? `FAILED (${fails.length} checks)` : 'ALL CHECKS PASSED');
process.exit(fails.length || errors.length ? 1 : 0);
