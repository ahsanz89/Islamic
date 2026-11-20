# Automatic Android releases

Every push to `main` that changes `mobile/**` now does this by itself (GitHub Actions, "Build Play Store bundle (AAB)"):

1. runs the phone-app tests (a failing test stops the release, nothing is uploaded)
2. builds the release-signed `.aab` (version code goes up automatically: 100 + run number)
3. uploads it to Google Play on the track in the repository variable `PLAY_TRACK`
   (`internal` when the variable is not set; use `alpha` for the closed test, `production` when public)

The website already redeploys by itself on every push (workflow "Build and deploy to GitHub Pages").
The test APK (workflow "Build Android APK (test)") is also still built on every push.

## One-time setup (needed only for step 3)

1. Google Cloud console: create a project, turn on **Google Play Android Developer API**,
   create a **service account** and a **JSON key** for it.
2. Play Console > Users and permissions > Invite new users: add the service account's e-mail address and
   give it the app permissions "Release to production, exclude devices, and use Play App Signing" and
   "Release apps to testing tracks" for DALIL.
3. GitHub > repository Settings > Secrets and variables > Actions: add the secret `PLAY_SERVICE_ACCOUNT_JSON`
   (paste the whole JSON key file) and, optionally, the variable `PLAY_TRACK`.

Without `PLAY_SERVICE_ACCOUNT_JSON` the workflow still builds and saves the signed `.aab` as a download.

## Things to know

- Google may send a new version of the store listing or sensitive changes for review. Updates to an already
  approved app are normally live within hours to a few days.
- Release notes come from `mobile/play-notes/whatsnew-en-US` (edit that file to change them).
- Changing the Android package id after the first upload is impossible; it must stay `dalil.ahsanzaheer`.
