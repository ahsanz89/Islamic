'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalculationMethod, Coordinates, Madhab, PrayerTimes as Adhan } from 'adhan';
import { useApp } from '@/components/Providers';

// [name, country, lat, lon, IANA time zone, calculation method, Asr school]
const CITIES = [
  ['Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Islamabad', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Rawalpindi', 'Pakistan', 33.5651, 73.0169, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Faisalabad', 'Pakistan', 31.4504, 73.135, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Multan', 'Pakistan', 30.1575, 71.5249, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Peshawar', 'Pakistan', 34.0151, 71.5249, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Quetta', 'Pakistan', 30.1798, 66.975, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Hyderabad', 'Pakistan', 25.396, 68.3578, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Sialkot', 'Pakistan', 32.4945, 74.5229, 'Asia/Karachi', 'Karachi', 'hanafi'],
  ['Delhi', 'India', 28.6139, 77.209, 'Asia/Kolkata', 'Karachi', 'hanafi'],
  ['Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata', 'Karachi', 'hanafi'],
  ['Hyderabad', 'India', 17.385, 78.4867, 'Asia/Kolkata', 'Karachi', 'hanafi'],
  ['Lucknow', 'India', 26.8467, 80.9462, 'Asia/Kolkata', 'Karachi', 'hanafi'],
  ['Kolkata', 'India', 22.5726, 88.3639, 'Asia/Kolkata', 'Karachi', 'hanafi'],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka', 'Karachi', 'hanafi'],
  ['Kabul', 'Afghanistan', 34.5553, 69.2075, 'Asia/Kabul', 'Karachi', 'hanafi'],
  ['Makkah', 'Saudi Arabia', 21.3891, 39.8579, 'Asia/Riyadh', 'UmmAlQura', 'shafi'],
  ['Madinah', 'Saudi Arabia', 24.5247, 39.5692, 'Asia/Riyadh', 'UmmAlQura', 'shafi'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh', 'UmmAlQura', 'shafi'],
  ['Jeddah', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh', 'UmmAlQura', 'shafi'],
  ['Dubai', 'UAE', 25.2048, 55.2708, 'Asia/Dubai', 'Dubai', 'shafi'],
  ['Doha', 'Qatar', 25.2854, 51.531, 'Asia/Qatar', 'Qatar', 'shafi'],
  ['Kuwait City', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait', 'Kuwait', 'shafi'],
  ['Amman', 'Jordan', 31.9454, 35.9284, 'Asia/Amman', 'MuslimWorldLeague', 'shafi'],
  ['Istanbul', 'Türkiye', 41.0082, 28.9784, 'Europe/Istanbul', 'Turkey', 'shafi'],
  ['Ankara', 'Türkiye', 39.9334, 32.8597, 'Europe/Istanbul', 'Turkey', 'shafi'],
  ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo', 'Egyptian', 'shafi'],
  ['Tehran', 'Iran', 35.6892, 51.389, 'Asia/Tehran', 'Tehran', 'shafi'],
  ['Casablanca', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca', 'MuslimWorldLeague', 'shafi'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos', 'MuslimWorldLeague', 'shafi'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg', 'MuslimWorldLeague', 'shafi'],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta', 'Singapore', 'shafi'],
  ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869, 'Asia/Kuala_Lumpur', 'Singapore', 'shafi'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', 'Singapore', 'shafi'],
  ['London', 'United Kingdom', 51.5072, -0.1276, 'Europe/London', 'MuslimWorldLeague', 'hanafi'],
  ['Birmingham', 'United Kingdom', 52.4862, -1.8904, 'Europe/London', 'MuslimWorldLeague', 'hanafi'],
  ['Manchester', 'United Kingdom', 53.4808, -2.2426, 'Europe/London', 'MuslimWorldLeague', 'hanafi'],
  ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris', 'MuslimWorldLeague', 'shafi'],
  ['Berlin', 'Germany', 52.52, 13.405, 'Europe/Berlin', 'MuslimWorldLeague', 'shafi'],
  ['Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow', 'MuslimWorldLeague', 'hanafi'],
  ['New York', 'USA', 40.7128, -74.006, 'America/New_York', 'NorthAmerica', 'shafi'],
  ['Chicago', 'USA', 41.8781, -87.6298, 'America/Chicago', 'NorthAmerica', 'shafi'],
  ['Houston', 'USA', 29.7604, -95.3698, 'America/Chicago', 'NorthAmerica', 'shafi'],
  ['Los Angeles', 'USA', 34.0522, -118.2437, 'America/Los_Angeles', 'NorthAmerica', 'shafi'],
  ['Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto', 'NorthAmerica', 'shafi'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney', 'MuslimWorldLeague', 'shafi']
].map(([name, country, lat, lon, tz, method, asr], i) => ({ i, name, country, lat, lon, tz, method, asr, key: `${name}, ${country}` }));

const NAMES = {
  fajr: { en: 'Fajr', ur: 'فجر', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ur: 'طلوعِ آفتاب', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ur: 'ظہر', ar: 'الظهر' },
  asr: { en: 'Asr', ur: 'عصر', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ur: 'مغرب', ar: 'المغرب' },
  isha: { en: 'Isha', ur: 'عشاء', ar: 'العشاء' }
};
const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TXT = {
  en: { title: 'Prayer times', next: 'Next prayer', in: 'in', locate: 'Use my location', city: 'City', asr: 'Asr', std: 'Standard', han: 'Hanafi', method: 'Method', near: 'Near', yours: 'Your location', loading: 'Calculating…', denied: 'Location unavailable, pick a city.', now: 'now' },
  ur: { title: 'اوقاتِ نماز', next: 'اگلی نماز', in: 'میں', locate: 'میری لوکیشن', city: 'شہر', asr: 'عصر', std: 'عام', han: 'حنفی', method: 'طریقہ', near: 'قریب', yours: 'آپ کی لوکیشن', loading: 'حساب ہو رہا ہے…', denied: 'لوکیشن دستیاب نہیں، شہر منتخب کریں۔', now: 'ابھی' },
  ar: { title: 'مواقيت الصلاة', next: 'الصلاة القادمة', in: 'بعد', locate: 'موقعي', city: 'المدينة', asr: 'العصر', std: 'الجمهور', han: 'حنفي', method: 'الطريقة', near: 'قرب', yours: 'موقعك', loading: 'جارٍ الحساب…', denied: 'تعذّر تحديد الموقع، اختر مدينة.', now: 'الآن' }
};

const dist = (a, b) => {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
const nearest = (p) => CITIES.map((c) => ({ c, d: dist(p, c) })).sort((a, b) => a.d - b.d)[0];

function compute(place, asr, date) {
  const params = CalculationMethod[place.method]();
  params.madhab = asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return new Adhan(new Coordinates(place.lat, place.lon), date, params);
}

const pad = (n) => String(n).padStart(2, '0');
function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default function PrayerTimes() {
  const { settings } = useApp();
  const L = settings.ui === 'ur' || settings.ui === 'ar' ? settings.ui : 'en';
  const T = TXT[L];
  const [place, setPlace] = useState(null); // {name, country, lat, lon, tz, method, asr, exact}
  const [asr, setAsr] = useState('hanafi');
  const [now, setNow] = useState(null);
  const [msg, setMsg] = useState('');

  // initial region: saved choice, else best guess from the browser time zone
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('hl-place') || 'null'); } catch {}
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (saved && saved.lat != null) {
      setPlace(saved); setAsr(saved.asrChoice || saved.asr || 'hanafi');
    } else {
      const guess = CITIES.find((c) => c.tz === browserTz) || CITIES.find((c) => c.name === 'Makkah');
      setPlace({ ...guess, exact: false }); setAsr(guess.asr);
    }
    setNow(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const save = (p, a) => { try { localStorage.setItem('hl-place', JSON.stringify({ ...p, asrChoice: a })); } catch {} };

  const pickCity = (i) => {
    const c = CITIES[+i];
    const p = { ...c, exact: false };
    setPlace(p); setAsr(c.asr); setMsg(''); save(p, c.asr);
  };
  const locate = () => {
    if (!navigator.geolocation) { setMsg(T.denied); return; }
    setMsg(T.loading);
    navigator.geolocation.getCurrentPosition((pos) => {
      const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      const { c, d } = nearest(here);
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const p = { ...c, lat: here.lat, lon: here.lon, tz, name: d < 60 ? c.name : T.near + ' ' + c.name, exact: true };
      setPlace(p); setAsr(c.asr); setMsg(''); save(p, c.asr);
    }, () => setMsg(T.denied), { timeout: 8000, maximumAge: 3600000 });
  };
  const changeAsr = (a) => { setAsr(a); if (place) save(place, a); };

  const view = useMemo(() => {
    if (!place || !now) return null;
    const today = compute(place, asr, now);
    const tomorrowDate = new Date(now.getTime() + 86400000);
    const tomorrow = compute(place, asr, tomorrowDate);
    const list = ORDER.map((k) => ({ k, t: today[k] }));
    const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: place.tz });
    // next obligatory prayer (sunrise is shown but not counted as a prayer)
    const sequence = [...list.filter((x) => x.k !== 'sunrise'), { k: 'fajr', t: tomorrow.fajr }];
    const next = sequence.find((x) => x.t > now);
    const idx = sequence.indexOf(next);
    const start = idx > 0 ? sequence[idx - 1].t.getTime() : compute(place, asr, new Date(now.getTime() - 86400000)).isha.getTime();
    const progress = Math.min(1, Math.max(0, (now - start) / (next.t - start)));
    let current = null;
    for (const x of list) if (x.t <= now) current = x.k;
    let hijri = '';
    try {
      hijri = new Intl.DateTimeFormat(L === 'ur' ? 'ur-u-ca-islamic-umalqura-nu-latn' : L === 'ar' ? 'ar-u-ca-islamic-umalqura-nu-latn' : 'en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: place.tz }).format(now);
    } catch {}
    let greg = '';
    try { greg = new Intl.DateTimeFormat(L === 'ur' ? 'ur-PK-u-nu-latn' : L === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: place.tz }).format(now); } catch {}
    return { list, next, progress, current, fmt, hijri, greg, left: next.t - now };
  }, [place, asr, now, L]);

  return (
    <aside className={`prayer ${view ? 'ready' : ''}`} aria-label={T.title} lang={L === 'en' ? undefined : L} dir={L === 'en' ? 'ltr' : 'rtl'}>
      <div className="pt-top">
        <h2 className="pt-title">{T.title}</h2>
        {view && <span className="pt-date">{view.greg}<br /><small>{view.hijri}</small></span>}
      </div>

      {view ? (
        <>
          <div className="pt-next">
            <span className="pt-label">{T.next}</span>
            <strong className="pt-name">{NAMES[view.next.k][L]}</strong>
            <span className="pt-at" dir="ltr">{view.fmt(view.next.t)}</span>
            <span className="pt-count" aria-live="off">{T.in} <b dir="ltr">{countdown(view.left)}</b></span>
            <span className="pt-bar" aria-hidden="true"><i style={{ width: `${view.progress * 100}%` }} /></span>
          </div>
          <ul className="pt-list">
            {view.list.map((x) => (
              <li key={x.k} className={`${x.k === view.next.k ? 'is-next' : ''} ${x.k === view.current ? 'is-now' : ''} ${x.k === 'sunrise' ? 'is-sun' : ''}`}>
                <span className="pt-n">{NAMES[x.k][L]}</span>
                <span className="pt-t" dir="ltr">{view.fmt(x.t)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : <div className="pt-skel" aria-hidden="true" />}

      <div className="pt-where">
        <label className="pt-sel">
          <span className="sr-only">{T.city}</span>
          <select value={place && !place.exact ? place.i : ''} onChange={(e) => pickCity(e.target.value)} aria-label={T.city}>
            {place && place.exact && <option value="">{place.name}</option>}
            {CITIES.map((c) => <option key={c.key} value={c.i}>{c.name} · {c.country}</option>)}
          </select>
        </label>
        <button type="button" className="pt-loc" onClick={locate}>{T.locate}</button>
      </div>
      <div className="pt-opts">
        <span>{T.asr}</span>
        <div className="segmented" role="group" aria-label={T.asr}>
          <button type="button" aria-pressed={asr === 'shafi'} onClick={() => changeAsr('shafi')}>{T.std}</button>
          <button type="button" aria-pressed={asr === 'hanafi'} onClick={() => changeAsr('hanafi')}>{T.han}</button>
        </div>
      </div>
      <p className="pt-foot">{place ? `${T.method}: ${place.method.replace(/([A-Z])/g, ' $1').trim()}` : ''}{msg ? ` · ${msg}` : ''}</p>
    </aside>
  );
}
