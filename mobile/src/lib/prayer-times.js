// Prayer times and Qibla, calculated on the phone with no network and no account.
// Method: the standard astronomical formulas (sun declination + equation of time), the same family used by
// PrayTimes.org. Pure functions; every angle is in degrees.

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const sin = (d) => Math.sin(rad(d));
const cos = (d) => Math.cos(rad(d));
const tan = (d) => Math.tan(rad(d));
const arcsin = (x) => deg(Math.asin(x));
const arccos = (x) => deg(Math.acos(x));
const arccot = (x) => deg(Math.atan(1 / x));
const arctan2 = (y, x) => deg(Math.atan2(y, x));
const fix = (a, b) => { const r = a - b * Math.floor(a / b); return r < 0 ? r + b : r; };

/** Calculation methods: Fajr and Isha sun angles (Isha may be minutes after Maghrib, as in Umm al-Qura). */
export const METHODS = {
  mwl: { name: 'Muslim World League', fajr: 18, isha: 17 },
  isna: { name: 'North America (ISNA)', fajr: 15, isha: 15 },
  karachi: { name: 'University of Islamic Sciences, Karachi', fajr: 18, isha: 18 },
  egypt: { name: 'Egyptian General Authority', fajr: 19.5, isha: 17.5 },
  makkah: { name: 'Umm al-Qura, Makkah', fajr: 18.5, ishaMinutes: 90 },
};
export const DEFAULT_METHOD = 'mwl';

/** Julian date at 0h UT of the given calendar date. */
function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/** Sun declination and equation of time (hours) for a Julian date. */
function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = arctan2(cos(e) * sin(L), cos(L)) / 15;
  const eqt = q / 15 - fix(RA, 24);
  const decl = arcsin(sin(e) * sin(L));
  return { decl, eqt: eqt > 12 ? eqt - 24 : eqt < -12 ? eqt + 24 : eqt };
}

/**
 * Prayer times for one day.
 * @param {{y:number,m:number,d:number}} date calendar date at the place
 * @param {{lat:number,lng:number}} place
 * @param {number} tz hours from UTC at the place (e.g. 5 for Pakistan, 5.5 for India)
 * @param {{method?:string,asr?:'standard'|'hanafi',highLat?:boolean}} opts
 * @returns times as decimal hours in local time: fajr, sunrise, dhuhr, asr, maghrib, isha (null if the sun never gets that low)
 */
export function prayerTimes(date, place, tz, opts = {}) {
  const method = METHODS[opts.method] || METHODS[DEFAULT_METHOD];
  const shadow = opts.asr === 'hanafi' ? 2 : 1;
  const jd = julian(date.y, date.m, date.d) - place.lng / (15 * 24);
  const at = (hours) => sunPosition(jd + hours / 24);
  const noon = (hours) => 12 - at(hours).eqt;
  const timeFor = (angle, base, ccw) => {
    const { decl } = at(base);
    const x = (-sin(angle) - sin(place.lat) * sin(decl)) / (cos(place.lat) * cos(decl));
    if (x < -1 || x > 1) return NaN;
    return noon(base) + (ccw ? -1 : 1) * (arccos(x) / 15);
  };
  const asrTime = (base) => {
    const { decl } = at(base);
    const angle = -arccot(shadow + tan(Math.abs(place.lat - decl)));
    return timeFor(angle, base, false);
  };
  // two-pass: first guess at noon, then refine with the sun position at each prayer's own time
  const guess = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18 };
  const calc = (g) => ({
    fajr: timeFor(method.fajr, g.fajr, true),
    sunrise: timeFor(0.833, g.sunrise, true),
    dhuhr: noon(g.dhuhr),
    asr: asrTime(g.asr),
    maghrib: timeFor(0.833, g.maghrib, false),
    isha: method.ishaMinutes ? NaN : timeFor(method.isha, g.isha, false),
  });
  let t = calc(guess);
  t = calc(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Number.isFinite(v) ? v : guess[k]])));
  if (method.ishaMinutes && Number.isFinite(t.maghrib)) t.isha = t.maghrib + method.ishaMinutes / 60;
  const shift = tz - place.lng / 15;
  const out = {};
  for (const k of Object.keys(t)) out[k] = Number.isFinite(t[k]) ? fix(t[k] + shift, 24) : null;
  // very high latitudes: if Fajr or Isha do not exist, fall back to the middle of the night rules
  if (opts.highLat !== false && (out.fajr == null || out.isha == null) && out.sunrise != null && out.maghrib != null) {
    const night = fix(out.sunrise - out.maghrib, 24);
    // "angle-based" rule: the share of the night equals the sun angle divided by 60
    if (out.fajr == null) out.fajr = fix(out.sunrise - (night * Math.min(method.fajr, 60)) / 60, 24);
    if (out.isha == null) out.isha = fix(out.maghrib + (night * Math.min(method.isha || 17, 60)) / 60, 24);
  }
  return out;
}

/** Format decimal hours as HH:MM (24h) or h:MM AM/PM. */
export function formatTime(h, use24 = false) {
  if (h == null || !Number.isFinite(h)) return '--:--';
  let total = Math.round(fix(h, 24) * 60);
  if (total >= 1440) total -= 1440;
  const hh = Math.floor(total / 60), mm = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (use24) return `${pad(hh)}:${pad(mm)}`;
  const ap = hh >= 12 ? 'PM' : 'AM';
  return `${hh % 12 === 0 ? 12 : hh % 12}:${pad(mm)} ${ap}`;
}

export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Next prayer after `nowHours` (decimal hours); wraps to tomorrow's Fajr. Sunrise is shown but is not a prayer to be called. */
export function nextPrayer(times, nowHours) {
  for (const k of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
    if (times[k] != null && times[k] > nowHours) return { key: k, at: times[k], tomorrow: false };
  }
  return { key: 'fajr', at: times.fajr, tomorrow: true };
}

/** Compass bearing from the place to the Kaaba, degrees clockwise from true north. */
export function qiblaBearing(lat, lng) {
  const kLat = 21.422487, kLng = 39.826206;
  const dl = rad(kLng - lng);
  const y = Math.sin(dl);
  const x = Math.cos(rad(lat)) * Math.tan(rad(kLat)) - Math.sin(rad(lat)) * Math.cos(dl);
  return fix(deg(Math.atan2(y, x)), 360);
}

/** Great-circle distance to the Kaaba in kilometres. */
export function kaabaDistanceKm(lat, lng) {
  const kLat = 21.422487, kLng = 39.826206, R = 6371;
  const dLat = rad(kLat - lat), dLng = rad(kLng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(kLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
