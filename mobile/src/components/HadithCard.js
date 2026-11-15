import React, { memo } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/settings';
import { baseLang, choiceByKey } from '../lib/languages';
import { ArabicText, Card, T, TranslationText } from './ui';

const stripDiacritics = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '');

/** One hadith: Arabic always, then the chosen translation(s). */
function HadithCardImpl({ col, h, onOpen }) {
  const { settings, colors, t } = useApp();
  const ar = settings.harakat ? h.ar : stripDiacritics(h.ar);
  const keys = [settings.tr, settings.tr2].filter(Boolean);
  const name = settings.ui === 'ur' ? col.ur : settings.ui === 'ar' ? col.ar : col.en;
  const title = `${name} ${h.n}`;
  const blocks = keys.map((k) => ({ k, lang: baseLang(k), text: h.t?.[baseLang(k)] })).filter((b, i, a) => a.findIndex((x) => x.lang === b.lang) === i);
  const missing = keys.length && !blocks.some((b) => b.text);
  const share = () => Share.share({ message: [title, h.ar, ...blocks.filter((b) => b.text).map((b) => b.text)].join('\n\n') + '\n\n— DALIL' }).catch(() => {});
  const grade = Array.isArray(h.g) && typeof h.g[0] === 'string' ? h.g[0] : null;
  return (
    <Card style={{ gap: 12 }} onPress={onOpen}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ backgroundColor: colors.brandSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}>
          <T weight="uiBold" size={14} color={colors.brandDeep}>{title}</T>
        </View>
        {grade ? <View style={{ backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}><T size={12.5} weight="uiSemi" color={colors.gold}>{grade}</T></View> : null}
        <View style={{ flex: 1 }} />
        <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={t('share')} hitSlop={10}><Ionicons name="share-outline" size={22} color={colors.muted} /></Pressable>
      </View>
      <ArabicText size={Math.max(22, settings.arSize - 4)}>{ar}</ArabicText>
      {blocks.filter((b) => b.text).map((b) => (
        <View key={b.k} style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 4 }}>
          <T size={12.5} weight="uiBold" color={colors.muted}>{choiceByKey(b.k)?.native}</T>
          <TranslationText lang={b.lang}>{b.text}</TranslationText>
        </View>
      ))}
      {missing ? <T size={13.5} color={colors.muted}>{t('noTranslationHere', { lang: choiceByKey(keys[0])?.english || '' })}</T> : null}
    </Card>
  );
}
export default memo(HadithCardImpl);
