// Is the phone online? One shared answer for the whole app. Defaults to "online" until the phone says otherwise,
// so a slow check never blocks anything. On the web build it follows the browser's own online/offline events.
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

let online = true;
const subs = new Set();
const set = (v) => { if (v !== online) { online = v; subs.forEach((f) => f()); } };
let started = false;

export function startNetwork() {
  if (started) return;
  started = true;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.addEventListener) {
      set(typeof navigator !== 'undefined' ? navigator.onLine !== false : true);
      window.addEventListener('online', () => set(true)); window.addEventListener('offline', () => set(false));
    }
    return;
  }
  try {
    const N = require('expo-network');
    const apply = (s) => set(!(s && (s.isConnected === false || s.isInternetReachable === false)));
    N.getNetworkStateAsync().then(apply).catch(() => {});
    N.addNetworkStateListener(apply);
  } catch { /* no network module: assume online; failed downloads are still handled */ }
}
export const isOnline = () => online;
export const useOnline = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => online, () => true);
export const _setOnline = set; // tests
