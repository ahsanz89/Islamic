'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';
import { getJSON } from '@/lib/client-data';
import { normalizeArabic } from '@/lib/arabic.mjs';

// Data: Ibn Hajar al-Asqalani, Taqrib al-Tahdhib (OpenITI, CC BY-NC-SA 4.0).
const L10N = {
  en: {
    title: 'Narrators', lead: 'Biographies and reliability rulings of 8,800+ hadith narrators from Ibn Hajar al-Asqalani, Taqrib al-Tahdhib.',
    search: 'Search by name (Arabic)…', all: 'All', grade: 'Ruling', gen: 'Generation', book: 'Collected in', results: 'narrators', more: 'Show more',
    find: 'Find hadith', full: 'Full entry', less: 'Hide', died: 'Died', gen1: 'Generation', loading: 'Loading narrators…', none: 'No narrators match.',
    source: 'Source: Taqrib al-Tahdhib by Ibn Hajar al-Asqalani (d. 852 AH), text from the OpenITI corpus (CC BY-NC-SA 4.0).',
    tip: 'Tip: Companions are listed under their given names, e.g. Abu Hurairah appears as عبد الرحمن بن صخر.',
    note: 'Rulings are Ibn Hajar’s own summary judgments; they are a starting point, not the last word on a narrator.'
  },
  ur: {
    title: 'رواۃ', lead: 'حافظ ابن حجر عسقلانی کی «تقریب التہذیب» سے 8800 سے زائد راویوں کے حالات اور ان پر حکم۔',
    search: 'نام سے تلاش کریں (عربی)…', all: 'سب', grade: 'حکم', gen: 'طبقہ', book: 'روایت کردہ', results: 'راوی', more: 'مزید دکھائیں',
    find: 'احادیث تلاش کریں', full: 'پوری عبارت', less: 'چھپائیں', died: 'وفات', gen1: 'طبقہ', loading: 'راوی لوڈ ہو رہے ہیں…', none: 'کوئی راوی نہیں ملا۔',
    source: 'ماخذ: تقریب التہذیب، حافظ ابن حجر عسقلانی (م 852ھ)، متن OpenITI سے (CC BY-NC-SA 4.0)۔',
    tip: 'مشورہ: صحابہ اپنے اصل نام سے درج ہیں، مثلاً ابوہریرہ کو «عبد الرحمن بن صخر» لکھ کر تلاش کریں۔',
    note: 'یہ احکام ابن حجر کا مختصر فیصلہ ہیں؛ یہ راوی کے بارے میں ابتدائی رہنمائی ہیں، آخری بات نہیں۔'
  },
  ar: {
    title: 'الرواة', lead: 'تراجم وأحكام أكثر من 8800 راوٍ من «تقريب التهذيب» للحافظ ابن حجر العسقلاني.',
    search: 'ابحث بالاسم…', all: 'الكل', grade: 'الحكم', gen: 'الطبقة', book: 'أخرج له', results: 'راوٍ', more: 'عرض المزيد',
    find: 'ابحث في الأحاديث', full: 'النص الكامل', less: 'إخفاء', died: 'الوفاة', gen1: 'الطبقة', loading: 'جارٍ تحميل الرواة…', none: 'لا يوجد رواة مطابقون.',
    source: 'المصدر: تقريب التهذيب لابن حجر العسقلاني (ت 852هـ)، النص من مكتبة OpenITI (CC BY-NC-SA 4.0).',
    tip: 'تنبيه: الصحابة مذكورون بأسمائهم الأصلية، مثل أبي هريرة: عبد الرحمن بن صخر.',
    note: 'الأحكام هي خلاصة ابن حجر، وهي نقطة بداية وليست الكلمة الأخيرة في الراوي.'
  }
};

// grade groups: key → label per language + tone
const GRADE_GROUPS = [
  { k: 'comp', ar: ['صحابي', 'صحابية'], tone: 'gold', en: 'Companion', ur: 'صحابی', al: 'صحابي' },
  { k: 'thiqa', ar: ['ثقة', 'ثبت', 'حافظ', 'إمام', 'فقيه', 'عابد'], tone: 'good', en: 'Trustworthy (thiqa)', ur: 'ثقہ', al: 'ثقة' },
  { k: 'saduq', ar: ['صدوق'], tone: 'good2', en: 'Truthful (saduq)', ur: 'صدوق', al: 'صدوق' },
  { k: 'maqbul', ar: ['مقبول', 'مستور', 'مخضرم', 'يرسل', 'مرسل'], tone: 'mid', en: 'Acceptable / mixed', ur: 'مقبول / درمیانہ', al: 'مقبول' },
  { k: 'majhul', ar: ['مجهول', 'مجهول الحال'], tone: 'mid', en: 'Unknown (majhul)', ur: 'مجہول', al: 'مجهول' },
  { k: 'daif', ar: ['ضعيف', 'لين', 'لين الحديث', 'ليس بالقوي', 'منكر الحديث'], tone: 'weak', en: 'Weak (daif)', ur: 'ضعیف', al: 'ضعيف' },
  { k: 'matruk', ar: ['متروك', 'متهم', 'كذاب', 'رمي', 'مبتدع'], tone: 'bad', en: 'Abandoned / accused', ur: 'متروک / متہم', al: 'متروك' },
  { k: 'other', ar: [''], tone: 'none', en: 'Other', ur: 'دیگر', al: 'أخرى' }
];
const groupOf = (g) => GRADE_GROUPS.find((x) => x.ar.includes(g)) || GRADE_GROUPS[GRADE_GROUPS.length - 1];

