# WortWeg Private Alpha Tester Distribution

This document defines the practical Android APK tester distribution and support process for WortWeg private alpha. It is for internal/private testing only. It is not a public launch, App Store / Play Store readiness claim, or official exam-prep claim.

## 1. Who This Private Alpha Is For

Use this alpha with a very small group of trusted Android testers who are:

- Turkish speakers learning German.
- Beginners or A0/A1/A2 learners.
- Comfortable installing a private Android APK from a direct link.
- Willing to report bugs and confusing screens clearly.
- Aware that this is an early test build, not a final release.

This alpha is not for broad public sharing, paid promotion, school deployment, official exam preparation claims, or public app-store distribution.

## 2. Current Test Scope

Current verified state:

- Hosted backend: `https://wortweg.onrender.com`.
- Android EAS preview APK smoke passed.
- Hosted AI chat works in the installed Android build.
- Hosted speaking/transcription works in the installed Android build.
- Silence/no-voice and wrong-speech low-score behavior passed.
- Temporary icon/splash assets are acceptable for internal preview only.

Content scope:

- A0/A1/A2 fully playable.
- Optional limited B1 preview with 8 lessons.
- Full B1/B2 paths are coming soon, not playable.
- 36 lessons.
- 288 exercises.
- 288 vocabulary items.

## 3. Android APK Install Instructions

Send testers a direct private APK link only after the current build link and feedback channel are confirmed.

Tester instructions:

1. Open `APK_LINK_HERE` on the Android phone.
2. Download the APK.
3. If Android asks for permission, allow install from the browser/download source for this test.
4. Open the downloaded APK and install WortWeg.
5. Open WortWeg.
6. Allow microphone permission when prompted if you want to test Konuşma Pratiği.
7. Keep internet on for AI ile pratik and Konuşma Pratiği.

Safety note for testers:

- This is a private/internal test APK.
- Do not forward the APK link publicly.
- Do not post screenshots or videos publicly without approval.
- Do not treat this as a final store release.

## 4. Install Troubleshooting

If installation fails:

- Confirm the phone is Android and has enough storage.
- Allow install from the browser/download source when Android asks.
- If an older WortWeg APK is installed, uninstall it and install the new APK again.
- Download the APK again if the file looks incomplete.
- Restart the phone if Android gets stuck during installation.

If the app opens but AI/speech does not work:

- Confirm internet is connected.
- Try again after a short wait; the hosted backend can have a cold start.
- For speaking, confirm microphone permission is allowed.
- Try a quiet room for Konuşma Pratiği.
- Report the exact screen, time, and what happened.

If microphone permission was denied:

- Open Android app settings for WortWeg.
- Enable microphone permission.
- Reopen WortWeg and try Konuşma Pratiği again.

## 5. What Testers Should Test

Ask each tester to try this minimum flow:

1. Install and open the APK.
2. Complete onboarding.
3. Reach Home.
4. Open one A0/A1/A2 lesson and solve a few exercises.
5. Intentionally answer one exercise wrong.
6. Open Hatalar and check the mistake flow.
7. Open Kelime tekrarı.
8. Open Konuşma Pratiği and try one sentence.
9. Try silence/no speech in Konuşma Pratiği and confirm it does not score 100.
10. Open AI ile pratik and ask a short Turkish question.
11. Open Sınav tarzı pratik.
12. Optionally open B1 Ön İzleme and confirm it feels like a limited preview, not full B1.

## 6. What Testers Should Not Expect Yet

Set expectations clearly:

- No public launch.
- No App Store or Play Store listing.
- No iOS/TestFlight build yet.
- No full B1 or B2 path yet.
- No official Goethe/telc/OeSD affiliation, approval, or guarantee.
- No account/cloud sync.
- No public leaderboard or social ranking.
- No final Wolli mascot or final brand icon/splash assets yet.
- No Azure pronunciation assessment.
- No phoneme-level pronunciation scoring.

## 7. Known Limitations

Speaking feedback is transcript-based:

- It can detect silence/no voice.
- It can compare expected words with spoken transcript words.
- It can show correct, missing, and extra words.
- It can give low scores for wrong words.
- It does not score accent quality, phoneme-level pronunciation, natural speed, fluency, prosody, or rhythm.
- Slow but word-correct speech can score 100 in the current version.

Other limitations:

- Hosted backend may cold-start and feel slow on the first AI/speech request.
- Speech can fail in noisy environments.
- Progress is local to the device.
- Temporary app icon/splash assets are internal-preview placeholders.
- Backend error-copy installed-build test is still optional/not fully covered.

## 8. Bug Report Process

Use one feedback channel for the private alpha:

```text
FEEDBACK_CHANNEL_HERE
```

Tester bug reports should include:

```text
Telefon modeli:
Android sürümü:
WortWeg sürümü/build tarihi veya linki:
Ne yapmak istedin?
Ne oldu?
Ne olmasını beklerdin?
Hangi ekrandaydın?
İnternet bağlantısı: Wi-Fi / mobil veri
Yaklaşık saat:
Ekran görüntüsü veya kısa video var mı?
```

For speaking bugs, also ask:

```text
Konuşma cümlesi:
Sessizlik mi, yanlış kelime mi, doğru cümle mi denedin?
Ortam sessiz miydi?
Mikrofon izni açık mıydı?
```

## 9. What Testers Should Not Send

Ask testers not to send:

- Passwords.
- API keys.
- Private tokens or login links.
- Sensitive personal information.
- Passport, ID, address, payment, medical, immigration, or legal details.
- Private conversation content they do not want reviewed.
- Public posts about the APK link.

If they report AI chat issues, they should summarize the issue without sharing sensitive text.

## 10. Support Triage

Suggested internal triage order:

1. Install/open blockers.
2. App crash or red screen.
3. AI chat unavailable.
4. Speaking/microphone unavailable.
5. Lesson completion/progress blockers.
6. Confusing copy/navigation.
7. Visual polish and final brand asset comments.

For every report, label it as one of:

- install
- crash
- backend-ai
- backend-speech
- microphone
- lesson
- review
- b1-preview
- copy
- visual
- other

## 11. Minimum Internal Smoke Before Sending A Build

Before sending any APK link to testers:

- `npm run quality` passes.
- Hosted backend smoke passes:

```sh
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
```

- Installed APK opens on a real Android phone.
- Onboarding/Home loads.
- AI chat works through hosted backend.
- Speaking correct sentence works through hosted backend.
- Silence/no voice does not score 100.
- Wrong speech shows low score/missing words.
- Microphone permission prompt works.
- Temporary icon/splash is acceptable for this internal preview.
- APK link and feedback channel placeholders are replaced in the tester message.

## 12. Internal Send Checklist

Before sending testers the copy-paste message:

- Replace `APK_LINK_HERE` with the approved private APK link.
- Replace `FEEDBACK_CHANNEL_HERE` with the selected feedback channel.
- Confirm tester count and names.
- Confirm testers understand the APK must not be shared publicly.
- Confirm support owner and response window.
- Keep the current known limitations in the message.

## 13. Next Prompt Title

Finalize private alpha tester message with approved APK link and feedback channel.
