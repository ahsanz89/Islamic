import React from 'react';
import { Image, Linking, View } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import { MiniPlayer } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { NavigationBar, NavigationDrawer } from '../../src/components/m3';
import { PRIVACY_URL } from '../../src/lib/config';

// Five destinations (the Material 3 maximum). Settings lives in the drawer and the top bar, not in the bar.
const DEST = [['index', 'home', 'home'], ['quran', 'book', 'quran'], ['hadith', 'library', 'hadith'], ['learn', 'school', 'learn'], ['duas', 'heart', 'duas']];

function Bar({ state }) {
  const { t } = useApp();
  const router = useRouter();
  const current = state.routes[state.index]?.name;
  const items = DEST.map(([key, icon, str]) => ({ key, icon, label: t(str) }));
  return <NavigationBar items={items} activeKey={current} onSelect={(k) => { if (k !== current) router.navigate(k === 'index' ? '/' : `/${k}`); }} />;
}

function AppDrawer() {
  const { colors, t } = useApp();
  const router = useRouter();
  const seg = useSegments();
  const here = seg[0] === '(tabs)' ? (seg[1] || 'index') : seg[0] || '';
  const go = (path) => () => router.push(path);
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 28, paddingVertical: 16 }}>
      <Image source={require('../../assets/logo-mark.png')} style={{ width: 40, height: 40, borderRadius: 12 }} accessibilityLabel="DALIL" />
      <View>
        <T weight="uiBlack" size={20} color={colors.onPrimaryContainer} style={{ letterSpacing: 3 }}>DALIL</T>
        <T variant="bodySmall" color={colors.muted}>{t('tagline')}</T>
      </View>
    </View>
  );
  const sections = [
    { items: [
      { key: 'home', icon: 'home-outline', label: t('home'), onPress: () => router.navigate('/'), active: here === 'index' },
      { key: 'quran', icon: 'book-outline', label: t('quran'), onPress: () => router.navigate('/quran'), active: here === 'quran' },
      { key: 'hadith', icon: 'library-outline', label: t('hadith'), onPress: () => router.navigate('/hadith'), active: here === 'hadith' },
      { key: 'duas', icon: 'heart-outline', label: t('duas'), onPress: () => router.navigate('/duas'), active: here === 'duas' }
    ] },
    { title: 'Learn', items: [
      { key: 'learn', icon: 'school-outline', label: 'Learn Quran', onPress: () => router.navigate('/learn'), active: here === 'learn' },
      { key: 'arabic', icon: 'language-outline', label: 'Learn Arabic', onPress: go('/learn-arabic'), active: here === 'learn-arabic' },
      { key: 'special', icon: 'sparkles-outline', label: 'Special Duas', onPress: go('/special-duas'), active: here === 'special-duas' }
    ] },
    { title: ' ', items: [
      { key: 'settings', icon: 'settings-outline', label: t('settings'), onPress: () => router.push('/settings'), active: here === 'settings' },
      { key: 'privacy', icon: 'shield-checkmark-outline', label: t('privacy'), onPress: () => Linking.openURL(PRIVACY_URL) }
    ] }
  ];
  return <NavigationDrawer sections={sections} header={header} />;
}

export default function TabsLayout() {
  const { colors, t } = useApp();
  return (
    <>
      <Tabs
        tabBar={(props) => (
          <View style={{ backgroundColor: colors.surfaceMid }}>
            <MiniPlayer />
            <Bar {...props} />
          </View>
        )}
        screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: t('home') }} />
        <Tabs.Screen name="quran" options={{ title: t('quran') }} />
        <Tabs.Screen name="hadith" options={{ title: t('hadith') }} />
        <Tabs.Screen name="learn" options={{ title: t('learn') }} />
        <Tabs.Screen name="duas" options={{ title: t('duas') }} />
      </Tabs>
      <AppDrawer />
    </>
  );
}
