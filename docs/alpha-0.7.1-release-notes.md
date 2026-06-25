# WortWeg Alpha 0.7.1 Release Notes

**Version:** 0.7.1-alpha
**Build Target:** Android (APK via EAS)
**Main Focus:** Speaking and Pronunciation AI Testing

This release is a major milestone for the WortWeg Private Alpha, introducing highly advanced Azure-backed pronunciation feedback and hardening the microphone interaction flow.

## 🚀 New Features & Capabilities
- **Advanced Pronunciation Scoring:** Speaking exercises now utilize Azure Cognitive Services to return distinct scores for Pronunciation, Accuracy, Fluency, and Completeness.
- **Word-Level Feedback:** The app now precisely identifies and highlights mispronounced words within a recorded sentence to help users target specific weaknesses.
- **B1 Preview Content:** A small selection of intermediate-level (B1) grammar and vocabulary lessons has been included to preview more advanced scenarios.

## 🛠 Bug Fixes & Stability
- **Microphone Permission Resume Fix:** Fixed a critical bug where the app failed to re-check microphone permission state when returning from the Android settings screen. It now uses `AppState` to perfectly sync permission states natively.
- **Microphone Background Freeze Fix:** Fixed an edge case where putting the app in the background while actively recording would cause the UI to freeze indefinitely. It now gracefully cancels the recording.
- **Temp Upload Cleanup Safety Fix:** Patched the backend to guarantee the immediate deletion of temporary audio files even when a `multer` `LIMIT_FILE_SIZE` crash occurs, preventing disk space leaks over time.

## ⚠️ Known Limitations
- **No A1–C2 Expansion Yet:** The massive 76-lesson A1–C2 curriculum expansion and Exam Prep foundation are safely developed on a separate branch and are **not** included in this APK to keep testing focused.
- **No Cloud Sync / Login Yet:** All progress (XP, lessons completed) is saved strictly to local device storage. Deleting the app will erase your data.
- **No Payment Yet:** The app is entirely free.
- **No Full Exam Center Yet:** The comprehensive Goethe/telc/TestDaF practice areas are not active in this build.

## 🧪 What Testers Should Focus On
1. **Microphone Permissions:** Deny it, grant it, jump to Android settings and return. Ensure the record button responds perfectly to the real OS permission state.
2. **Speaking Feedback:** Intentionally mispronounce a word (e.g., say an English word in the middle of a German sentence) and verify that the UI correctly highlights that specific word.
3. **Cancel Flow:** Swipe to cancel a recording. Background the app while recording. Ensure it never gets stuck.

## 🐞 Bug Reporting Guidelines
If you find a bug, please include:
- Device Model & Android Version
- Exactly what you pressed before the bug occurred
- Whether you are on Wi-Fi or Cellular
- Screenshots or Screen Recordings (crucial for UI freezes or AI response anomalies)
