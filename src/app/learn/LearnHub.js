'use client';
import Link from 'next/link';
import { LEVELS } from '@/lib/learn-data';
import { useLearn } from '@/lib/learn-progress';

export default function LearnHub() {
  const { s, isOpen, unlockAll, reset } = useLearn();
  const done = LEVELS.filter((l) => s.passed[l.n]).length;
  const nextLevel = LEVELS.find((l) => !s.passed[l.n] && isOpen(l.n)) || LEVELS[LEVELS.length - 1];
  return (
    <div className="container narrow lq">
      <div className="page-head">
        <h1>Learn Quran</h1>
        <p className="muted">Learn to read the Quran from the very first Arabic letter. Each level has a short lesson, practice with sound, and a quiz. Pass the quiz to open the next level. Free for everyone: children, adults, and new Muslims.</p>
      </div>
      <div className="lq-hubbar">
        <div className="lq-prog" role="progressbar" aria-valuemin={0} aria-valuemax={LEVELS.length} aria-valuenow={done} aria-label="Progress"><span style={{ width: `${(done / LEVELS.length) * 100}%` }} /></div>
        <span className="muted small">{done} of {LEVELS.length} levels complete</span>
        <Link className="btn primary" href={`/learn/${nextLevel.n}/`}>{done === 0 ? 'Start Level 1' : done === LEVELS.length ? 'Review Level 6' : `Continue Level ${nextLevel.n}`}</Link>
      </div>
      <ol className="lq-levels">
        {LEVELS.map((l) => {
          const open = isOpen(l.n);
          return (
            <li key={l.n} className={`lq-level ${s.passed[l.n] ? 'done' : ''} ${open ? '' : 'locked'}`}>
              <span className="lq-n" aria-hidden="true">{s.passed[l.n] ? '✓' : l.n}</span>
              <div>
                <h2><Link href={`/learn/${l.n}/`} aria-disabled={!open}>{l.title}</Link> <small lang="ur" className="muted">{l.ur}</small></h2>
                <p className="muted">{l.goal}</p>
                <p className="small muted">{open ? `About ${l.minutes} minutes${s.best[l.n] ? ` · best quiz ${Math.round(s.best[l.n] * 100)}%` : ''}` : 'Locked: pass the previous level to open'}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <section className="lq-after">
        <h2>Learn Arabic <small lang="ur" className="muted">عربی سیکھیں</small></h2>
        <p>Learn the words of the Quran and the prayer, with meanings in English or Urdu.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}><Link className="btn primary" href="/learn-arabic/">Open Learn Arabic</Link></div>
      </section>
      <section className="lq-after">
        <h2>Then read the Quran</h2>
        <p>Once you finish, practise with real verses. Every surah has audio and translations in your language.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}><Link className="btn" href="/quran/1/">Al-Fatiha</Link><Link className="btn" href="/quran/">All surahs</Link></div>
      </section>
      <p className="small muted" style={{ marginTop: 24 }}>
        Already read Arabic? <button className="linklike" onClick={unlockAll}>Unlock all levels</button> · <button className="linklike" onClick={() => { if (confirm('Clear your learning progress on this device?')) reset(); }}>Reset progress</button>. Progress is stored only on this device.
      </p>
    </div>
  );
}
