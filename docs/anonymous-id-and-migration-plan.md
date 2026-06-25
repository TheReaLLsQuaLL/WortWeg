# WortWeg Anonymous ID & Local Migration Plan

## 1. Purpose
- **Anonymous progress restore:** Allows testers to keep their progress tied to a unique identifier without needing to log in.
- **No login yet:** The onboarding process remains friction-free for Alpha/Beta testing.
- **No email/name collection:** Prevents the storage of sensitive personally identifiable information (PII).
- **No payment connection yet:** Separates core educational testing from monetization systems.

## 2. Anonymous ID Requirements
- **Generated on device or backend:** Can be securely generated locally or assigned by the server upon first connection.
- **Stable across app sessions:** The ID must persist in local storage and remain identical across app reboots.
- **Stored locally:** Must be written to `AsyncStorage` alongside the user state.
- **Not derived from personal information:** Cannot be a hash of a name, email, or phone number.
- **Resettable later:** The user must be able to reset/wipe this ID locally.

## 3. Recommended ID Format
- **UUID-style random ID:** Use a robust, collision-resistant string format.
- **Example:** A standard UUID v4 or a custom prefix like `anon_a1b2c3d4-e5f6-7890`.
- **Include schemaVersion:** e.g., `schemaVersion: 1` to gracefully handle future database migrations.
- **Include createdAt:** A timestamp indicating when the ID was first generated.

## 4. Local Migration Strategy
- **Existing users already have progress:** Do **not** wipe the current `UserState` when upgrading the app.
- **Add anonymousProfileId alongside current local state:** Modify `src/lib/storage.ts` to seamlessly inject this ID into the state payload.
- **If missing, create once:** If the app loads and `anonymousProfileId` is absent, generate and save it immediately.
- **If present, reuse it:** Do not overwrite existing IDs.
- **Migration must be idempotent:** Running the migration logic multiple times must yield the exact same state.

## 5. Sync Allowlist
- **Explicitly pick safe fields only:** Build a rigid extraction function (`getSyncPayload(state)`) that only returns basic progression (`xp`, `streak`, `completedLessons`, etc.).
- **Never sync full UserState:** Ensure the raw `AsyncStorage` JSON blob is never transmitted whole.
- **Never sync chatMessages:** AI conversation history remains 100% local.
- **Never sync mistakes.userAnswer:** Any user-typed free text must stay on the device.
- **Never sync raw transcripts/audio:** Completely ban base64 or URI uploads of voice data.

## 6. Failure Behavior
- **If ID creation fails, app still works locally:** The UI and lessons must function flawlessly without an ID.
- **Sync is delayed, not blocking:** API requests run in the background. Failed syncs are queued and retried later.
- **No login wall:** Never force the user to "create an account to continue learning".
- **No loading spinner blocking lessons:** Network states must never halt the user's study session.

## 7. Reset/Delete Future Plan
- **Local reset:** A button in settings to wipe local `AsyncStorage` and generate a fresh ID.
- **Backend delete endpoint later:** For GDPR compliance, a `/delete-my-data` endpoint to drop the backend profile.
- **Account linking later:** Transitioning an `anonymousProfileId` to an authenticated user (Firebase/Supabase ID).
- **Anonymous-to-login migration later:** Ensuring progress successfully merges into the new authenticated profile.

## 8. Edge Cases
- **App reinstall loses local anonymous ID:** Without an email login, uninstalling wipes the UUID. (This is acceptable for Phase 1 testers).
- **Multiple devices create separate anonymous IDs:** If a tester installs on a phone and an iPad, they will remain separate profiles.
- **Same tester can’t merge devices until login exists:** Device merging will only be possible once Phase 4 (Login) is implemented.
- **AsyncStorage corruption fallback:** If local storage corrupts, default to generating a new ID and gracefully resetting state.

## 9. Security/Privacy
- **Random ID is not authentication by itself:** Exposing an anonymous ID shouldn't grant admin access to other users.
- **Backend must validate rate limits:** To prevent malicious payload stuffing.
- **Do not expose database keys in mobile app:** The React Native app talks only to a secure REST API.
- **Do not log full sync payloads:** Backend logs must strip out payload bodies.

## 10. Implementation Phases
- **Phase 1 (Current):** Documentation only.
- **Phase 2:** Local anonymous ID generator (modifying `UserState` to include the ID).
- **Phase 3:** Backend sync endpoints behind env flag.
- **Phase 4:** Mobile sync sender.
- **Phase 5:** Login/account linking.
