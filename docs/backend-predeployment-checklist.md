# WortWeg Backend Pre-Deployment Checklist

This checklist was used for the first hosted backend smoke test after the phone speaking smoke gate passed. The first Render hosted smoke passed; keep this checklist for repeat deploys and future host changes.

Important:

- Do not publish to testers until hosted phone AI/speech passes and is documented.
- Do not put API keys in the mobile app.
- Do not commit `.env`.
- Do not add Azure now.
- This is for a private hosted smoke test, not a public launch.

## 1. Gate Before Starting

Before any future hosted deployment change, confirm every item below is true:

- Phone smoke gate has passed for the flow being deployed, and hosted phone AI/speech will be re-tested after deployment.
- `git status --short` is clean.
- `npm run typecheck` passes.
- `npm run content:qa` passes with:
  - 36 lessons
  - 288 exercises
  - 288 vocabulary items
- `npm run server:check` passes.
- `npm run server:smoke` passes against the local backend.
- `.env` is untracked.
- No hardcoded LAN IP exists in committed app code.
- Backend docs are current:
  - `docs/backend-deployment-plan.md`
  - `docs/backend-hardening-audit.md`
  - `docs/backend-hosting-evaluation.md`
  - this checklist

## 2. Files / Commands To Verify

Before creating a hosted service, verify the local backend structure:

- `package.json` scripts:
  - `server:dev`
  - `server:build`
  - `server:start`
  - `server:check`
  - `server:smoke`
- Backend entrypoint:
  - `server/index.ts`
- Backend env/config module:
  - `server/config.ts`
  - `server/checkConfig.ts`
- Rate limiter:
  - `server/rateLimit.ts`
- CORS config:
  - environment-driven CORS in `server/index.ts`
- Smoke script:
  - `server/smokeTest.ts`

## 3. Required Hosted Env Vars

Use placeholders only in committed docs. Configure real values only in the hosting dashboard or its secret environment variable mechanism.

```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_server_side_openai_key
GEMINI_API_KEY=your_server_side_gemini_key
ALLOWED_ORIGINS=https://YOUR_ALLOWED_ORIGIN
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_AI_MAX=30
RATE_LIMIT_SPEECH_MAX=10
RATE_LIMIT_HEALTH_MAX=120
SPEECH_SCORING_PROVIDER=transcript
SPEECH_AZURE_ENABLED=false
```

Rules:

- Never paste real keys into docs.
- Never commit `.env`.
- Use hosting dashboard secret env vars only.
- Rotate keys immediately if a key is leaked.
- The mobile app must never contain `OPENAI_API_KEY`, `GEMINI_API_KEY`, or future Azure keys.
- The mobile app should only receive the hosted backend URL through `EXPO_PUBLIC_AI_BACKEND_URL`.

## 4. ALLOWED_ORIGINS Plan

Production CORS should not use wildcard origins.

Possible allowed origins to evaluate:

- Hosted frontend/app origin if a web frontend is ever used.
- Expo/private build request origin behavior, verified during hosted smoke.
- Temporary local development origins only in local development, not broad production config.

Notes:

- Native mobile requests may not behave like browser CORS requests, but the backend should still fail closed for browser origins in production.
- Keep `ALLOWED_ORIGINS` minimal.
- Do not preserve local LAN IPs as permanent production origins.
- If a hosted smoke fails because of CORS, update only the hosted env var after confirming the exact required origin.

## 5. Render Checklist

High-level only. Do not create a Render service until the phone smoke gate passes.

- Create a web service.
- Connect the private GitHub repo.
- Set root directory if the host asks for it.
- Set build command to `npm install && npm run server:build`.
- Set start command to `npm run server:start`.
- Render no longer needs `npm install --include=dev` after the compiled backend build/start change.
- Set all required hosted env vars.
- Confirm the service exposes a public HTTPS URL.
- Confirm `GET /health`.
- Run hosted smoke:

```sh
BACKEND_SMOKE_URL=https://YOUR_BACKEND_URL npm run server:smoke
```

