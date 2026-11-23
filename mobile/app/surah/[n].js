import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getSurah, getSurahs } from '../../src/lib/api';
import { MissingLanguageNotice, OfflineBanner } from '../../src/components/OfflineBits';
import * as audio from '../../src/lib/audio';
import { useAudio } from '../../src/lib/audio';
import { baseLang, choiceByKey } from '../../src/lib/languages';
import { ArabicText, Chip, ErrorBox, Loader, MiniPlayer, Screen, T, TranslationButton, TranslationText, useAsync } from '../../src/components/ui';
import { IconButton, TopAppBar } from '../../src/components/m3';
import { saveQuran } from '../../src/lib/reading-progress';
import { pageOfVerse } from '../../src/lib/mushaf-core';
import { ReciterSheet, reciterLabel } from '../../src/components/ReciterSheet';
import { FONTS } from '../../src/lib/theme';

const stripDiacritics = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '');

const Verse = memo(function Verse({ v, surah, trKeys, size, harakat, playing, urduNow, colors, onPlay, t }) {
  const ar = harakat ? v.ar : stripDiacritics(v.ar);
  return (
    <View style={{ padding: 14, borderRadius: 20, gap: 10, backgroundColor: playing ? colors.primaryContainer : colors.surfaceMid }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={onPlay} accessibilityRole="button" accessibilityLabel={`${t('play')} ${t('ayah')} ${v.v}`} hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: playing ? colors.primary : colors.primaryContainer }}>
          <Ionicons name={playing ? 'pause' : 'play'} size={20} color={playing ? colors.brandInk : colors.brandDeep} />
        </Pressable>
        <T weight="uiBold" size={15} color={colors.brandDeep}>{surah.n}:{v.v}</T>
        <T size={12.5} color={colors.muted}>{t('juz')} {v.juz}</T>
      </View>
      <ArabicText quran size={size}>{`${ar} ﴿${v.v.toLocaleString('ar-EG')}﴾`}</ArabicText>
      {trKeys.map((k) => (v.t?.[k] ? (
        <View key={k} style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8, gap: 3, borderRadius: 6, backgroundColor: urduNow && k.startsWith('ur') ? colors.brandSoft : 'transparent' }}>
          <T size={12} weight="uiBold" color={colors.muted}>{choiceByKey(k)?.native} · {choiceByKey(k)?.translator}</T>
          <TranslationText lang={baseLang(k)}>{v.t[k]}</TranslationText>
        </View>
      ) : null))}
    </View>
  );
});

