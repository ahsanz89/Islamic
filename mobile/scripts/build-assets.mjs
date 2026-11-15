// Generates app icons, splash and store graphics from the DALIL mark. Run: npm run assets (needs playwright)
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(process.env.PLAYWRIGHT_PATH || import.meta.url);
const { chromium } = require('playwright');

const EM = '#123F35', IV = '#F7F5EF', GO = '#D5B779';
// mark geometry on a 64 grid, centred at 32,32
const mark = (stroke, gold, sw = 2.6) => `<g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="miter"><rect x="18.5" y="18.5" width="27" height="27"/><rect x="18.5" y="18.5" width="27" height="27" transform="rotate(45 32 32)"/></g>${gold ? `<rect x="27.6" y="27.6" width="8.8" height="8.8" transform="rotate(45 32 32)" fill="${gold}"/>` : ''}`;
// scale the mark by s about the centre (viewBox 64)
const svg = ({ bg, rx = 0, s = 1, stroke = IV, gold = GO, size = 1024 }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${bg ? `<rect width="64" height="64" rx="${rx}" fill="${bg}"/>` : ''}<g transform="translate(32 32) scale(${s}) translate(-32 -32)">${mark(stroke, gold, 2.6)}</g></svg>`;

const jobs = [
  ['assets/icon.png', svg({ bg: EM, s: 1.25 }), 1024, 1024],                 // iOS: opaque, square
  ['assets/adaptive-icon.png', svg({ s: 1.1 }), 1024, 1024],                  // Android foreground (safe zone)
  ['assets/adaptive-icon-mono.png', svg({ s: 1.1, stroke: '#000', gold: '#000' }), 1024, 1024],
  ['assets/splash-icon.png', svg({ s: 1.6 }), 1024, 1024],
  ['assets/favicon.png', svg({ bg: EM, rx: 15, s: 1.1, size: 48 }), 48, 48],
  ['assets/logo-mark.png', svg({ bg: EM, rx: 15, s: 1.1, size: 512 }), 512, 512],
  ['store/play-icon-512.png', svg({ bg: EM, s: 1.25, size: 512 }), 512, 512],
  ['store/app-store-icon-1024.png', svg({ bg: EM, s: 1.25 }), 1024, 1024],
];
const feature = `<html><body style="margin:0"><div style="width:1024px;height:500px;background:linear-gradient(135deg,#123F35,#1F7358);display:flex;align-items:center;justify-content:center;gap:48px;font-family:Inter,Arial,sans-serif">
<div style="width:220px;height:220px">${svg({ bg: EM, rx: 15, s: 1.1, size: 220 })}</div>
<div><div style="color:${IV};font-size:84px;font-weight:800;letter-spacing:12px">DALIL</div>
<div style="color:${GO};font-size:46px;margin-top:2px;direction:rtl;font-family:'Noto Sans Arabic',Arial">دليل</div>
<div style="color:${IV};font-size:26px;margin-top:14px;opacity:.9">Islamic Knowledge. Without Boundaries.</div></div></div></body></html>`;

mkdirSync('assets', { recursive: true }); mkdirSync('store', { recursive: true });
const b = await chromium.launch();
for (const [out, html, w, h] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`);
  await p.screenshot({ path: out, omitBackground: true });
  await p.close(); console.log('wrote', out);
}
const p = await b.newPage({ viewport: { width: 1024, height: 500 } });
await p.setContent(feature); await p.screenshot({ path: 'store/play-feature-graphic-1024x500.png' }); console.log('wrote feature graphic');
await b.close();
