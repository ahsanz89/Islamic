import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/lib/settings';
import { getSurahs } from '../../src/lib/api';
import { ErrorBox, Loader, Screen, TranslationButton, useAsync } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { Fab, LeadingBadge, ListItem, SearchBar, TopAppBar, openDrawer } from '../../src/components/m3';
import { FONTS } from '../../src/lib/theme';

export default function QuranList() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getSurahs, []);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = data?.surahs || [];
    const term = q.trim().toLowerCase();
    if (!term) return s;
    return s.filter((x) => String(x.n) === term || `${x.name} ${x.en} ${x.ar}`.toLowerCase().includes(term));
  }, [data, q]);
  const last = settings.lastRead;
  return (
    <Screen>
      <TopAppBar title={t('quran')} subtitle={t('quranDesc')} onMenu={openDrawer} />
      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 12 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={t('searchSurah')} testID="surah-search" />
        <TranslationButton />
      </View>
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList data={list} keyExtractor={(s) => String(s.n)} contentContainerStyle={{ paddingBottom: last ? 96 : 24 }}
          renderItem={({ item: s }) => (
            <ListItem onPress={() => router.push(`/surah/${s.n}`)} label={`${s.n}. ${s.name}`} divider
              leading={<LeadingBadge>{s.n}</LeadingBadge>}
              headline={s.name}
              supporting={`${s.en} · ${s.verses} ${t('verses')} · ${s.place === 'Mecca' ? t('meccan') : t('medinan')}`}
              trailing={<T style={{ fontFamily: FONTS.quran, writingDirection: 'rtl' }} size={24} color={colors.primary}>{s.ar.replace('سُوْرَةُ ', '').replace('سُورَةُ ', '')}</T>} />
          )} />
      )}
      {last ? <Fab icon="play" label={t('continueReading')} onPress={() => router.push(last.href)} /> : null}
    </Screen>
  );
}
