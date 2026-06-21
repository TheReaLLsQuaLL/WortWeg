# WortWeg Project Status Snapshot

This is the current single-source-of-truth snapshot for WortWeg planning.

## 1. Current Build State

- A0/A1/A2 are fully playable.
- Optional limited B1 preview has 8 lessons.
- Full B1/B2 paths are coming soon.
- Current content totals:
  - 36 lessons
  - 288 exercises
  - 288 vocabulary items
- WortWeg is a Turkish-first German learning app.
- Local backend supports AI chat and speech transcription for development.
- First hosted backend smoke passed on Render at `https://wortweg.onrender.com`.
- Hosted `/health` and `server:smoke` passed.
- Phone hosted AI/speech smoke passed against Render:
  - AI chat via hosted backend passed.
  - Speaking correct sentence via hosted backend passed.
  - Silence/no-voice behavior passed.
  - Wrong speech low score/missing words passed.
  - Backend error copy was skipped/not tested.
- Installed Android EAS preview APK smoke passed after fixing the native Expo module mismatch:
  - App installs and opens.
  - User can enter the app.
  - Onboarding/Home loads.
  - Hosted AI chat and hosted speaking work in the installed build.
  - Silence/no-voice and wrong-speech low-score behavior still pass.
  - Temporary icon/splash assets are acceptable for internal preview smoke, not final store assets.
- This is not a public launch.

## 2. Completed Product Features

- Onboarding flow.
- Placement guardrails, including private-alpha B1 cap behavior.
- A0/A1/A2 learning paths.
- Optional limited B1 preview.
- AI teacher with lesson-aware suggestions.
- Speaking practice.
- Transcript-based Hybrid Speech Scoring v1. Current scoring checks transcript words, not accent quality, phoneme-level pronunciation, natural speed, fluency, or prosody; slow but word-correct speech can score 100.
- Speaking Practice Library.
- Speaking Practice Stats.
- Home review dashboard.
- Dedicated Mistakes review.
- Kelime repeat queue fix.
- Exam-style practice.
- Wolli guide concept.

## 3. Completed Backend/Dev Hardening

- Backend env validation.
- Environment-driven CORS.
- Provider request timeouts.
- Production diagnostics sanitization.
- Dependency-free rate limiting.
- `server:check`.
- `server:smoke`.
- `quality` script.
- Backend deployment plan.
- Backend hosting evaluation.
- Predeployment checklist.
- Developer precommit checklist.
- First Render hosted backend smoke.
- Private alpha distribution plan.
- EAS preview build plan and minimal preview config.
- App identifiers configured for EAS preview build.
- Temporary private-alpha app assets configured.
- EAS project linked under `@therealsquall/wortweg`.
- Android preview APK build and installed-build smoke passed after Expo asset/module alignment.
- Private alpha Android tester distribution process and tester message draft documented.

## 4. Current Blockers

- Hosted backend smoke passed on Render.
- Android private preview install path is proven for internal smoke testing.
- Tester distribution/support process is documented, but the approved APK link, feedback channel, support owner, and actual tester send are not finalized.
- Production start still depends on `tsx` from dev dependencies.
- Backend error-copy phone check was skipped/not tested.
- No external/private testers yet.
- Final Wolli mascot/brand asset set is not ready; temporary private-alpha icon/splash assets are present.
- iOS/TestFlight path is not done.
- Azure pronunciation assessment is not implemented.

## 5. Guardrails

- Do not claim full B1/B2 are playable.
- Do not add Pack 9 or expand B1 preview further for now.
- Do not add official Goethe/telc/ÖSD claims.
- Do not add leaderboard/social ranking now.
- Do not implement Azure until the backend prototype phase.
- Do not put API keys in the mobile app.
- Do not expose transcripts, `audioUri`, provider/model/endpoint details, or raw backend diagnostics in normal UI.
- Keep Turkish-first explanations and user-facing copy.
- Keep `.env` local and untracked.

## 6. Next Recommended Order

1. Fill approved APK link and feedback channel in the tester message.
2. Send only to the selected private Android tester group.
3. Replace the `tsx` runtime production start with compiled JS or another production-safe start.
4. Optionally run backend error-copy installed-build test.
5. Replace temporary icon/splash/Wolli brand assets when final assets are ready.
6. Plan iOS/TestFlight path later.
7. Continue production backend hardening and monitoring.
8. Optional Azure backend prototype behind feature flag for nuanced pronunciation assessment.
9. Full B1 path planning.

## 7. Useful Commands

```sh
npm run quality
npm run server:dev
npm run server:check
npm run server:smoke
npm run quality:backend
PATH=/Users/squall/.nvm/versions/node/v22.22.3/bin:$PATH npx expo start --clear --port 8083
git status --short
```

## 8. Last Known QA Expectations

- `npm run quality` should pass.
- Content totals should remain:
  - 36 lessons
  - 288 exercises
  - 288 vocabulary items
- Hosted backend smoke passed on Render at `https://wortweg.onrender.com`.
- Phone hosted AI/speech smoke passed against Render.
- Installed Android EAS preview APK smoke passed after fixing Expo asset/module alignment.
- Public launch is not ready.
- Current speaking score is transcript-based; nuanced pronunciation scoring is future Azure prototype work, not implemented.
