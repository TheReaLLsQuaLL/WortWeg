# WortWeg Private Alpha Distribution Plan

This document prepares the install/distribution path for WortWeg private alpha. It does not create builds, accounts, credentials, native folders, or public launch claims.

## 1. Current Status

- App type: Expo React Native managed project.
- Current test path: Expo Go from local Metro bundler.
- Hosted backend: Render Web Service at `https://wortweg.onrender.com`.
- EAS preview plan: `docs/eas-preview-build-plan.md`.
- Mac hosted backend smoke: passed.
- Phone hosted smoke: passed for AI chat, correct-sentence speaking, silence/no-voice, and wrong-speech low-score behavior.
- Backend error-copy phone check: skipped/not tested.
- Content scope:
  - A0/A1/A2 fully playable.
  - Optional limited B1 preview with 8 lessons.
  - Full B1/B2 paths coming soon, not playable.
  - 36 lessons, 288 exercises, 288 vocabulary items.
- Speaking scoring: transcript-based Hybrid Speech Scoring v1. It detects silence/no voice, real speech, expected words, and wrong/missing/extra words. It does not score accent quality, phoneme-level pronunciation, natural speed, fluency, prosody, or rhythm; slow but word-correct speech can score 100.
- Azure pronunciation assessment: not implemented; future backend-only prototype work.
- Public launch: not ready and not claimed.

## 2. Current Expo Configuration Audit

Files inspected:

- `package.json`
- `app.json`
- `.env.example`
- assets folder
- app/backend URL usage in source and docs

Findings:

- `app.json` defines `name`, `slug`, `version`, portrait orientation, light UI, and Expo Audio plugin microphone permission copy.
- A minimal preview-only `eas.json` now exists for future internal distribution testing.
- There are no committed native `ios/` or `android/` project folders.
- iOS `bundleIdentifier` is not configured.
- Android `package` is not configured.
- App icon, splash image, and Android adaptive icon foreground image are not configured. `assets/` currently has no committed production image files.
- Android adaptive icon only has a background color.
- Microphone permission copy exists in:
  - `ios.infoPlist.NSMicrophoneUsageDescription`
  - `plugins.expo-audio.microphonePermission`
- The app reads the backend URL from `EXPO_PUBLIC_AI_BACKEND_URL` through shared app-side backend URL resolution.
- Server-side provider keys remain backend-only. The mobile app must never contain `OPENAI_API_KEY`, `GEMINI_API_KEY`, or future Azure keys.
- Local LAN examples remain documentation/placeholders for development. No permanent LAN IP should be committed as a production/private build backend.

## 3. Distribution Readiness Answer

| Question | Current answer |
| --- | --- |
| Is this currently Expo Go only? | Yes. The verified install path is Expo Go with a local Metro server. |
| Is EAS configured? | Partially. A minimal preview-only `eas.json` exists, but identifiers, credentials, assets, account/project ownership, and real builds are not configured. |
| Is an iOS bundle identifier configured? | No. |
| Is an Android package name configured? | No. |
| Are icon/splash assets production-like? | No. They are missing or placeholder-level. |
| Are microphone permissions declared? | Partially yes. iOS text and Expo Audio plugin text are present; Android native permission should be verified through Expo/EAS config output before a native build. |
| Is hosted backend available for release builds? | Yes, via `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com` in the build environment. Do not hardcode secrets or provider keys. |
| Are secrets backend-only? | Yes by design. Keep provider keys only in backend/Render environment variables. |
| What blocks a private alpha install? | Missing app identifiers, asset readiness, account/credential decisions, install/distribution process, tester support flow, and a real build smoke. |

## 4. Recommended Private-Alpha Path

Recommended next path: create a private install build using EAS after configuration is prepared.

Do not publish to public app stores. Do not call this production-ready. Keep the first tester group small and trusted.

Suggested staged path:

1. Keep Expo Go for developer smoke while the install path is prepared.
2. Use the minimal preview `eas.json` as a starting point, then choose app identifiers before any real build attempt.
3. Configure build-time `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com` through EAS/build environment, not through committed secrets.
4. Create an Android internal/test APK or internal distribution build first, because Android is usually lower-friction for a first install test.
5. Prepare iOS TestFlight later if Apple Developer access and bundle identifier are ready.
6. Run the full phone smoke checklist on the install build before inviting testers.
7. Invite only private alpha testers after install, backend, privacy, and support flows are verified.

