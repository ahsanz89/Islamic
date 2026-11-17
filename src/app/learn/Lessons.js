'use client';
import Link from 'next/link';
import { useState } from 'react';
import { COMBOS, LETTER, LETTERS, LONG_VOWELS, LOOKALIKES, NON_JOINERS, SHORT_WORDS, SUKOON, SUKOON_WORDS, SYLLABLE_LETTERS, TANWEEN, VOWELS, forms, sukoonForm, syllable } from '@/lib/learn-data';
import { Sound } from './parts';

const Ar = ({ children, size = 'md' }) => <span className={`quran-ar lq-ar lq-${size}`} lang="ar" dir="rtl">{children}</span>;
const Ru = ({ roman, children }) => (roman ? <p className="lq-ru">{children}</p> : null);

function Tile({ text, sub, id, say, small }) {
  return (
    <Sound text={say || text} id={id} label="Hear" className={`lq-tile ${small ? 'small' : ''}`}>
      <Ar size={small ? 'sm' : 'md'}>{text}</Ar>
      {sub && <small>{sub}</small>}
    </Sound>
  );
}

function Level1({ roman }) {
  const [id, setId] = useState('ba');
  const l = LETTER[id], f = forms(l);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p>Arabic is written from <strong>right to left</strong> and has 28 letters, plus Hamza (ء). Tap any letter to hear it and study it.</p>
      <div className="lq-grid" role="group" aria-label="Arabic letters">
        {LETTERS.map((x) => (
          <button key={x.id} className={`lq-letter ${x.id === id ? 'on' : ''}`} onClick={() => setId(x.id)} aria-pressed={x.id === id} aria-label={x.name}>
            <Ar size="lg">{x.ar}</Ar><small>{x.name.split(' ')[0]}</small>
          </button>
        ))}
      </div>
      <article className="lq-detail" aria-live="polite">
        <div className="lq-hero"><Ar size="xl">{l.ar}</Ar></div>
        <div>
          <h3>{l.name} <span className="muted" lang="ar">· {l.arName}</span></h3>
          <Sound text={l.arName} id={`letter-${l.id}`} label="Hear the letter name" />
          <p><strong>Sound:</strong> “{l.sound}”. {l.how}</p>
          <p><strong>Mouth:</strong> {l.mouth}</p>
          <p><strong>Spot it:</strong> {l.dots}.</p>
          <Ru roman={roman}><strong lang="ur">{l.ur}</strong> · {l.ru}</Ru>
          <p><strong>Example:</strong> <Ar size="sm">{l.ex[0]}</Ar> <span className="muted">{l.ex[1]} · {l.ex[2]}</span> <Sound text={l.ex[0]} id={null} label="Hear" /></p>
          <p><strong>Shapes:</strong> <Ar size="sm">{f.iso}</Ar> <span className="muted">alone</span> · <Ar size="sm">{f.ini}</Ar> <span className="muted">start</span> · <Ar size="sm">{f.med}</Ar> <span className="muted">middle</span> · <Ar size="sm">{f.fin}</Ar> <span className="muted">end</span></p>
        </div>
      </article>
      <section>
        <h3>Look-alike letters</h3>
        <p className="muted">These letters share a shape. Only the dots (and sometimes the tail) change the letter. Tap one to hear it.</p>
        {LOOKALIKES.map((g) => (
          <div key={g.join()} className="lq-look">
            {g.map((k) => <div key={k} className="lq-lookitem"><Tile text={LETTER[k].ar} id={`letter-${k}`} say={LETTER[k].arName} /><small>{LETTER[k].name.split(' ')[0]}<br />{LETTER[k].dots}</small></div>)}
          </div>
        ))}
      </section>
    </div>
  );
}

