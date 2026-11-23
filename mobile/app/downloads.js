import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Share, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/lib/settings';
import { Button, Screen } from '../src/components/ui';
import { T } from '../src/components/text';
import { ChipRow, FilterChip, IconButton, LeadingBadge, ListGroup, ListItem, ProgressBar, Segmented, TopAppBar } from '../src/components/m3';
import { useOfflineVersion } from '../src/components/OfflineBits';
import { useOnline } from '../src/lib/net';
import * as store from '../src/lib/offline-store';
import { downloader } from '../src/lib/downloads';
import { HADITH_LANGS, fmtBytes, hadithEstimate, quranAudioEstimate, quranTextEstimate, surahCount, verseCount } from '../src/lib/offline-catalog';
import { RECITERS, reciterById } from '../src/lib/reciters';
import { TRANSLATION_CHOICES } from '../src/lib/languages';
import COLLECTIONS from '../src/lib/collections.json';
import SURAHS from '../src/lib/surahs.json';
import { exportText, readLocalSnapshot, restoreFrom } from '../src/lib/backup';

const useGroups = () => {
  const dl = downloader();
  const [, tick] = useState(0);
  useEffect(() => dl.subscribe(() => tick((x) => x + 1)), [dl]);
  return dl.list();
};

const LANG_NAME = { en: 'English', ur: 'Urdu', bn: 'Bengali', id: 'Indonesian', tr: 'Turkish', fr: 'French', ru: 'Russian', ta: 'Tamil' };

