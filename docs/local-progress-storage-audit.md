# WortWeg Local Progress & Storage Audit

## 1. What is Stored Locally
The entire user state is stored locally as a serialized JSON object. This includes:
- **Onboarding Profile:** Goals, target CEFR level, target daily minutes.
- **Learning Plan:** The computed roadmap for the user.
- **Progression:** XP, streaks, completed lesson IDs.
- **Detailed Progress:** Lesson-specific progress (correct/total answers), mid-lesson checkpoints.
- **Spaced Repetition (Weak Points):** `reviewCards` (due dates, intervals, ease factors) and `mistakes` (exact prompt and user answer).
- **Speaking Stats:** Best scores, attempt counts, and IDs of practiced sentences.
- **AI Teacher:** `chatMessages` (the full history of interactions with the AI).
- **Exam Prep:** `examHistory` containing past scores.
- **Analytics:** `LocalEventLog` tracks anonymized app usage and navigation events.

## 2. Storage Keys
The app uses React Native's `@react-native-async-storage/async-storage`.
- `STORAGE_KEYS.userState` -> holds the core `UserState` JSON object.
- `STORAGE_KEYS.localEventLog` -> holds locally cached analytics events before flushing.

## 3. Which Store/File Owns Each Data Type
There is no third-party state manager like Zustand or Redux Persist.
- **`src/lib/storage.ts`** acts as the central hub. It reads/writes the `UserState` directly to `AsyncStorage`.
- **`src/types/userState.ts`** defines the exact TypeScript schema for all saved data.
- **`src/services/localEventLog.ts`** manages the analytics payload queue independently.

## 4. Which Data is Safe to Sync Later
- **Progression Data:** `xp`, `streak`, `completedLessons`, `lessonProgress`.
- **Weak Points:** `reviewCards` (useful for cross-device spaced repetition).
- **Speaking Stats:** `SpeakingStats` (purely numerical/ID based, no PII).
- **Learning Plan:** User's chosen level and goal.

## 5. Which Data Should Remain Local-Only
- `lessonCheckpoint`: Mid-lesson states change too frequently and aren't necessary to sync unless cross-device handoff mid-lesson is required.
- `LocalEventLog`: Should only be sent via a dedicated analytics/telemetry POST endpoint, not as part of the core user profile sync.

## 6. Which Data Needs Anonymization
- `profile.name`: If it exists, should be omitted if syncing anonymously.
- `mistakes.userAnswer`: If users type sensitive info in free-text exercises, it gets saved here.
- `chatMessages`: The AI teacher chat logs could contain PII typed by the user.

## 7. Whether Raw Audio is Stored Locally
**No.** The `UserState` contains no raw audio binaries, base64 blobs, or local file URIs for voice recordings.

## 8. Whether Transcripts/Pronunciation Feedback are Stored Locally
**Partially.** 
- Detailed Azure pronunciation word-level feedback is *not* stored persistently.
- Only aggregated numerical scores (`bestScorePercent`, `latestScorePercent`) and `practicedSentenceIds` are saved in `speakingStats`.
- However, AI Teacher interactions *are* stored in `chatMessages` as raw text.

## 9. Risks for Future Migration
- **Payload Size:** `chatMessages` and `reviewCards` can grow unbounded over time. Attempting to sync the entire `userState` JSON blob in one request will eventually cause payload too large errors or timeouts on slow connections.
- **Conflict Resolution:** If a user plays offline on two devices, merging `completedLessons` is easy, but merging spaced repetition `reviewCards` intervals requires a careful conflict strategy (e.g., last-write-wins per card).

## 10. Recommended Sync Payload for Anonymous Alpha 0.8/0.9
To minimize backend cost and privacy risks, the first iteration of database sync should **only** extract and upload:
```json
{
  "deviceId": "anonymous-uuid",
  "xp": 150,
  "streak": 3,
  "completedLessons": ["lesson-1", "lesson-2"],
  "speakingBestScores": { "A1": 85, "A2": 90 }
}
```
**Exclude:** `chatMessages`, `lessonCheckpoint`, `localEventLog`, and `mistakes`.
