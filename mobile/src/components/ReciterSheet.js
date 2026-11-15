import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../lib/settings';
import { RECITERS, reciterById } from '../lib/reciters';
import { T } from './ui';

export function ReciterSheet({ visible, onClose }) {
  const { settings, update, colors, t } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />
      <View style={{ maxHeight: '75%', backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
          <T weight="uiBold" size={20} color={colors.brandDeep} style={{ flex: 1 }}>{t('reciter')}</T>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button"><T weight="uiSemi" color={colors.brand}>{t('done')}</T></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, gap: 10 }}>
          {RECITERS.map((r) => {
            const on = settings.reciter === r.id;
            return (
              <Pressable key={r.id} onPress={() => update({ reciter: r.id })} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: on ? 2 : 1, borderColor: on ? colors.brand : colors.line, backgroundColor: on ? colors.brandSoft : colors.surface }}>
                <View style={{ flex: 1 }}>
                  <T weight="uiSemi" size={16}>{r.en}</T>
                  {r.type === 'surah' ? <T size={12.5} color={colors.muted}>Whole surah only</T> : null}
                </View>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? colors.brand : colors.border} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
export const reciterLabel = (id) => reciterById(id).en;
