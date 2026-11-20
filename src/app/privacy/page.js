export const metadata = { title: 'Privacy policy' };

export default function Page() {
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>Privacy policy</h1>
        <p className="muted">DALIL website and mobile app. Last updated 20 November 2026.</p>
      </div>
      <section>
        <h2>The short version</h2>
        <p>DALIL has no accounts, no ads, no analytics and no tracking. We do not collect, sell or share personal information. Your reading preferences stay on your own device.</p>
      </section>
      <section>
        <h2>What is stored on your device</h2>
        <p>The app and website remember your choices so they work the way you left them: preferred translation(s), app language, text size, appearance, reciter, bookmarks, and the place you last read. Downloaded Quran, hadith and dua text is cached so it opens faster and works offline. All of this stays on your device. You can remove it at any time from Settings (clear downloaded content) or by uninstalling the app or clearing site data.</p>
      </section>
      <section>
        <h2>What leaves your device</h2>
        <p>To show content, the app downloads text files from this website (ahsanz89.github.io) and, when you press play, audio files from public servers: everyayah.com, cdn.mp3quran.net and audio.qurancdn.com. Like any web request, these servers can see your IP address and the file requested. We do not control those servers; please see their own policies. No identifier, account or personal information is sent by DALIL.</p>
      </section>
      <section>
        <h2>Permissions</h2>
        <p>The app does not ask for location, contacts, camera, photos or notifications. Audio can continue playing when the screen is off. The only sensitive permission is the microphone, and it is used only if you choose to use Recitation practice in the mobile app (see below).</p>
      </section>
      <section>
        <h2>Recitation practice (microphone)</h2>
        <p>If you press Start in Recitation practice, the app asks for permission to use your microphone and the speech recognition service of your phone. It listens only while you are reciting, turns your speech into text on the spot and compares that text with the verified words of the ayah. DALIL does not save, record, upload or share your voice, and has no access to it afterwards. Only the words checked and the ayat you have completed are remembered, on your own device. Android's speech recognition is provided by your phone's speech service (usually Google), which may process the audio on its servers under that provider's own privacy policy, outside our control. You can refuse or withdraw the microphone permission at any time in your phone settings; the rest of the app works without it. This feature checks recognised words only and does not judge tajweed.</p>
      </section>
      <section>
        <h2>Children</h2>
        <p>DALIL is suitable for all ages and collects no personal information from anyone, including children.</p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>If this policy changes, the new version will appear on this page with a new date. Questions can be raised on the <a href="https://github.com/ahsanz89/Islamic/issues">project issue tracker</a>.</p>
      </section>
    </div>
  );
}
