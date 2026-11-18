'use client';
import Link from 'next/link';
import { LEVELS, tr } from '@/lib/arabic-learn';
import { useArabic } from '@/lib/arabic-progress';
import LangChooser from './LangChooser';

export default function ArabicHub() {
  const { s, ready, lang, isOpen, setLang, unlockAll, reset } = useArabic();
  const t = tr(lang); const rtl = lang === 'ur';
  const done = LEVELS.filter((l) => s.passed[l.n]).length;
  const next = LEVELS.find((l) => !s.passed[l.n] && isOpen(l.n)) || LEVELS[LEVELS.length - 1];
  if (ready && !s.lang) {
    return (
      <div className="container narrow lq">
        <div className="page-head"><h1>Learn Arabic · <span lang="ur">عربی سیکھیں</span></h1></div>
        <LangChooser onPick={setLang} />
      </div>
    );
  }
  return (
    <div className="container narrow lq" dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
      <div className="page-head"><h1>{t.title}</h1><p className="muted">{t.intro}</p></div>
      <LangChooser compact value={lang} onPick={setLang} />
      <div className="lq-hubbar">
        <div className="lq-prog" role="progressbar" aria-valuemin={0} aria-valuemax={LEVELS.length} aria-valuenow={done} aria-label="Progress"><span style={{ width: `${(done / LEVELS.length) * 100}%` }} /></div>
        <span className="muted small">{t.complete(done, LEVELS.length)}</span>
        <Link className="btn primary" href={`/learn-arabic/${next.n}/`}>{done === 0 ? t.start : done === LEVELS.length ? t.review : t.cont(next.n)}</Link>
      </div>
      <ol className="lq-levels">
        {LEVELS.map((l) => {
          const open = isOpen(l.n);
          return (
            <li key={l.n} className={`lq-level ${s.passed[l.n] ? 'done' : ''} ${open ? '' : 'locked'}`}>
              <span className="lq-n" aria-hidden="true">{s.passed[l.n] ? '✓' : l.n}</span>
              <div>
                <h2><Link href={`/learn-arabic/${l.n}/`}>{rtl ? l.ur : l.en}</Link></h2>
                <p className="muted">{rtl ? l.goalUr : l.goalEn}</p>
                <p className="small muted">{open ? `${t.about(l.minutes)}${s.best[l.n] ? ` · ${Math.round(s.best[l.n] * 100)}%` : ''}` : t.locked}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="small muted">{t.review_note}</p>
      <p className="small muted" style={{ marginTop: 18 }}>
        <button className="linklike" onClick={unlockAll}>{t.unlock}</button> · <button className="linklike" onClick={() => { if (confirm('?')) reset(); }}>{t.resetq}</button>
      </p>
    </div>
  );
}
