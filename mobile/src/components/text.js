import React from 'react';
import { Text } from 'react-native';
import { useApp } from '../lib/settings';
import { FONTS, TYPE } from '../lib/theme';

/** App text. Use `variant` (Material 3 type scale: titleLarge, bodyMedium, labelLarge...) or the older size/weight props. */
export function T({ children, style, size = 16, weight = 'ui', variant, color, lang, numberOfLines, selectable, ...rest }) {
  const { colors } = useApp();
  const v = variant ? TYPE[variant] : null;
  const fs = v ? v.size : size;
  return (
    <Text numberOfLines={numberOfLines} selectable={selectable} style={[{ fontFamily: FONTS[v ? v.weight : weight] || FONTS.ui, fontSize: fs, color: color || colors.ink, lineHeight: v ? v.lh : Math.round(fs * 1.45) }, style]} {...rest}>
      {children}
    </Text>
  );
}
