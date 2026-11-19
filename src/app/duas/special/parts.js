'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { LANG_NAMES } from '@/lib/i18n';
import { getHadith, getJSON } from '@/lib/client-data';

import { tx } from '@/lib/special-duas';

export function GradeBadge({ d, ui }) {
  const t = tx(ui);
  const c = d.grade.class || '';
  const label = c === 'q' ? t.grade.q : `${t.grade[c] || d.grade.label}`;
  return <span className={`sd-grade g-${c || 'n'}`} title={d.grade.label}>{label}{d.grade.differ ? ' *' : ''}</span>;
}

// Translation in every language the reader picks. English and Urdu hadith duas use the exact words cut from the narration;
// other languages show the translation of the whole narration (we cannot cut a sentence out of a translation we did not write).
export function Translated({ d, ui, max = 0 }) {
  const { settings } = useApp();
  const quran = d.kind === 'quran';
  const langs = (quran ? settings.qtr : settings.tr) || [];
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    if (quran) getJSON(`q/${d.src.s}.json`).then((vs) => live && setData(vs.filter((x) => x.v >= d.src.v && x.v <= (d.src.to || d.src.v)))).catch(() => {});
    else getHadith(d.src.c, d.src.n).then((r) => live && setData(r.hadith?.t || {})).catch(() => {});
    return () => { live = false; };
  }, [d.id]);
  if (!langs.length) return <p className="muted small">{ui === 'ur' ? 'اوپر سے ترجمے کی زبان منتخب کریں۔' : 'Choose a translation language above.'}</p>;
  return langs.map((l) => {
    let text = null, whole = false;
    if (quran) text = data ? data.map((x) => x.t?.[l]).filter(Boolean).join(' ') : (l === 'en' ? d.en : null);
    else if (l === 'en' && d.en) text = d.en;
    else if (l === 'ur' && d.ur) text = d.ur;
    else if (data) { text = data[l]; whole = true; }
    return (
      <div key={l} className="tr-block" lang={l} dir={l === 'ur' || l === 'ar' ? 'rtl' : 'ltr'}>
        <div className="tr-label">{LANG_NAMES[l]}{whole && text ? ' · ' + (ui === 'ur' ? 'پوری روایت کا ترجمہ' : 'translation of the whole narration') : ''}</div>
        <p className={`tr-text ${l === 'ur' ? 'tr-ur' : ''}`}>{text && max && text.length > max ? text.slice(0, max).replace(/\s\S*$/, '') + '…' : text || (data ? (ui === 'ur' ? 'اس زبان میں ترجمہ دستیاب نہیں۔' : 'No translation in this language.') : '…')}</p>
      </div>
    );
  });
}

