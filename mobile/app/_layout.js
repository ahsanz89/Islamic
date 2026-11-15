import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';
import { NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_500Medium } from '@expo-google-fonts/noto-nastaliq-urdu';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useApp } from '../src/lib/settings';
import * as audio from '../src/lib/audio';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const { settings, ready, colors, dark } = useApp();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    audio.configure({ reciter: settings.reciter, urdu: settings.urduAudio });
  }, [settings.reciter, settings.urduAudio]);
  useEffect(() => {
    if (!ready) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!settings.onboarded && !onOnboarding) router.replace('/onboarding');
    if (settings.onboarded && onOnboarding) router.replace('/');
  }, [ready, settings.onboarded, segments]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

export default function Root() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Amiri_400Regular, Amiri_700Bold, AmiriQuran_400Regular, NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_500Medium });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <SettingsProvider><Gate /></SettingsProvider>
    </SafeAreaProvider>
  );
}
