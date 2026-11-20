import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getHadith } from '../../src/lib/api';
import { Screen, TranslationButton, useAsync } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { IconButton, TopAppBar, openDrawer, ripple } from '../../src/components/m3';
import { FONTS, SHAPE } from '../../src/lib/theme';
import HadithCard from '../../src/components/HadithCard';
import { continueTarget, histories, quranRoute } from '../../src/lib/reading-progress';
import DATA from '../../src/lib/arabic-data.json';
import { playWordRef } from '../../src/lib/arabic-audio';
import { lastWeek, streakStats } from '../../src/lib/streak';

const DAILY = [1, 10, 13, 39, 52, 6011, 6018, 6094, 6114, 6412, 6416];
const WORDS = DATA.vocab.flatMap((g) => g.words);
/** Five words that change every day (same as the website). */
export const wordsOfDay = (day, n = 5) => Array.from({ length: n }, (_, i) => WORDS[(day * n + i) % WORDS.length]);

function StreakCard() {
  const { colors, settings } = useApp();
  const st = streakStats(settings.streak);
  const week = lastWeek(settings.streak);
  const label = st.current > 0 ? `${st.current}-day reading streak` : 'Start your reading streak';
  return (
    <View accessible accessibilityLabel={`${label}. Today ${st.todayCount} of ${st.goal}.`} style={{ borderRadius: SHAPE.l, padding: 16, gap: 12, backgroundColor: colors.surfaceHigh }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name="flame" size={28} color={st.current > 0 ? '#E8892B' : colors.muted} />
        <View style={{ flex: 1 }}>
          <T variant="titleMedium">{label}</T>
          <T variant="bodySmall" color={colors.muted}>{st.goalMet ? 'Daily goal reached. Well done.' : `Today: ${st.todayCount} of ${st.goal} ayat or hadith`}{st.best > 1 ? ` · Best ${st.best}` : ''}</T>
        </View>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.outlineVariant, overflow: 'hidden' }}><View style={{ width: `${Math.round(st.progress * 100)}%`, height: 6, backgroundColor: colors.primary }} /></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {week.map((d) => (
          <View key={d.key} style={{ alignItems: 'center', gap: 4 }}>
            <Ionicons name={d.met ? 'checkmark-circle' : d.count > 0 ? 'ellipse' : 'ellipse-outline'} size={20} color={d.met ? colors.primary : d.count > 0 ? colors.secondary || colors.primary : colors.outline} />
            <T variant="labelSmall" color={d.today ? colors.ink : colors.muted}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.key + 'T12:00:00').getDay()]}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

function Shortcut({ icon, title, to, tone }) {
  const { colors } = useApp();
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(to)} accessibilityRole="button" accessibilityLabel={title} {...ripple(colors)}
      style={({ pressed }) => ({ width: 112, minHeight: 96, padding: 14, borderRadius: SHAPE.l, backgroundColor: tone === 'gold' ? colors.tertiaryContainer : colors.secondaryContainer, justifyContent: 'space-between', opacity: pressed ? 0.88 : 1 })}>
      <Ionicons name={icon} size={26} color={tone === 'gold' ? colors.onTertiaryContainer : colors.onSecondaryContainer} />
      <T variant="labelLarge" color={tone === 'gold' ? colors.onTertiaryContainer : colors.onSecondaryContainer} numberOfLines={2}>{title}</T>
    </Pressable>
  );
}

