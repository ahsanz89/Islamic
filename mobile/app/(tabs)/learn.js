import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { LEVELS } from '../../src/lib/learn-data';
import { useLearn } from '../../src/lib/learn-progress';
import { Button, Card, Screen } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { ProgressBar, TopAppBar, openDrawer } from '../../src/components/m3';
import { SHAPE } from '../../src/lib/theme';

export default function LearnHub() {
  const { colors } = useApp();
  const router = useRouter();
  const { s, isOpen, unlockAll, reset } = useLearn();
  const done = LEVELS.filter((l) => s.passed[l.n]).length;
  const next = LEVELS.find((l) => !s.passed[l.n] && isOpen(l.n)) || LEVELS[LEVELS.length - 1];
  const pct = done / LEVELS.length;
  return (
    <Screen>
      <TopAppBar title="Learn Quran" subtitle="From the first letter to reading the Quran" onMenu={openDrawer} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 60, gap: 14 }}>
        <View style={{ borderRadius: SHAPE.xl, padding: 20, gap: 12, backgroundColor: colors.primaryContainer }}>
          <T variant="titleMedium" color={colors.onPrimaryContainer}>{done === LEVELS.length ? 'All levels complete' : `Level ${next.n}: ${next.title}`}</T>
          <ProgressBar value={pct} />
          <T variant="bodySmall" color={colors.onPrimaryContainer}>{done} of {LEVELS.length} levels complete · each level has a lesson, practice with sound and a quiz. Free for everyone.</T>
          <Button label={done === 0 ? 'Start Level 1' : done === LEVELS.length ? 'Review Level 6' : `Continue Level ${next.n}`} onPress={() => router.push(`/learn/${next.n}`)} />
        </View>
        <View style={{ borderRadius: SHAPE.l, overflow: 'hidden', backgroundColor: colors.surfaceMid }}>
          {LEVELS.map((l, i) => {
            const open = isOpen(l.n), ok = s.passed[l.n];
            return (
              <Pressable key={l.n} disabled={!open} onPress={() => router.push(`/learn/${l.n}`)} accessibilityRole="button" accessibilityLabel={`Level ${l.n}: ${l.title}${open ? '' : ', locked'}`}
                style={{ opacity: open ? 1 : 0.55, flexDirection: 'row', gap: 16, alignItems: 'center', padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.outlineVariant }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? colors.primary : colors.surfaceHighest }}>
                  {ok ? <Ionicons name="checkmark" size={24} color={colors.onPrimary} /> : !open ? <Ionicons name="lock-closed" size={20} color={colors.muted} /> : <T variant="titleMedium">{l.n}</T>}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="titleMedium">{l.title}</T>
                  <T variant="bodyMedium" color={colors.muted}>{l.goal}</T>
                  <T variant="bodySmall" color={colors.muted}>{open ? `About ${l.minutes} min${s.best[l.n] ? ` · best quiz ${Math.round(s.best[l.n] * 100)}%` : ''}` : 'Pass the previous level to open'}</T>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Card kind="elevated" onPress={() => router.push('/learn-arabic')} accessibilityLabel="Open Learn Arabic" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Ionicons name="language" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <T variant="titleMedium">Learn Arabic · عربی سیکھیں</T>
            <T variant="bodyMedium" color={colors.muted}>Words of the Quran and the prayer, with meanings in English or Urdu.</T>
          </View>
        </Card>
        <Button kind="ghost" label="I already read Arabic: unlock all levels" onPress={unlockAll} />
        <Pressable onPress={reset} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}><T variant="bodySmall" color={colors.muted} style={{ textAlign: 'center' }}>Reset progress on this device</T></Pressable>
      </ScrollView>
    </Screen>
  );
}