function StorageCard() {
  const { colors } = useApp();
  useOfflineVersion();
  const [d, setD] = useState({ free: 0, total: 0 });
  useEffect(() => { store.disk().then(setD); }, [store.version.n]);
  const used = store.totalBytes();
  return (
    <View style={{ margin: 16, padding: 16, borderRadius: 20, backgroundColor: colors.surfaceHigh, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="phone-portrait-outline" size={22} color={colors.primary} />
        <T variant="titleMedium">Offline library: {fmtBytes(used)}</T>
      </View>
      {d.total ? <ProgressBar value={Math.min(1, (d.total - d.free) / d.total)} /> : null}
      <T variant="bodySmall" color={colors.muted}>{d.total ? `${fmtBytes(d.free)} free of ${fmtBytes(d.total)} on this phone.` : 'Free space could not be read.'} Downloads are kept on this phone only, in DALIL's private storage.</T>
    </View>
  );
}

function GroupRow({ g }) {
  const { colors } = useApp();
  const dl = downloader();
  const pct = g.totalBytes ? Math.min(1, g.doneBytes / g.totalBytes) : 0;
  const working = g.status === 'downloading';
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <T variant="titleSmall">{g.title}</T>
          <T variant="bodySmall" color={g.status === 'error' ? colors.danger : colors.muted}>
            {g.status === 'done' ? `Done · ${fmtBytes(g.doneBytes)}` : g.status === 'error' || g.status === 'paused' ? g.error || 'Paused' : `${g.doneCount} of ${g.jobs.length} files · ${fmtBytes(g.doneBytes)} of about ${fmtBytes(g.totalBytes)}`}
          </T>
        </View>
        {working ? <IconButton icon="pause" label="Pause" onPress={() => dl.pause(g.id)} /> : null}
        {g.status === 'paused' || g.status === 'error' ? <IconButton icon="play" label="Resume" onPress={() => dl.resume(g.id)} /> : null}
        {g.status !== 'done' ? <IconButton icon="close" label="Cancel" onPress={() => dl.cancel(g.id)} /> : null}
      </View>
      {g.status !== 'done' ? <ProgressBar value={pct} /> : null}
    </View>
  );
}

function Active() {
  const groups = useGroups().filter((g) => g.status !== 'done');
  if (!groups.length) return null;
  return <ListGroup title="Downloading">{groups.map((g) => <GroupRow key={g.id} g={g} />)}</ListGroup>;
}

async function begin(spec, title) {
  try { await downloader().start(spec, title); }
  catch (e) {
    if (e && e.message === 'not-enough-space') Alert.alert('Not enough space', `This needs about ${fmtBytes(e.need)} but only ${fmtBytes(e.free)} is free. Free some space or choose less.`);
    else Alert.alert('Could not start', 'Something went wrong starting the download. Please try again.');
  }
}
const confirmDelete = (title, run) => Alert.alert(`Delete ${title}?`, 'It will be removed from this phone. You can download it again any time.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: run }]);

/* ------------------------------------------------------------------ Quran tab */
function QuranTab() {
  const { colors, settings } = useApp();
  const online = useOnline();
  useOfflineVersion();
  const groups = useGroups();
  const busy = (id) => groups.find((g) => g.id === id && g.status !== 'done');
  const [trans, setTrans] = useState(() => Array.from(new Set([settings.tr, settings.tr2, 'en'].filter(Boolean))).slice(0, 3));
  const [reciter, setReciter] = useState(settings.reciter || 'alafasy');
  const [open, setOpen] = useState(false);
  const toggle = (k) => setTrans((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]));

  const rels = new Set(store.allRels());
  const haveText = Array.from({ length: surahCount() }, (_, i) => rels.has(`q/${i + 1}.json`));
  const textCount = haveText.filter(Boolean).length;
  const r = reciterById(reciter);
  const audioDir = r.type === 'surah' ? r.slug : r.folder;
  const audioHave = {};
  for (const rel of rels) { const m = rel.startsWith(`a/${audioDir}/`) && /(\d{3})(\d{3})?\.mp3$/.exec(rel); if (m) audioHave[Number(m[1])] = (audioHave[Number(m[1])] || 0) + 1; }
  const audioDone = (n) => (audioHave[n] || 0) >= (r.type === 'surah' ? 1 : verseCount(n));
  const audioCount = Array.from({ length: surahCount() }, (_, i) => audioDone(i + 1)).filter(Boolean).length;
  const textBytes = store.bytesWhere((x) => /^q\/\d+\.json$/.test(x));
  const audioBytes = store.bytesWhere((x) => x.startsWith(`a/${audioDir}/`));
  const allTextEst = Array.from({ length: surahCount() }, (_, i) => quranTextEstimate(i + 1, trans)).reduce((a, b) => a + b, 0);
  const allAudioEst = Array.from({ length: surahCount() }, (_, i) => quranAudioEstimate(reciter, i + 1)).reduce((a, b) => a + b, 0);

  return (
    <>
      <ListGroup title="Quran text and translations">
        <View style={{ padding: 16, gap: 10 }}>
          <T variant="bodyMedium" color={colors.muted}>Arabic text and transliteration are always included. Choose the translations to keep offline; each one adds a little.</T>
          <ChipRow>{TRANSLATION_CHOICES.map((c) => <FilterChip key={c.key} label={`${c.native}${c.key.endsWith('2') ? ' 2' : ''}`} selected={trans.includes(c.key)} onPress={() => toggle(c.key)} />)}</ChipRow>
          <T variant="labelLarge">{textCount === surahCount() ? 'All 114 surahs are downloaded' : `${textCount} of ${surahCount()} surahs downloaded`}{textBytes ? ` · ${fmtBytes(textBytes)}` : ''}</T>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button icon="download-outline" label={`Download all text (${fmtBytes(allTextEst)})`} disabled={!online || !!busy('text:all')} onPress={() => begin({ type: 'text', surahs: 'all', trans }, 'Quran text')} />
            {textCount ? <Button kind="secondary" icon="trash-outline" label="Delete text" onPress={() => confirmDelete('all Quran text', () => downloader().remove({ type: 'text', surahs: 'all' }))} /> : null}
          </View>
          {!online ? <T variant="bodySmall" color={colors.muted}>Connect to the internet to download.</T> : null}
        </View>
      </ListGroup>

      <ListGroup title="Recitation audio">
        <View style={{ padding: 16, gap: 10 }}>
          <T variant="bodyMedium" color={colors.muted}>Choose a reciter. Audio is large; sizes shown are estimates until the files are saved.</T>
          <ChipRow>{RECITERS.map((x) => <FilterChip key={x.id} label={x.en} selected={reciter === x.id} onPress={() => setReciter(x.id)} />)}</ChipRow>
          <T variant="labelLarge">{audioCount} of {surahCount()} surahs downloaded for {r.en}{audioBytes ? ` · ${fmtBytes(audioBytes)}` : ''}</T>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button icon="download-outline" label={`Download all audio (about ${fmtBytes(allAudioEst)})`} disabled={!online || !!busy(`audio:${reciter}:all`)}
              onPress={() => Alert.alert('Download the whole Quran audio?', `This is about ${fmtBytes(allAudioEst)} and can take a long time. Wi-Fi is recommended.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Download', onPress: () => begin({ type: 'audio', reciter, surahs: 'all' }, `Quran audio · ${r.en}`) }])} />
            {audioCount ? <Button kind="secondary" icon="trash-outline" label="Delete audio" onPress={() => confirmDelete(`${r.en} audio`, () => downloader().remove({ type: 'audio', reciter, surahs: 'all' }))} /> : null}
          </View>
        </View>
      </ListGroup>

      <ListGroup title="Choose surahs">
        <ListItem onPress={() => setOpen((o) => !o)} leading={<LeadingBadge icon="list" tone="neutral" />} headline={open ? 'Hide the surah list' : 'Download single surahs'} supporting="Text and audio, one surah at a time" trailing={<Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />} />
        {open ? SURAHS.surahs.map((s) => (
          <View key={s.n} style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 6, borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
            <T variant="titleSmall">{s.n}. {s.name} <T variant="bodySmall" color={colors.muted}>· {s.verses} ayat</T></T>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {haveText[s.n - 1]
                ? <FilterChip label="Text downloaded" selected icon="checkmark" onPress={() => confirmDelete(`${s.name} text`, () => downloader().remove({ type: 'text', surahs: [s.n] }))} />
                : <FilterChip label={`Text ${fmtBytes(quranTextEstimate(s.n, trans))}`} icon="download-outline" onPress={() => online ? begin({ type: 'text', surahs: [s.n], trans }, `${s.name} text`) : Alert.alert('You are offline', 'Connect to the internet to download.')} />}
              {audioDone(s.n)
                ? <FilterChip label="Audio downloaded" selected icon="checkmark" onPress={() => confirmDelete(`${s.name} audio`, () => downloader().remove({ type: 'audio', reciter, surahs: [s.n] }))} />
                : <FilterChip label={`Audio ~${fmtBytes(quranAudioEstimate(reciter, s.n))}`} icon="download-outline" onPress={() => online ? begin({ type: 'audio', reciter, surahs: [s.n] }, `${s.name} audio · ${r.en}`) : Alert.alert('You are offline', 'Connect to the internet to download.')} />}
            </View>
          </View>
        )) : null}
      </ListGroup>
    </>
  );
}

/* ------------------------------------------------------------------ Hadith tab */
function HadithTab() {
  const { colors, settings } = useApp();
  const online = useOnline();
  useOfflineVersion();
  const groups = useGroups();
  const [langs, setLangs] = useState(() => Array.from(new Set([settings.tr, settings.tr2, 'en'].filter(Boolean).map((k) => k.slice(0, 2)).filter((k) => HADITH_LANGS.includes(k)))));
  const toggle = (k) => setLangs((l) => (l.includes(k) ? l.filter((x) => x !== k) : [...l, k]));
  const name = (c) => (settings.ui === 'ur' ? c.ur : settings.ui === 'ar' ? c.ar : c.en);
  const books = COLLECTIONS.collections;
  return (
    <>
      <ListGroup title="Languages to keep offline">
        <View style={{ padding: 16, gap: 8 }}>
          <T variant="bodyMedium" color={colors.muted}>The Arabic is always kept. Fewer languages means much smaller downloads.</T>
          <ChipRow>{HADITH_LANGS.map((k) => <FilterChip key={k} label={LANG_NAME[k]} selected={langs.includes(k)} onPress={() => toggle(k)} />)}</ChipRow>
        </View>
      </ListGroup>
      <ListGroup title="Hadith books">
        {books.map((c, i) => {
          const have = store.entry(`c/${c.id}.json`);
          const files = store.countWhere((r) => r.startsWith(`c/${c.id}/`));
          const bytes = store.bytesWhere((r) => r === `c/${c.id}.json` || r.startsWith(`c/${c.id}/`));
          const g = groups.find((x) => x.id === `hadith:${c.id}` && x.status !== 'done');
          const complete = have && !g && files > 0;
          return (
            <ListItem key={c.id} divider={i < books.length - 1}
              leading={<LeadingBadge icon={complete ? 'checkmark-circle' : 'cloud-outline'} tone={complete ? 'primary' : 'neutral'} />}
              headline={name(c)}
              supporting={g ? `${g.doneCount} of ${g.jobs.length} files · ${g.status === 'downloading' ? 'downloading' : g.status}` : complete ? `Downloaded · ${fmtBytes(bytes)}` : `${c.count.toLocaleString()} hadith · about ${fmtBytes(hadithEstimate(c.id, langs))}`}
              trailing={g ? <IconButton icon={g.status === 'downloading' ? 'pause' : 'play'} label={g.status === 'downloading' ? 'Pause' : 'Resume'} onPress={() => (g.status === 'downloading' ? downloader().pause(g.id) : downloader().resume(g.id))} />
                : complete ? <IconButton icon="trash-outline" label={`Delete ${c.en}`} onPress={() => confirmDelete(c.en, () => downloader().remove({ type: 'hadith', cid: c.id }))} />
                : <IconButton icon="download-outline" label={`Download ${c.en}`} onPress={() => (online ? begin({ type: 'hadith', cid: c.id, langs }, c.en) : Alert.alert('You are offline', 'Connect to the internet to download.'))} />} />
          );
        })}
      </ListGroup>
    </>
  );
}

/* ------------------------------------------------------------------ Learn, status and backup */
function Status({ ok, partial, text, icon }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9 }}>
      <Ionicons name={ok ? 'checkmark-circle' : partial ? 'remove-circle' : 'cloud-offline-outline'} size={22} color={ok ? colors.primary : partial ? '#C98A1B' : colors.outline} />
      <T variant="bodyMedium" style={{ flex: 1 }}>{text}</T>
    </View>
  );
}

function MoreTab() {
  const { colors } = useApp();
  const online = useOnline();
  useOfflineVersion();
  const groups = useGroups();
  const rels = store.allRels();
  const essentials = ['q/surahs.json', 'collections.json', 'duas.json', 'glossary.json'].every((r) => store.has(r));
  const wordFiles = rels.filter((r) => r.startsWith('w/')).length;
  const [speech, setSpeech] = useState('');
  const prepareSpeech = async () => {
    try {
      const { ExpoSpeechRecognitionModule: M } = require('expo-speech-recognition');
      if (Platform.OS !== 'android') { setSpeech('Offline speech recognition is set up on Android only.'); return; }
      const r = await M.androidTriggerOfflineModelDownload({ locale: 'ar-SA' });
      setSpeech(r.status === 'download_success' ? 'The Arabic offline speech model is installed.' : r.status === 'download_scheduled' ? 'The Arabic speech model will download in the background (it may wait for Wi-Fi).' : 'Follow the phone prompt to download the Arabic speech model.');
    } catch { setSpeech('This phone could not start the speech model download. Recitation practice then needs internet.'); }
  };
  return (
    <>
      <ListGroup title="Small essentials">
        <ListItem leading={<LeadingBadge icon={essentials ? 'checkmark-circle' : 'cloud-outline'} tone={essentials ? 'primary' : 'neutral'} />} headline="Surah names, book list, duas" supporting={essentials ? 'Downloaded and kept fresh' : 'Tiny (under 100 KB). Already built into the app; this keeps them up to date.'}
          trailing={essentials ? null : <IconButton icon="download-outline" label="Download essentials" onPress={() => (online ? begin({ type: 'essentials' }, 'Essentials') : Alert.alert('You are offline', 'Connect to the internet to download.'))} />} />
        <ListItem leading={<LeadingBadge icon={wordFiles ? 'checkmark-circle' : 'cloud-outline'} tone={wordFiles ? 'primary' : 'neutral'} />} headline="Word audio for Learn Arabic" supporting={wordFiles ? `${wordFiles} recordings downloaded` : 'Real recitation of each word. Without it the phone\'s own Arabic voice is used.'}
          trailing={wordFiles ? <IconButton icon="trash-outline" label="Delete word audio" onPress={() => confirmDelete('word audio', () => downloader().remove({ type: 'words' }))} /> : <IconButton icon="download-outline" label="Download word audio" onPress={() => (online ? begin({ type: 'words' }, 'Word audio') : Alert.alert('You are offline', 'Connect to the internet to download.'))} />} />
      </ListGroup>

      <ListGroup title="Recitation practice offline">
        <View style={{ padding: 16, gap: 10 }}>
          <T variant="bodyMedium" color={colors.muted}>Checking your recitation uses your phone's speech recognition. Offline, it needs the surah text downloaded and the Arabic speech model installed on the phone.</T>
          <Button kind="secondary" icon="mic-outline" label="Install Arabic speech model" onPress={prepareSpeech} disabled={Platform.OS === 'web'} />
          {speech ? <T variant="bodySmall" color={colors.muted}>{speech}</T> : null}
        </View>
      </ListGroup>
    </>
  );
}

function StatusList() {
  const { colors } = useApp();
  useOfflineVersion();
  const rels = store.allRels();
  const textCount = rels.filter((r) => /^q\/\d+\.json$/.test(r)).length;
  const audioSurahs = new Set(rels.filter((r) => /^a\//.test(r)).map((r) => r.split('/')[1])).size;
  const books = rels.filter((r) => /^c\/[^/]+\.json$/.test(r)).length;
  const word = rels.filter((r) => r.startsWith('w/')).length;
  return (
    <ListGroup title="What works without internet">
      <Status ok text="15-line Mushaf (page by page)" />
      <Status ok text="Learn Quran, Learn Arabic and Special Duas, with their audio" />
      <Status ok text="Duas, surah names and search" />
      <Status ok text="Prayer times, Qibla and reminders (calculated on your phone)" />
      <Status ok={textCount === surahCount()} partial={textCount > 0} text={textCount === surahCount() ? 'Quran reader: all 114 surahs and your downloaded translations' : textCount ? `Quran reader: ${textCount} of 114 surahs downloaded` : 'Quran reader: needs a download (or the Mushaf)'} />
      <Status ok={audioSurahs > 0} partial={false} text={audioSurahs > 0 ? 'Recitation: downloaded surahs only' : 'Recitation audio: not downloaded'} />
      <Status ok={books > 0} partial={false} text={books > 0 ? `Hadith: ${books} of ${COLLECTIONS.collections.length} books downloaded` : 'Hadith: books not downloaded'} />
      <Status ok={word > 0} partial={false} text={word > 0 ? 'Word audio: downloaded' : 'Word audio: uses the phone voice offline'} />
      <T variant="bodySmall" color={colors.muted} style={{ paddingHorizontal: 16, paddingBottom: 12 }}>Spoken Urdu translation audio needs the internet. Tafsir is not part of DALIL yet.</T>
    </ListGroup>
  );
}

function BackupTab() {
  const { colors } = useApp();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const save = async () => {
    try { const snap = await readLocalSnapshot(); await Share.share({ message: exportText(snap), title: 'DALIL backup' }); }
    catch { setMsg('The backup could not be shared.'); }
  };
  const restore = async () => {
    try { await restoreFrom(text); setText(''); setMsg('Restored and merged without duplicates. Close and reopen DALIL to see everything.'); }
    catch (e) { setMsg(e.message || 'Could not restore.'); }
  };
  return (
    <>
      <ListGroup title="Keep your data safe">
        <View style={{ padding: 16, gap: 10 }}>
          <T variant="bodyMedium" color={colors.muted}>DALIL has no accounts and no server, so your bookmarks, reading history, streak and learning progress live on this phone. Make a backup you can keep (for example send it to yourself) and merge it into this or another phone later.</T>
          <Button icon="share-outline" label="Back up my data" onPress={save} />
        </View>
      </ListGroup>
      <ListGroup title="Restore from a backup">
        <View style={{ padding: 16, gap: 10 }}>
          <TextInput value={text} onChangeText={setText} multiline placeholder="Paste the whole backup text here" placeholderTextColor={colors.muted} accessibilityLabel="Backup text"
            style={{ minHeight: 100, maxHeight: 180, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, padding: 12, color: colors.ink }} />
          <Button kind="secondary" icon="refresh" label="Merge backup into this phone" onPress={restore} disabled={!text.trim()} />
          {msg ? <T variant="bodySmall" color={colors.muted}>{msg}</T> : null}
        </View>
      </ListGroup>
    </>
  );
}

export default function Downloads() {
  const { colors } = useApp();
  const router = useRouter();
  const online = useOnline();
  const [tab, setTab] = useState('quran');
  useEffect(() => { store.init().then(() => downloader().restore()); }, []);
  return (
    <Screen>
      <TopAppBar title="Download Manager" subtitle={online ? 'Online' : 'Offline: showing what is on this phone'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {Platform.OS === 'web' ? (
          <View style={{ margin: 16, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceHigh }}><T>Offline downloads are available in the Android app. This website already caches the pages you open.</T></View>
        ) : (
          <>
            <StorageCard />
            <Active />
            <View style={{ padding: 16 }}>
              <Segmented value={tab} onChange={setTab} options={[['quran', 'Quran', 'book-outline'], ['hadith', 'Hadith', 'library-outline'], ['more', 'More', 'apps-outline'], ['backup', 'Backup', 'save-outline']]} />
            </View>
            {tab === 'quran' ? <QuranTab /> : tab === 'hadith' ? <HadithTab /> : tab === 'more' ? <><StatusList /><MoreTab /></> : <BackupTab />}
            <View style={{ padding: 16 }}>
              <Button kind="secondary" icon="trash-outline" label="Delete all downloads" onPress={() => confirmDelete('all downloads', async () => { for (const g of downloader().list()) await downloader().cancel(g.id); await store.removeAll(); })} />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
