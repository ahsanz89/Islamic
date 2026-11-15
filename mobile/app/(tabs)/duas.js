import React from 'react';
import { SectionList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getDuas } from '../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, T, TranslationButton, useAsync } from '../../src/components/ui';

export default function Duas() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getDuas, []);
  const lab = (o) => (settings.ui === 'ur' ? o.ur : settings.ui === 'ar' ? o.ar : o.en);
  const sections = data ? data.categories.map((c) => ({ title: lab(c), data: data.duas.filter((d) => d.cat === c.id) })).filter((s) => s.data.length) : [];
  return (
    <Screen>
      <Header title={t('duas')} subtitle={t('duasDesc')} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><TranslationButton /></View>
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <SectionList sections={sections} keyExtractor={(d) => d.id} contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8, paddingBottom: 30 }} stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <T weight="uiBold" size={13} color={colors.gold} style={{ letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 }}>{section.title}</T>}
          renderItem={({ item: d }) => (
            <Pressable onPress={() => router.push({ pathname: `/dua/${d.id}`, params: { c: d.c, n: String(d.n), sec: d.sec, title: lab(d) } })} accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginBottom: 8, opacity: pressed ? 0.85 : 1 })}>
              <T weight="uiSemi" size={16} style={{ flex: 1 }}>{lab(d)}</T>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          )} />
      )}
    </Screen>
  );
}
