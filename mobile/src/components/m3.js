// DALIL mobile design system: Material 3 building blocks.
// Everything here is plain React Native (Pressable, View, Modal), so the same components work on Android and iOS.
// Colours come from the theme roles in ../lib/theme.js, so light and dark mode need no extra work.
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/settings';
import { FONTS, SHAPE, TOUCH } from '../lib/theme';
import { T } from './text';

/** Press feedback: Android ripple plus a light state layer (iOS shows the state layer only). */
export const ripple = (colors) => (Platform.OS === 'android' ? { android_ripple: { color: colors.primary + '22', borderless: false } } : {});
export const pressedStyle = (pressed) => (pressed ? { opacity: 0.88 } : null);

/* ------------------------------------------------------------------ Icon button */
export function IconButton({ icon, onPress, label, tone = 'plain', size = 24, active, style, testID }) {
  const { colors } = useApp();
  const bg = tone === 'filled' ? colors.primary : tone === 'tonal' ? colors.primaryContainer : active ? colors.primaryContainer : 'transparent';
  const fg = tone === 'filled' ? colors.onPrimary : tone === 'tonal' || active ? colors.onPrimaryContainer : colors.ink;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} hitSlop={4} {...ripple(colors)}
      style={({ pressed }) => [{ width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }, pressedStyle(pressed), style]}>
      <Ionicons name={icon} size={size} color={fg} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Top app bar */
