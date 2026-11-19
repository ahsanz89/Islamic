// DALIL palette. Raw brand values: Deep Emerald #123F35, Islamic Green #1F7358, Soft Gold #D5B779,
// Warm Ivory #F7F5EF, Charcoal #242B28, Sage Grey #89958D, Sand #E9E5D9, White #FFFFFF.
export const FONTS = {
  ui: 'Inter_400Regular', uiMedium: 'Inter_500Medium', uiSemi: 'Inter_600SemiBold', uiBold: 'Inter_700Bold', uiBlack: 'Inter_800ExtraBold',
  ar: 'Amiri_400Regular', arBold: 'Amiri_700Bold', quran: 'AmiriQuran_400Regular',
  ur: 'NotoNastaliqUrdu_400Regular', urMedium: 'NotoNastaliqUrdu_500Medium'
};
export const LIGHT = {
  dark: false, bg: '#F7F5EF', surface: '#FFFFFF', surface2: '#FBFAF6', surface3: '#E9E5D9', ink: '#242B28', muted: '#55625B',
  line: '#E9E5D9', border: '#D3CEBE', brand: '#1F7358', brandDeep: '#123F35', brandInk: '#FFFFFF', brandSoft: '#E2EFE9',
  gold: '#7A5F22', goldLine: '#D5B779', goldSoft: '#F4ECD8', danger: '#A3460F', dangerSoft: '#FBE6D8', playing: '#EAF3EE',
  // Material 3 roles
  primary: '#1F7358', onPrimary: '#FFFFFF', primaryContainer: '#CDE9DD', onPrimaryContainer: '#06241B',
  secondaryContainer: '#E3E9DF', onSecondaryContainer: '#1A2620', tertiaryContainer: '#F4ECD8', onTertiaryContainer: '#3F3010',
  surfaceLow: '#FBFAF6', surfaceMid: '#F2EFE6', surfaceHigh: '#ECE8DC', surfaceHighest: '#E6E2D5', outline: '#7A857E', outlineVariant: '#D3CEBE', scrim: 'rgba(0,0,0,0.45)', heroFrom: '#123F35'
};
export const DARK = {
  dark: true, bg: '#0C1613', surface: '#131F1B', surface2: '#182520', surface3: '#20312A', ink: '#EEF2EF', muted: '#B8C5BE',
  line: '#22332C', border: '#35493F', brand: '#62C9A3', brandDeep: '#8EE0C0', brandInk: '#07261C', brandSoft: '#173A2E',
  gold: '#D5B779', goldLine: '#D5B779', goldSoft: '#2F2812', danger: '#F4A77B', dangerSoft: '#3B2216', playing: '#173A2E',
  primary: '#62C9A3', onPrimary: '#07261C', primaryContainer: '#1B4D3C', onPrimaryContainer: '#C5EEDD',
  secondaryContainer: '#25382F', onSecondaryContainer: '#D8E6DE', tertiaryContainer: '#3A3115', onTertiaryContainer: '#F1E3B8',
  surfaceLow: '#101C18', surfaceMid: '#17241F', surfaceHigh: '#1D2C26', surfaceHighest: '#243630', outline: '#8A9992', outlineVariant: '#35493F', scrim: 'rgba(0,0,0,0.6)', heroFrom: '#0E2F27'
};
export const RADIUS = { s: 10, m: 16, l: 24 };
export const SPACE = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

// Material 3 shape scale (dp). Buttons and the search bar use `full`.
export const SHAPE = { xs: 4, s: 8, m: 12, l: 16, xl: 28, full: 999 };
// Material 3 type scale, set in Inter. `weight` is a FONTS key.
export const TYPE = {
  displaySmall: { size: 36, weight: 'uiBold', lh: 44 },
  headlineMedium: { size: 28, weight: 'uiBold', lh: 36 },
  headlineSmall: { size: 24, weight: 'uiBold', lh: 32 },
  titleLarge: { size: 22, weight: 'uiSemi', lh: 28 },
  titleMedium: { size: 16, weight: 'uiSemi', lh: 24 },
  titleSmall: { size: 14, weight: 'uiSemi', lh: 20 },
  bodyLarge: { size: 16, weight: 'ui', lh: 24 },
  bodyMedium: { size: 14, weight: 'ui', lh: 20 },
  bodySmall: { size: 12.5, weight: 'ui', lh: 18 },
  labelLarge: { size: 14, weight: 'uiSemi', lh: 20 },
  labelMedium: { size: 12, weight: 'uiSemi', lh: 16 },
  labelSmall: { size: 11, weight: 'uiSemi', lh: 16 }
};
// Minimum touch target (Material and Apple both ask for about 44 to 48).
export const TOUCH = 48;
// Widest the content gets on tablets and in landscape, so lines stay readable.
export const MAX_WIDTH = 720;
