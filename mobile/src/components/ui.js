import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/settings';
import { FONTS, MAX_WIDTH, RADIUS, SHAPE, SPACE } from '../lib/theme';
import { TRANSLATION_CHOICES, choiceByKey } from '../lib/languages';
import { useAudio } from '../lib/audio';
import * as audio from '../lib/audio';
import { reciterById } from '../lib/reciters';
import { T } from './text';
import { BottomSheet, FilterChip, TopAppBar, ripple } from './m3';
export { T };

/** Standard screen: safe area + themed background. */
export function Screen({ children, edges = ['top'], style }) {
  const { colors } = useApp();
  // Content is centred and capped in width so tablets and landscape stay readable.
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      <View style={{ flex: 1, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' }}>{children}</View>
    </SafeAreaView>
  );
}

export function ArabicText({ children, size = 30, quran = false, style, center }) {
  const { colors } = useApp();
  return (
    <Text selectable style={[{ fontFamily: quran ? FONTS.quran : FONTS.ar, fontSize: size, lineHeight: Math.round(size * 2.0), color: colors.ink, writingDirection: 'rtl', textAlign: center ? 'center' : 'right', alignSelf: 'stretch' }, style]}>
      {children}
    </Text>
  );
}

/** A translation paragraph in the right font / direction for its language. */
export function TranslationText({ lang, children, size = 17 }) {
  const { colors } = useApp();
  if (lang === 'ur') {
    return <Text selectable style={{ fontFamily: FONTS.urMedium, fontSize: size + 3, lineHeight: Math.round((size + 3) * 2.1), color: colors.ink, writingDirection: 'rtl', textAlign: 'right' }}>{children}</Text>;
  }
  return <Text selectable style={{ fontFamily: FONTS.ui, fontSize: size, lineHeight: Math.round(size * 1.55), color: colors.ink }}>{children}</Text>;
}

/** M3 card. kind: 'filled' (default, tonal surface), 'outlined', 'elevated'. */
export function Card({ children, style, onPress, accessibilityLabel, kind = 'filled' }) {
  const { colors } = useApp();
  const base = {
    borderRadius: SHAPE.l, padding: SPACE.l,
    backgroundColor: kind === 'elevated' ? colors.surface : kind === 'outlined' ? colors.bg : colors.surfaceMid,
    ...(kind === 'outlined' ? { borderWidth: 1, borderColor: colors.outlineVariant } : null),
    ...(kind === 'elevated' ? Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, default: { elevation: 2 } }) : null)
  };
  if (onPress) return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} {...ripple(colors)} style={({ pressed }) => [base, pressed && { opacity: 0.88 }, style]}>{children}</Pressable>;
  return <View style={[base, style]}>{children}</View>;
}

/** Filter chip (kept under the old name so every screen picks up the Material 3 look). */
export function Chip({ label, active, onPress, icon }) {
  return <FilterChip label={label} selected={active} onPress={onPress} icon={icon} />;
}

/** M3 buttons: primary = filled, tonal, secondary = outlined, ghost = text. */
export function Button({ label, onPress, kind = 'primary', icon, disabled, style }) {
  const { colors } = useApp();
  const filled = kind === 'primary', tonal = kind === 'tonal', outlined = kind === 'secondary';
  const fg = filled ? colors.onPrimary : tonal ? colors.onPrimaryContainer : colors.primary;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} {...ripple(colors)}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, paddingHorizontal: 24, borderRadius: SHAPE.full, backgroundColor: filled ? colors.primary : tonal ? colors.primaryContainer : 'transparent', borderWidth: outlined ? 1 : 0, borderColor: colors.outline, opacity: disabled ? 0.45 : pressed ? 0.88 : 1 }, style]}>
      {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
      <T variant="labelLarge" size={15} weight="uiSemi" color={fg}>{label}</T>
    </Pressable>
  );
}

export function Loader({ label }) {
  const { colors, t } = useApp();
  return <View style={{ padding: 48, alignItems: 'center', gap: 12 }}><ActivityIndicator color={colors.brand} /><T color={colors.muted} size={15}>{label || t('loading')}</T></View>;
}

export function ErrorBox({ onRetry }) {
  const { colors, t } = useApp();
  return (
    <View style={{ padding: 32, alignItems: 'center', gap: 14 }}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.muted} />
      <T weight="uiSemi" size={18}>{t('errorTitle')}</T>
      <T color={colors.muted} size={15} style={{ textAlign: 'center' }}>{t('offline')}</T>
      <Button kind="secondary" label={t('retry')} icon="refresh" onPress={onRetry} />
    </View>
  );
}

