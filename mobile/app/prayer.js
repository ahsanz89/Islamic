import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/lib/settings';
import { Button, Screen } from '../src/components/ui';
import { T } from '../src/components/text';
import { BottomSheet, FilterChip, ListGroup, ListItem, LeadingBadge, ChipRow, SearchBar, Segmented, TopAppBar } from '../src/components/m3';
import { METHODS, PRAYER_ORDER, formatTime, kaabaDistanceKm, nextPrayer, prayerTimes, qiblaBearing } from '../src/lib/prayer-times';
import { searchCities } from '../src/lib/cities';
import { rescheduleAll } from '../src/lib/notify';

const LABEL = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const ICON = { fajr: 'moon-outline', sunrise: 'partly-sunny-outline', dhuhr: 'sunny-outline', asr: 'cloudy-outline', maghrib: 'cloudy-night-outline', isha: 'moon' };

const hoursNow = (d) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
const deviceTz = (d) => -d.getTimezoneOffset() / 60;

function countdown(h) {
  const total = Math.max(0, Math.round(h * 60));
  const hh = Math.floor(total / 60), mm = total % 60;
  return hh ? `${hh} h ${mm} min` : `${mm} min`;
}

function Compass({ bearing }) {
  const { colors } = useApp();
  const [heading, setHeading] = useState(null);
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    let sub; let alive = true;
    try {
      const { Magnetometer } = require('expo-sensors');
      Magnetometer.setUpdateInterval(150);
      sub = Magnetometer.addListener(({ x, y }) => {
        if (!alive) return;
        let h = (Math.atan2(y, x) * 180) / Math.PI - 90;
        h = ((h % 360) + 360) % 360;
        setHeading((prev) => (prev == null ? h : (prev + (((h - prev + 540) % 360) - 180) * 0.25 + 360) % 360));
      });
    } catch { /* no compass sensor: the bearing in degrees is still shown */ }
    return () => { alive = false; sub && sub.remove && sub.remove(); };
  }, []);
  const turn = heading == null ? bearing : (bearing - heading + 360) % 360;
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
      <View accessible accessibilityLabel={`Qibla is ${Math.round(bearing)} degrees from north`}
        style={{ width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
        <T variant="labelSmall" color={colors.muted} style={{ position: 'absolute', top: 8 }}>N</T>
        <View style={{ transform: [{ rotate: `${turn}deg` }], alignItems: 'center' }}>
          <Ionicons name="navigate" size={72} color={colors.primary} />
        </View>
        <View style={{ position: 'absolute', bottom: 18, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Ionicons name="cube" size={14} color={colors.muted} /><T variant="labelSmall" color={colors.muted}>Kaaba</T>
        </View>
      </View>
      <T variant="titleMedium">{Math.round(bearing)}° from north</T>
      <T variant="bodySmall" color={colors.muted} style={{ textAlign: 'center', paddingHorizontal: 24 }}>
        {heading == null ? 'Point your phone north, or open on a phone with a compass sensor, to see the live arrow.' : 'Hold the phone flat and away from metal or magnets. Turn until the arrow points straight up.'}
      </T>
    </View>
  );
}

export default function Prayer() {
  const { colors, settings, update } = useApp();
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [pick, setPick] = useState(false);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);

  const place = settings.place;
  const prayer = settings.prayer || { method: 'mwl', asr: 'standard', use24: false };
  const adhan = settings.adhan || { on: false, prayers: {} };

  const times = useMemo(() => {
    if (!place) return null;
    return prayerTimes({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }, place, deviceTz(now), prayer);
  }, [place, prayer.method, prayer.asr, now.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = times ? nextPrayer(times, hoursNow(now)) : null;
  const until = next ? (next.tomorrow ? next.at + 24 : next.at) - hoursNow(now) : 0;

  const apply = async (patch) => {
    update(patch);
    const merged = { ...settings, ...patch };
    const res = await rescheduleAll(merged);
    setMsg(res.denied ? 'Notifications are turned off for DALIL in your phone settings.' : '');
  };
  const choose = (c) => { setPick(false); setQ(''); apply({ place: { name: c.name, lat: c.lat, lng: c.lng } }); };
  const useMyLocation = async () => {
    try {
      const L = require('expo-location');
      const perm = await L.requestForegroundPermissionsAsync();
      if (!perm.granted) { setMsg('Location was not allowed. You can pick your city from the list instead.'); return; }
      const p = await L.getLastKnownPositionAsync() || await L.getCurrentPositionAsync({ accuracy: L.Accuracy.Low });
      setPick(false);
      apply({ place: { name: 'My location', lat: Number(p.coords.latitude.toFixed(3)), lng: Number(p.coords.longitude.toFixed(3)) } });
    } catch { setMsg('Could not get your location. Please pick your city from the list.'); }
  };
  const sw = (value, onValueChange, label) => <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.surfaceHighest }} thumbColor={value ? colors.onPrimary : colors.outline} accessibilityLabel={label} />;

  return (
    <Screen>
      <TopAppBar title="Prayer times and Qibla" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <ListGroup title="Place">
          <ListItem onPress={() => setPick(true)} leading={<LeadingBadge icon="location" />} headline={place ? place.name : 'Choose your city'} supporting={place ? `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}` : 'Times are worked out on your phone. Your place never leaves it.'} />
        </ListGroup>
        {msg ? <T variant="bodySmall" color={colors.danger || colors.muted} style={{ paddingHorizontal: 24, paddingTop: 8 }}>{msg}</T> : null}

        {times ? (
          <>
            <View style={{ margin: 16, padding: 20, borderRadius: 28, backgroundColor: colors.heroFrom, gap: 4 }}>
              <T variant="labelLarge" color="#D5B779">Next prayer</T>
              <T variant="headlineMedium" color="#FFFFFF">{LABEL[next.key]} · {formatTime(next.at, prayer.use24)}</T>
              <T variant="bodyMedium" color="#CFE3DA">in {countdown(until)}</T>
            </View>
            <ListGroup title="Today">
              {PRAYER_ORDER.map((k, i) => (
                <ListItem key={k} divider={i < PRAYER_ORDER.length - 1}
                  leading={<LeadingBadge icon={ICON[k]} tone={k === next.key ? 'gold' : 'neutral'} />}
                  headline={LABEL[k]}
                  trailing={<T variant="titleMedium" color={k === next.key ? colors.primary : colors.ink}>{formatTime(times[k], prayer.use24)}</T>} />
              ))}
            </ListGroup>

            <ListGroup title="Adhan reminders">
              <ListItem leading={<LeadingBadge icon="notifications" />} headline="Remind me at prayer time" supporting="A notification at each chosen prayer, even when the app is closed."
                trailing={sw(!!adhan.on, (v) => apply({ adhan: { ...adhan, on: v, prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true, ...adhan.prayers } } }), 'Prayer reminders')} />
              {adhan.on ? (
                <View style={{ paddingBottom: 14 }}>
                  <ChipRow>
                    {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => (
                      <FilterChip key={k} label={LABEL[k]} selected={adhan.prayers?.[k] !== false} onPress={() => apply({ adhan: { ...adhan, prayers: { ...adhan.prayers, [k]: adhan.prayers?.[k] === false } } })} />
                    ))}
                  </ChipRow>
                </View>
              ) : null}
            </ListGroup>
          </>
        ) : (
          <View style={{ padding: 24, alignItems: 'center', gap: 12 }}>
            <Ionicons name="time-outline" size={44} color={colors.muted} />
            <T color={colors.muted} style={{ textAlign: 'center' }}>Choose your city to see today’s prayer times.</T>
            <Button label="Choose city" icon="location" onPress={() => setPick(true)} />
          </View>
        )}

        <ListGroup title="Calculation">
          <View style={{ padding: 16, gap: 12 }}>
            <T variant="labelLarge" color={colors.muted}>Method</T>
            <ChipRow>
              {Object.entries(METHODS).map(([k, m]) => <FilterChip key={k} label={m.name} selected={prayer.method === k} onPress={() => apply({ prayer: { ...prayer, method: k } })} />)}
            </ChipRow>
            <T variant="labelLarge" color={colors.muted}>Asr</T>
            <Segmented value={prayer.asr} onChange={(v) => apply({ prayer: { ...prayer, asr: v } })} options={[['standard', 'Shafi, Maliki, Hanbali', 'sunny-outline'], ['hanafi', 'Hanafi', 'sunny-outline']]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <T variant="titleMedium" style={{ flex: 1 }}>24-hour clock</T>
              {sw(!!prayer.use24, (v) => update({ prayer: { ...prayer, use24: v } }), '24-hour clock')}
            </View>
            <T variant="bodySmall" color={colors.muted}>Times are an astronomical calculation. Please check them against your local mosque, and choose the method your community follows.</T>
          </View>
        </ListGroup>

        {place ? (
          <ListGroup title="Qibla">
            <Compass bearing={qiblaBearing(place.lat, place.lng)} />
            <T variant="bodySmall" color={colors.muted} style={{ textAlign: 'center', paddingBottom: 12 }}>About {kaabaDistanceKm(place.lat, place.lng).toLocaleString()} km to the Kaaba</T>
          </ListGroup>
        ) : null}
      </ScrollView>

      <BottomSheet visible={pick} onClose={() => setPick(false)} title="Choose your city" doneLabel="Close">
        <View style={{ gap: 10 }}>
          <SearchBar value={q} onChangeText={setQ} placeholder="Search city or country" />
          {Platform.OS !== 'web' ? <Button kind="secondary" icon="locate" label="Use my location (one time)" onPress={useMyLocation} /> : null}
          <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
            {searchCities(q).map((c) => <ListItem key={`${c.name}-${c.country}`} onPress={() => choose(c)} headline={c.name} supporting={c.country} />)}
          </ScrollView>
        </View>
      </BottomSheet>
    </Screen>
  );
}
