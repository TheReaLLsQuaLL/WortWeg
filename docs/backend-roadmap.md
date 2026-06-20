# WortWeg Backend Roadmap

This document parks backend/server work for later. It is not an implementation plan for this branch.

## 1. Current State

- WortWeg uses a local Express backend in server/.
- The backend provides Gemini text AI routes for the AI teacher layer.
- The backend provides OpenAI German speech-to-text through /speech/transcribe.
- The Expo app calls the backend through EXPO_PUBLIC_AI_BACKEND_URL.
- Current testing is local LAN only: phone and Mac must be on the same Wi-Fi.
- Secrets stay server-side in .env; the mobile app must never contain Gemini/OpenAI keys.

## 2. Problem

- http://192.168.x.x:3001 only works on the same local network.
- Remote alpha testers need a public HTTPS backend URL.
- API keys must remain on the backend host, not in Expo/mobile code.
- Speech uploads need clear privacy rules: temporary files only, no permanent audio storage by default.

## 3. Future Backend Deployment Options

- Render: simple web service deployment, good for small alpha tests.
- Railway: quick Node deployment with environment variables and logs.
- Fly.io: more control and regional deployment, slightly more setup.
- Cloudflare Tunnel or ngrok: useful for temporary testing only, not a stable production backend.

## 4. Recommended Alpha Deployment

- Deploy only the existing backend first.
- Keep the app in Expo Go or a dev build during private alpha.
- Set EXPO_PUBLIC_AI_BACKEND_URL to the public HTTPS backend URL.
- Keep GEMINI_API_KEY and OPENAI_API_KEY only on the backend host.
- Test /health, /ai/teacher, and /speech/transcribe before inviting remote testers.

## 5. Future Production Needs

- Authentication and user identity.
- Rate limiting and abuse protection.
- Request logging without private content, transcripts, audio URIs, or API keys.
- Cost monitoring for Gemini/OpenAI usage.
- Narrow CORS policy for production builds.
- Privacy policy and data retention rules.
- Data deletion/export plan.
- Crash/error reporting with privacy filters.
- Optional Supabase progress sync after local MVP behavior is stable.

## 6. Speech Roadmap

- Current: OpenAI STT through the secure backend.
- Near term: public HTTPS backend for remote alpha testers.
- Beta experiment: iOS/Android native STT in a separate EAS dev-build branch.
- Later: evaluate ML Kit or Gemma-style local models only if device performance and German accuracy justify it.
- Azure Pronunciation Assessment should wait until the core lesson/speaking loop is stable.

## 7. Migration Checklist

1. Prepare backend environment variables.
2. Deploy the backend service.
3. Test GET /health.
4. Test POST /ai/teacher.
5. Test POST /speech/transcribe with a small German audio file.
6. Update Expo env: EXPO_PUBLIC_AI_BACKEND_URL=https://YOUR_BACKEND_HOST.
7. Restart Expo with --clear.
8. Run a private remote alpha smoke test.
9. Monitor cost, errors, fallback rate, and tester reports.

## 8. Current Priority

For now, keep focus on app/content quality: playable A0/A1/A2 lessons, the optional limited B1 preview, onboarding persistence, SRS, mistakes, speaking UX, and safe tester reporting. Full B1/B2 remain coming soon until a later content pass.
