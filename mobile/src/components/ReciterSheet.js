import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/settings';
import { RECITERS, reciterById } from '../lib/reciters';
import { T } from './text';
import { BottomSheet } from './m3';
import { SHAPE } from '../lib/theme';

export function ReciterSheet({ visible, onClose }) {
  const { settings, update, colors, t } = useApp();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('reciter')} doneLabel={t('done')}>
      {RECITERS.map((r) => {
        const on = settings.reciter === r.id;
        return (
          <Pressable key={r.id} onPress={() => update({ reciter: r.id })} accessibilityRole="radio" accessibilityState={{ selected: on }}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: SHAPE.l, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.outlineVariant, backgroundColor: on ? colors.primaryContainer : colors.surfaceMid }}>
            <View style={{ flex: 1 }}>
              <T weight="uiSemi" size={16}>{r.en}</T>
              {r.type === 'surah' ? <T size={12.5} color={colors.muted}>Whole surah only</T> : null}
            </View>
            <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? colors.primary : colors.outline} />
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}
export const reciterLabel = (id) => reciterById(id).en;
