// One description of the site's navigation, used by the desktop menus, the mobile drawer and the tests.
// Every href is an existing page (tests/nav.test.js checks each one against the built site).
// Labels: { en, ur, ar }. Missing languages fall back to English.
export const NAV = [
  {
    id: 'quran', match: ['/quran/', '/bookmarks/', '/mushaf/'], icon: 'quran', href: '/quran/', label: { en: 'Quran', ur: 'قرآن', ar: 'القرآن' },
    groups: [
      { items: [
        { href: '/quran/', label: { en: 'Read the Quran', ur: 'قرآن پڑھیں', ar: 'اقرأ القرآن' }, desc: { en: 'All 114 surahs with audio, translations and word by word', ur: 'تمام 114 سورتیں، آڈیو، ترجمے اور لفظ بہ لفظ', ar: 'السور الـ114 مع الصوت والترجمة وكلمة بكلمة' } },
        { href: '/mushaf/', label: { en: 'Mushaf pages', ur: 'مصحف کے صفحات', ar: 'صفحات المصحف' }, desc: { en: 'Read page by page, 15 lines to a page', ur: 'صفحہ بہ صفحہ پڑھیں، ہر صفحے پر 15 سطریں', ar: 'اقرأ صفحة صفحة، 15 سطرًا في الصفحة' } },
        { href: '/quran/roots/', label: { en: 'Quran word roots', ur: 'قرآنی الفاظ کی جڑیں', ar: 'جذور كلمات القرآن' }, desc: { en: 'Explore Arabic roots and where words appear', ur: 'عربی جڑیں اور الفاظ کہاں آتے ہیں', ar: 'استكشف الجذور ومواضع الكلمات' } },
        { href: '/bookmarks/', label: { en: 'Bookmarks', ur: 'محفوظ شدہ', ar: 'العلامات' }, desc: { en: 'Your saved verses and hadith', ur: 'آپ کی محفوظ کردہ آیات اور احادیث', ar: 'الآيات والأحاديث المحفوظة' } }
      ] }
    ]
  },
  {
    id: 'learn', match: ['/learn/'], icon: 'learn', href: '/learn/', label: { en: 'Learn', ur: 'سیکھیں', ar: 'تعلّم' },
    mega: true,
    groups: [
      { title: { en: 'Learn to read', ur: 'پڑھنا سیکھیں', ar: 'تعلّم القراءة' }, items: [
        { href: '/learn/', label: { en: 'Learn Quran', ur: 'قرآن سیکھیں', ar: 'تعلّم القرآن' }, desc: { en: 'From the first letter to reading, in 6 levels', ur: 'پہلے حرف سے پڑھنے تک، 6 لیول', ar: 'من أول حرف إلى القراءة في 6 مستويات' } },
        { href: '/learn/1/', label: { en: 'Arabic alphabet', ur: 'عربی حروفِ تہجی', ar: 'الحروف العربية' }, desc: { en: 'The 28 letters with sound', ur: '28 حروف آواز کے ساتھ', ar: 'الحروف الـ28 مع الصوت' } }
      ] },
      { title: { en: 'Understand Arabic', ur: 'عربی سمجھیں', ar: 'افهم العربية' }, items: [
        { href: '/learn-arabic/', label: { en: 'Learn Arabic', ur: 'عربی سیکھیں', ar: 'تعلّم العربية' }, desc: { en: 'Words and meanings in English or Urdu', ur: 'الفاظ اور مطلب انگریزی یا اردو میں', ar: 'كلمات ومعانٍ بالإنجليزية أو الأردية' } },
        { href: '/learn-arabic/2/', label: { en: 'Understand your Salah', ur: 'اپنی نماز سمجھیں', ar: 'افهم صلاتك' }, desc: { en: 'The words you say in prayer, one by one', ur: 'نماز کے الفاظ ایک ایک کر کے', ar: 'كلمات الصلاة كلمة كلمة' } },
        { href: '/learn-arabic/1/', label: { en: 'Quranic vocabulary', ur: 'قرآنی الفاظ', ar: 'مفردات القرآن' }, desc: { en: '39 words you hear again and again', ur: '39 الفاظ جو بار بار سنتے ہیں', ar: '39 كلمة تتكرر كثيراً' } },
        { href: '/learn-arabic/3/', label: { en: 'Understand short surahs', ur: 'چھوٹی سورتیں سمجھیں', ar: 'افهم السور القصيرة' }, desc: { en: 'Fatiha, Ikhlas, Kawthar, Asr, Falaq, Nas', ur: 'فاتحہ، اخلاص، کوثر، عصر، فلق، ناس', ar: 'الفاتحة والإخلاص والكوثر والعصر والفلق والناس' } }
      ] }
    ]
  },
  { id: 'arabic', match: ['/learn-arabic/'], icon: 'arabic', href: '/learn-arabic/', label: { en: 'Learn Arabic', ur: 'عربی سیکھیں', ar: 'تعلّم العربية' }, feature: true },
  {
    id: 'hadith', match: ['/collections/', '/c/', '/hadith/', '/search/', '/narrators/'], icon: 'books', href: '/collections/', label: { en: 'Hadith', ur: 'حدیث', ar: 'الحديث' },
    groups: [
      { items: [
        { href: '/collections/', label: { en: 'Hadith collections', ur: 'حدیث کے مجموعے', ar: 'كتب الحديث' }, desc: { en: 'Bukhari, Muslim and more', ur: 'بخاری، مسلم اور مزید', ar: 'البخاري ومسلم وغيرهما' } },
        { href: '/search/', label: { en: 'Search hadith', ur: 'حدیث تلاش کریں', ar: 'ابحث في الحديث' }, desc: { en: 'Search in English, Urdu or Arabic', ur: 'انگریزی، اردو یا عربی میں تلاش', ar: 'ابحث بالإنجليزية أو الأردية أو العربية' } },
        { href: '/narrators/', label: { en: 'Narrators', ur: 'راوی', ar: 'الرواة' }, desc: { en: 'Who narrated the hadith', ur: 'احادیث کے راوی', ar: 'رواة الأحاديث' } }
      ] }
    ]
  },
  {
    id: 'duas', match: ['/duas/'], icon: 'hands', href: '/duas/', label: { en: 'Duas', ur: 'دعائیں', ar: 'الأدعية' },
    groups: [
      { items: [
        { href: '/duas/', label: { en: 'Daily duas', ur: 'روزمرہ دعائیں', ar: 'أدعية يومية' }, desc: { en: 'Morning, evening, travel, prayer and more', ur: 'صبح، شام، سفر، نماز اور مزید', ar: 'الصباح والمساء والسفر والصلاة وغيرها' } },
        { href: '/duas/special/', label: { en: 'Special duas & accepted supplications', ur: 'خاص اور مقبول دعائیں', ar: 'أدعية خاصة ومستجابة' }, desc: { en: 'From the Quran and Sunnah, with sources and gradings', ur: 'قرآن و سنت سے، حوالہ اور درجے کے ساتھ', ar: 'من القرآن والسنة مع المصادر والدرجات' } }
      ] }
    ]
  },
  {
    id: 'guidance', match: ['/namaz/', '/glossary/', '/about/', '/privacy/', '/prayer/', '/progress/'], icon: 'glossary', href: '/namaz/', label: { en: 'Guidance', ur: 'رہنمائی', ar: 'إرشاد' },
    groups: [
      { items: [
        { href: '/prayer/', label: { en: 'Prayer times and Qibla', ur: 'اوقاتِ نماز اور قبلہ', ar: 'مواقيت الصلاة والقبلة' }, desc: { en: 'Times for your city, Qibla compass, reminders', ur: 'آپ کے شہر کے اوقات، قبلہ نما، یاددہانیاں', ar: 'مواقيت مدينتك وبوصلة القبلة والتذكيرات' } },
        { href: '/progress/', label: { en: 'My progress and backup', ur: 'میری پیش رفت اور بیک اپ', ar: 'تقدّمي ونسخي الاحتياطي' }, desc: { en: 'Reading streak, daily goal, backup', ur: 'پڑھنے کا تسلسل، روزانہ ہدف، بیک اپ', ar: 'سلسلة القراءة والهدف اليومي ونسخة احتياطية' } },
        { href: '/namaz/', label: { en: 'Prayer book', ur: 'نماز کی کتاب', ar: 'كتاب الصلاة' }, desc: { en: 'Printable prayer guide, takbir to salam', ur: 'تکبیر سے سلام تک قابلِ پرنٹ کتاب', ar: 'دليل الصلاة من التكبير إلى التسليم' } },
        { href: '/glossary/', label: { en: 'Glossary', ur: 'اصطلاحات', ar: 'المصطلحات' }, desc: { en: 'Islamic terms explained', ur: 'اسلامی اصطلاحات کی وضاحت', ar: 'شرح المصطلحات الإسلامية' } },
        { href: '/about/', label: { en: 'About DALIL', ur: 'دلیل کے بارے میں', ar: 'عن دليل' }, desc: { en: 'Our purpose and sources', ur: 'ہمارا مقصد اور ماخذ', ar: 'هدفنا ومصادرنا' } }
      ] }
    ]
  }
];

