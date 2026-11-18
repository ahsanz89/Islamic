// Hand-written teaching content for "Learn Arabic". Everything that is Quran text, Quran transliteration, Quran verse
// translation and Quran word audio comes from the app's own Quran data (see build-arabic-data.mjs).
// The English / Urdu meanings written here are simple dictionary glosses; they are shown with a "please have a teacher confirm"
// note and are checked against the app's word-by-word data when the data is built (the build prints any mismatch).

export const SURAHS = [
  { n: 1, en: 'Al-Fatiha', ar: 'الفاتحة' }, { n: 112, en: 'Al-Ikhlas', ar: 'الإخلاص' }, { n: 108, en: 'Al-Kawthar', ar: 'الكوثر' },
  { n: 103, en: 'Al-Asr', ar: 'العصر' }, { n: 113, en: 'Al-Falaq', ar: 'الفلق' }, { n: 114, en: 'An-Nas', ar: 'الناس' }
];

// Phrases said in Salah. words: [Arabic with marks, transliteration, English, Urdu]
export const PHRASES = [
  { id: 'takbir', when: { en: 'Said to begin the prayer and when moving between positions', ur: 'نماز شروع کرتے وقت اور ایک حالت سے دوسری حالت میں جاتے وقت' },
    ar: 'اللَّهُ أَكْبَرُ', tl: 'Allahu Akbar', en: 'Allah is the Greatest.', ur: 'اللہ سب سے بڑا ہے۔',
    words: [['اللَّهُ', 'Allahu', 'Allah', 'اللہ'], ['أَكْبَرُ', 'Akbar', 'the Greatest', 'سب سے بڑا']] },
  { id: 'ruku', when: { en: 'Said in ruku (bowing)', ur: 'رکوع میں' },
    ar: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', tl: 'Subhana Rabbiyal Azeem', en: 'Glory be to my Lord, the Magnificent.', ur: 'پاک ہے میرا رب جو بڑی عظمت والا ہے۔',
    words: [['سُبْحَانَ', 'Subhana', 'Glory be to', 'پاک ہے'], ['رَبِّيَ', 'Rabbiya', 'my Lord', 'میرا رب'], ['الْعَظِيمِ', 'al-Azeem', 'the Magnificent', 'بڑی عظمت والا']] },
  { id: 'qawma', when: { en: 'Said when rising from ruku', ur: 'رکوع سے اٹھتے وقت' },
    ar: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ', tl: "Sami'Allahu liman hamidah", en: 'Allah hears the one who praises Him.', ur: 'اللہ نے اس کی سن لی جس نے اس کی تعریف کی۔',
    words: [['سَمِعَ', "Sami'a", 'heard', 'سنا'], ['اللَّهُ', 'Allahu', 'Allah', 'اللہ'], ['لِمَنْ', 'liman', 'for the one who', 'اس کے لیے جس نے'], ['حَمِدَهُ', 'hamidah', 'praised Him', 'اس کی تعریف کی']] },
  { id: 'rabbana', when: { en: 'Said while standing after ruku', ur: 'رکوع کے بعد کھڑے ہو کر' },
    ar: 'رَبَّنَا وَلَكَ الْحَمْدُ', tl: 'Rabbana wa lakal hamd', en: 'Our Lord, and to You belongs all praise.', ur: 'اے ہمارے رب! اور تیرے ہی لیے ساری تعریف ہے۔',
    words: [['رَبَّنَا', 'Rabbana', 'our Lord', 'اے ہمارے رب'], ['وَلَكَ', 'wa laka', 'and for You', 'اور تیرے لیے'], ['الْحَمْدُ', 'al-hamd', 'all praise', 'ساری تعریف']] },
  { id: 'sujud', when: { en: 'Said in sujood (prostration)', ur: 'سجدے میں' },
    ar: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', tl: "Subhana Rabbiyal A'la", en: 'Glory be to my Lord, the Most High.', ur: 'پاک ہے میرا رب جو سب سے بلند ہے۔',
    words: [['سُبْحَانَ', 'Subhana', 'Glory be to', 'پاک ہے'], ['رَبِّيَ', 'Rabbiya', 'my Lord', 'میرا رب'], ['الْأَعْلَى', "al-A'la", 'the Most High', 'سب سے بلند']] },
  { id: 'salam', when: { en: 'Said at the end of the prayer (the salaam)', ur: 'نماز کے آخر میں سلام پھیرتے وقت' },
    ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', tl: 'As-salamu alaykum wa rahmatullah', en: 'Peace be upon you, and the mercy of Allah.', ur: 'تم پر سلامتی ہو اور اللہ کی رحمت۔',
    words: [['السَّلَامُ', 'as-salamu', 'the peace', 'سلامتی'], ['عَلَيْكُمْ', 'alaykum', 'upon you', 'تم پر'], ['وَرَحْمَةُ', 'wa rahmatu', 'and the mercy of', 'اور رحمت'], ['اللَّهِ', 'Allah', 'Allah', 'اللہ']] }
];

