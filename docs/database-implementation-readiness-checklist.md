# WortWeg Database Implementation Readiness Checklist

## 1. Preconditions Before Coding
- [ ] Alpha 0.7.1 APK is fully tested and tester feedback is collected.
- [ ] `main` branch is stable and no longer frozen for 0.7.1.
- [ ] Privacy documents (`store-privacy-readiness.md`) have been reviewed against sync plans.
- [ ] Confirmed strictly that no raw audio, chat history, or free-text answers will sync.
- [ ] The anonymous sync payload contract (`anonymous-progress-sync-contract.md`) is fully approved.

## 2. Required Implementation Order
When coding begins, follow this exact sequence to ensure safety:
1. **Local Anonymous ID Generator:** Add local UUID generation to the mobile app.
2. **Safe Allowlist/Pick Function:** Create a robust utility to pluck *only* safe fields from `UserState`.
3. **Backend Validation Schemas:** Implement exact Zod schemas on the backend API layer.
4. **Backend Sync Endpoints:** Build the routes behind an environment flag.
5. **Database Migration/Schema:** Deploy the anonymous profile and summary tables to the database.
6. **Frontend Background Sync Sender:** Hook the mobile app's allowlist function to silently POST data after lessons.
7. **Restore Flow:** Add logic to GET and merge progress locally if restoring a device.
8. **Feedback Endpoint:** Implement the manual feedback/crash report POST route.
9. **QA Tools/Logging:** Setup backend logging to explicitly strip the body of incoming payloads to prevent sensitive leaks.

## 3. Safe Allowlist Reminder
**NEVER** blindly sync the full `UserState` JSON object. Only sync the following fields:
- `anonymousProfileId`
- `appVersion`
- `schemaVersion`
- `xp`
- `streak`
- `completedLessons`
- Lesson progress summaries
- Weak point category IDs/summaries
- `speakingStats` aggregated numbers (no raw sentence text)
- `lastSyncAt`

## 4. Forbidden Data Reminder
To protect user privacy and save payload costs, **NEVER** sync:
- `chatMessages`
- AI prompts
- AI responses
- `mistakes.userAnswer`
- Free text answers
- Raw transcripts
- Raw audio
- Audio URIs
- Names/emails
- Payment data

## 5. Backend Endpoint Checklist
Ensure the following are fully implemented and tested on the server:
- [ ] `POST /sync/anonymous/progress`
- [ ] `GET /sync/anonymous/progress/:anonymousProfileId`
- [ ] `POST /feedback/alpha`
- [ ] `POST /sync/anonymous/session`
- [ ] Zod validation on every route.
- [ ] Strict rate limits by IP or profile ID.
- [ ] Unknown field rejection/stripping.
- [ ] Payload size limits (e.g., max 50KB).

## 6. Mobile Checklist
- [ ] Generate ID once and only once per installation.
- [ ] Persist ID locally in `AsyncStorage`.
- [ ] Preserve all existing local progress for legacy Alpha testers.
- [ ] Sync strictly in the background (no loading spinners blocking UX).
- [ ] Never block the lesson UI if the network request is pending.
- [ ] Retry later on failure silently.
- [ ] Show NO login wall or prompt.

## 7. QA Checklist
Before declaring database sync complete, verify:
- [ ] A fresh install correctly assigns an ID and syncs base stats.
- [ ] An existing install successfully migrates, keeps progress, and gets an ID.
- [ ] Offline mode works perfectly; no errors block the user.
- [ ] If the backend is down, the app degrades gracefully (local-only).
- [ ] Inspect network payloads (e.g., via Charles Proxy or Flipper) to guarantee NO sensitive fields leaked.
- [ ] No local data is lost during merge conflicts.
- [ ] Restore progress on reinstall functions properly (when explicitly triggered/supported).
- [ ] A reset/delete test completely purges the ID from the device.

## 8. Rollback Plan
- **Env flag disables sync:** The mobile app must check a config flag; if disabled, the network request short-circuits.
- **App continues local-only:** If rollback is triggered, the app must remain fully usable using `AsyncStorage`.
- **Backend endpoints can be disabled:** Server can return a clean `200 OK` or `503 Service Unavailable` without crashing the mobile client.
- **No data loss if sync fails:** Because local storage is primary, a failed sync simply means the cloud is stale, not the user's phone.

## 9. Release Timing
- **Planning:** Now (Pre-Alpha 0.7.1 APK).
- **Anonymous sync:** After Alpha 0.7.1 testing, targeting Alpha 0.8/0.9.
- **Login:** Later (Beta or 1.0).
- **Payment:** Much later.
