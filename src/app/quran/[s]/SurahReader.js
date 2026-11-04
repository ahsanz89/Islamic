'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { BookmarkButton, CopyButton, Icon, ReadingBar } from '@/components/ui';
import { getJSON } from '@/lib/client-data';
import { stripDiacritics } from '@/lib/arabic.mjs';
import { LANG_NAMES } from '@/lib/i18n';

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
  const show = (s) => (settings.harakat ? s : stripDiacritics(s));

  return (
    <div className="container narrow">
      <div className="page-head">
        <nav className="breadcrumb"><Link href="/quran/">{t('quran')}</Link><span>/</span></nav>
        <div className="row" style={{ alignItems: 'center', gap: 16 }}>
          <div style={{ flex: '1 1 260px' }}>
            <p className="eyebrow">{t('surah')} {surah.n}</p>
            <h1>{surah.name}</h1>
            <p className="muted" style={{ margin: 0 }}>{surah.en} · {surah.verses} {t('verses')} · {surah.place === 'Mecca' ? t('meccan') : t('medinan')}</p>
          </div>
          <span className="quran-ar" style={{ fontSize: 40, color: 'var(--brand)', lineHeight: 1.5 }}>{surah.ar}</span>
        </div>
      </div>
      <ReadingBar
        choices={Object.keys(translators).filter((k) => !k.endsWith('2'))}
        extra={<>
          <span className="sep" />
          <button className="btn small" aria-pressed={wbw} onClick={() => setWbw(!wbw)}>{t('wordByWord')}</button>
          <button className="btn small" aria-pressed={second} onClick={() => setSecond(!second)}>+ {t('translationBy')}</button>
          <Link className="btn small ghost" href="/quran/roots/">{t('roots')}</Link>
        </>}
      />
      {surah.n !== 1 && surah.n !== 9 && <p className="quran-ar" style={{ textAlign: 'center' }}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</p>}
      {!verses ? <div className="empty">{t('loading')}</div> : (
        <div className="stack" style={{ gap: 14 }}>
          {verses.map((v) => {
            const key = `${surah.n}:${v.v}`;
            return (
              <article key={v.v} id={`v${v.v}`} className="hadith">
                <div className="hadith-head">
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
                          <span className="wa" lang="ar">{show(w.a)}</span>
                          {w.tl && <span className="wt">{w.tl}</span>}
                          {w.en && <span className="we">{w.en}</span>}
                          {w.r && <Link className="wr" href={`/quran/roots/?r=${encodeURIComponent(w.r)}`}>{w.r}</Link>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="quran-ar" lang="ar" style={{ margin: 0 }}>{show(v.ar)} <span style={{ color: 'var(--gold)' }}>﴿{v.v.toLocaleString('ar-EG')}﴾</span></p>}
                  {v.tl && <p className="muted small" style={{ margin: 0, fontStyle: 'italic' }}>{v.tl}</p>}
                  {keys.map((k) => (
                    <div key={k} className="tr-block" lang={k.slice(0, 2)} dir={k.startsWith('ur') ? 'rtl' : 'ltr'}>
                      <div className="tr-label">{LANG_NAMES[k.slice(0, 2)]} · {translators[k]}</div>
                      <p className={`tr-text ${k.startsWith('ur') ? 'tr-ur' : ''}`}>{v.t[k]}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
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
