import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getHadith } from '../../src/lib/api';
import { ErrorBox, Header, Loader, Screen, T, TranslationButton, useAsync } from '../../src/components/ui';
import HadithCard from '../../src/components/HadithCard';

export default function Dua() {
  const { c, n, sec, title } = useLocalSearchParams();
  const router = useRouter();
  const { data, error, loading, reload } = useAsync(() => getHadith(c, Number(n), sec), [c, n, sec]);
  return (
    <Screen>
      <Header title={String(title || '')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <TranslationButton />
        {loading ? <Loader /> : error || !data?.h ? <ErrorBox onRetry={reload} /> : <HadithCard col={data.col} h={data.h} />}
      </ScrollView>
    </Screen>
  );
}
