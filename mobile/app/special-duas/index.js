import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { SD, catName, matches, titleOf, tx } from '../../src/lib/special-duas';
import { useDuaFavs } from '../../src/lib/dua-favs';
import { Chip, Header, Screen, T } from '../../src/components/ui';

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
      <Header title={t.title} onBack={() => router.back()} />
      <FlatList
        data={list} keyExtractor={(d) => d.id} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10, paddingBottom: 40 }}
        ListHeaderComponent={(
          <View style={{ gap: 10, paddingBottom: 6 }}>
            <T color={colors.muted} style={dir}>{t.sub}</T>
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}><T size={13.5} style={dir}>{t.note}</T></View>
            <TextInput value={q} onChangeText={setQ} placeholder={t.search} placeholderTextColor={colors.muted} accessibilityLabel={t.search} testID="search" style={[{ minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.ink, fontSize: 16 }, dir]} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[['all', t.all], ['hadith', t.fromHadith], ['quran', t.fromQuran]].map(([k, l]) => <Chip key={k} label={l} active={kind === k} onPress={() => setKind(k)} />)}
              <Chip label={`${t.save} (${favs.length})`} active={onlyFav} onPress={() => setOnlyFav(!onlyFav)} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label={t.all} active={cat === 'all'} onPress={() => setCat('all')} />
              {SD.cats.map((c) => <Chip key={c.id} label={catName(c, ui)} active={cat === c.id} onPress={() => setCat(c.id)} />)}
            </View>
            <T size={13} color={colors.muted} style={dir}>{t.count(list.length)}</T>
          </View>
        )}
        ListEmptyComponent={<T color={colors.muted} style={{ textAlign: 'center', padding: 24 }}>{t.none}</T>}
        renderItem={({ item: d }) => (
          <Pressable onPress={() => router.push(`/special-duas/${d.id}`)} accessibilityRole="button" accessibilityLabel={titleOf(d, ui)} style={({ pressed }) => ({ padding: 14, borderRadius: 16, gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.8 : 1 })}>
            <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              <T weight="uiBold" size={16} style={[{ flex: 1 }, dir]}>{titleOf(d, ui)}</T>
              <GradePill d={d} ui={ui} />
              <Pressable onPress={() => toggle(d.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${t.save}: ${titleOf(d, ui)}`} accessibilityState={{ selected: isFav(d.id) }}>
                <Ionicons name={isFav(d.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.brand} />
              </Pressable>
            </View>
            <T quran lang="ar" size={22} style={{ textAlign: 'right', writingDirection: 'rtl', lineHeight: 40 }} numberOfLines={2}>{d.ar}</T>
            <T size={12.5} color={colors.muted}>{d.src.book} {d.src.ref}</T>
          </Pressable>
        )}
      />
    </Screen>
  );
}
