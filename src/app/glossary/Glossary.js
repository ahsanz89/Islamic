'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';

export default function Glossary({ data }) {
  const { t, settings } = useApp();
  const [f, setF] = useState('');
  const urdu = settings.ui === 'ur' || settings.ui === 'ar';
  const match = (x) => !f || `${x.ar} ${x.en} ${x.ur} ${x.def_en} ${x.def_ur}`.toLowerCase().includes(f.toLowerCase());
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>{t('glossary')}</h1>
        <p className="muted">{data.terms.length} {t('terms')}</p>
        <input className="input" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('search')} aria-label={t('search')} dir="auto" />
      </div>
      {data.groups.map((g) => {
        const terms = data.terms.filter((x) => x.g === g.id && match(x));
        if (!terms.length) return null;
        return (
          <section key={g.id}>
            <h2>{g[settings.ui] || g.en}</h2>
            <div className="card">
              {terms.map((x) => (
                <div key={x.id} id={x.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-2)' }}>
                  <div className="row">
                    <strong>{urdu ? x.ur : x.en}</strong>
                    <span className="spacer" />
                    <span className="ar sm" style={{ color: 'var(--brand)' }}>{x.ar}</span>
                  </div>
                  <p style={{ margin: '4px 0 0' }}>{x.def_en}</p>
                  <p className="tr-ur" style={{ margin: '4px 0 0', fontSize: 16 }} lang="ur">{x.def_ur}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
