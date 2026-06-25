# WortWeg Database Sync Implementation Plan

## 1. Why Database is Needed
* **Progress restore after reinstall:** So users don't lose all their progress if they switch devices or reinstall.
* **Tester progress analytics:** To see where Alpha testers struggle and which lessons they complete.
* **Weak points sync:** To synchronize the spaced-repetition algorithm across devices.
* **Future login:** Laying the groundwork for email/social login later.
* **Future premium entitlement:** Verifying purchases and subscriptions safely in the cloud.

## 2. What Should Stay Local First
The app should remain fully functional using local storage (Zustand/AsyncStorage/MMKV) as the primary source of truth:
* Current progress
* Recent activity
* Weak points
* Lesson completion
* Streaks (if any are implemented)

## 3. Recommended First Phase
* **Anonymous tester/device ID:** Use a randomly generated UUID tied to the device installation to identify testers.
* **No email login yet:** Keep the onboarding friction zero.
* **Sync only minimal progress:** Track completed lessons and exercise IDs.
* **No raw audio storage:** To avoid massive costs and privacy concerns.
* **No chat history storage:** To save space and maintain privacy during early phases.
* **No payment data:** Premium is not active yet.

## 4. Suggested Database Tables
* `users` or `anonymous_profiles` (id, device_id, created_at, last_active)
* `lesson_progress` (user_id, lesson_id, status, completed_at, score)
* `exercise_attempts_summary` (user_id, total_attempts, total_correct, last_played_at)
* `weak_points` (user_id, vocabulary_id, fail_count, next_review_at)
* `app_feedback` (user_id, category, message, created_at)
* `device_sessions` (user_id, app_version, os, last_sync)

## 5. Data Minimization Rules
* **Store only what is needed:** Aggregate data where possible rather than storing every single tap.
* **Avoid raw audio:** Do not upload or store WAV/M4A files to the database.
* **Avoid full AI chats at first:** Do not store the exact prompt/response logs of the AI teacher per user yet.
* **Avoid sensitive personal data:** No names, emails, or phone numbers until absolutely required.
* **Allow deletion later:** Ensure the architecture supports a simple "Delete My Data" feature.

## 6. Backend/API Plan
* **POST /sync/progress:** Pushes local changes to the cloud.
* **GET /sync/progress:** Pulls the latest state from the cloud to restore progress.
* **POST /feedback:** Submits user crash reports or UI feedback.
* **Auth later:** Wait on JWT/OAuth until Phase 2.
* **Rate limiting:** Strict rate limits per device ID to prevent abuse.
* **Validation:** The backend must strictly validate payload schemas using Zod.

## 7. Migration Strategy
* **Keep current local storage working:** The local storage layer remains the master state for the UI.
* **Sync in background:** API calls should happen silently after a lesson is completed, not during gameplay.
* **Offline resilience:** If the backend fails or there is no internet, the app must still work perfectly offline/local.
* **No blocking UI:** Do not show loading spinners while syncing progress.

## 8. Privacy/Security Checklist
* No database secrets in the mobile app bundle.
* HTTPS only for all API requests.
* Backend must validate all payloads (no blind inserts).
* Include a delete/reset option later for GDPR compliance.
* Document the chosen provider policies (Supabase/Firebase/PostgreSQL) in the privacy notes.

## 9. Release Plan
* **Now:** Database architecture planning and schema design.
* **Later (Alpha 0.8.x):** Implement anonymous background sync for testers.
* **Later (Alpha 0.9.x):** Implement email/social login and account creation.
* **Much later (1.0 / Beta):** Implement payment entitlement validation.

## 10. Risks
* **Data model lock-in:** Designing a schema that is too rigid might require painful migrations later.
* **Privacy complexity:** Syncing data opens up GDPR and data residency concerns.
* **Backend cost:** High volume row inserts (e.g., every exercise answered) will spike costs rapidly. Aggregation is required.
* **Sync bugs:** Conflict resolution between local and remote state (e.g., offline play followed by online play) is notoriously difficult.
* **Account deletion requirements:** Both Apple and Google require an easily accessible account deletion button if any data is stored remotely.
