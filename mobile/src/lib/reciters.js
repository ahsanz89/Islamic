export const AUDIO = {
  ayah: (folder, s, v) => `https://everyayah.com/data/${folder}/${String(s).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`,
  urdu: (s, v) => `https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/${String(s).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`,
  surahFile: (slug, s) => `https://cdn.mp3quran.net/download/audio/${slug}/r1/${String(s).padStart(3, '0')}.mp3`
};
export const RECITERS = [
  { id: 'alafasy', folder: 'Alafasy_128kbps', en: 'Mishary Rashid Alafasy' },
  { id: 'badr', type: 'surah', slug: 'badr-turki', en: 'Badr Al-Turki' },
  { id: 'sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps', en: 'Abdul Rahman Al-Sudais' },
  { id: 'shuraim', folder: 'Saood_ash-Shuraym_128kbps', en: 'Saud Al-Shuraim' },
  { id: 'muaiqly', folder: 'MaherAlMuaiqly128kbps', en: 'Maher Al-Muaiqly' },
  { id: 'abdulbasit', folder: 'Abdul_Basit_Murattal_192kbps', en: 'Abdul Basit Abdus Samad' },
  { id: 'husary', folder: 'Husary_128kbps', en: 'Mahmoud Khalil Al-Husary' },
  { id: 'minshawi', folder: 'Minshawy_Murattal_128kbps', en: 'Muhammad Siddiq Al-Minshawi' },
  { id: 'ghamdi', folder: 'Ghamadi_40kbps', en: 'Saad Al-Ghamdi' },
  { id: 'rifai', folder: 'Hani_Rifai_192kbps', en: 'Hani Ar-Rifai' },
  { id: 'dosari', folder: 'Yasser_Ad-Dussary_128kbps', en: 'Yasser Al-Dosari' }
];
export const reciterById = (id) => RECITERS.find((r) => r.id === id) || RECITERS[0];