## 5. iOS Options

Possible later paths:

- EAS internal distribution for iOS if device registration and Apple credentials are ready.
- TestFlight later for broader private testing.

Current blockers:

- No iOS bundle identifier configured.
- Apple Developer account status is not documented.
- App Store Connect/TestFlight setup is not documented.
- Final app icon/splash assets are not ready.
- No public launch metadata should be used yet.

Do not claim App Store readiness until a real build, signing, upload, review, and tester install flow are proven.

## 6. Android Options

Possible later paths:

- EAS Android internal distribution build.
- Direct APK install for a tiny trusted tester group, if acceptable for the test context.
- Google Play internal testing later if Play Console setup exists.

Current blockers:

- No Android package name configured.
- Minimal preview `eas.json` exists, but no build has been run and identifiers are still missing.
- Android icon/adaptive icon foreground and splash assets are not ready.
- Play Console status is not documented.

Do not claim Play Store readiness until a real internal track or install path is proven.

## 7. EAS Build Readiness Checklist

Before running any native/private build:

- Choose stable app identifiers:
  - iOS `bundleIdentifier` placeholder, for example `com.YOUR_ORG.wortweg`.
  - Android `package` placeholder, for example `com.YOUR_ORG.wortweg`.
- Decide whether first private alpha build is Android-only or both platforms.
- Review `docs/eas-preview-build-plan.md` and the minimal `eas.json` preview profile.
- Decide how build env will receive:
  - `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com`
  - `EXPO_PUBLIC_AI_TIMEOUT_MS`
  - `EXPO_PUBLIC_SPEECH_TIMEOUT_MS`
- Confirm no provider API keys are in app config, source, docs, or build profiles.
- Keep `OPENAI_API_KEY` and `GEMINI_API_KEY` only on Render/backend environment variables.
- Add or confirm app icon and splash assets.
- Confirm microphone permission text in generated native config.
- Run `npm run quality` before build.
- Run hosted backend smoke:

```sh
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
```

- Run phone smoke on the built app before inviting testers.

## 8. App Metadata Placeholders

Do not publish these as store copy without review.

- App name: WortWeg
- One-line purpose: Turkish-first German learning practice for A0/A1/A2 with optional B1 preview.
- Backend status: hosted backend works for private smoke testing.
- Content status: A0/A1/A2 playable; B1 preview limited to 8 optional lessons; full B1/B2 coming soon.
- Speech status: transcript-based speaking feedback, not full pronunciation scoring.
- Privacy note: no API keys in the mobile app; avoid sharing sensitive personal information in AI chat.
- Non-claim: no official Goethe/telc/OeSD affiliation or certification claim.

## 9. Tester Instructions Needed

Before inviting testers, prepare a short guide with:

- Install method and supported platform.
- Expected alpha limitations.
- Login/account status, if any. Current app has no auth/cloud sync.
- What to test:
  - onboarding
  - one A0/A1/A2 lesson
  - Kelime review
  - Hatalar review
  - Konuşma Pratiği
  - AI ile pratik
  - Sınav tarzı pratik
  - optional B1 Ön İzleme
- Known speech limitation: slow but word-correct speech can score 100 because scoring is transcript-based.
- Feedback template and support/contact channel.
- Privacy reminder: do not enter sensitive personal data.

## 10. Risks

- EAS/native build may reveal missing native config not visible in Expo Go.
- App identifiers are not chosen.
- Icon/splash assets are not ready.
- Microphone permission must be verified in a real native build.
- Hosted backend cold start or Render sleep behavior may affect first AI/speech request.
- Current `server:start` uses `tsx`, so Render currently needs dev dependencies. Replace with compiled JS or another production-safe start before broader alpha use.
- Speech scoring is transcript-based, so it cannot judge accent/fluency/prosody yet.
- No auth/cloud sync means tester progress is local-device only.
- No public launch, App Store readiness, or Play Store readiness should be claimed.

## 11. Safe Next Commands

These commands are safe repo checks and do not create native builds:

```sh
npm run quality
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
git status --short
```

Do not run native builds until identifiers, assets, account/project ownership, and tester process are chosen.

## 12. Recommended Next Step

Next task: Finalize app identifiers and asset requirements for EAS preview build.