function Level2({ roman }) {
  const [id, setId] = useState('ba');
  const l = LETTER[id], f = forms(l);
  const joiners = LETTERS.filter((x) => x.connects);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p>In Arabic writing most letters join to the next letter, so their shape changes depending on <strong>where they sit in a word</strong>. Choose a letter to see its four forms.</p>
      <div className="lq-grid">
        {joiners.map((x) => <button key={x.id} className={`lq-letter ${x.id === id ? 'on' : ''}`} onClick={() => setId(x.id)} aria-pressed={x.id === id}><Ar size="lg">{x.ar}</Ar><small>{x.name.split(' ')[0]}</small></button>)}
      </div>
      <div className="lq-forms">
        {[['iso', 'Alone', f.iso], ['ini', 'Start', f.ini], ['med', 'Middle', f.med], ['fin', 'End', f.fin]].map(([k, name, t]) => (
          <div key={k} className="lq-form"><Ar size="xl">{t}</Ar><strong>{name}</strong></div>
        ))}
      </div>
      <p className="muted">{l.name}: <Ar size="sm">{f.iso} – {f.ini} – {f.med} – {f.fin}</Ar>. Hear it: <Sound text={l.arName} id={`letter-${l.id}`} label="Listen" /></p>
      <Ru roman={roman}>Arabic mein harf lafz ke shuru, beech aur aakhir mein shakl badalta hai. Isi liye har harf ki chaar shaklein seekhni hoti hain.</Ru>
      <section>
        <h3>Letters that do not join forward</h3>
        <p>Six letters never connect to the letter after them. After one of these, the next letter starts fresh as if it were at the beginning of a word.</p>
        <div className="lq-look">{NON_JOINERS.map((x) => <div key={x.id} className="lq-lookitem"><Tile text={x.ar} id={`letter-${x.id}`} say={x.arName} /><small>{x.name.split(' ')[0]}</small></div>)}</div>
        <p className="muted">Example: <Ar size="sm">ب + ا + ب = بَاب</Ar> (door). The Alif does not join to the final Ba. Another: <Ar size="sm">ك + ت + ا + ب = كِتَاب</Ar> (book).</p>
      </section>
    </div>
  );
}

function Level3({ roman }) {
  const [id, setId] = useState('ba');
  const l = LETTER[id];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p>Arabic letters are consonants. Small marks called <strong>harakaat</strong> tell you which short vowel to add. Three marks, three sounds:</p>
      <div className="lq-cards">
        {VOWELS.map((v) => (
          <div key={v.id} className="lq-vcard">
            <Ar size="xl">{syllable(LETTER.ba, v).ar}</Ar>
            <h3>{v.name}</h3>
            <p>{v.how}</p>
            <p><strong>بَ = ba · بِ = bi · بُ = bu</strong></p>
            <Ru roman={roman}><span lang="ur">{v.urdu}</span> · {v.ru}</Ru>
          </div>
        ))}
      </div>
      <p>Changing the vowel changes the sound, but not the letter. Pick a letter and listen to all three:</p>
      <div className="lq-grid">
        {SYLLABLE_LETTERS.map((x) => <button key={x.id} className={`lq-letter ${x.id === id ? 'on' : ''}`} onClick={() => setId(x.id)} aria-pressed={x.id === id}><Ar size="lg">{x.ar}</Ar></button>)}
      </div>
      <div className="lq-forms">
        {VOWELS.map((v) => { const s = syllable(l, v); return <div key={v.id} className="lq-form"><Tile text={s.ar} id={`syl-${l.id}-${v.id}`} /><strong>{s.roman}</strong></div>; })}
      </div>
    </div>
  );
}

function Level4({ roman }) {
  const [id, setId] = useState('ba');
  const l = LETTER[id];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p><strong>Tanween</strong> means a doubled vowel mark at the end of a word. It adds an extra “n” sound after the vowel: -an, -in, -un.</p>
      <div className="lq-cards">
        {TANWEEN.map((t) => (
          <div key={t.id} className="lq-vcard">
            <Ar size="xl">{l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : '')}</Ar>
            <h3>{t.name}</h3>
            <p>{t.how}</p>
            <p><strong>{l.sound}{t.ending}</strong></p>
            <Sound text={l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : '')} id={`tw-${l.id}-${t.id}`} label="Hear" />
            <Ru roman={roman}>{t.ru}</Ru>
          </div>
        ))}
      </div>
      <p className="muted">Fathatan is usually written with an extra Alif after the letter (بًا). The Alif is not pronounced separately.</p>
      <div className="lq-grid">{SYLLABLE_LETTERS.map((x) => <button key={x.id} className={`lq-letter ${x.id === id ? 'on' : ''}`} onClick={() => setId(x.id)} aria-pressed={x.id === id}><Ar size="lg">{x.ar}</Ar></button>)}</div>
    </div>
  );
}

