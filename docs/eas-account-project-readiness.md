# WortWeg EAS Account / Project Readiness Checklist

This checklist prepares the first EAS preview build decision path for WortWeg private alpha. It does not run EAS, create credentials, add native folders, add Apple/Google account data, or claim App Store / Play Store readiness.

## 1. Current Status

- Project type: Expo React Native managed app.
- Current verified testing path: Expo Go.
- Hosted backend: `https://wortweg.onrender.com`.
- Mac hosted smoke: passed.
- Phone hosted AI/speech smoke: passed.
- `eas.json`: present with a preview-only internal distribution profile.
- iOS identifier: `com.toprakyildiz.wortweg`.
- Android package: `com.toprakyildiz.wortweg`.
- Temporary private-alpha assets are present:
  - `assets/icon.png`: 1024x1024.
  - `assets/adaptive-icon.png`: 1024x1024.
  - `assets/splash.png`: 1242x2436.
- No real EAS build has been run yet.
- No native `ios/` or `android/` folders are committed.
- No Azure implementation.
- This is private-alpha preparation only, not public launch readiness.

## 2. Local EAS Tooling Status

Current package/script audit:

- `package.json` has no EAS scripts.
- `eas-cli` is not listed in dependencies or devDependencies.
- No local `node_modules/.bin/eas` or `node_modules/.bin/eas-cli` binary is present.
- Future commands should use `npx eas-cli ...` unless the project later chooses to add a pinned local EAS CLI dependency.

Do not install EAS CLI or run EAS commands until the account/project decisions below are confirmed.

## 3. Required Expo Account Decision

Before `eas init`, decide:

- Which Expo account will own the project.
- Whether the project should live under a personal Expo account or an organization.
- Who can access builds and project settings.
- Whether the selected owner name should be committed in `app.json` as `owner` after initialization.

Do not put passwords, tokens, session IDs, recovery codes, or account secrets in docs or chat.

Safe output to paste back later:

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

- `app.json` has no `owner` field.
- `app.json` has no `extra.eas.projectId` field.
- `eas.json` has no account-specific values.

Expected later behavior:

- `npx eas-cli init` may ask which Expo account/owner should own the project.
- `eas init` may add an EAS project ID to app config.
- If config is changed by `eas init`, inspect the diff before committing.

Safe output to paste back later:

```text
EAS owner: <owner>
EAS projectId added: yes/no
Config files changed by eas init: <file list>
```

`projectId` is not an API secret, but it is still account/project metadata. Treat it as normal repo metadata only after confirming the Expo owner is correct.

## 5. Credentials Expectations

Android first preview:

- EAS may create or manage Android signing material when the first Android build runs.
- Do not paste keystore passwords, credential JSON, or signing material into docs or chat.
- Let EAS manage credentials unless there is a deliberate reason to use local credentials later.

IOS later:

- iOS builds may require Apple Developer account access, device registration, or App Store Connect/TestFlight setup depending on distribution path.
- Do not add Apple account data in this repo.
- Do not attempt iOS first unless Apple account/device/tester setup is known.

## 6. Recommended First Build Target

Recommended first target: Android preview APK.

Reasoning:

- The current preview profile already sets Android `buildType` to `apk`.
- Android internal install is usually lower-friction for a first private device smoke.
- It avoids iOS device registration/TestFlight/account complexity for the first install test.

Do not invite testers from this first build until install, backend, speech, privacy, and support flows are verified on at least one real phone.

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

Manual EAS account/project setup commands, later only:

```sh
npx eas-cli login
npx eas-cli whoami
npx eas-cli init
```

Manual first Android preview build command, later only:

```sh
npx eas-cli build --platform android --profile preview
```

Do not run an iOS build until Apple account and distribution path are confirmed.

## 9. What To Paste Back After Manual Setup

After `npx eas-cli login` and `npx eas-cli whoami`:

```text
EAS login: passed/failed
EAS account shown by whoami: <username-or-owner>
```

After `npx eas-cli init`:

```text
EAS init: passed/failed
Owner selected: <owner>
Project created/linked: yes/no
Files changed by EAS: <file list>
Any warning shown:
```

After the first Android preview build is eventually run:

```text
Android preview build: passed/failed
Build URL or ID: <non-secret build link/id>
Artifact type: APK/AAB
Install tested on phone: passed/failed
AI via hosted backend: passed/failed
Speaking via hosted backend: passed/failed
Silence/no-voice guard: passed/failed
Any error seen:
```

Do not paste secrets, signing credentials, Apple/Google private data, or `.env` values.

## 10. Rollback Plan If Build Fails

If `eas init` changes the wrong owner/project:

- Stop before building.
- Inspect `git diff`.
- Do not commit account metadata until the owner/project is confirmed.
- Ask whether to keep or revise the EAS metadata.

If the Android build fails:

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

## 12. Remaining Blockers Before First Build

Before the first Android preview build command is run:

- User confirms Expo account/owner.
- User manually logs in with `npx eas-cli login`.
- User confirms `npx eas-cli whoami` output.
- User manually runs `npx eas-cli init` or explicitly approves running it.
- Any `owner`/`projectId` config diff is reviewed.
- `npm run quality` passes.
- Hosted backend smoke passes.

Before testers are invited:

- Android preview build installs on a real phone.
- AI chat works through hosted backend.
- Speaking works through hosted backend.
- Silence/no-voice guard still blocks false perfect scores.
- Tester support/contact process is defined.
- Private alpha tester guide is finalized.

## 13. Next Prompt Title

Prepare first EAS Android preview build after manual account/init confirmation.
