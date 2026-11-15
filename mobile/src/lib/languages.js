// Translation languages offered by DALIL. `key` is the key used in the data files (ur2 / en2 = a second translator).
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', rtl: false },
  { code: 'ur', native: 'اردو', english: 'Urdu', rtl: true },
  { code: 'ar', native: 'العربية', english: 'Arabic (interface only)', rtl: true, uiOnly: true },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', rtl: false },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', rtl: false },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian', rtl: false },
  { code: 'tr', native: 'Türkçe', english: 'Turkish', rtl: false },
  { code: 'fr', native: 'Français', english: 'French', rtl: false },
  { code: 'ru', native: 'Русский', english: 'Russian', rtl: false },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', rtl: false }
];

// Quran translators (key -> translator name). Hadith use the language code only.
export const TRANSLATORS = {
  en: 'Marmaduke Pickthall', en2: 'Abdullah Yusuf Ali',
  ur: 'Fateh Muhammad Jalandhry', ur2: 'Muhammad Junagarhi',
  hi: 'Suhel Farooq Khan & Saifur Rahman Nadwi',
  bn: 'Muhiuddin Khan', id: 'Indonesian Ministry of Religious Affairs', tr: 'Diyanet İşleri',
  fr: 'Muhammad Hamidullah', ru: 'Elmir Kuliev', ta: 'Jan Trust Foundation'
};

/** All selectable translations as a flat list, in display order. */
export const TRANSLATION_CHOICES = LANGUAGES.filter((l) => !l.uiOnly).flatMap((l) => {
  const out = [{ key: l.code, lang: l.code, native: l.native, english: l.english, translator: TRANSLATORS[l.code], rtl: l.rtl }];
  if (TRANSLATORS[l.code + '2']) out.push({ key: l.code + '2', lang: l.code, native: l.native, english: l.english, translator: TRANSLATORS[l.code + '2'], rtl: l.rtl });
  return out;
});

export const choiceByKey = (k) => TRANSLATION_CHOICES.find((c) => c.key === k) || null;
export const baseLang = (k) => (k ? k.slice(0, 2) : '');
