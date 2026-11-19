import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useApp } from '../../src/lib/settings';
import { getSurah, getSurahs } from '../../src/lib/api';
import { playAyah } from '../../src/lib/audio';
import { evaluate, markDone, isDone, nextToPractice, SELF_CONFIRM_AFTER } from '../../src/lib/recitation-core';
import { Card, Button } from '../../src/components/ui';
import { IconButton, TopAppBar, ProgressBar } from '../../src/components/m3';
import { T } from '../../src/components/text';
import { FONTS, MAX_WIDTH } from '../../src/lib/theme';

// Practice Recitation (stage 1: word recognition). The user recites an ayah; the words the phone heard are
// compared with the verified text. The next ayah unlocks only after the whole ayah was heard (or, after
// several tries, the user confirms it themselves, because recognition can be wrong, never the reciter).
export default function Practice() {
  const params = useLocalSearchParams();
  const surahNo = Number(params.surah) || 1;
  const { colors, settings, update } = useApp();
  const router = useRouter();
  const [verses, setVerses] = useState(null);
  const [meta, setMeta] = useState(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | listening | checking
  const [res, setRes] = useState(null);
  const [tries, setTries] = useState(0);
  const [err, setErr] = useState('');
  const heard = useRef([]);
  const listening = useRef(false);
  const done = settings.recitationDone || {};

  useEffect(() => {
    getSurah(surahNo).then((d) => {
      const list = Array.isArray(d) ? d : d.verses || d;
      setVerses(list);
      const want = Number(params.ayah);
      setIdx(want ? Math.max(0, Math.min(list.length - 1, want - 1)) : nextToPractice(settings.recitationDone || {}, surahNo, list.length) - 1);
    }).catch(() => setErr('Could not load the surah. Check your connection.'));
    getSurahs().then((d) => setMeta(d.surahs[surahNo - 1])).catch(() => {});
  }, [surahNo]); // eslint-disable-line react-hooks/exhaustive-deps

  const v = verses && verses[idx];
  const ayahNo = v ? v.v : idx + 1;
  const completed = v ? isDone(done, surahNo, ayahNo) : false;

  useSpeechRecognitionEvent('result', (e) => {
    heard.current = (e.results || []).map((r) => ({ text: r.transcript, confidence: r.confidence > 0 ? r.confidence : undefined }));
  });
  useSpeechRecognitionEvent('error', (e) => {
    listening.current = false;
    setPhase('idle');
    setErr(e.error === 'not-allowed' ? 'The microphone permission is needed to check your recitation. You can allow it in the phone settings.'
      : e.error === 'no-speech' ? 'Nothing was heard. Try again.' : 'The speech service could not run (' + (e.error || 'unknown') + '). Try again.');
  });
  useSpeechRecognitionEvent('end', () => {
    if (!listening.current || !v) return;
    listening.current = false;
    setPhase('idle');
    const r = evaluate(v.ar, heard.current);
    setRes(r);
    setTries((n) => (r.result === 'retry' || r.result === 'silence' ? n : n + 1));
    if (r.result === 'complete') update({ recitationDone: markDone(done, surahNo, ayahNo) });
  });

  const start = useCallback(async () => {
    setErr(''); setRes(null); heard.current = [];
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) { setErr('The microphone permission is needed to check your recitation. You can allow it in the phone settings.'); return; }
    listening.current = true;
    setPhase('listening');
    ExpoSpeechRecognitionModule.start({ lang: 'ar-SA', interimResults: true, maxAlternatives: 5, continuous: false,
      androidIntentOptions: { EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2500, EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2500 } });
  }, []);
  const stop = () => { ExpoSpeechRecognitionModule.stop(); };
  useEffect(() => () => { try { ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);

  const go = (d) => {
    heard.current = []; setIdx((i) => Math.max(0, Math.min(verses.length - 1, i + d))); setRes(null); setTries(0); setErr(''); };
  const selfConfirm = () => update({ recitationDone: markDone(done, surahNo, ayahNo) });
  const count = verses ? verses.length : 0;
  const doneCount = (done[String(surahNo)] || []).length;
  const bad = new Set(res ? res.problems : []);
  const words = res ? res.words : v ? v.ar.split(/\s+/) : [];
  const wordColor = (i) => (!res ? colors.ink : res.status[i] === 'ok' || res.status[i] === 'close' ? colors.primary : res.status[i] === 'pending' ? colors.ink : colors.error || '#B3261E');
  const title = meta ? `${meta.name} · ${ayahNo}` : `Surah ${surahNo}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopAppBar label="Practice recitation" subtitle={title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }}>
        {!verses ? <T>{err || 'Loading…'}</T> : (
          <>
            <ProgressBar value={count ? doneCount / count : 0} />
            <T variant="labelMedium" style={{ color: colors.muted }}>{`${doneCount} of ${count} ayat completed in this surah`}</T>
            <Card>
              <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }} accessible accessibilityLabel={`Ayah ${ayahNo}. ${completed ? 'Completed.' : 'Not completed yet.'}`}>
                {words.map((w, i) => (
                  <T key={i} style={{ fontFamily: FONTS.quran, fontSize: 30, lineHeight: 56, color: wordColor(i), textDecorationLine: bad.has(i) ? 'underline' : 'none' }}>{w}</T>
                ))}
              </View>
              {completed ? <T style={{ color: colors.primary, marginTop: 8, textAlign: 'center' }}>Completed</T> : null}
            </Card>
            {phase === 'listening' ? <T accessibilityLiveRegion="polite" style={{ textAlign: 'center' }}>Listening… recite the whole ayah, then tap Done.</T> : null}
            {res ? <Card><T accessibilityLiveRegion="polite" style={{ color: res.result === 'complete' ? colors.primary : colors.ink }}>{res.note}</T>
              {res.problems.length ? <T style={{ marginTop: 6 }}>{'Check: ' + res.problems.map((i) => res.words[i]).join(' ، ')}</T> : null}
              <T variant="labelSmall" style={{ color: colors.muted, marginTop: 6 }}>Word check only. Tajweed and letter pronunciation are not judged yet.</T></Card> : null}
            {err ? <T accessibilityLiveRegion="polite" style={{ color: colors.error || '#B3261E' }}>{err}</T> : null}
            {phase === 'listening'
              ? <Button label="Done reciting" onPress={stop} testID="rec-stop" />
              : <Button label={res ? 'Try again' : 'Start recitation'} onPress={start} testID="rec-start" />}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Button kind="tonal" label="Listen" onPress={() => playAyah(surahNo, ayahNo)} testID="rec-listen" />
              {!completed && tries >= SELF_CONFIRM_AFTER ? <Button kind="tonal" label="I recited it correctly" onPress={selfConfirm} testID="rec-self" /> : null}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <IconButton icon="chevron-back" label="Previous ayah" onPress={() => go(-1)} />
              <Button label="Next ayah" disabled={!completed || idx >= count - 1} onPress={() => go(1)} testID="rec-next" />
            </View>
            {!completed ? <T variant="labelSmall" style={{ color: colors.muted }}>The next ayah unlocks after this one is recited and heard completely.</T> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
