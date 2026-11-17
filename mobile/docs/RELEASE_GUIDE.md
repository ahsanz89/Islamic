# DALIL mobile – release guide (Android + iPhone)

The app is one Expo (React Native) codebase in `mobile/`. EAS Build compiles it in the cloud, so **you do not need a Mac** to ship to the App Store.

## 0. What only you can do (cannot be automated)
| Item | Cost | Notes |
|---|---|---|
| Expo account | free | https://expo.dev/signup |
| Apple Developer Program | US$99 / year | https://developer.apple.com/programs – approval can take 1–2 days |
| Google Play Console | US$25 one-time | https://play.google.com/console – identity verification required; new personal accounts must run a closed test with 12+ testers for 14 days before production |

## 1. One-time setup on your computer
1. Install Node 20+ and Git.
2. `cd mobile && npm install`
3. `npm install -g eas-cli`
4. `eas login`
5. `eas init` – writes your real project id into `app.json` (replaces `REPLACE_WITH_EAS_PROJECT_ID`).
6. Try it first: `npx expo start`, then scan the QR code with the **Expo Go** app on a phone. Check the onboarding screen, change the translation in Settings, play an ayah.

## 2. Identifiers (already set)
- iOS bundle identifier: `com.dalil.app`
- Android package: `com.dalil.app`
If either is taken, change it in `app.json` **before** the first store upload; it cannot be changed afterwards.

## 3. Android
1. `eas build -p android --profile production` → produces an `.aab`. (For a test APK you can sideload: `--profile preview`.)
2. Play Console → Create app → name "DALIL – Quran & Hadith", default language English, App, Free.
3. Fill the listing from `docs/STORE_LISTING.md`; upload `store/play-icon-512.png`, `store/play-feature-graphic-1024x500.png` and ≥2 phone screenshots.
4. Policy → App content: privacy policy URL, Ads = No, Data safety from `docs/DATA_SAFETY.md`, content rating questionnaire, target audience.
5. Create a Google service-account key if you want `eas submit` (https://docs.expo.dev/submit/android/); otherwise upload the `.aab` by hand in Testing → Internal testing, then promote to Production.
6. `eas submit -p android --profile production` (optional automated upload).

## 4. iPhone
1. In App Store Connect create the app (bundle id `com.dalil.app`, SKU `dalil-ios`). Put its numeric Apple ID in `eas.json` (`REPLACE_WITH_APP_STORE_CONNECT_APP_ID`).
2. `eas build -p ios --profile production` – EAS asks you to sign in to your Apple account and creates certificates/profiles for you.
3. `eas submit -p ios --profile production` – uploads to TestFlight.
4. Test with TestFlight, then fill the listing (`docs/STORE_LISTING.md`), App Privacy (`docs/DATA_SAFETY.md`), upload 6.7"/6.9" iPhone screenshots, choose the build, **Submit for Review**.
5. Reviewer notes: paste the "Review notes" section of the listing doc.

## 5. Releasing updates
- Bump `version` in `app.json` for user-visible releases. Build numbers (`buildNumber`/`versionCode`) auto-increment via `autoIncrement` in `eas.json`.
- Quran/hadith/dua **content updates need no store release**: the app loads data from the live website, so pushing the website updates the app after the user's cache refreshes.
- Code changes → `eas build` + `eas submit` again.

## 6. Screenshots
Required: Google ≥2 phone shots; Apple 6.7" (1290×2796) or 6.9". Easiest: run in the iOS Simulator / Android emulator / real phone and capture: (1) first-screen translation picker, (2) Home, (3) surah reader, (4) hadith list, (5) settings. Put them in `store/screenshots/`. Browser-rendered previews (`npm run export:web`) were used for development checks only, not as store screenshots.

## 7. Known limits
- Learn Quran lesson sound uses the phone's built-in Arabic voice (expo-speech). Quality varies by device, and some phones have no Arabic voice installed (the app shows a notice). Real teacher recordings would need a bundled-audio step; the website already accepts them in `public/learn-audio/`.
- Tested here as a web build only; **please test on a real Android phone and iPhone** (especially audio, background playback and RTL layout) before submitting.
- Badr Al-Turki plays whole surahs only (the source has no ayah-level files), so the Urdu-after-ayah option is disabled for him.
- Audio hosts are third-party and free; if one goes offline that audio stops.
- Data from OpenITI is CC BY-NC-SA – keep the app free of ads and payments (see `CONTENT_LICENCES.md`).
