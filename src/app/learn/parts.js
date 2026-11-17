'use client';
import { useEffect, useRef, useState } from 'react';
import { arabicVoices, getSpeed, loadVoices, onLessonState, onSpeedChange, setSpeed, playLesson, saveVoiceName, savedVoiceName, stopLesson } from '@/lib/learn-audio';

export function Sound({ text, id, label = 'Listen', className = '', children }) {
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const me = useRef(false);
  useEffect(() => onLessonState((st) => { if (st === 'idle') { me.current = false; setPlaying(false); } else setPlaying(me.current); }), []);
  const go = async (e) => {
    e?.stopPropagation?.();
    if (playing) { stopLesson(); return; }
    me.current = true;
    setFailed(false);
    const r = await playLesson({ text, id });
    if (r === 'none') { me.current = false; setPlaying(false); }
    setFailed(r === 'none');
  };
  return (
    <>
      <button type="button" className={`lq-sound ${playing ? 'playing' : ''} ${className}`} onClick={go} aria-pressed={playing} aria-label={`${playing ? 'Stop' : label}: ${text}`} data-sound={text}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{playing ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>}</svg>
        {children || <span>{playing ? 'Stop' : label}</span>}
      </button>
      {failed && <p className="lq-warn" role="alert">Sorry, this sound could not be played. Check your internet connection and try again, or open “Sound help” at the top of the page.</p>}
    </>
  );
}

/** Explains the voice situation and lets the learner pick any installed voice. */
export function VoiceNotice() {
  const [voices, setVoices] = useState(null);
  const [pick, setPick] = useState('');
  useEffect(() => { loadVoices().then(setVoices); setPick(savedVoiceName()); }, []);
  if (voices === null) return null;
  // Every lesson sound ships as a recording, so this help only matters if recordings fail to load (offline first visit).
  if (arabicVoices(voices).length || window.__lqRecordings !== false) return null;
  return (
    <details className="lq-warn lq-help">
      <summary><strong>Sound help:</strong> this device has no Arabic voice</summary>
      <p>Lessons need an Arabic voice to speak. Pick one of these options:</p>
      <ol>
        <li><strong>Windows:</strong> Settings → Time &amp; language → Language &amp; region → Add a language → Arabic, tick “Text-to-speech”, then restart the browser. (Microsoft Edge also offers free online Arabic voices once the language is added.)</li>
        <li><strong>Android / iPhone / Mac:</strong> an Arabic voice is normally built in. Check Settings → Accessibility → Text-to-speech.</li>
        <li><strong>Or try a voice you already have</strong> (it may not sound right for Arabic):
          <select aria-label="Voice" value={pick} onChange={(e) => { setPick(e.target.value); saveVoiceName(e.target.value); }}>
            <option value="">Automatic</option>
            {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        </li>
      </ol>
      <p className="muted small">{voices.length} voices found on this device, none Arabic. The same lessons on the Android app use the phone&rsquo;s Arabic voice.</p>
    </details>
  );
}

/** Slow (default) / Normal playback speed for every lesson sound. */
export function SpeedToggle() {
  const [sp, setSp] = useState('slow');
  useEffect(() => { setSp(getSpeed()); return onSpeedChange(setSp); }, []);
  return (
    <div className="lq-speed" role="group" aria-label="Sound speed">
      <span className="muted small">Sound speed:</span>
      {[['slow', 'Slow learning'], ['normal', 'Normal']].map(([k, l]) => (
        <button key={k} type="button" className={sp === k ? 'on' : ''} aria-pressed={sp === k} onClick={() => setSpeed(k)}>{l}</button>
      ))}
    </div>
  );
}
