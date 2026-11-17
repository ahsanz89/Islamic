# DALIL mobile app (Android + iOS)

Expo / React Native app for DALIL – Islamic Knowledge. Without Boundaries.
Content (Quran, hadith, duas) is loaded from the live website and cached on the device.

```
npm install
npx expo start        # scan QR with Expo Go
npm run export:web    # browser build (used for visual checks)
npm run assets        # regenerate icons/splash/store graphics (needs Playwright)
```

First screen asks the user to choose a translation; it can be changed any time from the translation button on every reading screen or in Settings.

Docs: `docs/RELEASE_GUIDE.md` (start here), `docs/STORE_LISTING.md`, `docs/DATA_SAFETY.md`, `docs/PRIVACY_POLICY.md`, `docs/CONTENT_LICENCES.md`, `docs/TESTING_CHECKLIST.md`.

Learn Quran academy: `app/(tabs)/learn.js` (hub) and `app/learn/[level].js`; curriculum data is shared with the website (`src/lib/learn-data.js`, copied from `../src/lib/learn-data.js`). Lesson audio uses the phone's Arabic text-to-speech voice (expo-speech); see docs/RELEASE_GUIDE.md.
