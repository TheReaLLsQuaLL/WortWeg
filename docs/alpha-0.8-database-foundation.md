# Alpha 0.8 Database Foundation

## 1. Recommendation Summary
For Alpha 0.8, the primary objective is to enable data persistence across device installs/updates without introducing full user authentication or compromising offline playability. 
**Recommended Database Provider**: Supabase PostgreSQL.
**Why**: It integrates seamlessly with a Node/TypeScript backend, provides excellent free-tier scalability, out-of-the-box RLS (Row Level Security), and is easy to migrate from local development to production. While Neon is also great, Supabase's ecosystem fits perfectly for future authentication expansion.
**Timing**: We strongly recommend waiting until *after* the Alpha 0.7 APK is successfully built, deployed, and tested locally by testers. Alpha 0.7 is currently stable; introducing a database could break the app's core loop if sync fails.

## 2. What to Store in Alpha 0.8
- **Anonymous Tester Profiles**: Unique UUID generated on the device and used as a pseudonym.
- **Learner Progress (Aggregate)**: Total XP, current streak, completed lessons/exercises.
- **Granular Progress**: Individual completed exercise IDs, timestamps, and scores.
- **Weak Words**: Vocabulary items the user struggles with.
- **App Metadata**: Device type, OS version, app version (useful for debugging alpha bugs).

## 3. What Not to Store (Privacy & Security)
- **PII (Personally Identifiable Information)**: No names, emails, phone numbers, or passwords yet.
- **Raw Audio Files**: Audio files (.wav/.m4a) must remain ephemeral and be immediately deleted after Azure/OpenAI processing. Storing raw audio incurs significant cost, liability, and privacy risks.
- **Exact Device Identifiers**: Avoid storing IMEI or permanent hardware MAC addresses. Use a generated random UUID.

## 4. Minimal Database Schema
```sql
-- Users (Anonymous for now)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- matches the device-generated anonymous ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_xp INTEGER DEFAULT 0,
  app_version VARCHAR(20)
);

-- Progress
CREATE TABLE lesson_progress (
  user_id UUID REFERENCES users(id),
  lesson_id VARCHAR(50),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  PRIMARY KEY (user_id, lesson_id)
);

-- Vocab/Weak Words
CREATE TABLE user_vocabulary (
  user_id UUID REFERENCES users(id),
  word VARCHAR(100),
  correct_attempts INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, word)
);

-- Event Logs (Optional but useful for Alpha debugging)
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Anonymous Tester ID Strategy
When the app launches for the first time, generate a standard UUIDv4 (e.g., using `expo-crypto` or `uuid`) and save it to `AsyncStorage` alongside `userState`. All API requests to the backend will include this ID in a custom header (e.g., `X-Tester-ID`).

## 6. Future Account/Login Strategy
When we implement accounts (e.g., Email or Apple/Google Sign-In) in a later Alpha/Beta, the backend will link the authenticated user to the existing Anonymous UUID. The database schema won't need major changes; we will just add an `auth_id` column to the `users` table mapping to Supabase Auth.

## 7. Offline-First Sync Strategy
The app must remain offline-first. 
- **Local Source of Truth**: `AsyncStorage` (or a local SQLite DB if AsyncStorage gets too slow, but stick to AsyncStorage for now) remains the immediate source of truth.
- **Queueing**: If the device is offline, backend sync actions (e.g., `POST /sync/progress`) are queued locally.
- **Reconciliation**: On app startup or network reconnection, push the local state to the backend. The backend resolves conflicts (e.g., keeping the highest XP or latest timestamps).

## 8. Backend Route Proposal
- `POST /sync/init`: Registers a new anonymous UUID.
- `POST /sync/state`: Uploads the current local `userState` payload. The backend parses this and upserts into the `users`, `lesson_progress`, and `user_vocabulary` tables.
- `GET /sync/state`: Fetches the server state. If the server has more recent progress (e.g., user installed the app on a second device using the same tester UUID), the frontend merges it.

## 9. Frontend Change Proposal
- **Storage Layer**: Hook into the existing `src/lib/storage.ts` functions. After a successful `AsyncStorage.setItem(STORAGE_KEYS.userState, ...)`, trigger a non-blocking background fetch to `POST /sync/state`.
- **Startup**: On app load, generate the Anonymous UUID if it doesn't exist. Attempt to pull from `GET /sync/state` to refresh data.

## 10. Migration Strategy from Local-Only Progress
When a user updates from Alpha 0.7 to 0.8:
1. The app detects existing `userState` but no Anonymous UUID.
2. It generates a new UUID.
3. It immediately posts the entire rich local `userState` to `POST /sync/state`.
4. The backend initializes the user's DB rows with the pre-existing XP and progress. Zero data is lost.

## 11. Privacy/Security Rules
- **No Audio**: Strict enforcement of deleting `.m4a`/`.wav` after transcription.
- **No PII**: Reject any requests attempting to write emails/names to the DB.
- **Rate Limiting**: Apply aggressive rate limiting to `/sync` endpoints to prevent abuse.

## 12. Risks
- **Sync Conflicts**: If a tester uses two devices, they might overwrite progress. Using "last write wins" based on timestamps is acceptable for Alpha 0.8, but granular event sourcing is better long-term.
- **Performance**: Pushing the entire state on every update could be heavy. We should debounce sync calls (e.g., only sync when navigating away from a lesson, not after every single question).

## 13. Things to Avoid for Now
- Full OAuth / Email Login.
- Real-time multiplayer synchronization (WebSockets).
- Replacing `AsyncStorage` entirely with local SQLite (too much refactoring for 0.8).
- Complex Conflict-Free Replicated Data Types (CRDTs).

## 14. Step-by-Step Implementation Phases
1. **Phase 1**: Provision Supabase DB and safely store connection strings in Render environment variables.
2. **Phase 2**: Implement simple Express backend routes (`/sync/state`) with Zod validation matching the existing frontend state.
3. **Phase 3**: Update frontend `storage.ts` to generate UUIDs and debounce POST requests to the backend.
4. **Phase 4**: Add a manual "Force Sync" button in a debug menu for testers.

## 15. Final Recommendation
**Do not implement the database yet.** Proceed with building and distributing the Alpha 0.7 APK first. We need to validate the Azure Speech integration, frontend layout, and general stability on real Android devices. Once Alpha 0.7 is confirmed stable by testers, branch off to `alpha-0.8` and begin Phase 1 of this database integration.
