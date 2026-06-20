# WortWeg Feature Roadmap

This document is a planning sheet for product features and technical architecture. It should keep future work scoped and avoid mixing alpha stabilization, content expansion, and backend experiments.

## 1. Current Product State

- A0, A1, and A2 are fully playable.
- Current content totals: 33 lessons, 264 exercises, 264 vocabulary items.
- B1 has an optional limited preview with 5 lessons.
- Full B1 and B2 paths are coming soon and are not fully playable.
- AI chat works through the local backend.
- Speaking practice works through the local backend.
- Speaking practice currently uses press-and-hold recording, OpenAI STT through backend, transcript comparison, matched/missing/extra words, and safe error states.
- A private-alpha release candidate exists, but there are no testers yet.

## 2. Current Technical State

- Expo React Native app with TypeScript.
- Local Express backend in `server/`.
- Gemini AI teacher endpoint is available through the backend.
- OpenAI speech transcription endpoint is available through the backend.
- `.env` is local only, ignored/untracked, and must not be committed.
- Backend is currently local/LAN only, not publicly deployed.
- No auth or cloud sync yet.
- No production backend deployment yet.
- No Azure production integration yet.

## 3. Near-Term Product Plan

| Priority | Feature | Description | Why it matters | Risk | Suggested commit size |
| --- | --- | --- | --- | --- | --- |
| P0 | B1 Preview Pack 6-8 | Add three more isolated B1 preview lessons without unlocking full B1. | Gives advanced testers more useful content while preserving alpha guardrails. | Low/Medium | One preview lesson per commit. |
| P0 | B1 Preview final QA | Audit all B1 preview lessons for grammar, fairness, vocabulary, routing, and copy. | Prevents preview content from looking like full B1. | Low | One QA/fix commit. |
| P1 | AI lesson-aware practice suggestions | Let Wolli suggest short practice based on current lesson/level scope. | Makes AI feel connected to the course. | Medium | Prompt/context update plus focused tests. |
| P1 | Speaking practice library | Add a small browseable list of existing speaking prompts. | Lets testers repeat useful speaking without entering lessons. | Medium | One screen/route commit, no new STT logic. |
| P1 | Review dashboard polish | Make due vocabulary, mistakes, and next review action clearer. | Strengthens the learning loop after lessons. | Low/Medium | Small UI-only commit. |
| P1 | Alpha smoke checklist | Keep a short internal release checklist updated after each feature batch. | Reduces regression risk before testers. | Low | Docs-only commit. |
| P2 | Private tester guide later | Create a tester-friendly setup/reporting guide after backend access is stable. | Makes external feedback cleaner. | Low | Docs-only commit. |

## 4. Technical Roadmap - Speech / Sound

### Phase 0 - Current system

- OpenAI STT through local backend.
- Transcript comparison.
- Matched, missing, and extra words.
- No phoneme-level scoring.
- Already working.

### Phase 1 - Hybrid speech scoring v1

- Keep OpenAI STT as the reliable transcription path.
- Improve local scoring and feedback on top of transcript comparison.
- Add clearer feedback categories:
  - doğru kelimeler
  - eksik kelimeler
  - fazla kelimeler
  - kelime sırası
  - tekrar önerisi
- No Azure yet.
- Low risk.

### Phase 2 - Azure pronunciation prototype

- Add a backend-only experimental Azure Pronunciation Assessment prototype.
- Keep it behind a feature flag or DEV-only setting.
- Do not replace OpenAI STT yet.
- Test whether Azure gives useful pronunciation feedback for Turkish learners speaking German.
- Document cost and privacy considerations.
- Medium/high risk.

### Phase 3 - Hybrid speech router

- OpenAI STT remains transcription fallback.
- Azure can be used for pronunciation scoring when enabled.
- App receives normalized feedback from backend.
- Frontend should not know provider internals.
- Provider, model, and endpoint details must not be visible to users.

### Phase 4 - Production speech backend

- Deployed backend.
- Rate limits.
- Request size limits.
- Safer error handling.
- Logging without transcripts or `audioUri`.
- API key protection.
- Cost controls.
- Monitoring.

### Phase 5 - Advanced pronunciation coach

- Turkish-speaker-specific German pronunciation tips.
- Common sounds:
  - `ch`
  - `r`
  - `ü/ö/ä`
  - word stress
- Only after the hybrid prototype proves useful.

## 5. Technical Roadmap - Backend / Deployment

- Keep local backend for development.
- Plan backend deployment later; do not claim deployment until it exists.
- Keep all API keys in backend environment variables.
- Maintain `/health` for reachability checks.
- Account for CORS/LAN issues during phone testing.
- Mobile app should never contain API keys.
- Backend deployment should include environment setup, health checks, request limits, privacy-safe logging, and rollback steps.

## 6. Technical Roadmap - AI Teacher

- Current Wolli AI teacher runs through backend when reachable.
- B1 preview scope guardrails are active: A0/A1/A2 playable, limited B1 preview only, full B1/B2 coming soon.
- Safe fallback works when backend is unavailable.
- Provider, model, endpoint, fallback, and network details must not appear in chat bubbles.
- Near future: lesson-aware suggestions based on current lesson, level, and allowed scope.
- Later: per-lesson AI practice prompts.
- Later: AI feedback summarization for mistakes and vocabulary review.

## 7. Technical Roadmap - Data / Sync

- Current progress is local-first.
- Local event logs are capped and privacy-safe.
- No cloud sync yet.
- Future account/cloud sync can be planned after private alpha feedback.
- Alpha log export should remain privacy-safe.
- Do not log transcripts, `audioUri`, API keys, free user text, or personal text.

## 8. Medium-Term Product Plan

- Backend deployment for remote testers.
- Safer production AI/STT error states and monitoring.
- Wolli final mascot asset replacement.
- App Store / TestFlight-style preparation.
- Content analytics review based on private alpha feedback.
- Full B1 path planning after preview topics are validated.

## 9. Later / Not Now

- Full accounts/cloud sync.
- Full B2 path.
- Social leaderboard or ranking. Not now; it does not fit the current product direction.
- Advanced phonetic scoring beyond the hybrid prototype.
- Subscriptions/payments.
- Multi-language UI.

## 10. Recommended Build Order

1. B1 Preview Pack 6.
2. B1 Preview Pack 7.
3. B1 Preview Pack 8.
4. B1 Preview final QA.
5. AI lesson-aware practice suggestions.
6. Hybrid speech scoring v1, no Azure yet.
7. Speaking practice library.
8. Review dashboard polish.
9. Azure pronunciation prototype design doc.
10. Backend deployment planning.
11. Private tester guide.

## 11. Guardrails

- Do not unlock full B1 until there is a complete B1 path.
- Do not show B1/B2 as fully playable.
- Do not change A0/A1/A2 progression when adding preview content.
- Do not add official Goethe/telc/ÖSD claims.
- Do not add leaderboard/social ranking now.
- Do not expose API keys, transcripts, `audioUri`, provider/model/endpoint details to users.
- Keep Turkish-first explanations.
- Keep current OpenAI STT path working before experimenting with Azure.
- Azure pronunciation work must be backend-only first, feature-flagged, and not user-visible until validated.

## 12. Next Suggested Task

Next task: Add B1 Preview Pack 6 — Plan Anlatma ve Gelecek Niyetleri.
