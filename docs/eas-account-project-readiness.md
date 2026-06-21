# WortWeg EAS Account / Project Readiness Checklist

This checklist records the EAS account/project status for WortWeg private alpha and keeps future rebuild steps safe. It does not run EAS, create credentials, add native folders, add Apple/Google account data, or claim App Store / Play Store readiness.

## 1. Current Status

- Project type: Expo React Native managed app.
- Current verified testing paths: Expo Go and installed Android EAS preview APK.
- Hosted backend: `https://wortweg.onrender.com`.
- Mac hosted smoke: passed.
- Phone hosted AI/speech smoke: passed.
- `eas.json`: present with a preview-only internal distribution profile.
- EAS project: linked under `@therealsquall/wortweg`.
- iOS identifier: `com.toprakyildiz.wortweg`.
- Android package: `com.toprakyildiz.wortweg`.
- Temporary private-alpha assets are present:
  - `assets/icon.png`: 1024x1024.
  - `assets/adaptive-icon.png`: 1024x1024.
  - `assets/splash.png`: 1242x2436.
- Android EAS preview APK build has been run successfully.
- Installed Android APK smoke passed: install, launch, enter app, onboarding/Home, hosted AI chat, hosted speaking, silence/no-voice, and wrong-speech low-score behavior.
- The first installed APK native launch crash was fixed by aligning `expo-asset` with the Expo SDK module set before rebuilding with a clear EAS cache.
- Android remote keystore exists on Expo servers; do not paste or commit signing credentials.
- No native `ios/` or `android/` folders are committed.
- No Azure implementation.
- This is private-alpha preparation only, not public launch readiness.

## 2. Local EAS Tooling Status

Current package/script audit:

- `package.json` has no EAS scripts.
- `eas-cli` is not listed in dependencies or devDependencies.
- No local `node_modules/.bin/eas` or `node_modules/.bin/eas-cli` binary is present.
- Future commands should use `npx eas-cli ...` unless the project later chooses to add a pinned local EAS CLI dependency.

Do not install EAS CLI or run EAS commands unless a specific future build/account task is approved.

## 3. Expo Account Status

Current selected Expo owner:

- `therealsquall`

If ownership ever needs to change, decide:

- Which Expo account will own the project.
- Whether the project should live under a personal Expo account or an organization.
- Who can access builds and project settings.
- Whether the selected owner name should remain committed in `app.json` as `owner`.

Do not put passwords, tokens, session IDs, recovery codes, or account secrets in docs or chat.

Safe output to paste back later if ownership changes:

```text
Expo owner selected: <username-or-org-name>
EAS logged in: yes/no
```

Avoid pasting:

- login tokens
- browser auth URLs with tokens
- Apple/Google credentials
- any provider API keys

## 4. Owner / Project ID Decision

Current config status:

- `app.json` has `owner` set to `therealsquall`.
- `app.json` has `extra.eas.projectId` set for the linked EAS project.
- `eas.json` contains only the preview build profile and public Expo env values.

Expected later behavior:

- Do not re-run `eas init` unless project metadata needs to be repaired.
- If EAS metadata changes later, inspect the diff before committing.

Safe output to paste back later:

```text
EAS owner: <owner>
EAS projectId added: yes/no
Config files changed by eas init: <file list>
```

`projectId` is not an API secret, but it is still account/project metadata. Treat it as normal repo metadata only after confirming the Expo owner is correct.

## 5. Credentials Expectations

Android preview:

- EAS has created/managed Android signing material for the successful preview build.
- Do not paste keystore passwords, credential JSON, or signing material into docs or chat.
- Let EAS manage credentials unless there is a deliberate reason to use local credentials later.

IOS later:

- iOS builds may require Apple Developer account access, device registration, or App Store Connect/TestFlight setup depending on distribution path.
- Do not add Apple account data in this repo.
- Do not attempt iOS first unless Apple account/device/tester setup is known.