export default function Home() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const day = Math.floor(Date.now() / 86400000);
  const daily = useAsync(() => getHadith('bukhari', DAILY[day % DAILY.length]), [day]);
  const go = continueTarget(settings);                       // follows the most recent activity (Quran or Hadith)
  const { quran: savedQ, hadith: savedH } = histories(settings);
  const other = go && savedQ && savedH ? (go.type === 'quran' ? { type: 'hadith', href: continueTarget({ ...settings, lastActivity: 'hadith' }).href, title: savedH.title } : { type: 'quran', ...quranRoute(savedQ, settings.quranMode) }) : null;
  const ur = settings.ui === 'ur';
  const words = wordsOfDay(day);
  const mean = (w) => (ur && w.ur) || w.en;
  return (
    <Screen>
      <TopAppBar
        onMenu={openDrawer}
        title="DALIL"
        subtitle={t('tagline')}
        actions={<IconButton icon="settings-outline" label={t('settings')} onPress={() => router.push('/settings')} />}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        {/* Hero: the one thing to do next */}
        <Pressable onPress={() => router.push(go ? go.href : '/quran')} accessibilityRole="button" accessibilityLabel={go ? `${t('continueReading')}: ${go.title}. ${go.detail || ''}` : t('quran')} {...ripple(colors)}
          style={({ pressed }) => ({ borderRadius: SHAPE.xl, padding: 24, minHeight: 168, backgroundColor: colors.heroFrom, justifyContent: 'space-between', opacity: pressed ? 0.94 : 1, overflow: 'hidden' })}>
          <Image source={require('../../assets/logo-mark.png')} style={{ position: 'absolute', right: -24, top: -24, width: 150, height: 150, opacity: 0.08 }} />
          <View style={{ gap: 4 }}>
            <T variant="labelLarge" color="#D5B779">{go ? `${t('continueReading')} · ${go.type === 'hadith' ? t('hadith') : t('quran')}` : t('exploreTitle')}</T>
            <T variant="headlineSmall" color="#FFFFFF" numberOfLines={2}>{go ? go.title : t('quran')}</T>
            <T variant="bodyMedium" color="#CFE3DA">{go ? go.detail : t('quranDesc')}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 18, height: 40, borderRadius: SHAPE.full, backgroundColor: '#FFFFFF' }}>
            <Ionicons name={go && go.type === 'hadith' ? 'library' : 'book'} size={18} color="#123F35" />
            <T variant="labelLarge" color="#123F35">{go ? t('continueReading') : t('quran')}</T>
          </View>
        </Pressable>

        {other ? (
          <Pressable onPress={() => router.push(other.href)} accessibilityRole="button" accessibilityLabel={`${other.type === 'hadith' ? t('hadith') : t('quran')}: ${t('continueReading')}. ${other.title}`} {...ripple(colors)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: SHAPE.l, backgroundColor: colors.secondaryContainer, opacity: pressed ? 0.88 : 1 })}>
            <Ionicons name={other.type === 'hadith' ? 'library-outline' : 'book-outline'} size={22} color={colors.onSecondaryContainer} />
            <View style={{ flex: 1 }}>
              <T variant="labelMedium" color={colors.onSecondaryContainer}>{other.type === 'hadith' ? t('hadith') : t('quran')}</T>
              <T variant="titleSmall" color={colors.onSecondaryContainer} numberOfLines={1}>{other.title}</T>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSecondaryContainer} />
          </Pressable>
        ) : null}
        <TranslationButton />
        <StreakCard />

        {/* Shortcuts: one swipeable row instead of a wall of tiles */}
        <View style={{ marginHorizontal: -16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            <Shortcut icon="time" title="Prayer times" to="/prayer" />
            <Shortcut icon="school" title="Learn Quran" to="/learn" />
            <Shortcut icon="language" title="Learn Arabic" to="/learn-arabic" />
            <Shortcut icon="sparkles" title="Special Duas" to="/special-duas" tone="gold" />
            <Shortcut icon="library" title={t('hadith')} to="/hadith" />
            <Shortcut icon="heart" title={t('duas')} to="/duas" />
          </ScrollView>
        </View>

        {/* Understand What You Pray: five words a day, tap to hear */}
        <View style={{ borderRadius: SHAPE.xl, padding: 20, gap: 12, backgroundColor: colors.primaryContainer }}>
          <T variant="labelLarge" color={colors.onPrimaryContainer}>Learn Arabic</T>
          <T variant="titleLarge" color={colors.onPrimaryContainer}>Understand What You Pray</T>
          <T variant="bodyMedium" color={colors.onPrimaryContainer}>{ur ? 'آج کے 5 عربی الفاظ · سننے کے لیے ٹیپ کریں' : 'Today’s 5 Arabic words · tap to hear'}</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {words.map((w) => (
              <Pressable key={w.a} onPress={() => playWordRef(w.ref, w.a)} accessibilityRole="button" accessibilityLabel={`${w.a}: ${mean(w)}`} {...ripple(colors)}
                style={({ pressed }) => ({ minWidth: 92, paddingVertical: 12, paddingHorizontal: 12, borderRadius: SHAPE.l, backgroundColor: colors.surface, alignItems: 'center', gap: 2, opacity: pressed ? 0.85 : 1 })}>
                <T lang="ar" size={26} style={{ fontFamily: FONTS.quran, writingDirection: 'rtl', lineHeight: 44 }}>{w.a}</T>
                <T variant="bodySmall" color={colors.muted} numberOfLines={1}>{mean(w)}</T>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => router.push('/learn-arabic')} accessibilityRole="button" accessibilityLabel="Start learning" {...ripple(colors)}
              style={{ height: 40, paddingHorizontal: 20, borderRadius: SHAPE.full, backgroundColor: colors.primary, justifyContent: 'center' }}>
              <T variant="labelLarge" color={colors.onPrimary}>{ur ? 'سیکھنا شروع کریں' : 'Start learning'}</T>
            </Pressable>
            <Pressable onPress={() => router.push('/learn-arabic/2')} accessibilityRole="button" accessibilityLabel="Understand your Salah" {...ripple(colors)}
              style={{ height: 40, paddingHorizontal: 20, borderRadius: SHAPE.full, borderWidth: 1, borderColor: colors.onPrimaryContainer, justifyContent: 'center' }}>
              <T variant="labelLarge" color={colors.onPrimaryContainer}>{ur ? 'اپنی نماز سمجھیں' : 'Understand your Salah'}</T>
            </Pressable>
          </View>
        </View>

        <T variant="titleMedium" color={colors.muted} style={{ marginTop: 4 }}>{t('hadithOfDay')}</T>
        {daily.data?.h ? <HadithCard col={daily.data.col} h={daily.data.h} /> : <T color={colors.muted}>{daily.error ? t('offline') : t('loading')}</T>}
      </ScrollView>
    </Screen>
  );
}
