'use client';
import { useEffect, useState } from 'react';
import { arabicVoices, loadVoices, playLesson, saveVoiceName, savedVoiceName } from '@/lib/learn-audio';

export function Sound({ text, id, label = 'Listen', className = '', children }) {
  const [failed, setFailed] = useState(false);
  const go = async (e) => {
    e?.stopPropagation?.();
    const r = await playLesson({ text, id });
    setFailed(r === 'none');
  };
  return (
    <>
      <button type="button" className={`lq-sound ${className}`} onClick={go} aria-label={`${label}: ${text}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        {children || <span>{label}</span>}
      </button>
      {failed && <p className="lq-warn" role="status">No sound could be played. Open “Sound help” at the top of this page to pick a voice or see how to add an Arabic voice.</p>}
    </>
  );
}

/** Explains the voice situation and lets the learner pick any installed voice. */
export function VoiceNotice() {
  const [voices, setVoices] = useState(null);
  const [pick, setPick] = useState('');
  useEffect(() => { loadVoices().then(setVoices); setPick(savedVoiceName()); }, []);
  if (voices === null) return null;
  const ar = arabicVoices(voices);
  if (ar.length) return null;
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
