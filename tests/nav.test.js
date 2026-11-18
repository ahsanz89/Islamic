import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { NAV, SALAH_PROMO, currentHref, hrefsOf, pickLabel, sectionActive } from '../src/components/nav-data';
import { wordsOfDay } from '../src/components/LearnArabicPromo';

const pageExists = (href) => {
  const segs = href.split('/').filter(Boolean);
  const dir = path.join('src/app', ...segs.slice(0, 1));
  if (!fs.existsSync(path.join(dir, 'page.js'))) return false;
  if (segs.length === 1) return true;
  return fs.existsSync(path.join(dir, '[level]', 'page.js')) || fs.existsSync(path.join(dir, '[s]', 'page.js')) || fs.existsSync(path.join(dir, segs[1], 'page.js'));
};

describe('navigation data', () => {
  it('every link points at a real page', () => { for (const h of hrefsOf()) expect(pageExists(h), h).toBe(true); });
  it('has no duplicate destinations inside the menus', () => {
    const all = NAV.flatMap((n) => (n.groups || []).flatMap((g) => g.items.map((i) => i.href)));
    expect(new Set(all).size).toBe(all.length);
  });
  it('every label exists in English, Urdu and Arabic', () => {
    for (const n of NAV) { for (const l of ['en', 'ur', 'ar']) expect(n.label[l], n.id).toBeTruthy(); for (const g of n.groups || []) for (const i of g.items) for (const l of ['en', 'ur', 'ar']) { expect(i.label[l], i.href).toBeTruthy(); expect(i.desc[l], i.href).toBeTruthy(); } }
    for (const k of ['title', 'text', 'short', 'five', 'salah']) for (const l of ['en', 'ur', 'ar']) expect(SALAH_PROMO[k][l]).toBeTruthy();
  });
  it('Learn Arabic is a top-level item and Understand Your Salah is in the Learn menu', () => {
    expect(NAV.find((n) => n.id === 'arabic')).toMatchObject({ href: '/learn-arabic/', feature: true });
    expect(NAV.find((n) => n.id === 'learn').groups.flatMap((g) => g.items).map((i) => i.href)).toContain('/learn-arabic/2/');
  });
  it('active states: Learn does not light up on Learn Arabic pages', () => {
    const learn = NAV.find((n) => n.id === 'learn'), arabic = NAV.find((n) => n.id === 'arabic');
    expect(sectionActive(learn, '/learn/3/')).toBe(true);
    expect(sectionActive(learn, '/learn-arabic/2/')).toBe(false);
    expect(sectionActive(arabic, '/learn-arabic/2/')).toBe(true);
    expect(sectionActive(NAV.find((n) => n.id === 'quran'), '/quran/18/')).toBe(true);
    expect(currentHref(learn, '/learn-arabic/2/')).toBe('/learn-arabic/2/');
    expect(currentHref(NAV.find((n) => n.id === 'quran'), '/quran/roots/')).toBe('/quran/roots/');
  });
  it('falls back to English for unknown languages', () => { expect(pickLabel({ en: 'a', ur: 'b' }, 'tr')).toBe('a'); });
  it('five words of the day are five different words and change daily', () => {
    const a = wordsOfDay(20000), b = wordsOfDay(20001);
    expect(new Set(a.map((w) => w.a)).size).toBe(5);
    expect(a.map((w) => w.a)).not.toEqual(b.map((w) => w.a));
  });
});
