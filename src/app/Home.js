'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon } from '@/components/ui';
import HadithCard from '@/components/HadithCard';
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

function monogram(c) {
  const words = (c.ar || '').split(' ');
  const w = (words.length > 1 ? words[words.length - 1] : words[0] || '').replace(/^ال/, '');
  return w.charAt(0) || '؟';
}

export function CollectionCard({ c }) {
  const { t, settings } = useApp();
  return (
    <Link href={`/c/${c.id}/`} className="colcard">
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
        <span className="badge">{t('tagline')}</span>
        <h1>{t('heroTitle')}</h1>
        <p className="lead">{t('heroSub')}</p>
        <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/search/?q=${encodeURIComponent(q)}`); }}>
          <span className="lead">{Icon.search}</span>
          <label htmlFor="hq" className="sr-only">{t('search')}</label>
          <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} dir="auto" />
          <button className="btn primary" type="submit">{t('search')}</button>
        </form>
        <div className="row" style={{ justifyContent: 'center' }}>
          {TOPICS.map((tp) => (
            <Link key={tp.en} className="chip" href={`/search/?q=${encodeURIComponent(tp.q[topicLang])}&lang=${topicLang}`}>{tp[settings.ui] || tp.en}</Link>
          ))}
        </div>
        <div className="stats">
          <span><strong>{collections.length}</strong> {t('books')}</span>
          <span><strong>{total.toLocaleString()}</strong> {t('hadiths')}</span>
          <span><strong>114</strong> {t('surah').toLowerCase()}</span>
          <span><strong>10</strong> {t('language').toLowerCase()}</span>
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
        <div className="section-head"><h2>{t('explore')}</h2></div>
        <div className="grid">
          <Link href="/quran/" className="feature brand">
            <span className="icon">{Icon.quran}</span>
            <h3>{t('quran')}</h3>
            <p>{t('quranDesc')}</p>
          </Link>
          <Link href="/duas/" className="feature">
            <span className="icon">{Icon.hands}</span>
            <h3>{t('duas')}</h3>
            <p>{t('duasDesc')}</p>
          </Link>
          <Link href="/glossary/" className="feature">
            <span className="icon">{Icon.glossary}</span>
            <h3>{t('glossary')}</h3>
            <p>{t('glossaryDesc')}</p>
          </Link>
          <Link href="/narrators/" className="feature">
            <span className="icon">{Icon.people}</span>
            <h3>{t('narrators')}</h3>
            <p>{t('narratorsDesc')}</p>
          </Link>
        </div>
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
