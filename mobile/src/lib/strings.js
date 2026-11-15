// Interface text. English is the base; Urdu and Arabic are translated. Other languages fall back to English
// for the interface (the translations of Quran and Hadith content themselves are fully multilingual).
const en = {
  appName: 'DALIL', tagline: 'Islamic Knowledge. Without Boundaries.', tagline2: 'Explore. Learn. Understand.',
  welcomeTitle: 'Choose your translation', welcomeSub: 'The Arabic text is always shown. Pick the language you would like to read alongside it.',
  welcomeNote: 'You can change this at any time in Settings, or from the button at the top of the Quran and Hadith screens.',
  arabicAlways: 'Arabic is always shown', continue: 'Continue', start: 'Start reading', skip: 'Arabic only for now',
  home: 'Home', quran: 'Quran', hadith: 'Hadith', duas: 'Duas', settings: 'Settings',
  search: 'Search', searchSurah: 'Search surah by name or number', surah: 'Surah', verses: 'verses', ayah: 'Ayah', juz: 'Juz',
  meccan: 'Meccan', medinan: 'Medinan', books: 'books', hadiths: 'hadith', book: 'Book', loading: 'Loading…',
  offline: 'You are offline and this has not been opened before.', retry: 'Try again', errorTitle: 'Could not load',
  translation: 'Translation', translations: 'Translations', changeTranslation: 'Change translation', translator: 'Translator',
  secondTranslation: 'Second translation (optional)', none: 'None', arabicOnly: 'Arabic only', done: 'Done',
  noTranslationHere: 'This book has no translation in {lang}. Showing Arabic.',
  appLanguage: 'App language', textSize: 'Arabic text size', harakat: 'Show vowel marks (harakat)', theme: 'Appearance',
  system: 'Automatic', light: 'Light', dark: 'Dark', reciter: 'Reciter', urduAudio: 'Urdu spoken translation after each ayah',
  urduAudioHint: 'Needs an ayah-by-ayah reciter. Badr Al-Turki plays the whole surah.',
  play: 'Play', pause: 'Pause', playSurah: 'Play surah', stop: 'Close player', next: 'Next ayah', prev: 'Previous ayah',
  continueReading: 'Continue reading', hadithOfDay: 'Hadith of the day', exploreTitle: 'Explore',
  quranDesc: '114 surahs with audio', hadithDesc: 'Bukhari, Muslim and 20+ books', duasDesc: 'Authentic supplications',
  goToNumber: 'Go to hadith number', go: 'Go', notFound: 'Not found', chapters: 'Chapters', read: 'Read',
  about: 'About DALIL', aboutText: 'DALIL is an independent global Islamic knowledge platform. It is not affiliated with any maslak, sect or organisation.',
  privacy: 'Privacy policy', support: 'Help and feedback', version: 'Version', storage: 'Offline storage', clearCache: 'Clear downloaded content',
  cleared: 'Downloaded content cleared.', on: 'On', off: 'Off', urduShort: 'Urdu audio', sources: 'Content sources', grade: 'Grade', narrated: 'Reference', copy: 'Copy', share: 'Share', copied: 'Copied',
  playing: 'Now playing', urduNow: 'Urdu translation', reading: 'Reading', language: 'Language', quick: 'Translation:'
};
const ur = {
  ...en,
  welcomeTitle: 'اپنی پسند کا ترجمہ منتخب کریں', welcomeSub: 'عربی متن ہمیشہ نظر آئے گا۔ عربی کے ساتھ جس زبان میں پڑھنا چاہیں وہ چنیں۔',
  welcomeNote: 'آپ اسے کسی بھی وقت سیٹنگز سے، یا قرآن اور حدیث کی اسکرین کے اوپر والے بٹن سے بدل سکتے ہیں۔',
  arabicAlways: 'عربی ہمیشہ دکھائی جاتی ہے', continue: 'آگے بڑھیں', start: 'پڑھنا شروع کریں', skip: 'فی الحال صرف عربی',
  home: 'ہوم', quran: 'قرآن', hadith: 'حدیث', duas: 'دعائیں', settings: 'سیٹنگز', search: 'تلاش', searchSurah: 'سورت کا نام یا نمبر لکھیں',
  surah: 'سورۃ', verses: 'آیات', ayah: 'آیت', juz: 'پارہ', meccan: 'مکی', medinan: 'مدنی', books: 'کتابیں', hadiths: 'احادیث', book: 'کتاب',
  loading: 'لوڈ ہو رہا ہے…', offline: 'آپ آف لائن ہیں اور یہ پہلے نہیں کھولا گیا۔', retry: 'دوبارہ کوشش کریں', errorTitle: 'لوڈ نہیں ہو سکا',
  translation: 'ترجمہ', translations: 'تراجم', changeTranslation: 'ترجمہ بدلیں', translator: 'مترجم', secondTranslation: 'دوسرا ترجمہ (اختیاری)',
  none: 'کوئی نہیں', arabicOnly: 'صرف عربی', done: 'ہو گیا', noTranslationHere: 'اس کتاب میں {lang} ترجمہ موجود نہیں، عربی دکھائی جا رہی ہے۔',
  appLanguage: 'ایپ کی زبان', textSize: 'عربی متن کا سائز', harakat: 'اعراب دکھائیں', theme: 'ظاہری انداز', system: 'خودکار', light: 'روشن', dark: 'گہرا',
  reciter: 'قاری', urduAudio: 'ہر آیت کے بعد اردو ترجمہ سنائیں', urduAudioHint: 'آیت بہ آیت قاری درکار ہے۔ بدر الترکی پوری سورت سناتے ہیں۔',
  play: 'چلائیں', pause: 'روکیں', playSurah: 'سورت سنیں', stop: 'پلیئر بند کریں', next: 'اگلی آیت', prev: 'پچھلی آیت',
  continueReading: 'پڑھنا جاری رکھیں', hadithOfDay: 'آج کی حدیث', exploreTitle: 'دریافت کریں', quranDesc: '۱۱۴ سورتیں، آڈیو کے ساتھ',
  hadithDesc: 'بخاری، مسلم اور ۲۰ سے زائد کتب', duasDesc: 'مستند دعائیں', goToNumber: 'حدیث نمبر پر جائیں', go: 'جائیں', notFound: 'نہیں ملا',
  chapters: 'ابواب', read: 'پڑھیں', about: 'دلیل کے بارے میں',
  aboutText: 'دلیل ایک آزاد عالمی اسلامی علمی پلیٹ فارم ہے۔ یہ کسی مسلک، فرقے یا تنظیم سے وابستہ نہیں۔', privacy: 'رازداری کی پالیسی',
  support: 'مدد اور رائے', version: 'ورژن', storage: 'آف لائن ذخیرہ', clearCache: 'ڈاؤن لوڈ شدہ مواد صاف کریں', cleared: 'ڈاؤن لوڈ شدہ مواد صاف ہو گیا۔', on: 'آن', off: 'بند', urduShort: 'اردو آڈیو',
  sources: 'مواد کے ماخذ', grade: 'درجہ', narrated: 'حوالہ', copy: 'کاپی', share: 'شیئر', copied: 'کاپی ہو گیا', playing: 'اب چل رہا ہے',
  urduNow: 'اردو ترجمہ', reading: 'مطالعہ', language: 'زبان', quick: 'ترجمہ:'
};
const ar = {
  ...en,
  welcomeTitle: 'اختر الترجمة', welcomeSub: 'يظهر النص العربي دائمًا. اختر اللغة التي تريد قراءتها بجانبه.',
  welcomeNote: 'يمكنك تغيير ذلك في أي وقت من الإعدادات أو من الزر أعلى شاشتي القرآن والحديث.',
  arabicAlways: 'العربية تظهر دائمًا', continue: 'متابعة', start: 'ابدأ القراءة', skip: 'العربية فقط الآن',
  home: 'الرئيسية', quran: 'القرآن', hadith: 'الحديث', duas: 'الأدعية', settings: 'الإعدادات', search: 'بحث', searchSurah: 'ابحث باسم السورة أو رقمها',
  surah: 'سورة', verses: 'آيات', ayah: 'آية', juz: 'جزء', meccan: 'مكية', medinan: 'مدنية', books: 'كتب', hadiths: 'حديث', book: 'كتاب',
  loading: 'جارٍ التحميل…', offline: 'أنت غير متصل ولم يُفتح هذا من قبل.', retry: 'حاول مجددًا', errorTitle: 'تعذّر التحميل',
  translation: 'الترجمة', translations: 'الترجمات', changeTranslation: 'تغيير الترجمة', translator: 'المترجم', secondTranslation: 'ترجمة ثانية (اختياري)',
  none: 'بدون', arabicOnly: 'العربية فقط', done: 'تم', noTranslationHere: 'لا توجد ترجمة {lang} لهذا الكتاب. تُعرض العربية.',
  appLanguage: 'لغة التطبيق', textSize: 'حجم الخط العربي', harakat: 'إظهار التشكيل', theme: 'المظهر', system: 'تلقائي', light: 'فاتح', dark: 'داكن',
  reciter: 'القارئ', urduAudio: 'الترجمة الأردية صوتًا بعد كل آية', urduAudioHint: 'تعمل مع القرّاء آية بآية. بدر التركي يقرأ السورة كاملة.',
  play: 'تشغيل', pause: 'إيقاف مؤقت', playSurah: 'تشغيل السورة', stop: 'إغلاق المشغّل', next: 'الآية التالية', prev: 'الآية السابقة',
  continueReading: 'تابع القراءة', hadithOfDay: 'حديث اليوم', exploreTitle: 'استكشف', quranDesc: '١١٤ سورة بالصوت', hadithDesc: 'البخاري ومسلم وأكثر من ٢٠ كتابًا',
  duasDesc: 'أدعية موثوقة', goToNumber: 'اذهب إلى رقم الحديث', go: 'اذهب', notFound: 'غير موجود', chapters: 'الأبواب', read: 'اقرأ', about: 'عن دليل',
  aboutText: 'دليل منصة إسلامية عالمية مستقلة، وليست تابعة لأي مذهب أو طائفة أو جهة.', privacy: 'سياسة الخصوصية', support: 'المساعدة والملاحظات',
  version: 'الإصدار', storage: 'التخزين دون اتصال', clearCache: 'مسح المحتوى المحمّل', cleared: 'تم مسح المحتوى المحمّل.', on: 'تشغيل', off: 'إيقاف', urduShort: 'الصوت الأردي', sources: 'مصادر المحتوى',
  grade: 'الدرجة', narrated: 'المرجع', copy: 'نسخ', share: 'مشاركة', copied: 'تم النسخ', playing: 'قيد التشغيل', urduNow: 'الترجمة الأردية',
  reading: 'القراءة', language: 'اللغة', quick: 'الترجمة:'
};
export const STRINGS = { en, ur, ar };
export const UI_LANGUAGES = [{ code: 'en', native: 'English' }, { code: 'ur', native: 'اردو' }, { code: 'ar', native: 'العربية' }];
export const isRTLUi = (c) => c === 'ur' || c === 'ar';
/** Suggested interface language for a chosen translation. */
export const uiFor = (trKey) => (trKey && trKey.startsWith('ur') ? 'ur' : 'en');
