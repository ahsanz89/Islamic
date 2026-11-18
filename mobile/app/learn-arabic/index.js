import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { LANGS, LEVELS, tr } from '../../src/lib/arabic-learn';
import { useArabic } from '../../src/lib/arabic-progress';
import { Button, Card, Header, Screen, T } from '../../src/components/ui';
import { LangPicker } from '../../src/components/ArabicParts';

export default function ArabicHub() {
  const { colors } = useApp();
  const router = useRouter();
  const { s, ready, lang, isOpen, setLang, unlockAll, reset } = useArabic();
  const t = tr(lang); const ur = lang === 'ur';
  const done = LEVELS.filter((l) => s.passed[l.n]).length;
  const next = LEVELS.find((l) => !s.passed[l.n] && isOpen(l.n)) || LEVELS[LEVELS.length - 1];
  if (ready && !s.lang) {
    return (
      <Screen>
        <Header title="Learn Arabic · عربی سیکھیں" onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 14 }}>
          <T weight="uiBold" size={20}>Choose your language · اپنی زبان چنیں</T>
          <T color={colors.muted}>{tr('en').chooseHelp}</T>
          <T color={colors.muted} style={{ textAlign: 'right', writingDirection: 'rtl' }}>{tr('ur').chooseHelp}</T>
          {Object.entries(LANGS).map(([k, l]) => <Button key={k} label={l.name} onPress={() => setLang(k)} />)}
        </View>
      </Screen>
    );
  }
  const rtl = { writingDirection: ur ? 'rtl' : 'ltr', textAlign: ur ? 'right' : 'left' };
  return (
    <Screen>
      <Header title={t.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 60, gap: 12 }}>
        <T color={colors.muted} style={rtl}>{t.intro}</T>
        <LangPicker lang={lang} onPick={setLang} />
        <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' }}><View style={{ height: 10, width: `${(done / LEVELS.length) * 100}%`, backgroundColor: colors.brand }} /></View>
        <T size={13} color={colors.muted} style={rtl}>{t.complete(done, LEVELS.length)}</T>
        <Button label={done === 0 ? t.start : done === LEVELS.length ? t.review : t.cont(next.n)} onPress={() => router.push(`/learn-arabic/${next.n}`)} />
        {LEVELS.map((l) => {
          const open = isOpen(l.n), ok = s.passed[l.n];
          return (
            <Pressable key={l.n} disabled={!open} onPress={() => router.push(`/learn-arabic/${l.n}`)} accessibilityRole="button" accessibilityLabel={`${t.level} ${l.n}: ${ur ? l.ur : l.en}${open ? '' : ', ' + t.locked}`} style={{ opacity: open ? 1 : 0.55 }}>
              <Card style={{ flexDirection: ur ? 'row-reverse' : 'row', gap: 14, alignItems: 'center', borderColor: ok ? colors.brand : colors.line }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? colors.brand : colors.brandSoft }}>
                  {ok ? <Ionicons name="checkmark" size={24} color={colors.brandInk} /> : !open ? <Ionicons name="lock-closed" size={20} color={colors.muted} /> : <T weight="uiBlack" size={18} color={colors.brandDeep}>{l.n}</T>}
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="uiBold" size={17} style={rtl}>{ur ? l.ur : l.en}</T>
                  <T size={14} color={colors.muted} style={rtl}>{ur ? l.goalUr : l.goalEn}</T>
                  <T size={12.5} color={colors.muted} style={rtl}>{open ? `${t.about(l.minutes)}${s.best[l.n] ? ` · ${Math.round(s.best[l.n] * 100)}%` : ''}` : t.locked}</T>
                </View>
              </Card>
            </Pressable>
          );
        })}
        <T size={12.5} color={colors.muted} style={rtl}>{t.review_note}</T>
        <Button kind="ghost" label={t.unlock} onPress={unlockAll} />
        <Pressable onPress={reset} accessibilityRole="button"><T size={13} color={colors.muted} style={{ textAlign: 'center' }}>{t.resetq}</T></Pressable>
      </ScrollView>
    </Screen>
  );
}
