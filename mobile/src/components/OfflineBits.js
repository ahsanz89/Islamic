// Small pieces that tell the user, honestly, what works without internet.
import React, { useSyncExternalStore } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/settings';
import { T } from './text';
import { useOnline } from '../lib/net';
import * as store from '../lib/offline-store';

/** Re-render when the offline library changes (a file finished, something was deleted). */
export const useOfflineVersion = () => useSyncExternalStore(store.subscribe, () => store.version.n, () => 0);

/** Shown at the top of a screen while the phone has no internet. */
export function OfflineBanner() {
  const { colors } = useApp();
  const online = useOnline();
  const router = useRouter();
  if (online) return null;
  return (
    <Pressable onPress={() => router.push('/downloads')} accessibilityRole="button" accessibilityLabel="You are offline. Open the Download Manager."
      style={{ marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.tertiaryContainer }}>
      <Ionicons name="cloud-offline-outline" size={22} color={colors.onTertiaryContainer} />
      <View style={{ flex: 1 }}>
        <T variant="labelLarge" color={colors.onTertiaryContainer}>You are offline</T>
        <T variant="bodySmall" color={colors.onTertiaryContainer}>Downloaded Quran, hadith, learning and prayer times still work. Tap to see what is downloaded.</T>
      </View>
    </Pressable>
  );
}

/** A small status mark for a list row: downloaded (green tick) or not (cloud). */
export function OfflineMark({ ready, label }) {
  const { colors } = useApp();
  return <Ionicons name={ready ? 'checkmark-circle' : 'cloud-outline'} size={18} color={ready ? colors.primary : colors.outline} accessibilityLabel={label || (ready ? 'Available offline' : 'Needs internet')} />;
}

/** Offline and the chosen translation was not downloaded: say so instead of showing an empty gap. */
export function MissingLanguageNotice({ rel, need, what = 'translation' }) {
  const { colors } = useApp();
  const online = useOnline();
  const router = useRouter();
  useOfflineVersion();
  const e = store.entry(rel);
  const missing = e && e.k && need ? need.filter((k) => !e.k.includes(k)) : [];
  if (online || !missing.length) return null;
  return (
    <Pressable onPress={() => router.push('/downloads')} accessibilityRole="button"
      style={{ marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 16, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.tertiaryContainer }}>
      <Ionicons name="alert-circle-outline" size={22} color={colors.onTertiaryContainer} />
      <T variant="bodySmall" color={colors.onTertiaryContainer} style={{ flex: 1 }}>Your chosen {what} was not downloaded for offline use. Only the Arabic and the downloaded {what}s are shown. Connect to the internet, or download it in the Download Manager.</T>
    </Pressable>
  );
}