- Inspect logs for:
  - no API keys
  - no transcripts
  - no `audioUri`
  - no raw provider response bodies
  - no provider/model/endpoint details in production app responses
- Do not publish the hosted URL to testers yet.
- Do not point the mobile app to the hosted backend until hosted smoke passes.

First Render hosted smoke record:

- Provider: Render Web Service.
- URL: `https://wortweg.onrender.com`.
- Branch: `feature/b1-preview-foundation`.
- First-smoke build command: `npm install --include=dev`.
- Compiled build command: `npm install && npm run server:build`.
- Start command: `npm run server:start`.
- Compiled entry expected after build: `dist-server/index.js`.
- `/health` passed with `{"ok":true,"service":"wortweg-ai"}`.
- Hosted `server:smoke` passed health, CORS, AI route, and speech validation; rate-limit stress skipped by design.
- Follow-up: after compiled-start redeploy, rerun hosted `/health` and `server:smoke`.

## 6. Railway Checklist

High-level only. Do not create a Railway service until the phone smoke gate passes.

- Create a project/service.
- Connect the private GitHub repo.
- Set the start command according to actual package scripts, likely `npm run server:start` if supported.
- Set all required hosted env vars.
- Confirm the service exposes a public HTTPS URL.
- Confirm `GET /health`.
- Run hosted smoke:

```sh
BACKEND_SMOKE_URL=https://YOUR_BACKEND_URL npm run server:smoke
```

- Inspect logs for:
  - no API keys
  - no transcripts
  - no `audioUri`
  - no raw provider response bodies
  - no provider/model/endpoint details in production app responses
- Do not publish the hosted URL to testers yet.
- Do not point the mobile app to the hosted backend until hosted smoke passes.

## 7. Hosted Smoke Commands

Use placeholders only:

```sh
curl https://YOUR_BACKEND_URL/health
```

```sh
BACKEND_SMOKE_URL=https://YOUR_BACKEND_URL npm run server:smoke
```

Expected:

- `/health` returns a healthy response.
- `server:smoke` passes required checks.
- Optional checks skip safely unless explicitly enabled.
- Smoke output does not print API keys, transcripts, audio URIs, provider response bodies, or provider internals.

## 8. Mobile App Config After Hosted Smoke

Only after hosted smoke passes:

- Update the local/private build environment:

```env
EXPO_PUBLIC_AI_BACKEND_URL=https://YOUR_BACKEND_URL
```

- Do not hardcode the hosted URL in random source files.
- Do not commit real `.env` values.
- Document the environment switch in the release notes or tester setup notes.
- Restart Expo or rebuild as needed after changing `EXPO_PUBLIC_AI_BACKEND_URL`.
- Run AI chat from phone again.
- Run speech transcription from phone again.
- Document whether phone hosted AI/speech passed before tester distribution.
- Confirm normal app UI does not show provider/model/endpoint/network internals.

## 9. Failure / Rollback

If hosted smoke or phone testing fails:

- Revert the app backend URL to the local backend for development.
- Disable or pause the hosted service if unsafe.
- Rotate keys if a key may have leaked.
- Inspect logs for safe metadata only.
- Keep the local backend path working:

```env
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
```

- Do not invite testers until hosted health, AI, and speech checks pass.

## 10. Privacy Verification

Before any hosted backend is shared with testers, verify:

- No transcripts in logs.
- No `audioUri` in logs.
- No uploaded audio filename/path in logs.
- No full API response bodies in logs.
- No API keys in logs.
- No provider/model/endpoint details in normal production responses.
- HTTP 429 response is safe Turkish:

```text
Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar dene.
```

- CORS denies unapproved browser origins.
- Production diagnostics remain sanitized.
- DEV-only diagnostics are not exposed to normal users.

## 11. Non-Goals

- No Azure.
- No public launch.
- No auth.
- No cloud sync.
- No full B1/B2 unlock.
- No official exam-provider claims.
- No leaderboard/social ranking.
- No broad app redesign.

## 12. Next Prompt Title

Document hosted phone AI/speech result and finalize private alpha packaging path.
