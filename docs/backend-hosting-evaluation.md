# WortWeg Backend Hosting Evaluation

This document is a planning artifact only. It does not deploy anything, create hosting accounts, install packages, change app code, change backend code, or change environment files.

Current deployment status: first hosted backend smoke passed on Render at `https://wortweg.onrender.com`, and hosted phone AI/speech smoke passed. This is not a public launch.

Last reviewed: 2026-06-21.

## Summary

WortWeg needs a small, secure hosted backend for private alpha testing. Render has now passed the first hosted smoke, and the backend should continue to preserve the current local behavior:

- Express backend.
- `GET /health`.
- AI teacher endpoint.
- Speech transcription endpoint.
- Compiled backend production start with `npm run server:build` and `npm run server:start`.
- OpenAI STT through backend only.
- Gemini AI teacher endpoint through backend only.
- Environment-driven CORS.
- Provider request timeouts.
- Production diagnostics sanitization.
- Dependency-free rate limiting.
- Local backend smoke-test script.

Render was selected for the first low-friction hosted smoke. Longer-term hosting choice should remain cautious:

- First smoke used: Render.
- Still viable to compare later: Railway.
- Best candidate to evaluate for later scale/controls: Google Cloud Run.
- Useful if region/runtime control is more important than setup simplicity: Fly.io.
- Avoid for now unless already available/needed: AWS App Runner and VPS.

AWS App Runner is listed for completeness, but current AWS documentation says App Runner is no longer open to new customers. That makes it a poor first choice unless an existing AWS account already has access and the constraint is verified.

## Current Backend Requirements

The selected host must support:

- Current Node/Express backend.
- Node 22 or a production-compatible Node runtime verified against the repo.
- `npm run server:build` followed by `npm run server:start`, or an equivalent compiled production start command.
- Server-side environment variables:
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `ALLOWED_ORIGINS`
  - `NODE_ENV`
  - `PORT`
  - rate-limit variables
- Public HTTPS backend URL suitable for Expo/mobile clients.
- `multipart/form-data` or equivalent upload handling for the speech route.
- Request timeouts long enough for speech transcription.
- Safe logs that can be operated without printing transcripts, audio paths, provider responses, or secrets.
- Health checks.
- Rollback/restart controls.
- A region near Turkey/EU if practical.

The mobile app must never contain provider API keys. The app should only receive a public backend URL through `EXPO_PUBLIC_AI_BACKEND_URL`.

## Deployment Blockers Still Remaining

- Render hosted `/health` passed.
- Render hosted `npm run server:smoke` passed health, CORS, AI route, and speech validation; rate-limit stress skipped by design.
- Hosted phone AI/speech passed for AI chat, correct-sentence speaking, silence/no-voice, and wrong-speech low-score behavior.
- Backend production start now uses compiled JavaScript; Render should keep build command `npm install && npm run server:build` and start command `npm run server:start`, then post-compiled redeploy smoke must pass before tester use.
- Backend error-copy behavior in an installed build is still optional/not fully tested.

Do not publish to testers until the approved APK link, feedback channel, support process, and post-redeploy hosted smoke are ready.

## Candidate Comparison Table

