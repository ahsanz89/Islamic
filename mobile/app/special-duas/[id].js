import React from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { SD, catName, pick, shareText, titleOf, tx } from '../../src/lib/special-duas';
import { useDuaFavs } from '../../src/lib/dua-favs';
import { ArabicText, Button, Header, Screen, T } from '../../src/components/ui';
import { GradePill } from './index';

const Sec = ({ h, children }) => { const { colors } = useApp(); return <View style={{ gap: 6 }}><T size={12.5} weight="uiBold" color={colors.muted} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>{h}</T>{children}</View>; };

export default function SpecialDua() {
  const { colors, settings } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const ui = settings.ui; const t = tx(ui); const rtl = ui === 'ur';
  const { isFav, toggle } = useDuaFavs();
  const d = SD.duas.find((x) => x.id === id);
  if (!d) return <Screen><Header title={t.title} onBack={() => router.back()} /><T style={{ padding: 16 }}>{t.none}</T></Screen>;
  const quran = d.kind === 'quran';
  const dir = { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' };
  const open = () => (quran ? router.push(`/surah/${d.src.s}`) : router.push({ pathname: `/dua/${d.id}`, params: { c: d.src.c, n: String(d.src.n), sec: d.src.sec, title: titleOf(d, ui) } }));
  return (
    <Screen>
      <Header title={t.section} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 60 }}>
        <T size={12.5} color={colors.muted} style={dir}>{quran ? t.kindQuran : d.kind === 'virtue' ? t.kindVirtue : t.kindDua} · {d.cats.filter((c) => c !== 'quran').map((c) => catName(SD.cats.find((x) => x.id === c), ui)).join(' · ')}</T>
        <T weight="uiBlack" size={24} style={dir}>{titleOf(d, ui)}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <GradePill d={d} ui={ui} />
          <Pressable onPress={() => toggle(d.id)} accessibilityRole="button" accessibilityLabel={t.save} accessibilityState={{ selected: isFav(d.id) }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 10 }}>
            <Ionicons name={isFav(d.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.brand} /><T weight="uiSemi" size={14}>{t.save}</T>
          </Pressable>
          <Pressable onPress={() => Share.share({ message: `${shareText(d, ui)}\n\n— DALIL` }).catch(() => {})} accessibilityRole="button" accessibilityLabel={t.share} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 10 }}>
            <Ionicons name="share-outline" size={22} color={colors.brand} /><T weight="uiSemi" size={14}>{t.share}</T>
          </Pressable>
        </View>
        <Sec h={t.arabic}><ArabicText quran size={32}>{d.ar}</ArabicText></Sec>
        {d.tl ? <Sec h={t.translit}><T size={17} style={{ fontStyle: 'italic' }}>{d.tl}</T>{d.kind === 'dua' ? <T size={12.5} color={colors.muted}>{t.translitNote}</T> : null}</Sec> : null}
        {d.en || d.ur ? <Sec h={t.translation}><T style={ui === 'ur' && d.ur ? dir : undefined}>{ui === 'ur' && d.ur ? d.ur : d.en}</T>{d.enSrc ? <T size={12.5} color={colors.muted}>English translation: {d.enSrc}.</T> : null}</Sec> : null}
        <Sec h={t.occasion}><T style={dir}>{pick(d.occ, ui)}</T></Sec>
        <Sec h={t.virtue}><T style={dir}>{pick(d.virt, ui)}</T></Sec>
        <Sec h={t.source}>
          <T weight="uiBold">{d.src.book} {quran ? `${d.src.name} (${d.src.ref})` : d.src.ref}</T>
          <Button kind="ghost" label={quran ? 'Open in the Quran' : t.fullHadith} onPress={open} />
          {d.also?.length ? <T size={13} color={colors.muted}>{t.also}: {d.also.map((a) => `${a.book} ${a.n} (${a.grade})`).join(' · ')}</T> : null}
        </Sec>
        <Sec h={t.grading}>
          <GradePill d={d} ui={ui} />
          {d.grade.note ? <T size={13} color={colors.muted}>{d.grade.note}</T> : null}
          {d.grade.differ ? <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.brandSoft }}><T size={13.5}>{t.differ}</T></View> : null}
          {d.grade.graders.map(([who, g]) => <View key={who} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}><T size={14}>{who}</T><T size={14} weight="uiSemi">{g}</T></View>)}
        </Sec>
        <Sec h={t.audio}>{quran ? <Button kind="ghost" label={t.audioQuran} onPress={open} /> : <T color={colors.muted}>{t.audioNone}</T>}</Sec>
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}><T size={13.5} style={dir}>{t.note}</T></View>
      </ScrollView>
    </Screen>
  );
}
