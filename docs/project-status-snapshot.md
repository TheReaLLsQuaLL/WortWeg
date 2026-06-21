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
- Phone hosted AI/speech result is not documented yet in this snapshot.
- This is not a public launch.

## 2. Completed Product Features

- Onboarding flow.
- Placement guardrails, including private-alpha B1 cap behavior.
- A0/A1/A2 learning paths.
- Optional limited B1 preview.
- AI teacher with lesson-aware suggestions.
- Speaking practice.
- Transcript-based Hybrid Speech Scoring v1.
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

## 4. Current Blockers

- Hosted backend smoke passed on Render.
- Phone hosted AI/speech result still needs to be documented before tester distribution.
- Private alpha packaging/install path and tester distribution plan are not finalized.
- No external/private testers yet.
- Final Wolli mascot asset is not ready.
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

1. Document hosted phone AI/speech result.
2. Fix any hosted phone smoke bugs.
3. Finalize packaging/install path and tester distribution plan.
4. Continue production backend hardening if needed, including replacing the `tsx` runtime production start with compiled JS or another production-safe start.
5. Optional Azure backend prototype behind feature flag.
6. Wolli final mascot asset replacement.
7. Private tester guide.
8. Full B1 path planning.

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
- Phone hosted AI/speech result is still pending in docs.
- Public launch is not ready.
