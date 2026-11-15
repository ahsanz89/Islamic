import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getHadith, getSurahs } from '../../src/lib/api';
import { Card, Screen, SectionTitle, T, TranslationButton, useAsync } from '../../src/components/ui';
import HadithCard from '../../src/components/HadithCard';

const DAILY = [1, 10, 13, 39, 52, 6011, 6018, 6094, 6114, 6412, 6416];

export default function Home() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const day = Math.floor(Date.now() / 86400000);
  const daily = useAsync(() => getHadith('bukhari', DAILY[day % DAILY.length]), [day]);
  const last = settings.lastRead;
  const Tile = ({ icon, title, text, to, dark }) => (
    <Pressable onPress={() => router.push(to)} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => ({ flex: 1, minHeight: 124, padding: 16, borderRadius: 20, backgroundColor: dark ? colors.brandDeep : colors.surface, borderWidth: dark ? 0 : 1, borderColor: colors.line, gap: 6, opacity: pressed ? 0.85 : 1 })}>
      <Ionicons name={icon} size={26} color={dark ? colors.brandInk : colors.brand} />
      <T weight="uiBold" size={18} color={dark ? colors.brandInk : colors.ink}>{title}</T>
      <T size={13} color={dark ? colors.brandInk : colors.muted}>{text}</T>
    </Pressable>
  );
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={require('../../assets/logo-mark.png')} style={{ width: 44, height: 44, borderRadius: 12 }} accessibilityLabel="DALIL" />
          <View style={{ flex: 1 }}>
            <T weight="uiBlack" size={22} color={colors.brandDeep} style={{ letterSpacing: 3 }}>DALIL <T style={{ fontFamily: 'Amiri_700Bold', letterSpacing: 0 }} size={22} color={colors.brand}>دليل</T></T>
            <T size={12.5} color={colors.muted}>{t('tagline')}</T>
          </View>
        </View>
        <TranslationButton />
        {last ? (
          <Card onPress={() => router.push(last.href)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="bookmark" size={22} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <T size={12.5} color={colors.muted}>{t('continueReading')}</T>
              <T weight="uiBold" size={17}>{last.title}</T>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Card>
        ) : null}
        <SectionTitle>{t('exploreTitle')}</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile dark icon="book" title={t('quran')} text={t('quranDesc')} to="/quran" />
          <Tile icon="library" title={t('hadith')} text={t('hadithDesc')} to="/hadith" />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile icon="heart" title={t('duas')} text={t('duasDesc')} to="/duas" />
          <Tile icon="settings" title={t('settings')} text={t('translation')} to="/settings" />
        </View>
        <SectionTitle>{t('hadithOfDay')}</SectionTitle>
        {daily.data?.h ? <HadithCard col={daily.data.col} h={daily.data.h} /> : <T color={colors.muted}>{daily.error ? t('offline') : t('loading')}</T>}
      </ScrollView>
    </Screen>
  );
}
