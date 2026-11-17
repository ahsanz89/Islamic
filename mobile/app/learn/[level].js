import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import { LEVELS, PASS_MARK } from '../../src/lib/learn-data';
import { useLearn } from '../../src/lib/learn-progress';
import { Button, Chip, Header, Screen, T } from '../../src/components/ui';
import { Lesson } from '../../src/components/LearnLessons';
import { Match, PracticeQuestions, QuizRun, Repeat, SpeedToggle } from '../../src/components/LearnParts';

export default function LevelScreen() {
  const { colors } = useApp();
  const router = useRouter();
  const { level } = useLocalSearchParams();
  const n = Math.min(6, Math.max(1, parseInt(level, 10) || 1));
  const lv = LEVELS[n - 1];
  const { s, isOpen, record, setRoman, unlockAll } = useLearn();
  const [tab, setTab] = useState('learn');
  const [mode, setMode] = useState('questions');
  const next = n < LEVELS.length ? n + 1 : null;
  if (!isOpen(n)) {
    return (
      <Screen>
        <Header title={`Level ${n}`} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <T>This level opens after you pass the quiz for Level {n - 1}.</T>
          <Button label={`Go to Level ${n - 1}`} onPress={() => router.replace(`/learn/${n - 1}`)} />
          <Button kind="ghost" label="I already know this: unlock all levels" onPress={unlockAll} />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title={lv.title} subtitle={`Level ${n} of ${LEVELS.length} · about ${lv.minutes} min`} onBack={() => router.back()} />
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center' }}>
        {[['learn', 'Learn'], ['practice', 'Practice'], ['quiz', s.passed[n] ? 'Quiz ✓' : 'Quiz']].map(([k, l]) => <Chip key={k} label={l} active={tab === k} onPress={() => setTab(k)} />)}
        <View style={{ flex: 1 }} />
        <T size={12.5} color={colors.muted}>Roman Urdu</T>
        <Switch value={s.roman} onValueChange={setRoman} trackColor={{ true: colors.brand, false: colors.border }} accessibilityLabel="Roman Urdu" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 60, gap: 14 }}>
        <T color={colors.muted}>{lv.goal}</T>
        <SpeedToggle />
        {tab === 'learn' ? <><Lesson n={n} roman={s.roman} /><Button label="Continue to practice" onPress={() => setTab('practice')} /></> : null}
        {tab === 'practice' ? (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Chip label="Questions" active={mode === 'questions'} onPress={() => setMode('questions')} />
              <Chip label="Listen and repeat" active={mode === 'repeat'} onPress={() => setMode('repeat')} />
              {n === 1 ? <Chip label="Match" active={mode === 'match'} onPress={() => setMode('match')} /> : null}
            </View>
            {mode === 'questions' ? <PracticeQuestions level={n} /> : mode === 'repeat' ? <Repeat level={n} /> : <Match />}
            <Button kind="ghost" label="Ready for the quiz" onPress={() => setTab('quiz')} />
          </View>
        ) : null}
        {tab === 'quiz' ? (
          <View style={{ gap: 10 }}>
            <T color={colors.muted}>10 questions. Get {Math.ceil(PASS_MARK * 10)} right to finish this level{s.best[n] ? ` · best ${Math.round(s.best[n] * 100)}%` : ''}.</T>
            <QuizRun level={n} next={next} onFinish={(r) => record(n, r, PASS_MARK)} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
