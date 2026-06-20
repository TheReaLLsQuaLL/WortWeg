# WortWeg Feature Roadmap

This document is a planning sheet for product features and technical architecture. It should keep future work scoped and avoid mixing alpha stabilization, content expansion, and backend experiments.

## 1. Current Product State

- A0, A1, and A2 are fully playable.
- Current content totals: 36 lessons, 288 exercises, 288 vocabulary items.
- B1 has an optional limited preview with 8 lessons.
- Full B1 and B2 paths are coming soon and are not fully playable.
- Home has a compact review dashboard for Kelime tekrarı, Hatalar, Konuşma pratiği, AI ile pratik, and Sınav tarzı pratik.
- Dedicated Mistakes review route is available from Home and lesson completion.
- AI chat works through the local backend and has lesson-aware starter suggestions.
- Speaking practice works through the local backend.
- Speaking practice currently uses press-and-hold recording, OpenAI STT through backend, transcript-based Hybrid Speech Scoring v1, matched/missing/extra words, word-order hints when reliable, and safe error states.
- Speaking Practice Library has 36 static practice sentences from existing lesson prompts.
- Speaking Practice Stats store privacy-safe aggregates only: attempts, success counts, best/latest score, last practice date, practiced static sentence IDs, and level breakdown.
- A private-alpha release candidate exists, but there are no testers yet.

## 2. Current Technical State

- Expo React Native app with TypeScript.
- Local Express backend in `server/`.
- Gemini AI teacher endpoint is available through the backend.
- OpenAI speech transcription endpoint is available through the backend.
- Hybrid Speech Scoring v1 is frontend/local transcript scoring only; Azure is not implemented.
- `.env` is local only, ignored/untracked, and must not be committed.
- Backend is currently local/LAN only, not publicly deployed.
- No auth or cloud sync yet.
- No production backend deployment yet.
- No Azure production integration yet.

## 3. Completed Since B1 Preview Expansion

| Status | Feature | Notes |
| --- | --- | --- |
| Done | B1 Preview Pack 6-8 | B1 preview is now capped at 8 optional lessons. No Pack 9 for now. |
| Done | B1 Preview final QA/release audit | Preview guardrails remain: optional only, full B1/B2 still coming soon. |
| Done | AI lesson-aware practice suggestions | Wolli can use safe lesson context and B1 preview scope guardrails. |
| Done | Hybrid Speech Scoring v1, no Azure | Transcript-based categories are implemented without phoneme-level or provider scoring. |
| Done | Speaking Practice Library | 36 static sentences from existing lesson prompts. |
| Done | Speaking Practice Stats | Privacy-safe aggregate stats only; no transcript, `audioUri`, or provider details. |
| Done | Review dashboard polish | Home exposes review/practice routes in one compact panel. |
| Done | Dedicated Mistakes route | Hatalar can be opened directly from Home and lesson completion. |
| Done | Azure pronunciation prototype design doc | Planning doc exists. Azure remains future backend-only prototype work. |

## 4. Near-Term Product Plan

| Priority | Feature | Description | Why it matters | Risk | Suggested commit size |
| --- | --- | --- | --- | --- | --- |
| P0 | Final real-device smoke test | Run Android/iOS route checks across onboarding, lessons, review, speaking, AI, exam, and profile alpha tools. | Confirms recent review/speaking changes are tester-ready. | Low | QA-only or tiny fix commit. |
| P1 | Backend deployment planning | Choose deployment target and document env, health checks, CORS, rollback, and tester URL flow. | Remote testers need public HTTPS backend later. | Medium | Docs/planning commit first. |
| P1 | Production backend hardening | Add rate limits, request size limits, safer errors, logging policy, and cost monitoring before remote alpha. | Protects keys, cost, and tester reliability. | Medium/High | Backend-only staged commits. |
| P2 | Azure pronunciation backend prototype | Backend-only feature-flagged spike based on `docs/azure-pronunciation-prototype.md`. | Tests whether Azure adds useful pronunciation feedback. | Medium/High | Prototype branch/commit, not user-visible. |
| P2 | Optional AI practice improvements | Refine lesson-aware prompts after real tester feedback. | Avoids polishing the wrong AI behavior before evidence. | Medium | Small prompt/context commits. |
| P2 | Wolli final mascot asset replacement | Replace placeholders/static mascot with a final consistent asset set. | Improves brand consistency without changing flows. | Medium | Asset/UI-only commit. |
| P3 | Private tester guide when testers exist | Create a tester-specific guide once backend access and tester group are known. | Reduces setup/reporting confusion. | Low | Docs-only commit. |
| P3 | Full B1 path planning | Plan real B1 course structure after preview topics and A0-A2 alpha flow are validated. | Prevents partial B1 from looking like a full track. | Medium | Planning/content outline commit. |

## 5. Technical Roadmap - Speech / Sound

### Phase 0 - Current system

- OpenAI STT through local backend.
- Transcript comparison.
- Matched, missing, and extra words.
- No phoneme-level scoring.
- Working.

