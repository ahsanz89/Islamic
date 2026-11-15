import React, { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../../src/lib/settings';
import { getCollection, getSection } from '../../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, TranslationButton, useAsync, T } from '../../../src/components/ui';
import HadithCard from '../../../src/components/HadithCard';

export default function Section() {
  const { id, sec, focus } = useLocalSearchParams();
  const { t, update, settings, colors } = useApp();
  const router = useRouter();
  const ref = useRef(null);
  const { data, error, loading, reload } = useAsync(async () => ({ col: await getCollection(id), items: await getSection(id, sec) }), [id, sec]);
  const section = data?.col.sections.find((s) => s.id === sec);
  useEffect(() => {
    if (section) update({ lastRead: { href: `/section/${id}/${sec}`, title: `${data.col.en} · ${section.title}` } });
  }, [section?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!data || !focus) return;
    const i = data.items.findIndex((h) => String(h.n) === String(focus));
    if (i > 0) setTimeout(() => ref.current?.scrollToIndex({ index: i, animated: false }), 300);
  }, [data, focus]);
  return (
    <Screen>
      <Header title={section?.title || ''} subtitle={section ? `${section.from}–${section.to}` : ''} onBack={() => router.back()} />
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList ref={ref} data={data.items} keyExtractor={(h) => String(h.n)} initialNumToRender={6} windowSize={7}
          onScrollToIndexFailed={() => {}}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
          ListHeaderComponent={<TranslationButton />}
          renderItem={({ item }) => <HadithCard col={data.col} h={item} />} />
      )}
    </Screen>
  );
}
