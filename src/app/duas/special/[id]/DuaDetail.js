'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { BookmarkButton, Icon, ReadingBar, ShareButton } from '@/components/ui';
import { LANG_NAMES } from '@/lib/i18n';
import { getHadith, getJSON } from '@/lib/client-data';
import { hadithHref } from '@/components/HadithCard';
import { SD, catName, pick, shareText, titleOf, tx } from '@/lib/special-duas';
import { GradeBadge } from '../parts';

// Translation in every language the reader picks. English and Urdu hadith duas use the exact words cut from the narration;
// other languages show the translation of the whole narration (we cannot cut a sentence out of a translation we did not write).
function Translated({ d, ui }) {
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
        <p className={`tr-text ${l === 'ur' ? 'tr-ur' : ''}`}>{text || (data ? (ui === 'ur' ? 'اس زبان میں ترجمہ دستیاب نہیں۔' : 'No translation in this language.') : '…')}</p>
      </div>
    );
  });
}

function Sec({ h, children }) { return <section className="sd-sec"><h2>{h}</h2>{children}</section>; }

export default function DuaDetail({ id }) {
  const { settings } = useApp();
  const ui = settings.ui; const t = tx(ui);
  const d = SD.duas.find((x) => x.id === id);
  const [copied, setCopied] = useState(false);
  const quran = d.kind === 'quran';
  const srcHref = quran ? `/quran/${d.src.s}/#v${d.src.v}` : hadithHref(d.src.c, d.src.n);
  const kindLabel = quran ? t.kindQuran : d.kind === 'virtue' ? t.kindVirtue : t.kindDua;
  return (
    <div className="container narrow sd">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/duas/special/">{t.back}</Link></nav>
      <div className="page-head">
        <p className="muted small">{kindLabel} · {d.cats.filter((c) => c !== 'quran').map((c) => catName(SD.cats.find((x) => x.id === c), ui)).join(' · ')}</p>
        <h1>{titleOf(d, ui)}</h1>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <GradeBadge d={d} ui={ui} />
          <BookmarkButton item={{ key: `sd:${d.id}`, type: 'dua', id: d.id, href: `/duas/special/${d.id}/`, title: titleOf(d, 'en'), preview: d.ar }} />
          <ShareButton title={titleOf(d, 'en')} text={shareText(d, ui)} />
          <button className="btn ghost" onClick={async () => { try { await navigator.clipboard.writeText(shareText(d, ui)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}>{Icon.copy}<span className="hide-sm">{copied ? t.copied : (ui === 'ur' ? 'کاپی' : 'Copy')}</span></button>
        </div>
      </div>

      <Sec h={t.arabic}><p className="ar sd-ar" lang="ar" dir="rtl">{d.ar}</p></Sec>
      {d.tl && <Sec h={t.translit}><p className="sd-tl" dir="ltr">{d.tl}</p>{d.kind === 'dua' && <p className="muted small">{t.translitNote}</p>}</Sec>}
      <Sec h={t.translation}>
        <ReadingBar choices={['ur', 'en', 'bn', 'hi', 'id', 'tr', 'fr', 'ru', 'ta']} field={quran ? 'qtr' : 'tr'} />
        <Translated d={d} ui={ui} />
        {d.enSrc && <p className="muted small">English translation: {d.enSrc}.</p>}
      </Sec>
      <Sec h={t.occasion}><p>{pick(d.occ, ui)}</p></Sec>
      <Sec h={t.virtue}><p>{pick(d.virt, ui)}</p></Sec>

      <Sec h={t.source}>
        <p><strong>{d.src.book}</strong> {quran ? `${d.src.name} (${d.src.ref})` : `${d.src.ref}`}</p>
        <Link href={srcHref} className="btn">{quran ? (ui === 'ur' ? 'قرآن میں کھولیں' : 'Open in the Quran') : t.fullHadith} {Icon.arrow}</Link>
        {d.also?.length > 0 && (
          <p className="muted small" style={{ marginTop: 10 }}>{t.also}: {d.also.map((a, i) => <span key={a.c + a.n}>{i ? ' · ' : ''}<Link href={hadithHref(a.c, a.n)}>{a.book} {a.n}</Link> ({a.grade})</span>)}</p>
        )}
      </Sec>
      <Sec h={t.grading}>
        <p><GradeBadge d={d} ui={ui} /> <span className="muted small">{d.grade.label}</span></p>
        {d.grade.note && <p className="muted small">{d.grade.note}</p>}
        {d.grade.differ && <p className="sd-warn" role="note">{t.differ}</p>}
        {d.grade.graders.length > 0 && (
          <table className="sd-table"><caption className="sr-only">{t.graders}</caption><thead><tr><th>{t.graders}</th><th>{t.grading}</th></tr></thead>
            <tbody>{d.grade.graders.map(([who, g]) => <tr key={who}><td>{who}</td><td>{g}</td></tr>)}</tbody></table>
        )}
      </Sec>
      <Sec h={t.audio}>
        {quran ? <Link className="btn" href={srcHref}>{Icon.next} {t.audioQuran}</Link> : <p className="muted">{t.audioNone}</p>}
      </Sec>
      <p className="sd-note">{t.note}</p>
      <p className="muted small">{t.notes}</p>
    </div>
  );
}
