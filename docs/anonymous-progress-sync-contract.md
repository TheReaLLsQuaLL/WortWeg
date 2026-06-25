# WortWeg Anonymous Progress Sync Contract

## 1. Purpose
- **Anonymous tester progress restore:** Allow early testers to reinstall the app without losing basic progression.
- **Future analytics:** Understand where users typically stop or struggle across the curriculum.
- **No login yet:** Keep friction zero for Alpha/Beta testing.
- **No payment yet:** Monetization infrastructure is entirely separated from this early progress contract.

## 2. Never Sync Full UserState
Because the entire user state is stored in a single `UserState` object locally (via `AsyncStorage`), it is critical to **never** blindly sync the whole object to the cloud.
- `UserState` contains highly sensitive, local-only fields such as `chatMessages` (full AI interactions) and `mistakes.userAnswer` (free-text inputs).
- Sync operations must use a strict, explicit **allowlist/pick function** to extract only the necessary progression numbers before making a network request.

## 3. Sync-Safe Fields
The progress sync payload is restricted to minimal, non-identifying data. Only the following fields may be synced:
- `anonymousDeviceId` (or `anonymousProfileId`)
- `appVersion`
- `schemaVersion`
- `xp` (total points)
- `streak` (if present)
- `completedLessons` (array of string IDs)
- `lessonProgress` (only lesson IDs and numerical completion stats)
- `weak points / reviewCards` (only word IDs and intervals, no full sentences)
- `speakingStats` (aggregated numbers and best percentages only)
- `lastSyncAt`

## 4. Local-Only Fields
The following fields **MUST NOT** be synced in the first phase:
- `chatMessages`
- Raw AI prompts
- Full AI responses
- `mistakes.userAnswer`
- Free text answers
- Raw transcripts
- Raw audio
- Audio URIs
- Personal names / emails
- Payment data

## 5. Example Safe Payload
```json
{
  "anonymousDeviceId": "uuid-v4-generated-locally",
  "appVersion": "0.8.0-alpha",
  "schemaVersion": 1,
  "lastSyncAt": "2026-06-25T15:00:00Z",
  "payload": {
    "xp": 1450,
    "streak": 5,
    "completedLessons": ["a1-01-intro", "a1-02-verbs"],
    "speakingStats": {
      "totalAttempts": 42,
      "successfulAttempts": 38,
      "levelBreakdown": {
        "A1": {
          "bestScorePercent": 88
        }
      }
    }
  }
}
```

## 6. Backend Validation Rules
- **Reject unknown fields:** The backend MUST strip or reject any payload containing fields outside the strict Zod schema (e.g., rejecting any `chatMessages` arrays).
- **Payload size limit:** Enforce a strict max payload size (e.g., 50KB) to prevent abuse or accidental full-state uploads.
- **Validate arrays and strings:** Ensure `completedLessons` are standard string IDs and not arbitrary massive text blobs.
- **No raw audio/text blobs:** Strictly reject any binary or base64 data.
- **Require schemaVersion:** For safe future migrations.
- **Rate limit sync endpoint:** Prevent abuse (e.g., max 10 syncs per minute per device ID).

## 7. Offline-First Behavior
- **App works without sync:** The local `AsyncStorage` remains the absolute source of truth.
- **Local storage master:** UI rendering relies solely on local state.
- **Sync runs in background:** Network requests should fire silently after a lesson concludes.
- **Backend failure safety:** If the backend is down or offline, it must not block the user from continuing their lessons.

## 8. Privacy Wording
- **Anonymous sync:** The app securely backs up progression scores anonymously tied to the device.
- **Minimal progress data:** We only sync numbers and lesson IDs to improve the app, never your raw voice or free-text inputs.
- **Deletion/reset later:** A clear mechanism to wipe this remote anonymous profile will be provided for full data control.

## 9. Future Expansion
- **Login later:** Tying this anonymous UUID to a formal email/social account in Alpha 0.9+.
- **Account deletion later:** Full GDPR compliance dashboard.
- **Premium entitlement later:** Verifying payments via RevenueCat/Stripe securely against the database user.
- **Optional writing history:** Syncing `chatMessages` or text answers only with explicit, opt-in consent much later in the product cycle.
