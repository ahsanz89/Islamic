'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon } from '@/components/ui';
import HadithCard from '@/components/HadithCard';
import PrayerTimes from '@/components/PrayerTimes';
import { getHadith } from '@/lib/client-data';
import { LANGUAGES } from '@/lib/i18n';

// Well-known short hadith from Sahih al-Bukhari, rotated daily.
const DAILY = [1, 10, 13, 39, 52, 6011, 6018, 6094, 6114, 6412, 6416];

// Topic shortcuts: label per interface language, query per search language.
export const TOPICS = [
  { en: 'Intention', ur: 'نیت', ar: 'النية', q: { en: 'intention', ur: 'نیت', ar: 'النية' } },
  { en: 'Prayer', ur: 'نماز', ar: 'الصلاة', q: { en: 'prayer', ur: 'نماز', ar: 'الصلاة' } },
  { en: 'Fasting', ur: 'روزہ', ar: 'الصيام', q: { en: 'fast', ur: 'روزہ', ar: 'الصيام' } },
  { en: 'Charity', ur: 'صدقہ', ar: 'الصدقة', q: { en: 'charity', ur: 'صدقہ', ar: 'الصدقة' } },
  { en: 'Parents', ur: 'والدین', ar: 'الوالدين', q: { en: 'parents', ur: 'والدین', ar: 'الوالدين' } },
  { en: 'Patience', ur: 'صبر', ar: 'الصبر', q: { en: 'patience', ur: 'صبر', ar: 'الصبر' } },
  { en: 'Knowledge', ur: 'علم', ar: 'العلم', q: { en: 'knowledge', ur: 'علم', ar: 'العلم' } },
  { en: 'Neighbours', ur: 'پڑوسی', ar: 'الجار', q: { en: 'neighbor', ur: 'پڑوسی', ar: 'جاره' } }
];

