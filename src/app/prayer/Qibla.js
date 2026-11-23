'use client';
import { useEffect, useState } from 'react';
import { Coordinates, Qibla as adhanQibla } from 'adhan';
import { CITIES } from '@/components/PrayerTimes';

const KAABA = { lat: 21.4225, lon: 39.8262 };
export function distanceKm(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
}
export const qiblaBearing = (lat, lon) => adhanQibla(new Coordinates(lat, lon));

export default function Qibla() {
  const [place, setPlace] = useState(null);
  const [heading, setHeading] = useState(null);
  const [needsTap, setNeedsTap] = useState(false);
  const [note, setNote] = useState('');

  // the place chosen in the prayer-times widget above (same saved place)
  useEffect(() => {
    const read = () => {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('hl-place') || 'null'); } catch { /* none */ }
      if (saved && saved.lat != null) return saved;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return CITIES.find((c) => c.tz === tz) || CITIES.find((c) => c.name === 'Makkah');
    };
    setPlace(read());
    const id = setInterval(() => setPlace((p) => { const n = read(); return p && n.lat === p.lat && n.lon === p.lon ? p : n; }), 1500);
    return () => clearInterval(id);
  }, []);

  const listen = () => {
    const on = (e) => {
      let h = null;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading; // iPhone: already degrees from north
      else if ((e.absolute || e.type === 'deviceorientationabsolute') && typeof e.alpha === 'number') h = (360 - e.alpha + 360) % 360;
      if (h != null) setHeading((prev) => (prev == null ? h : (prev + (((h - prev + 540) % 360) - 180) * 0.25 + 360) % 360));
    };
    window.addEventListener('deviceorientationabsolute', on, true);
    window.addEventListener('deviceorientation', on, true);
    return () => { window.removeEventListener('deviceorientationabsolute', on, true); window.removeEventListener('deviceorientation', on, true); };
  };
  useEffect(() => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') { setNote('This device has no compass sensor, so the arrow shows the direction from north. Point it using a map or a real compass.'); return undefined; }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') { setNeedsTap(true); return undefined; }
    return listen();
  }, []);
  const enable = async () => {
    try { const r = await DeviceOrientationEvent.requestPermission(); if (r === 'granted') { setNeedsTap(false); listen(); } else setNote('Compass access was not allowed.'); } catch { setNote('Compass access is not available.'); }
  };

  if (!place) return null;
  const bearing = qiblaBearing(place.lat, place.lon);
  const turn = heading == null ? bearing : (bearing - heading + 360) % 360;
  return (
    <section className="card pad stack" aria-label="Qibla">
      <h2 style={{ margin: 0 }}>Qibla</h2>
      <p className="muted small" style={{ margin: 0 }}>From {place.name}: <b>{Math.round(bearing)}° from north</b> · about {distanceKm(place, KAABA).toLocaleString()} km to the Kaaba</p>
      <div className="qb-compass" role="img" aria-label={`Qibla is ${Math.round(bearing)} degrees from north`}>
        <span className="qb-n">N</span>
        <span className="qb-arrow" style={{ transform: `rotate(${turn}deg)` }} />
        <span className="qb-kaaba">Kaaba</span>
      </div>
      {needsTap && <button className="btn small" onClick={enable}>Turn on the live compass</button>}
      <p className="muted small" style={{ margin: 0 }}>{heading == null ? (note || 'On a phone, allow the compass and hold the phone flat: turn until the arrow points straight up.') : 'Hold the phone flat and away from metal or magnets. Turn until the arrow points straight up.'}</p>
    </section>
  );
}
