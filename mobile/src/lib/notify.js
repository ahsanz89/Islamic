// Local notifications for prayer reminders and the daily reading reminder.
// Everything is scheduled on the phone itself. No server, no account, nothing is sent anywhere.
import { Platform } from 'react-native';
import { prayerTimes } from './prayer-times';

const NAMES = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const DAYS_AHEAD = 7;

const lazy = () => { try { return require('expo-notifications'); } catch { return null; } };

/** Ask for permission to show notifications. Returns true if allowed. */
export async function ensurePermission() {
  if (Platform.OS === 'web') return false;
  const N = lazy(); if (!N) return false;
  try {
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('prayer', { name: 'Prayer times', importance: N.AndroidImportance.HIGH });
      await N.setNotificationChannelAsync('reading', { name: 'Daily reading reminder', importance: N.AndroidImportance.DEFAULT });
    }
    const cur = await N.getPermissionsAsync();
    if (cur.granted) return true;
    const asked = await N.requestPermissionsAsync();
    return !!asked.granted;
  } catch { return false; }
}

/** Notification plan for the next days: [{ id, title, body, at: Date, channel }]. Pure, so it can be tested. */
export function planPrayerNotifications({ place, prayer, adhan }, from = new Date(), days = DAYS_AHEAD) {
  if (!place || !adhan || !adhan.on) return [];
  const out = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
    const tz = -day.getTimezoneOffset() / 60;
    const t = prayerTimes({ y: day.getFullYear(), m: day.getMonth() + 1, d: day.getDate() }, place, tz, prayer);
    for (const k of Object.keys(NAMES)) {
      if (!adhan.prayers || adhan.prayers[k] === false || t[k] == null) continue;
      const mins = Math.round(t[k] * 60);
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(mins / 60) % 24, mins % 60, 0);
      if (at.getTime() > from.getTime() + 15000) out.push({ id: `prayer-${k}-${at.getTime()}`, title: `It is time for ${NAMES[k]}`, body: place.name ? `${NAMES[k]} in ${place.name}` : NAMES[k], at, channel: 'prayer' });
    }
  }
  return out;
}

/** Replace all scheduled DALIL notifications with the current plan (prayers + daily reading reminder). */
export async function rescheduleAll(settings) {
  if (Platform.OS === 'web') return { prayers: 0, daily: false };
  const N = lazy(); if (!N) return { prayers: 0, daily: false };
  try {
    await N.cancelAllScheduledNotificationsAsync();
    const wantsAny = settings.adhan?.on || settings.dailyReminder?.on;
    if (!wantsAny) return { prayers: 0, daily: false };
    if (!(await ensurePermission())) return { prayers: 0, daily: false, denied: true };
    const plan = planPrayerNotifications(settings);
    for (const p of plan) {
      await N.scheduleNotificationAsync({ identifier: p.id, content: { title: p.title, body: p.body, sound: 'default' }, trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: p.at, channelId: p.channel } });
    }
    let daily = false;
    const dr = settings.dailyReminder;
    if (dr?.on) {
      await N.scheduleNotificationAsync({
        identifier: 'daily-reading',
        content: { title: 'Your daily reading', body: 'A few ayat today keeps your streak going.' },
        trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: dr.hour, minute: dr.minute, channelId: 'reading' },
      });
      daily = true;
    }
    return { prayers: plan.length, daily };
  } catch { return { prayers: 0, daily: false, error: true }; }
}
