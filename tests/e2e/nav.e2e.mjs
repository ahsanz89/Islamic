// Navigation test: build, serve out/ on :8099, run `node tests/e2e/nav.e2e.mjs`.
import { createRequire } from 'node:module';
const require = createRequire(process.env.PLAYWRIGHT_PATH || import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8099';
const fails = [], errors = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL', m); } };
const browser = await chromium.launch();
const hrefs = new Set();
const sizes = [{ n: 'desktop', width: 1280, height: 850 }, { n: 'tablet', width: 820, height: 1000 }, { n: 'phone', width: 390, height: 800 }];
for (const theme of ['light', 'dark']) for (const ui of ['en', 'ur']) for (const vp of sizes) {
  const tag = `${vp.n}/${theme}/${ui}`;
  const ctx = await browser.newContext({ viewport: vp, colorScheme: theme });
  await ctx.addInitScript(([u, th]) => { try { localStorage.setItem('hl.settings', JSON.stringify({ ui: u, theme: th })); } catch {} }, [ui, theme]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(tag + ' ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET|Failed to load resource/.test(m.text())) errors.push(tag + ' console: ' + m.text()); });
  await page.goto(BASE + '/');
  await page.waitForSelector('.site-header');
  if (ui === 'ur') await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ur'; });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(over <= 0, `${tag}: horizontal scroll on home (${over}px)`);
  if (vp.width > 900) {
    const tops = await page.$$eval('.site-nav .nav-top', (b) => b.map((x) => x.textContent.trim()));
    ok(tops.length === 6, `${tag}: 6 top items (${tops})`);
    ok(await page.locator('.site-nav .feature-link').isVisible(), `${tag}: Learn Arabic visible`);
    // dropdowns: click, outside click, Escape, keyboard
    for (const id of ['quran', 'learn', 'hadith', 'guidance']) {
      const btn = page.locator(`[data-nav="${id}"]`);
      await btn.click();
      ok(await page.locator(`#panel-${id} .nav-panel`).isVisible(), `${tag}: ${id} opens`);
      const box = await page.locator(`#panel-${id} .nav-panel`).boundingBox();
      ok(box && box.x >= 0 && box.x + box.width <= vp.width, `${tag}: ${id} panel inside viewport ${JSON.stringify(box)}`);
      for (const h of await page.$$eval(`#panel-${id} a`, (a) => a.map((x) => x.getAttribute('href')))) hrefs.add(h);
      await page.keyboard.press('Escape');
      ok(!(await page.locator(`#panel-${id}`).count()), `${tag}: ${id} closes with Escape`);
      ok(await btn.evaluate((b) => document.activeElement === b), `${tag}: focus returns to ${id}`);
    }
    await page.locator('[data-nav="learn"]').click();
    await page.mouse.click(10, 600);
    ok(!(await page.locator('#panel-learn').count()), `${tag}: outside click closes`);
    await page.locator('[data-nav="quran"]').focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForSelector('#panel-quran .nav-panel');
    ok(await page.waitForFunction(() => document.activeElement?.closest('#panel-quran') !== null, null, { timeout: 2000 }).then(() => true, () => false), `${tag}: ArrowDown moves into menu`);
    if (theme === 'light' && ui === 'en' && vp.n === 'desktop') { await page.locator('[data-nav="learn"]').click(); await page.waitForTimeout(500); await page.screenshot({ path: '/tmp/nav-mega.png' }); }
    if (theme === 'dark' && ui === 'ur' && vp.n === 'desktop') { await page.locator('[data-nav="learn"]').click(); await page.waitForTimeout(500); await page.screenshot({ path: '/tmp/nav-mega-ur.png' }); }
  } else {
    ok(!(await page.locator('.site-nav').isVisible()), `${tag}: desktop nav hidden`);
    await page.locator('.nav-burger').click();
    await page.waitForSelector('#mobile-menu');
    ok(await page.locator('.mm-promo').isVisible(), `${tag}: Learn Arabic promo in drawer`);
    const bw = await page.evaluate(() => { const m = document.querySelector('#mobile-menu'); return m.scrollWidth - m.clientWidth; });
    ok(bw <= 0, `${tag}: drawer no horizontal scroll`);
    for (const h of await page.$$eval('#mobile-menu a', (a) => a.map((x) => x.getAttribute('href')))) hrefs.add(h);
    const small = await page.$$eval('#mobile-menu a, #mobile-menu summary', (els) => els.filter((e) => e.getBoundingClientRect().height < 40).length);
    ok(small === 0, `${tag}: touch targets >= 40px (${small} small)`);
    if (theme === 'light' && vp.n === 'phone') { await page.waitForTimeout(500); await page.screenshot({ path: `/tmp/nav-mobile-${ui}.png` }); }
    await page.keyboard.press('Escape');
    ok(!(await page.locator('#mobile-menu').count()), `${tag}: Escape closes drawer`);
    await page.locator('.nav-burger').click();
    await page.locator('.mm-promo').click();
    await page.waitForURL('**/learn-arabic/');
    ok(!(await page.locator('#mobile-menu').count()), `${tag}: drawer closes after navigating`);
    ok((await page.locator('.tabbar a[aria-current="page"]').getAttribute('href')).includes('learn'), `${tag}: Learn tab active on Learn Arabic`);
  }
  // active state
  await page.goto(BASE + '/learn-arabic/');
  if (vp.width > 900) {
    ok(await page.locator('.site-nav .feature-link[aria-current="page"]').count() === 1, `${tag}: Learn Arabic active`);
    ok(await page.locator('[data-nav="learn"][aria-current="page"]').count() === 0, `${tag}: Learn not active on /learn-arabic/`);
    await page.goto(BASE + '/learn/');
    ok(await page.locator('[data-nav="learn"][aria-current="page"]').count() === 1, `${tag}: Learn active on /learn/`);
  }
  // home promo
  await page.goto(BASE + '/');
  ok((await page.locator('.la-word').count()) === 5, `${tag}: five words of the day`);
  const w = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(w <= 0, `${tag}: no horizontal scroll with promo (${w})`);
  await ctx.close();
}
// every link goes to a real page
const ctx = await browser.newContext(); const pg = await ctx.newPage();
for (const h of hrefs) { const r = await pg.goto(BASE + h); ok(r && r.status() === 200, `link ${h} -> ${r && r.status()}`); }
console.log('links checked:', [...hrefs].join(' '));
await browser.close();
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no console errors');
console.log(fails.length ? `${fails.length} FAILED` : 'ALL PASSED');
process.exit(fails.length || errors.length ? 1 : 0);
