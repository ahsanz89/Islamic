import React from 'react';
import { Pressable, View } from 'react-native';
import { useApp } from '../lib/settings';
import { LANGS, tr } from '../lib/arabic-learn';
import { playWordRef } from '../lib/arabic-audio';
import { Ar, SoundBtn } from './LearnParts';
import { T } from './ui';

export function LangPicker({ lang, onPick }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} accessibilityRole="radiogroup" accessibilityLabel="Language">
      <T size={13} color={colors.muted}>{tr(lang).hubLang}:</T>
      {Object.entries(LANGS).map(([k, l]) => (
        <Pressable key={k} onPress={() => onPick(k)} accessibilityRole="radio" accessibilityState={{ selected: lang === k }} accessibilityLabel={l.name}
          style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center', borderColor: lang === k ? colors.brand : colors.border, backgroundColor: lang === k ? colors.brand : colors.surface }}>
          <T weight="uiSemi" size={14} color={lang === k ? '#fff' : colors.ink}>{l.name}</T>
        </Pressable>
      ))}
    </View>
  );
}

/** One Arabic word: tap to hear it (real Quran word clip), with its meaning underneath. */
export function WordTile({ w, mean, t }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={() => playWordRef(w.ref, w.a)} accessibilityRole="button" accessibilityLabel={`${t.hear}: ${w.a}, ${mean}`}
      style={({ pressed }) => ({ alignItems: 'center', justifyContent: 'center', minWidth: 84, minHeight: 84, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 })}>
      <Ar size={32}>{w.a}</Ar>
      <T size={12.5} color={colors.muted} style={{ textAlign: 'center' }}>{mean}</T>
      {w.tl ? <T size={11.5} color={colors.muted}>{w.tl}</T> : null}
    </Pressable>
  );
}

export function PhraseCard({ p, t, mean, when, wordMean }) {
  const { colors } = useApp();
  return (
    <View style={{ gap: 8, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}>
      <Ar size={40}>{p.ar}</Ar>
      <SoundBtn text={p.ar} label={t.hear} />
      {p.tl ? <T><T weight="uiBold">{t.say}: </T>{p.tl}</T> : null}
      <T><T weight="uiBold">{t.meaning}: </T>{mean}</T>
      {when ? <T color={colors.muted}><T weight="uiBold" color={colors.muted}>{t.whenSaid}: </T>{when}</T> : null}
      {p.words ? <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>{p.words.map((w, i) => <WordTile key={i} w={w} t={t} mean={wordMean(w)} />)}</View> : null}
    </View>
  );
}
