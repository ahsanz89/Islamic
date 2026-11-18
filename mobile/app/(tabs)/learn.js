import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { LEVELS } from '../../src/lib/learn-data';
import { useLearn } from '../../src/lib/learn-progress';
import { Button, Card, Header, Screen, T } from '../../src/components/ui';

export default function LearnHub() {
  const { colors } = useApp();
  const router = useRouter();
  const { s, isOpen, unlockAll, reset } = useLearn();
  const done = LEVELS.filter((l) => s.passed[l.n]).length;
  const next = LEVELS.find((l) => !s.passed[l.n] && isOpen(l.n)) || LEVELS[LEVELS.length - 1];
  return (
    <Screen>
      <Header title="Learn Quran" subtitle="From the first letter to reading the Quran" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 60, gap: 12 }}>
        <T color={colors.muted}>Each level has a short lesson, practice with sound, and a quiz. Pass the quiz to open the next level. Free for everyone.</T>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' }}><View style={{ height: 10, width: `${(done / LEVELS.length) * 100}%`, backgroundColor: colors.brand }} /></View>
        <T size={13} color={colors.muted}>{done} of {LEVELS.length} levels complete</T>
        <Button label={done === 0 ? 'Start Level 1' : done === LEVELS.length ? 'Review Level 6' : `Continue Level ${next.n}`} onPress={() => router.push(`/learn/${next.n}`)} />
        {LEVELS.map((l) => {
          const open = isOpen(l.n), ok = s.passed[l.n];
          return (
            <Pressable key={l.n} disabled={!open} onPress={() => router.push(`/learn/${l.n}`)} accessibilityRole="button" accessibilityLabel={`Level ${l.n}: ${l.title}${open ? '' : ', locked'}`} style={{ opacity: open ? 1 : 0.55 }}>
              <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center', borderColor: ok ? colors.brand : colors.line }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? colors.brand : colors.brandSoft }}>
                  {ok ? <Ionicons name="checkmark" size={24} color={colors.brandInk} /> : !open ? <Ionicons name="lock-closed" size={20} color={colors.muted} /> : <T weight="uiBlack" size={18} color={colors.brandDeep}>{l.n}</T>}
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="uiBold" size={17}>{l.title}</T>
                  <T size={14} color={colors.muted}>{l.goal}</T>
                  <T size={12.5} color={colors.muted}>{open ? `About ${l.minutes} min${s.best[l.n] ? ` · best quiz ${Math.round(s.best[l.n] * 100)}%` : ''}` : 'Pass the previous level to open'}</T>
                </View>
              </Card>
            </Pressable>
          );
        })}
        <Card onPress={() => router.push('/learn-arabic')} accessibilityLabel="Open Learn Arabic">
          <T weight="uiBold" size={17}>Learn Arabic · عربی سیکھیں</T>
          <T size={14} color={colors.muted}>Words of the Quran and the prayer, with meanings in English or Urdu.</T>
        </Card>
        <Button kind="ghost" label="I already read Arabic: unlock all levels" onPress={unlockAll} />
        <Pressable onPress={reset} accessibilityRole="button"><T size={13} color={colors.muted} style={{ textAlign: 'center' }}>Reset progress on this device</T></Pressable>
      </ScrollView>
    </Screen>
  );
}
