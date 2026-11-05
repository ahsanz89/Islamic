'use client';
import Link from 'next/link';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import { BookmarkButton, CopyButton, Icon, ReadingBar } from '@/components/ui';
import { getJSON } from '@/lib/client-data';
import { stripDiacritics } from '@/lib/arabic.mjs';
import { LANG_NAMES } from '@/lib/i18n';
import { AyahPlayButton, PlaySurahButton, QuranWord, ReciterSelect, UrduAudioToggle, WholeNote } from '@/components/AudioPlayer';
import { useAudioState } from '@/lib/audio-engine';

/** One verse. Re-renders only when its own playback state, text options or translations change. */
const Verse = memo(function Verse({ v, surah, keys, translators, wbw, harakat, wordAudio }) {
  const key = `${surah.n}:${v.v}`;
  const status = useAudioState((x) => (x.q && x.q.surah.n === surah.n && x.q.v === v.v ? x.status : ''));
  const urduNow = useAudioState((x) => (x.q && x.q.surah.n === surah.n && x.q.v === v.v && x.phase === 'urdu'));
  const surahMode = useAudioState((x) => !!(x.q && x.q.mode === 'surah'));
  const ref = useRef(null);
  const show = (t) => (harakat ? t : stripDiacritics(t));
  const words = wordAudio && !v.na; // verses whose word count disagrees with the recordings keep plain text

  // while a whole surah plays, keep the current ayah in view
  useEffect(() => {
    if (status !== 'playing' || !surahMode || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 150) {
      ref.current.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [status, surahMode]);

  return (
    <article ref={ref} id={`v${v.v}`} className={`hadith ${status ? 'is-playing' : ''} ${status === 'paused' ? 'is-paused' : ''}`}>
      <div className="hadith-head">
        <AyahPlayButton surah={surah} v={v.v} />
        <span className="num">{key}</span>
        <span className="muted small">Juz {v.juz} · p. {v.page}</span>
        <span className="spacer" />
        <BookmarkButton small iconOnly item={{ key: `q:${key}`, type: 'ayah', s: surah.n, v: v.v, title: `${surah.name} ${key}`, preview: v.t.en?.slice(0, 160) }} />
        <CopyButton small iconOnly text={`${v.ar}\n\n${keys.map((k) => v.t[k]).join('\n\n')}\n\n— ${surah.name} ${key}`} />
      </div>
      <div className="hadith-body">
        {wbw ? (
          <div className="wbw">
            {v.w.map((w, i) => (
              <div className="word" key={i}>
                {wordAudio && !v.na
                  ? <span className="wa"><QuranWord s={surah.n} v={v.v} pos={i + 1} text={show(w.a)} /></span>
                  : <span className="wa" lang="ar">{show(w.a)}</span>}
                {w.tl && <span className="wt">{w.tl}</span>}
                {w.en && <span className="we">{w.en}</span>}
                {w.r && <Link className="wr" href={`/quran/roots/?r=${encodeURIComponent(w.r)}`}>{w.r}</Link>}
              </div>
            ))}
          </div>
        ) : (
          <p className="quran-ar" lang="ar" style={{ margin: 0 }}>
            {words
              ? v.w.map((w, i) => <span key={i}><QuranWord s={surah.n} v={v.v} pos={i + 1} text={show(w.a)} />{' '}</span>)
              : show(v.ar)}{' '}
            <span style={{ color: 'var(--gold)' }}>﴿{v.v.toLocaleString('ar-EG')}﴾</span>
          </p>
        )}
        {v.tl && <p className="muted small" style={{ margin: 0, fontStyle: 'italic' }}>{v.tl}</p>}
        {keys.map((k) => (
          <div key={k} className={`tr-block ${urduNow && k.startsWith('ur') ? 'speaking' : ''}`} lang={k.slice(0, 2)} dir={k.startsWith('ur') ? 'rtl' : 'ltr'}>
            <div className="tr-label">{LANG_NAMES[k.slice(0, 2)]} · {translators[k]}</div>
            <p className={`tr-text ${k.startsWith('ur') ? 'tr-ur' : ''}`}>{v.t[k]}</p>
          </div>
        ))}
      </div>
    </article>
  );
});

export default function SurahReader({ surah, translators, prev, next }) {
  const { t, settings, setLastRead } = useApp();
  const [verses, setVerses] = useState(null);
  const [wbw, setWbw] = useState(false);
  const [second, setSecond] = useState(false);
  useEffect(() => {
    setVerses(null);
    getJSON(`q/${surah.n}.json`).then(setVerses);
    setLastRead({ path: `/quran/${surah.n}/`, title: `${surah.n}. ${surah.name} · ${surah.ar}`, sub: surah.en });
  }, [surah.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const keys = [];
  for (const l of settings.tr) {
    if (translators[l]) keys.push(l);
    if (second && translators[l + '2']) keys.push(l + '2');
  }
  // while the Urdu audio is on, the Urdu text is always shown so it can be followed
  if (settings.urduAudio && translators.ur && !keys.includes('ur')) keys.push('ur');
  const keysKey = keys.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keysStable = useMemo(() => keys, [keysKey]);

  return (
    <div className="container narrow">
      <header className="surah-hero">
        <nav className="breadcrumb"><Link href="/quran/">{t('quran')}</Link><span>/</span></nav>
        <div className="sh-frame">
          <span className="sh-num" aria-label={`${t('surah')} ${surah.n}`}>{surah.n}</span>
          <p className="sh-ar quran-ar" lang="ar">{surah.ar}</p>
          <h1 className="sh-name">{surah.name}</h1>
          {surah.en !== surah.name && <p className="sh-en">{surah.en}</p>}
          <ul className="sh-facts">
            <li>{surah.place === 'Mecca' ? t('meccan') : t('medinan')}</li>
            <li>{surah.verses} {t('verses')}</li>
            {verses && <li>Juz {verses[0].juz}{verses[verses.length - 1].juz !== verses[0].juz ? `–${verses[verses.length - 1].juz}` : ''}</li>}
            {verses && <li>p. {verses[0].page}</li>}
          </ul>
        </div>
        <div className="listen-bar">
          <PlaySurahButton surah={surah} />
          <ReciterSelect id="surah-reciter" />
          <UrduAudioToggle />
        </div>
        <WholeNote />
      </header>
      <ReadingBar
        choices={Object.keys(translators).filter((k) => !k.endsWith('2'))}
        extra={<>
          <span className="sep" />
          <button className="btn small" aria-pressed={wbw} onClick={() => setWbw(!wbw)}>{t('wordByWord')}</button>
          <button className="btn small" aria-pressed={second} onClick={() => setSecond(!second)}>+ {t('translationBy')}</button>
          <Link className="btn small ghost" href="/quran/roots/">{t('roots')}</Link>
        </>}
      />
      {surah.n !== 1 && surah.n !== 9 && <p className="quran-ar bismillah" lang="ar">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</p>}
      {!verses ? <div className="empty">{t('loading')}</div> : (
        <div className="stack" style={{ gap: 14 }}>
          {verses.map((v) => (
            <Verse key={v.v} v={v} surah={surah} keys={keysStable} translators={translators} wbw={wbw} harakat={settings.harakat} wordAudio={settings.wordAudio} />
          ))}
        </div>
      )}
      <div className="row" style={{ margin: '16px 0' }}>
        {prev ? <Link className="btn" href={`/quran/${prev.n}/`}>{Icon.back}{prev.name}</Link> : null}
        <span className="spacer" />
        {next ? <Link className="btn primary" href={`/quran/${next.n}/`}>{next.name}{Icon.next}</Link> : null}
      </div>
    </div>
  );
}
