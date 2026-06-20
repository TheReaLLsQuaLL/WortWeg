# WortWeg Backend Hardening Audit

This audit inspects the current local-only backend before any hosted deployment work. It does not deploy anything, create accounts, install packages, or change application/backend code.

Deployment status: blocked until the final real-device phone smoke test passes. The backend should not be deployed before phone AI chat and phone speech transcription work reliably against the local backend.

Azure status: no Azure implementation exists. Azure pronunciation work must remain a future backend-only, feature-flagged prototype.

Client secret rule: the mobile app must never contain `OPENAI_API_KEY`, `GEMINI_API_KEY`, future Azure keys, or other provider secrets.

## Current Backend Status

- Backend entrypoint: `server/index.ts`.
- Development command: `npm run server:dev`.
- Runtime style: TypeScript via `tsx`.
- Host/port: `HOST` defaults to `0.0.0.0`; `PORT` defaults to `3001`.
- Health endpoint: `GET /health`.
- AI endpoint: `POST /ai/teacher`.
- Speech endpoint: `POST /speech/transcribe`.
- AI provider: Gemini via `server/geminiClient.ts`.
- Speech provider: OpenAI STT via `server/sttClient.ts`.
- Upload handling: `multer` disk storage in OS temp directory.
- Upload size limit: 10 MB.
- Temp upload cleanup: attempted in `finally` after transcription route handling.
- Request body JSON limit: 1 MB.
- CORS: environment-driven; production requires `ALLOWED_ORIGINS`, development allows localhost/LAN-style origins.
- Rate limiting: dependency-free in-memory limiter is enabled by default for health, AI, and speech endpoint groups.
- Production start script: `server:start` exists as a first production-oriented runner using the existing TypeScript runtime.
- `.env`: ignored by `.gitignore`; `.env.example` contains placeholders.

## Findings By Section

### 1. Production Start Readiness

Status: partially hardened; still needs host-specific runtime confirmation before private alpha hosting.

Already good:

- `server/index.ts` is a clear backend entrypoint.
- `PORT` env is supported.
- `HOST` env is supported and defaults to `0.0.0.0`.
- `/health` returns a simple JSON status suitable for basic host checks.
- Node 22 works for local development.

Gaps:

- `package.json` now has `server:start`, but it uses the existing `tsx` runtime and must be confirmed against the selected host.
- There is no dedicated compiled server build flow yet.
- No `engines.node` field documents the expected production Node runtime.
- No readiness endpoint beyond `/health`; this may be enough for first deploy, but it does not validate provider env configuration.
- Shutdown handling covers `SIGINT` and `SIGTERM`, but there is no documented host runbook.

Recommendation:

- Confirm whether the selected host can run the current `server:start` script or whether a compiled server build is needed.
- Add Node runtime documentation or `engines` once the host is selected.
- Keep `/health`, and consider a non-secret readiness endpoint or startup config validation before remote testers.

### 2. Environment Variables

Status: partially hardened; hosted env setup still must be verified before deployment.

Already good:

- `.gitignore` ignores `.env`, `.env.local`, and `.env.*.local`.
- `.env.example` uses placeholders, not real keys.
- Backend reads server-side `GEMINI_API_KEY` and `OPENAI_API_KEY`.
- Expo/client backend URL uses `EXPO_PUBLIC_AI_BACKEND_URL`; provider API keys are not intended for the mobile app.

Gaps:

- Required backend env vars are not centrally validated at startup.
- Missing `GEMINI_API_KEY` or `OPENAI_API_KEY` silently produces fallback behavior instead of failing deployment readiness.
- `ALLOWED_ORIGINS`, `NODE_ENV`, production `HOST`, and request/timeout settings are not validated.
- `.env.example` contains future Azure placeholders. That is acceptable as placeholders, but deployment docs should keep saying Azure is not implemented.

Recommendation:

- Backend config validation has a first implementation.
- Missing provider keys are production startup failures when required.
- Keep local fallback behavior for development, but verify production startup failure behavior on the selected host.

### 3. CORS

