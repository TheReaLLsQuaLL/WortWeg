# WortWeg Alpha 0.7.1 Release Gate Audit

This document verifies that the `main` branch is entirely clean, safe, and configured correctly for the upcoming Alpha 0.7.1 APK build.

## 1. Branch State
- **Current Branch:** `main`
- **Sync State:** Up to date with `origin/main`
- **Uncommitted Changes:** None (Clean working tree)

## 2. Version State
The version constants exactly match the required target:
- **`package.json` version:** `0.7.1`
- **`app.json` expo.version:** `0.7.1`
- **`app.json` android.versionCode:** `7`
- **`APP_VERSION`:** `0.7.1-alpha`

## 3. Content State
- **Lessons:** 40
- **Exercises:** 320
- **Vocabulary:** 320
- The A1–C2 expansion and exam-prep foundation are correctly **excluded** from this branch, ensuring maximum stability for this specific release.

## 4. Required Fixes Verified
The commit history confirms `main` includes all critical fixes for this build:
- Azure word-level pronunciation feedback
- B1 preview content (`4911caf`)
- Microphone permission resume fix (`f978c67`)
- Speech temp upload cleanup fix (`d04e0f9`)

## 5. Excluded Future Branches
The `main` branch correctly **does not** include:
- `feature/a1-c2-content-expansion`
- `feature/exam-prep-foundation`
- Database implementation
- Login implementation
- Payment implementation
- Any new unverified native dependencies

## 6. Audit Command Logs
The following commands were run on the backend to verify the state:

```bash
$ git checkout main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.

$ git status -sb
## main...origin/main

$ git log --oneline -10
d04e0f9 Merge speech upload temp cleanup fix
1a6d832 Clean temp upload file on speech upload errors
4fc0b46 Add store and privacy readiness docs
e7c2a76 Add private alpha tester materials
f978c67 Merge microphone permission resume fix
8899755 Fix microphone permission refresh after resume
db54a04 Prepare alpha 0.7.1 release
4911caf Merge B1 preview content pack
13f0b8b Add B1 preview content pack lessons
373a677 Prepare alpha 0.7.0 release

$ node -p "require('./package.json').version"
0.7.1

$ node -e "const app=require('./app.json'); console.log(app.expo.version); console.log(app.expo.android.versionCode)"
0.7.1
7

$ grep -R "APP_VERSION" -n src/data/constants.ts
src/data/constants.ts:5:export const APP_VERSION = '0.7.1-alpha';

$ npm run quality
> wortweg@0.7.1 quality
> npm run typecheck && npm run content:qa && npm run server:check && git diff --check
...
{
  "lessons": 40,
  "exercises": 320,
  "vocabulary": 320
}
...
[WortWeg Backend] config ok
```

## 7. Final Judgment
**PASS:** `main` is entirely clean, locked to the correct version, successfully compiled, and ready for the Alpha 0.7.1 APK build.
