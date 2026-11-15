# Test checklist before each release
Run on at least one iPhone and one Android phone, light and dark mode.

First run
- [ ] Fresh install shows the "Choose your translation" screen first
- [ ] Each language card selects (radio); "Arabic only" works; Start reading is always visible
- [ ] After Start, Home shows the translation button with the chosen language
- [ ] Reopening the app skips the first screen

Changing translation
- [ ] Button on Home / Quran / surah opens the sheet; choice applies immediately
- [ ] Settings → Translation and Second translation work; Arabic never disappears
- [ ] Urdu choice switches interface text to Urdu (RTL); Arabic app language is RTL

Quran
- [ ] Surah list search by name and number; surah opens; verses show Arabic + chosen translation(s)
- [ ] Play surah, play single ayah, next/previous, pause, mini player controls
- [ ] Reciter switch; Badr plays whole surah; Urdu audio toggle
- [ ] Audio continues with screen locked (iOS background audio, Android notification)

Hadith / Duas
- [ ] Collections → chapters → hadith; go-to-number; language note when the book lacks the chosen language
- [ ] Hadith of the day; dua list and detail

Settings
- [ ] Text size, harakat, appearance, clear cache, privacy and support links open
- [ ] Offline: after viewing a surah, airplane mode still opens it

Store assets
- [ ] Icon looks right on iOS and Android adaptive masks (circle/squircle), splash is emerald with the mark
