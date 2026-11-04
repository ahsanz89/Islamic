'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { BookmarkButton, CName, CopyButton } from '@/components/ui';
import { Translations, hadithHref } from '@/components/HadithCard';
import { getHadith } from '@/lib/client-data';
import { stripDiacritics } from '@/lib/arabic.mjs';

function Dua({ d }) {
  const { settings, t } = useApp();
  const [r, setR] = useState(null);
  useEffect(() => { getHadith(d.c, d.n).then(setR).catch(() => {}); }, [d.c, d.n]);
  const title = d[settings.ui] || d.en;
  const h = r?.hadith;
  return (
    <article className="hadith" id={d.id}>
      <div className="hadith-head">
        <strong>{title}</strong>
        <span className="spacer" />
        <BookmarkButton small iconOnly item={{ key: `d:${d.id}`, type: 'dua', id: d.id, title: d.en, preview: d.ar }} />
        {h && <CopyButton small iconOnly text={`${title}\n\n${h.ar}`} />}
      </div>
      <div className="hadith-body">
        {!h ? <p className="muted">{t('loading')}</p> : (
          <>
            <p className="ar" lang="ar" style={{ margin: 0 }}>
              {h.mi > 0 && <span className="isnad">{settings.harakat ? h.ar.slice(0, h.mi) : stripDiacritics(h.ar.slice(0, h.mi))}</span>}
              {settings.harakat ? h.ar.slice(h.mi) : stripDiacritics(h.ar.slice(h.mi))}
            </p>
            <Translations t={h.t} />
            <Link href={hadithHref(d.c, d.n)} className="small">{t('source')}: <CName c={r.col} /> {d.n} →</Link>
          </>
        )}
      </div>
    </article>
  );
}

export default function Duas({ data }) {
  const { t, settings } = useApp();
  const [cat, setCat] = useState('all');
  const list = data.duas.filter((d) => cat === 'all' || d.cat === cat);
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>{t('duas')}</h1>
        <div className="row">
          <button className="chip" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{t('allResults')}</button>
          {data.categories.map((c) => (
            <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c[settings.ui] || c.en}</button>
          ))}
        </div>
      </div>
      <div className="stack" style={{ gap: 16 }}>{list.map((d) => <Dua key={d.id} d={d} />)}</div>
    </div>
  );
}