### Phase 1 - Hybrid Speech Scoring v1 - Completed

- OpenAI STT remains the reliable transcription path.
- Local scoring and feedback run on top of transcript comparison.
- Feedback categories include:
  - doğru kelimeler
  - eksik kelimeler
  - fazla kelimeler
  - kelime sırası when reliable
  - tekrar önerisi
- No Azure.
- No provider/model/endpoint details in normal UI.

### Phase 2 - Speaking Practice Library and Stats - Completed

- Speaking Practice Library provides 36 static practice sentences.
- Speaking Practice Stats persist privacy-safe aggregates only.
- No transcripts, `audioUri`, audio files, provider names, endpoints, or raw API responses are stored in stats.

### Phase 3 - Azure pronunciation prototype - Future

- Add a backend-only experimental Azure Pronunciation Assessment prototype.
- Keep it behind a feature flag or DEV-only setting.
- Do not replace OpenAI STT.
- Test whether Azure gives useful pronunciation feedback for Turkish learners speaking German.
- Document cost and privacy considerations.
- Medium/high risk.

### Phase 4 - Hybrid speech router - Future

- OpenAI STT remains transcription fallback.
- Azure can be used for pronunciation scoring only when enabled.
- App receives normalized feedback from backend.
- Frontend should not know provider internals.
- Provider, model, and endpoint details must not be visible to users.

### Phase 5 - Production speech backend - Future

- Deployed backend.
- Rate limits.
- Request size limits.
- Safer error handling.
- Logging without transcripts or `audioUri`.
- API key protection.
- Cost controls.
- Monitoring.

### Phase 6 - Advanced pronunciation coach - Later

- Turkish-speaker-specific German pronunciation tips.
- Common sounds:
  - `ch`
  - `r`
  - `ü/ö/ä`
  - word stress
- Only after the Azure/backend prototype proves useful.

## 6. Technical Roadmap - Backend / Deployment

- Keep local backend for development.
- Plan backend deployment later; do not claim deployment until it exists.
- Keep all API keys in backend environment variables.
- Maintain `/health` for reachability checks.
- Account for CORS/LAN issues during phone testing.
- Mobile app should never contain API keys.
- Backend deployment should include environment setup, health checks, request limits, privacy-safe logging, monitoring, and rollback steps.

## 7. Technical Roadmap - AI Teacher

- Current Wolli AI teacher runs through backend when reachable.
- B1 preview scope guardrails are active: A0/A1/A2 playable, limited B1 preview only, full B1/B2 coming soon.
- Lesson-aware practice suggestions are implemented.
- Safe fallback works when backend is unavailable.
- Provider, model, endpoint, fallback, and network details must not appear in chat bubbles.
- Later: refine per-lesson AI practice prompts after tester feedback.
- Later: AI feedback summarization for mistakes and vocabulary review.

## 8. Technical Roadmap - Data / Sync

- Current progress is local-first.
- Speaking stats are local aggregate stats only.
- Local event logs are capped and privacy-safe.
- No cloud sync yet.
- Future account/cloud sync can be planned after private alpha feedback.
- Alpha log export should remain privacy-safe.
- Do not log transcripts, `audioUri`, API keys, free user text, or personal text.

## 9. Medium-Term Product Plan

- Backend deployment for remote testers.
- Safer production AI/STT error states and monitoring.
- Wolli final mascot asset replacement.
- App Store / TestFlight-style preparation.
- Content analytics review based on private alpha feedback.
- Full B1 path planning after preview topics are validated.

## 10. Later / Not Now

- B1 Preview Pack 9. Stop expanding preview until QA/test feedback.
- Full B1 path until a complete path is planned.
- Full B2 path.
- Full accounts/cloud sync.
- Social leaderboard or ranking. Not now; it does not fit the current product direction.
- Advanced phonetic scoring beyond a validated backend prototype.
- Subscriptions/payments.
- Multi-language UI.

## 11. Recommended Build Order

1. Final real-device smoke test.
2. Backend deployment planning.
3. Production backend hardening.
4. Azure pronunciation backend prototype behind feature flag.
5. Optional AI practice improvements.
6. Wolli final mascot asset replacement.
7. Private tester guide when testers exist.
8. Full B1 path planning.

## 12. Guardrails

- Do not unlock full B1 until there is a complete B1 path.
- Do not show B1/B2 as fully playable.
- Do not add B1 Preview Pack 9 before QA/test feedback.
- Do not change A0/A1/A2 progression when adjusting preview content.
- Do not add official Goethe/telc/ÖSD claims.
- Do not add leaderboard/social ranking now.
- Do not expose API keys, transcripts, `audioUri`, provider/model/endpoint details to users.
- Keep Turkish-first explanations.
- Keep current OpenAI STT path working before experimenting with Azure.
- Azure pronunciation work must be backend-only first, feature-flagged, and not user-visible until validated.
- Do not claim backend deployment until a public HTTPS backend is actually deployed.

## 13. Next Suggested Task

Next task: Final real-device smoke test.