/** Small top app bar: [menu or back] title [actions]. `large` puts a bigger title below, like Material's "medium" bar. */
export function TopAppBar({ title, subtitle, onBack, onMenu, actions, large, transparent }) {
  const { colors, uiRtl } = useApp();
  return (
    <View style={{ backgroundColor: transparent ? 'transparent' : colors.bg, paddingHorizontal: 4, paddingTop: 4, paddingBottom: large ? 6 : 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56 }}>
        {onBack ? <IconButton icon={uiRtl ? 'arrow-forward' : 'arrow-back'} label="Back" onPress={onBack} /> : onMenu ? <IconButton icon="menu" label="Menu" onPress={onMenu} testID="menu-button" /> : <View style={{ width: 12 }} />}
        {!large ? (
          <View style={{ flex: 1, paddingHorizontal: 4 }}>
            <T variant="titleLarge" color={colors.onPrimaryContainer === colors.ink ? colors.ink : colors.ink} numberOfLines={1}>{title}</T>
            {subtitle ? <T variant="bodySmall" color={colors.muted} numberOfLines={1}>{subtitle}</T> : null}
          </View>
        ) : <View style={{ flex: 1 }} />}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{actions}</View>
      </View>
      {large ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
          <T variant="headlineMedium" numberOfLines={2}>{title}</T>
          {subtitle ? <T variant="bodyMedium" color={colors.muted} style={{ marginTop: 2 }}>{subtitle}</T> : null}
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ Search bar */
export function SearchBar({ value, onChangeText, placeholder, style, testID, onClear }) {
  const { colors } = useApp();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: SHAPE.full, backgroundColor: colors.surfaceHigh, paddingLeft: 18, paddingRight: 6, gap: 10 }, style]}>
      <Ionicons name="search" size={22} color={colors.muted} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} autoCorrect={false} testID={testID}
        accessibilityLabel={placeholder} returnKeyType="search" style={{ flex: 1, fontFamily: FONTS.ui, fontSize: 16, color: colors.ink, paddingVertical: 0 }} />
      {value ? <IconButton icon="close" label="Clear" size={20} onPress={() => { onChangeText(''); onClear && onClear(); }} /> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ Filter chip (single row, scrolls sideways) */
export function FilterChip({ label, selected, onPress, icon }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} {...ripple(colors)}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: selected || icon ? 12 : 16, borderRadius: SHAPE.s, borderWidth: selected ? 0 : 1, borderColor: colors.outlineVariant, backgroundColor: selected ? colors.secondaryContainer : 'transparent' }, pressedStyle(pressed)]}>
      {selected ? <Ionicons name="checkmark" size={18} color={colors.onSecondaryContainer} /> : icon ? <Ionicons name={icon} size={18} color={colors.muted} /> : null}
      <T variant="labelLarge" color={selected ? colors.onSecondaryContainer : colors.ink}>{label}</T>
    </Pressable>
  );
}
export function ChipRow({ children }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

/* ------------------------------------------------------------------ List item (the workhorse row) */
export function ListItem({ leading, headline, supporting, trailing, onPress, label, style, divider, testID }) {
  const { colors } = useApp();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 64, paddingHorizontal: 16, paddingVertical: 10 }}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        {typeof headline === 'string' ? <T variant="titleMedium" numberOfLines={2}>{headline}</T> : headline}
        {typeof supporting === 'string' ? <T variant="bodyMedium" color={colors.muted} numberOfLines={2}>{supporting}</T> : supporting}
      </View>
      {trailing}
    </View>
  );
  if (!onPress) return <View style={[divider && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }, style]}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label || (typeof headline === 'string' ? headline : undefined)} testID={testID} {...ripple(colors)}
      style={({ pressed }) => [divider && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }, pressedStyle(pressed), style]}>{body}</Pressable>
  );
}
/** Rounded square badge used as the leading element of a list row (number, icon or letter). */
export function LeadingBadge({ children, icon, tone = 'primary', size = 44 }) {
  const { colors } = useApp();
  const bg = tone === 'gold' ? colors.tertiaryContainer : tone === 'neutral' ? colors.secondaryContainer : colors.primaryContainer;
  const fg = tone === 'gold' ? colors.onTertiaryContainer : tone === 'neutral' ? colors.onSecondaryContainer : colors.onPrimaryContainer;
  return (
    <View style={{ width: size, height: size, borderRadius: SHAPE.m, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {icon ? <Ionicons name={icon} size={size / 2} color={fg} /> : <T variant="titleMedium" color={fg}>{children}</T>}
    </View>
  );
}
/** Group of rows on one rounded surface (used in Settings and lists). */
export function ListGroup({ children, title, style }) {
  const { colors } = useApp();
  return (
    <View style={style}>
      {title ? <T variant="labelLarge" color={colors.primary} style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>{title}</T> : null}
      <View style={{ marginHorizontal: 16, borderRadius: SHAPE.l, backgroundColor: colors.surfaceMid, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ Progress, segmented buttons, FAB */
export function ProgressBar({ value, style }) {
  const { colors } = useApp();
  return <View style={[{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceHighest, overflow: 'hidden' }, style]}><View style={{ height: 6, width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, backgroundColor: colors.primary, borderRadius: 3 }} /></View>;
}

export function Segmented({ options, value, onChange }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: 'row', height: 40, borderRadius: SHAPE.full, borderWidth: 1, borderColor: colors.outline, overflow: 'hidden' }} accessibilityRole="radiogroup">
      {options.map(([k, label], i) => {
        const on = value === k;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={label} {...ripple(colors)}
            style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.secondaryContainer : 'transparent', borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.outline }}>
            {on ? <Ionicons name="checkmark" size={16} color={colors.onSecondaryContainer} /> : null}
            <T variant="labelLarge" color={on ? colors.onSecondaryContainer : colors.ink} numberOfLines={1}>{label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Floating action button. Pass `label` for the extended form. Sits above the navigation bar. */
export function Fab({ icon, label, onPress, bottom = 16, testID }) {
  const { colors, uiRtl } = useApp();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label || icon} testID={testID} {...ripple(colors)}
      style={({ pressed }) => [{ position: 'absolute', bottom, [uiRtl ? 'left' : 'right']: 16, minWidth: 56, height: 56, borderRadius: SHAPE.l, paddingHorizontal: label ? 20 : 0, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryContainer, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, default: { elevation: 6 } }) }, pressedStyle(pressed)]}>
      <Ionicons name={icon} size={24} color={colors.onPrimaryContainer} />
      {label ? <T variant="labelLarge" color={colors.onPrimaryContainer}>{label}</T> : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Navigation bar (bottom) */
/** Material 3 navigation bar: up to five destinations, a pill behind the selected icon. */
export function NavigationBar({ items, activeKey, onSelect }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: colors.surfaceMid, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12) }}>
      {items.map((it) => {
        const on = it.key === activeKey;
        return (
          <Pressable key={it.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={it.label} onPress={() => onSelect(it.key)}
            style={{ flex: 1, alignItems: 'center', gap: 4, minHeight: 48 }}>
            <View style={{ width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.secondaryContainer : 'transparent' }}>
              <Ionicons name={on ? it.icon : `${it.icon}-outline`} size={24} color={on ? colors.onSecondaryContainer : colors.muted} />
            </View>
            <T variant="labelMedium" color={on ? colors.ink : colors.muted} numberOfLines={1}>{it.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ Navigation drawer */
const drawer = { open: false, subs: new Set() };
const setDrawer = (v) => { drawer.open = v; drawer.subs.forEach((f) => f()); };
export const openDrawer = () => setDrawer(true);
export const closeDrawer = () => setDrawer(false);
export const useDrawerOpen = () => useSyncExternalStore((f) => { drawer.subs.add(f); return () => drawer.subs.delete(f); }, () => drawer.open, () => false);

/** Modal navigation drawer. `sections` = [{ title, items: [{ key, icon, label, onPress }] }]. Slides in from the reading start side. */
export function NavigationDrawer({ sections, header }) {
  const { colors, uiRtl } = useApp();
  const insets = useSafeAreaInsets();
  const open = useDrawerOpen();
  const [shown, setShown] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (open) { setShown(true); Animated.timing(x, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }
    else if (shown) Animated.timing(x, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setShown(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!shown && !open) return null;
  const from = uiRtl ? 320 : -320;
  return (
    <Modal visible transparent animationType="none" onRequestClose={closeDrawer} statusBarTranslucent>
      <View style={{ flex: 1, flexDirection: uiRtl ? 'row-reverse' : 'row' }}>
        <Animated.View style={{ width: '82%', maxWidth: 340, backgroundColor: colors.surfaceLow, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8, borderTopRightRadius: uiRtl ? 0 : SHAPE.xl, borderBottomRightRadius: uiRtl ? 0 : SHAPE.xl, borderTopLeftRadius: uiRtl ? SHAPE.xl : 0, borderBottomLeftRadius: uiRtl ? SHAPE.xl : 0, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }}>
          <ScrollView>
            {header}
            {sections.map((s, i) => (
              <View key={i} style={{ paddingHorizontal: 12, paddingTop: i ? 8 : 0 }}>
                {s.title ? <T variant="titleSmall" color={colors.muted} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>{s.title}</T> : null}
                {s.items.map((it) => (
                  <Pressable key={it.key} accessibilityRole="button" accessibilityLabel={it.label} onPress={() => { closeDrawer(); setTimeout(it.onPress, 120); }} {...ripple(colors)}
                    style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16, borderRadius: SHAPE.full, backgroundColor: it.active ? colors.secondaryContainer : 'transparent' }, pressedStyle(pressed)]}>
                    <Ionicons name={it.icon} size={24} color={it.active ? colors.onSecondaryContainer : colors.muted} />
                    <T variant="labelLarge" color={it.active ? colors.onSecondaryContainer : colors.ink} style={{ flex: 1 }}>{it.label}</T>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
        <Animated.View style={{ flex: 1, backgroundColor: colors.scrim, opacity: x }}>
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} accessibilityLabel="Close menu" />
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Dialog and bottom sheet */
export function Dialog({ visible, title, children, actions, onClose }) {
  const { colors } = useApp();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, borderRadius: SHAPE.xl, backgroundColor: colors.surfaceHigh, padding: 24, gap: 16 }}>
          {title ? <T variant="headlineSmall">{title}</T> : null}
          {children}
          {actions ? <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>{actions}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
export function BottomSheet({ visible, onClose, title, children, doneLabel }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colors.scrim }} onPress={onClose} accessibilityLabel={doneLabel || 'Close'} />
      <View style={{ maxHeight: '86%', backgroundColor: colors.surfaceLow, borderTopLeftRadius: SHAPE.xl, borderTopRightRadius: SHAPE.xl, paddingBottom: insets.bottom + 12 }}>
        <View style={{ alignItems: 'center', paddingTop: 12 }}><View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: colors.outline }} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, gap: 12 }}>
          <T variant="titleLarge" style={{ flex: 1 }}>{title}</T>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={doneLabel || 'Done'} hitSlop={10} style={{ minHeight: 40, justifyContent: 'center' }}>
            <T variant="labelLarge" color={colors.primary}>{doneLabel || 'Done'}</T>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}