/** Counts up to `value` once visible (instant when the user prefers reduced motion). */
function CountUp({ value }) {
  const ref = useRef(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') return;
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1100;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

/** Headline with its last words highlighted in the accent gradient. */
function Headline({ text, words }) {
  const parts = text.split(' ');
  const k = Math.min(words, parts.length - 1);
  return <>{parts.slice(0, parts.length - k).join(' ')} <em>{parts.slice(parts.length - k).join(' ')}</em></>;
}

function Tile({ href, cls = '', icon, title, text, go, bg }) {
  return (
    <Link href={href} className={`tile spot ${cls}`}>
      {bg && <span className="bg-ar" aria-hidden="true">{bg}</span>}
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="go">{go}{Icon.arrow}</span>
    </Link>
  );
}

function monogram(c) {
  const words = (c.ar || '').split(' ');
  const w = (words.length > 1 ? words[words.length - 1] : words[0] || '').replace(/^ال/, '');
  return w.charAt(0) || '؟';
}

export function CollectionCard({ c }) {
  const { t, settings } = useApp();
  return (
    <Link href={`/c/${c.id}/`} className="colcard spot">
      <span className={`mono ${c.source === 'openiti' ? 'alt' : ''}`} aria-hidden="true">{monogram(c)}</span>
      <span className="body">
        <span className="name"><CName c={c} /></span>
        {settings.ui !== 'ar' && <span className="arname" lang="ar">{c.ar}</span>}
        <span className="meta">
          {c.count.toLocaleString()} {t('hadiths')}
          {c.langs.length > 1 ? ` · ${c.langs.length} ${t('translations').toLowerCase()}` : ` · ${t('arabicOnly')}`}
        </span>
      </span>
    </Link>
  );
}

export default function Home({ collections }) {
  const { t, update, settings, lastRead } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [daily, setDaily] = useState(null);

  useEffect(() => {
    const day = Math.floor(Date.now() / 86400000);
    getHadith('bukhari', DAILY[day % DAILY.length]).then(setDaily).catch(() => {});
  }, []);

  const total = collections.reduce((a, c) => a + c.count, 0);
  const featured = collections.filter((c) => c.group === 'six' || c.id === 'malik' || c.id === 'ahmad' || c.id === 'mishkat').slice(0, 9);
  const topicLang = settings.ui === 'ur' ? 'ur' : settings.ui === 'ar' ? 'ar' : 'en';

  return (
    <div className="container">
      <section className="hero">
        <span className="hero-glow" aria-hidden="true" />
        <div className="hero-text">
        <span className="badge gold">{t('tagline')}</span>
        <h1><Headline text={t('heroTitle')} words={settings.ui === 'ur' || settings.ui === 'ar' ? 2 : 3} /></h1>
        <p className="lead">{t('heroSub')}</p>
        <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/search/?q=${encodeURIComponent(q)}`); }}>
          <span className="lead">{Icon.search}</span>
          <label htmlFor="hq" className="sr-only">{t('search')}</label>
          <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} dir="auto" />
          <button className="btn primary" type="submit">{t('search')}</button>
        </form>
        <div className="topics">
          {TOPICS.map((tp) => (
            <Link key={tp.en} className="chip" href={`/search/?q=${encodeURIComponent(tp.q[topicLang])}&lang=${topicLang}`}>{tp[settings.ui] || tp.en}</Link>
          ))}
        </div>
        <div className="stats">
          <div className="s"><strong><CountUp value={collections.length} /></strong><span className="l">{t('books')}</span></div>
          <div className="s"><strong><CountUp value={total} /></strong><span className="l">{t('hadiths')}</span></div>
          <div className="s"><strong><CountUp value={114} /></strong><span className="l">{t('surah')}</span></div>
          <div className="s"><strong><CountUp value={10} /></strong><span className="l">{t('language')}</span></div>
        </div>
        </div>
        <PrayerTimes />
      </section>

      <section>
        <div className="bento">
          <Tile href="/quran/" cls="green t-6 t-r2" icon={Icon.quran} title={t('quran')} text={t('quranDesc')} go={t('startReading')} bg="القرآن" />
          <Tile href="/collections/" cls="t-6" icon={Icon.books} title={t('collections')} text={`${collections.length} ${t('books')} · ${total.toLocaleString()} ${t('hadiths')}`} go={t('allCollections')} />
          <Tile href="/duas/" cls="t-3" icon={Icon.hands} title={t('duas')} text={t('duasDesc')} go={t('duas')} />
          <Tile href="/namaz/" cls="sun t-3" icon={Icon.hands} title={t('tilePrayer')} text={t('namazDesc')} go={t('namazDownload')} />
          <Tile href="/search/" cls="t-4" icon={Icon.search} title={t('tileSearch')} text={t('tileSearchDesc')} go={t('search')} />
          <Tile href="/glossary/" cls="t-4" icon={Icon.glossary} title={t('glossary')} text={t('glossaryDesc')} go={t('glossary')} />
          <Tile href="/narrators/" cls="t-4" icon={Icon.people} title={t('narrators')} text={t('narratorsDesc')} go={t('narrators')} />
        </div>
      </section>

      {lastRead && (
        <section>
          <p className="eyebrow" style={{ marginBottom: 10 }}>{t('continueReading')}</p>
          <Link href={lastRead.path} className="continue">
            <span className="feature" style={{ padding: 0, border: 0, boxShadow: 'none', background: 'none' }}><span className="icon">{Icon.books}</span></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block' }}>{lastRead.title}</strong>
              {lastRead.sub && <span className="muted small">{lastRead.sub}</span>}
            </span>
            {Icon.next}
          </Link>
        </section>
      )}

      <section>
        <div className="section-head"><p className="eyebrow">{t('hadithOfDay')}</p></div>
        {daily?.hadith ? <HadithCard col={daily.col} h={daily.hadith} /> : <div className="empty">{t('loading')}</div>}
      </section>

      <section>
        <div className="section-head">
          <h2>{t('collections')}</h2>
          <Link href="/collections/">{t('allCollections')} ({collections.length}) →</Link>
        </div>
        <div className="grid">{featured.map((c) => <CollectionCard key={c.id} c={c} />)}</div>
      </section>

      <section>
        <div className="section-head"><h2>{t('uiLanguage')}</h2></div>
        <div className="row">
          {LANGUAGES.map((l) => (
            <button key={l.code} className="chip" lang={l.code} aria-pressed={settings.ui === l.code} onClick={() => update({ ui: l.code })}>{l.native}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
