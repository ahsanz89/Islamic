import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { getSurahs } from '../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, T, TranslationButton, useAsync } from '../../src/components/ui';
import { FONTS } from '../../src/lib/theme';

export default function QuranList() {
  const { colors, t } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getSurahs, []);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = data?.surahs || [];
    const term = q.trim().toLowerCase();
    if (!term) return s;
    return s.filter((x) => String(x.n) === term || `${x.name} ${x.en} ${x.ar}`.toLowerCase().includes(term));
  }, [data, q]);
  return (
    <Screen>
      <Header title={t('quran')} subtitle={t('quranDesc')} />
      <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 8 }}>
        <TranslationButton />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder={t('searchSurah')} placeholderTextColor={colors.muted} autoCorrect={false}
            style={{ flex: 1, fontFamily: FONTS.ui, fontSize: 16, color: colors.ink }} accessibilityLabel={t('search')} />
        </View>
      </View>
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList data={list} keyExtractor={(s) => String(s.n)} contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10 }}
          renderItem={({ item: s }) => (
            <Pressable onPress={() => router.push(`/surah/${s.n}`)} accessibilityRole="button" accessibilityLabel={`${s.n}. ${s.name}`}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T weight="uiBold" size={15} color={colors.brandDeep}>{s.n}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="uiBold" size={17}>{s.name}</T>
                <T size={13} color={colors.muted}>{s.en} · {s.verses} {t('verses')} · {s.place === 'Mecca' ? t('meccan') : t('medinan')}</T>
              </View>
              <T style={{ fontFamily: FONTS.quran, writingDirection: 'rtl' }} size={22} color={colors.brandDeep}>{s.ar.replace('سُوْرَةُ ', '').replace('سُورَةُ ', '')}</T>
            </Pressable>
          )} />
      )}
    </Screen>
  );
}
