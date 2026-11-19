import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { SD, catName, matches, titleOf, tx } from '../../src/lib/special-duas';
import { useDuaFavs } from '../../src/lib/dua-favs';
import { Screen } from '../../src/components/ui';
import { T } from '../../src/components/text';
import { ChipRow, FilterChip, SearchBar, TopAppBar } from '../../src/components/m3';
import { SHAPE } from '../../src/lib/theme';

export function GradePill({ d, ui }) {
  const { colors } = useApp();
  const t = tx(ui);
  const c = d.grade.class || '';
  const good = c === 's' || c === 'q';
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: good ? colors.brandSoft : colors.line }}>
      <T size={12} weight="uiBold" color={good ? colors.brandDeep : colors.ink}>{c === 'q' ? t.grade.q : t.grade[c] || d.grade.label}{d.grade.differ ? ' *' : ''}</T>
    </View>
  );
}

export default function SpecialDuas() {
  const { colors, settings } = useApp();
  const router = useRouter();
  const ui = settings.ui; const t = tx(ui); const rtl = ui === 'ur';
  const { isFav, toggle, favs } = useDuaFavs();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [kind, setKind] = useState('all');
  const [onlyFav, setOnlyFav] = useState(false);
  const list = useMemo(() => SD.duas.filter((d) => matches(d, q, cat, kind) && (!onlyFav || favs.includes(d.id))), [q, cat, kind, onlyFav, favs]);
  const dir = { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' };
  return (
    <Screen>
      <TopAppBar title={t.section} onBack={() => router.back()} />
      <FlatList
        data={list} keyExtractor={(d) => d.id} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10, paddingBottom: 40 }}
        ListHeaderComponent={(
          <View style={{ gap: 12, paddingBottom: 6, marginHorizontal: -16 }}>
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              <T variant="bodyMedium" color={colors.muted} style={dir}>{t.sub}</T>
              <SearchBar value={q} onChangeText={setQ} placeholder={t.search} testID="search" />
            </View>
            <ChipRow>
              {[['all', t.all], ['hadith', t.fromHadith], ['quran', t.fromQuran]].map(([k, l]) => <FilterChip key={k} label={l} selected={kind === k} onPress={() => setKind(k)} />)}
              <FilterChip label={`${t.save} (${favs.length})`} icon="bookmark-outline" selected={onlyFav} onPress={() => setOnlyFav(!onlyFav)} />
            </ChipRow>
            <ChipRow>
              <FilterChip label={t.all} selected={cat === 'all'} onPress={() => setCat('all')} />
              {SD.cats.map((c) => <FilterChip key={c.id} label={catName(c, ui)} selected={cat === c.id} onPress={() => setCat(c.id)} />)}
            </ChipRow>
            <View style={{ marginHorizontal: 16, padding: 12, borderRadius: SHAPE.m, backgroundColor: colors.tertiaryContainer }}><T variant="bodySmall" color={colors.onTertiaryContainer} style={dir}>{t.note}</T></View>
            <T variant="bodySmall" color={colors.muted} style={[dir, { paddingHorizontal: 16 }]}>{t.count(list.length)}</T>
          </View>
        )}
        ListEmptyComponent={<T color={colors.muted} style={{ textAlign: 'center', padding: 24 }}>{t.none}</T>}
        renderItem={({ item: d }) => (
          <Pressable onPress={() => router.push(`/special-duas/${d.id}`)} accessibilityRole="button" accessibilityLabel={titleOf(d, ui)} style={({ pressed }) => ({ padding: 16, borderRadius: SHAPE.l, gap: 10, backgroundColor: colors.surfaceMid, opacity: pressed ? 0.85 : 1 })}>
            <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              <T weight="uiBold" size={16} style={[{ flex: 1 }, dir]}>{titleOf(d, ui)}</T>
              <GradePill d={d} ui={ui} />
              <Pressable onPress={() => toggle(d.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${t.save}: ${titleOf(d, ui)}`} accessibilityState={{ selected: isFav(d.id) }}>
                <Ionicons name={isFav(d.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.brand} />
              </Pressable>
            </View>
            <T lang="ar" size={22} style={{ fontFamily: 'AmiriQuran_400Regular', textAlign: 'right', writingDirection: 'rtl', lineHeight: 40 }} numberOfLines={2}>{d.ar}</T>
            <T size={12.5} color={colors.muted}>{d.src.book} {d.src.ref}</T>
          </Pressable>
        )}
      />
    </Screen>
  );
}
