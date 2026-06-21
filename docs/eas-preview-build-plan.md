# WortWeg EAS Preview Build Plan

This document prepares a safe EAS preview-build path for WortWeg private alpha. It does not create credentials, native folders, Apple/Google account records, public launch claims, or store-readiness claims.

## 1. Current Status

- Project type: Expo React Native managed app.
- Current verified install path: Expo Go with local Metro.
- Hosted backend: Render at `https://wortweg.onrender.com`.
- Asset requirements: `docs/app-asset-requirements.md`.
- Mac hosted backend smoke: passed.
- Phone hosted AI/speech smoke: passed.
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
- `assets/` is currently empty.
- No app icon path is configured.
- No splash image is configured.
- Android adaptive icon only has a background color and no foreground image.
- iOS microphone copy exists at `ios.infoPlist.NSMicrophoneUsageDescription`.
- Expo Audio plugin microphone copy exists at `plugins.expo-audio.microphonePermission`.
- iOS `bundleIdentifier` is configured as `com.toprakyildiz.wortweg`.
- Android `package` is configured as `com.toprakyildiz.wortweg`.
- No Expo `owner` or EAS `projectId` is configured.
- Mobile backend URL resolution uses `EXPO_PUBLIC_AI_BACKEND_URL` through `src/config/backend.ts`.
- No provider API keys should be placed in app config, Expo public env, source code, or docs.

## 3. EAS Config Status

A minimal `eas.json` preview profile now exists so future private install testing has a clear starting point.

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

Current status: not ready.

Needed before a credible private build:

- App icon file.
- Splash image or intentionally simple splash config.
- Android adaptive icon foreground image.
- Confirm assets are original and licensed for use.
- Keep Wolli final mascot assets separate from app icon decisions unless explicitly approved.

A build could technically run with missing/placeholder assets, but it should not be sent to testers that way unless the limitation is intentional and documented.

## 8. Tester Install Path

Recommended order:

1. Android internal APK/install test first.
2. iOS internal distribution or TestFlight later only after Apple credential/account status is known.
3. Keep tester group very small for the first install smoke.
4. Run phone smoke on the installed build before inviting testers.
5. Send tester guide only after install, backend, support, and privacy wording are ready.

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

Do not run these until identifiers, assets, account/credential decisions, and tester process are ready.

Safe pre-build checks:

```sh
npm run quality
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
git status --short
```

Later EAS setup/build commands, only after decisions are made:

```sh
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build --profile preview --platform android
```

For iOS, do not run a build until Apple account, device registration/TestFlight path, and bundle identifier are ready.

## 13. Remaining Blockers

- Add production-like icon/splash/adaptive icon assets.
- Review `docs/app-asset-requirements.md` before adding asset paths to `app.json`.
- Confirm EAS account/project ownership and whether `owner`/`projectId` should be added.
- Decide Android-only first build or both platforms.
- Define tester distribution/support process.
- Replace backend `tsx` runtime production start before broader alpha use.
- Optionally run backend error-copy phone test.

## 14. Next Prompt Title

Prepare first EAS preview build smoke checklist without running build.
