import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../src/lib/settings';
import { uiFor } from '../src/lib/strings';
import { Button, T, TranslationList } from '../src/components/ui';

/** First screen: choose the translation language. Always reachable again from Settings. */
export default function Onboarding() {
  const { settings, update, colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pick, setPick] = useState(settings.tr || 'en');
  const done = () => {
    update({ tr: pick, ui: settings.onboarded ? settings.ui : uiFor(pick), onboarded: true });
    router.replace('/');
  };
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Image source={require('../assets/logo-mark.png')} style={{ width: 72, height: 72, borderRadius: 18 }} accessibilityLabel="DALIL" />
          <T weight="uiBlack" size={26} color={colors.brandDeep} style={{ letterSpacing: 4 }}>DALIL</T>
          <T size={13.5} color={colors.muted}>{t('tagline')}</T>
        </View>
        <View style={{ gap: 6, marginTop: 8 }}>
          <T weight="uiBold" size={26} color={colors.brandDeep} style={{ textAlign: 'center' }}>{t('welcomeTitle')}</T>
          <T size={16} color={colors.muted} style={{ textAlign: 'center' }}>{t('welcomeSub')}</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.brandSoft, padding: 14, borderRadius: 16 }}>
          <T style={{ fontFamily: 'Amiri_700Bold' }} size={22} color={colors.brandDeep}>العربية ✓</T>
          <T size={14} color={colors.brandDeep} style={{ flex: 1 }}>{t('arabicAlways')}</T>
        </View>
        <TranslationList value={pick} onChange={setPick} />
        <T size={13.5} color={colors.muted} style={{ textAlign: 'center' }}>{t('welcomeNote')}</T>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Button label={pick ? t('start') : t('skip')} onPress={done} />
      </View>
    </SafeAreaView>
  );
}
