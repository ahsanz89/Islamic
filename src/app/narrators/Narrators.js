'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { getJSON } from '@/lib/client-data';

// Ready for narrator data: public/data/narrators/index.json → { narrators: [{ id, name_ar, name_en, kunya, death, tabaqah, grade_ibnhajar, grade_dhahabi, teachers:[id], students:[id], hadith:[[collection, n]] }] }
export default function Narrators() {
  const { t } = useApp();
  const [data, setData] = useState(null);
  const [f, setF] = useState('');
  useEffect(() => { getJSON('narrators/index.json').then(setData).catch(() => setData({ narrators: [] })); }, []);
  const list = (data?.narrators || []).filter((n) => !f || `${n.name_ar} ${n.name_en}`.includes(f));
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>{t('narrators')}</h1>
        <input className="input" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('narratorSearch')} aria-label={t('narratorSearch')} dir="auto" />
      </div>
      {!data ? <div className="empty">{t('loading')}</div> : list.length ? (
        <div className="card list">
          {list.map((n) => (
            <div key={n.id} className="item">
              <span><strong>{n.name_en}</strong> <span className="ar sm">{n.name_ar}</span></span>
              <span className="muted small">{n.grade_ibnhajar || ''}</span>
            </div>
          ))}
        </div>
      ) : <div className="empty">{t('narratorsEmpty')}</div>}
    </div>
  );
}
