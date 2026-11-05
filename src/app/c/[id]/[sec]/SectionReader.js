'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon, Loader, ReadingBar } from '@/components/ui';
import HadithCard from '@/components/HadithCard';
import { getJSON } from '@/lib/client-data';

export default function SectionReader({ col, sec, prev, next }) {
  const { t, setLastRead } = useApp();
  const [items, setItems] = useState(null);
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    setItems(null);
    setLimit(20);
    getJSON(`c/${col.id}/${sec.id}.json`).then(setItems).catch(() => setItems([]));
    setLastRead({ path: `/c/${col.id}/${sec.id}/`, title: `${col.en} · ${sec.title}`, sub: `${sec.from}–${sec.to}` });
  }, [col.id, sec.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container narrow">
      <div className="page-head">
        <nav className="breadcrumb">
          <Link href="/collections/">{t('collections')}</Link><span>/</span>
          <Link href={`/c/${col.id}/`}><CName c={col} /></Link><span>/</span>
        </nav>
        <p className="eyebrow">{col.source === 'hadith-api' ? `${t('book')} ${sec.id}` : <CName c={col} />}</p>
        <h1 style={{ fontSize: 30 }}>{sec.title}</h1>
        {sec.sub ? <p className="ar sm" style={{ margin: 0 }}>{sec.sub}</p> : null}
        <p className="muted small" style={{ margin: '6px 0 0' }}>{sec.count} {t('hadiths')} · {sec.from}–{sec.to}</p>
      </div>
      {col.langs.length > 1 && <ReadingBar choices={col.langs.filter((l) => l !== 'ar')} />}
      {items === null ? <Loader label={t('loading')} /> : (
        <div className="stack" style={{ gap: 16 }}>
          {items.slice(0, limit).map((h) => <HadithCard key={h.n} col={col} h={h} />)}
          {items.length > limit && <button className="btn" onClick={() => setLimit((l) => l + 20)}>{t('loadMore')} ({items.length - limit})</button>}
        </div>
      )}
      <div className="row" style={{ margin: '20px 0' }}>
        {prev ? <Link className="btn" href={`/c/${col.id}/${prev.id}/`}>{Icon.back}<span>{prev.title.length > 28 ? t('prev') : prev.title}</span></Link> : null}
        <span className="spacer" />
        {next ? <Link className="btn primary" href={`/c/${col.id}/${next.id}/`}><span>{next.title.length > 28 ? t('next') : next.title}</span>{Icon.next}</Link> : null}
      </div>
    </div>
  );
}
