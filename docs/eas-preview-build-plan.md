# WortWeg EAS Preview Build Plan

This document prepares a safe EAS preview-build path for WortWeg private alpha. It does not create credentials, native folders, Apple/Google account records, public launch claims, or store-readiness claims.

## 1. Current Status

- Project type: Expo React Native managed app.
- Current verified install paths: Expo Go with local Metro and installed Android EAS preview APK.
- Hosted backend: Render at `https://wortweg.onrender.com`.
- Asset requirements: `docs/app-asset-requirements.md`.
- EAS account/project readiness: `docs/eas-account-project-readiness.md`.
- Mac hosted backend smoke: passed.
- Phone hosted AI/speech smoke: passed.
- Installed Android EAS preview APK smoke: passed after Expo asset/module alignment.
- First installed APK native launch crash was fixed by aligning `expo-asset` with the Expo SDK module set; `npx expo-doctor` and `npm run quality` passed before the rebuild.
- Content status:
  - A0/A1/A2 fully playable.
  - B1 preview limited to 8 optional lessons.
  - Full B1/B2 coming soon, not playable.
  - 36 lessons, 288 exercises, 288 vocabulary items.
- Speech status: transcript-based scoring. It does not score accent quality, phonemes, natural speed, fluency, prosody, or rhythm.
- Azure pronunciation assessment: not implemented.
- Public launch: not ready and not claimed.

## 2. Current Expo Config Audit

Inspected files:

- `app.json`
- `package.json`
- `assets/`
- `src/config/backend.ts`
- backend URL references in app/docs

Findings:

- App name: `WortWeg`.
- Slug: `wortweg`.
- Version: `0.1.0`.
- Orientation: portrait.
- UI style: light.
- No committed native `ios/` or `android/` folders.
- No `app.config.ts` or `app.config.js` is currently used.
- Temporary private-alpha assets are present in `assets/`.
- `expo.icon` is configured as `./assets/icon.png` using a temporary private-alpha asset.
- `expo.splash.image` is configured as `./assets/splash.png` using a temporary private-alpha asset.
- Android adaptive icon has `foregroundImage` set to `./assets/adaptive-icon.png` and background color `#1E1B3A`.
- iOS microphone copy exists at `ios.infoPlist.NSMicrophoneUsageDescription`.
- Expo Audio plugin microphone copy exists at `plugins.expo-audio.microphonePermission`.
- iOS `bundleIdentifier` is configured as `com.toprakyildiz.wortweg`.
- Android `package` is configured as `com.toprakyildiz.wortweg`.
- Expo `owner` is configured as `therealsquall`.
- EAS `projectId` is configured under `extra.eas.projectId`.
- Mobile backend URL resolution uses `EXPO_PUBLIC_AI_BACKEND_URL` through `src/config/backend.ts`.
- No provider API keys should be placed in app config, Expo public env, source code, or docs.

## 3. EAS Config Status

A minimal `eas.json` preview profile now exists so future private install testing has a clear starting point.

EAS project status:

- Project linked under `@therealsquall/wortweg`.
- Android preview APK build succeeded after the Expo asset/module dependency fix.
- Android remote keystore exists on Expo servers. Do not paste or commit signing credentials.
- This remains private/internal preview only, not App Store or Play Store readiness.

Current preview profile intent:

- `distribution`: `internal`
- `developmentClient`: `false`
- Android output: APK for lower-friction private install testing
- iOS output: device build, not simulator
- Public build env:
  - `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com`
  - `EXPO_PUBLIC_AI_TIMEOUT_MS=30000`
  - `EXPO_PUBLIC_SPEECH_TIMEOUT_MS=45000`

This config contains no API keys, no Apple/Google credentials, no native folders, and no production submission profile.

## 4. Recommended Preview Profile

