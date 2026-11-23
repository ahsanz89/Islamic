'use client';
// Word-by-word and letter-by-letter learning inside the Quran reader.
// The word list, transliteration and meanings come from the Quran dataset (q/<n>.json "w"). The letter split is done
// by src/lib/quran-letters.js (Unicode rules, no guessing). Letter sounds use the same teaching recordings as Learn Quran.
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QuranWord } from '@/components/AudioPlayer';
import { breakdown, lettersLine, practiceRows } from '@/lib/quran-letters';
import { onLessonState, playLesson, stopLesson } from '@/lib/learn-audio';
import * as audio from '@/lib/audio-engine';

const DOT = 'ـ'; // a stretched joining stroke: a base so a sign can be shown on its own
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function untilIdle(timeout = 7000) {
  return new Promise((resolve) => {
    let done = false;
    const end = () => { if (!done) { done = true; off(); resolve(); } };
    const off = onLessonState((s) => { if (s === 'idle') end(); });
    setTimeout(end, timeout);
  });
}

const ROLE_LABEL = {
  consonant: 'Letter', 'long-vowel': 'Long vowel', silent: 'Silent', merged: 'Merges into the next letter', carrier: 'Sign'
};

/** The whole word with the chosen letter lit up, so you can see where it sits in the joined word. */
function JoinedWord({ clusters, active }) {
  return (
    <p className="wl-joined quran-ar" lang="ar" dir="rtl">
      {clusters.map((c, i) => (
        <span key={i} className={i === active ? 'wl-hit' : ''}>{c.ch}{c.stretch ? 'ـ' : ''}{c.marks.map((m) => m.ch).join('')}</span>
      ))}
    </p>
  );
}

