# WortWeg Backend Deployment Plan

This document is a planning artifact only. It does not deploy the backend, create hosting accounts, add packages, change app code, change backend code, or change environment files.

Important status: the first hosted backend smoke passed on Render after the phone speaking smoke gate was cleared. Phone hosted AI/speech and installed Android preview smoke passed. This is still not a public launch, and tester distribution should wait until the approved APK link, feedback channel, and support process are finalized.

## 1. Deployment Goal

- Move the current local AI/STT backend to a secure hosted backend for private alpha testing.
- Keep the mobile app free of API keys and server-side secrets.
- Support remote private alpha testers with a public HTTPS backend URL.
- Preserve the current OpenAI STT path and transcript-based Hybrid Speech Scoring v1.
- Keep the existing AI teacher endpoint behavior stable.
- Do not introduce Azure yet.
- Do not imply production readiness or public launch.

## 2. Current Local Architecture

- Expo React Native app runs locally through Expo Go or a development build.
- Local Express backend runs from `server/`.
- Development command: `npm run server:dev`.
- Production build command: `npm run server:build`.
- Production start command: `npm run server:start`, which runs compiled JavaScript from `dist-server/`.
- Backend listens on `http://0.0.0.0:3001`.
- Backend exposes `/health` for reachability checks.
- Backend supports the AI teacher route used by Wolli chat and feedback flows.
- Backend supports the speech transcription route used by speaking practice.
- OpenAI STT is called only through the backend.
- OpenAI API key lives only in backend `.env`.
- Expo app uses `EXPO_PUBLIC_AI_BACKEND_URL` for phone testing.
- During local phone testing, the phone reaches the backend through the Mac LAN IP, for example `http://YOUR_MAC_LAN_IP:3001`.
- `.env` is ignored/untracked and must not be committed.

Current hosted smoke status:

- Provider: Render Web Service.
- Hosted URL: `https://wortweg.onrender.com`.
- Branch: `feature/b1-preview-foundation`.
- Build command for first smoke: `npm install --include=dev`.
- Updated build command after production-start cleanup: `npm install && npm run server:build`.
- Start command: `npm run server:start`.
- `server:start` now runs compiled JavaScript and no longer depends on `tsx` at runtime.
- `/health` returned `{"ok":true,"service":"wortweg-ai"}`.
- `BACKEND_SMOKE_URL=https://wortweg.onrender.com npm run server:smoke` passed health, CORS, AI route, and speech validation; rate-limit stress skipped by design.
- Phone hosted AI/speech passed.
- This hosted backend is for private smoke testing only, not public launch.

## 3. Deployment Readiness Gate

The first Render hosted smoke has passed. Before sharing the backend with testers, these must still be true:

- Hosted phone AI/speech test result is documented as passed.
- `.env` is not tracked.
- No hardcoded LAN IP exists in app code or docs except placeholders/examples such as `YOUR_MAC_LAN_IP`.
- `npm run typecheck` passes.
- `npm run content:qa` passes.
- `git diff --check` passes.
- `npm run server:check` passes.
- `npm run server:smoke` passes against the local backend.
- Backend `/health` passes locally.
- AI chat works on phone against the hosted Render backend.
- Speech transcription works on phone against the hosted Render backend.
- Private alpha Android install path is confirmed for internal preview smoke; tester APK link/feedback channel still need to be filled before sending.
- Current content scope remains clear:
  - A0/A1/A2 fully playable.
  - Optional limited B1 preview with 8 lessons.
  - Full B1/B2 coming soon.
  - 36 lessons, 288 exercises, 288 vocabulary items.

## 4. Hosting Requirements

The backend host must support:

- Node 22 compatible runtime, or another compatible production Node runtime verified with the project.
- Environment variables configured in the hosting dashboard.
- Public HTTPS URL.
- File/audio upload payloads or `multipart/form-data` if required by the current speech endpoint.
- Request timeout long enough for speech transcription.
- Logs that can be operated with secret redaction discipline.
- CORS configuration suitable for app usage.
- Simple health checks.
- Reasonable restart/rollback controls.
- Region near Turkey/EU if possible.

## 5. Environment Variables

Use placeholders only in committed docs and examples:

```env
OPENAI_API_KEY=your_server_side_openai_key
PORT=3001
ALLOWED_ORIGINS=https://YOUR_ALLOWED_ORIGIN
NODE_ENV=production
```

Optional future speech flags:

```env
SPEECH_SCORING_PROVIDER=transcript
SPEECH_AZURE_ENABLED=false
```

Rules:

- Never commit real keys.
- Never commit `.env`.
- The app must never contain `OPENAI_API_KEY`.
- Mobile app should contain only the public backend URL.
- Production environment variables must be configured in the hosting dashboard.
- If a key is suspected to be leaked, rotate it before testing continues.

## 6. Security / Privacy Requirements

- Do not log raw audio.
- Do not log `audioUri`.
- Do not log transcripts unless there is an explicit privacy review and product decision later.
- Do not log full API response bodies.
- Do not show provider, model, endpoint, network, or internal backend details to normal users.
- Do not put secrets in the client bundle.
- Redact errors before returning them to the app.
- Keep rate limiting enabled and tune limits before broader testing.
- CORS should be restrictive and environment-driven, not wildcard forever.
- Keep local event logs capped and privacy-safe.
- Keep speech/debug diagnostics DEV-only and collapsed by default.
- Do not expose API keys, transcripts, `audioUri`, provider/model/endpoint details in exported alpha logs.

## 7. Production Hardening Tasks

