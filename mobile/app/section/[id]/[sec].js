import React, { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../../src/lib/settings';
import { getCollection, getSection } from '../../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, TranslationButton, useAsync, T } from '../../../src/components/ui';
import HadithCard from '../../../src/components/HadithCard';
import { saveHadith } from '../../../src/lib/reading-progress';
import { MissingLanguageNotice } from '../../../src/components/OfflineBits';

export default function Section() {
  const { id, sec, focus } = useLocalSearchParams();
  const { t, update, settings, colors } = useApp();
  const router = useRouter();
  const ref = useRef(null);
  const need = [settings.tr, settings.tr2].filter(Boolean).map((k) => k.slice(0, 2)).filter((k, i, a) => a.indexOf(k) === i);
  const { data, error, loading, reload } = useAsync(async () => ({ col: await getCollection(id), items: await getSection(id, sec, need) }), [id, sec, need.join(',')]);
  const section = data?.col.sections.find((s) => s.id === sec);
  // Hadith history: book, chapter and the hadith at the top of the screen. Separate from the Quran history.
  const topN = useRef(Number(focus) > 0 ? Number(focus) : 0);
  const [tick, setTick] = useState(0);
  const onViewable = useRef(({ viewableItems }) => {
    const first = viewableItems.filter((x) => x.isViewable && x.item).map((x) => Number(x.item.n)).filter(Boolean).sort((a, b) => a - b)[0];
    if (first && first !== topN.current) { topN.current = first; setTick((x) => x + 1); }
  }).current;
  useEffect(() => {
    if (!section) return undefined;
    const timer = setTimeout(() => {
      const patch = saveHadith({ col: String(id), sec: String(sec), n: topN.current || Number(data.items[0]?.n) || 0, title: `${data.col.en} · ${section.title}` });
      if (patch) update(patch);
    }, 600);
    return () => clearTimeout(timer);
  }, [section?.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!data || !focus) return;
    const i = data.items.findIndex((h) => String(h.n) === String(focus));
    if (i >= 0) setTimeout(() => ref.current?.scrollToIndex({ index: i, animated: false }), 300);
  }, [data, focus]);
  return (
    <Screen>
      <Header title={section?.title || ''} subtitle={section ? `${section.from}–${section.to}` : ''} onBack={() => router.back()} />
      <MissingLanguageNotice rel={`c/${id}/${sec}.json`} need={need} what="language" />
      {loading ? <Loader /> : error ? <ErrorBox onRetry={reload} /> : (
        <FlatList ref={ref} data={data.items} keyExtractor={(h) => String(h.n)} initialNumToRender={6} windowSize={7}
          onScrollToIndexFailed={() => {}} onViewableItemsChanged={onViewable} viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
          ListHeaderComponent={<TranslationButton />}
          renderItem={({ item }) => <HadithCard col={data.col} h={item} />} />
      )}
    </Screen>
  );
}
