import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { cacheSize, clearCache } from '../../src/lib/api';
import { choiceByKey } from '../../src/lib/languages';
import { UI_LANGUAGES } from '../../src/lib/strings';
import { APP_VERSION, PRIVACY_URL, SUPPORT_URL } from '../../src/lib/config';
import { ArabicText, Card, Chip, Header, Screen, SectionTitle, T, TranslationSheet } from '../../src/components/ui';
import { ReciterSheet, reciterLabel } from '../../src/components/ReciterSheet';

function Row({ icon, label, value, onPress, colors }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} ${value || ''}`} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}>
      <Ionicons name={icon} size={22} color={colors.brand} />
      <View style={{ flex: 1 }}>
        <T weight="uiSemi" size={16}>{label}</T>
        {value ? <T size={14} color={colors.muted}>{value}</T> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function Settings() {
  const { colors, t, settings, update } = useApp();
  const [sheet, setSheet] = useState(null);       // 'tr' | 'tr2' | 'reciter'
  const [size, setSize] = useState(0);
  useEffect(() => { cacheSize().then(setSize); }, []);
  const tr = choiceByKey(settings.tr);
  const tr2 = choiceByKey(settings.tr2);
  const mb = (size / 1048576).toFixed(1);
  const clear = async () => { await clearCache(); setSize(0); Alert.alert(t('cleared')); };
  const sep = <View style={{ height: 1, backgroundColor: colors.line }} />;
  return (
    <Screen>
      <Header title={t('settings')} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 60 }}>
        <SectionTitle>{t('translation')}</SectionTitle>
        <Card style={{ paddingVertical: 2 }}>
          <Row colors={colors} icon="language" label={t('translation')} value={tr ? `${tr.native} · ${tr.translator}` : t('arabicOnly')} onPress={() => setSheet('tr')} />
          {sep}
          <Row colors={colors} icon="add-circle-outline" label={t('secondTranslation')} value={tr2 ? `${tr2.native} · ${tr2.translator}` : t('none')} onPress={() => setSheet('tr2')} />
        </Card>
        <T size={13} color={colors.muted} style={{ marginTop: 8 }}>{t('arabicAlways')}</T>

        <SectionTitle>{t('appLanguage')}</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {UI_LANGUAGES.map((l) => <Chip key={l.code} label={l.native} active={settings.ui === l.code} onPress={() => update({ ui: l.code })} />)}
        </View>

        <SectionTitle>{t('theme')}</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {['system', 'light', 'dark'].map((m) => <Chip key={m} label={t(m)} active={settings.theme === m} onPress={() => update({ theme: m })} />)}
        </View>

        <SectionTitle>{t('reading')}</SectionTitle>
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T weight="uiSemi" size={16} style={{ flex: 1 }}>{t('textSize')}</T>
            <Chip label="A−" onPress={() => update({ arSize: Math.max(22, settings.arSize - 2) })} />
            <Chip label="A+" onPress={() => update({ arSize: Math.min(48, settings.arSize + 2) })} />
          </View>
          <ArabicText quran size={settings.arSize} center>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</ArabicText>
          {sep}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T weight="uiSemi" size={16} style={{ flex: 1 }}>{t('harakat')}</T>
            <Switch value={settings.harakat} onValueChange={(v) => update({ harakat: v })} trackColor={{ true: colors.brand, false: colors.border }} accessibilityLabel={t('harakat')} />
          </View>
        </Card>

        <SectionTitle>{t('quran')}</SectionTitle>
        <Card style={{ paddingVertical: 2 }}>
          <Row colors={colors} icon="mic" label={t('reciter')} value={reciterLabel(settings.reciter)} onPress={() => setSheet('reciter')} />
          {sep}
          <View style={{ paddingVertical: 14, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <T weight="uiSemi" size={16} style={{ flex: 1 }}>{t('urduAudio')}</T>
              <Switch value={settings.urduAudio} onValueChange={(v) => update({ urduAudio: v })} trackColor={{ true: colors.brand, false: colors.border }} accessibilityLabel={t('urduAudio')} />
            </View>
            <T size={13} color={colors.muted}>{t('urduAudioHint')}</T>
          </View>
        </Card>

        <SectionTitle>{t('storage')}</SectionTitle>
        <Card style={{ paddingVertical: 2 }}>
          {Platform.OS === 'web' ? <T color={colors.muted} style={{ paddingVertical: 14 }}>—</T> : <Row colors={colors} icon="trash-outline" label={t('clearCache')} value={`${mb} MB`} onPress={clear} />}
        </Card>

        <SectionTitle>{t('about')}</SectionTitle>
        <Card style={{ gap: 6 }}>
          <T weight="uiBlack" size={20} color={colors.brandDeep} style={{ letterSpacing: 3 }}>DALIL</T>
          <T size={14} color={colors.muted}>{t('tagline')} {t('tagline2')}</T>
          <T size={14} style={{ marginTop: 6 }}>{t('aboutText')}</T>
        </Card>
        <Card style={{ paddingVertical: 2, marginTop: 10 }}>
          <Row colors={colors} icon="shield-checkmark-outline" label={t('privacy')} onPress={() => Linking.openURL(PRIVACY_URL)} />
          {sep}
          <Row colors={colors} icon="help-buoy-outline" label={t('support')} onPress={() => Linking.openURL(SUPPORT_URL)} />
          {sep}
          <Row colors={colors} icon="information-circle-outline" label={t('version')} value={APP_VERSION} onPress={() => {}} />
        </Card>
      </ScrollView>
      <TranslationSheet visible={sheet === 'tr' || sheet === 'tr2'} startSecond={sheet === 'tr2'} onClose={() => setSheet(null)} />
      <ReciterSheet visible={sheet === 'reciter'} onClose={() => setSheet(null)} />
    </Screen>
  );
}
