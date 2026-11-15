import AsyncStorage from '@react-native-async-storage/async-storage';

export async function load(key, fallback) {
  try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export async function save(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: keep working in memory */ }
}
