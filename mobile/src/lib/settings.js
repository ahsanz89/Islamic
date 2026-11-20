import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { load, save } from './storage';
import { STRINGS, isRTLUi } from './strings';
import { DARK, LIGHT } from './theme';
import { streakPatch } from './streak';

export const DEFAULTS = {
  onboarded: false,
  tr: 'en',          // translation shown with the Arabic ('' = Arabic only)
  tr2: '',           // optional second translation
  ui: 'en',          // app language: en | ur | ar
  arSize: 30,
  harakat: true,
  theme: 'system',   // system | light | dark
  reciter: 'alafasy',
  urduAudio: false,
  lastRead: null,    // old single history (read-only, kept so earlier saved progress is not lost)
  readQuran: null,   // { surah, ayah, page?, name, at }
  readHadith: null,  // { col, sec, n, title, at }
  lastActivity: null, // 'quran' | 'hadith'
  quranMode: 'standard', // 'standard' | 'mushaf' (15-line)
  recitationDone: {},
  mushafZoom: 1,     // 1 = fit the page; larger = zoom, pan sideways
  streak: null,      // { days: {YYYY-MM-DD: count}, goal } reading streak, kept on this phone only
  place: null,       // { name, lat, lng, tz } chosen for prayer times; null until the user sets it
  prayer: { method: 'mwl', asr: 'standard', use24: false },
  adhan: { on: false, prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } },
  dailyReminder: { on: false, hour: 8, minute: 0 }
};
const KEY = 'dalil.settings.v1';
const Ctx = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => { load(KEY, {}).then((s) => { setSettings({ ...DEFAULTS, ...s }); setReady(true); }); }, []);
  const update = useCallback((patch) => {
    setSettings((prev) => { const next = { ...prev, ...patch, ...streakPatch(prev, patch) }; save(KEY, next); return next; });
  }, []);

  const value = useMemo(() => {
    const dark = settings.theme === 'system' ? scheme === 'dark' : settings.theme === 'dark';
    const dict = STRINGS[settings.ui] || STRINGS.en;
    const t = (k, vars) => {
      let s = dict[k] ?? STRINGS.en[k] ?? k;
      if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b);
      return s;
    };
    return { settings, update, ready, colors: dark ? DARK : LIGHT, dark, t, uiRtl: isRTLUi(settings.ui) };
  }, [settings, update, ready, scheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx);