export const SALAH_PROMO = {
  title: { en: 'Understand What You Pray', ur: 'جو پڑھتے ہیں اسے سمجھیں', ar: 'افهم ما تصلّي' },
  text: {
    en: 'We recite Arabic in every Salah. Start learning the meanings of the words you say and build a deeper connection with your prayers.',
    ur: 'ہم ہر نماز میں عربی پڑھتے ہیں۔ جو الفاظ آپ پڑھتے ہیں ان کے مطلب سیکھنا شروع کریں اور اپنی نماز سے گہرا تعلق بنائیں۔',
    ar: 'نقرأ العربية في كل صلاة. ابدأ بتعلّم معاني الكلمات التي تقولها وابنِ صلة أعمق بصلاتك.'
  },
  short: { en: "Don't just recite. Understand what you are praying.", ur: 'صرف پڑھیں نہیں، سمجھیں کہ آپ کیا دعا کر رہے ہیں۔', ar: 'لا تكتفِ بالتلاوة، افهم ما تصلّي.' },
  five: { en: 'Learn 5 Arabic words today', ur: 'آج 5 عربی الفاظ سیکھیں', ar: 'تعلّم 5 كلمات عربية اليوم' },
  salah: { en: 'Understand your Salah', ur: 'اپنی نماز سمجھیں', ar: 'افهم صلاتك' }
};

export const pickLabel = (o, ui) => (o && (o[ui] || o.en)) || '';
export const hrefsOf = () => NAV.flatMap((n) => [n.href, ...(n.groups || []).flatMap((g) => g.items.map((i) => i.href))]).filter((v, i, a) => a.indexOf(v) === i);
export const sectionActive = (n, path) => n.match.some((m) => path.startsWith(m));
/** The one link of a menu that is "current": the most specific link that matches the path. */
export function currentHref(n, path) {
  const hits = (n.groups || []).flatMap((g) => g.items).map((i) => i.href).filter((h) => path === h || path.startsWith(h));
  return hits.sort((a, b) => b.length - a.length)[0] || null;
}
