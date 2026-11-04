'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from './Providers';
import { BookmarkButton, CName, CopyButton, ShareButton } from './ui';
import { stripDiacritics } from '@/lib/arabic.mjs';
import { LANG_NAMES } from '@/lib/i18n';
import { getCollections } from '@/lib/client-data';
import { gradeOf } from '@/lib/grades.mjs';

export const hadithHref = (c, n) => `/hadith/?c=${c}&n=${n}`;

export function gradeTone(g) {
  const c = gradeOf(g);
  return c === 'd' ? 'weak' : c === 'h' ? 'gold' : c === 's' ? '' : 'grey';
}

function ArabicText({ text, mi, highlight }) {
  const { settings } = useApp();
  const show = (s) => (settings.harakat ? s : stripDiacritics(s));
  if (mi > 0) {
    return (
      <p className="ar" lang="ar" style={{ margin: 0 }}>
        <span className="isnad">{show(text.slice(0, mi))}</span>
        <span>{show(text.slice(mi))}</span>
      </p>
    );
  }
  return <p className="ar" lang="ar" style={{ margin: 0 }}>{show(text)}</p>;
}

export function Translations({ t }) {
  const { settings } = useApp();
  const shown = settings.tr.filter((l) => t && t[l]);
  if (!shown.length) return null;
  return shown.map((l) => (
    <div key={l} className="tr-block" lang={l} dir={l === 'ur' ? 'rtl' : 'ltr'}>
      <div className="tr-label">{LANG_NAMES[l]}</div>
      <p className={`tr-text ${l === 'ur' ? 'tr-ur' : ''}`}>{t[l]}</p>
    </div>
  ));
}

export default function HadithCard({ col, h, full = false }) {
  const { t, settings } = useApp();
  const name = settings.ui === 'ur' ? col.ur : settings.ui === 'ar' ? col.ar : col.en;
  const title = `${name} ${h.n}`;
  const firstGrade = h.g && h.g[0];
  const copyText = [title, h.ar, ...settings.tr.filter((l) => h.t?.[l]).map((l) => h.t[l])].join('\n\n');

  return (
    <article className="hadith" id={`h${h.n}`}>
      <div className="hadith-head">
        <Link href={hadithHref(col.id, h.n)} className="num">{title}</Link>
        {h.p ? <span className="badge grey">{t('printedNo')} {h.p}</span> : null}
        {firstGrade ? <span className={`badge ${gradeTone(firstGrade[1])}`} title={firstGrade[0]}>{firstGrade[1]}</span> : null}
        {col.source === 'openiti' ? <span className="badge grey">{t('arabicOnly')}</span> : null}
        <span className="spacer" />
        <BookmarkButton small iconOnly={!full} item={{ key: `h:${col.id}:${h.n}`, type: 'hadith', c: col.id, n: h.n, title, preview: (h.t?.en || h.t?.ur || stripDiacritics(h.ar)).slice(0, 160) }} />
        <CopyButton small iconOnly={!full} text={copyText} />
        {full && <ShareButton small title={title} text={title} />}
      </div>
      <div className="hadith-body">
        {h.ch ? <div className="chapter-title" lang="ar" dir="rtl">{h.ch}</div> : null}
        {h.ar ? <ArabicText text={h.ar} mi={h.mi} /> : null}
        <Translations t={h.t} />
        {full && <HadithDetails col={col} h={h} />}
      </div>
    </article>
  );
}

function HadithDetails({ col, h }) {
  const { t } = useApp();
  const [cols, setCols] = useState(null);
  useEffect(() => { getCollections().then((d) => setCols(Object.fromEntries(d.collections.map((c) => [c.id, c])))); }, []);
  return (
    <>
      <section style={{ margin: 0 }}>
        <h3>{t('reference')}</h3>
        <dl className="detail-grid">
          <div><dt>{t('reference')}</dt><dd>{col.en} {h.n}</dd></div>
          {h.ref && h.ref[0] != null && <div><dt>{t('inBook')}</dt><dd>{t('book')} {h.ref[0]}, {t('hadith')} {h.ref[1]}</dd></div>}
          {h.an && h.an !== h.n && <div><dt>Arabic no.</dt><dd>{h.an}</dd></div>}
          {h.p && <div><dt>{t('printedNo')}</dt><dd>{h.p}</dd></div>}
        </dl>
      </section>

      <section style={{ margin: 0 }}>
        <h3>{t('grades')}</h3>
        {h.g && h.g.length ? (
          <div className="grades">
            {h.g.map(([who, g], i) => <span key={i} className={`badge ${gradeTone(g)}`}>{g} — {who}</span>)}
          </div>
        ) : <p className="muted small" style={{ margin: 0 }}>{col.id === 'bukhari' || col.id === 'muslim' ? 'Sahih (all hadith in this book are authentic)' : t('noGrades')}</p>}
      </section>

      <section style={{ margin: 0 }}>
        <h3>{t('narratorChain')}</h3>
        <p className="muted small" style={{ margin: '0 0 8px' }}>{h.mi > 0 ? t('isnadNote') : ''}</p>
        <div className="empty small">{t('narratorsEmpty')}</div>
      </section>

      <section style={{ margin: 0 }}>
        <h3>{t('takhrij')}</h3>
        <p className="muted small" style={{ margin: '0 0 8px' }}>{t('takhrijNote')}</p>
        {h.sim && h.sim.length ? (
          <div className="row">
            {h.sim.map(([c, n, score]) => (
              <Link key={c + n} href={hadithHref(c, n)} className="chip">
                {cols ? <CName c={cols[c]} /> : c} {n} <span className="muted small">· {score}% {t('similarity')}</span>
              </Link>
            ))}
          </div>
        ) : <p className="muted small" style={{ margin: 0 }}>{t('noTakhrij')}</p>}
      </section>

      <section style={{ margin: 0 }}>
        <h3>{t('commentary')}</h3>
        <div className="empty small">{t('commentaryEmpty')}</div>
      </section>
    </>
  );
}
