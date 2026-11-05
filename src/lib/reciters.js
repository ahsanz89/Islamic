// Quran audio configuration. Add a reciter by appending one object here: the selector, settings and player read this list.
//
// Ayah audio: https://everyayah.com/data/<folder>/<SSS><AAA>.mp3 (one file per verse, e.g. 002255.mp3 = Al-Baqarah 255).
// Word audio: https://audio.qurancdn.com/wbw/<SSS>_<AAA>_<WWW>.mp3 (Quran.com word-by-word recordings).
export const AUDIO_SOURCES = {
  ayah: (folder, s, v) => `https://everyayah.com/data/${folder}/${String(s).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`,
  // Urdu spoken translation (Shamshad Ali Khan), one clip per ayah, hosted by EveryAyah.
  urdu: (s, v) => `https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/${String(s).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`,
  // Reciters published as one file per surah (no per-ayah files): MP3Quran.
  surahFile: (slug, s) => `https://cdn.mp3quran.net/download/audio/${slug}/r1/${String(s).padStart(3, '0')}.mp3`,
  word: (s, v, w) => `https://audio.qurancdn.com/wbw/${String(s).padStart(3, '0')}_${String(v).padStart(3, '0')}_${String(w).padStart(3, '0')}.mp3`
};

export const RECITERS = [
  { id: 'alafasy', folder: 'Alafasy_128kbps', name: { en: 'Mishary Rashid Alafasy', ar: 'مشاري راشد العفاسي', ur: 'مشاری راشد العفاسی' } },
  { id: 'sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps', name: { en: 'Abdul Rahman Al-Sudais', ar: 'عبد الرحمن السديس', ur: 'عبد الرحمٰن السدیس' } },
  { id: 'shuraim', folder: 'Saood_ash-Shuraym_128kbps', name: { en: 'Saud Al-Shuraim', ar: 'سعود الشريم', ur: 'سعود الشریم' } },
  { id: 'muaiqly', folder: 'MaherAlMuaiqly128kbps', name: { en: 'Maher Al-Muaiqly', ar: 'ماهر المعيقلي', ur: 'ماہر المعیقلی' } },
  { id: 'abdulbasit', folder: 'Abdul_Basit_Murattal_192kbps', name: { en: 'Abdul Basit Abdus Samad (Murattal)', ar: 'عبد الباسط عبد الصمد (مرتل)', ur: 'عبد الباسط عبد الصمد (مرتل)' } },
  { id: 'husary', folder: 'Husary_128kbps', name: { en: 'Mahmoud Khalil Al-Husary', ar: 'محمود خليل الحصري', ur: 'محمود خلیل الحصری' } },
  { id: 'minshawi', folder: 'Minshawy_Murattal_128kbps', name: { en: 'Muhammad Siddiq Al-Minshawi (Murattal)', ar: 'محمد صديق المنشاوي (مرتل)', ur: 'محمد صدیق المنشاوی (مرتل)' } },
  { id: 'ghamdi', folder: 'Ghamadi_40kbps', name: { en: 'Saad Al-Ghamdi', ar: 'سعد الغامدي', ur: 'سعد الغامدی' } },
  { id: 'rifai', folder: 'Hani_Rifai_192kbps', name: { en: 'Hani Ar-Rifai', ar: 'هاني الرفاعي', ur: 'ہانی الرفاعی' } },
  { id: 'dosari', folder: 'Yasser_Ad-Dussary_128kbps', name: { en: 'Yasser Al-Dosari', ar: 'ياسر الدوسري', ur: 'یاسر الدوسری' } }
];
RECITERS.splice(1, 0, { id: 'badr', type: 'surah', slug: 'badr-turki', name: { en: 'Badr Al-Turki', ar: 'بدر التركي', ur: 'بدر الترکی' } });
export const DEFAULT_RECITER = 'alafasy';
export const reciterById = (id) => RECITERS.find((r) => r.id === id) || RECITERS[0];
export const reciterName = (r, lang) => r.name[lang] || r.name.en;
