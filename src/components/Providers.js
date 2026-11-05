'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isRTL, translate } from '@/lib/i18n';

const DEFAULTS = {
  ui: 'en',
  theme: 'system',
  harakat: true,
  arSize: 30,
  tr: ['ur', 'en'], // translations shown under each hadith / verse
  // Quran audio
  reciter: 'alafasy',
  volume: 0.9,
  repeat: false,
  continuous: true,
  bismillah: true,
  wordAudio: true,
  wordHover: false
};

const Ctx = createContext(null);

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function Providers({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastReadState] = useState(null);
  const [recent, setRecent] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = { ...DEFAULTS, ...load('hl.settings', {}) };
    let fresh = true;
    try { fresh = !localStorage.getItem('hl.settings'); } catch {}
    if (fresh) {
      const nav = (navigator.language || 'en').slice(0, 2);
      if (['ur', 'ar', 'bn', 'hi', 'id', 'tr', 'fr', 'ru', 'ta'].includes(nav)) {
        s.ui = nav;
        if (!['ar'].includes(nav)) s.tr = [nav, 'en'];
      }
    }
    setSettings(s);
    setBookmarks(load('hl.bookmarks', []));
    setLastReadState(load('hl.lastRead', null));
    setRecent(load('hl.recent', []));
    setReady(true);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = settings.ui;
    el.dir = isRTL(settings.ui) ? 'rtl' : 'ltr';
    if (settings.theme === 'system') {
      // Follow the device; CSS handles it with prefers-color-scheme.
      if (el.dataset.hlTheme) { delete el.dataset.theme; delete el.dataset.hlTheme; }
    } else {
      el.dataset.theme = settings.theme;
      el.dataset.hlTheme = '1';
    }
    el.style.setProperty('--ar-size', settings.arSize + 'px');
    if (ready) store('hl.settings', settings);
  }, [settings, ready]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const toggleBookmark = useCallback((item) => {
    setBookmarks((list) => {
      const exists = list.some((b) => b.key === item.key);
      const next = exists ? list.filter((b) => b.key !== item.key) : [{ ...item, at: Date.now() }, ...list];
      store('hl.bookmarks', next);
      return next;
    });
  }, []);

  const setLastRead = useCallback((item) => {
    setLastReadState(item);
    store('hl.lastRead', item);
  }, []);

  const addRecent = useCallback((q) => {
    const v = (q || '').trim();
    if (!v) return;
    setRecent((list) => {
      const next = [v, ...list.filter((x) => x !== v)].slice(0, 8);
      store('hl.recent', next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      update,
      ready,
      t: (key, vars) => translate(settings.ui, key, vars),
      bookmarks,
      toggleBookmark,
      isSaved: (key) => bookmarks.some((b) => b.key === key),
      lastRead,
      setLastRead,
      recent,
      addRecent
    }),
    [settings, update, ready, bookmarks, toggleBookmark, lastRead, setLastRead, recent, addRecent]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
