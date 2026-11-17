'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LETTERS, LEVELS, PASS_MARK, SHORT_WORDS, SUKOON_WORDS, SYLLABLE_LETTERS, TANWEEN, VOWELS, forms, pick, question, shuffle, syllable } from '@/lib/learn-data';
import { playLesson } from '@/lib/learn-audio';
import { Sound } from './parts';

function Q({ q, onAnswer, locked, chosen }) {
  useEffect(() => { if (q.audio) playLesson({ text: q.audio.text, id: q.audio.id }); }, [q]);
  return (
    <div className="lq-q">
      <p className="lq-prompt">{q.prompt}</p>
      {q.big && <p className="lq-bigq quran-ar" lang="ar" dir="rtl">{q.big}</p>}
      {q.audio && <Sound text={q.audio.text} id={q.audio.id} label="Play again" />}
      <div className="lq-opts" role="group" aria-label="Choices">
        {q.options.map((o) => {
          const state = !locked ? '' : o.key === q.answer ? 'right' : o.key === chosen ? 'wrong' : '';
          return (
            <button key={o.key} type="button" disabled={locked} className={`lq-opt ${o.big ? 'big' : ''} ${state}`} onClick={() => onAnswer(o.key)} lang={o.big ? 'ar' : undefined}>
              <span className={o.big ? 'quran-ar' : ''}>{o.label}</span>
            </button>
          );
        })}
      </div>
      {locked && <p className={`lq-fb ${chosen === q.answer ? 'good' : 'bad'}`} role="status">{chosen === q.answer ? 'Correct. ' : 'Not quite. '}{q.explain}</p>}
    </div>
  );
}

/** Endless practice: instant feedback, no score pressure. */
export function PracticeQuestions({ level }) {
  const [q, setQ] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [tally, setTally] = useState({ ok: 0, all: 0 });
  useEffect(() => { setQ(question(level)); setChosen(null); setTally({ ok: 0, all: 0 }); }, [level]);
  if (!q) return null;
  return (
    <div>
      <p className="muted small">Correct so far: {tally.ok} of {tally.all}</p>
      <Q q={q} chosen={chosen} locked={chosen !== null} onAnswer={(k) => { setChosen(k); setTally((t) => ({ ok: t.ok + (k === q.answer ? 1 : 0), all: t.all + 1 })); }} />
      {chosen !== null && <button className="btn primary lq-next" onClick={() => { setQ(question(level)); setChosen(null); }}>Next question</button>}
    </div>
  );
}