## 6. Recommended Build Target

First target completed: Android preview APK.

Reasoning:

- The current preview profile already sets Android `buildType` to `apk`.
- Android internal install is usually lower-friction for a first private device smoke.
- It avoids iOS device registration/TestFlight/account complexity for the first install test.

Do not invite testers from this build until tester distribution, support, privacy wording, and known limitations are finalized.

## 7. IOS / TestFlight Later Path

IOS should come later after:

- Apple Developer account status is known.
- iOS distribution path is selected: internal distribution vs TestFlight.
- Device registration or App Store Connect requirements are understood.
- Bundle identifier ownership is confirmed for `com.toprakyildiz.wortweg`.
- Icon/splash display is verified in a native build.

Do not claim App Store or TestFlight readiness until a real upload/install path has been proven.

## 8. Manual Commands To Run Later

Do not run these commands until the user explicitly approves the EAS account/init/build step.

Preflight checks before any EAS command:

```sh
git status --short
npm run quality
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
```

Manual EAS account/project commands, only if project metadata needs to be checked or repaired later:

```sh
npx eas-cli login
npx eas-cli whoami
```

Manual Android preview rebuild command, later only after user approval:

```sh
npx eas-cli build --platform android --profile preview --clear-cache
```

Do not run an iOS build until Apple account and distribution path are confirmed.

## 9. What To Paste Back After Manual Setup

After `npx eas-cli login` and `npx eas-cli whoami`:

```text
EAS login: passed/failed
EAS account shown by whoami: <username-or-owner>
```

If `npx eas-cli init` is ever re-run:

```text
EAS init: passed/failed
Owner selected: <owner>
Project created/linked: yes/no
Files changed by EAS: <file list>
Any warning shown:
```

Current Android preview build smoke result:

```text
Android preview build: passed
Artifact type: APK
Install tested on phone: passed
App opens and user can enter app: passed
AI via hosted backend: passed
Speaking via hosted backend: passed
Silence/no-voice guard: passed
Wrong speech low-score behavior: passed
Temporary icon/splash acceptable for internal preview: passed enough
```

Do not paste secrets, signing credentials, Apple/Google private data, or `.env` values.

## 10. Rollback Plan If Build Fails

If `eas init` changes the wrong owner/project:

- Stop before building.
- Inspect `git diff`.
- Do not commit account metadata until the owner/project is confirmed.
- Ask whether to keep or revise the EAS metadata.

If a future Android build fails:

- Do not invite testers.
- Capture the safe error summary and build phase.
- Avoid pasting credential logs or secrets.
- Run `npm run quality` locally after any fix.
- Keep Expo Go and local development path working.

If the installed build launches but backend features fail:

- Confirm `EXPO_PUBLIC_AI_BACKEND_URL=https://wortweg.onrender.com` was included in the preview profile.
- Run hosted smoke again:

```sh
BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke
```

- Do not move provider API keys into the mobile app.

## 11. Private Alpha Scope Guardrails

- This is not a public launch.
- Do not claim App Store or Play Store readiness.
- Do not unlock or claim full B1/B2 availability.
- Keep B1 preview limited to 8 optional lessons.
- Keep Azure pronunciation assessment as future work only.
- Keep OpenAI/Gemini/provider keys backend-only.
- Keep `.env` local and untracked.
- Keep final brand/Wolli assets pending until approved.

## 12. Remaining Blockers Before Tester Distribution

Before testers are invited:

- Tester support/contact process is defined.
- Private alpha tester guide is finalized.
- Final brand/icon/splash/Wolli asset expectations are clear; temporary assets are acceptable only for internal preview.
- Optional backend error-copy installed-build test is completed or documented as skipped.
- Production backend start no longer depends on `tsx`, or that limitation is accepted for the current private preview scope.
- iOS/TestFlight path remains later and unclaimed.

## 13. Next Prompt Title

Define private alpha tester distribution and support process.
