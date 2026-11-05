'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon, ReadingBar } from '@/components/ui';
import HadithCard, { hadithHref } from '@/components/HadithCard';
import { getHadith } from '@/lib/client-data';

export default function HadithPage() {
  const { t, setLastRead } = useApp();
  const sp = useSearchParams();
  const c = sp.get('c') || 'bukhari';
  const n = sp.get('n') || '1';
  const [r, setR] = useState(null);
  useEffect(() => {
    setR(null);
    getHadith(c, n).then(setR).catch(() => setR({ error: true }));
  }, [c, n]);
  useEffect(() => {
    if (r?.col) document.title = `${r.col.en} ${n} · DALIL`;
    if (r?.hadith) setLastRead({ path: `/hadith/?c=${c}&n=${n}`, title: `${r.col.en} ${n}`, sub: r.sec?.title });
  }, [r, n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!r) return <div className="container narrow"><div className="empty" style={{ marginTop: 32 }}>{t('loading')}</div></div>;
  if (r.error || !r.hadith) return <div className="container narrow"><div className="empty" style={{ marginTop: 32 }}>{t('notFound')}</div></div>;

  const { col, sec, items, idx, hadith } = r;
  const prevH = items[idx - 1];
  const nextH = items[idx + 1];
  const prevSec = col.sections[col.sections.indexOf(sec) - 1];
  const nextSec = col.sections[col.sections.indexOf(sec) + 1];
  const prevLink = prevH ? hadithHref(c, prevH.n) : prevSec ? hadithHref(c, prevSec.to) : null;
  const nextLink = nextH ? hadithHref(c, nextH.n) : nextSec ? hadithHref(c, nextSec.from) : null;

  return (
    <div className="container narrow">
      <div className="page-head" style={{ paddingBottom: 8 }}>
        <nav className="breadcrumb">
          <Link href="/collections/">{t('collections')}</Link><span>/</span>
          <Link href={`/c/${c}/`}><CName c={col} /></Link><span>/</span>
          <Link href={`/c/${c}/${sec.id}/`}>{sec.title}</Link>
        </nav>
      </div>
      {col.langs.length > 1 && <ReadingBar choices={col.langs.filter((l) => l !== 'ar')} />}
      <HadithCard col={col} h={hadith} full />
      <div className="row" style={{ margin: '20px 0' }}>
        {prevLink ? <Link className="btn" href={prevLink}>{Icon.back}{t('prev')}</Link> : null}
        <span className="spacer" />
        {nextLink ? <Link className="btn primary" href={nextLink}>{t('next')}{Icon.next}</Link> : null}
      </div>
    </div>
  );
}
