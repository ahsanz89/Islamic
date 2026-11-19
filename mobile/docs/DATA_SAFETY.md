# Store privacy questionnaires – answers

## Apple "App Privacy" (App Store Connect)
- Do you or your third-party partners collect data from this app? **No.**  → label shows "Data Not Collected".
- Tracking: **No.** No App Tracking Transparency prompt is needed.
- Encryption export compliance: app uses only standard HTTPS → `ITSAppUsesNonExemptEncryption = false` is already set in `app.json`.

## Google Play "Data safety"
- Does your app collect or share any of the required user data types? **No.**
- Is all user data encrypted in transit? **Yes** (HTTPS).
- Can users request data deletion? Not applicable – no data is collected; local data is removed by clearing storage/uninstalling.
- Ads: **No ads.**
- Target audience: **All ages / 13+** is fine; it is not a children-directed app, so "Families" policy is not required.
- App access: **All functionality available without special access.**

## Why "No"
Preferences and cache are stored only on the device. Audio and text are fetched from public hosts; DALIL sends no identifiers. Third-party hosts see the IP address like any web request; this is disclosed in the privacy policy.


## Microphone (Recitation practice)
The microphone is used only while the user taps Start in Recitation practice. DALIL does not record or store audio and sends nothing to its own servers. Speech is processed by the Android speech recognition service of the device (Google), which may process audio online unless an offline Arabic pack is installed. In Play Console declare: microphone permission used for a user-facing feature; audio is processed by a third-party service, not collected by the developer.