| Candidate | Node/Express fit | Env/secrets | HTTPS/public URL | Audio/STT fit | Cold start/latency | Logs/privacy | Cost predictability | Operational complexity | Current phase fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Render | First hosted smoke passed. Compiled production start is ready locally; keep compiled build/start commands and rerun hosted smoke after redeploy. | Dashboard env vars and secrets; keep keys server-side. | `https://wortweg.onrender.com` is live for private smoke. | Hosted phone AI/speech passed; rerun after compiled-start deploy. | Possible cold start risk depending service type/plan; verify before testers. | Dashboard logs available; app must avoid logging sensitive data. | Medium; verify current plan behavior before broader use. | Low to medium. | First smoke candidate used; keep hardening before testers. |
| Fly.io | Strong container/runtime fit; good regional control. | Runtime secrets supported. | Public networking and TLS support. | Likely viable, but machine/filesystem behavior and request limits need validation. | Potentially good if region is selected near users; needs more operational awareness. | Logs and secrets tooling exist; operational discipline needed. | Medium; verify current resource model. | Medium. | Good if region control matters. |
| Railway | Strong simple Express fit; docs include Express, variables, start commands. | Variables supported. | Public service URL support. | Needs upload/timeout validation. | Likely acceptable for low traffic, but verify cold start/sleep behavior. | Logs available; privacy depends on backend logging discipline. | Medium; verify current usage model. | Low. | Strong first experiment candidate. |
| Google Cloud Run | Strong container/service fit; supports Node source/container workflows. | Env vars and secrets available through Google Cloud tooling. | HTTPS service URL. | Good candidate if request timeout/body/temp behavior is configured correctly. | Cold starts possible; can be tuned later. Regions are broad. | Cloud Logging is powerful; privacy controls must be explicit. | Medium to high predictability if configured carefully, but verify. | Medium to high. | Better for later scale/control than first low-friction alpha. |
| AWS App Runner | Technically compatible with Node/container services. | Env vars and secrets support exist for existing users. | Managed HTTPS service model. | Needs upload/timeout validation. | Managed service behavior; region/access must be verified. | CloudWatch-style logging ecosystem; privacy discipline required. | Verify only if access exists. | Medium. | Avoid for now: official docs say it is no longer open to new customers. |
| VPS | Can run anything with Node manually. | Full control, but secret management is manual. | Requires manual HTTPS setup/reverse proxy. | Full control, but upload limits/timeouts are manual. | Stable if configured well; region selectable. | Full responsibility for logs, rotation, redaction, and security. | Potentially predictable, but operations time is real cost. | High. | Avoid for now unless managed platforms fail. |

## Candidate Notes

### Render

Render was used for the first hosted smoke. `/health`, `server:smoke`, hosted phone AI chat, hosted phone speaking, silence/no-voice, and wrong-speech low-score behavior passed at `https://wortweg.onrender.com`. Backend production start now uses compiled JavaScript at `dist-server/index.js`. Keep Render build command `npm install && npm run server:build`, keep start command as `npm run server:start`, and rerun hosted smoke after redeploy.

Potential fit:

- Simple setup for Express.
- Hosted URL/TLS.
- Environment variables.
- Dashboard logs.
- Health check support.

Risks/questions:

- Cold starts or sleep behavior may affect speech UX.
- Request timeout and upload size limits must be verified.
- Logs must be monitored without printing transcripts, audio paths, or provider data.

Likely role: easiest hosted smoke-test candidate alongside Railway.

### Fly.io

Fly.io is a strong candidate if regional placement and container/runtime control matter. It supports JavaScript/Node apps, public networking, TLS, and runtime secrets. It may be slightly more operationally involved than Render/Railway for a first deployment.

Potential fit:

- Region control near Turkey/EU.
- Runtime secrets.
- Public networking/TLS.
- Good container-style deployment model.

Risks/questions:

- More CLI/config surface area than the simplest PaaS options.
- Upload/temp filesystem behavior must be validated.
- Autostart/autostop behavior may affect first request latency if enabled.

Likely role: good second candidate if latency/region control becomes important.

### Railway

Railway is another practical first candidate because its docs cover Express, variables, and start commands. It may be a good low-friction test host for the current backend after the phone smoke gate.

Potential fit:

- Express guide.
- Variables support.
- Start command configuration.
- Public service URL.
- Quick setup for low-traffic alpha.

Risks/questions:

- Need to verify current request timeout, upload size, and service sleep/cold start behavior.
- Cost and usage model should be checked immediately before choosing.
- Logs must remain privacy-safe.

Likely role: easiest hosted smoke-test candidate alongside Render.

### Google Cloud Run

Cloud Run is a stronger production-oriented option. It supports Node.js services, environment variables, secrets, HTTPS invocation, request timeout configuration, health checks, and many regions. It is more operationally complex than Render/Railway but likely offers better long-term control.

Potential fit:

- Production-grade service runtime.
- Broad region choice.
- HTTPS endpoint.
- Env/secrets integrations.
- Configurable service behavior.
- Good path for later hardening.

Risks/questions:

- More setup complexity: Google Cloud project, billing, IAM, build/deploy flow.
- Cold starts may affect mobile speech UX unless tuned.
- Logging is powerful but must be configured and reviewed carefully.

Likely role: best later-scale candidate, or first choice if operational control matters more than simplicity.

### AWS App Runner

AWS App Runner would normally fit the "managed Node/container web service" category, but current AWS documentation states that App Runner is no longer open to new customers. That makes it a poor choice for first evaluation unless access already exists and AWS is otherwise required.