// Common Quran words by group. [Arabic form as in the Quran, English, Urdu]
export const VOCAB_GROUPS = [
  { id: 'allah', en: 'Allah and the Book', ur: 'اللہ اور کتاب', words: [
    ['ٱللَّهِ', 'Allah', 'اللہ'], ['رَبِّ', 'Lord', 'رب'], ['رَحۡمَةࣲ', 'mercy', 'رحمت'], ['ٱلۡكِتَـٰبَ', 'the Book', 'کتاب'], ['ٱلنَّاسِ', 'the people', 'لوگ'], ['ٱلۡمُؤۡمِنِینَ', 'the believers', 'ایمان والے'] ] },
  { id: 'particles', en: 'Small words that are everywhere', ur: 'چھوٹے لفظ جو ہر جگہ آتے ہیں', words: [
    ['فِی', 'in', 'میں'], ['مِن', 'from', 'سے'], ['إِلَى', 'to', 'کی طرف'], ['عَن', 'about / from', 'سے / کے بارے میں'], ['لَا', 'not / no', 'نہیں'], ['لَمۡ', 'did not', 'نہیں (ماضی کی نفی)'], ['ثُمَّ', 'then', 'پھر'], ['أَوۡ', 'or', 'یا'], ['بَلۡ', 'nay / rather', 'بلکہ'], ['كُلِّ', 'every / all', 'ہر / سب'] ] },
  { id: 'pronouns', en: 'He, they, this, that', ur: 'وہ، وہ سب، یہ، وہ', words: [
    ['هُوَ', 'he', 'وہ'], ['هُمۡ', 'they', 'وہ سب'], ['هَـٰذَا', 'this', 'یہ'], ['ذَٰلِكَ', 'that', 'وہ'], ['ٱلَّذِینَ', 'those who', 'وہ لوگ جو'], ['إِنَّ', 'indeed', 'بے شک'] ] },
  { id: 'verbs', en: 'Common verbs', ur: 'عام افعال', words: [
    ['قَالَ', 'he said', 'اس نے کہا'], ['قُلۡ', 'say', 'کہہ دو'], ['كَانَ', 'he was', 'وہ تھا'], ['ءَامَنُوا۟', 'they believed', 'وہ ایمان لائے'], ['یَعۡلَمُونَ', 'they know', 'وہ جانتے ہیں'], ['جَاۤءَ', 'came', 'آیا'] ] },
  { id: 'world', en: 'The world and the Hereafter', ur: 'دنیا اور آخرت', words: [
    ['یَوۡمَ', 'day', 'دن'], ['ٱلۡأَرۡضِ', 'the earth', 'زمین'], ['ٱلسَّمَاۤءِ', 'the sky', 'آسمان'], ['ٱلدُّنۡیَا', 'the world', 'دنیا'], ['ٱلۡـَٔاخِرَةَ', 'the Hereafter', 'آخرت'], ['شَیۡءࣲ', 'thing', 'چیز'], ['خَیۡرࣱ', 'good / better', 'بہتر / بھلائی'], ['سَبِیلِ', 'way / path', 'راستہ'] ] },
  { id: 'relations', en: 'Where and when', ur: 'کہاں اور کب', words: [
    ['بَعۡدِ', 'after', 'بعد'], ['بَیۡنَ', 'between', 'درمیان'], ['عِندَ', 'with / near', 'پاس'], ['قَبۡلِ', 'before', 'پہلے'] ] }
];
