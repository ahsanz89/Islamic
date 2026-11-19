"""Builds src/lib/special-duas.json ("Special Duas & Accepted Supplications").
Every dua is cut out of a real narration in the app's own hadith data (public/data/c/<book>/*.json) or a real Quran verse (public/data/q/N.json):
the Arabic and the English are exact substrings of that data, and the build STOPS if a text or a grade is not found. Nothing is typed from memory.
Run after `npm run data`:  python3 scripts/build-special-duas.py"""
import glob, json, os, re, sys

D = 'public/data'
def strip(s):
    s = re.sub('[ً-ٰٟۖ-ۭـ]', '', s)
    return s.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي').replace('ٱ', 'ا')

BOOKS = {'bukhari': 'Sahih al-Bukhari', 'muslim': 'Sahih Muslim', 'abudawud': 'Sunan Abi Dawud', 'tirmidhi': "Jami' at-Tirmidhi", 'nasai': "Sunan an-Nasa'i", 'ibnmajah': 'Sunan Ibn Majah'}
cache = {}
def hadith(c, n):
    if c not in cache:
        cache[c] = {}
        for f in glob.glob(f'{D}/c/{c}/*.json'):
            for h in json.load(open(f)):
                h['sec'] = os.path.basename(f)[:-5]; cache[c][h['n']] = h
    return cache[c][n]

def cut(text, a, b):
    """exact substring of `text` from the first match of a to the end of the first match of b after it (matching ignores vowels)."""
    mp = []; st = ''
    for i, ch in enumerate(text):
        s = strip(ch)
        for x in s: mp.append(i); st += x
    sa, sb = strip(a), strip(b)
    i = st.find(sa)
    if i < 0: raise SystemExit(f'ARABIC start not found: {a}')
    j = st.find(sb, i)
    if j < 0: raise SystemExit(f'ARABIC end not found: {b}')
    j += len(sb) - 1
    end = mp[j] + 1
    while end < len(text) and re.match('[ً-ٰٟۖ-ۭـ]', text[end]): end += 1
    r = text[mp[i]:end].strip().replace('\u200f{\u200f', '﴿').replace('\u200f}\u200f', '﴾').replace('\u200f', '')
    return re.sub(' +', ' ', r)

def cut_en(text, a, b):
    i = text.find(a)
    if i < 0: raise SystemExit(f'ENGLISH start not found: {a}')
    j = text.find(b, i)
    if j < 0: raise SystemExit(f'ENGLISH end not found: {b}')
    r = text[i:j + len(b)].strip(' "“”‘’\'')
    return re.sub(r'(\w)- (\w)', r'\1\2', r)

# ---- grading ----
PRIORITY = ['Al-Albani', 'Zubair Ali Zai', 'Shuaib Al Arnaut']
def cls(word):
    s = (word or '').lower()
    if re.search('(da.?if|daeef|weak|munkar|maudu|mawdu|fabricat)', s): return 'd'
    if 'hasan' in s and 'sahih' not in s: return 'h'
    if 'sahih' in s: return 's'
    if 'hasan' in s: return 'h'
    return ''
def grade(c, h):
    g = h.get('g') or []
    if c in ('bukhari', 'muslim'):
        return {'class': 's', 'label': 'Sahih', 'graders': [], 'note': 'Narrated in %s, whose collection is accepted by the scholars as authentic.' % BOOKS[c], 'differ': False}
    if not g: raise SystemExit(f'no grade for {c} {h["n"]}')
    classes = {cls(w) for _, w in g if cls(w)}
    pick = next((x for p in PRIORITY for x in g if x[0] == p), g[0])
    label = pick[1]
    differ = len(classes) > 1
    return {'class': cls(label), 'label': label, 'graders': g, 'note': '', 'differ': differ}

