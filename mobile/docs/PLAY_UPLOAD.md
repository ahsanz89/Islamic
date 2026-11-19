# Uploading DALIL to Google Play (Internal testing)

## One time
1. GitHub > ahsanz89/Islamic > Settings > Secrets and variables > Actions > New repository secret. Add the 4 secrets listed in `DALIL-signing-secrets.txt`
   (ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_PASSWORD, ANDROID_KEY_ALIAS).
2. Keep `dalil-upload.jks` and `DALIL-signing-secrets.txt` safe. Never upload them anywhere public.

## Every release
1. GitHub > Actions > "Build Play Store bundle (AAB)" > Run workflow. After ~10 minutes download `DALIL-play-aab` (a zip containing `app-release.aab`).
2. Play Console > your app (create it first: name "DALIL", App, Free, English) > Testing > Internal testing > Create new release.
   Accept "Play App Signing" the first time, upload `app-release.aab`, save, review, roll out. Add yourself under the Testers tab.
3. Complete App content (privacy policy URL, Ads = No, Data safety, content rating, target audience) using `docs/STORE_LISTING.md` and `docs/DATA_SAFETY.md`.
4. Install from the internal-testing link on a real phone. Test: onboarding, Quran, Mushaf, Continue Reading, Hadith, Duas, audio, the recitation microphone.

## Before going public
- Confirm the licence of the 15-line Mushaf layout data (see `docs/CONTENT_LICENCES.md`), or switch the Mushaf off.
- The public privacy page (website /privacy/) must mention the microphone used by Recitation practice, then Data safety must say the same.
- New personal Play accounts must run a closed test with 12+ testers for 14 days before Production.
