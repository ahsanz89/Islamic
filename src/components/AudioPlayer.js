'use client';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import * as audio from '@/lib/audio-engine';
import { useAudioState, useAudioTime, wordKey } from '@/lib/audio-engine';
import { RECITERS, reciterById, reciterName } from '@/lib/reciters';

const svg = (d, fill) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const I = {
  play: svg(<path d="M7 4.5v15l13-7.5z" />, true),
  pause: svg(<><rect x="6" y="4.5" width="4.2" height="15" rx="1" /><rect x="13.8" y="4.5" width="4.2" height="15" rx="1" /></>, true),
  prev: svg(<><path d="M6 5v14" /><path d="M20 5.5v13L9 12z" fill="currentColor" /></>),
  next: svg(<><path d="M18 5v14" /><path d="M4 5.5v13L15 12z" fill="currentColor" /></>),
  stop: svg(<rect x="6" y="6" width="12" height="12" rx="2" />, true),
  repeat: svg(<><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>),
  vol: svg(<><path d="M11 5L6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>),
  mute: svg(<><path d="M11 5L6 9H2v6h4l5 4z" /><path d="M22 9l-6 6M16 9l6 6" /></>),
  retry: svg(<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>),
  speaker: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
  ),
  list: svg(<><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>)
};

const TX = {
  en: { player: 'Quran audio player', reciter: 'Reciter', play: 'Play', pause: 'Pause', stop: 'Close player', prev: 'Previous ayah', next: 'Next ayah', repeat: 'Repeat this ayah', cont: 'Play on to the next ayah', volume: 'Volume', seek: 'Seek', playSurah: 'Play surah', pauseSurah: 'Pause', resumeSurah: 'Resume', playAyah: 'Play ayah', pauseAyah: 'Pause ayah', playWord: 'Hear pronunciation', loading: 'Loading audio…', errUnavail: 'This recitation is not available right now.', errOffline: 'You are offline. Audio will resume when you reconnect.', retry: 'Retry', bism: 'Bismillah', ayah: 'Ayah', audio: 'Audio', wordsOn: 'Word pronunciation controls', hover: 'Play a word when the pointer rests on it', bismOn: 'Start surah with the Bismillah', contOn: 'Continue to the next ayah', repeatOn: 'Repeat each ayah', wordUnavail: 'Pronunciation for this word is not available right now.', offline: 'You are offline.', fallbackTitle: 'Fallback voice (recorded audio unavailable)', urdu: 'Urdu translation audio', urduNow: 'Urdu translation', urduOn: 'Play the Urdu translation after each ayah', urduUnavail: 'Urdu translation audio is not available for this ayah.', whole: 'This reciter is published as full surahs, so the whole surah plays.', wholeUrdu: 'Urdu translation audio plays after each ayah only with ayah-by-ayah reciters (for example Alafasy). Badr Al-Turki plays the whole surah.', on: 'On', off: 'Off' },
  ur: { player: 'قرآن آڈیو پلیئر', reciter: 'قاری', play: 'چلائیں', pause: 'روکیں', stop: 'پلیئر بند کریں', prev: 'پچھلی آیت', next: 'اگلی آیت', repeat: 'اسی آیت کو دہرائیں', cont: 'اگلی آیت پر چلتے رہیں', volume: 'آواز', seek: 'آگے پیچھے کریں', playSurah: 'پوری سورت سنیں', pauseSurah: 'روکیں', resumeSurah: 'جاری رکھیں', playAyah: 'آیت سنیں', pauseAyah: 'آیت روکیں', playWord: 'تلفظ سنیں', loading: 'آڈیو لوڈ ہو رہی ہے…', errUnavail: 'یہ تلاوت ابھی دستیاب نہیں۔', errOffline: 'آپ آف لائن ہیں۔ انٹرنیٹ آتے ہی آڈیو جاری ہو جائے گی۔', retry: 'دوبارہ کوشش', bism: 'بسم اللہ', ayah: 'آیت', audio: 'آڈیو', wordsOn: 'لفظ کے تلفظ کے بٹن', hover: 'لفظ پر ماؤس رکنے پر خود چلائیں', bismOn: 'سورت کا آغاز بسم اللہ سے کریں', contOn: 'اگلی آیت پر خود چلیں', repeatOn: 'ہر آیت دہرائیں', wordUnavail: 'اس لفظ کا تلفظ ابھی دستیاب نہیں۔', offline: 'آپ آف لائن ہیں۔', fallbackTitle: 'متبادل آواز (ریکارڈ شدہ آڈیو دستیاب نہیں)', urdu: 'اردو ترجمہ آڈیو', urduNow: 'اردو ترجمہ', urduOn: 'ہر آیت کے بعد اردو ترجمہ سنائیں', urduUnavail: 'اس آیت کا اردو ترجمہ آڈیو دستیاب نہیں۔', whole: 'اس قاری کی تلاوت مکمل سورت کی صورت میں ہے، اس لیے پوری سورت چلے گی۔', wholeUrdu: 'اردو ترجمہ آڈیو ہر آیت کے بعد صرف آیت بہ آیت قاری کے ساتھ چلتا ہے (مثلاً العفاسی)۔ بدر الترکی پوری سورت سناتے ہیں۔', on: 'آن', off: 'آف' },
  ar: { player: 'مشغّل القرآن', reciter: 'القارئ', play: 'تشغيل', pause: 'إيقاف مؤقت', stop: 'إغلاق المشغّل', prev: 'الآية السابقة', next: 'الآية التالية', repeat: 'تكرار هذه الآية', cont: 'المتابعة للآية التالية', volume: 'مستوى الصوت', seek: 'تقديم / تأخير', playSurah: 'تشغيل السورة', pauseSurah: 'إيقاف مؤقت', resumeSurah: 'استئناف', playAyah: 'تشغيل الآية', pauseAyah: 'إيقاف الآية', playWord: 'استماع النطق', loading: 'جارٍ تحميل الصوت…', errUnavail: 'هذه التلاوة غير متاحة الآن.', errOffline: 'أنت غير متصل. سيُستأنف الصوت عند عودة الاتصال.', retry: 'إعادة المحاولة', bism: 'البسملة', ayah: 'الآية', audio: 'الصوت', wordsOn: 'أزرار نطق الكلمات', hover: 'تشغيل الكلمة عند التوقف عليها بالمؤشر', bismOn: 'ابدأ السورة بالبسملة', contOn: 'المتابعة للآية التالية', repeatOn: 'تكرار كل آية', wordUnavail: 'نطق هذه الكلمة غير متاح الآن.', offline: 'أنت غير متصل.', fallbackTitle: 'صوت بديل (التسجيل غير متاح)', urdu: 'الترجمة الأردية صوتًا', urduNow: 'الترجمة الأردية', urduOn: 'تشغيل الترجمة الأردية بعد كل آية', urduUnavail: 'الترجمة الصوتية الأردية غير متاحة لهذه الآية.', whole: 'هذا القارئ متاح بسور كاملة، لذلك تُشغَّل السورة كاملة.', wholeUrdu: 'تُشغَّل الترجمة الأردية بعد كل آية مع القرّاء الذين يتوفرون آية بآية فقط (مثل العفاسي).', on: 'تشغيل', off: 'إيقاف' }
};
export const useAudioText = () => {
  const { settings } = useApp();
  return TX[settings.ui] || TX.en;
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Mount once in the layout: syncs saved settings into the engine, outside-click handling and the toast. */
export function AudioBridge() {
  const { settings } = useApp();
  const tx = useAudioText();
  const toast = useAudioState((s) => s.toast);
  useEffect(() => {
    audio.configure({
      reciter: settings.reciter, repeat: settings.repeat, continuous: settings.continuous,
      bismillah: settings.bismillah, volume: settings.volume, wordAudio: settings.wordAudio, wordHoverPlay: settings.wordHoverPlay, urdu: settings.urduTilawat
    });
  }, [settings.reciter, settings.repeat, settings.continuous, settings.bismillah, settings.volume, settings.wordAudio, settings.wordHoverPlay, settings.urduTilawat]);
  return toast ? <div className="audio-toast" role="status">{toast === 'offline' ? tx.offline : toast === 'urdu-unavailable' ? tx.urduUnavail : tx.wordUnavail}</div> : null;
}

export function ReciterSelect({ id = 'reciter', compact }) {
  const { settings, update } = useApp();
  const tx = useAudioText();
  const lang = settings.ui;
  return (
    <label className={`reciter-select ${compact ? 'compact' : ''}`}>
      {!compact && <span className="rs-label">{tx.reciter}</span>}
      <select id={id} value={reciterById(settings.reciter).id} onChange={(e) => update({ reciter: e.target.value })} aria-label={tx.reciter}>
        {RECITERS.map((r) => <option key={r.id} value={r.id}>{reciterName(r, lang)}</option>)}
      </select>
    </label>
  );
}

/** Switch for the spoken Urdu translation after each ayah. */
export function UrduAudioToggle() {
  const { settings, update } = useApp();
  const tx = useAudioText();
  return (
    <button type="button" className="btn small" aria-pressed={!!settings.urduTilawat} onClick={() => update({ urduTilawat: !settings.urduTilawat })} title={tx.urduOn}>
      {I.vol}<span lang={settings.ui === 'ur' ? 'ur' : undefined}>{tx.urdu}: {settings.urduTilawat ? tx.on : tx.off}</span>
    </button>
  );
}

/** Tells the reader when the chosen reciter only exists as full-surah files. */
export function WholeNote() {
  const { settings } = useApp();
  const tx = useAudioText();
  return reciterById(settings.reciter).type === 'surah' ? <p className="muted small whole-note">{settings.urduTilawat ? tx.wholeUrdu : tx.whole}</p> : null;
}

/** Play / pause button for one ayah. */
export const AyahPlayButton = memo(function AyahPlayButton({ surah, v, small = true }) {
  const tx = useAudioText();
  const st = useAudioState((s) => (s.q && s.q.surah.n === surah.n && s.q.v === v ? s.status : ''));
  const active = st === 'playing' || st === 'loading';
  const onClick = () => {
    if (st === 'playing' || st === 'loading') audio.pause();
    else if (st === 'paused') audio.resume();
    else audio.playAyah(surah, v);
  };
  return (
    <button type="button" className={`btn ${small ? 'small' : ''} icon ayah-play ${active ? 'on' : ''}`} onClick={onClick} aria-pressed={active} aria-label={active ? tx.pauseAyah : tx.playAyah} title={active ? tx.pauseAyah : tx.playAyah}>
      {st === 'loading' ? <span className="spin" aria-hidden="true" /> : active ? I.pause : I.play}
    </button>
  );
});

export function PlaySurahButton({ surah }) {
  const tx = useAudioText();
  const st = useAudioState((s) => (s.q && s.q.surah.n === surah.n && s.q.mode === 'surah' ? s.status : ''));
  const active = st === 'playing' || st === 'loading';
  const label = active ? tx.pauseSurah : st === 'paused' ? tx.resumeSurah : tx.playSurah;
  const onClick = () => {
    if (active) audio.pause();
    else if (st === 'paused') audio.resume();
    else audio.playSurah(surah);
  };
  return (
    <button type="button" className="btn primary play-surah" onClick={onClick} aria-pressed={active}>
      {st === 'loading' ? <span className="spin" aria-hidden="true" /> : active ? I.pause : I.play}
      <span>{label}</span>
    </button>
  );
}

/** One Quranic word with a pronunciation control (hover / focus / tap). */
export const QuranWord = memo(function QuranWord({ s, v, pos, text, className = '' }) {
  const { settings } = useApp();
  const tx = useAudioText();
  const key = wordKey(s, v, pos);
  const st = useAudioState((x) => (x.word.key === key ? x.word.status : ''));
  const [sel, setSel] = useState(false);
  const timer = useRef(0);
  const ref = useRef(null);
  const enabled = settings.wordAudio;

  // tapping elsewhere hides the control again
  useEffect(() => {
    if (!sel) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setSel(false); };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [sel]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const play = useCallback(() => audio.playWord(s, v, pos, text), [s, v, pos, text]);
  const canHover = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches;
  const onEnter = () => {
    if (!enabled || !settings.wordHoverPlay || !canHover) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(play, 180);
  };
  const onLeave = () => clearTimeout(timer.current);
  const onTextClick = () => {
    if (!enabled) return;
    if (sel || canHover) play();
    setSel(true);
  };
  const busy = st === 'loading';
  return (
    <span ref={ref} className={`qw ${sel ? 'sel' : ''} ${st ? 'playing' : ''} ${className}`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <span className="qw-t" lang="ar" onClick={onTextClick}>{text}</span>
      {enabled && (
        <button type="button" className="qw-btn" onClick={(e) => { e.stopPropagation(); play(); setSel(true); }} aria-label={tx.playWord} title={st === 'fallback' ? tx.fallbackTitle : tx.playWord}>
          {busy ? <span className="spin sm" aria-hidden="true" /> : I.speaker}
        </button>
      )}
    </span>
  );
});

/** Compact bottom player. Appears as soon as something is played. */
export function AudioPlayer() {
  const { settings, update } = useApp();
  const tx = useAudioText();
  const q = useAudioState((s) => s.q);
  const status = useAudioState((s) => s.status);
  const err = useAudioState((s) => s.err);
  const time = useAudioTime((s) => Math.floor(s.time * 4) / 4);
  const dur = useAudioTime((s) => Math.floor(s.dur));
  const phase = useAudioState((s) => s.phase);
  const [volOpen, setVolOpen] = useState(false);
  if (!q) return null;
  const r = reciterById(settings.reciter);
  const playing = status === 'playing' || status === 'loading';
  const sname = settings.ui === 'ar' || settings.ui === 'ur' ? q.surah.ar : q.surah.name;
  const where = q.whole ? sname : q.v === 0 ? `${sname} · ${tx.bism}` : `${sname} · ${tx.ayah} ${q.v}/${q.surah.verses}`;
  const first = q.v <= (q.mode === 'surah' && settings.bismillah && q.surah.n !== 1 && q.surah.n !== 9 ? 0 : 1);
  const last = q.whole || q.v >= q.surah.verses;
  return (
    <div className={`aplayer ${status}`} role="region" aria-label={tx.player} dir={settings.ui === 'ur' || settings.ui === 'ar' ? 'rtl' : 'ltr'}>
      <div className="ap-info">
        <strong className="ap-where">{where}{phase === 'urdu' ? ` · ${tx.urduNow}` : ''}</strong>
        <span className="ap-reciter">{phase === 'urdu' ? 'Shamshad Ali Khan' : reciterName(r, settings.ui)}</span>
        {status === 'error' && (
          <span className="ap-err" role="alert">
            {err === 'offline' ? tx.errOffline : tx.errUnavail}{' '}
            <button type="button" className="ap-link" onClick={audio.retry}>{I.retry}{tx.retry}</button>
          </span>
        )}
      </div>
      <div className="ap-main">
        <div className="ap-controls" dir="ltr">
          <button type="button" className="ap-btn" onClick={audio.prev} disabled={q.whole ? false : first && time < 3} aria-label={tx.prev} title={tx.prev}>{I.prev}</button>
          <button type="button" className="ap-btn big" onClick={audio.toggle} aria-label={playing ? tx.pause : tx.play} title={playing ? tx.pause : tx.play}>
            {status === 'loading' ? <span className="spin" aria-hidden="true" /> : playing ? I.pause : I.play}
          </button>
          <button type="button" className="ap-btn" onClick={audio.next} disabled={last} aria-label={tx.next} title={tx.next}>{I.next}</button>
        </div>
        <div className="ap-seek" dir="ltr">
          <span className="ap-time">{fmt(time)}</span>
          <input type="range" min="0" max={Math.max(dur, 1)} step="0.25" value={Math.min(time, Math.max(dur, 1))} onChange={(e) => audio.seek(Number(e.target.value))} aria-label={tx.seek} aria-valuetext={`${fmt(time)} / ${fmt(dur)}`} style={{ '--p': `${dur ? (time / dur) * 100 : 0}%` }} />
          <span className="ap-time">{fmt(dur)}</span>
        </div>
      </div>
      <div className="ap-extra" dir="ltr">
        <button type="button" className={`ap-btn ${settings.repeat ? 'on' : ''}`} onClick={() => update({ repeat: !settings.repeat })} aria-pressed={settings.repeat} aria-label={tx.repeat} title={tx.repeat}>{I.repeat}</button>
        <button type="button" className={`ap-btn hide-sm ${settings.continuous ? 'on' : ''}`} onClick={() => update({ continuous: !settings.continuous })} aria-pressed={settings.continuous} aria-label={tx.cont} title={tx.cont}>{I.list}</button>
        <div className="ap-vol">
          <button type="button" className="ap-btn" onClick={() => setVolOpen(!volOpen)} aria-label={tx.volume} aria-expanded={volOpen}>{settings.volume === 0 ? I.mute : I.vol}</button>
          <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(e) => update({ volume: Number(e.target.value) })} aria-label={tx.volume} className={volOpen ? 'open' : ''} style={{ '--p': `${settings.volume * 100}%` }} />
        </div>
        <ReciterSelect id="player-reciter" compact />
        <button type="button" className="ap-btn" onClick={audio.stop} aria-label={tx.stop} title={tx.stop}>{I.stop}</button>
      </div>
    </div>
  );
}

/** Audio section for the settings drawer. */
export function AudioSettings() {
  const { settings, update } = useApp();
  const tx = useAudioText();
  const Toggle = ({ k, label }) => (
    <label className="toggle-row">
      <input type="checkbox" checked={!!settings[k]} onChange={(e) => update({ [k]: e.target.checked })} />
      <span>{label}</span>
    </label>
  );
  return (
    <div className="field audio-settings">
      <span>{tx.audio}</span>
      <ReciterSelect id="drawer-reciter" />
      <Toggle k="urduTilawat" label={tx.urduOn} />
      <Toggle k="wordAudio" label={tx.wordsOn} />
      <Toggle k="wordHoverPlay" label={tx.hover} />
      <Toggle k="bismillah" label={tx.bismOn} />
      <Toggle k="continuous" label={tx.contOn} />
      <Toggle k="repeat" label={tx.repeatOn} />
    </div>
  );
}