function Level5({ roman }) {
  const [a, setA] = useState('ba'), [b, setB] = useState('ta');
  const s = sukoonForm(LETTER[a], LETTER[b], VOWELS[0]);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p><strong>Sukoon</strong> (<Ar size="sm">ْ</Ar>) is a small circle above a letter. It means <em>“no vowel here”</em>: the letter is pronounced by itself and joins to the sound before it.</p>
      <div className="lq-cards">
        <div className="lq-vcard"><Ar size="xl">بَ</Ar><p>ba</p></div>
        <div className="lq-vcard"><Ar size="xl">بَتْ</Ar><p>bat: the Ta has sukoon, so the vowel stops and we say “bat”, not “bata”.</p><Sound text="بَتْ" id={null} label="Hear" /></div>
      </div>
      <Ru roman={roman}>Sukoon (jazm) ka matlab hai us harf par koi harkat nahi, wo pichhle harf se mil kar saakin ho jata hai.</Ru>
      <section>
        <h3>Build your own</h3>
        <label className="lq-pick">First letter (with Fatha) <select value={a} onChange={(e) => setA(e.target.value)}>{SYLLABLE_LETTERS.map((x) => <option key={x.id} value={x.id}>{x.ar} {x.name}</option>)}</select></label>
        <label className="lq-pick">Second letter (with Sukoon) <select value={b} onChange={(e) => setB(e.target.value)}>{SYLLABLE_LETTERS.map((x) => <option key={x.id} value={x.id}>{x.ar} {x.name}</option>)}</select></label>
        <div className="lq-form"><Tile text={s.ar} /><strong>{s.roman}</strong></div>
      </section>
      <section>
        <h3>Words with sukoon</h3>
        <div className="lq-look">{SUKOON_WORDS.map((w) => <div key={w[0]} className="lq-lookitem"><Tile text={w[0]} /><small>{w[1]}<br />{w[2]}</small></div>)}</div>
      </section>
    </div>
  );
}

function Level6({ roman }) {
  return (
    <div className="stack" style={{ gap: 18 }}>
      <section>
        <h3>1. Long vowels</h3>
        <p>When a short vowel is followed by its matching letter, the sound is stretched to about two beats.</p>
        <div className="lq-cards">{LONG_VOWELS.map((v) => <div key={v.ar} className="lq-vcard"><Tile text={v.ar} /><strong>{v.roman}</strong><p className="muted">{v.rule}</p></div>)}</div>
      </section>
      <section>
        <h3>2. Join the sounds</h3>
        <p>Read each letter with its vowel, left to right in your head but right to left on the page, and say them smoothly together.</p>
        <p className="muted">Example: <Ar size="sm">كَ + تَ + بَ = كَتَبَ</Ar> → ka + ta + ba = <strong>kataba</strong> (he wrote)</p>
        <div className="lq-look">{COMBOS.map((c) => <div key={c[0]} className="lq-lookitem"><Tile text={c[0]} /><small>{c[1]}</small></div>)}</div>
      </section>
      <section>
        <h3>3. Real words</h3>
        <p>Tap a word to hear it. Try reading it yourself first, then check.</p>
        <div className="lq-look">{SHORT_WORDS.map((w) => <div key={w[0]} className="lq-lookitem"><Tile text={w[0]} /><small>{w[1]}<br />{w[2]}</small></div>)}</div>
        <Ru roman={roman}>Pehle khud parhein, phir sunein. Rozana thori der mashq karne se rawani aati hai.</Ru>
      </section>
      <section>
        <h3>4. Practise in the Quran</h3>
        <p>When you finish the quiz, read a short surah with audio and translation:</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" href="/quran/1/">Al-Fatiha</Link><Link className="btn" href="/quran/112/">Al-Ikhlas</Link><Link className="btn" href="/quran/114/">An-Nas</Link>
        </div>
      </section>
    </div>
  );
}

export default function Lesson({ n, roman }) {
  return [null, Level1, Level2, Level3, Level4, Level5, Level6].map((C, i) => (i === n ? <C key={i} roman={roman} /> : null));
}
