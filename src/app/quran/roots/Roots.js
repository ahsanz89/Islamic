'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';
import { getJSON } from '@/lib/client-data';
import { normalizeArabic } from '@/lib/arabic.mjs';

export default function Roots() {
  const { t } = useApp();
  const sp = useSearchParams();
  const router = useRouter();
  const r = sp.get('r');
  const [roots, setRoots] = useState(null);
  const [f, setF] = useState('');
  useEffect(() => { getJSON('q/roots.json').then(setRoots); }, []);
  const list = useMemo(() => {
    if (!roots) return [];
    const q = normalizeArabic(f).replace(/[\s-]/g, '');
    return Object.entries(roots).filter(([k]) => !q || normalizeArabic(k).replace(/[\s-]/g, '').includes(q));
  }, [roots, f]);

  if (r && roots) {
    const occ = roots[r] || [];
    return (
      <div className="container narrow">
        <div className="page-head">
          <nav className="breadcrumb"><Link href="/quran/">{t('quran')}</Link><span>/</span><Link href="/quran/roots/">{t('roots')}</Link></nav>
          <h1><span className="ar" style={{ fontSize: 40 }}>{r}</span></h1>
          <p className="muted">{occ.length} {t('occurrences')}</p>
        </div>
        <div className="card list">
          {occ.map(([key, word, en], i) => {
            const [s, v] = key.split(':');
            return (
              <Link key={i} className="item" href={`/quran/${s}/#v${v}`}>
                <span className="quran-ar" style={{ fontSize: 26, lineHeight: 1.6 }}>{word}</span>
                <span className="muted">{en} · {key}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <nav className="breadcrumb"><Link href="/quran/">{t('quran')}</Link><span>/</span></nav>
        <h1>{t('roots')}</h1>
        <p className="muted small">Quranic Arabic Corpus morphology · {roots ? Object.keys(roots).length : '…'} {t('roots').toLowerCase()}</p>
        <input className="input" style={{ maxWidth: 360 }} dir="rtl" value={f} onChange={(e) => setF(e.target.value)} placeholder={t('searchRoots')} aria-label={t('searchRoots')} />
      </div>
      {!roots ? <div className="empty">{t('loading')}</div> : (
        <div className="row">
          {list.slice(0, 600).map(([k, occ]) => (
            <button key={k} className="chip" onClick={() => router.push(`/quran/roots/?r=${encodeURIComponent(k)}`)}>
              <span className="ar" style={{ fontSize: 20, lineHeight: 1.4 }}>{k}</span><span className="muted small">{occ.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
