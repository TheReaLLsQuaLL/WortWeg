# WortWeg Local Release Readiness Audit

Date: 2026-06-21

## Audit Scope

This audit verifies repository readiness from local code, docs, scripts, backend smoke checks, and the hosted Render phone smoke result. Phone hosted AI/speech passed; this is still not a public launch.

Reference docs reviewed:

- `docs/project-status-snapshot.md`
- `docs/developer-precommit-checklist.md`
- `docs/backend-deployment-plan.md`
- `docs/backend-hardening-audit.md`
- `docs/backend-predeployment-checklist.md`
- `docs/backend-hosting-evaluation.md`
- `docs/feature-roadmap.md`
- `README.md`

No app code, backend behavior, lesson content, B1 preview content/count, environment values, deployment state, or Azure implementation was changed.

## Commands Run

| Check | Result | Notes |
| --- | --- | --- |
| `git status --short` | PASS | Clean at audit start. After this audit, only this report is new. |
| `git ls-files .env` | PASS | No tracked `.env`. |
| Stitch/reference artifact scan | PASS | Only `docs/design-reference/stitch-comic/stitch_wortweg_design_system.zip` found. No root duplicate zip. |
| Generated artifact scan | PASS | No unexpected screenshots/contact sheets/zips found outside the intended design reference zip. |
| `npm run quality` | PASS | Includes typecheck, content QA, server config check, and whitespace check. |
| `npm run server:check` | PASS | Printed config booleans/counts only; no secret values. |
| `npm run server:dev` | PASS | Local backend started on `http://0.0.0.0:3001`. |
| `npm run server:smoke` | PASS | Health, CORS sanity, AI route, and speech validation passed. Rate limit check skipped by default as documented. |
| `npm run quality:backend` | PASS | Alias ran `server:smoke` successfully. |
| Port cleanup check | PASS | No backend process left running on port `3001`. |
| `git diff --check` | PASS | No whitespace errors. |

Content QA totals:

- 36 lessons
- 288 exercises
- 288 vocabulary items

## Pass/Fail Summary

| Area | Status | Notes |
| --- | --- | --- |
| Git hygiene | PASS | `.env` is untracked; no duplicate root Stitch zip; no unexpected generated artifacts. |
| Quality scripts | PASS | `npm run quality` passed with expected content totals. |
| Backend config | PASS | `server:check` passed and did not print secrets. |
| Backend smoke | PASS | Local smoke checks passed; optional forced rate-limit mode remains documented, not required by default. |
| Documentation consistency | PASS | Docs describe A0/A1/A2 playable, optional 8-lesson B1 preview, full B1/B2 coming soon, first Render hosted smoke passed, and Azure not implemented. |
| Privacy/safety scan | PASS | No raw transcript/audioUri console logging found; `dotenv` usage is backend/script-only; app uses `EXPO_PUBLIC_*` env reads only. |
| Feature consistency | PASS | Home review routes, dedicated Mistakes route, Speaking Library, Speaking Stats, vocab repeat queue, and B1 preview guardrails are present in code. |
| Hosted backend smoke | PASS | Render hosted `/health` and `server:smoke` passed at `https://wortweg.onrender.com`. |
| Hosted phone AI/speech | PASS | AI chat, correct-sentence speaking, silence/no-voice, and wrong-speech low-score behavior passed against Render. Backend error-copy check was skipped/not tested. |
| Deployment readiness | PARTIAL | Hosted backend and phone AI/speech passed, but tester packaging/distribution, support process, and production start without `tsx` remain open. |

## Issues Found

No blocking local repository issues were found.

Notes:

- `docs/feature-roadmap.md` intentionally mentions Pack 9 only as a "do not add now" guardrail.
- Provider/model/endpoint fields still exist in DEV diagnostics and internal service types. Production backend responses strip provider/model diagnostics, and normal chat copy is sanitized.
- The speaking result screen shows the learner's transcript as immediate feedback. The audit found no raw transcript persistence or transcript console logging.
- Current speaking scoring is transcript-based. It detects silence/no voice, real speech, expected words, and wrong/missing/extra words. It does not score accent quality, phoneme-level pronunciation, natural speed, fluency, or prosody; slow but word-correct speech can score 100.
- Some DEV/profile alpha diagnostics use operational labels such as `Speech endpoint`; these are DEV-gated and are not deployment blockers.

## Fixes Made

None. This was an audit-only task.

The only file added by this task is:

- `docs/local-release-readiness-audit.md`

## Feature Consistency Findings

- Home review dashboard routes are present:
  - Kelime tekrarı -> Vocab
  - Hatalar -> dedicated Mistakes screen
  - Konuşma pratiği -> Speaking Library
  - AI ile pratik -> Chat
  - Sınav tarzı pratik -> Exam
- Dedicated Mistakes route exists in `AppNavigator`.
- Speaking Library contains 36 derived sentences:
  - A0: 4
  - A1: 12
  - A2: 12
  - B1 Ön İzleme: 8
- Speaking Stats store aggregate fields only:
  - attempt counts
  - success counts
  - best/latest score
  - last practice date
  - practiced static sentence IDs
  - level breakdown
- Kelime repeat queue remains bounded:
  - a card tapped with `Tekrar` can be moved to the end once per session
  - the same card is not repeatedly inserted into an infinite queue
  - the session can still complete
- B1 preview remains 8 optional lessons.
- Full B1/B2 modules remain guarded through main-path lookup and coming-soon UI.

## Privacy/Safety Findings

- No tracked `.env`.
- No real key-looking strings found in the scanned docs/source paths.
- No `dotenv` import in app/client source; `dotenv` appears only in backend config and a local env check script.
- No console logging of raw transcript or `audioUri` found.
- Speech events store safe metadata such as provider bucket, fallback flag, file type, duration, and similarity bucket; they do not store transcript text or audio paths.
- Backend production responses omit provider/model diagnostics from AI and speech responses.
- Chat display sanitizes internal backend/fallback/provider/model/endpoint copy from normal bubbles.
- Speaking DEV technical panel remains DEV-gated and manually expandable.

## Documentation Consistency Findings

- Current totals are documented as 36 lessons, 288 exercises, and 288 vocabulary items.
- A0/A1/A2 are described as fully playable.
- B1 preview is described as optional and limited to 8 lessons.
- Full B1/B2 are described as coming soon, not fully playable.
- Backend docs now record the first Render hosted smoke at `https://wortweg.onrender.com`; this is not public launch readiness.
- Azure is described as not implemented and future/prototype-only.
- No hardcoded old LAN IP is presented as a permanent backend value.
- Official Goethe/telc/ÖSD mentions appear only as guardrail/non-affiliation style documentation, not as app claims.

## Remaining Blockers

- Private build/install distribution path is not finalized; initial distribution and EAS preview plans now exist in `docs/private-alpha-distribution-plan.md` and `docs/eas-preview-build-plan.md`.
- Tester distribution/support process is not finalized.
- Hosted runtime has been smoke-tested on Render, but production start still depends on `tsx` from dev dependencies.
- Backend error-copy phone check was skipped/not tested.
- No external/private testers yet.
- Final Wolli mascot asset is not ready.
- Azure pronunciation assessment is not implemented.

## Next Recommended Action

Use `docs/eas-preview-build-plan.md` to finalize app identifiers/assets, then prepare the first private install path and tester support before inviting testers. Keep hosted backend smoke checks in the release checklist.

Next backend hardening step:

```text
Replace tsx runtime production start with compiled JS or production-safe backend start.
```

## Release Decision

Local repository readiness: PASS.

Ready to commit local readiness/docs work: YES.

Ready to deploy to testers: NO. Hosted backend and phone AI/speech passed, but tester distribution/support, private install path, `tsx` production-start hardening, and optional backend error-copy test remain.
