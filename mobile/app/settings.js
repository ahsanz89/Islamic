import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Switch, View } from 'react-native';
import { useApp } from '../src/lib/settings';
import { cacheSize, clearCache } from '../src/lib/api';
import { choiceByKey } from '../src/lib/languages';
import { UI_LANGUAGES } from '../src/lib/strings';
import { APP_VERSION, PRIVACY_URL, SUPPORT_URL } from '../src/lib/config';
import { ArabicText, Button, Screen, TranslationSheet } from '../src/components/ui';
import { T } from '../src/components/text';
import { LeadingBadge, ListGroup, ListItem, Segmented, TopAppBar } from '../src/components/m3';
import { useRouter } from 'expo-router';
import { ReciterSheet, reciterLabel } from '../src/components/ReciterSheet';
import { rescheduleAll } from '../src/lib/notify';

export default function Settings() {
  const { colors, t, settings, update } = useApp();
  const router = useRouter();
  const [sheet, setSheet] = useState(null);       // 'tr' | 'tr2' | 'reciter'
  const [size, setSize] = useState(0);
  useEffect(() => { cacheSize().then(setSize); }, []);
  const tr = choiceByKey(settings.tr);
  const tr2 = choiceByKey(settings.tr2);
  const mb = (size / 1048576).toFixed(1);
  const clear = async () => { await clearCache(); setSize(0); Alert.alert(t('cleared')); };
  const sw = (value, onValueChange, label) => <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.surfaceHighest }} thumbColor={value ? colors.onPrimary : colors.outline} accessibilityLabel={label} />;
  return (
    <Screen>
      <TopAppBar title={t('settings')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <ListGroup title={t('translation')}>
          <ListItem onPress={() => setSheet('tr')} leading={<LeadingBadge icon="language" />} headline={t('translation')} supporting={tr ? `${tr.native} · ${tr.translator}` : t('arabicOnly')} divider />
          <ListItem onPress={() => setSheet('tr2')} leading={<LeadingBadge icon="add-circle-outline" tone="neutral" />} headline={t('secondTranslation')} supporting={tr2 ? `${tr2.native} · ${tr2.translator}` : t('none')} />
        </ListGroup>
        <T variant="bodySmall" color={colors.muted} style={{ paddingHorizontal: 32, paddingTop: 8 }}>{t('arabicAlways')}</T>

        <ListGroup title={t('appLanguage')}>
          <View style={{ padding: 16 }}><Segmented value={settings.ui} onChange={(v) => update({ ui: v })} options={UI_LANGUAGES.map((l) => [l.code, l.native])} /></View>
        </ListGroup>

        <ListGroup title={t('theme')}>
          <View style={{ padding: 16 }}><Segmented value={settings.theme} onChange={(v) => update({ theme: v })} options={['system', 'light', 'dark'].map((m) => [m, t(m), { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' }[m]])} /></View>
        </ListGroup>

        <ListGroup title={t('reading')}>
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <T variant="titleMedium" style={{ flex: 1 }}>{t('textSize')}</T>
              <Button kind="tonal" label="A−" onPress={() => update({ arSize: Math.max(22, settings.arSize - 2) })} style={{ minWidth: 64, paddingHorizontal: 12 }} />
              <Button kind="tonal" label="A+" onPress={() => update({ arSize: Math.min(48, settings.arSize + 2) })} style={{ minWidth: 64, paddingHorizontal: 12 }} />
            </View>
            <ArabicText quran size={settings.arSize} center>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</ArabicText>
          </View>
          <ListItem divider={false} headline={t('harakat')} trailing={sw(settings.harakat, (v) => update({ harakat: v }), t('harakat'))} style={{ borderTopWidth: 1, borderTopColor: colors.outlineVariant }} />
        </ListGroup>

        <ListGroup title="Offline">
          <ListItem onPress={() => router.push('/downloads')} leading={<LeadingBadge icon="download-outline" />} headline="Download Manager" supporting="Download the Quran, hadith, recitations and more to use without internet." />
        </ListGroup>

        <ListGroup title="Daily reading">
          <ListItem leading={<LeadingBadge icon="notifications-outline" />} headline="Daily reminder" supporting="One gentle notification a day to keep your reading streak."
            trailing={sw(!!settings.dailyReminder?.on, async (v) => { const dr = { ...(settings.dailyReminder || { hour: 8, minute: 0 }), on: v }; update({ dailyReminder: dr }); await rescheduleAll({ ...settings, dailyReminder: dr }); }, 'Daily reminder')} divider />
          {settings.dailyReminder?.on ? (
            <View style={{ padding: 16, gap: 8 }}>
              <T variant="labelLarge" color={colors.muted}>Time</T>
              <Segmented value={String(settings.dailyReminder.hour)} onChange={async (v) => { const dr = { ...settings.dailyReminder, hour: Number(v), minute: 0 }; update({ dailyReminder: dr }); await rescheduleAll({ ...settings, dailyReminder: dr }); }}
                options={[['8', '8 AM', 'sunny-outline'], ['14', '2 PM', 'partly-sunny-outline'], ['20', '8 PM', 'moon-outline']]} />
            </View>
          ) : null}
          <View style={{ padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
            <T variant="labelLarge" color={colors.muted}>Daily goal (ayat or hadith)</T>
            <Segmented value={String(settings.streak?.goal || 5)} onChange={(v) => update({ streak: { ...(settings.streak || { days: {} }), goal: Number(v) } })}
              options={[['3', '3'], ['5', '5'], ['10', '10'], ['20', '20']]} />
          </View>
        </ListGroup>

        <ListGroup title="Quran reading layout">
          <View style={{ padding: 16, gap: 8 }}>
            <Segmented value={settings.quranMode === 'mushaf' ? 'mushaf' : 'standard'} onChange={(v) => update({ quranMode: v })} options={[['standard', 'Standard view', 'list-outline'], ['mushaf', '15-line Mushaf', 'book-outline']]} />
            <T variant="bodySmall" color={colors.muted}>The 15-line Mushaf shows the Quran page by page, line by line, like the printed Madinah Mushaf. Your place is kept when you switch.</T>
          </View>
        </ListGroup>

        <ListGroup title={t('quran')}>
          <ListItem onPress={() => setSheet('reciter')} leading={<LeadingBadge icon="mic" />} headline={t('reciter')} supporting={reciterLabel(settings.reciter)} divider />
          <ListItem headline={t('urduAudio')} supporting={t('urduAudioHint')} trailing={sw(settings.urduAudio, (v) => update({ urduAudio: v }), t('urduAudio'))} />
        </ListGroup>

        <ListGroup title={t('storage')}>
          {Platform.OS === 'web' ? <ListItem headline="—" /> : <ListItem onPress={clear} leading={<LeadingBadge icon="trash-outline" tone="neutral" />} headline={t('clearCache')} supporting={`${mb} MB`} />}
        </ListGroup>

        <ListGroup title={t('about')}>
          <View style={{ padding: 16, gap: 6 }}>
            <T weight="uiBlack" size={20} color={colors.onPrimaryContainer} style={{ letterSpacing: 3 }}>DALIL</T>
            <T variant="bodyMedium" color={colors.muted}>{t('tagline')} {t('tagline2')}</T>
            <T variant="bodyMedium" style={{ marginTop: 6 }}>{t('aboutText')}</T>
          </View>
        </ListGroup>
        <ListGroup style={{ marginTop: 12 }}>
          <ListItem onPress={() => Linking.openURL(PRIVACY_URL)} leading={<LeadingBadge icon="shield-checkmark-outline" tone="neutral" />} headline={t('privacy')} divider />
          <ListItem onPress={() => Linking.openURL(SUPPORT_URL)} leading={<LeadingBadge icon="help-buoy-outline" tone="neutral" />} headline={t('support')} divider />
          <ListItem leading={<LeadingBadge icon="information-circle-outline" tone="neutral" />} headline={t('version')} supporting={APP_VERSION} />
        </ListGroup>
      </ScrollView>
      <TranslationSheet visible={sheet === 'tr' || sheet === 'tr2'} startSecond={sheet === 'tr2'} onClose={() => setSheet(null)} />
      <ReciterSheet visible={sheet === 'reciter'} onClose={() => setSheet(null)} />
    </Screen>
  );
}
