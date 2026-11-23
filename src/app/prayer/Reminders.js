'use client';
// Prayer and daily-reading reminders using browser notifications. A website can only show them while a DALIL tab is open
// (it cannot wake a closed phone without a server). The DALIL app schedules them on the phone so they arrive when it is closed.
import { useEffect, useState } from 'react';
import { CalculationMethod, Coordinates, Madhab, PrayerTimes as Adhan } from 'adhan';
import { CITIES } from '@/components/PrayerTimes';

const KEY = 'dalil.reminders.v1';
const NAMES = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const load = () => { try { return { on: false, prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, reading: false, readingAt: '20:00', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { on: false, prayers: {}, reading: false, readingAt: '20:00' }; } };

function placeNow() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('hl-place') || 'null'); } catch { /* none */ }
  if (saved && saved.lat != null) return { ...saved, asr: saved.asrChoice || saved.asr };
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return CITIES.find((c) => c.tz === tz) || CITIES.find((c) => c.name === 'Makkah');
}
/** When each reminder is due in the next 36 hours: [{ at: Date, title, body }]. */
export function plan(cfg, now = new Date()) {
  const out = [];
  if (cfg.on) {
    const p = placeNow();
    for (const day of [0, 1]) {
      const d = new Date(now.getTime() + day * 86400000);
      const params = CalculationMethod[p.method] ? CalculationMethod[p.method]() : CalculationMethod.MuslimWorldLeague();
      params.madhab = p.asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
      const t = new Adhan(new Coordinates(p.lat, p.lon), d, params);
      for (const k of Object.keys(NAMES)) if (cfg.prayers[k] !== false && t[k] > now) out.push({ at: t[k], title: `${NAMES[k]} time`, body: `It is time for ${NAMES[k]} in ${p.name}.` });
    }
  }
  if (cfg.reading) {
    const [h, m] = String(cfg.readingAt || '20:00').split(':').map(Number);
    for (const day of [0, 1]) { const d = new Date(now); d.setDate(d.getDate() + day); d.setHours(h || 0, m || 0, 0, 0); if (d > now) out.push({ at: d, title: 'Time to read', body: 'A few ayat today keep your reading streak alive.' }); }
  }
  return out.sort((a, b) => a.at - b.at);
}

export default function Reminders() {
  const [cfg, setCfg] = useState(null);
  const [perm, setPerm] = useState('default');
  useEffect(() => { setCfg(load()); setPerm(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission); }, []);
  const save = (next) => { setCfg(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } };

  // while this page is open, set a timer for each reminder due soon
  useEffect(() => {
    if (!cfg || perm !== 'granted') return undefined;
    const timers = plan(cfg).slice(0, 12).map((r) => setTimeout(() => { try { new Notification(r.title, { body: r.body, icon: '/icon.svg', tag: `dalil-${r.at.getTime()}` }); } catch { /* blocked */ } }, Math.max(0, r.at - Date.now())));
    return () => timers.forEach(clearTimeout);
  }, [cfg, perm]);

  if (!cfg) return null;
  const ask = async () => { if (typeof Notification === 'undefined') return; setPerm(await Notification.requestPermission()); };
  const turn = async (patch) => { const next = { ...cfg, ...patch }; if ((next.on || next.reading) && perm === 'default') await ask(); save(next); };
  const upcoming = plan(cfg)[0];
  return (
    <section className="card pad stack" aria-label="Reminders">
      <h2 style={{ margin: 0 }}>Reminders</h2>
      <p className="muted small" style={{ margin: 0 }}>A browser can only remind you while a DALIL page is open. For reminders that arrive when your phone is locked, use the DALIL app.</p>
      {perm === 'unsupported' && <p className="small" role="status">This browser does not support notifications.</p>}
      {perm === 'denied' && <p className="small" role="status">Notifications are blocked for this site. Allow them in your browser's site settings to use reminders.</p>}
      <label className="pr-row"><input type="checkbox" checked={cfg.on} onChange={(e) => turn({ on: e.target.checked })} /> Remind me at prayer times</label>
      {cfg.on && (
        <div className="pr-row" role="group" aria-label="Which prayers">
          {Object.keys(NAMES).map((k) => (
            <label key={k}><input type="checkbox" checked={cfg.prayers[k] !== false} onChange={(e) => save({ ...cfg, prayers: { ...cfg.prayers, [k]: e.target.checked } })} /> {NAMES[k]}</label>
          ))}
        </div>
      )}
      <label className="pr-row"><input type="checkbox" checked={cfg.reading} onChange={(e) => turn({ reading: e.target.checked })} /> Daily reading reminder at
        <input type="time" value={cfg.readingAt} onChange={(e) => save({ ...cfg, readingAt: e.target.value })} aria-label="Reading reminder time" />
      </label>
      {upcoming && perm === 'granted' && <p className="muted small" style={{ margin: 0 }}>Next reminder: {upcoming.title} at {upcoming.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
    </section>
  );
}
