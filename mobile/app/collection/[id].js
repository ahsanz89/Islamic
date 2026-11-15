import React, { useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import { getCollection } from '../../src/lib/api';
import { Button, ErrorBox, Header, Loader, Screen, T, TranslationButton, useAsync } from '../../src/components/ui';
import { FONTS } from '../../src/lib/theme';

export default function Collection() {
  const { id } = useLocalSearchParams();
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data: col, error, loading, reload } = useAsync(() => getCollection(id), [id]);
  const [num, setNum] = useState('');
  const go = () => {
    const n = Number(num);
    const sec = col?.sections.find((s) => n >= s.from && n <= s.to);
    if (sec) router.push({ pathname: `/section/${id}/${sec.id}`, params: { focus: String(n) } });
  };
  const name = col ? (settings.ui === 'ur' ? col.ur : settings.ui === 'ar' ? col.ar : col.en) : '';
  return (
    <Screen>
      <Header title={name} subtitle={col ? `${col.count.toLocaleString()} ${t('hadiths')}` : ''} onBack={() => router.back()} />
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList data={col.sections} keyExtractor={(s) => s.id} contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10 }}
          ListHeaderComponent={(
            <View style={{ gap: 12, marginBottom: 6 }}>
              <TranslationButton />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput value={num} onChangeText={setNum} keyboardType="number-pad" placeholder={`${t('goToNumber')} (1–${col.count})`} placeholderTextColor={colors.muted} accessibilityLabel={t('goToNumber')}
                  style={{ flex: 1, height: 50, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: FONTS.ui, fontSize: 16, color: colors.ink }} />
                <Button label={t('go')} onPress={go} style={{ minHeight: 50, paddingHorizontal: 20 }} />
              </View>
              <T weight="uiBold" size={13} color={colors.gold} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>{t('chapters')} · {col.sections.length}</T>
            </View>
          )}
          renderItem={({ item: s }) => (
            <Pressable onPress={() => router.push(`/section/${id}/${s.id}`)} accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}>
              <View style={{ minWidth: 38, height: 38, borderRadius: 11, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                <T weight="uiBold" size={13} color={colors.brandDeep}>{s.id}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="uiSemi" size={16} numberOfLines={2}>{s.title}</T>
                <T size={12.5} color={colors.muted}>{s.count} {t('hadiths')} · {s.from}–{s.to}</T>
              </View>
            </Pressable>
          )} />
      )}
    </Screen>
  );
}
