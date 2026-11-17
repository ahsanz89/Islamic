'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LEVELS, PASS_MARK } from '@/lib/learn-data';
import { useLearn } from '@/lib/learn-progress';
import Lesson from '../Lessons';
import { Match, PracticeQuestions, QuizRun, Repeat } from '../Practice';
import { VoiceNotice } from '../parts';

export default function LevelView({ n }) {
  const lv = LEVELS[n - 1];
  const { s, isOpen, record, setRoman, unlockAll } = useLearn();
  const [tab, setTab] = useState('learn');
  const [mode, setMode] = useState('questions');
  const open = isOpen(n);
  const next = n < LEVELS.length ? n + 1 : null;
  if (!open) {
    return (
      <div className="container narrow">
        <div className="page-head"><h1>Level {n}: {lv.title}</h1></div>
        <p>This level opens after you pass the quiz for Level {n - 1}.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn primary" href={`/learn/${n - 1}/`}>Go to Level {n - 1}</Link>
          <button className="btn" onClick={unlockAll}>I already know this: unlock all levels</button>
        </div>
      </div>
    );
  }
  return (
    <div className="container narrow lq">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/learn/">Learn Quran</Link> / Level {n}</nav>
      <div className="page-head">
        <p className="muted small">Level {n} of {LEVELS.length} · about {lv.minutes} minutes · <span lang="ur">{lv.ur}</span></p>
        <h1>{lv.title}</h1>
        <p className="muted">{lv.goal}</p>
      </div>
      <div className="lq-tabs" role="tablist" aria-label="Level sections">
        {[['learn', 'Learn'], ['practice', 'Practice'], ['quiz', 'Quiz']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}{k === 'quiz' && s.passed[n] ? ' ✓' : ''}</button>
        ))}
        <span className="spacer" />
        <label className="lq-roman"><input type="checkbox" checked={s.roman} onChange={(e) => setRoman(e.target.checked)} /> Roman Urdu</label>
      </div>
      <VoiceNotice />
      {tab === 'learn' && (
        <>
          <Lesson n={n} roman={s.roman} />
          <div className="row" style={{ margin: '22px 0' }}><button className="btn primary" onClick={() => setTab('practice')}>Continue to practice</button></div>
        </>
      )}
      {tab === 'practice' && (
        <div className="stack" style={{ gap: 14 }}>
          <div className="lq-modes" role="group" aria-label="Practice type">
            <button aria-pressed={mode === 'questions'} onClick={() => setMode('questions')}>Questions</button>
            <button aria-pressed={mode === 'repeat'} onClick={() => setMode('repeat')}>Listen and repeat</button>
            {n === 1 && <button aria-pressed={mode === 'match'} onClick={() => setMode('match')}>Match</button>}
          </div>
          {mode === 'questions' && <PracticeQuestions level={n} />}
          {mode === 'repeat' && <Repeat level={n} />}
          {mode === 'match' && n === 1 && <Match />}
          <div className="row"><button className="btn" onClick={() => setTab('quiz')}>Ready for the quiz</button></div>
        </div>
      )}
      {tab === 'quiz' && (
        <div>
          <p className="muted">10 questions. Get {Math.ceil(PASS_MARK * 10)} right to finish this level{s.best[n] ? ` · best score ${Math.round(s.best[n] * 100)}%` : ''}.</p>
          <QuizRun level={n} next={next} onFinish={(ratio) => record(n, ratio, PASS_MARK)} />
        </div>
      )}
    </div>
  );
}
