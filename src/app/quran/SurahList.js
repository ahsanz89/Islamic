'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/ui';

export default function SurahList({ surahs }) {
  const { t } = useApp();
  const [f, setF] = useState('');
  const [place, setPlace] = useState('all');
  const list = surahs.filter((s) =>
    (place === 'all' || s.place === place) &&
    (!f || `${s.n} ${s.name} ${s.en} ${s.ar}`.toLowerCase().includes(f.toLowerCase())));
  return (
    <div className="container">
      <div className="page-head">
        <h1>{t('quran')}</h1>
        <p className="muted" style={{ margin: 0 }}>{t('quranDesc')}</p>
      </div>
      <div className="card pad stack" style={{ marginBottom: 24 }}>
        <div className="searchbar" style={{ boxShadow: 'none' }}>
          <span className="lead">{Icon.search}</span>
          <label htmlFor="sf" className="sr-only">{t('surah')}</label>
          <input id="sf" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('surah') + '…'} dir="auto" style={{ minHeight: 40, fontSize: 15 }} />
        </div>
        <div className="row">
          <div className="segmented">
            <button aria-pressed={place === 'all'} onClick={() => setPlace('all')}>{t('allResults')}</button>
            <button aria-pressed={place === 'Mecca'} onClick={() => setPlace('Mecca')}>{t('meccan')}</button>
            <button aria-pressed={place === 'Madina'} onClick={() => setPlace('Madina')}>{t('medinan')}</button>
          </div>
          <span className="spacer" />
          <Link className="btn small" href="/quran/roots/">{t('roots')}</Link>
          <Link className="btn small" href="/search/?scope=quran">{Icon.search}{t('search')}</Link>
        </div>
      </div>
      <div className="grid">
        {list.map((s) => (
          <Link key={s.n} href={`/quran/${s.n}/`} className="colcard">
            <span className="mono" style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 800 }}>{s.n}</span>
            <span className="body">
              <span className="name">{s.name}</span>
              <span className="meta">{s.en} · {s.verses} {t('verses')} · {s.place === 'Mecca' ? t('meccan') : t('medinan')}</span>
            </span>
            <span className="quran-ar" style={{ fontSize: 22, lineHeight: 1.5, color: 'var(--brand)' }}>{s.ar.replace(/^سُوْرَةُ\s*/, '')}</span>
          </Link>
        ))}
      </div>
      {!list.length && <div className="empty">{t('noResults')}</div>}
    </div>
  );
}