export default function SurahScreen() {
  const { n, ayah: ayahParam } = useLocalSearchParams();
  const { colors, t, settings, update } = useApp();
  const router = useRouter();
  const ref = useRef(null);
  const [reciterOpen, setReciterOpen] = useState(false);
  const meta = useAsync(async () => (await getSurahs()).surahs[Number(n) - 1], [n]);
  const need = useMemo(() => [settings.tr, settings.tr2].filter(Boolean), [settings.tr, settings.tr2]);
  const verses = useAsync(() => getSurah(n, need), [n, need.join(',')]);
  const playingV = useAudio((s) => (s.q && s.q.surah.n === Number(n) ? s.q.v : null));
  const status = useAudio((s) => s.status);
  const phase = useAudio((s) => s.phase);
  const surahMode = useAudio((s) => !!(s.q && s.q.mode === 'surah' && s.q.surah.n === Number(n)));
  const surah = meta.data;
  const trKeys = useMemo(() => [settings.tr, settings.tr2].filter(Boolean), [settings.tr, settings.tr2]);

  const topAyah = useRef(Number(ayahParam) > 0 ? Number(ayahParam) : 1);
  const [savedTick, setSavedTick] = useState(0);
  const onViewable = useRef(({ viewableItems }) => {
    const first = viewableItems.filter((x) => x.item && x.isViewable).map((x) => x.item.v).sort((a, b) => a - b)[0];
    if (first && first !== topAyah.current) { topAyah.current = first; setSavedTick((x) => x + 1); }
  }).current;
  // save the exact ayah a moment after the reader stops moving (Quran history only; Hadith history is separate)
  useEffect(() => {
    if (!surah) return undefined;
    const id = setTimeout(() => { const patch = saveQuran({ surah: surah.n, ayah: topAyah.current, name: surah.name }); if (patch) update(patch); }, 600);
    return () => clearTimeout(id);
  }, [surah?.n, savedTick]); // eslint-disable-line react-hooks/exhaustive-deps
  // reopen at the saved ayah
  useEffect(() => {
    const target = Number(ayahParam);
    if (!verses.data || !(target > 1)) return;
    const i = verses.data.findIndex((x) => x.v === target);
    if (i > 0) setTimeout(() => { try { ref.current?.scrollToIndex({ index: i, animated: false, viewPosition: 0 }); } catch { /* not measured yet */ } }, 350);
  }, [verses.data, ayahParam]);
  useEffect(() => {
    if (!surahMode || playingV == null || playingV < 1 || status !== 'playing' || !verses.data) return;
    const i = playingV - 1;
    if (i >= 0 && i < verses.data.length) { try { ref.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.15 }); } catch { /* list not measured yet */ } }
  }, [playingV, status, surahMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const whole = settings.reciter === 'badr';
  const Header = surah ? (
    <View style={{ gap: 12, marginBottom: 6 }}>
      <View style={{ alignItems: 'center', padding: 20, borderRadius: 28, backgroundColor: colors.primaryContainer, gap: 4 }}>
        <View style={{ minWidth: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><T weight="uiBold" color={colors.onPrimary}>{surah.n}</T></View>
        <T style={{ fontFamily: FONTS.quran, writingDirection: 'rtl' }} size={44} color={colors.ink}>{surah.ar}</T>
        <T weight="uiBold" size={22} color={colors.brandDeep}>{surah.name}</T>
        {surah.en !== surah.name ? <T size={15} color={colors.muted}>{surah.en}</T> : null}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[surah.place === 'Mecca' ? t('meccan') : t('medinan'), `${surah.verses} ${t('verses')}`].map((x) => (
            <View key={x} style={{ backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}><T size={13} weight="uiSemi" color={colors.gold}>{x}</T></View>
          ))}
        </View>
      </View>
      <TranslationButton />
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Chip icon={surahMode && status === 'playing' ? 'pause' : 'play'} label={surahMode && status === 'playing' ? t('pause') : t('playSurah')} active onPress={() => (surahMode ? audio.toggle() : audio.playSurah(surah))} />
        <Chip icon="mic" label={reciterLabel(settings.reciter)} onPress={() => setReciterOpen(true)} />
        <Chip icon="language" label={`${t('urduShort')}: ${settings.urduAudio ? t('on') : t('off')}`} active={settings.urduAudio} onPress={() => update({ urduAudio: !settings.urduAudio })} />
      </View>
      {settings.urduAudio && whole ? <T size={13} color={colors.muted}>{t('urduAudioHint')}</T> : null}
      {surah.n !== 1 && surah.n !== 9 ? <ArabicText quran center size={30}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</ArabicText> : null}
    </View>
  ) : null;
  return (
    <Screen>
      <TopAppBar title={surah ? `${surah.n}. ${surah.name}` : t('quran')} subtitle={surah ? `${surah.en} · ${surah.verses} ${t('verses')}` : undefined} onBack={() => router.back()}
        actions={<><IconButton icon="mic-outline" label="Practice reciting this surah" testID="to-practice" onPress={() => router.push(`/practice/${n}`)} /><IconButton icon="book-outline" label="Open in the 15-line Mushaf view" testID="to-mushaf" onPress={() => { update({ quranMode: 'mushaf' }); router.replace(`/mushaf/${pageOfVerse(Number(n), topAyah.current)}`); }} /></>} />
      <MissingLanguageNotice rel={`q/${n}.json`} need={need} />
      {verses.loading || meta.loading ? <Loader /> : verses.error ? <ErrorBox onRetry={verses.reload} /> : (
        <FlatList ref={ref} data={verses.data} keyExtractor={(v) => String(v.v)} contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12, paddingBottom: 30 }}
          ListHeaderComponent={Header} onViewableItemsChanged={onViewable} viewabilityConfig={{ itemVisiblePercentThreshold: 40 }} initialNumToRender={8} windowSize={9} onScrollToIndexFailed={() => {}}
          extraData={[playingV, status, phase, trKeys.join(), settings.arSize, settings.harakat, colors.dark]}
          renderItem={({ item: v }) => (
            <Verse v={v} surah={surah} trKeys={trKeys} size={settings.arSize} harakat={settings.harakat} colors={colors} t={t}
              playing={playingV === v.v && (status === 'playing' || status === 'loading' || status === 'paused')} urduNow={playingV === v.v && phase === 'urdu'}
              onPlay={() => (playingV === v.v && status === 'playing' ? audio.pause() : audio.playAyah(surah, v.v))} />
          )} />
      )}
      <MiniPlayer />
      <ReciterSheet visible={reciterOpen} onClose={() => setReciterOpen(false)} />
    </Screen>
  );
}
