import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../lib/settings';
import { playLesson, stopLesson, usePlayingText } from '../lib/learn-audio';
import { LETTERS, PASS_MARK, SHORT_WORDS, SUKOON_WORDS, SYLLABLE_LETTERS, TANWEEN, VOWELS, forms, pick, question, shuffle, syllable } from '../lib/learn-data';
import { ArabicText, Button, Card, T } from './ui';

export function Ar({ children, size = 34, center = true, style }) {
  return <ArabicText quran size={size} center={center} style={style}>{children}</ArabicText>;
}

export function SoundBtn({ text, label = 'Listen' }) {
  const { colors } = useApp();
  const playing = usePlayingText() === text;
  const [failed, setFailed] = useState(false);
  const go = () => {
    if (playing) { stopLesson(); return; }
    setFailed(playLesson({ text }) === 'none');
  };
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable onPress={go} accessibilityRole="button" accessibilityState={{ selected: playing }} accessibilityLabel={`${playing ? 'Stop' : label}: ${text}`} testID="sound-btn"
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: playing ? colors.brand : colors.border, backgroundColor: playing ? colors.brandSoft : colors.surface, opacity: pressed ? 0.7 : 1 })}>
        <Ionicons name={playing ? 'stop-circle' : 'volume-high'} size={20} color={colors.brand} />
        <T weight="uiSemi" size={15} color={colors.brandDeep}>{playing ? 'Stop' : label}</T>
      </Pressable>
      {failed ? <T size={13} color={colors.danger} style={{ textAlign: 'center' }}>Sorry, this sound could not be played. Check that your phone volume is up and try again.</T> : null}
    </View>
  );
}

/** Lesson sounds are bundled in the app, so no voice setup is needed any more. */
export function VoiceNotice() { return null; }

/** Tappable tile that plays the sound of whatever it shows. */
export function Tile({ text, say, sub, size = 32, selected, onPress }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={() => { playLesson({ text: say || text }); onPress && onPress(); }} accessibilityRole="button" accessibilityLabel={`${text} ${sub || ''}`}
      style={({ pressed }) => ({ alignItems: 'center', justifyContent: 'center', minWidth: 68, minHeight: 72, paddingHorizontal: 8, borderRadius: 16, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.brand : colors.line, backgroundColor: selected ? colors.brandSoft : colors.surface, opacity: pressed ? 0.7 : 1 })}>
      <Ar size={size}>{text}</Ar>
      {sub ? <T size={11.5} color={colors.muted}>{sub}</T> : null}
    </Pressable>
  );
}

function Opt({ o, state, disabled, onPress }) {
  const { colors } = useApp();
  const border = state === 'right' ? colors.brand : state === 'wrong' ? colors.danger : colors.border;
  const bg = state === 'right' ? colors.brandSoft : state === 'wrong' ? colors.dangerSoft : colors.surface;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={o.label}
      style={{ width: '48%', minHeight: o.big ? 80 : 58, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 2, borderColor: border, backgroundColor: bg, paddingHorizontal: 6 }}>
      {o.big ? <Ar size={38}>{o.label}</Ar> : <T weight="uiSemi" size={16} style={{ textAlign: 'center' }} color={state === 'wrong' ? colors.danger : undefined}>{o.label}</T>}
    </Pressable>
  );
}

function Q({ q, chosen, onAnswer }) {
  const { colors } = useApp();
  const locked = chosen !== null;
  useEffect(() => { if (q.audio) playLesson({ text: q.audio.text }); }, [q]);
  return (
    <Card style={{ gap: 12, alignItems: 'center' }}>
      <T weight="uiSemi" size={17} style={{ textAlign: 'center' }}>{q.prompt}</T>
      {q.big ? <Ar size={60}>{q.big}</Ar> : null}
      {q.audio ? <SoundBtn text={q.audio.text} label="Play again" /> : null}
      <View testID="options" style={{ flexDirection: q.options.some((o) => o.big) ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignSelf: 'stretch' }}>
        {q.options.map((o) => <Opt key={o.key} o={o} disabled={locked} state={!locked ? '' : o.key === q.answer ? 'right' : o.key === chosen ? 'wrong' : ''} onPress={() => onAnswer(o.key)} />)}
      </View>
      {locked ? <T weight="uiSemi" color={chosen === q.answer ? colors.brandDeep : colors.danger} style={{ textAlign: 'center' }}>{chosen === q.answer ? 'Correct. ' : 'Not quite. '}{q.explain}</T> : null}
    </Card>
  );
}

export function PracticeQuestions({ level }) {
  const { colors } = useApp();
  const [q, setQ] = useState(() => question(level));
  const [chosen, setChosen] = useState(null);
  const [tally, setTally] = useState({ ok: 0, all: 0 });
  useEffect(() => { setQ(question(level)); setChosen(null); setTally({ ok: 0, all: 0 }); }, [level]);
  return (
    <View style={{ gap: 12 }}>
      <T size={13} color={colors.muted}>Correct so far: {tally.ok} of {tally.all}</T>
      <Q q={q} chosen={chosen} onAnswer={(k) => { setChosen(k); setTally((t) => ({ ok: t.ok + (k === q.answer ? 1 : 0), all: t.all + 1 })); }} />
      {chosen !== null ? <Button label="Next question" onPress={() => { setQ(question(level)); setChosen(null); }} /> : null}
    </View>
  );
}

