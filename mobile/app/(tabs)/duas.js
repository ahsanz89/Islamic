import React from 'react';
import { SectionList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getDuas } from '../../src/lib/api';
import { ErrorBox, Loader, Screen, TranslationButton, useAsync } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { ListItem, TopAppBar, openDrawer, ripple } from '../../src/components/m3';
import { SHAPE } from '../../src/lib/theme';

export default function Duas() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getDuas, []);
  const lab = (o) => (settings.ui === 'ur' ? o.ur : settings.ui === 'ar' ? o.ar : o.en);
  const sections = data ? data.categories.map((c) => ({ title: lab(c), data: data.duas.filter((d) => d.cat === c.id) })).filter((s) => s.data.length) : [];
  return (
    <Screen>
      <TopAppBar title={t('duas')} subtitle={t('duasDesc')} onMenu={openDrawer} />
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <SectionList sections={sections} keyExtractor={(d) => d.id} contentContainerStyle={{ paddingBottom: 30 }} stickySectionHeadersEnabled={false}
          ListHeaderComponent={(
            <View style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 12 }}>
              <TranslationButton />
              <Pressable onPress={() => router.push('/special-duas')} accessibilityRole="button" accessibilityLabel="Special Duas and Accepted Supplications" {...ripple(colors)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: SHAPE.xl, backgroundColor: colors.tertiaryContainer, opacity: pressed ? 0.9 : 1 })}>
                <Ionicons name="sparkles" size={28} color={colors.onTertiaryContainer} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="titleMedium" color={colors.onTertiaryContainer}>{settings.ui === 'ur' ? 'خاص دعائیں اور مقبول دعائیں' : 'Special Duas & Accepted Supplications'}</T>
                  <T variant="bodySmall" color={colors.onTertiaryContainer}>{settings.ui === 'ur' ? 'قرآن اور مستند سنت سے، حوالہ اور درجے کے ساتھ' : 'From the Quran and authentic Sunnah, with sources and gradings'}</T>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.onTertiaryContainer} />
              </Pressable>
            </View>
          )}
          renderSectionHeader={({ section }) => <T variant="labelLarge" color={colors.primary} style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 }}>{section.title}</T>}
          renderItem={({ item: d }) => (
            <ListItem onPress={() => router.push({ pathname: `/dua/${d.id}`, params: { c: d.c, n: String(d.n), sec: d.sec, title: lab(d) } })} headline={lab(d)} divider
              trailing={<Ionicons name="chevron-forward" size={20} color={colors.muted} />} />
          )} />
      )}
    </Screen>
  );
}
