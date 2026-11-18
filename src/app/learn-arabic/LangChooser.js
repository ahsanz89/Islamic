'use client';
import { LANGS, tr } from '@/lib/arabic-learn';

/** First-run (and Change language) chooser: English or Urdu. */
export default function LangChooser({ value, onPick, compact }) {
  if (compact) {
    return (
      <div className="lq-speed" role="group" aria-label="Language">
        <span className="muted small">{tr(value || 'en').hubLang}:</span>
        {Object.entries(LANGS).map(([k, l]) => <button key={k} type="button" className={value === k ? 'on' : ''} aria-pressed={value === k} onClick={() => onPick(k)} lang={k}>{l.name}</button>)}
      </div>
    );
  }
  return (
    <section className="lq-after" aria-labelledby="la-choose">
      <h2 id="la-choose">Choose your language · <span lang="ur">اپنی زبان چنیں</span></h2>
      <p className="muted">{tr('en').chooseHelp}</p>
      <p className="muted" lang="ur" dir="rtl">{tr('ur').chooseHelp}</p>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(LANGS).map(([k, l]) => <button key={k} type="button" className="btn primary" lang={k} onClick={() => onPick(k)}>{l.name}</button>)}
      </div>
    </section>
  );
}