# ---- curated list ----
# form: 'dua' = words to say; 'virtue' = the Prophet's statement about when/which supplication is answered.
H = [
 dict(id='between-adhan-iqama', cats=['accept'], form='virtue', c='tirmidhi', n=212, a=('الدعاء لا يرد', 'والاقامة'), e=('The supplication made between the Adhan and Iqamah is not rejected', 'not rejected'),
      occ=('Between the adhan and the iqama of a prayer.', 'کسی بھی نماز کی اذان اور اقامت کے درمیان۔'), virt=('The Prophet ﷺ said that a supplication made between the adhan and the iqama is not rejected. Use this time to ask Allah for what you need.', 'نبی ﷺ نے فرمایا کہ اذان اور اقامت کے درمیان کی دعا رد نہیں ہوتی۔ یہ وقت اپنی حاجات اللہ سے مانگنے کے لیے ہے۔')),
 dict(id='three-answered', cats=['accept'], form='virtue', c='abudawud', n=1536, a=('ثلاث دعوات', 'المظلوم'), e=('Three supplications are answered, there being no doubt about them; that of a father, that of a traveller and that of one who has been wronged', 'wronged'),
      occ=('When you are a parent making dua for your child, a traveller, or someone who has been wronged.', 'جب آپ والدین ہوں، مسافر ہوں یا آپ پر ظلم ہوا ہو۔'), virt=('The narration lists three supplications that are answered: the father (parent), the traveller and the one who has been wronged. The Prophet ﷺ said there is no doubt about them.', 'روایت میں تین دعائیں بتائی گئی ہیں جو قبول ہوتی ہیں: والد کی، مسافر کی اور مظلوم کی۔ نبی ﷺ نے فرمایا کہ ان میں کوئی شک نہیں۔')),
 dict(id='hands-raised', cats=['accept'], form='virtue', c='abudawud', n=1488, a=('ان ربكم', 'صفرا'), e=('Your Lord is munificent and generous, and is ashamed to turn away empty the hands of His servant when he raises them to Him', 'raises them to Him'),
      occ=('Whenever you raise your hands to ask Allah.', 'جب بھی آپ اللہ سے مانگنے کے لیے ہاتھ اٹھائیں۔'), virt=('A reminder that Allah is generous and is shy to return empty the hands of His servant who raises them to Him. It encourages us to ask with hope, without promising that every request is granted in the way we expect.', 'یاد دہانی کہ اللہ کریم ہے اور بندے کے اٹھے ہوئے ہاتھ خالی لوٹانے سے حیا فرماتا ہے۔ یہ امید کے ساتھ مانگنے کی ترغیب ہے، اس کا مطلب یہ نہیں کہ ہر مانگی چیز اسی صورت میں مل جائے۔'), also=[('tirmidhi', 3556)]),
 dict(id='dua-for-brother', cats=['accept'], form='virtue', c='muslim', n=6930, a=('دعوة المرء', 'بمثل'), e=('The supplication of a Muslim for his brother at his back (in his absence) is responded', 'Amen, and says: May it be for you too'),
      occ=('When you make dua for another Muslim in their absence.', 'جب آپ کسی مسلمان بھائی کے لیے اس کی غیر موجودگی میں دعا کریں۔'), virt=('The Prophet ﷺ said that a Muslim\'s supplication for his brother in his absence is responded to, and an angel appointed over him says Amen and "may it be for you too".', 'نبی ﷺ نے فرمایا کہ مسلمان کی اپنے بھائی کے لیے پیٹھ پیچھے دعا قبول ہوتی ہے اور مقرر فرشتہ آمین کہتا ہے اور کہتا ہے کہ تمہیں بھی اسی کی مثل ملے۔')),
 dict(id='ism-azam-ahad-samad', cats=['ism', 'accept'], form='dua', c='abudawud', n=1493, a=('اللهم اني اسالك اني اشهد', 'كفوا احد'), e=('O Allah, I ask Thee, I bear witness that there is no god but Thou, the One, He to Whom men repair, Who has not begotten, and has not been begotten, and to Whom no one is equal', 'no one is equal'),
      occ=('Any time you make dua.', 'دعا کے کسی بھی وقت۔'), virt=('The Prophet ﷺ heard a man say these words and said he had asked Allah by the name by which, when He is asked, He gives, and when He is called upon, He answers. The narration describes this as His Greatest Name without naming it exactly.', 'نبی ﷺ نے ایک شخص کو یہ الفاظ کہتے سنا تو فرمایا کہ اس نے اللہ سے اس نام کے ساتھ مانگا ہے جس کے ساتھ مانگا جائے تو وہ عطا کرتا ہے اور پکارا جائے تو جواب دیتا ہے۔ روایت اسے اسمِ اعظم کہتی ہے مگر نام کی تعیین نہیں کرتی۔'), also=[('tirmidhi', 3475), ('ibnmajah', 3857)]),
 dict(id='ism-azam-mannan', cats=['ism', 'accept'], form='dua', c='abudawud', n=1495, a=('اللهم اني اسالك بان لك الحمد', 'يا حي يا قيوم'), e=('O Allah, I ask Thee by virtue of the fact that praise is due to Thee', 'O Eternal One'),
      occ=('Any time you make dua.', 'دعا کے کسی بھی وقت۔'), virt=('The Prophet ﷺ said that the man who made this supplication had called on Allah by His Greatest Name, by which He answers when called upon and gives when asked.', 'نبی ﷺ نے فرمایا کہ اس شخص نے اللہ کو اس کے اسمِ اعظم سے پکارا ہے جس سے پکارا جائے تو وہ جواب دیتا ہے اور مانگا جائے تو عطا کرتا ہے۔'), also=[('nasai', 1300)]),
 dict(id='ism-azam-two-verses', cats=['ism'], form='virtue', c='abudawud', n=1496, a=('اسم الله الاعظم', 'القيوم'), e=("Allah's Greatest Names is in these two verses", 'the Living, the Eternal'),
      occ=('When you recite these verses and make dua.', 'جب آپ یہ آیات پڑھیں اور دعا کریں۔'), virt=('The narration says that Allah\'s Greatest Name is in these two verses: "Your God is one God; there is no god but He, the Most Gracious, the Most Merciful" (2:163) and the opening of Surah Aal Imran: "Alif Lam Mim. Allah, there is no god but He, the Ever-Living, the Self-Sustaining" (3:1-2). Scholars have different opinions about what the Greatest Name is.', 'روایت میں ہے کہ اللہ کا اسمِ اعظم ان دو آیتوں میں ہے: "اور تمہارا معبود ایک ہی معبود ہے، اس کے سوا کوئی معبود نہیں، وہ رحمان رحیم ہے" (2:163) اور سورۃ آل عمران کی ابتدائی آیات۔ علما کے اسمِ اعظم کے بارے میں مختلف اقوال ہیں۔'), also=[('tirmidhi', 3478), ('ibnmajah', 3855)]),
 dict(id='yunus', cats=['accept', 'hardship', 'ism'], form='dua', c='tirmidhi', n=3505, a=('لا اله الا انت سبحانك', 'من الظالمين'), e=('There is none worthy of worship except You, Glory to You, Indeed, I have been of the transgressors', 'transgressors'),
      occ=('In distress and when asking for any need.', 'مصیبت میں اور کسی بھی حاجت کے لیے۔'), virt=('This is the supplication of Prophet Yunus (Dhun-Nun) in the belly of the whale. The Prophet ﷺ said that no Muslim man supplicates with it for anything except that Allah responds to him.', 'یہ حضرت یونس علیہ السلام کی مچھلی کے پیٹ میں دعا ہے۔ نبی ﷺ نے فرمایا کہ جو مسلمان اس کے ساتھ کسی بھی چیز کے لیے دعا کرے اللہ اس کی دعا قبول فرماتا ہے۔')),
 dict(id='sayyid-istighfar', cats=['forgive', 'morning'], form='dua', c='bukhari', n=6306, a=('اللهم انت ربي', 'لا يغفر الذنوب الا انت'), e=('O Allah, You are my Lord, there is none worthy of worship except You', 'there is none who can forgive sins except You'), ec=('tirmidhi', 3393),
      occ=('Morning and evening.', 'صبح اور شام۔'), virt=('The Prophet ﷺ called this the most superior way of asking for forgiveness. He said that whoever says it with firm faith in the day and dies before evening, or says it at night and dies before morning, will be among the people of Paradise.', 'نبی ﷺ نے اسے استغفار کا سب سے افضل طریقہ قرار دیا۔ فرمایا کہ جو اسے یقین کے ساتھ دن میں پڑھے اور شام سے پہلے فوت ہو جائے، یا رات میں پڑھے اور صبح سے پہلے فوت ہو جائے تو وہ جنتیوں میں سے ہے۔')),
 dict(id='laylat-qadr', cats=['forgive'], form='dua', c='ibnmajah', n=3850, a=('اللهم انك عفو', 'فاعف عني'), e=('O Allah, You are Forgiving and love forgiveness', 'so forgive me'),
      occ=('Especially on the odd nights of the last ten nights of Ramadan, when seeking Laylat al-Qadr.', 'خاص طور پر رمضان کی آخری دس راتوں کی طاق راتوں میں، شبِ قدر کی تلاش میں۔'), virt=('When Aisha asked what to say if she found Laylat al-Qadr, the Prophet ﷺ taught her this short dua.', 'جب حضرت عائشہؓ نے پوچھا کہ شبِ قدر پا لوں تو کیا کہوں، تو نبی ﷺ نے انہیں یہ مختصر دعا سکھائی۔'), also=[('tirmidhi', 3513)]),
 dict(id='astaghfir-hayy', cats=['forgive'], form='dua', c='abudawud', n=1517, a=('استغفر الله الذي لا اله الا هو', 'واتوب اليه'), e=('I ask pardon of Allah than Whom there is no deity, the Living, the eternal, and I turn to Him in repentance', 'in repentance'),
      occ=('Any time, especially after a mistake.', 'کسی بھی وقت، خاص طور پر غلطی کے بعد۔'), virt=('The Prophet ﷺ said that whoever says this will be forgiven, even if he had fled from the battlefield. Scholars grade this narration as sahih; read the grades below.', 'نبی ﷺ نے فرمایا کہ جو یہ کہے اس کی مغفرت کر دی جاتی ہے خواہ وہ میدانِ جنگ سے بھاگا ہو۔ نیچے علما کے درجات دیکھیں۔'), also=[('tirmidhi', 3577)]),
 dict(id='bismillah-protection', cats=['protect', 'morning'], form='dua', c='abudawud', n=5088, a=('بسم الله الذي لا يضر', 'السميع العليم'), e=('In the name of Allah, when Whose name is mentioned nothing on Earth or in Heaven can cause harm, and He is the Hearer, the Knower', 'the Knower'),
      occ=('Three times in the morning and three times in the evening.', 'صبح تین بار اور شام تین بار۔'), virt=('The Prophet ﷺ said that whoever says this three times in the morning will not suffer a sudden affliction until the evening, and whoever says it three times in the evening will not suffer a sudden affliction until the morning.', 'نبی ﷺ نے فرمایا کہ جو صبح تین بار پڑھے اسے شام تک اچانک آفت نہیں پہنچے گی اور جو شام کو تین بار پڑھے اسے صبح تک اچانک آفت نہیں پہنچے گی۔'), also=[('tirmidhi', 3388), ('ibnmajah', 3869)]),
 dict(id='kalimat-tammat', cats=['protect'], form='dua', c='muslim', n=6878, a=('اعوذ بكلمات الله التامات', 'ما خلق'), e=('I seek refuge in the Perfect Word of Allah from the evil of what He has created', 'created'),
      occ=('When you stop at a place, for example while travelling or staying somewhere new.', 'جب آپ کسی جگہ ٹھہریں، مثلاً سفر میں یا کسی نئی جگہ۔'), virt=('The Prophet ﷺ said that when anyone stops at a place and says this, nothing will harm him until he leaves that place.', 'نبی ﷺ نے فرمایا کہ جو کسی جگہ اترے اور یہ کہے تو وہاں سے کوچ کرنے تک اسے کوئی چیز نقصان نہیں پہنچائے گی۔')),
 dict(id='distress-azim-halim', cats=['hardship'], form='dua', c='bukhari', n=6345, a=('لا اله الا الله العظيم الحليم', 'العرش العظيم'), e=('La ilaha illal-lahu Al-`Azim, al- Halim, La ilaha illal-lahu Rabbu-s-samawati wal-ard wa Rabbu-l-arsh il-azim', 'il-azim'),
      occ=('At times of distress and worry.', 'تکلیف اور پریشانی کے وقت۔'), virt=('Ibn Abbas reported that the Prophet ﷺ used to make this supplication at the time of distress.', 'ابنِ عباسؓ بیان کرتے ہیں کہ نبی ﷺ تکلیف کے وقت یہ دعا کرتے تھے۔')),
 dict(id='hamm-hazan', cats=['hardship', 'protect'], form='dua', c='bukhari', n=6369, a=('اللهم اني اعوذ بك من الهم', 'الرجال'), e=('O Allah! I seek refuge with You from worry and grief, from incapacity and laziness, from cowardice and miserliness, from being heavily in debt and from being overpowered by (other) men', 'by (other) men'),
      occ=('Any time, especially when worried or burdened by debt.', 'کسی بھی وقت، خاص طور پر فکر یا قرض کے بوجھ میں۔'), virt=('Anas reported that the Prophet ﷺ used to say this, asking Allah for protection from worry, grief, weakness, laziness, cowardice, miserliness, heavy debt and being overpowered by men.', 'انسؓ بیان کرتے ہیں کہ نبی ﷺ یہ دعا پڑھا کرتے تھے جس میں فکر، غم، عاجزی، سستی، بزدلی، کنجوسی، قرض کے بوجھ اور لوگوں کے غلبے سے پناہ مانگی گئی ہے۔'), also=[('abudawud', 1541), ('tirmidhi', 3484)]),
 dict(id='rahmatika-arju', cats=['hardship', 'morning'], form='dua', c='abudawud', n=5090, a=('اللهم رحمتك ارجو', 'لا اله الا انت'), e=('O Allah! Thy mercy is what I hope for. Do not abandon me to myself for an instant, but put all my affairs in good order for me. There is no god but Thou', 'There is no god but Thou'),
      occ=('When distressed.', 'پریشانی کے وقت۔'), virt=('The narration calls these "the supplications of one who is distressed". Scholars differ about its grading: Al-Albani graded it hasan (isnad), while Zubair Ali Zai graded it weak.', 'روایت انہیں "پریشان حال شخص کی دعائیں" کہتی ہے۔ اس کی سند کے بارے میں علما کا اختلاف ہے: البانی نے حسن (اسناد) اور زبیر علی زئی نے ضعیف کہا ہے۔')),
 dict(id='ya-hayyu-ya-qayyum', cats=['hardship'], form='dua', c='tirmidhi', n=3524, a=('يا حي يا قيوم برحمتك استغيث', 'استغيث'), e=('O Living, O Self-Sustaining Sustainer! In Your Mercy do I seek relief', 'seek relief'),
      occ=('When something distresses you.', 'جب کوئی بات پریشان کرے۔'), virt=('Anas reported that whenever a matter distressed the Prophet ﷺ he would say this. At-Tirmidhi described the narration as gharib (reported through a single line).', 'انسؓ بیان کرتے ہیں کہ جب کوئی بات نبی ﷺ کو پریشان کرتی تو آپ یہ فرماتے۔ ترمذی نے اس روایت کو غریب کہا ہے۔')),
 dict(id='halal-haram', cats=['rizq'], form='dua', c='tirmidhi', n=3563, a=('اللهم اكفني بحلالك', 'عمن سواك'), e=('O Allah, suffice me with Your lawful against Your prohibited, and make me independent of all those besides You', 'besides You'),
      occ=('When in debt or need, and when asking for lawful provision.', 'قرض یا حاجت میں اور حلال رزق مانگتے وقت۔'), virt=('Ali ؓ said the Prophet ﷺ taught him this, and that if one had a debt like a mountain, Allah would help pay it. This is about asking for lawful provision, not a guarantee for every request.', 'حضرت علیؓ نے بتایا کہ نبی ﷺ نے یہ دعا سکھائی اور فرمایا کہ پہاڑ جتنا قرض ہو تو بھی اللہ ادا کروا دے گا۔ یہ حلال رزق کی دعا ہے، ہر مطالبے کی ضمانت نہیں۔')),
 dict(id='ilman-nafian', cats=['rizq', 'morning'], form='dua', c='ibnmajah', n=925, a=('اللهم اني اسالك علما نافعا', 'متقبلا'), e=('O Allah, I ask You for beneficial knowledge', 'acceptable deeds'),
      occ=('After the salam of the morning (Fajr) prayer.', 'فجر کی نماز کے سلام کے بعد۔'), virt=('Umm Salamah reported that after the morning prayer the Prophet ﷺ would say this. Scholars differ on the grading: Al-Albani graded it sahih, while Zubair Ali Zai graded it weak.', 'ام سلمہؓ بیان کرتی ہیں کہ فجر کی نماز کے سلام کے بعد نبی ﷺ یہ کہا کرتے تھے۔ درجے میں علما کا اختلاف ہے: البانی نے صحیح اور زبیر علی زئی نے ضعیف کہا ہے۔')),
 dict(id='ihdini-saddidni', cats=['guidance'], form='dua', c='muslim', n=6911, a=('اللهم اهدني وسددني', 'وسددني'), e=('O Allah, direct me to the right path and make me adhere to the straight path', 'straight path'),
      occ=('Any time you ask for guidance.', 'ہدایت مانگنے کے کسی بھی وقت۔'), virt=('The Prophet ﷺ taught Ali ؓ to say this, and told him to keep in mind, when asking for guidance, being on the right road, and when asking for straightness, the straightness of an arrow.', 'نبی ﷺ نے حضرت علیؓ کو یہ دعا سکھائی اور فرمایا کہ ہدایت مانگتے وقت راستے پر چلنے کا خیال رکھو اور سیدھا پن مانگتے وقت تیر کی سیدھ کا۔')),
 dict(id='huda-tuqa', cats=['guidance'], form='dua', c='muslim', n=6904, a=('اللهم اني اسالك الهدى', 'والغنى'), e=('O Allah. I beg of Thee the right guidance, safeguard against evils, chastity and freedom from want', 'freedom from want'),
      occ=('Any time.', 'کسی بھی وقت۔'), virt=('Ibn Masud reported that the Prophet ﷺ used to say this, asking for guidance, God-consciousness, chastity and contentment.', 'ابنِ مسعودؓ بیان کرتے ہیں کہ نبی ﷺ یہ دعا کرتے تھے جس میں ہدایت، تقویٰ، پاک دامنی اور بے نیازی مانگی گئی ہے۔'), also=[('tirmidhi', 3489), ('ibnmajah', 3832)]),
 dict(id='muqallib-alqulub', cats=['guidance'], form='dua', c='tirmidhi', n=3522, a=('يا مقلب القلوب', 'على دينك'), e=('O Changer of the hearts, make my heart firm upon Your religion', 'upon Your religion'),
      occ=('Often, and whenever you want steadfastness.', 'اکثر اور جب بھی ثابت قدمی چاہیں۔'), virt=('Umm Salamah said this was the dua the Prophet ﷺ made most often. He explained that every human heart is between two of Allah\'s fingers; He keeps steady whom He wills.', 'ام سلمہؓ نے بتایا کہ یہ وہ دعا ہے جو نبی ﷺ سب سے زیادہ کرتے تھے۔ آپ نے فرمایا کہ ہر انسان کا دل اللہ کی دو انگلیوں کے درمیان ہے، جسے چاہتا ہے ثابت رکھتا ہے۔')),
 dict(id='aslih-li-dini', cats=['guidance'], form='dua', c='muslim', n=6903, a=('اللهم اصلح لي ديني', 'من كل شر'), e=('O Allah, set right for me my religion which is the safeguard of my affairs', 'every evil'),
      occ=('Any time.', 'کسی بھی وقت۔'), virt=('Abu Hurayrah reported that the Prophet ﷺ used to say this, asking Allah to set right religion, worldly affairs and the Hereafter.', 'ابوہریرہؓ بیان کرتے ہیں کہ نبی ﷺ یہ دعا کرتے تھے جس میں دین، دنیا اور آخرت کی اصلاح مانگی گئی ہے۔')),
 dict(id='rabbana-atina', cats=['guidance', 'accept'], form='dua', c='bukhari', n=6389, a=('اللهم ربنا اتنا في الدنيا', 'عذاب النار'), e=('O Allah! Give to us in the world that which is good and in the Hereafter that which is good, and save us from the torment of the Fire', 'torment of the Fire'),
      occ=('Any time. Anas reported it was the Prophet\'s most frequent dua.', 'کسی بھی وقت۔ انسؓ کے مطابق یہ نبی ﷺ کی سب سے زیادہ کی جانے والی دعا تھی۔'), virt=('Anas said this was the most frequent invocation of the Prophet ﷺ. It is also the wording of Quran 2:201.', 'انسؓ نے بتایا کہ نبی ﷺ کی سب سے زیادہ کی جانے والی دعا یہی تھی۔ یہ قرآن (2:201) کے الفاظ بھی ہیں۔')),
 dict(id='asbahna', cats=['morning'], form='dua', c='abudawud', n=5068, a=('اللهم بك اصبحنا', 'النشور'), e=('O Allah, by Thee we come to the morning, by Thee we come to the evening, by Thee are we resurrected', 'resurrected'),
      occ=('In the morning (the evening version replaces "morning" with "evening").', 'صبح کے وقت (شام کو "صبح" کی جگہ "شام" کہا جاتا ہے)۔'), virt=('Abu Hurayrah reported that the Prophet ﷺ used to say this in the morning, and a similar form in the evening.', 'ابوہریرہؓ بیان کرتے ہیں کہ نبی ﷺ صبح کو یہ کہتے تھے اور شام کو اسی کی مثل۔'), also=[('tirmidhi', 3391), ('ibnmajah', 3868)]),
 dict(id='amsayna-mulk', cats=['morning', 'protect'], form='dua', c='muslim', n=6908, a=('امسينا وامسى الملك لله', 'لا شريك له'), e=('We have entered upon evening and so, too, the whole Kingdom of Allah has entered upon evening', 'no partner with Him'),
      occ=('In the evening (in the morning the same words are said with "morning").', 'شام کے وقت (صبح کو اسی طرح "صبح" کے الفاظ کے ساتھ)۔'), virt=('Abdullah ibn Masud reported that the Prophet ﷺ used to say this in the evening and the same in the morning. The narration continues with more words asking for the good of the night and protection from its evil; open the full hadith to read them.', 'عبداللہ بن مسعودؓ بیان کرتے ہیں کہ نبی ﷺ شام کو یہ دعا پڑھتے اور صبح کو بھی اسی طرح، رات کی بھلائی مانگتے اور اس کے شر سے پناہ۔')),
]

