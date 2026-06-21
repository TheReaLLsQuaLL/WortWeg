# WortWeg Developer Pre-Commit Checklist

Use this checklist before every commit or push.

## 1. Before Editing

- Run:

```sh
git status --short
```

- Confirm the current task scope.
- Avoid mixing docs and code unless the task explicitly needs both.
- Avoid mixing unrelated product areas in one change.
- Never edit tracked secrets.
- Keep `.env` ignored and untracked.
- Do not commit API keys, provider keys, transcripts, audio paths, or local LAN-only values.

## 2. Standard Checks

Run:

```sh
npm run quality
```

This covers:

- `npm run typecheck`
- `npm run content:qa`
- `npm run server:check`
- `git diff --check`

Expected content totals:

- 36 lessons
- 288 exercises
- 288 vocabulary items

## 3. Backend Checks When Backend Files Change

Start the backend in one terminal:

```sh
npm run server:dev
```

In another terminal, run:

```sh
npm run server:smoke
```

or:

```sh
npm run quality:backend
```

Confirm:

- `/health` works.
- AI route does not expose provider/model diagnostics in production mode.
- Speech safe validation errors work.
- Rate limit `429` is safe Turkish if tested:

```text
Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar dene.
```

## 4. App Checks When UI/Navigation Changes

Manual checks:

- App launches without a red screen.
- Home routes work.
- Kelime entry point works.
- Hatalar entry point works.
- Konuşma entry point works.
- AI entry point works.
- Exam entry point works.
- No English user-facing labels were introduced.
- No full B1/B2 playable claims were introduced.
- Bottom navigation and sticky CTAs remain safe on phone screens.

## 5. Speech/Privacy Checks

Confirm:

- No raw transcript persistence.
- No `audioUri` persistence.
- No audio filename/path logging.
- No provider/model/endpoint details shown to normal users.
- DEV diagnostics remain collapsed/manual-only.
- Backend logs do not print API keys, raw provider responses, transcripts, or audio file paths.

## 6. Content Checks

Confirm:

- No unintended lesson count changes.
- No unintended exercise count changes.
- No unintended vocabulary count changes.
- No B1 preview expansion beyond 8 lessons.
- No full B1/B2 unlock.
- No official Goethe/telc/ÖSD claims.
- B1/B2 full paths remain coming soon.

## 7. Commit Style

Example commit messages:

- `Add local quality check script`
- `Fix vocabulary review repeat queue`
- `Add backend rate limiting`
- `Update roadmap after review and speaking features`

Guidance:

- Use one logical change per commit.
- Keep docs-only commits separate when possible.
- Run `git status --short` before committing.
- Do not commit `.env`.
- Do not commit generated local artifacts.

## 8. Push Checklist

Before pushing:

```sh
git log --oneline -5
git status --short
```

Confirm `git status --short` is clean after the commit, then push:

```sh
git push
```

## 9. Current Deployment Gate

- First hosted backend smoke passed on Render at `https://wortweg.onrender.com`.
- No tester distribution until the approved APK link, feedback channel, support process, and post-redeploy hosted smoke are ready.
- Azure remains design/prototype only, not implemented.
- Do not treat hosted smoke as public launch or production readiness.

## 10. Quick Command Block

```sh
cd ~/Code/WortWeg
git status --short
npm run quality
git diff --check
git add ...
git commit -m "..."
git push
```