Potential fit if available:

- Managed Node/container service.
- HTTPS service model.
- Environment/secrets support for existing users.
- AWS operational ecosystem.

Risks/questions:

- New customer availability appears blocked.
- AWS account/IAM complexity.
- Request/upload/timeout behavior still needs verification.

Likely role: avoid for now unless access is confirmed and there is a strong AWS reason.

### VPS

A VPS gives maximum control but shifts too much operational work onto the project before private alpha. It would require process management, HTTPS termination, reverse proxy config, firewalling, log rotation, OS patching, monitoring, and secret handling.

Potential fit:

- Full control over Node runtime, request limits, temp storage, and region.
- Predictable architecture if configured well.

Risks/questions:

- Highest maintenance burden.
- More security surface area.
- Easy to get logging, HTTPS, firewalling, or updates wrong.

Likely role: avoid for now; revisit only if managed platforms are unsuitable.

## Shortlist Recommendation

This is not a final provider choice.

Likely easiest to try first:

1. Render
2. Railway

Reason: both are simple managed app platforms with Node/Express support, environment variables, public HTTPS URLs, and relatively low setup burden for a first private-alpha backend smoke test.

Best for later scale/control:

1. Google Cloud Run

Reason: Cloud Run has stronger production controls, region options, env/secrets integrations, and service configuration depth, but it adds project/IAM/deployment complexity.

Worth keeping as a secondary option:

1. Fly.io

Reason: useful if regional placement and runtime control matter. It may be a better fit after the simplest deployment path is tested.

Avoid for now unless needed:

1. AWS App Runner
2. VPS

Reason: App Runner currently appears unavailable to new customers. VPS adds too much operational burden before private alpha.

## Open Questions To Verify Before Choosing

For each candidate, verify the following from current official docs and a small backend smoke deployment:

- Can it run `npm run server:build` during build and `npm run server:start` at runtime without installing dev dependencies for runtime?
- Which Node runtime version is available, and can Node 22 be selected or approximated safely?
- How are environment variables and secrets configured?
- Does it provide a stable HTTPS URL suitable for `EXPO_PUBLIC_AI_BACKEND_URL`?
- What are request body limits for audio uploads?
- What are default and maximum request timeouts?
- Does the runtime allow temporary file writes during upload/transcription?
- How does it handle idle services/cold starts?
- Which region closest to Turkey/EU is available?
- How are logs accessed, retained, redacted, and exported?
- How easy is rollback after a bad deploy?
- Can `GET /health` be used as a health check?
- Can `BACKEND_SMOKE_URL=https://... npm run server:smoke` pass from the local machine?
- What is the cost model for low but bursty speech transcription traffic?
- Does the provider require any client/mobile configuration changes beyond the backend URL?

## Non-Goals

- No deployment now.
- No account creation now.
- No Azure implementation now.
- No public launch.
- No auth/cloud sync requirement.
- No full B1/B2 unlock.
- No official exam-provider claims.
- No leaderboard/social ranking.
- No mobile app secrets.
- No provider/model/endpoint details in normal user-facing UI.

## Source Notes Reviewed

These sources were checked only for high-level capability signals. Pricing and limits must be re-verified before any final choice:

- Render Node Express deployment docs: https://render.com/docs/deploy-node-express-app
- Render environment variables docs: https://render.com/docs/configure-environment-variables
- Render health checks/logging docs: https://render.com/docs/health-checks and https://render.com/docs/logging
- Fly.io JavaScript docs: https://fly.io/docs/js/
- Fly.io secrets docs: https://fly.io/docs/apps/secrets/
- Fly.io public networking docs: https://fly.io/docs/networking/services/
- Railway Express guide: https://docs.railway.com/guides/express
- Railway variables/start command docs: https://docs.railway.com/variables and https://docs.railway.com/deployments/start-command
- Google Cloud Run Node.js quickstart and service configuration docs: https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service
- AWS App Runner overview, Node.js, and environment variable docs: https://docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html, https://docs.aws.amazon.com/apprunner/latest/dg/service-source-code-nodejs.html, and https://docs.aws.amazon.com/apprunner/latest/dg/env-variable.html

## Next Prompt

Redeploy Render with compiled backend build/start and rerun hosted smoke.