# Quran supplications: (id, surah, from_verse, to_verse, cats, occasion, why)
Q = [
 ('q-baqara-201', 2, 201, 201, ['quran', 'guidance'], ('Any time.', 'کسی بھی وقت۔'), ('A comprehensive dua for the good of this life and the next.', 'دنیا اور آخرت دونوں کی بھلائی کی جامع دعا۔')),
 ('q-baqara-286', 2, 286, 286, ['quran', 'forgive'], ('Any time; often recited at the end of the day.', 'کسی بھی وقت۔'), ('The closing supplication of Surah al-Baqarah, asking Allah not to hold us to account for forgetfulness or mistakes and not to burden us beyond our ability.', 'سورۃ البقرہ کی آخری دعا جس میں بھول چوک پر پکڑ نہ ہونے اور طاقت سے زیادہ بوجھ نہ ڈالنے کی التجا ہے۔')),
 ('q-imran-8', 3, 8, 8, ['quran', 'guidance'], ('Any time.', 'کسی بھی وقت۔'), ('A prayer for the heart to stay guided after guidance has come.', 'ہدایت ملنے کے بعد دل کے ہدایت پر رہنے کی دعا۔')),
 ('q-araf-23', 7, 23, 23, ['quran', 'forgive'], ('When repenting.', 'توبہ کے وقت۔'), ('The dua of Adam and Hawwa (peace be upon them) after their mistake.', 'حضرت آدم و حواء علیہما السلام کی غلطی کے بعد کی دعا۔')),
 ('q-taha-25-28', 20, 25, 28, ['quran', 'rizq'], ('Before speaking, teaching or facing a task.', 'بات کرنے، سکھانے یا کسی کام سے پہلے۔'), ('The dua of Musa (peace be upon him) asking for an open heart, an easy task and a clear tongue.', 'حضرت موسیٰ علیہ السلام کی دعا: سینہ کھول دینے، کام آسان کرنے اور زبان کی گرہ کھولنے کی۔')),
 ('q-taha-114', 20, 114, 114, ['quran', 'guidance'], ('When studying or learning.', 'پڑھتے یا سیکھتے وقت۔'), ('"My Lord, increase me in knowledge" is the supplication taught in this verse.', 'اس آیت میں "اے میرے رب میرا علم بڑھا" کی دعا سکھائی گئی ہے۔')),
 ('q-anbiya-87', 21, 87, 87, ['quran', 'hardship', 'ism'], ('In distress.', 'تکلیف میں۔'), ('The supplication of Prophet Yunus (peace be upon him); the hadith above reports its virtue.', 'حضرت یونس علیہ السلام کی دعا؛ اس کی فضیلت اوپر دی گئی حدیث میں ہے۔')),
 ('q-furqan-74', 25, 74, 74, ['quran', 'guidance'], ('Any time, especially for family.', 'کسی بھی وقت، خاص طور پر اہلِ خانہ کے لیے۔'), ('A prayer for righteous spouses and children.', 'نیک شریکِ حیات اور اولاد کی دعا۔')),
 ('q-ibrahim-40-41', 14, 40, 41, ['quran', 'forgive'], ('Any time; for yourself, your parents and the believers.', 'کسی بھی وقت؛ اپنے، والدین اور مومنوں کے لیے۔'), ('The dua of Ibrahim (peace be upon him) for steadfast prayer and forgiveness.', 'حضرت ابراہیم علیہ السلام کی نماز پر قائم رہنے اور مغفرت کی دعا۔')),
 ('q-kahf-10', 18, 10, 10, ['quran', 'guidance'], ('When facing a difficult choice.', 'کسی مشکل فیصلے کے وقت۔'), ('The dua of the youths of the cave, asking for mercy and right guidance.', 'اصحابِ کہف کی دعا: رحمت اور راہِ راست کی۔')),
]

