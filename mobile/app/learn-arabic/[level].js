import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import DATA from '../../src/lib/arabic-data.json';
import { LEVELS, PASS_MARK, makeGen, ptext, tr } from '../../src/lib/arabic-learn';
import { useArabic } from '../../src/lib/arabic-progress';
import { Button, Chip, Header, Screen, T } from '../../src/components/ui';
import { PracticeQuestions, QuizRun, SpeedToggle } from '../../src/components/LearnParts';
import { LangPicker, PhraseCard, WordTile } from '../../src/components/ArabicParts';

function Lesson({ n, lang, t }) {
  const { colors } = useApp();
  if (n === 1) {
    return (
      <View style={{ gap: 18 }}>
        <T color={colors.muted}>{t.tip}</T>
        {DATA.vocab.map((g) => (
          <View key={g.id} style={{ gap: 8 }}>
            <T weight="uiBold" size={17}>{ptext(g, lang)}</T>
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>{g.words.map((w, i) => <WordTile key={i} w={w} t={t} mean={ptext(w, lang)} />)}</View>
          </View>
        ))}
      </View>
    );
  }
  if (n === 2) return <View style={{ gap: 14 }}>{DATA.phrases.map((p) => <PhraseCard key={p.id} p={p} t={t} mean={ptext(p, lang)} when={ptext(p.when, lang)} wordMean={(w) => ptext(w, lang)} />)}</View>;
  return (
    <View style={{ gap: 18 }}>
      <T size={13} color={colors.muted}>{t.note3}</T>
      {DATA.surahs.map((s) => (
        <View key={s.n} style={{ gap: 10 }}>
          <T weight="uiBold" size={18}>{s.en} · {s.ar}</T>
          {s.verses.map((v) => (
            <PhraseCard key={v.v} t={t} mean={ptext(v, lang)} wordMean={(w) => w.en}
              p={{ ar: v.ar, tl: v.tl, words: v.words.map((w, i) => ({ a: w.a, tl: w.tl, en: w.en, ref: v.na ? null : [s.n, v.v, i + 1] })) }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ArabicLevelScreen() {
  const { colors } = useApp();
  const router = useRouter();
  const { level } = useLocalSearchParams();
  const n = Math.min(LEVELS.length, Math.max(1, parseInt(level, 10) || 1));
  const lv = LEVELS[n - 1];
  const { s, ready, lang, isOpen, record, setLang, unlockAll } = useArabic();
  const [tab, setTab] = useState('learn');
  const t = tr(lang); const ur = lang === 'ur';
  const next = n < LEVELS.length ? n + 1 : null;
  const gen = makeGen(lang);
  const rtl = { writingDirection: ur ? 'rtl' : 'ltr', textAlign: ur ? 'right' : 'left' };
  if (ready && !isOpen(n)) {
    return (
      <Screen>
        <Header title={`${t.level} ${n}`} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <T style={rtl}>{t.passPrev(n - 1)}</T>
          <Button label={t.goNext(n - 1)} onPress={() => router.replace(`/learn-arabic/${n - 1}`)} />
          <Button kind="ghost" label={t.unlock} onPress={unlockAll} />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title={ur ? lv.ur : lv.en} subtitle={`${t.level} ${n} ${t.of} ${LEVELS.length} · ${t.about(lv.minutes)}`} onBack={() => router.back()} />
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        {[['learn', t.learn], ['practice', t.practice], ['quiz', s.passed[n] ? `${t.quiz} ✓` : t.quiz]].map(([k, l]) => <Chip key={k} label={l} active={tab === k} onPress={() => setTab(k)} />)}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 60, gap: 14 }}>
        <T color={colors.muted} style={rtl}>{ur ? lv.goalUr : lv.goalEn}</T>
        <LangPicker lang={lang} onPick={setLang} />
        <SpeedToggle />
        {tab === 'learn' ? <><Lesson n={n} lang={lang} t={t} /><Button label={t.continuePractice} onPress={() => setTab('practice')} /></> : null}
        {tab === 'practice' ? <View style={{ gap: 12 }}><PracticeQuestions key={lang} level={n} gen={gen} /><Button kind="ghost" label={t.ready} onPress={() => setTab('quiz')} /></View> : null}
        {tab === 'quiz' ? (
          <View style={{ gap: 10 }}>
            <T color={colors.muted} style={rtl}>{t.quizInfo(Math.ceil(PASS_MARK * 10), s.best[n] ? Math.round(s.best[n] * 100) : 0)}</T>
            <QuizRun key={lang} level={n} next={next} gen={gen} nextRoute={(x) => `/learn-arabic/${x}`} goLabel={t.goNext} onFinish={(r) => record(n, r, PASS_MARK)} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
