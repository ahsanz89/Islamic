'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from './Providers';
import { Icon } from './ui';
import { SALAH_PROMO, pickLabel } from './nav-data';
import DATA from '@/lib/arabic-data.json';
import { playWordRef } from '@/lib/arabic-audio';

const WORDS = DATA.vocab.flatMap((g) => g.words);
/** Five words that change every day (the same five all day for everyone). */
export const wordsOfDay = (day, n = 5) => Array.from({ length: n }, (_, i) => WORDS[(day * n + i) % WORDS.length]);

export default function LearnArabicPromo() {
  const { settings } = useApp();
  const ui = settings.ui;
  const [words, setWords] = useState(() => wordsOfDay(0));
  useEffect(() => { setWords(wordsOfDay(Math.floor(Date.now() / 86400000))); }, []);
  const mean = (w) => (ui === 'ur' && w.ur) || w.en;
  const cta = { en: ['Start learning', 'Understand your Salah'], ur: ['سیکھنا شروع کریں', 'اپنی نماز سمجھیں'], ar: ['ابدأ التعلّم', 'افهم صلاتك'] }[ui] || ['Start learning', 'Understand your Salah'];
  return (
    <section className="la-promo" aria-labelledby="la-promo-h">
      <div className="la-text">
        <p className="eyebrow">{pickLabel({ en: 'Learn Arabic', ur: 'عربی سیکھیں', ar: 'تعلّم العربية' }, ui)}</p>
        <h2 id="la-promo-h">{pickLabel(SALAH_PROMO.title, ui)}</h2>
        <p className="muted">{pickLabel(SALAH_PROMO.text, ui)}</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn primary" href="/learn-arabic/">{cta[0]}</Link>
          <Link className="btn" href="/learn-arabic/2/">{cta[1]}</Link>
        </div>
      </div>
      <div className="la-five">
        <p className="small muted">{pickLabel(SALAH_PROMO.five, ui)} · {pickLabel({ en: 'tap to hear', ur: 'سننے کے لیے ٹیپ کریں', ar: 'اضغط للاستماع' }, ui)}</p>
        <div className="la-words">
          {words.map((w) => (
            <button key={w.a} type="button" className="la-word" onClick={() => playWordRef(w.ref, w.a)} aria-label={`${w.a}: ${mean(w)}`} data-word={w.a}>
              <span className="quran-ar" lang="ar" dir="rtl">{w.a}</span>
              <small>{mean(w)}</small>
            </button>
          ))}
        </div>
        <Link className="go" href="/learn-arabic/1/">{pickLabel({ en: 'More words', ur: 'مزید الفاظ', ar: 'المزيد من الكلمات' }, ui)} {Icon.arrow}</Link>
      </div>
    </section>
  );
}