CATS = [
 ('accept', 'Duas for acceptance of supplication', 'قبولیتِ دعا کی احادیث', 'أدعية وأحاديث الإجابة'),
 ('ism', 'Duas containing Ism-e-Azam', 'اسمِ اعظم والی دعائیں', 'أدعية فيها اسم الله الأعظم'),
 ('forgive', 'Forgiveness and repentance', 'مغفرت اور توبہ', 'المغفرة والتوبة'),
 ('protect', 'Protection', 'حفاظت', 'الحماية'),
 ('hardship', 'Difficulties and hardships', 'مشکلات اور پریشانیاں', 'الشدائد والكروب'),
 ('rizq', 'Rizq and barakah', 'رزق اور برکت', 'الرزق والبركة'),
 ('guidance', 'Guidance', 'ہدایت', 'الهداية'),
 ('morning', 'Morning and evening', 'صبح اور شام', 'الصباح والمساء'),
 ('quran', 'Duas from the Quran', 'قرآن کی دعائیں', 'أدعية من القرآن'),
]

# ---- transliteration (rule based, approximate: no pause rules, hamzat al-wasl is not pronounced) ----
LET = {'ب':'b','ت':'t','ث':'th','ج':'j','ح':'ḥ','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'ṣ','ض':'ḍ','ط':'ṭ','ظ':'ẓ','ع':'ʿ','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ء':'ʾ','أ':'ʾ','إ':'ʾ','ؤ':'ʾ','ئ':'ʾ'}
SUN = set('تثدذرزسشصضطظلن')
VW = {'\u064E': 'a', '\u064F': 'u', '\u0650': 'i'}
TAN = {'\u064B': 'an', '\u064C': 'un', '\u064D': 'in'}
LONG = {'a': 'ā', 'u': 'ū', 'i': 'ī'}
MARK = '[\u064B-\u065F\u0670]'
def endv(units):
    m = units[-1][1]
    for x in m:
        if x in VW: return VW[x]
    return ''
def word_tl(word):
    units = []
    for ch in word:
        if re.match(MARK, ch):
            if units: units[-1][1].append(ch)
        elif ch not in '\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u0640\u200f\u200c':
            units.append([ch, []])
    st = strip(''.join(u[0] for u in units))
    if st in ('لا', 'ولا', 'فلا'): return {'لا': 'lā', 'ولا': 'walā', 'فلا': 'falā'}[st]
    if re.fullmatch('[وف]?اله', st): return {'': '', 'و': 'wa', 'ف': 'fa'}[st[0] if st[0] in 'وف' else ''] + 'ilāh' + endv(units)
    if st == 'الا': return 'illā'
    m = re.fullmatch('([وبف]?)(ا?لله)(م?)', st) or re.fullmatch('()(ا?لله)(م?)', st)
    if m:
        if m.group(3): return {'': '', 'و': 'wa', 'ب': 'bi', 'ف': 'fa'}[m.group(1)] + 'Allāhumma'
        v = endv(units)
        if m.group(2) == 'لله': return {'': 'lil', 'و': 'walil', 'ب': 'bilil', 'ف': 'falil'}[m.group(1)] + 'lāh' + v
        return {'': '', 'و': 'wa', 'ب': 'bi', 'ف': 'fa'}[m.group(1)] + ('Allāh' if not m.group(1) else 'llāh') + v
    out = ''; i = 0; n = len(units)
    while i < n:
        L, m = units[i]; nx = units[i + 1] if i + 1 < n else None; pv = units[i - 1] if i else None
        sh = '\u0651' in m; sk = '\u0652' in m
        vow = next((VW[x] for x in m if x in VW), ''); tan = next((TAN[x] for x in m if x in TAN), ''); dag = '\u0670' in m
        pvv = next((VW[x] for x in pv[1] if x in VW), '') if pv else ''
        if L == 'ى' and (m or (nx is None and False)): L = 'ي'
        if L == 'آ': out += 'ā'; i += 1; continue
        if L in 'اٱ':
            if i <= 1 and not m and nx and nx[0] == 'ل' and (i == 0 or (pv and pv[0] in 'وبفلك' and pvv)):
                aft = units[i + 2] if i + 2 < n else None
                if '\u0651' in nx[1] and not (aft and aft[0] in SUN and '\u0651' in aft[1] and False):
                    out += 'a' if i == 0 else ''; i += 1; continue     # al + lam with shadda: alladhī, allāh
                if aft and aft[0] in SUN and '\u0651' in aft[1]: out += 'a' if i == 0 else ''; i += 2; continue
                out += 'al' if i == 0 else 'l'; i += 2; continue
            if i == 0 and not m and nx and '\u0652' in nx[1]:       # hamzat al-wasl before a consonant with sukun: ihdinī, udhkur
                t3 = units[2] if n > 2 else None
                out += 'u' if (t3 and '\u064F' in t3[1]) else 'i'; i += 1; continue
            if i == 1 and not m and pv and pv[0] in 'وف' and nx and '\u0652' in nx[1]:   # wa + wasl alif (waidhkur)
                i += 1; continue
            if tan: out += tan
            elif m and not pvv and not (pv and ('\u0651' in pv[1])): out += 'ā'
            elif out and out[-1] == 'a' and pvv == 'a': out = out[:-1] + 'ā'
            i += 1; continue
        if L in 'وي' and not m and pv and ((L == 'و' and pvv == 'u') or (L == 'ي' and pvv == 'i')) and out and out[-1] in 'ui':
            out = out[:-1] + LONG[out[-1]]; i += 1; continue
        if L == 'ى' and not m and pv:
            if out and out[-1] == 'a': out = out[:-1] + 'ā'
            i += 1; continue
        if L == 'ة':
            out += ('tt' if sh else 't') + (vow or '') + tan if (vow or tan or sh) else 'h'; i += 1; continue
        if L in 'وي' and not vow and not tan and not sh and pv and pvv == 'a' and not nx:
            out += 'w' if L == 'و' else 'y'; i += 1; continue
        if L in 'وي' and not vow and not tan and not sh and not m and pv and pvv == 'a':
            out += 'w' if L == 'و' else 'y'; i += 1; continue
        if L in 'وي' and sk and pv and pvv == 'a' and not vow:
            out += 'w' if L == 'و' else 'y'; i += 1; continue
        base = LET.get(L, '')
        if L in 'ءأإؤئ' and i == 0: base = ''
        out += (base + base if sh else base) + (vow or '')
        if dag: out += 'ā'
        if tan: out += tan
        i += 1
    return out
def translit(text):
    return ' '.join(word_tl(w) for w in re.sub('[\u200f]', '', text).split())

def inbook(c, h):
    an = h.get('an')
    if c == 'muslim' and isinstance(an, str) and '.' in an:
        base, sub = an.split('.'); k = int(sub)
        return base + ('abcdefghijklmnopqrstuvwxyz'[k - 1] if k <= 26 else '')
    return an

TITLES = {
 'between-adhan-iqama': ('Dua between the adhan and the iqama', 'اذان اور اقامت کے درمیان کی دعا'),
 'three-answered': ('Three supplications that are answered', 'تین مقبول دعائیں'),
 'hands-raised': ('Allah is shy to return raised hands empty', 'اٹھے ہاتھ خالی لوٹانے سے اللہ حیا فرماتا ہے'),
 'dua-for-brother': ('Dua for your brother in his absence', 'بھائی کے لیے پیٹھ پیچھے دعا'),
 'ism-azam-ahad-samad': ('Dua with the Greatest Name (Al-Ahad, As-Samad)', 'اسمِ اعظم والی دعا (الاحد، الصمد)'),
 'ism-azam-mannan': ('Dua with the Greatest Name (Al-Mannan)', 'اسمِ اعظم والی دعا (المنان)'),
 'ism-azam-two-verses': ('The Greatest Name in two verses', 'دو آیات میں اسمِ اعظم'),
 'yunus': ('The dua of Prophet Yunus', 'حضرت یونس علیہ السلام کی دعا'),
 'sayyid-istighfar': ('Sayyid al-Istighfar: the master dua of forgiveness', 'سید الاستغفار'),
 'laylat-qadr': ('Dua for Laylat al-Qadr', 'شبِ قدر کی دعا'),
 'astaghfir-hayy': ('Seeking forgiveness: Astaghfirullah alladhi la ilaha illa huwa', 'استغفار: أستغفر الله الذي لا إله إلا هو'),
 'bismillah-protection': ('Bismillahi alladhi la yadurru ma\'asmihi', 'بسم الله الذي لا يضر مع اسمه'),
 'kalimat-tammat': ('Seeking refuge in the perfect words of Allah', 'اللہ کے کامل کلمات کے ذریعے پناہ'),
 'distress-azim-halim': ('Dua at times of distress', 'پریشانی کے وقت کی دعا'),
 'hamm-hazan': ('Refuge from worry, grief and debt', 'فکر، غم اور قرض سے پناہ'),
 'rahmatika-arju': ('Dua of the distressed: Allahumma rahmataka arju', 'پریشان حال کی دعا: اللهم رحمتك أرجو'),
 'ya-hayyu-ya-qayyum': ('Ya Hayyu Ya Qayyum, I seek relief in Your mercy', 'يا حي يا قيوم برحمتك أستغيث'),
 'halal-haram': ('Dua for lawful provision and freedom from debt', 'حلال رزق اور قرض سے آزادی کی دعا'),
 'ilman-nafian': ('Beneficial knowledge, good provision, accepted deeds', 'نفع بخش علم، پاکیزہ رزق، مقبول عمل'),
 'ihdini-saddidni': ('Guide me and keep me on the straight path', 'مجھے ہدایت دے اور سیدھا رکھ'),
 'huda-tuqa': ('Guidance, God-consciousness, chastity and contentment', 'ہدایت، تقویٰ، پاک دامنی اور بے نیازی'),
 'muqallib-alqulub': ('O Turner of hearts, keep my heart firm', 'اے دلوں کے پھیرنے والے، میرا دل ثابت رکھ'),
 'aslih-li-dini': ('Set right my religion, my world and my Hereafter', 'میرے دین، دنیا اور آخرت کی اصلاح فرما'),
 'rabbana-atina': ('Rabbana atina: good in this world and the next', 'ربنا آتنا: دنیا اور آخرت کی بھلائی'),
 'asbahna': ('Morning and evening remembrance: Allahumma bika asbahna', 'صبح و شام کا ذکر: اللهم بك أصبحنا'),
 'amsayna-mulk': ('Evening dua: Amsayna wa amsa al-mulku lillah', 'شام کی دعا: أمسينا وأمسى الملك لله'),
 'q-baqara-201': ('Rabbana atina fid-dunya hasanah', 'ربنا آتنا في الدنيا حسنة'),
 'q-baqara-286': ('Rabbana la tu\'akhidhna: the end of Surah al-Baqarah', 'ربنا لا تؤاخذنا: سورۃ البقرہ کی آخری دعا'),
 'q-imran-8': ('Rabbana la tuzigh qulubana', 'ربنا لا تزغ قلوبنا'),
 'q-araf-23': ('Rabbana zalamna anfusana', 'ربنا ظلمنا أنفسنا'),
 'q-taha-25-28': ('Rabbi ishrah li sadri: the dua of Musa', 'رب اشرح لي صدري: حضرت موسیٰ کی دعا'),
 'q-taha-114': ('Rabbi zidni ilma', 'رب زدني علما'),
 'q-anbiya-87': ('La ilaha illa anta subhanaka: Surah al-Anbiya', 'لا إله إلا أنت سبحانك: سورۃ الانبیاء'),
 'q-furqan-74': ('Rabbana hab lana min azwajina', 'ربنا هب لنا من أزواجنا'),
 'q-ibrahim-40-41': ('Rabbi ij\'alni muqima as-salah: the dua of Ibrahim', 'رب اجعلني مقيم الصلاة: حضرت ابراہیم کی دعا'),
 'q-kahf-10': ('Rabbana atina min ladunka rahmah', 'ربنا آتنا من لدنك رحمة'),
}

# ---- build ----
def build():
    out = []
    for e in H:
        h = hadith(e['c'], e['n'])
        ar_all = h['ar']; mi = h.get('mi', 0)
        a0, a1 = e['full'] if e.get('full') else e['a']
        ar = cut(ar_all, a0, a1)
        en_text = h['t'].get('en', '')
        en_src = None
        if e.get('ec'):
            en_text = hadith(*e['ec'])['t'].get('en', ''); en_src = f"{BOOKS[e['ec'][0]]} {e['ec'][1]} (the same supplication)"
        en = cut_en(en_text, *e['e']) if e['e'] else None
        g = grade(e['c'], h)
        if e['c'] in ('bukhari', 'muslim'): g['graders'] = []
        ref_in_book = inbook(e['c'], h)
        out.append({
            'id': e['id'], 'title': {'en': TITLES[e['id']][0], 'ur': TITLES[e['id']][1]}, 'cats': e['cats'], 'kind': e['form'], 'enSrc': en_src, 'ar': ar, 'tl': translit(cut(ar_all, *e['a'])) if e['form'] == 'dua' else '', 'en': en,
            'src': {'c': e['c'], 'n': e['n'], 'book': BOOKS[e['c']], 'ref': (str(ref_in_book) if ref_in_book not in (None, '', 0) else str(e['n'])), 'ch': h.get('ref', [0, 0])[0], 'sec': h['sec']},
            'also': [{'c': c, 'n': n, 'book': BOOKS[c], 'grade': grade(c, hadith(c, n))['label']} for c, n in e.get('also', [])],
            'grade': g, 'occ': {'en': e['occ'][0], 'ur': e['occ'][1]}, 'virt': {'en': e['virt'][0], 'ur': e['virt'][1]}
        })
    for (id_, s, v0, v1, cats, occ, why) in Q:
        q = json.load(open(f'{D}/q/{s}.json'))
        vs = [x for x in q if v0 <= x['v'] <= v1]
        if len(vs) != v1 - v0 + 1: raise SystemExit(f'verses missing {s}:{v0}-{v1}')
        name = json.load(open(f'{D}/q/surahs.json'))['surahs'][s - 1]
        out.append({
            'id': id_, 'title': {'en': TITLES[id_][0], 'ur': TITLES[id_][1]}, 'cats': cats, 'kind': 'quran', 'ar': ' '.join(x['ar'] for x in vs), 'tl': ' '.join(x['tl'] for x in vs), 'en': ' '.join(x['t']['en'] for x in vs), 'ur': ' '.join(x['t'].get('ur', '') for x in vs),
            'src': {'s': s, 'v': v0, 'to': v1, 'book': 'Quran', 'ref': f'{s}:{v0}' + (f'-{v1}' if v1 != v0 else ''), 'name': name['name'], 'surah_en': name['en']},
            'grade': {'class': 'q', 'label': 'Quran', 'graders': [], 'note': 'A verse of the Quran.', 'differ': False}, 'occ': {'en': occ[0], 'ur': occ[1]}, 'virt': {'en': why[0], 'ur': why[1]}
        })
    json.dump({'cats': [{'id': c, 'en': e, 'ur': u, 'ar': a} for c, e, u, a in CATS], 'duas': out}, open('src/lib/special-duas.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(out), 'duas written')
    for d in out: print(d['id'], '|', d['src']['book'], d['src']['ref'], '|', d['grade']['label'], '| differ' if d['grade']['differ'] else '')

build()
