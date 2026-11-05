'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon } from '@/components/ui';
import { LANG_NAMES } from '@/lib/i18n';

export default function CollectionView({ col }) {
  const { t, settings } = useApp();
  const router = useRouter();
  const [num, setNum] = useState('');
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();
  const sections = col.sections.filter((s) => !q || `${s.id} ${s.title} ${s.tu || ''} ${s.sub || ''}`.toLowerCase().includes(q));
  const maxCount = Math.max(...col.sections.map((s) => s.count));
  const urFirst = settings.ui === 'ur';
  const maxNum = Math.max(...col.sections.map((s) => s.to));
  return (
    <div className="container">
      <nav className="breadcrumb"><Link href="/collections/">{t('collections')}</Link><span>/</span></nav>

      <header className="colhero spot">
        <span className="bg-ar" aria-hidden="true">{col.ar}</span>
        <div className="colhero-main">
          <span className="ar colhero-ar" lang="ar">{col.ar}</span>
          <h1><CName c={col} /></h1>
          <p className="colhero-by">
            {settings.ui === 'ar' || settings.ui === 'ur' ? col.authorAr : col.author}{col.death ? ` · d. ${col.death} AH` : ''}
          </p>
          <div className="colhero-langs">
            {col.langs.map((l) => <span key={l} className="chip static" lang={l}>{LANG_NAMES[l]}</span>)}
          </div>
          {col.source === 'openiti' && <p className="badge gold" style={{ marginTop: 12, display: 'inline-block', whiteSpace: 'normal', lineHeight: 1.6, padding: '6px 12px' }}>{t('partialNote')}</p>}
        </div>
        <dl className="colhero-stats">
          <div><dt>{t('hadiths')}</dt><dd>{col.count.toLocaleString()}</dd></div>
          <div><dt>{t('books')}</dt><dd>{col.sections.length}</dd></div>
        </dl>
      </header>

      <div className="coltools card">
        <form onSubmit={(e) => { e.preventDefault(); if (num) router.push(`/hadith/?c=${col.id}&n=${num}`); }}>
          <label className="sr-only" htmlFor="num">{t('goToNumber')}</label>
          <input id="num" className="input" inputMode="decimal" value={num} onChange={(e) => setNum(e.target.value)} placeholder={`${t('goToNumber')} (1 – ${maxNum})`} />
          <button className="btn primary">{t('go')}</button>
        </form>
        <div className="coltools-filter">
          <span className="lead" aria-hidden="true">{Icon.search}</span>
          <label className="sr-only" htmlFor="flt">{t('chapterList')}</label>
          <input id="flt" className="input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`${t('chapterList')}…`} dir="auto" />
        </div>
        <Link className="btn" href={`/search/?c=${col.id}`}>{Icon.search}{t('search')}</Link>
      </div>

      <div className="chgrid" role="list">
        {sections.map((s) => {
          const en = <span className="ch-en">{s.title}</span>;
          const ur = s.tu ? <span className="ch-ur" lang="ur" dir="rtl">{s.tu}</span> : null;
          return (
            <Link key={s.id} href={`/c/${col.id}/${s.id}/`} className="chcard spot" role="listitem">
              <span className="ch-num">{s.id}</span>
              <span className="ch-titles">
                {urFirst ? <>{ur}{en}</> : <>{en}{ur}</>}
                {s.sub ? <span className="ch-sub" lang="ar" dir="rtl">{s.sub}</span> : null}
              </span>
              <span className="ch-meta">
                <span className="ch-bar" aria-hidden="true"><i style={{ width: `${Math.max(6, (s.count / maxCount) * 100)}%` }} /></span>
                <span className="ch-count">{s.count.toLocaleString()} {t('hadiths')} · {s.from}–{s.to}</span>
              </span>
            </Link>
          );
        })}
        {!sections.length && <div className="empty" style={{ gridColumn: '1 / -1' }}>{t('noResults')}</div>}
      </div>
    </div>
  );
}
