# WortWeg Data Handling & Processing Notes (Alpha 0.7.1)

This document serves as an internal reference for how data flows through the WortWeg app and backend, specifically focusing on user privacy and security limits. It is designed to prepare the team for future Play Store Data Safety questionnaires.

## 1. Microphone & Audio Processing
- **Action:** User presses and holds the record button in `SpeakingPracticeScreen`.
- **Permission:** Requires `RECORD_AUDIO` permission on Android.
- **Flow:** 
  1. Expo Audio API records a temporary `.wav` or `.m4a` file to the device's local cache.
  2. The file is uploaded via HTTP POST to the WortWeg backend (`/speech/transcribe`).
  3. The backend buffers the file in memory or `/tmp`.
  4. The backend streams the file to **Azure Cognitive Services** (for pronunciation scoring) or **OpenAI Whisper** (as a fallback).
  5. The backend returns the JSON score/transcript to the app.
- **Storage Policy:** 
  - The backend does NOT save the raw audio to any permanent storage bucket (e.g., AWS S3).
  - The local device overwrites or clears the temporary audio file.
- **Play Store Safety Impact:** We must declare that we collect Audio data, but we can specify that it is processed ephemerally (not retained) and is required for core app functionality.

## 2. AI Teacher (Text Processing)
- **Action:** User interacts with the AI Teacher.
- **Flow:**
  1. The user's text input is sent via HTTP POST to the backend (`/ai/chat`).
  2. The backend forwards the prompt to **Google Gemini** or **OpenAI**.
  3. The generated response is returned to the app.
- **Storage Policy:**
  - Chat history is maintained locally on the device for context during a session.
  - The backend does not currently log or store chat transcripts in a database.
- **Play Store Safety Impact:** We must declare that we collect User Content (Text).

## 3. Account and Progress Data
- **Current State (Alpha 0.7.1):** 
  - There is NO database.
  - There is NO user authentication (no emails, passwords, or OAuth).
  - All progress (XP, completed exercises, lesson status) is stored entirely locally on the device using `AsyncStorage` or similar local SQLite mechanisms.
- **Future State (Alpha 0.8+):** 
  - A backend database (e.g., PostgreSQL via Prisma) will be implemented to sync progress.
  - Authentication will be added.
  - At that point, the Privacy Policy must be updated to reflect the retention and deletion policies of user accounts.

## 4. Financial & Payment Data
- **Current State:** 
  - The app is 100% free. No payment SDKs (like RevenueCat or Stripe) are integrated into the active build.
- **Future State:**
  - Premium paywalls will be added. Financial data will be handled securely by third-party processors (Google Play Billing / Apple App Store). WortWeg will not process raw credit card numbers.

## 5. Items to Verify Before Publishing
- [ ] Verify that the backend deployment on Render actively clears `/tmp` directories if files are temporarily cached during audio parsing.
- [ ] Ensure that Azure/OpenAI/Gemini API keys are configured as "Zero Data Retention" (ZDR) if available, meaning the providers do not use our users' audio/text to train their public models.
- [ ] Confirm if Expo or React Native implicitly collects crash logs (e.g., via Sentry or Crashlytics, if added later) and declare it. Currently, no crash reporting SDK is explicitly installed.