export function QuizRun({ level, next, onFinish }) {
  const { colors } = useApp();
  const router = useRouter();
  const N = 10;
  const build = () => { const seen = new Set(); const out = []; let g = 0; while (out.length < N && g++ < 200) { const q = question(level); const k = q.prompt + (q.big || '') + q.answer; if (!seen.has(k)) { seen.add(k); out.push(q); } } return out; };
  const [qs, setQs] = useState(build);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const again = () => { setQs(build()); setI(0); setChosen(null); setScore(0); setDone(false); };
  if (done) {
    const pass = score / qs.length >= PASS_MARK;
    return (
      <Card style={{ gap: 12, alignItems: 'center' }}>
        <T weight="uiBlack" size={44} color={colors.brandDeep}>{score} / {qs.length}</T>
        <T style={{ textAlign: 'center' }}>{pass ? 'Level complete. Well done! The next level is now open.' : `You need ${Math.ceil(PASS_MARK * qs.length)} correct to pass. Review the lessons, practise, and try again.`}</T>
        <Button kind="ghost" label="Try again" onPress={again} />
        {pass && next ? <Button label={`Go to Level ${next}`} onPress={() => router.replace(`/learn/${next}`)} /> : null}
        {pass && !next ? <Button label="Read Al-Fatiha" onPress={() => router.push('/surah/1')} /> : null}
      </Card>
    );
  }
  const q = qs[i];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' }}><View style={{ height: 8, width: `${(i / qs.length) * 100}%`, backgroundColor: colors.brand }} /></View>
      <T size={13} color={colors.muted}>Question {i + 1} of {qs.length}</T>
      <Q q={q} chosen={chosen} onAnswer={(k) => { setChosen(k); if (k === q.answer) setScore((s) => s + 1); }} />
      {chosen !== null ? <Button label={i + 1 >= qs.length ? 'See result' : 'Next'} onPress={() => { if (i + 1 >= qs.length) { onFinish(score / qs.length); setDone(true); } else { setI(i + 1); setChosen(null); } }} /> : null}
    </View>
  );
}

export function Repeat({ level }) {
  const { colors } = useApp();
  const deck = useRef(null);
  const [i, setI] = useState(0);
  if (!deck.current || deck.current.level !== level) {
    const L = LETTERS.filter((l) => l.id !== 'hamza');
    let d;
    if (level === 1) d = L.map((l) => ({ ar: l.ar, say: l.arName, sub: `${l.name} · ${l.sound}` }));
    else if (level === 2) d = L.filter((l) => l.connects).map((l) => { const f = forms(l); return { ar: `${f.iso}  ${f.ini}  ${f.med}  ${f.fin}`, say: l.arName, sub: `${l.name}: alone, start, middle, end` }; });
    else if (level === 3) d = SYLLABLE_LETTERS.flatMap((l) => VOWELS.map((v) => { const s = syllable(l, v); return { ar: s.ar, say: s.ar, sub: s.roman }; }));
    else if (level === 4) d = SYLLABLE_LETTERS.flatMap((l) => TANWEEN.map((t) => { const ar = l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''); return { ar, say: ar, sub: `${l.sound}${t.ending}` }; }));
    else if (level === 5) d = SUKOON_WORDS.map((w) => ({ ar: w[0], say: w[0], sub: `${w[1]} · ${w[2]}` }));
    else d = SHORT_WORDS.map((w) => ({ ar: w[0], say: w[0], sub: `${w[1]} · ${w[2]}` }));
    deck.current = { level, cards: pick(d, Math.min(12, d.length)) };
  }
  const cards = deck.current.cards, c = cards[i];
  if (!c) return <Card style={{ alignItems: 'center', gap: 10 }}><T>Deck finished.</T><Button label="Go again" onPress={() => { deck.current.cards = shuffle(cards); setI(0); }} /></Card>;
  return (
    <Card style={{ alignItems: 'center', gap: 10 }}>
      <T size={13} color={colors.muted}>Card {i + 1} of {cards.length}</T>
      <Ar size={60}>{c.ar}</Ar>
      <T color={colors.muted}>{c.sub}</T>
      <SoundBtn text={c.say} />
      <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>Listen, then say it aloud 3 times, copying the sound as closely as you can.</T>
      <Button label="I repeated it" onPress={() => setI(i + 1)} />
    </Card>
  );
}

export function Match() {
  const { colors } = useApp();
  const mk = () => { const set = pick(LETTERS.filter((l) => l.id !== 'hamza'), 5); return { a: shuffle(set), b: shuffle(set) }; };
  const [round, setRound] = useState(mk);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const [bad, setBad] = useState(null);
  const tryName = (id) => { if (!sel) return; if (sel === id) { setDone((d) => [...d, id]); setSel(null); } else { setBad(id); setTimeout(() => setBad(null), 600); } };
  const btn = (key, on, ok, wrong, child, press) => (
    <Pressable key={key} disabled={ok} onPress={press} style={{ minHeight: 60, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: ok || on ? colors.brand : wrong ? colors.danger : colors.border, backgroundColor: ok || on ? colors.brandSoft : colors.surface }}>{child}</Pressable>
  );
  return (
    <View style={{ gap: 12 }}>
      <T weight="uiSemi">Tap a letter, then tap its name.</T>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 8 }}>{round.a.map((l) => btn(l.id, sel === l.id, done.includes(l.id), false, <Ar size={34}>{l.ar}</Ar>, () => setSel(l.id)))}</View>
        <View style={{ flex: 1, gap: 8 }}>{round.b.map((l) => btn(l.id, false, done.includes(l.id), bad === l.id, <T weight="uiSemi">{l.name}</T>, () => tryName(l.id)))}</View>
      </View>
      {done.length === 5 ? <><T weight="uiSemi" color={colors.brandDeep}>All matched!</T><Button label="New round" onPress={() => { setRound(mk()); setDone([]); setSel(null); }} /></> : null}
    </View>
  );
}
