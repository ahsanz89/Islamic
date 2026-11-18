'use client';
import Link from 'next/link';
import { useState } from 'react';
import DATA from '@/lib/arabic-data.json';
import { LEVELS, PASS_MARK, makeGen, ptext, tr } from '@/lib/arabic-learn';
import { playWordRef } from '@/lib/arabic-audio';
import { useArabic } from '@/lib/arabic-progress';
import { PracticeQuestions, QuizRun } from '../../learn/Practice';
import { Sound, SpeedToggle } from '../../learn/parts';
import LangChooser from '../LangChooser';

const Ar = ({ children, size = 'md' }) => <span className={`quran-ar lq-ar lq-${size}`} lang="ar" dir="rtl">{children}</span>;

function WordTile({ w, t, lang }) {
  const mean = ptext(w, lang);
  return (
    <button type="button" className="lq-tile" onClick={() => playWordRef(w.ref, w.a)} aria-label={`${t.hear}: ${w.a}, ${mean}`} data-sound={w.a}>
      <Ar>{w.a}</Ar>
      <small>{mean}</small>
      {w.tl && <small className="muted">{w.tl}</small>}
    </button>
  );
}

function Phrase({ p, t, lang, withWhen }) {
  return (
    <article className="lq-detail" style={{ display: 'block' }}>
      <div className="lq-hero" style={{ textAlign: 'center' }}><Ar size="xl">{p.ar}</Ar></div>
      <p><Sound text={p.ar} label={t.hear} /></p>
      {p.tl && <p><strong>{t.say}:</strong> {p.tl}</p>}
      <p><strong>{t.meaning}:</strong> {ptext(p, lang)}</p>
      {withWhen && p.when && <p className="muted"><strong>{t.whenSaid}:</strong> {ptext(p.when, lang)}</p>}
      {p.words && <><h4>{t.wordsHeading}</h4><div className="lq-wordrow">{p.words.map((w, i) => <WordTile key={i} w={w} t={t} lang={lang} />)}</div></>}
    </article>
  );
}

function Lesson({ n, lang }) {
  const t = tr(lang);
  if (n === 1) {
    return (
      <div className="stack" style={{ gap: 20 }}>
        <p className="muted">{t.tip}</p>
        {DATA.vocab.map((g) => (
          <section key={g.id}>
            <h3>{ptext(g, lang)}</h3>
            <div className="lq-wordrow">{g.words.map((w, i) => <WordTile key={i} w={w} t={t} lang={lang} />)}</div>
          </section>
        ))}
      </div>
    );
  }
  if (n === 2) return <div className="stack" style={{ gap: 20 }}>{DATA.phrases.map((p) => <Phrase key={p.id} p={p} t={t} lang={lang} withWhen />)}</div>;
  return (
    <div className="stack" style={{ gap: 24 }}>
      <p className="muted small">{t.note3}</p>
      {DATA.surahs.map((s) => (
        <section key={s.n}>
          <h3>{s.en} <span className="muted" lang="ar">· {s.ar}</span></h3>
          {s.verses.map((v) => (
            <Phrase key={v.v} t={t} lang={lang} p={{ ar: v.ar, tl: v.tl, en: v.en, ur: v.ur, words: v.words.map((w, i) => ({ a: w.a, tl: w.tl, en: w.en, ref: v.na ? null : [s.n, v.v, i + 1] })) }} />
          ))}
        </section>
      ))}
    </div>
  );
}

export default function ArabicLevel({ n }) {
  const lv = LEVELS[n - 1];
  const { s, ready, lang, isOpen, record, setLang, unlockAll } = useArabic();
  const [tab, setTab] = useState('learn');
  const t = tr(lang); const rtl = lang === 'ur';
  const gen = makeGen(lang);
  const next = n < LEVELS.length ? n + 1 : null;
  if (ready && !isOpen(n)) {
    return (
      <div className="container narrow" dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
        <div className="page-head"><h1>{t.level} {n}: {rtl ? lv.ur : lv.en}</h1></div>
        <p>{t.passPrev(n - 1)}</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn primary" href={`/learn-arabic/${n - 1}/`}>{t.goNext(n - 1)}</Link>
          <button className="btn" onClick={unlockAll}>{t.unlock}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="container narrow lq" dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/learn-arabic/">{t.back}</Link> / {t.level} {n}</nav>
      <div className="page-head">
        <p className="muted small">{t.level} {n} {t.of} {LEVELS.length} · {t.about(lv.minutes)}</p>
        <h1>{rtl ? lv.ur : lv.en}</h1>
        <p className="muted">{rtl ? lv.goalUr : lv.goalEn}</p>
      </div>
      <LangChooser compact value={lang} onPick={setLang} />
      <div className="lq-tabs" role="tablist" aria-label="Level sections">
        {[['learn', t.learn], ['practice', t.practice], ['quiz', t.quiz]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}{k === 'quiz' && s.passed[n] ? ' ✓' : ''}</button>
        ))}
      </div>
      <SpeedToggle />
      {tab === 'learn' && (<><Lesson n={n} lang={lang} /><div className="row" style={{ margin: '22px 0' }}><button className="btn primary" onClick={() => setTab('practice')}>{t.continuePractice}</button></div></>)}
      {tab === 'practice' && (<div className="stack" style={{ gap: 14 }}><PracticeQuestions level={n} gen={gen} key={lang} /><div className="row"><button className="btn" onClick={() => setTab('quiz')}>{t.ready}</button></div></div>)}
      {tab === 'quiz' && (
        <div>
          <p className="muted">{t.quizInfo(Math.ceil(PASS_MARK * 10), s.best[n] ? Math.round(s.best[n] * 100) : 0)}</p>
          <QuizRun level={n} next={next} gen={gen} key={lang} nextHref={(x) => `/learn-arabic/${x}/`} labels={{ go: t.goNext }} onFinish={(ratio) => record(n, ratio, PASS_MARK)} />
        </div>
      )}
    </div>
  );
}