/** Scored quiz of 10 questions. */
export function QuizRun({ level, onFinish, next }) {
  const N = 10;
  const [qs, setQs] = useState(null);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const start = () => { const seen = new Set(); const out = []; let guard = 0; while (out.length < N && guard++ < 200) { const q = question(level); const k = q.prompt + (q.big || '') + q.answer; if (!seen.has(k)) { seen.add(k); out.push(q); } } setQs(out); setI(0); setChosen(null); setScore(0); setDone(false); };
  useEffect(() => { start(); }, [level]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!qs) return null;
  if (done) {
    const ratio = score / qs.length; const pass = ratio >= PASS_MARK;
    return (
      <div className="lq-result">
        <p className="lq-score">{score} / {qs.length}</p>
        <p>{pass ? 'Level complete. Well done! The next level is now open.' : `You need ${Math.ceil(PASS_MARK * qs.length)} correct to pass. Review the lessons, practise, and try again.`}</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={start}>Try again</button>
          {pass && next && <Link className="btn primary" href={`/learn/${next}/`}>Go to Level {next}</Link>}
          {pass && !next && <Link className="btn primary" href="/quran/1/">Read Al-Fatiha</Link>}
        </div>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div>
      <div className="lq-prog" role="progressbar" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={i}><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <p className="muted small">Question {i + 1} of {qs.length}</p>
      <Q q={q} chosen={chosen} locked={chosen !== null} onAnswer={(k) => { setChosen(k); if (k === q.answer) setScore((s) => s + 1); }} />
      {chosen !== null && <button className="btn primary lq-next" onClick={() => { if (i + 1 >= qs.length) { const s = score; onFinish(s / qs.length); setDone(true); } else { setI(i + 1); setChosen(null); } }}>{i + 1 >= qs.length ? 'See result' : 'Next'}</button>}
    </div>
  );
}

/** Listen and repeat flashcards. The learner says it aloud, then marks it. */
export function Repeat({ level }) {
  const deck = useRef([]);
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const L = LETTERS.filter((l) => l.id !== 'hamza');
    let d;
    if (level === 1) d = L.map((l) => ({ ar: l.ar, say: l.arName, id: `letter-${l.id}`, sub: `${l.name} · ${l.sound}` }));
    else if (level === 2) d = L.filter((l) => l.connects).map((l) => { const f = forms(l); return { ar: `${f.iso}  ${f.ini}  ${f.med}  ${f.fin}`, say: l.arName, id: `letter-${l.id}`, sub: `${l.name}: alone, start, middle, end` }; });
    else if (level === 3) d = SYLLABLE_LETTERS.flatMap((l) => VOWELS.map((v) => { const s = syllable(l, v); return { ar: s.ar, say: s.ar, id: `syl-${l.id}-${v.id}`, sub: s.roman }; }));
    else if (level === 4) d = SYLLABLE_LETTERS.flatMap((l) => TANWEEN.map((t) => { const ar = l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''); return { ar, say: ar, id: `tw-${l.id}-${t.id}`, sub: `${l.sound}${t.ending}` }; }));
    else if (level === 5) d = SUKOON_WORDS.map((w) => ({ ar: w[0], say: w[0], id: null, sub: `${w[1]} · ${w[2]}` }));
    else d = SHORT_WORDS.map((w) => ({ ar: w[0], say: w[0], id: null, sub: `${w[1]} · ${w[2]}` }));
    deck.current = pick(d, Math.min(12, d.length)); setI(0); setReady(true);
  }, [level]);
  if (!ready) return null;
  const c = deck.current[i];
  if (!c) return <p>Deck finished. <button className="btn" onClick={() => { deck.current = shuffle(deck.current); setI(0); }}>Go again</button></p>;
  return (
    <div className="lq-card">
      <p className="muted small">Card {i + 1} of {deck.current.length}</p>
      <p className="lq-bigq quran-ar" lang="ar" dir="rtl">{c.ar}</p>
      <p className="muted">{c.sub}</p>
      <Sound text={c.say} id={c.id} label="Listen" />
      <p className="muted small">Listen, then say it aloud 3 times, copying the sound as closely as you can.</p>
      <button className="btn primary lq-next" onClick={() => setI(i + 1)}>I repeated it</button>
    </div>
  );
}

/** Level 1: match each letter with its name. */
export function Match() {
  const [round, setRound] = useState(null);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const [bad, setBad] = useState(null);
  const fresh = () => { const set = pick(LETTERS.filter((l) => l.id !== 'hamza'), 5); setRound({ a: shuffle(set), b: shuffle(set) }); setSel(null); setDone([]); setBad(null); };
  useEffect(fresh, []);
  if (!round) return null;
  const tryName = (id) => {
    if (!sel) return;
    if (sel === id) { setDone((d) => [...d, id]); setSel(null); setBad(null); } else { setBad(id); setTimeout(() => setBad(null), 600); }
  };
  return (
    <div>
      <p className="lq-prompt">Tap a letter, then tap its name.</p>
      <div className="lq-match">
        <div>{round.a.map((l) => <button key={l.id} disabled={done.includes(l.id)} className={`lq-opt big ${sel === l.id ? 'right' : ''} ${done.includes(l.id) ? 'right' : ''}`} onClick={() => setSel(l.id)}><span className="quran-ar" lang="ar">{l.ar}</span></button>)}</div>
        <div>{round.b.map((l) => <button key={l.id} disabled={done.includes(l.id)} className={`lq-opt ${done.includes(l.id) ? 'right' : ''} ${bad === l.id ? 'wrong' : ''}`} onClick={() => tryName(l.id)}>{l.name}</button>)}</div>
      </div>
      {done.length === 5 && <p className="lq-fb good" role="status">All matched!</p>}
      {done.length === 5 && <button className="btn primary lq-next" onClick={fresh}>New round</button>}
    </div>
  );
}
