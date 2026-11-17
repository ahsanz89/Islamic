import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../lib/settings';
import { COMBOS, LETTER, LETTERS, LONG_VOWELS, LOOKALIKES, NON_JOINERS, SHORT_WORDS, SUKOON_WORDS, SYLLABLE_LETTERS, TANWEEN, VOWELS, forms, sukoonForm, syllable } from '../lib/learn-data';
import { Button, Card, SectionTitle, T } from './ui';
import { Ar, SoundBtn, Tile } from './LearnParts';

const Wrap = ({ children, gap = 8 }) => <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap, justifyContent: 'flex-start' }}>{children}</View>;
const Ru = ({ show, children }) => { const { colors } = useApp(); return show ? <View style={{ padding: 10, borderRadius: 12, backgroundColor: colors.goldSoft }}><T size={14}>{children}</T></View> : null; };
const P = ({ children, muted }) => { const { colors } = useApp(); return <T color={muted ? colors.muted : undefined}>{children}</T>; };

function Picker({ items, value, onChange }) {
  return <Wrap>{items.map((x) => <Tile key={x.id} text={x.ar} say={x.arName} sub={x.name.split(' ')[0]} size={30} selected={x.id === value} onPress={() => onChange(x.id)} />)}</Wrap>;
}

function Level1({ roman }) {
  const { colors } = useApp();
  const [id, setId] = useState('ba');
  const l = LETTER[id], f = forms(l);
  return (
    <View style={{ gap: 14 }}>
      <P>Arabic is written from right to left and has 28 letters, plus Hamza (ء). Tap any letter to hear it and study it.</P>
      <Picker items={LETTERS} value={id} onChange={setId} />
      <Card style={{ gap: 8 }}>
        <View style={{ borderRadius: 16, backgroundColor: colors.brandSoft, paddingVertical: 8 }}><Ar size={80}>{l.ar}</Ar></View>
        <T weight="uiBold" size={20}>{l.name} <T color={colors.muted}>· {l.arName}</T></T>
        <SoundBtn text={l.arName} label="Hear the letter name" />
        <T><T weight="uiBold">Sound: </T>“{l.sound}”. {l.how}</T>
        <T><T weight="uiBold">Mouth: </T>{l.mouth}</T>
        <T><T weight="uiBold">Spot it: </T>{l.dots}.</T>
        <Ru show={roman}>{l.ur} · {l.ru}</Ru>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><T weight="uiBold">Example:</T><Tile text={l.ex[0]} size={26} sub={`${l.ex[1]} · ${l.ex[2]}`} /></View>
        <T weight="uiBold">Shapes</T>
        <Wrap>{[['alone', f.iso], ['start', f.ini], ['middle', f.med], ['end', f.fin]].map(([n, t]) => <View key={n} style={{ alignItems: 'center' }}><Ar size={34}>{t}</Ar><T size={12} color={colors.muted}>{n}</T></View>)}</Wrap>
      </Card>
      <SectionTitle>Look-alike letters</SectionTitle>
      <P muted>These letters share a shape. Only the dots change the letter. Tap one to hear it.</P>
      {LOOKALIKES.map((g) => <Wrap key={g.join()}>{g.map((k) => <Tile key={k} text={LETTER[k].ar} say={LETTER[k].arName} sub={LETTER[k].dots.replace(' below', ' ↓').replace(' above', ' ↑')} size={30} />)}</Wrap>)}
    </View>
  );
}

function Level2({ roman }) {
  const { colors } = useApp();
  const [id, setId] = useState('ba');
  const l = LETTER[id], f = forms(l);
  return (
    <View style={{ gap: 14 }}>
      <P>In Arabic writing most letters join to the next letter, so their shape changes depending on where they sit in a word. Choose a letter to see its four forms.</P>
      <Picker items={LETTERS.filter((x) => x.connects)} value={id} onChange={setId} />
      <Wrap gap={10}>{[['Alone', f.iso], ['Start', f.ini], ['Middle', f.med], ['End', f.fin]].map(([n, t]) => <Card key={n} style={{ alignItems: 'center', minWidth: 72, paddingHorizontal: 10 }}><Ar size={50}>{t}</Ar><T weight="uiBold" size={13}>{n}</T></Card>)}</Wrap>
      <Ru show={roman}>Arabic mein harf lafz ke shuru, beech aur aakhir mein shakl badalta hai. Isi liye har harf ki chaar shaklein seekhni hoti hain.</Ru>
      <SectionTitle>Letters that do not join forward</SectionTitle>
      <P>Six letters never connect to the letter after them. After one of these, the next letter starts fresh as if it were at the beginning of a word.</P>
      <Wrap>{NON_JOINERS.map((x) => <Tile key={x.id} text={x.ar} say={x.arName} sub={x.name.split(' ')[0]} size={30} />)}</Wrap>
      <T color={colors.muted}>Example: ب + ا + ب = بَاب (door). The Alif does not join to the final Ba. Another: ك + ت + ا + ب = كِتَاب (book).</T>
    </View>
  );
}