Before deploying for remote testers, prepare the backend with small backend-only commits:

- Keep the compiled JS production start path working so Render does not require `tsx` at runtime.
- Add request size limits appropriate for audio uploads.
- Add timeout handling for AI and speech routes.
- Add structured safe errors for app-facing responses.
- Verify and tune rate limiting.
- Add CORS config from environment variables.
- Add health/readiness endpoint if `/health` is not enough for the selected host.
- Add safe logging with no secrets, transcripts, `audioUri`, or raw API bodies.
- Add deployment README or runbook.
- Verify temp audio cleanup if the backend writes files during speech processing.
- Verify backend process exits or restarts cleanly on fatal configuration errors.
- Verify missing/invalid env vars produce safe errors.

## 8. Deployment Options To Evaluate

Render was selected for the first low-friction hosted smoke. Longer-term hosting choice should still be evaluated cautiously before broader testing.

| Option | Evaluation criteria |
| --- | --- |
| Render | First hosted smoke passed at `https://wortweg.onrender.com`. Phone AI/speech passed. Production start now uses compiled JS; redeploy with the updated build command and rerun hosted smoke before testers. |
| Fly.io | Node/container support, region choice near Turkey/EU, HTTPS, secrets handling, request limits, operational complexity, rollback controls. |
| Railway | Ease of setup, env var handling, Node support, HTTPS, logs/secrets handling, timeout behavior, cost predictability. |
| Google Cloud Run | Container/runtime fit, HTTPS, secrets/env handling, request size and timeout limits, logs, region options, operational overhead. |
| AWS App Runner | Node/container support, HTTPS, env vars/secrets, request limits, logs, region options, operational overhead. |
| VPS | Full control, HTTPS setup burden, secret management burden, monitoring/logging burden, maintenance cost, region choice. |

Do not include price assumptions until they are verified separately.

## 9. App Configuration Plan

- Local development keeps:

```env
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
```

- Private alpha or production-like testing points to the hosted HTTPS backend:

```env
EXPO_PUBLIC_AI_BACKEND_URL=https://YOUR_BACKEND_HOST
```

- Avoid hardcoded local IPs in committed docs or code.
- Keep local `.env` ignored/untracked.
- Restart Expo with clear cache after changing `EXPO_PUBLIC_AI_BACKEND_URL`.
- Document a simple environment switching checklist:
  1. Confirm target backend `/health`.
  2. Run `BACKEND_SMOKE_URL=https://YOUR_BACKEND_HOST npm run server:smoke` once a hosted backend exists.
  3. Update local `.env` or build environment.
  4. Restart Expo/build with clear cache.
  5. Test AI chat.
  6. Test speech transcription.
  7. Confirm no provider/internal details appear in normal UI.

## 10. Deployment Phases

### Phase 0 - Phone smoke test gate

- Phone speaking smoke gate passed per latest product status.
- Confirm hosted AI chat and hosted speech transcription on phone, then document the result.
- Confirm no blocking UI, privacy, or route issues.

### Phase 1 - Choose host

- Compare the hosting candidates against the requirements above.
- Render was picked for the first hosted smoke.
- Document Render constraints before broader tester use.

### Phase 2 - Backend production hardening

- Production start now runs compiled JS from `dist-server/`; keep this path verified in hosted smoke.
- Verify rate limiting, request limits, safe errors, safe logs, and CORS config.
- Keep OpenAI STT path working.

### Phase 3 - Deploy backend with env vars

- Render env vars were configured in the host dashboard for first smoke.
- Do not put API keys in the mobile app.
- Keep hosted deployment private and smoke-test-only.

### Phase 4 - Test backend endpoints

- `GET /health` passed on `https://wortweg.onrender.com`.
- Hosted `server:smoke` passed AI route shape and speech validation checks.
- Phone hosted AI/speech passed before this production-start cleanup.
- After changing Render build/start commands, rerun hosted `/health` and `server:smoke` before sending testers.
- Confirm app-facing errors are safe and provider-neutral.

### Phase 5 - Configure Expo/private build

- Point local/private `EXPO_PUBLIC_AI_BACKEND_URL` to `https://wortweg.onrender.com` only in ignored local env or build env.
- Restart Expo or rebuild as needed.
- Run and document hosted phone AI/speech smoke.

### Phase 6 - Private alpha monitoring

- Monitor health, errors, timeout rate, fallback rate, speech failures, and API cost.
- Keep logs privacy-safe.
- Collect tester reports through profile alpha tools.

### Phase 7 - Azure prototype later

- Azure remains future-only.
- Any Azure pronunciation work must be backend-only, feature-flagged, and not user-visible until validated.
- Do not replace OpenAI STT before the prototype proves useful.

## 11. Rollback Plan

- Keep the local backend path working for development.
- Revert app/backend URL to local development when needed:

```env
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
```

- Disable hosted backend if behavior is unsafe.
- Rotate keys immediately if a key is leaked or suspected to be leaked.
- Never expose OpenAI or future Azure keys to the mobile app.
- Keep the app capable of showing safe offline/fallback states when backend is unavailable.

## 12. Non-Goals

- No Azure deployment now.
- No Azure implementation now.
- No auth/user accounts now.
- No full B1/B2 unlock.
- No official exam claims.
- No public launch.
- No leaderboard/social ranking.
- No cloud sync as part of first backend deployment.
- No provider/model/endpoint details in normal user-facing UI.

## 13. Next Prompt

Redeploy Render with compiled backend build/start and rerun hosted smoke.
