// Renders PNG logo/icon assets from the SVGs. Run after build-logo.py:  node scripts/brand/build-png.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const B = path.join(root, 'public', 'brand');
const read = (f) => fs.readFileSync(path.join(B, f), 'utf8');
const browser = await chromium.launch();
async function png(svgFile, out, w, h, bg) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:${bg || 'transparent'}"><div style="width:${w}px;height:${h}px;display:grid;place-items:center">${read(svgFile).replace('<svg ', `<svg width="${w}" height="${h}" `)}</div></body>`);
  await page.screenshot({ path: out, omitBackground: !bg });
  await page.close();
}
await png('dalil-mark.svg', path.join(B, 'dalil-mark-1024.png'), 1024, 1024);
await png('dalil-mark.svg', path.join(B, 'dalil-mark-512.png'), 512, 512);
await png('dalil-icon-square.svg', path.join(B, 'icon-192.png'), 192, 192);
await png('dalil-icon-square.svg', path.join(B, 'icon-512.png'), 512, 512);
await png('dalil-icon-square.svg', path.join(B, 'apple-touch-icon.png'), 180, 180);
await png('dalil-icon-square.svg', path.join(B, 'favicon-32.png'), 32, 32);
await png('dalil-icon-square.svg', path.join(B, 'favicon-48.png'), 48, 48);
for (const [f, o] of [['dalil-logo.svg', 'dalil-logo-1200.png'], ['dalil-logo-light.svg', 'dalil-logo-light-1200.png']]) {
  const vb = read(f).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  await png(f, path.join(B, o), 1200, Math.round(1200 * vb[2] / vb[1]));
}
await browser.close();