Keep the first EAS profile narrow and private:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "developmentClient": false,
      "env": {
        "EXPO_PUBLIC_AI_BACKEND_URL": "https://wortweg.onrender.com",
        "EXPO_PUBLIC_AI_TIMEOUT_MS": "30000",
        "EXPO_PUBLIC_SPEECH_TIMEOUT_MS": "45000"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

Do not add a production submission profile until signing, store accounts, tester process, support process, and privacy review are ready.

## 5. Environment Variable Strategy

Allowed in mobile/EAS public env:

- `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com`
- `EXPO_PUBLIC_AI_TIMEOUT_MS=30000`
- `EXPO_PUBLIC_SPEECH_TIMEOUT_MS=45000`

Forbidden in mobile/EAS public env:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- future Azure keys
- raw provider/model endpoint details
- any private backend secret

Backend provider keys must remain only in Render/backend environment variables. `.env` must remain local and untracked.

## 6. Identifier Status

Identifiers are now set in `app.json`:

- iOS `bundleIdentifier`: `com.toprakyildiz.wortweg`.
- Android `package`: `com.toprakyildiz.wortweg`.

Treat these as stable unless there is a deliberate product/account reason to change them. Changing identifiers later can create signing, install, and tester confusion. Before creating credentials, still confirm that these identifiers match the intended Apple/Google account ownership path.

## 7. Icon / Splash Asset Readiness

Current status: temporary private-alpha assets are present, referenced by `app.json`, and acceptable for the successful internal Android preview smoke.

Ready for internal preview smoke:

- `assets/icon.png` at 1024x1024.
- `assets/adaptive-icon.png` at 1024x1024.
- `assets/splash.png` at 1242x2436.
- Installed Android preview build launched with these assets.

Still needed before broader tester distribution or final brand/public review:

- Final app icon.
- Final splash image or final splash configuration.
- Final Android adaptive icon foreground/background review.
- Final Wolli mascot asset pack if Wolli is used in brand surfaces.

## 8. Tester Install Path

Recommended order:

1. Keep the successful Android installed APK smoke as the first proven private install path.
2. Define the tester distribution/support process before sharing builds.
3. Keep tester group very small for the first private alpha.
4. Re-run installed-build phone smoke after any native dependency, build config, backend URL, or asset change.
5. Prepare iOS internal distribution or TestFlight later only after Apple credential/account status is known.
6. Send tester guide only after install, backend, support, and privacy wording are ready.

Do not claim App Store or Play Store readiness. This is private alpha installation planning only.

## 9. Rollback Plan

If a preview build has problems:

- Keep Expo Go/local development path working.
- Keep hosted backend smoke script available:

```sh
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
```

- Remove or replace the broken private build from tester instructions.
- Rebuild only after fixing config and rerunning `npm run quality`.
- Rotate backend keys only if a secret leak is suspected.
- Do not move provider keys into the mobile app to work around backend issues.

## 10. Privacy / Secret Guardrails

- No API keys in app code, `app.json`, `eas.json`, docs, screenshots, or Expo public env.
- No `.env` commits.
- No raw transcript or `audioUri` persistence.
- No provider/model/endpoint details in normal UI.
- No Azure implementation in this phase.
- No public launch claims.
- No official Goethe/telc/OeSD affiliation or certification claim.
- No full B1/B2 playable claim.

## 11. Backend URL Requirement

Preview builds must point to the hosted backend:

```text
EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com
```

The app should not rely on local LAN fallback for a private install build. Local LAN fallback is only a developer convenience for Expo Go development when `EXPO_PUBLIC_AI_BACKEND_URL` is missing.

## 12. Commands To Run Later

Do not run these until account/project ownership, credential expectations, and tester process are ready. See `docs/eas-account-project-readiness.md` first.

Safe pre-build checks:

```sh
npm run quality
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
git status --short
```

Future Android rebuild command, only after changes are reviewed and the user approves a build:

```sh
npx eas-cli build --platform android --profile preview
```

Use `--clear-cache` after native dependency alignment changes, such as the `expo-asset` fix that resolved the first installed APK launch crash.

For iOS, do not run a build until Apple account, device registration/TestFlight path, and bundle identifier are ready.

## 13. Remaining Blockers

- Android preview APK install smoke passed.
- Final brand/Wolli icon and splash assets remain pending before broader tester distribution.
- Tester distribution/support docs exist; approved APK link, feedback channel, and support owner still need to be filled before sending.
- Replace backend `tsx` runtime production start before broader alpha use.
- Prepare iOS/TestFlight path later.
- Optionally run backend error-copy installed-build test.

## 14. Next Prompt Title

Fill approved APK link and feedback channel, then send to the first private Android tester group.
