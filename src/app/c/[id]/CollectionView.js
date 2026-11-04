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
  const sections = col.sections.filter((s) => !filter || (s.title + ' ' + s.sub).toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="container">
      <div className="page-head">
        <nav className="breadcrumb"><Link href="/collections/">{t('collections')}</Link><span>/</span></nav>
        <div className="row" style={{ alignItems: 'center', gap: 16 }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h1><CName c={col} /></h1>
            <p className="muted" style={{ margin: 0 }}>
              {settings.ui === 'ar' || settings.ui === 'ur' ? col.authorAr : col.author}{col.death ? ` · d. ${col.death} AH` : ''}
            </p>
          </div>
          <span className="ar" style={{ fontSize: 34, color: 'var(--brand)', lineHeight: 1.4 }}>{col.ar}</span>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <span className="badge">{col.count.toLocaleString()} {t('hadiths')}</span>
          <span className="badge grey">{col.sections.length} {t('books')}</span>
          {col.langs.map((l) => <span key={l} className="badge grey" lang={l}>{LANG_NAMES[l]}</span>)}
        </div>
        {col.source === 'openiti' && <p className="badge gold" style={{ marginTop: 12, display: 'inline-block', whiteSpace: 'normal', lineHeight: 1.6, padding: '6px 12px' }}>{t('partialNote')}</p>}
      </div>

      <div className="layout">
        <aside className="side card filters">
          <form className="group" onSubmit={(e) => { e.preventDefault(); if (num) router.push(`/hadith/?c=${col.id}&n=${num}`); }}>
            <label className="group-title" htmlFor="num">{t('goToNumber')}</label>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <input id="num" className="input" inputMode="decimal" value={num} onChange={(e) => setNum(e.target.value)} placeholder={`1 – ${Math.max(...col.sections.map((s) => s.to))}`} />
              <button className="btn primary">{t('go')}</button>
            </div>
          </form>
          <div className="group">
            <label className="group-title" htmlFor="flt">{t('chapterList')}</label>
            <input id="flt" className="input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('search') + '…'} dir="auto" />
          </div>
          <div className="group">
            <Link className="btn" href={`/search/?c=${col.id}`}>{Icon.search}{t('search')} · <CName c={col} /></Link>
          </div>
        </aside>
        <div className="content card list">
          {sections.map((s) => (
            <Link key={s.id} href={`/c/${col.id}/${s.id}/`} className="item">
              <span className="row" style={{ flexWrap: 'nowrap', gap: 14, minWidth: 0 }}>
                <span className="idx">{s.id}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block' }}>{s.title}</strong>
                  {s.sub ? <span className="muted small" lang="ar" dir="rtl" style={{ display: 'block' }}>{s.sub}</span> : null}
                </span>
              </span>
              <span className="muted small" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{s.from}–{s.to}</span>
            </Link>
          ))}
          {!sections.length && <div className="empty" style={{ margin: 16 }}>{t('noResults')}</div>}
        </div>
      </div>
    </div>
  );
}