// Tabaqah in words
const TAB = {
  en: ['', '1st: Companions', '2nd: senior Followers', '3rd: middle Followers', '4th: junior Followers (narrate from seniors)', '5th: junior Followers', '6th: met some Followers', '7th: senior Followers of the Followers', '8th: middle', '9th: junior', '10th: senior narrators of Followers of the Followers’ students', '11th: middle of them', '12th: junior of them'],
  ur: ['', 'پہلا: صحابہ', 'دوسرا: کبار تابعین', 'تیسرا: اوسط تابعین', 'چوتھا: تابعین (کبار سے روایت)', 'پانچواں: صغار تابعین', 'چھٹا: تابعین سے ملاقات', 'ساتواں: کبار تبع تابعین', 'آٹھواں: اوسط', 'نواں: صغار', 'دسواں: کبار آخذین', 'گیارہواں: اوسط', 'بارہواں: صغار'],
  ar: ['', 'الأولى: الصحابة', 'الثانية: كبار التابعين', 'الثالثة: وسطى التابعين', 'الرابعة: تلي الوسطى', 'الخامسة: صغار التابعين', 'السادسة: لقوا الصغار', 'السابعة: كبار أتباع التابعين', 'الثامنة: الوسطى', 'التاسعة: الصغرى', 'العاشرة: كبار الآخذين عن تبع الأتباع', 'الحادية عشرة: الوسطى', 'الثانية عشرة: الصغرى']
};

// Book code → short name (as used by Ibn Hajar)
const BOOKS = {
  خ: ['Bukhari', 'البخاري'], خت: ['Bukhari (mu‘allaq)', 'البخاري معلقًا'], بخ: ['Adab al-Mufrad', 'الأدب المفرد'], عخ: ['Khalq Af‘al al-‘Ibad', 'خلق أفعال العباد'], ر: ['Juz’ al-Qira’a', 'جزء القراءة'], ي: ['Raf‘ al-Yadayn', 'رفع اليدين'],
  م: ['Muslim', 'مسلم'], مق: ['Muslim (intro)', 'مقدمة مسلم'], د: ['Abu Dawud', 'أبو داود'], مد: ['Marasil Abi Dawud', 'المراسيل'], صد: ['Fada’il al-Ansar', 'فضائل الأنصار'], خد: ['Nasikh', 'الناسخ'], قد: ['Qadar', 'القدر'], ف: ['Tafarrud', 'التفرد'], ل: ['Masa’il', 'المسائل'], كد: ['Musnad Malik', 'مسند مالك'],
  ت: ['Tirmidhi', 'الترمذي'], تم: ['Shama’il', 'الشمائل'], س: ['Nasa’i', 'النسائي'], عس: ['Musnad ‘Ali', 'مسند علي'], كن: ['Musnad Malik (Nasa’i)', 'مسند مالك'], سي: ['‘Amal al-Yawm', 'عمل اليوم والليلة'], ص: ['Khasa’is ‘Ali', 'خصائص علي'],
  ق: ['Ibn Majah', 'ابن ماجه'], فق: ['Tafsir Ibn Majah', 'تفسير ابن ماجه'], ع: ['The Six Books', 'الكتب الستة'], 4: ['The four Sunan', 'السنن الأربعة'], تمييز: ['For distinction only', 'تمييز']
};

const PAGE = 60;
const SIX = ['خ', 'م', 'د', 'ت', 'س', 'ق'];

