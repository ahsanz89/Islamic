'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';
import { BookmarkButton, Icon, ReadingBar } from '@/components/ui';
import { SD, catName, matches, titleOf, tx } from '@/lib/special-duas';
import { GradeBadge, Translated } from './parts';

export default function SpecialDuas() {
  const { settings } = useApp();
  const ui = settings.ui; const t = tx(ui);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [kind, setKind] = useState('all');
  const list = useMemo(() => SD.duas.filter((d) => matches(d, q, cat, kind)), [q, cat, kind]);
  return (
    <div className="container narrow sd">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/duas/">{tx(ui).section === 'خاص دعائیں' ? 'دعائیں' : 'Duas'}</Link> / {t.section}</nav>
      <div className="page-head">
        <h1>{t.title}</h1>
        <p className="muted">{t.sub}</p>
      </div>
      <p className="sd-note">{t.note}</p>
      <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
        <span className="lead">{Icon.search}</span>
        <label htmlFor="sdq" className="sr-only">{t.search}</label>
        <input id="sdq" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} dir="auto" />
      </form>
      <div className="row" role="group" aria-label="Source" style={{ gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {[['all', t.all], ['hadith', t.fromHadith], ['quran', t.fromQuran]].map(([k, l]) => <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}
      </div>
      <div className="row" role="group" aria-label="Categories" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <button className="chip" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{t.all}</button>
        {SD.cats.map((c) => <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{catName(c, ui)}</button>)}
      </div>
      <div style={{ marginTop: 12 }}><ReadingBar choices={['ur', 'en', 'bn', 'hi', 'id', 'tr', 'fr', 'ru', 'ta']} /></div>
      <p className="muted small" style={{ margin: '12px 0' }} aria-live="polite">{t.count(list.length)}</p>
      {!list.length && <div className="empty">{t.none}</div>}
      <div className="stack" style={{ gap: 14 }}>
        {list.map((d) => (
          <article key={d.id} className="hadith sd-card" id={d.id}>
            <div className="hadith-head">
              <Link href={`/duas/special/${d.id}/`} className="sd-title"><strong>{titleOf(d, ui)}</strong></Link>
              <span className="spacer" />
              <GradeBadge d={d} ui={ui} />
              <BookmarkButton small iconOnly item={{ key: `sd:${d.id}`, type: 'dua', id: d.id, href: `/duas/special/${d.id}/`, title: titleOf(d, 'en'), preview: d.ar }} />
            </div>
            <div className="hadith-body">
              <p className="ar" lang="ar" dir="rtl" style={{ margin: 0 }}>{d.ar.length > 220 ? d.ar.slice(0, 220).replace(/\s\S*$/, '') + '…' : d.ar}</p>
              <Translated d={d} ui={ui} max={320} />
              <p className="muted small" style={{ margin: 0 }}>{d.src.book} {d.src.ref} · {(d.cats.filter((c) => c !== 'quran').slice(0, 2).map((c) => catName(SD.cats.find((x) => x.id === c), ui))).join(' · ')}</p>
              <Link href={`/duas/special/${d.id}/`} className="small">{ui === 'ur' ? 'تفصیل' : 'Details'} →</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
