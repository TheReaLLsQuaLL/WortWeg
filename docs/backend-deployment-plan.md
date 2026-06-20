# WortWeg Backend Deployment Plan

This document is a planning artifact only. It does not deploy the backend, create hosting accounts, add packages, change app code, change backend code, or change environment files.

Important gate: backend deployment should not start until the final real-device phone smoke test passes. The current smoke setup has been prepared, but the full on-phone checklist is not complete yet.

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
- Backend listens on `http://0.0.0.0:3001`.
- Backend exposes `/health` for reachability checks.
- Backend supports the AI teacher route used by Wolli chat and feedback flows.
- Backend supports the speech transcription route used by speaking practice.
- OpenAI STT is called only through the backend.
- OpenAI API key lives only in backend `.env`.
- Expo app uses `EXPO_PUBLIC_AI_BACKEND_URL` for phone testing.
- During local phone testing, the phone reaches the backend through the Mac LAN IP, for example `http://YOUR_MAC_LAN_IP:3001`.
- `.env` is ignored/untracked and must not be committed.

## 3. Deployment Readiness Gate

Do not start deployment until all of these are true:

- Final real-device smoke test passed on phone.
- `.env` is not tracked.
- No hardcoded LAN IP exists in app code or docs except placeholders/examples such as `YOUR_MAC_LAN_IP`.
- `npm run typecheck` passes.
- `npm run content:qa` passes.
- `git diff --check` passes.
- Backend `/health` passes locally.
- AI chat works on phone against the local backend.
- Speech transcription works on phone against the local backend.
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

- Add a production start script if missing.
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

No host is selected yet. Evaluate candidates neutrally.

| Option | Evaluation criteria |
| --- | --- |
| Render | Ease of environment variables, HTTPS setup, Node support, request timeout limits, audio payload limits, log handling, cost predictability, EU-adjacent region options if available. |
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
  2. Update local `.env` or build environment.
  3. Restart Expo/build with clear cache.
  4. Test AI chat.
  5. Test speech transcription.
  6. Confirm no provider/internal details appear in normal UI.

## 10. Deployment Phases

### Phase 0 - Phone smoke test gate

- Complete final real-device smoke test.
- Confirm AI chat and speech transcription work on phone against local backend.
- Confirm no blocking UI, privacy, or route issues.

### Phase 1 - Choose host

- Compare the hosting candidates against the requirements above.
- Pick one target for a small alpha backend.
- Document selected host constraints before implementation.

### Phase 2 - Backend production hardening

- Add production start command and config validation if needed.
- Verify rate limiting, request limits, safe errors, safe logs, and CORS config.
- Keep OpenAI STT path working.

### Phase 3 - Deploy backend with env vars

- Configure server-side env vars in the host dashboard.
- Do not put API keys in the mobile app.
- Deploy backend only.

### Phase 4 - Test backend endpoints

- Test `GET /health`.
- Test AI teacher endpoint.
- Test speech transcription endpoint with a small German audio file.
- Confirm app-facing errors are safe and provider-neutral.

### Phase 5 - Configure Expo/private build

- Point `EXPO_PUBLIC_AI_BACKEND_URL` to hosted HTTPS backend.
- Restart Expo or rebuild as needed.
- Run phone smoke test again.

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

Prepare backend production hardening without deployment.