export default function Narrators() {
  const { settings } = useApp();
  const lg = settings.ui === 'ur' || settings.ui === 'ar' ? settings.ui : 'en';
  const T = L10N[lg];
  const bi = lg === 'ar' ? 1 : 0;
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [grp, setGrp] = useState('');
  const [tab, setTab] = useState('');
  const [book, setBook] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(null);

  useEffect(() => { getJSON('narrators/index.json').then(setData).catch(() => setData({ narrators: [] })); }, []);

  const prepared = useMemo(() => (data?.narrators || []).map((n) => ({ ...n, norm: normalizeArabic(n.name), grp: groupOf(n.g).k })), [data]);

  const counts = useMemo(() => {
    const c = {};
    for (const n of prepared) c[n.grp] = (c[n.grp] || 0) + 1;
    return c;
  }, [prepared]);

  const list = useMemo(() => {
    const nq = normalizeArabic(q);
    const words = nq ? nq.split(' ') : [];
    return prepared.filter((n) => (
      (!grp || n.grp === grp) &&
      (!tab || String(n.t) === tab) &&
      (!book || (book === 'six' ? n.b.some((x) => SIX.includes(x) || x === 'ع' || x === '4') : n.b.includes(book) || (n.b.includes('ع') && SIX.includes(book)) || (n.b.includes('4') && ['د', 'ت', 'س', 'ق'].includes(book)))) &&
      words.every((w) => n.norm.includes(w))
    ));
  }, [prepared, q, grp, tab, book]);

  useEffect(() => setShown(PAGE), [q, grp, tab, book]);

  if (!data) return <div className="container"><div className="empty">{T.loading}</div></div>;

  return (
    <div className="container">
      <header className="nr-hero">
        <h1>{T.title}</h1>
        <p>{T.lead}</p>
        <div className="nr-search">
          <span className="lead" aria-hidden="true">⌕</span>
          <label className="sr-only" htmlFor="nq">{T.search}</label>
          <input id="nq" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={T.search} dir="auto" />
          <p className="nr-tip">{T.tip}</p>
        </div>
      </header>

      <div className="nr-filters" role="group" aria-label={T.grade}>
        <button type="button" className={`chip ${!grp ? 'on' : ''}`} aria-pressed={!grp} onClick={() => setGrp('')}>{T.all} <small>{prepared.length.toLocaleString()}</small></button>
        {GRADE_GROUPS.filter((g) => counts[g.k]).map((g) => (
          <button key={g.k} type="button" className={`chip tone-${g.tone} ${grp === g.k ? 'on' : ''}`} aria-pressed={grp === g.k} onClick={() => setGrp(grp === g.k ? '' : g.k)}>
            {lg === 'ar' ? g.al : g[lg] || g.en} <small>{counts[g.k].toLocaleString()}</small>
          </button>
        ))}
      </div>
      <div className="nr-selects">
        <label>
          <span>{T.gen}</span>
          <select value={tab} onChange={(e) => setTab(e.target.value)}>
            <option value="">{T.all}</option>
            {TAB[lg].slice(1).map((s, i) => <option key={i} value={i + 1}>{s}</option>)}
          </select>
        </label>
        <label>
          <span>{T.book}</span>
          <select value={book} onChange={(e) => setBook(e.target.value)}>
            <option value="">{T.all}</option>
            <option value="six">{lg === 'ar' ? 'الكتب الستة (أي منها)' : lg === 'ur' ? 'صحاح ستہ (کوئی بھی)' : 'Any of the Six Books'}</option>
            {SIX.map((c) => <option key={c} value={c}>{BOOKS[c][bi]}</option>)}
          </select>
        </label>
        <p className="nr-count" aria-live="polite">{list.length.toLocaleString()} {T.results}</p>
      </div>

      <div className="nr-grid">
        {list.slice(0, shown).map((n) => {
          const g = groupOf(n.g);
          const isOpen = open === n.id;
          const firstWords = n.name.split(' ').slice(0, 3).join(' ');
          return (
            <article key={n.id} className={`nr-card spot ${isOpen ? 'open' : ''}`}>
              <div className="nr-top">
                <span className="nr-id">{n.id}</span>
                <h3 className="ar nr-name" lang="ar" dir="rtl">{n.name}</h3>
              </div>
              <div className="nr-tags">
                {n.g && <span className={`nr-badge tone-${g.tone}`}>{lg === 'ar' ? (n.r || g.al) : (g[lg] || g.en)}</span>}
                {n.r && n.r !== n.g && lg !== 'ar' && <span className="nr-badge plain" lang="ar" dir="rtl">{n.r}</span>}
                {n.t ? <span className="nr-badge plain">{T.gen1} {n.t}</span> : null}
                {n.d ? <span className="nr-badge plain" lang="ar" dir="rtl">{n.d}</span> : null}
              </div>
              {n.b.length > 0 && (
                <div className="nr-books" aria-label={T.book}>
                  {n.b.map((c, i) => <span key={i} className="nr-book" title={BOOKS[c]?.[bi]}>{BOOKS[c]?.[bi] || c}</span>)}
                </div>
              )}
              {isOpen && (
                <p className="nr-full ar" lang="ar" dir="rtl">{n.name} {n.x}</p>
              )}
              <div className="nr-actions">
                <button type="button" className="btn small" onClick={() => setOpen(isOpen ? null : n.id)} aria-expanded={isOpen}>{isOpen ? T.less : T.full}</button>
                <Link className="btn small" href={`/search/?q=${encodeURIComponent(firstWords)}&lang=ar`}>{T.find}</Link>
              </div>
            </article>
          );
        })}
      </div>
      {!list.length && <div className="empty">{T.none}</div>}
      {shown < list.length && (
        <div className="nr-more"><button type="button" className="btn primary" onClick={() => setShown(shown + PAGE * 2)}>{T.more} ({(list.length - shown).toLocaleString()})</button></div>
      )}
      <p className="nr-source">{T.source} {T.note}</p>
    </div>
  );
}
