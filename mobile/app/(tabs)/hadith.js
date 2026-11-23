import React from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OfflineBanner, OfflineMark, useOfflineVersion } from '../../src/components/OfflineBits';
import { useApp } from '../../src/lib/settings';
import { getCollections } from '../../src/lib/api';
import { ErrorBox, Loader, Screen, TranslationButton, useAsync } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { LeadingBadge, ListItem, TopAppBar, openDrawer } from '../../src/components/m3';
import { FONTS } from '../../src/lib/theme';

import * as store from '../../src/lib/offline-store';
export default function HadithList() {
  const { colors, t, settings } = useApp();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(getCollections, []);
  useOfflineVersion();
  const name = (c) => (settings.ui === 'ur' ? c.ur : settings.ui === 'ar' ? c.ar : c.en);
  return (
    <Screen>
      <TopAppBar title={t('hadith')} subtitle={t('hadithDesc')} onMenu={openDrawer} />
      <OfflineBanner />
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}><TranslationButton /></View>
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList data={data.collections} keyExtractor={(c) => c.id} contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item: c }) => (
            <ListItem onPress={() => router.push(`/collection/${c.id}`)} label={c.en} divider
              leading={<LeadingBadge tone={c.source === 'openiti' ? 'gold' : 'primary'}><T style={{ fontFamily: FONTS.arBold }} size={24} color={colors.onPrimaryContainer}>{(c.ar.split(' ').pop() || '').replace(/^ال/, '').charAt(0)}</T></LeadingBadge>}
              headline={name(c)}
              supporting={`${c.count.toLocaleString()} ${t('hadiths')} · ${c.langs.includes(settings.tr?.slice(0, 2)) ? '✓ ' : ''}${c.langs.length > 1 ? `${c.langs.length - 1} ${t('translations').toLowerCase()}` : t('arabicOnly')}`}
              trailing={<View style={{ alignItems: 'center', gap: 2 }}><T style={{ fontFamily: FONTS.ar, writingDirection: 'rtl' }} size={19} color={colors.muted}>{c.ar}</T><OfflineMark ready={store.has(`c/${c.id}.json`) && store.countWhere((r) => r.startsWith(`c/${c.id}/`)) > 0} /></View>} />
          )} />
      )}
    </Screen>
  );
}
