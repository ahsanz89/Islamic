'use client';
import { useEffect, useState } from 'react';
import { playLesson, voiceStatus } from '@/lib/learn-audio';

export function Sound({ text, id, label = 'Listen', className = '', children }) {
  const [msg, setMsg] = useState('');
  const go = async (e) => {
    e?.stopPropagation?.();
    const r = await playLesson({ text, id });
    setMsg(r === 'none' ? 'no-voice' : '');
  };
  return (
    <>
      <button type="button" className={`lq-sound ${className}`} onClick={go} aria-label={`${label}: ${text}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        {children || <span>{label}</span>}
      </button>
      {msg && <p className="lq-warn" role="status">No Arabic voice was found on this device. Install an Arabic text-to-speech voice in your device settings, or use a browser such as Chrome or Safari that includes one.</p>}
    </>
  );
}

export function VoiceNotice() {
  const [st, setSt] = useState('ok');
  useEffect(() => {
    const u = () => setSt(voiceStatus());
    u();
    window.speechSynthesis?.addEventListener?.('voiceschanged', u);
    const t = setTimeout(u, 800);
    return () => { window.speechSynthesis?.removeEventListener?.('voiceschanged', u); clearTimeout(t); };
  }, []);
  if (st === 'ok' || st === 'unknown') return null;
  return <p className="lq-warn" role="status">This device has no Arabic voice, so lesson audio will be silent. Install an Arabic voice (Settings → Accessibility / Language → Text-to-speech), or try Chrome or Safari.</p>;
}
