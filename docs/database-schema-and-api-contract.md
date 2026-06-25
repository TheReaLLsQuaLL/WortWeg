# WortWeg Database Schema & API Contract

## 1. Scope
- **Anonymous progress sync only:** For Alpha 0.8 / 0.9, the focus is solely on device-bound tester progress.
- **No login yet:** The app remains 100% friction-free; no email/password or social auth.
- **No payment yet:** Premium validation logic is deferred.
- **Forbidden data:** Strictly **no raw audio**, **no chat history**, and **no free-text answers** (like `mistakes.userAnswer`) to maintain high privacy and low payload sizes.

## 2. Suggested Tables
The backend database should implement the following tables (or document collections) to store the picked sync payload:
- **`anonymous_profiles`**: Tracks the unique device ID or tester ID, creation date, and last active date.
- **`progress_snapshots`**: Stores the high-level `xp` and `streak` over time.
- **`lesson_progress`**: Tracks which lesson IDs a profile has completed.
- **`weak_point_summaries`**: Tracks numerical stats for difficult vocabulary (e.g., word ID and interval, no text).
- **`speaking_stat_summaries`**: Aggregates pronunciation scores (`bestScorePercent`) by CEFR level.
- **`feedback_reports`**: Stores tester feedback/crash data independently from learning progress.
- **`device_sessions`**: Tracks app versions, OS, and sync timestamps per profile to monitor update adoption.

## 3. Example Schema Design (TypeScript/Pseudo-SQL)

```typescript
// anonymous_profiles
interface AnonymousProfile {
  id: string; // Primary Key (UUID)
  deviceIdHash?: string; // Hashed version of device identifier
  createdAt: Date;
  updatedAt: Date;
}

// progress_snapshots
interface ProgressSnapshot {
  id: string; // PK
  anonymousProfileId: string; // FK
  schemaVersion: number;
  xp: number;
  streak: number;
  completedLessonsCount: number;
  lastSyncAt: Date;
}

// lesson_progress
interface LessonProgressRecord {
  id: string; // PK
  anonymousProfileId: string; // FK
  lessonId: string;
  completedAt: Date;
}

// speaking_stat_summaries
interface SpeakingStatSummary {
  id: string; // PK
  anonymousProfileId: string; // FK
  cefrLevel: 'A0' | 'A1' | 'A2' | 'B1_PREVIEW' | 'OTHER';
  bestScorePercent: number;
  totalAttempts: number;
  updatedAt: Date;
}
```

## 4. Data Minimization
To protect user privacy and minimize database costs, the following fields are **explicitly forbidden** from being transmitted or stored:
- Raw audio binaries or base64 blobs
- Audio URIs referencing local device paths
- Transcript text (what the speech-to-text heard)
- `chatMessages` (full AI interactions)
- AI prompts/responses
- `mistakes.userAnswer` (user's free-text inputs)
- Email addresses or real names
- Payment data

## 5. API Endpoints (Draft)
- **`POST /sync/anonymous/progress`**
  - **Body:** Extracted, sanitized progress payload.
  - **Action:** Upserts progress logic.
- **`GET /sync/anonymous/progress/:anonymousProfileId`**
  - **Action:** Retrieves the latest snapshot for restore.
- **`POST /feedback/alpha`**
  - **Body:** Crash report or tester UI feedback.
  - **Action:** Inserts into `feedback_reports` table.
- **`POST /sync/anonymous/session`**
  - **Body:** `{ anonymousProfileId, appVersion, os }`
  - **Action:** Updates `device_sessions`.

## 6. Validation Rules
The backend MUST implement strict validation (e.g., using Zod) before touching the database:
- **Reject unknown fields:** Any payload containing extra keys (like `chatMessages`) must be rejected or stripped with a warning.
- **Require schemaVersion:** Ensures the backend knows how to parse the payload safely.
- **Payload size limit:** E.g., max 50KB to drop massive or accidental full-state uploads.
- **String length limits:** Limit `anonymousProfileId` to standard UUID length (36 chars).
- **Array length limits:** Limit `completedLessons` arrays to reasonable counts (e.g., max 1000).
- **Numeric range validation:** `xp` must be `>= 0`, `bestScorePercent` must be between `0-100`.
- **Rate limiting:** E.g., max 10 sync requests per minute per IP/profile.

## 7. Offline-First Behavior
- **Local storage primary:** `AsyncStorage` remains the absolute source of truth for the UI.
- **Never blocks lessons:** Sync operations execute completely in the background without loading spinners.
- **Queues/Retries:** Failed syncs are silently caught and retried upon next app launch or lesson completion.
- **Conflict strategy:**
  - Aggregates/Summaries (`xp`, `streak`): Latest `updatedAt` wins.
  - Arrays (`completedLessons`): The union of local and remote arrays.

## 8. Security/Privacy
- **HTTPS only:** All data transmitted over encrypted connections.
- **Secrets on backend only:** The React Native app must never bundle direct database connection strings.
- **Delete/Reset endpoint:** Future requirement for GDPR/testing to purge an `anonymousProfileId`.
- **Audit logs:** Server logs must not print the body of sync payloads.

## 9. Future Phases
- **Phase 1 (Current):** Docs and schema design only.
- **Phase 2:** Implement backend endpoints hidden behind an environment flag.
- **Phase 3:** Implement mobile background sync in a future Alpha update.
- **Phase 4:** Login/account linking (converting anonymous profiles to permanent users).
- **Phase 5:** Premium entitlement validation.

## 10. Open Questions
- Should we use Supabase/Postgres or stick to the existing backend stack?
- Where should the anonymous ID generation occur? (Client UUID vs Server-issued).
- What should the exact UX for the "Delete My Data" feature look like?
- How long should anonymous testing profiles be retained if inactive?
- Should tester feedback be collected directly in the app or via an external form first to save dev time?