export function LetterPanel({ word, surah, v, pos, onClose }) {
  const clusters = useMemo(() => breakdown(word.a), [word.a]);
  const first = (cl) => { const i = cl.findIndex((c) => c.ch && c.role !== 'silent'); return i >= 0 ? i : cl.findIndex((c) => c.ch); };
  const [sel, setSel] = useState(() => first(clusters));
  const [playing, setPlaying] = useState(-1);
  const [msg, setMsg] = useState('');
  const run = useRef(0);
  useEffect(() => () => { run.current += 1; stopLesson(); }, []);
  useEffect(() => { setSel(first(clusters)); setPlaying(-1); }, [clusters]);

  const c = clusters[sel] || clusters[0];
  const stop = () => { run.current += 1; stopLesson(); setPlaying(-1); };
  const say = async (text, idx) => {
    stop();
    setMsg('');
    setPlaying(idx);
    const how = await playLesson({ text });
    if (how === 'none') setMsg('No sound is available on this device right now. Check your connection, or pick an Arabic voice in Learn Quran > Sound help.');
    await untilIdle();
    setPlaying(-1);
  };
  const soundItOut = async () => {
    stop();
    const my = run.current;
    for (const cl of clusters) {
      if (run.current !== my) return;
      if (!cl.ch || cl.role === 'silent') continue;
      setSel(cl.i);
      setPlaying(cl.i);
      await playLesson({ text: cl.syllableAr || cl.letter.arName });
      await untilIdle();
      await wait(120);
    }
    if (run.current !== my) return;
    setPlaying(-1);
    audio.playWord(surah, v, pos, word.a); // finish with the real recitation of the word
  };

  const rows = c && c.role === 'consonant' ? practiceRows(c.ch) : [];
  const vowelNow = c && c.marks.find((m) => ['vowel', 'tanween', 'sukoon', 'shadda'].includes(m.kind));

  return (
    <section className="wl-panel" aria-label={`Letters of ${word.a}`}>
      <header className="wl-head">
        <div className="wl-title">
          <span className="quran-ar wl-bigword" lang="ar" dir="rtl">{word.a}</span>
          <span className="wl-tl">{word.tl}</span>
          <span className="wl-en">{word.en}</span>
        </div>
        <div className="wl-actions">
          <button className="btn small" onClick={() => audio.playWord(surah, v, pos, word.a)}>Hear the word</button>
          <button className="btn small" onClick={soundItOut}>Sound it out</button>
          <button className="btn small ghost" onClick={() => { stop(); onClose(); }} aria-label="Close letter breakdown">Close</button>
        </div>
      </header>

      <p className="wl-line" dir="ltr" lang="ar" aria-label="Letters">{lettersLine(word.a)}</p>

      <ul className="wl-tiles" dir="rtl">
        {clusters.map((cl, i) => cl.ch ? (
          <li key={i}>
            <button
              className={`wl-tile ${i === sel ? 'sel' : ''} ${i === playing ? 'now' : ''} role-${cl.role}`}
              aria-pressed={i === sel}
              onClick={() => { setSel(i); if (cl.role !== 'silent') say(cl.syllableAr || cl.letter.arName, i); }}
            >
              <span className="wl-glyph quran-ar" lang="ar">{cl.ch}{cl.stretch ? 'ـ' : ''}{cl.marks.map((m) => m.ch).join('')}</span>
              <span className="wl-name" dir="ltr">{cl.letter.name}</span>
              <span className="wl-snd" dir="ltr">{cl.role === 'silent' ? 'silent' : cl.sound || '–'}</span>
            </button>
          </li>
        ) : null)}
      </ul>

      <JoinedWord clusters={clusters} active={sel} />
      <p className="wl-cap muted small">Complete word: <b dir="ltr">{word.tl}</b> · {word.en}</p>

      {c && c.ch && (
        <div className="wl-detail" dir="ltr">
          <div className="wl-detail-head">
            <span className="quran-ar wl-bigletter" lang="ar">{c.ch}</span>
            <div>
              <h4>{c.letter.fullName}{c.letter.form && c.letter.form !== c.letter.fullName ? ` · ${c.letter.form}` : ''}</h4>
              <p className="muted small">{ROLE_LABEL[c.role]}{c.sound ? ` · reads “${c.sound}”` : ''}{c.letter.arName ? ` · name: ${c.letter.arName}` : ''}</p>
            </div>
            <div className="wl-actions">
              <button className="btn small" onClick={() => say(c.letter.arName, c.i)}>Hear the letter name</button>
              {c.syllableAr && <button className="btn small" onClick={() => say(c.syllableAr, c.i)}>Hear this sound</button>}
            </div>
          </div>
          {msg && <p className="wl-warn small" role="status">{msg}</p>}
          <p className="small">{c.letter.how}</p>
          {c.letter.mouth && <p className="muted small">Where it is made: {c.letter.mouth}</p>}
          {c.notes.map((n, i) => <p key={i} className="small">{n}</p>)}

          {c.marks.length > 0 && (
            <>
              <h5>Signs on this letter</h5>
              <ul className="wl-marks">
                {c.marks.map((m, i) => (
                  <li key={i}>
                    <span className="wl-mark quran-ar" lang="ar" aria-hidden="true">{DOT}{m.ch}</span>
                    <span><b>{m.name}</b>{m.urdu ? <span className="muted"> · {m.urdu}</span> : null}<br /><span className="small">{m.how}</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {rows.length > 0 && (
            <>
              <h5>This letter with each sign</h5>
              <p className="muted small">Tap a row to hear it. The row for the sign on this letter in the word is highlighted.</p>
              <table className="wl-table">
                <thead><tr><th>Letter + sign</th><th>Sign</th><th>Sounds like</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={vowelNow && vowelNow.ch === r.mark ? 'hit' : ''}>
                      <td><button className="wl-rowbtn quran-ar" lang="ar" onClick={() => say(r.ar, c.i)} aria-label={`Hear ${r.label}`}>{r.ar}</button></td>
                      <td>{r.label}</td>
                      <td dir="ltr"><b>{r.roman}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <p className="muted small">These are the sounds of the letter and its sign on their own. In the recitation the sound can change by Tajweed rules (for example when letters merge), so always follow the recitation for the exact sound. The recordings for single letters and signs are the Learn Quran teaching recordings.</p>
        </div>
      )}
    </section>
  );
}

/** Word cards of one verse. mode: 'word' | 'letter'. */
export function WordCards({ verse, surah, mode, show, wordAudio }) {
  const [open, setOpen] = useState(-1);
  const w = open >= 0 ? verse.w[open] : null;
  return (
    <>
      <div className="wbw">
        {verse.w.map((x, i) => (
          <div
            className={`word ${open === i ? 'wl-open' : ''} ${mode === 'letter' ? 'wl-pick' : ''}`}
            key={i}
            onClick={mode === 'letter' ? (e) => { if (!e.target.closest('a')) setOpen(open === i ? -1 : i); } : undefined}
          >
            {wordAudio && !verse.na
              ? <span className="wa"><QuranWord s={surah.n} v={verse.v} pos={i + 1} text={show(x.a)} /></span>
              : <span className="wa" lang="ar">{show(x.a)}</span>}
            {x.tl && <span className="wt">{x.tl}</span>}
            {x.en && <span className="we">{x.en}</span>}
            {x.r && <Link className="wr" href={`/quran/roots/?r=${encodeURIComponent(x.r)}`}>{x.r}</Link>}
            <button className="wl-open-btn" aria-expanded={open === i} onClick={(e) => { e.stopPropagation(); setOpen(open === i ? -1 : i); }}>
              {open === i ? 'Hide letters' : 'Letters'}
            </button>
          </div>
        ))}
      </div>
      {mode === 'letter' && open < 0 && <p className="muted small" style={{ margin: '8px 0 0' }}>Tap any word to see its letters, signs and sounds.</p>}
      {w && <LetterPanel word={w} surah={surah.n} v={verse.v} pos={open + 1} onClose={() => setOpen(-1)} />}
    </>
  );
}
