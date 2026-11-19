import React, { memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../lib/settings';
import { FONTS } from '../lib/theme';
import { T } from './text';
import { lineSpeech, pageLines, parseToken, toArabicDigits } from '../lib/mushaf-core';

const REF = 24;                       // font size used to measure how wide each line is
const GAP = 0.2;                      // natural gap between words, in em
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
const fits = new Map();               // `${page}|${width}` -> measured natural widths (so pages are measured once)

/** One word plus its verse-end number (if it has one). The pair stays together when a line is stretched. */
function Word({ tok, fs, colors }) {
  const { text, n } = parseToken(tok);
  const base = { fontFamily: FONTS.quran, fontSize: fs, lineHeight: Math.round(fs * 1.7), color: colors.ink, includeFontPadding: false, writingDirection: 'rtl' };
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
      <T style={base} size={fs}>{text}</T>
      {n ? <T style={{ ...base, fontSize: fs * 0.78, color: colors.primary, marginRight: fs * 0.12, marginLeft: fs * 0.06 }} size={fs * 0.78}>{`﴿${toArabicDigits(n)}﴾`}</T> : null}
    </View>
  );
}

/**
 * One Mushaf page. Every line of the edition is drawn on ONE row (never re-wrapped); the font is sized so the widest line
 * of the page just fits, and full lines are justified (words spread out) the way the printed page is.
 * Short lines (end of a surah, the first two pages) are centred and not stretched.
 */
function MushafPageImpl({ page, width, height, speak = true }) {
  const { colors } = useApp();
  const lines = useMemo(() => pageLines(page), [page]);
  const key = `${page}|${Math.round(width)}`;
  const [nat, setNat] = useState(() => fits.get(key) || null);
  const textIdx = useMemo(() => lines.map((l, i) => (l[0] === 2 ? i : -1)).filter((i) => i >= 0), [lines]);
  const widths = useMemo(() => ({}), [key]);   // collects onLayout results during the measuring pass
  const measured = useCallback((i, w) => {
    widths[i] = w;
    if (textIdx.every((j) => widths[j] > 0)) { const arr = lines.map((_, j) => widths[j] || 0); fits.set(key, arr); setNat(arr); }
  }, [widths, textIdx, lines, key]);

  const full = lines.length >= 15;
  const inner = width * 0.94;
  const lineH = Math.min(height / 15, 64);
  const maxNat = nat ? Math.max(...nat) : 0;
  const fs = nat && maxNat ? Math.max(12, Math.min(REF * (inner / maxNat) * 0.995, lineH / 1.75)) : REF;
  const rows = lines.map((l, i) => {
    if (l[0] === 0) {
      return (
        <View key={i} style={{ height: lineH, justifyContent: 'center' }} accessible accessibilityRole="header" accessibilityLabel={speak ? lineSpeech(l) : undefined}>
          <View style={{ height: lineH * 0.82, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ fontFamily: FONTS.quran, fontSize: Math.min(fs * 1.05, lineH * 0.5), color: colors.onPrimaryContainer, writingDirection: 'rtl', lineHeight: Math.round(Math.min(fs * 1.05, lineH * 0.5) * 1.6), includeFontPadding: false, paddingTop: 2 }} size={fs}>{l[2]}</T>
          </View>
        </View>
      );
    }
    if (l[0] === 1) {
      return (
        <View key={i} style={{ height: lineH, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityRole="text" accessibilityLabel={speak ? lineSpeech(l) : undefined}>
          <T style={{ fontFamily: FONTS.quran, fontSize: fs, color: colors.ink, writingDirection: 'rtl', lineHeight: lineH, includeFontPadding: false }} size={fs}>{BASMALA}</T>
        </View>
      );
    }
    const natural = nat ? nat[i] * (fs / REF) : 0;
    const stretch = natural >= inner * 0.8;
    return (
      <View key={i} style={{ height: lineH, justifyContent: 'center', alignItems: 'center' }} accessible accessibilityRole="text" accessibilityLabel={speak ? lineSpeech(l) : undefined}>
        <View style={{ width: inner, flexDirection: 'row-reverse', justifyContent: stretch ? 'space-between' : 'center', alignItems: 'center', gap: stretch ? 0 : fs * GAP }}>
          {l[1].map((t, k) => <Word key={k} tok={t} fs={fs} colors={colors} />)}
        </View>
      </View>
    );
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: full ? 'flex-start' : 'center' }}>
      {/* measuring pass: the same lines at a reference size, invisible and hidden from screen readers */}
      {!nat ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, opacity: 0 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {lines.map((l, i) => (l[0] === 2 ? (
            <View key={i} style={{ alignSelf: 'flex-start' }} onLayout={(e) => measured(i, e.nativeEvent.layout.width)}>
              <View style={{ flexDirection: 'row-reverse', gap: REF * GAP }}>{l[1].map((t, k) => <Word key={k} tok={t} fs={REF} colors={colors} />)}</View>
            </View>
          ) : null))}
        </View>
      ) : null}
      <View style={{ opacity: nat ? 1 : 0 }}>{rows}</View>
    </View>
  );
}
export default memo(MushafPageImpl);
