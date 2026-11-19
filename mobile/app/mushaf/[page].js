import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/lib/settings';
import { getSurahs } from '../../src/lib/api';
import { PAGES, clampPage, pageOfSurah, surahsOnPage } from '../../src/lib/mushaf-core';
import { positionOfPage, saveQuran } from '../../src/lib/reading-progress';
import { Segmented, BottomSheet, IconButton, ListItem, LeadingBadge, TopAppBar } from '../../src/components/m3';
import { MiniPlayer } from '../../src/components/ui';
import { T } from '../../src/components/text';
import MushafPage from '../../src/components/MushafPage';
import { FONTS, MAX_WIDTH } from '../../src/lib/theme';

const ORDER = Array.from({ length: PAGES }, (_, i) => PAGES - i);   // newest page on the LEFT: swipe right to turn to the next page, like the printed Mushaf
const ZOOMS = [['1', '100%'], ['1.25', '125%'], ['1.5', '150%']];

export default function MushafScreen() {
  const params = useLocalSearchParams();
  const { colors, settings, update, t } = useApp();
  const router = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const W = Math.min(winW, MAX_WIDTH);
  const [page, setPage] = useState(() => clampPage(params.page));
  const [pageH, setPageH] = useState(Math.max(300, winH - 260));
  const [sheet, setSheet] = useState(false);
  const [num, setNum] = useState('');
  const [names, setNames] = useState(null);
  const list = useRef(null);
  const zoom = Number(settings.mushafZoom) || 1;
  const startIndex = useRef(PAGES - clampPage(params.page));

  useEffect(() => { getSurahs().then((d) => setNames(d.surahs)).catch(() => {}); }, []);
  const nameOf = useCallback((s) => (names ? names[s - 1].name : `Surah ${s}`), [names]);
  const onPage = surahsOnPage(page);
  const title = onPage.map(nameOf).join(' · ');
  const goTo = useCallback((p, animated = false) => {
    const next = clampPage(p);
    setPage(next);
    try { list.current?.scrollToIndex({ index: PAGES - next, animated }); } catch { /* list not ready */ }
  }, []);

  // Save the reading position (the page and its first verse) a moment after the page settles.
  useEffect(() => {
    const id = setTimeout(() => {
      const pos = positionOfPage(page, nameOf(surahsOnPage(page)[0]));
      const patch = saveQuran(pos);
      if (patch) update(patch);
    }, 700);
    return () => clearTimeout(id);
  }, [page, names]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { AccessibilityInfo.announceForAccessibility?.(`${'Page'} ${page}. ${title}`); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchToStandard = () => {
    const pos = positionOfPage(page);
    update({ quranMode: 'standard' });
    router.replace(`/surah/${pos.surah}?ayah=${pos.ayah}`);
  };
  const jump = () => { const n = Number(num); if (n >= 1 && n <= PAGES) { goTo(n); setSheet(false); setNum(''); } };
  const Nav = ({ icon, label, onPress, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
      style={{ width: 56, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1, backgroundColor: colors.secondaryContainer }}>
      <Ionicons name={icon} size={26} color={colors.onSecondaryContainer} />
    </Pressable>
  );

  const renderItem = useCallback(({ item }) => {
    const pw = W * zoom, ph = pageH * zoom;
    const body = <MushafPage key={`${item}|${Math.round(pw)}`} page={item} width={pw} height={ph} />;
    return (
      <View style={{ width: W, height: pageH }}>
        {zoom > 1 ? (
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator contentOffset={{ x: (pw - W) / 2, y: 0 }}>
            <ScrollView nestedScrollEnabled>{body}</ScrollView>
          </ScrollView>
        ) : body}
      </View>
    );
  }, [W, pageH, zoom]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surfaceLow }}>
      <View style={{ flex: 1, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' }}>
        <TopAppBar title={title || `${'Page'} ${page}`} subtitle={`${'Page'} ${page} / ${PAGES}`} onBack={() => router.back()}
          actions={(
            <>
              <IconButton icon="list" label="Go to page or surah" onPress={() => setSheet(true)} testID="mushaf-jump" />
              <IconButton icon="reader-outline" label="Switch to the standard Quran view" onPress={switchToStandard} testID="mushaf-standard" />
            </>
          )} />
        <View style={{ flex: 1 }} onLayout={(e) => setPageH(Math.max(240, e.nativeEvent.layout.height))}>
          <FlatList
            ref={list} data={ORDER} keyExtractor={(p) => String(p)} horizontal pagingEnabled scrollEnabled={zoom === 1} showsHorizontalScrollIndicator={false}
            initialScrollIndex={startIndex.current} getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
            initialNumToRender={1} maxToRenderPerBatch={1} windowSize={3} removeClippedSubviews={false}
            extraData={[zoom, pageH, W]} renderItem={renderItem}
            onMomentumScrollEnd={(e) => setPage(PAGES - Math.round(e.nativeEvent.contentOffset.x / W))}
            onScrollToIndexFailed={() => {}} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
          <Nav icon="chevron-back" label={`Next page, ${Math.min(PAGES, page + 1)}`} onPress={() => goTo(page + 1)} disabled={page >= PAGES} />
          <Pressable onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Page ${page} of ${PAGES}. Tap to go to another page`} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 }}>
            <T variant="titleMedium" color={colors.ink}>{page} / {PAGES}</T>
          </Pressable>
          <Nav icon="chevron-forward" label={`Previous page, ${Math.max(1, page - 1)}`} onPress={() => goTo(page - 1)} disabled={page <= 1} />
        </View>
        <MiniPlayer />
      </View>
      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Go to" doneLabel={t('done')}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput value={num} onChangeText={setNum} keyboardType="number-pad" placeholder={`Page (1–${PAGES})`} placeholderTextColor={colors.muted} accessibilityLabel={`Page number, 1 to ${PAGES}`}
            onSubmitEditing={jump} style={{ flex: 1, height: 52, paddingHorizontal: 16, borderRadius: 26, backgroundColor: colors.surfaceHigh, fontFamily: FONTS.ui, fontSize: 16, color: colors.ink }} />
          <Pressable onPress={jump} accessibilityRole="button" accessibilityLabel="Go to this page" style={{ height: 52, paddingHorizontal: 24, borderRadius: 26, backgroundColor: colors.primary, justifyContent: 'center' }}>
            <T variant="labelLarge" color={colors.onPrimary}>{t('go')}</T>
          </Pressable>
        </View>
        <T variant="titleSmall" color={colors.muted}>Zoom (the lines never change; zoom in to pan across the page)</T>
        <Segmented options={ZOOMS} value={String(zoom)} onChange={(v) => update({ mushafZoom: Number(v) })} />
        <T variant="titleSmall" color={colors.muted} style={{ marginTop: 8 }}>Surahs</T>
        {(names || []).map((s) => (
          <ListItem key={s.n} headline={s.name} supporting={`${s.en} · page ${pageOfSurah(s.n)}`} leading={<LeadingBadge size={40}>{s.n}</LeadingBadge>}
            onPress={() => { goTo(pageOfSurah(s.n)); setSheet(false); }} label={`${s.n}. ${s.name}, page ${pageOfSurah(s.n)}`} />
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}