function Level3({ roman }) {
  const [id, setId] = useState('ba');
  const l = LETTER[id];
  return (
    <View style={{ gap: 14 }}>
      <P>Arabic letters are consonants. Small marks called harakaat tell you which short vowel to add. Three marks, three sounds:</P>
      {VOWELS.map((v) => (
        <Card key={v.id} style={{ alignItems: 'center', gap: 6 }}>
          <Ar size={64}>{syllable(LETTER.ba, v).ar}</Ar>
          <T weight="uiBold" size={18}>{v.name}</T>
          <T style={{ textAlign: 'center' }}>{v.how}</T>
          <T weight="uiBold">بَ = ba · بِ = bi · بُ = bu</T>
          <Ru show={roman}>{v.urdu} · {v.ru}</Ru>
        </Card>
      ))}
      <P>Changing the vowel changes the sound, but not the letter. Pick a letter and listen to all three:</P>
      <Picker items={SYLLABLE_LETTERS} value={id} onChange={setId} />
      <Wrap>{VOWELS.map((v) => { const s = syllable(l, v); return <Tile key={v.id} text={s.ar} sub={s.roman} size={44} />; })}</Wrap>
    </View>
  );
}

function Level4({ roman }) {
  const { colors } = useApp();
  const [id, setId] = useState('ba');
  const l = LETTER[id];
  return (
    <View style={{ gap: 14 }}>
      <P>Tanween means a doubled vowel mark at the end of a word. It adds an extra “n” sound after the vowel: -an, -in, -un.</P>
      {TANWEEN.map((t) => { const ar = l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''); return (
        <Card key={t.id} style={{ alignItems: 'center', gap: 6 }}>
          <Ar size={64}>{ar}</Ar><T weight="uiBold" size={18}>{t.name}</T><T style={{ textAlign: 'center' }}>{t.how}</T><T weight="uiBold">{l.sound}{t.ending}</T>
          <SoundBtn text={ar} label="Hear" /><Ru show={roman}>{t.ru}</Ru>
        </Card>); })}
      <T color={colors.muted}>Fathatan is usually written with an extra Alif after the letter (بًا). The Alif is not pronounced separately.</T>
      <Picker items={SYLLABLE_LETTERS} value={id} onChange={setId} />
    </View>
  );
}

function Level5({ roman }) {
  const [a, setA] = useState('ba'), [b, setB] = useState('ta');
  const s = sukoonForm(LETTER[a], LETTER[b], VOWELS[0]);
  return (
    <View style={{ gap: 14 }}>
      <P>Sukoon (ْ) is a small circle above a letter. It means “no vowel here”: the letter is pronounced by itself and joins to the sound before it.</P>
      <Wrap gap={12}><Card style={{ alignItems: 'center' }}><Ar size={56}>بَ</Ar><T>ba</T></Card><Card style={{ alignItems: 'center', maxWidth: 220 }}><Ar size={56}>بَتْ</Ar><T style={{ textAlign: 'center' }}>bat: the Ta has sukoon, so we say “bat”, not “bata”.</T><SoundBtn text="بَتْ" label="Hear" /></Card></Wrap>
      <Ru show={roman}>Sukoon (jazm) ka matlab hai us harf par koi harkat nahi, wo pichhle harf se mil kar saakin ho jata hai.</Ru>
      <SectionTitle>Build your own</SectionTitle>
      <T weight="uiSemi">First letter (with Fatha)</T><Picker items={SYLLABLE_LETTERS} value={a} onChange={setA} />
      <T weight="uiSemi">Second letter (with Sukoon)</T><Picker items={SYLLABLE_LETTERS} value={b} onChange={setB} />
      <Wrap><Tile text={s.ar} sub={s.roman} size={50} /></Wrap>
      <SectionTitle>Words with sukoon</SectionTitle>
      <Wrap>{SUKOON_WORDS.map((w) => <Tile key={w[0]} text={w[0]} sub={`${w[1]} · ${w[2]}`} size={28} />)}</Wrap>
    </View>
  );
}

function Level6({ roman }) {
  const router = useRouter();
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle>1. Long vowels</SectionTitle>
      <P>When a short vowel is followed by its matching letter, the sound is stretched to about two beats.</P>
      <Wrap>{LONG_VOWELS.map((v) => <Tile key={v.ar} text={v.ar} sub={v.roman} size={40} />)}</Wrap>
      <T size={13}>Fatha + Alif = “aa” · Kasra + Yaa = “ee” · Damma + Wao = “oo”</T>
      <SectionTitle>2. Join the sounds</SectionTitle>
      <P>Read each letter with its vowel and say them smoothly together. Example: كَ + تَ + بَ = كَتَبَ → ka + ta + ba = kataba (he wrote).</P>
      <Wrap>{COMBOS.map((c) => <Tile key={c[0]} text={c[0]} sub={c[1]} size={30} />)}</Wrap>
      <SectionTitle>3. Real words</SectionTitle>
      <P>Tap a word to hear it. Try reading it yourself first, then check.</P>
      <Wrap>{SHORT_WORDS.map((w) => <Tile key={w[0]} text={w[0]} sub={`${w[1]} · ${w[2]}`} size={28} />)}</Wrap>
      <Ru show={roman}>Pehle khud parhein, phir sunein. Rozana thori der mashq karne se rawani aati hai.</Ru>
      <SectionTitle>4. Practise in the Quran</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {[['Al-Fatiha', 1], ['Al-Ikhlas', 112], ['An-Nas', 114]].map(([n, s]) => <Button key={s} kind="ghost" label={n} onPress={() => router.push(`/surah/${s}`)} style={{ minHeight: 44 }} />)}
      </View>
    </View>
  );
}

export function Lesson({ n, roman }) {
  const C = [null, Level1, Level2, Level3, Level4, Level5, Level6][n];
  return <C roman={roman} />;
}
