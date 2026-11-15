import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import { getCollections } from '../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, T, TranslationButton, useAsync } from '../../src/components/ui';
import { FONTS } from '../../src/lib/theme';

export default function HadithList() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getCollections, []);
  const name = (c) => (settings.ui === 'ur' ? c.ur : settings.ui === 'ar' ? c.ar : c.en);
  return (
    <Screen>
      <Header title={t('hadith')} subtitle={t('hadithDesc')} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><TranslationButton /></View>
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList data={data.collections} keyExtractor={(c) => c.id} contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10 }}
          renderItem={({ item: c }) => (
            <Pressable onPress={() => router.push(`/collection/${c.id}`)} accessibilityRole="button" accessibilityLabel={c.en}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c.source === 'openiti' ? colors.goldSoft : colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontFamily: FONTS.arBold }} size={24} color={colors.brandDeep}>{(c.ar.split(' ').pop() || '').replace(/^ال/, '').charAt(0)}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="uiBold" size={17}>{name(c)}</T>
                <T size={13} color={colors.muted}>{c.count.toLocaleString()} {t('hadiths')} · {c.langs.includes(settings.tr?.slice(0, 2)) ? '✓ ' : ''}{c.langs.length > 1 ? `${c.langs.length - 1} ${t('translations').toLowerCase()}` : t('arabicOnly')}</T>
              </View>
              <T style={{ fontFamily: FONTS.ar, writingDirection: 'rtl' }} size={19} color={colors.muted}>{c.ar}</T>
            </Pressable>
          )} />
      )}
    </Screen>
  );
}
