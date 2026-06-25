# WortWeg APK Quota Reset Checklist (Alpha 0.7.1)

This checklist outlines the exact steps to verify, build, download, install, and test the next Android APK for WortWeg once the EAS Android free quota resets. 

---

## 1. Current Expected Main Branch State
Before starting the build, ensure `main` is in the correct state for the Alpha 0.7.1 release.
- [ ] `main` should include Alpha 0.7.1 features.
- [ ] Azure word-level pronunciation feedback is present.
- [ ] B1 preview content is present.
- [ ] Microphone permission resume bug is fixed.
- [ ] Speech temp upload cleanup bug is fixed.
- [ ] **NO** A1–C2 content expansion merged yet.
- [ ] **NO** exam-prep branch merged yet.
- [ ] **NO** database, payment, or login implementation yet.

## 2. Pre-Build Commands
Run the following commands in the terminal to verify the environment:

```bash
git checkout main
git pull origin main
git status -sb
git log --oneline -8
node -p "require('./package.json').version"
node -e "const app=require('./app.json'); console.log(app.expo.version); console.log(app.expo.android.versionCode)"
grep -R "APP_VERSION" -n src/data/constants.ts
npm run quality
```

## 3. Expected Version Output
After running the pre-build commands, verify the output matches exactly:
- [ ] `package.json`: **0.7.1**
- [ ] `app.json expo.version`: **0.7.1**
- [ ] `app.json android.versionCode`: **7**
- [ ] `APP_VERSION` in `constants.ts`: **0.7.1-alpha**

## 4. Expected Content Totals
Unless intentionally decided to merge the content expansion branches prior to this build, running `npm run content:qa` should yield:
- [ ] 40 lessons
- [ ] 320 exercises
- [ ] 320 vocabulary items

## 5. EAS Build Command
Execute the following command to start the build:
```bash
npx eas-cli build --platform android --profile preview --clear-cache
```

## 6. What to Check During EAS Build
While the build is running on the Expo dashboard, confirm:
- [ ] Correct Branch: `main`
- [ ] Correct Commit hash matches local `HEAD`
- [ ] Correct Environment Variable: `EXPO_PUBLIC_AI_BACKEND_URL` is set appropriately
- [ ] No accidental feature branches are being built
- [ ] No version mismatch in the build logs

## 7. APK Install Checklist
Once the build succeeds:
- [ ] Download the `.apk` file to the Android device.
- [ ] Allow "Install from unknown apps" in Android settings if prompted.
- [ ] Test a completely **fresh install** (delete any old versions first).
- [ ] (Optional) Test an **update install** over an older alpha build if possible.

## 8. Manual QA Checklist
On the device, manually verify the critical flows:
- [ ] App opens successfully without crashing.
- [ ] Lessons load and are accessible.
- [ ] Speaking practice opens properly.
- [ ] Microphone permission prompt appears natively on first use.
- [ ] Granting microphone permission allows recording.
- [ ] Recording audio and submitting returns a score successfully.
- [ ] Azure advanced score card appears after submission.
- [ ] Word-level feedback highlights appear when the backend returns individual words.
- [ ] **Background Bug Fix Check:** Put the app in the background, wait a few seconds, and return to the app. Microphone permission state remains correct and active.
- [ ] **Recording Cancel Check:** Start recording, put the app in the background, and return to the app. The screen does not freeze and gracefully cancels the previous recording.
- [ ] AI teacher chat feature responds correctly.
- [ ] Backend health check responds correctly.

## 9. Backend Checks
Verify the production backend is healthy:
```bash
curl https://wortweg.onrender.com/health
```
*(Should return `{"ok":true,"service":"wortweg-ai"}`)*

## 10. Pass / Fail Notes
*(To be filled out during the actual test)*
- **Build passed:** 
- **Install passed:** 
- **Speaking passed:** 
- **Azure passed:** 
- **Mic resume bug fixed:** 
- **Known issues:** 
