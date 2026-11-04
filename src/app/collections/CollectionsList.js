'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/ui';
import { CollectionCard } from '../Home';

export default function CollectionsList({ collections, groups }) {
  const { t, settings } = useApp();
  const [group, setGroup] = useState('all');
  const [f, setF] = useState('');
  const [onlyTr, setOnlyTr] = useState(false);
  const total = collections.reduce((a, c) => a + c.count, 0);
  const gname = (g) => groups[g]?.[settings.ui] || groups[g]?.en || g;
  const match = (c) =>
    (group === 'all' || c.group === group) &&
    (!onlyTr || c.langs.length > 1) &&
    (!f || `${c.en} ${c.ar} ${c.ur} ${c.author}`.toLowerCase().includes(f.toLowerCase()));
  const present = Object.keys(groups).filter((g) => collections.some((c) => c.group === g));
  return (
    <div className="container">
      <div className="page-head">
        <h1>{t('collections')}</h1>
        <p className="muted" style={{ margin: 0 }}>{collections.length} {t('books')} · {total.toLocaleString()} {t('hadiths')}</p>
      </div>
      <div className="card pad stack" style={{ marginBottom: 24 }}>
        <div className="searchbar" style={{ boxShadow: 'none' }}>
          <span className="lead">{Icon.search}</span>
          <label htmlFor="cf" className="sr-only">{t('search')}</label>
          <input id="cf" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('search') + '…'} dir="auto" style={{ minHeight: 40, fontSize: 15 }} />
        </div>
        <div className="row">
          <button className="chip" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>{t('allResults')}</button>
          {present.map((g) => <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>{gname(g)}</button>)}
          <span className="spacer" />
          <label className="check"><input type="checkbox" checked={onlyTr} onChange={() => setOnlyTr(!onlyTr)} />{t('translations')}</label>
        </div>
      </div>
      {present.map((g) => {
        const list = collections.filter((c) => c.group === g && match(c));
        if (!list.length) return null;
        return (
          <section key={g}>
            <div className="section-head"><h2>{gname(g)}</h2><span className="muted small">{list.length}</span></div>
            <div className="grid">{list.map((c) => <CollectionCard key={c.id} c={c} />)}</div>
          </section>
        );
      })}
      {!collections.some(match) && <div className="empty">{t('noResults')}</div>}
    </div>
  );
}
