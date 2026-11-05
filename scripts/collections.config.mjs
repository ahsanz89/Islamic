// Every collection the site builds, where its text comes from, and its basic facts.
// `source: 'hadith-api'` = Arabic + translations from fawazahmed0/hadith-api (Unlicense).
// `source: 'openiti'`   = Arabic only, from the OpenITI corpus (CC BY-NC-SA 4.0).

export const HADITH_API_LANGS = ['ur', 'en', 'bn', 'id', 'tr', 'fr', 'ru', 'ta'];
export const LANG3 = { ar: 'ara', ur: 'urd', en: 'eng', bn: 'ben', id: 'ind', tr: 'tur', fr: 'fra', ru: 'rus', ta: 'tam' };

export const COLLECTIONS = [
  // ---- Arabic + translations
  { id: 'bukhari', group: 'six', source: 'hadith-api', en: 'Sahih al-Bukhari', ar: 'صحيح البخاري', ur: 'صحیح بخاری', author: 'Imam Muhammad ibn Ismail al-Bukhari', authorAr: 'الإمام محمد بن إسماعيل البخاري', death: 256 },
  { id: 'muslim', group: 'six', source: 'hadith-api', en: 'Sahih Muslim', ar: 'صحيح مسلم', ur: 'صحیح مسلم', author: 'Imam Muslim ibn al-Hajjaj', authorAr: 'الإمام مسلم بن الحجاج', death: 261 },
  { id: 'abudawud', group: 'six', source: 'hadith-api', en: 'Sunan Abi Dawud', ar: 'سنن أبي داود', ur: 'سنن ابوداود', author: 'Imam Abu Dawud as-Sijistani', authorAr: 'الإمام أبو داود السجستاني', death: 275 },
  { id: 'tirmidhi', group: 'six', source: 'hadith-api', en: "Jami' at-Tirmidhi", ar: 'جامع الترمذي', ur: 'سنن ترمذی', author: 'Imam Abu Isa at-Tirmidhi', authorAr: 'الإمام أبو عيسى الترمذي', death: 279 },
  { id: 'nasai', group: 'six', source: 'hadith-api', en: "Sunan an-Nasa'i", ar: 'سنن النسائي', ur: 'سنن نسائی', author: "Imam Ahmad ibn Shu'ayb an-Nasa'i", authorAr: 'الإمام أحمد بن شعيب النسائي', death: 303 },
  { id: 'ibnmajah', group: 'six', source: 'hadith-api', en: 'Sunan Ibn Majah', ar: 'سنن ابن ماجه', ur: 'سنن ابن ماجہ', author: 'Imam Ibn Majah al-Qazwini', authorAr: 'الإمام ابن ماجه القزويني', death: 273 },
  { id: 'malik', group: 'major', source: 'hadith-api', en: 'Muwatta Imam Malik', ar: 'موطأ الإمام مالك', ur: 'موطا امام مالک', author: 'Imam Malik ibn Anas', authorAr: 'الإمام مالك بن أنس', death: 179 },
  { id: 'nawawi', group: 'forty', source: 'hadith-api', en: "An-Nawawi's Forty Hadith", ar: 'الأربعون النووية', ur: 'اربعین نووی', author: 'Imam Yahya ibn Sharaf an-Nawawi', authorAr: 'الإمام يحيى بن شرف النووي', death: 676 },
  { id: 'qudsi', group: 'forty', source: 'hadith-api', en: 'Forty Hadith Qudsi', ar: 'الأربعون القدسية', ur: 'چالیس احادیث قدسیہ', author: 'Compiled collection', authorAr: 'مجموعة', death: null },
  { id: 'dehlawi', group: 'forty', source: 'hadith-api', en: 'Forty Hadith of Shah Waliullah', ar: 'أربعون شاه ولي الله الدهلوي', ur: 'اربعین شاہ ولی اللہ', author: 'Shah Waliullah ad-Dehlawi', authorAr: 'شاه ولي الله الدهلوي', death: 1176 },

  // ---- Arabic only (OpenITI). `expected` = hadith count in common printed editions, used to flag partial segmentation.
  { id: 'ahmad', group: 'musnad', source: 'openiti', file: '0241IbnHanbal.Musnad.Shamela0025794-ara1', en: 'Musnad Ahmad', ar: 'مسند الإمام أحمد', ur: 'مسند احمد', author: 'Imam Ahmad ibn Hanbal', authorAr: 'الإمام أحمد بن حنبل', death: 241, expected: 27647 },
  { id: 'ibnabishaybah', group: 'musannaf', source: 'openiti', file: '0235IbnAbiShayba.Musannaf.JK000786-ara1', en: 'Musannaf Ibn Abi Shaybah', ar: 'مصنف ابن أبي شيبة', ur: 'مصنف ابن ابی شیبہ', author: 'Imam Ibn Abi Shaybah', authorAr: 'الإمام ابن أبي شيبة', death: 235, expected: 40754 },
  { id: 'darimi', group: 'sunan', source: 'openiti', file: '0255CabdAllahDarimi.Sunan.Sham19Y0036114-ara5', en: 'Sunan ad-Darimi', ar: 'سنن الدارمي', ur: 'سنن دارمی', author: 'Imam ad-Darimi', authorAr: 'الإمام الدارمي', death: 255, expected: 3535 },
  { id: 'ibnkhuzaymah', group: 'sahih', source: 'openiti', file: '0311IbnKhuzaymaNaysaburi.Sahih.ShamAY0031687-ara1', en: 'Sahih Ibn Khuzaymah', ar: 'صحيح ابن خزيمة', ur: 'صحیح ابن خزیمہ', author: 'Imam Ibn Khuzaymah', authorAr: 'الإمام ابن خزيمة', death: 311, expected: 3080 },
  { id: 'mustadrak', group: 'sahih', source: 'openiti', file: '0405HakimNaysaburi.Mustadrak.JK000467-ara1', en: "Al-Mustadrak 'ala as-Sahihayn", ar: 'المستدرك على الصحيحين', ur: 'المستدرک علی الصحیحین', author: 'Imam al-Hakim an-Naysaburi', authorAr: 'الإمام الحاكم النيسابوري', death: 405, expected: 9018 },
  { id: 'daraqutni', group: 'sunan', source: 'openiti', file: '0385Daraqutni.Sunan.JK000477-ara1', en: 'Sunan ad-Daraqutni', ar: 'سنن الدارقطني', ur: 'سنن دارقطنی', author: 'Imam ad-Daraqutni', authorAr: 'الإمام الدارقطني', death: 385, expected: 4836 },
  { id: 'bayhaqi', group: 'sunan', source: 'openiti', file: '0458Bayhaqi.SunanKubra.Sham19Y0148486-ara1', en: 'As-Sunan al-Kubra (al-Bayhaqi)', ar: 'السنن الكبرى للبيهقي', ur: 'السنن الکبریٰ للبیہقی', author: 'Imam al-Bayhaqi', authorAr: 'الإمام البيهقي', death: 458, expected: 21812 },
  { id: 'saidibnmansur', group: 'sunan', source: 'openiti', file: '0227IbnMansurKhurasani.Sunan.ShamAY0038067-ara1', en: "Sunan Sa'id ibn Mansur", ar: 'سنن سعيد بن منصور', ur: 'سنن سعید بن منصور', author: "Sa'id ibn Mansur", authorAr: 'سعيد بن منصور', death: 227, expected: 4154 },
  { id: 'tabarani-kabir', group: 'mujam', source: 'openiti', file: '0360Tabarani.MucjamKabir.Shamela0001733-ara1', en: "Al-Mu'jam al-Kabir", ar: 'المعجم الكبير للطبراني', ur: 'المعجم الکبیر للطبرانی', author: 'Imam at-Tabarani', authorAr: 'الإمام الطبراني', death: 360, expected: 21922 },
  { id: 'tabarani-saghir', group: 'mujam', source: 'openiti', file: '0360Tabarani.MucjamSaghir.Shamela0013068-ara1', en: "Al-Mu'jam as-Saghir", ar: 'المعجم الصغير للطبراني', ur: 'معجم صغیر للطبرانی', author: 'Imam at-Tabarani', authorAr: 'الإمام الطبراني', death: 360, expected: 1197 },
  { id: 'humaydi', group: 'musnad', source: 'openiti', file: '0219IbnZubayrHumaydi.Musnad.Shamela0008493-ara1', en: 'Musnad al-Humaydi', ar: 'مسند الحميدي', ur: 'مسند الحمیدی', author: 'Imam al-Humaydi', authorAr: 'الإمام الحميدي', death: 219, expected: 1337 },
  { id: 'ibnrahawayh', group: 'musnad', source: 'openiti', file: '0238IbnRahawayh.Musnad.Shia001913Vols-ara1', en: 'Musnad Ishaq ibn Rahawayh', ar: 'مسند إسحاق بن راهويه', ur: 'مسند اسحاق بن راہویہ', author: 'Ishaq ibn Rahawayh', authorAr: 'إسحاق بن راهويه', death: 238, expected: null },
  { id: 'shafii', group: 'musnad', source: 'openiti', file: '0204Shafici.Musnad.Shamela0021495-ara1', en: "Musnad ash-Shafi'i", ar: 'مسند الإمام الشافعي', ur: 'مسند امام شافعی', author: "Imam ash-Shafi'i", authorAr: 'الإمام الشافعي', death: 204, expected: 1819 },
  { id: 'shafii-sunan', group: 'sunan', source: 'openiti', file: '0204Shafici.SunanMathura.JK000677-ara1', en: "As-Sunan al-Ma'thura", ar: 'السنن المأثورة', ur: 'السنن المأثورہ', author: "Imam ash-Shafi'i", authorAr: 'الإمام الشافعي', death: 204, expected: 648 },
  { id: 'ibnmubarak', group: 'musnad', source: 'openiti', file: '0181IbnMubarak.Musnad.Shia001881-ara1', en: 'Musnad Ibn al-Mubarak', ar: 'مسند ابن المبارك', ur: 'مسند عبداللہ بن مبارک', author: "'Abdullah ibn al-Mubarak", authorAr: 'عبد الله بن المبارك', death: 181, expected: null },
  { id: 'adab', group: 'other', source: 'openiti', file: '0256Bukhari.AdabMufrad.Shamela0012991-ara1', en: 'Al-Adab al-Mufrad', ar: 'الأدب المفرد', ur: 'الادب المفرد', author: 'Imam al-Bukhari', authorAr: 'الإمام البخاري', death: 256, expected: 1322 },
  { id: 'shamail', group: 'other', source: 'openiti', file: '0279Tirmidhi.ShamailMuhammadiyya.Shamela0023647-ara1', en: "Ash-Shama'il al-Muhammadiyyah", ar: 'الشمائل المحمدية', ur: 'شمائل ترمذی', author: 'Imam at-Tirmidhi', authorAr: 'الإمام الترمذي', death: 279, expected: 417 },
  { id: 'mishkat', group: 'other', source: 'openiti', file: '0741KhatibTabrizi.MishkatMasabih.Shamela0008360-ara1', en: 'Mishkat al-Masabih', ar: 'مشكاة المصابيح', ur: 'مشکوٰۃ المصابیح', author: 'Al-Khatib at-Tabrizi', authorAr: 'الخطيب التبريزي', death: 741, expected: 6294 },
  { id: 'hammam', group: 'other', source: 'openiti', file: '0132HammamIbnMunabbih.Sahifa.Shia001878-ara2', en: 'Sahifah Hammam ibn Munabbih', ar: 'صحيفة همام بن منبه', ur: 'صحیفہ ہمام بن منبہ', author: 'Hammam ibn Munabbih', authorAr: 'همام بن منبه', death: 132, expected: 139 }
];

export const GROUPS = {
  six: { en: 'The Six Books', ur: 'کتب ستہ', ar: 'الكتب الستة' },
  major: { en: 'Muwatta', ur: 'موطا', ar: 'الموطأ' },
  forty: { en: 'Forty Hadith collections', ur: 'اربعین', ar: 'الأربعينيات' },
  sahih: { en: 'Sahih & Mustadrak', ur: 'صحیح و مستدرک', ar: 'الصحاح والمستدركات' },
  sunan: { en: 'Sunan', ur: 'سنن', ar: 'السنن' },
  musnad: { en: 'Masanid', ur: 'مسانید', ar: 'المسانيد' },
  musannaf: { en: 'Musannaf', ur: 'مصنف', ar: 'المصنفات' },
  mujam: { en: "Ma'ajim", ur: 'معاجم', ar: 'المعاجم' },
  other: { en: 'Other books', ur: 'دیگر کتب', ar: 'كتب أخرى' }
};
