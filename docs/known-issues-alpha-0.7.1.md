# Known Issues & Limitations (Alpha 0.7.1)

This document outlines the known issues, current limitations, and missing features in the WortWeg Alpha 0.7.1 build. Please review this before testing so you are aware of what is already known and what is intentionally omitted from this build.

## 1. What is NOT Included Yet
As this is an early Alpha release focused on core interaction and AI speaking evaluation, several major infrastructure features have not yet been integrated:

- **Database / Cloud Sync:** All learning progress (XP, completed lessons) is currently saved locally on your device. If you uninstall the app or clear its data, your progress will be lost. Cloud synchronization will be added in Alpha 0.8.
- **User Login / Accounts:** There is no authentication system yet. Users test the app anonymously.
- **Payments / Premium Paywall:** The planned premium tier and subscription mechanics (via RevenueCat/Stripe) are not active. All visible content is accessible for testing purposes.
- **Full Exam Mode:** While "exam-style" foundation lessons exist, the full timed mock exams (Goethe, telc, TestDaF) and advanced AI writing evaluations are still in development and not present in this build.

## 2. Known Limitations & Bugs
- **EAS Quota Constraint:** The automated build pipeline for generating the Android APK is temporarily paused due to EAS quota limits. 
- **AI Processing Delays:** Occasionally, the transcription or Azure pronunciation scoring may take longer than usual (more than 3 seconds) depending on network conditions or server load. The app will display a "Sunucu meşgul olabilir" message. This is normal during the Alpha.
- **Synthetic Voice Matching:** Testing the microphone by playing automated synthetic text-to-speech (like macOS `say` or Google Translate audio) into the phone's microphone might yield artificially low pronunciation/fluency scores because the Azure system expects human voice cadence. Please test with your real voice.
- **iOS Compatibility:** This build is optimized and targeted primarily for the Android APK test. While the code supports iOS, extensive iOS-specific permission and UI testing is deferred to a later beta phase.