/** Loads async data once per key; exposes loading / error / reload. */
export function useAsync(fn, deps) {
  const [s, setS] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setS((p) => ({ ...p, loading: true, error: null }));
    fn().then((data) => alive && setS({ data, error: null, loading: false })).catch((error) => alive && setS({ data: null, error, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...s, reload: useCallback(() => setTick((x) => x + 1), []) };
}

/** Top app bar. Kept under the old name; pass onBack for a back arrow or onMenu for the drawer. */
export function Header({ title, subtitle, right, onBack, onMenu, large }) {
  return <TopAppBar title={title} subtitle={subtitle} onBack={onBack} onMenu={onMenu} actions={right} large={large} />;
}

/* ------------------------------------------------------------------ translation picking */

/** Radio list of every translation. Used on the first screen, in Settings and in the quick-switch sheet. */
export function TranslationList({ value, onChange, allowNone = true, noneLabel }) {
  const { colors, t } = useApp();
  const rows = [];
  if (allowNone) rows.push({ key: '', native: noneLabel || t('arabicOnly'), english: '', translator: '', none: true });
  rows.push(...TRANSLATION_CHOICES);
  return (
    <View style={{ gap: 10 }}>
      {rows.map((c) => {
        const on = value === c.key;
        return (
          <Pressable key={c.key || 'none'} onPress={() => onChange(c.key)} accessibilityRole="radio" accessibilityState={{ selected: on }}
            accessibilityLabel={`${c.native} ${c.english} ${c.translator}`}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: RADIUS.m, borderWidth: on ? 2 : 1, borderColor: on ? colors.brand : colors.line, backgroundColor: on ? colors.primaryContainer : colors.surfaceMid, opacity: pressed ? 0.85 : 1 }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <T weight="uiBold" size={c.rtl ? 22 : 19} style={c.rtl ? { fontFamily: FONTS.urMedium, writingDirection: 'rtl', textAlign: 'left', lineHeight: 40 } : null}>{c.native}</T>
              {c.none ? <T size={13} color={colors.muted}>{t('arabicAlways')}</T> : <T size={13} color={colors.muted}>{c.english} · {c.translator}</T>}
            </View>
            <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={24} color={on ? colors.brand : colors.border} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Bottom sheet to change the translation from the reading screens. */
export function TranslationSheet({ visible, onClose, withSecond = true, startSecond = false }) {
  const { settings, update, colors, t } = useApp();
  const [second, setSecond] = useState(startSecond);
  useEffect(() => { if (visible) setSecond(startSecond); }, [visible, startSecond]);
  return (
    <BottomSheet visible={visible} onClose={onClose} doneLabel={t('done')} title={second ? t('secondTranslation') : t('changeTranslation')}>
      <T size={14} color={colors.muted}>{t('arabicAlways')}</T>
      <TranslationList value={second ? settings.tr2 : settings.tr} onChange={(k) => update(second ? { tr2: k } : { tr: k })} noneLabel={second ? t('none') : t('arabicOnly')} />
      {withSecond ? (
        <Pressable onPress={() => setSecond(!second)} accessibilityRole="button" style={{ paddingVertical: 12 }}>
          <T weight="uiSemi" color={colors.primary}>{second ? `← ${t('translation')}` : `+ ${t('secondTranslation')}${settings.tr2 ? `: ${choiceByKey(settings.tr2)?.native}` : ''}`}</T>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}

/** The always-visible "Translation: اردو ▾" button at the top of reading screens. */
export function TranslationButton() {
  const { settings, colors, t } = useApp();
  const [open, setOpen] = useState(false);
  const c = choiceByKey(settings.tr);
  const second = choiceByKey(settings.tr2);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={t('changeTranslation')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.primaryContainer }}>
        <Ionicons name="language" size={18} color={colors.onPrimaryContainer} />
        <T size={14} weight="uiSemi" color={colors.onPrimaryContainer}>{t('quick')} {c ? c.native : t('arabicOnly')}{second ? ` + ${second.native}` : ''}</T>
        <Ionicons name="chevron-down" size={16} color={colors.onPrimaryContainer} />
      </Pressable>
      <TranslationSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ audio mini player */
export function MiniPlayer() {
  const { colors, t, settings } = useApp();
  const q = useAudio((s) => s.q);
  const status = useAudio((s) => s.status);
  const phase = useAudio((s) => s.phase);
  const err = useAudio((s) => s.err);
  if (!q) return null;
  const playing = status === 'playing' || status === 'loading';
  const where = q.whole ? q.surah.name : q.v === 0 ? `${q.surah.name} · Bismillah` : `${q.surah.name} · ${t('ayah')} ${q.v}/${q.surah.verses}`;
  const sub = status === 'error' ? t('offline') : phase === 'urdu' ? t('urduNow') : reciterById(settings.reciter).en;
  const Btn = ({ icon, onPress, label, big, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={{ width: big ? 46 : 38, height: big ? 46 : 38, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: big ? colors.brand : 'transparent', opacity: disabled ? 0.35 : 1 }}>
      <Ionicons name={icon} size={big ? 24 : 22} color={big ? colors.brandInk : colors.brandDeep} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 10, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SHAPE.l, backgroundColor: colors.surfaceHigh }}>
      <View style={{ flex: 1 }}>
        <T weight="uiBold" size={15} numberOfLines={1}>{where}</T>
        <T size={12.5} color={status === 'error' ? colors.danger : colors.muted} numberOfLines={1}>{sub}</T>
      </View>
      <Btn icon="play-skip-back" label={t('prev')} onPress={audio.prev} disabled={q.whole} />
      {status === 'error' ? <Btn big icon="refresh" label={t('retry')} onPress={audio.retry} /> : <Btn big icon={playing ? 'pause' : 'play'} label={playing ? t('pause') : t('play')} onPress={audio.toggle} />}
      <Btn icon="play-skip-forward" label={t('next')} onPress={audio.next} disabled={q.whole} />
      <Btn icon="close" label={t('stop')} onPress={audio.stop} />
    </View>
  );
}

export function SectionTitle({ children }) {
  const { colors } = useApp();
  return <T variant="labelLarge" color={colors.primary} style={{ marginTop: SPACE.xl, marginBottom: SPACE.s }}>{children}</T>;
}

export function Divider() {
  const { colors } = useApp();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }} />;
}