Status: partially hardened; hosted origin behavior still must be verified before deployment.

Current behavior:

- `server/index.ts` now uses environment-driven CORS checks.
- Development allows localhost/LAN-style origins and configured `ALLOWED_ORIGINS`.
- Production requires `ALLOWED_ORIGINS` and only returns CORS allow headers for listed origins.

Risk:

- CORS is not a substitute for auth or rate limiting.
- A public backend still needs abuse protection even with restrictive CORS.

Recommendation:

- Environment-driven CORS has a first implementation.
- Production requires `ALLOWED_ORIGINS`; development allows localhost/LAN-style origins.
- For native app/private alpha, verify actual `Origin` behavior on the hosted backend and keep CORS restrictive.

### 4. Request Limits And Audio Upload

Status: should fix before private alpha hosting.

Already good:

- `express.json({ limit: '1mb' })` protects JSON routes from very large bodies.
- Speech upload uses `multer`.
- Speech upload file limit is 10 MB.
- Only one file is accepted.
- Audio extension/MIME allow-list exists.
- Temp files are stored under OS temp directory.
- Temp file cleanup is attempted after transcription processing.
- Invalid upload and unsupported audio format return controlled errors.

Gaps:

- 10 MB may or may not be right for hosted provider limits and mobile network conditions; it should be confirmed.
- There is no explicit request timeout around Gemini or OpenAI fetch calls.
- A hanging provider call could hold a request open until host timeout.
- Multipart upload errors do not explicitly verify cleanup for partially written files.
- Disk temp storage may be unsuitable on some serverless/container hosts unless temp-write behavior is verified.
- Large payload failure responses include English error text. This is backend-facing but may reach app fallback logic; before production, app-facing errors should be normalized.

Recommendation:

- Provider fetch timeouts with `AbortController` are in place for Gemini and OpenAI STT.
- Add route-level or server-level request timeout handling later if host defaults are not enough.
- Confirm temp file cleanup on success, provider failure, invalid body, and upload failure.
- Confirm 10 MB against expected Expo recording size and host/provider limits.
- Keep errors provider-neutral and app-safe.

### 5. Privacy-Safe Logging

Status: should fix before private alpha hosting.

Already good:

- Debug logs are gated by `NODE_ENV !== 'production'` in speech route/STT client.
- STT debug logs do not print transcript text.
- Speech route debug logs do not print `file.path`, original filename, or `audioUri`.
- OpenAI API response body is not logged.
- API keys are not logged.

Risks/gaps:

- Development logs include provider and model names.
- Development speech responses include `provider`, `modelUsed`, and `fallback` for existing debug tooling; production responses omit provider/model diagnostics.
- Development AI responses include `modelUsed`; production responses omit it from normal app responses.
- No centralized safe logger exists.
- No production log policy exists in code.
- README/docs mention some internal diagnostic terms for development; that is acceptable, but production operator logs should remain disciplined.

Recommendation:

- Add a small safe logging helper before deployment.
- Keep production logs to route, status, duration, size bucket, score bucket/fallback bucket, and request id if added.
- Do not log transcript, expected sentence, prompt text, chat text, uploaded file path/name, raw provider response, or API keys.
- Production AI and speech responses now omit provider/model diagnostics; development responses keep them for diagnostics.

### 6. Error Handling

Status: should fix before private alpha hosting.

Already good:

- AI request validation returns `400`.
- AI response schema validation returns `502`.
- Speech upload errors return controlled `400`, `413`, or `415`.
- Speech route catches transcription exceptions and returns a generic `500`.
- OpenAI failures become fallback STT responses instead of raw provider errors.
- Gemini failures become fallback Wolli responses instead of raw provider errors.

Gaps:

- There is no global Express error handler.
- Development validation responses include Zod `details`; production omits those details.
- Development responses keep provider/model diagnostics for existing debug tooling.
- Production AI and speech responses omit provider/model diagnostics, but still include generic `fallback` where needed by the app.
- A global Express error handler is still missing.

Recommendation:

- Add a centralized app-facing error shape.
- Keep provider/internal failure details out of normal app responses unless the field is explicitly DEV/internal.
- Keep timeout classification and safe error messages as provider behavior expands.
- Add a global Express error handler.

### 7. Abuse / Rate Limiting

Status: blocker before remote private alpha.

Current behavior:

- Dependency-free in-memory rate limiting is enabled by default.
- Endpoint groups have separate defaults: health 120/min, AI 30/min, speech 10/min.
- Limits are configurable with `RATE_LIMIT_ENABLED`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_AI_MAX`, `RATE_LIMIT_SPEECH_MAX`, and `RATE_LIMIT_HEALTH_MAX`.
- HTTP 429 responses return a generic Turkish-safe message and no provider/request-body details.

Risk:

- In-memory limiting is process-local and resets on restart.
- It is enough for a first private-alpha backend, but it is not a distributed or account-aware limiter.
- If the hosted runtime runs multiple instances, each instance has its own bucket.

Recommendation:

- Keep this limiter for first hosted alpha.
- Tune limits after real phone smoke and tester behavior are known.
- Revisit a shared limiter only if multiple instances, auth, or broader testing require it.

### 8. AI Teacher Route

Status: should fix before private alpha hosting.

Already good:

- `aiTeacherRequestSchema` validates mode, level, message length, conversation history size, and lesson context.
- Lesson-aware context is bounded for `lessonContext`.
- Prompt includes B1 preview guardrails.
- Prompt explicitly says full B1/B2 are coming soon.
- Prompt tells Wolli not to mention provider/model/endpoint/fallback/mock/debug/API/network details.
- Gemini response is parsed and validated with Zod.
- Fallback responses preserve B1 preview scope and avoid claiming full B1 availability.

Gaps:

- Some generic `context` fields are unbounded strings, including `lessonId`, `topic`, `expectedAnswer`, `transcript`, `examSection`, `word`, `article`, and `correctAnswer`.
- `buildUserPrompt` serializes full `request.context`, which may include transcript or expected answer. That is intended for AI feedback, but it means context bounds and privacy review matter before production.
- `conversationHistory` and `userMessage` are sent to Gemini, as expected, but should not be logged.
- No route timeout around Gemini calls.
- Basic in-memory rate limiting is in place; tune limits before hosted alpha.

Recommendation:

- Add max lengths to all context fields before deployment.
- Keep lessonContext static and bounded.
- Gemini fetch timeout is in place.
- Keep B1 guardrails unchanged.
- Keep AI prompts Turkish-first and provider-neutral.

### 9. Speech Route

Status: should fix before private alpha hosting.

Already good:

- `speechTranscribeRequestSchema` bounds `expectedText` and `prompt` at 500 characters.
- Uploads require an `audio` file.
- Upload size is limited.
- Audio format allow-list exists.
- Temp files are removed in `finally` after valid route handling.
- STT code does not log transcript text.
- STT code does not log audio file path.
- STT errors fall back safely.
- Current flow remains compatible with Expo recording.

Gaps:

- Development response includes provider/model/fallback fields for diagnostics.
- Production response omits provider/model diagnostics and keeps generic fallback behavior.
- Fallback transcript can be generated from `expectedText`; this is fine for local/dev fallback but should be reviewed for production semantics.
- Upload error cleanup for partially written files is not explicitly tested.
- Basic in-memory rate limiting is in place.
- No route-level request timeout beyond provider timeouts.
- Provider-neutral production response contract has a first implementation; verify it in phone and hosted smoke tests.

Recommendation:

- OpenAI fetch timeout is in place.
- Tune rate limits and add route-level request timeout later if host defaults are not enough.
- Confirm temp cleanup in tests/manual checks.
- Keep transcript text out of logs.
- Provider/model diagnostics are now development-only response fields.

## Completed In First Hardening Layer

- Added `server/config.ts` for backend-only config loading and production validation.
- Added `server:check` and `server:start` scripts.
- Kept `npm run server:dev` intact for local development.
- Replaced reflective CORS with environment-driven origin checks.
- Made production startup require `ALLOWED_ORIGINS`, `GEMINI_API_KEY`, and `OPENAI_API_KEY` when using OpenAI STT.
- Added safe defaults for `SPEECH_SCORING_PROVIDER=transcript` and `SPEECH_AZURE_ENABLED=false`; Azure remains unavailable.
- Added explicit provider request timeouts for Gemini and OpenAI STT calls.
- Added dependency-free in-memory rate limiting for `/health`, `/ai/teacher`, and `/speech/*`.
- Added `server:smoke` for local backend readiness checks without printing secrets or raw provider payloads.
- Added `npm run quality` for local pre-commit checks that do not require a running backend.
- Omitted provider/model diagnostics from production AI and speech responses while keeping development diagnostics available.
- Relaxed app service parsers so production provider-neutral responses do not break existing flows.

## Deployment Blockers

These should be fixed before any hosted backend is exposed to remote testers:

1. Final real-device phone smoke test has not fully passed.
2. Hosted environment variables and `ALLOWED_ORIGINS` have not been configured or tested on a real host.
3. Production start strategy still uses the existing `tsx` runtime; host-specific build/runtime choice must be confirmed.
4. No hosted deployment runbook exists yet.
5. Speech temp-file cleanup has not been verified on the selected host.
6. In-memory rate limits must be tuned and rechecked against real tester behavior.

## Should Fix Before Private Alpha Hosting

- Add centralized safe error handling.
- Add safe logging helper and production log policy.
- Add bounded schemas for all AI context fields.
- Confirm speech temp file cleanup on success, provider failure, invalid body, and upload failure.
- Confirm upload size limit and timeout settings against real phone audio samples.
- Add a backend deployment runbook.
- Confirm host supports temp files, multipart uploads, and speech request duration.

## Nice To Have Later

- Request ids for correlating safe logs.
- Separate `/ready` endpoint that checks non-secret runtime readiness.
- Basic metrics for route duration, status, fallback bucket, and upload size bucket.
- Auth or tester identity after private alpha scope is clearer.
- Provider-neutral speech assessment endpoint before Azure experiments.
- Azure pronunciation prototype behind backend feature flag only after current OpenAI STT path is stable.

## Already Good

- `.env` is ignored.
- `.env.example` uses placeholders.
- Mobile app uses public backend URL instead of provider keys.
- `/health` exists.
- `PORT` and `HOST` are supported.
- AI route has Zod request/response validation.
- AI prompt has B1 preview guardrails.
- Speech upload has a 10 MB limit and file count limit.
- Speech upload has extension/MIME filtering.
- Temp audio cleanup is attempted after transcription.
- STT logs do not include transcript text.
- Provider API keys are server-side only.
- No Azure implementation is present.

## Prioritized Hardening Checklist

1. Keep deployment blocked until the final phone smoke test passes.
2. Confirm production runtime/build strategy for the selected host.
3. Add centralized safe error responses.
4. Add safe logging helper and production log policy.
5. Bound all AI context schema string fields.
6. Confirm and document speech temp-file cleanup behavior.
7. Tune rate limits after phone smoke and tester behavior are known.
8. Add deployment runbook and host-specific constraints after a host is selected.
9. Run `server:smoke` locally and against any future hosted backend before inviting testers.
10. Run hosted phone smoke tests for `/health`, AI chat, and speech transcription before inviting testers.

## Suggested Implementation Order

1. Phone smoke completion and blocker triage.
2. Centralized safe error shape commit.
3. Safe logging helper commit.
4. AI context schema tightening commit.
5. Speech cleanup/manual test commit.
6. Rate-limit tuning after real-device behavior is known.
7. Deployment runbook commit.
8. Host selection and deployment preparation.

## Next Safe Hardening Task

Add centralized safe errors and safe logging without deployment:

- keep local development behavior usable,
- preserve provider-neutral production responses,
- keep rate limiting enabled and configurable,
- do not deploy,
- do not add Azure,
- do not expose API keys in the mobile app.
