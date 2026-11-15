import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/lib/settings';
import { MiniPlayer } from '../../src/components/ui';
import { FONTS } from '../../src/lib/theme';
import { T } from '../../src/components/ui';

const ICONS = { index: 'home', quran: 'book', hadith: 'library', duas: 'heart', settings: 'settings' };

function TabBar({ state, descriptors, navigation }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 6), paddingTop: 6, flexDirection: 'row' }}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];
        const name = ICONS[route.name] || 'ellipse';
        const color = focused ? colors.brand : colors.muted;
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={options.title}
            onPress={() => { const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!focused && !e.defaultPrevented) navigation.navigate(route.name); }}
            style={{ flex: 1, alignItems: 'center', gap: 2, minHeight: 48, justifyContent: 'center' }}>
            <Ionicons name={focused ? name : `${name}-outline`} size={23} color={color} />
            <T weight="uiSemi" size={11.5} color={color}>{options.title}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { colors, t } = useApp();
  return (
    <Tabs
      tabBar={(props) => (
        <View style={{ backgroundColor: colors.bg }}>
          <MiniPlayer />
          <TabBar {...props} />
        </View>
      )}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('home') }} />
      <Tabs.Screen name="quran" options={{ title: t('quran') }} />
      <Tabs.Screen name="hadith" options={{ title: t('hadith') }} />
      <Tabs.Screen name="duas" options={{ title: t('duas') }} />
      <Tabs.Screen name="settings" options={{ title: t('settings') }} />
    </Tabs>
  );
}
