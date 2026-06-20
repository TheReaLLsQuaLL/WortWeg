# WortWeg

WortWeg is a mobile-first German learning MVP for Turkish speakers. It uses Expo React Native, TypeScript, React Navigation, local AsyncStorage persistence, original playable A0/A1/A2 content plus five optional B1 preview lessons, SRS vocabulary review, a secure local AI backend wrapper for Gemini text feedback, and backend German speech-to-text for speaking practice.

## Requirements

- Node 22 LTS is recommended. Expo SDK 54 started cleanly with Node 22 in this repo; Node 26 can hit Expo CLI/freeport startup errors.
- npm
- Expo Go on a phone, or an iOS/Android simulator

## Colleague Setup

Use a private GitHub repo and keep real keys out of Git. WortWeg is currently verified with Node `22.22.3`; Node 26 can cause Expo CLI/freeport startup errors.

```bash
git clone git@github.com:YOUR_ORG_OR_USER/wortweg.git
cd wortweg
nvm use
npm install
cp .env.example .env
```

In `.env`, set backend-only Gemini credentials:

```bash
GEMINI_API_KEY=your_server_side_gemini_key
GEMINI_MODEL=gemini-3.5-flash
GEMINI_CHEAP_MODEL=gemini-3.1-flash-lite
```

For Expo Go on a real Android phone, set the mobile backend URL to the computer LAN IP shown by Expo or your network settings. Do not use `localhost` from a physical phone.

On macOS, check the current Wi-Fi LAN IP with:

```bash
ipconfig getifaddr en0
```

```bash
AI_BACKEND_URL=http://localhost:3001
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
EXPO_PUBLIC_AI_TIMEOUT_MS=30000
```

Run the backend in one terminal:

```bash
npm run server:dev
```

Run Expo in another terminal:

```bash
npm start -- --clear
```

Android Expo Go notes:

- The phone and computer must be on the same Wi-Fi network.
- Test backend reachability from the computer first with `curl http://YOUR_MAC_LAN_IP:3001/health`.
- If AI chat returns a local fallback reply, confirm `EXPO_PUBLIC_AI_BACKEND_URL` uses the LAN IP, then restart Expo with `npm start -- --clear`.
- Gemini keys stay only in `.env` on the backend side. The mobile app must never contain `GEMINI_API_KEY`.

## Install

```bash
npm install
```

Copy `.env.example` to `.env`. `.env` is local, ignored by Git, and must not be committed. Do not expose real API keys in the mobile app.

```bash
cp .env.example .env
```

Put `GEMINI_API_KEY` only in `.env` for the backend server. For Expo Go on a real phone, set `EXPO_PUBLIC_AI_BACKEND_URL` to your current Mac LAN URL. The IP can change between networks; check it with `ipconfig getifaddr en0`. The backend URL is not secret; the Gemini key is secret.

## Run

Run the AI backend:

```bash
npm run server:dev
```

Run the Expo app in another terminal:

```bash
npm start
```

Then scan the Expo QR code with Expo Go, or run:

```bash
npm run ios
npm run android
```

Run both together:

```bash
npm run dev:all
```

## Type Check

```bash
npm run typecheck
```

## Current MVP Behavior

- Onboarding persists locally with `@react-native-async-storage/async-storage`.
- The playable learning path covers A0, A1, and A2. There are five optional limited “B1 Ön İzleme” lessons; the full B1/B2 tracks remain coming soon.
- Exam practice content is original and lives in `src/data/exam.a1.ts`.
- Lesson completion awards XP, updates local-date streaks, adds SRS cards, and records mistakes.
- SRS review uses `src/lib/srs.ts`.
- AI chat, exam answer feedback, writing feedback, and speaking feedback call the local backend when configured, and fall back to local Wolli responses when unavailable.
- Speech recording/replay is local, German transcription can use the secure backend, and speaking feedback is transcript-comparison based until real phonetic scoring is added.

## AI Service Boundary

The mobile app never calls Gemini directly. It calls the WortWeg backend URL from `EXPO_PUBLIC_AI_BACKEND_URL`. Mobile AI requests use `EXPO_PUBLIC_AI_TIMEOUT_MS`, defaulting to `30000` ms:

```ts
await fetch(`${process.env.EXPO_PUBLIC_AI_BACKEND_URL}/ai/teacher`, {
  method: 'POST',
  body: JSON.stringify(input),
});
// Timeout defaults to EXPO_PUBLIC_AI_TIMEOUT_MS=30000.
```

Do not use `AI_BACKEND_URL` in mobile code. `AI_BACKEND_URL` is for server/internal tooling; Expo only exposes variables prefixed with `EXPO_PUBLIC_`. The server in `server/` reads `GEMINI_API_KEY`, calls Gemini, validates the response with Zod, and returns a stable JSON contract to the app. If the mobile backend URL is missing, fetch fails, or the response is invalid, the app falls back to local Wolli feedback. If Gemini itself fails server-side, the server returns schema-valid local fallback feedback.

### AI Endpoint

```http
POST /ai/teacher
```

Modes:

- `chat`
- `exam_feedback`
- `writing_feedback`
- `speaking_feedback`
- `exercise_explanation`
- `mistake_summary`
- `grammar_tip`
- `vocab_explanation`

### Model Routing

Routing is centralized in `server/modelRouter.ts`.

- Main model: `GEMINI_MODEL`, default `gemini-3.5-flash`
- Cheap/helper model: `GEMINI_CHEAP_MODEL`, default `gemini-3.1-flash-lite`
- `modelUsed` is stamped by backend code after JSON parsing. The AI response is never trusted for this field.
- If the main model fails and cheap fallback succeeds, `modelUsed` is `gemini-3.1-flash-lite:fallback`.
- Local fallback responses use `mock:<reason>:<model>` internally for diagnostics.

Main model modes:

- `chat`
- `exam_feedback`
- `writing_feedback`
- `speaking_feedback`

Cheap/helper model modes:

- `exercise_explanation`
- `mistake_summary`
- `grammar_tip`
- `vocab_explanation`

### Backend Environment

```bash
GEMINI_API_KEY=your_server_side_key
GEMINI_MODEL=gemini-3.5-flash
GEMINI_CHEAP_MODEL=gemini-3.1-flash-lite
OPENAI_API_KEY=your_server_side_openai_key
STT_PROVIDER=openai
STT_MODEL=gpt-4o-mini-transcribe

# Server/internal tools on this Mac.
AI_BACKEND_URL=http://localhost:3001

# Expo Go on a physical phone. Use the current Mac LAN IP.
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
EXPO_PUBLIC_AI_TIMEOUT_MS=30000
EXPO_PUBLIC_SPEECH_TIMEOUT_MS=45000
```

Use `localhost` only for simulator/web or curl commands running on the same Mac. For Expo Go on a physical phone, `localhost` means the phone itself, so use your computer LAN IP. On macOS, run `ipconfig getifaddr en0` to check the current Wi-Fi IP.


## Speech-to-text Backend

WortWeg speaking practice now sends recorded audio through the secure backend for German transcription:

```text
mobile recording -> WortWeg backend -> OpenAI transcription -> backend response -> mobile transcript
```

The mobile app never calls OpenAI directly and never contains `OPENAI_API_KEY`. After transcription, the app compares the transcript with the target sentence; real phonetic pronunciation scoring is not connected yet. Uploaded audio is handled as a temporary backend file and is deleted after transcription/fallback.

Backend `.env` values:

```bash
OPENAI_API_KEY=your_server_side_openai_key
STT_PROVIDER=openai
STT_MODEL=gpt-4o-mini-transcribe
```

Mobile `.env` values:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
EXPO_PUBLIC_SPEECH_TIMEOUT_MS=45000
```

Run the backend and Expo in separate terminals:

```bash
npm run server:dev
PATH=/Users/squall/.nvm/versions/node/v22.22.3/bin:$PATH npx expo start --clear --port 8083
```

Health checks:

```bash
curl http://localhost:3001/health
curl http://YOUR_MAC_LAN_IP:3001/health
```

Transcription curl example:

```bash
curl -X POST http://localhost:3001/speech/transcribe \
  -F "audio=@/path/to/test-audio.m4a" \
  -F "language=de" \
  -F "expectedText=Ich heiße Toprak."
```

Android Expo Go test:

1. Ensure phone and Mac are on the same Wi-Fi.
2. Set `EXPO_PUBLIC_AI_BACKEND_URL` to the Mac LAN IP, not `localhost`.
3. Open speaking practice.
4. Record, stop, and replay a German sentence.
5. Confirm transcript appears.
6. Confirm transcript comparison feedback appears.
7. Stop the backend and repeat to confirm local fallback behavior works.
8. Export the alpha event log and confirm speech events do not include transcript text or audio URI.

iOS STT debug checklist:

1. Confirm iPhone and Mac are on the same Wi-Fi.
2. Run `ipconfig getifaddr en0` on the Mac and open `http://YOUR_MAC_LAN_IP:3001/health` in iPhone Safari.
3. Confirm `EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001` in the Expo/mobile env.
4. Restart Expo with `--clear` after env changes.
5. Open speaking practice, hold the mic, speak, and release.
6. Watch backend logs for the `/speech/transcribe` endpoint hit.
7. In development, open the SpeakingPractice `Speech debug` panel and check platform, state, stage, extension, MIME type, backend reachability, HTTP status, provider, fallback, and transcript length.
8. The debug panel must not show transcript text, expected sentence, audio URI, or API keys.

Fallback behavior:

- Missing `OPENAI_API_KEY`: backend returns a local fallback transcript and marks it internally with `provider: "mock"` and `modelUsed: "mock:missing-openai-key"`.
- OpenAI failure: backend returns a local fallback transcript with an internal `mock:<reason>:<model>` diagnostic marker.
- Mobile upload failure or timeout: app falls back to a local transcript estimate and logs safe speech fallback events.

STT quota troubleshooting:

If `/speech/transcribe` returns `modelUsed: "mock:openai-http-429:gpt-4o-mini-transcribe"` and OpenAI reports `errorCode: "insufficient_quota"`, the backend is configured correctly but OpenAI rejected the request for account/project quota or billing reasons.

Check:

- OpenAI API billing is active for the project that owns the key.
- The project has budget/usage limits that allow transcription requests.
- The key in `.env` belongs to the paid OpenAI API project.
- ChatGPT subscription billing is separate from OpenAI API billing.

After fixing billing, create a fresh API key in the paid project, update `.env`, and restart the backend with `npm run server:dev`.

## Troubleshooting Local AI Fallback In Expo Go

If the app returns the local Wolli fallback while backend curl works:

1. Confirm the backend is running:

```bash
npm run server:dev
```

2. Confirm your phone can reach the backend over LAN. Replace `YOUR_MAC_LAN_IP` with the current IP from `ipconfig getifaddr en0`:

```bash
curl http://YOUR_MAC_LAN_IP:3001/health
```

Expected response:

```json
{"ok":true,"service":"wortweg-ai"}
```

3. In `.env`, set the mobile URL with the `EXPO_PUBLIC_` prefix:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001
EXPO_PUBLIC_AI_TIMEOUT_MS=30000
```

Keep this separate from server/internal usage:

```bash
AI_BACKEND_URL=http://localhost:3001
```

4. Restart Expo after `.env` changes and clear Metro cache:

```bash
npm start -- --clear
```

5. Watch the Expo logs for `[WortWeg AI]`. In development, the app logs the backend URL, request mode, timeoutMs, response time, HTTP status, timeout errors, network errors, and whether local fallback was used.

6. Test the AI endpoint from your Mac or another LAN device:

```bash
curl -s -X POST http://YOUR_MAC_LAN_IP:3001/ai/teacher \
  -H 'Content-Type: application/json' \
  -d '{"mode":"chat","level":"A1","userMessage":"Hallo","targetLanguage":"German","nativeLanguage":"Turkish","conversationHistory":[],"context":{}}'
```

## Speaking Practice Recording

The speaking practice flow uses `expo-audio` for local recording and replay in Expo Go. German transcription uploads audio to the WortWeg backend when configured; real phonetic pronunciation scoring is not connected yet.

Current behavior:

- asks for microphone permission on device
- records audio locally
- stops and stores the local recording URI
- replays the local recording
- uploads audio to `/speech/transcribe` for German transcript when backend is reachable
- falls back to a local transcript estimate when backend/OpenAI is unavailable
- returns transcript-comparison feedback

Test on Android Expo Go:

```bash
npm start -- --clear
```

Then open WortWeg, tap `Sesli cümle pratiği` on Home, and verify:

- permission prompt appears
- record starts
- stop creates an audio URI
- replay plays the recording
- backend transcript or local fallback transcript appears
- transcript-comparison feedback appears
- bottom safe area remains clear

Limitations:

- transcription requires the local backend and server-side `OPENAI_API_KEY`; otherwise it falls back to a local transcript estimate
- real phonetic pronunciation scoring is not connected yet
- no paid speech API keys are used in the mobile app

Next step for speech: keep this backend provider abstraction and add Azure Pronunciation Assessment or another scoring provider server-side.

## Azure Pronunciation Assessment Later

Keep Azure keys server-side. The app should upload or stream audio to a backend endpoint. That backend endpoint can call Azure Speech / Pronunciation Assessment using:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Then return a typed pronunciation result to `scorePronunciation(audioUri, expectedText)`.

## Supabase Later

Local state is centralized in `src/lib/storage.ts`. When Supabase is added, keep AsyncStorage as an offline cache and sync:

- auth profile
- XP and streak
- lesson progress
- SRS cards
- mistakes notebook
- chat history if desired

## Private Alpha Test

This private alpha is for 3-5 trusted testers using Expo Go on a real phone. Use Node `22.22.3` and keep backend/API keys local to the developer machine.

Who should test:

- Turkish speakers who are new to German or around A1.
- One tester on Android Expo Go, if possible.
- People willing to report confusing copy, broken flows, and screenshots without sharing secrets.

Setup commands:

```bash
nvm use
npm install
cp .env.example .env
```

Configure `.env` locally:

- Put backend-only keys in `.env`: `GEMINI_API_KEY` and `OPENAI_API_KEY`.
- Set `EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001` for Expo Go on a phone.
- Do not put API keys in app source, screenshots, chat messages, or feedback reports.

Start backend and Expo in separate terminals:

```bash
npm run server:dev
PATH=/Users/squall/.nvm/versions/node/v22.22.3/bin:$PATH npx expo start --clear --port 8083
```

Quick backend checks:

```bash
curl http://localhost:3001/health
curl http://YOUR_MAC_LAN_IP:3001/health
```

Reset app for a fresh-user test:

- Open `Profil`.
- Tap `Geliştirici: Uygulama verisini sıfırla` in development builds.
- Confirm onboarding appears again.

Alpha test checklist:

1. Complete onboarding without placement and confirm Home opens.
2. Kill and reopen Expo Go; confirm Home opens again, not onboarding.
3. Reset, complete onboarding with placement, accept the recommendation, then confirm Home opens.
4. Start A0.1 from Home, answer at least one question wrong, finish the lesson, and confirm XP/progress updates.
5. Open Kelime review and Hatalarım.
6. Open CurriculumMap and confirm A0/A1/A2 lessons open, B1 shows only the five optional “B1 Ön İzleme” lessons, and full B1/B2 modules show coming-soon behavior.
7. Open AI chat and send a short A1 message.
8. Open speaking practice, press and hold the microphone, speak, release, replay, and confirm:
   - Release starts the animated analysis state.
   - Beklenen cümle is visible.
   - Söylediğin cümle shows the real transcript.
   - Hedefe yakınlık shows one simple score.
   - Pratik geri bildirimi is clear.
9. Open Profile, export the alpha event log, and send feedback.

Before testing speech on iPhone:

- Run `ipconfig getifaddr en0` on the Mac, then open http://YOUR_MAC_LAN_IP:3001/health in iPhone Safari.
- If it does not open, fix same Wi-Fi, firewall, or the Mac LAN IP before testing speech.
- Confirm .env uses EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_MAC_LAN_IP:3001 and restart Expo with --clear after changing it.

Platform checks:

- iOS: onboarding has one progress indicator, top/bottom safe areas are clear, press-and-hold speech records, release starts analysis, replay works, and transcript appears.
- Android: status/nav bars do not overlap UI, onboarding reaches Home, kill/reopen stays on Home, A0.1 works, and speech record/release/replay/transcript works.

How to report bugs:

- Phone model and OS version.
- Exact step where it failed.
- What you expected and what happened.
- Screenshot or short video if helpful.
- Exported alpha event log from Profile.
- Do not send API keys, .env screenshots, terminal secrets, audio files, or private text.

Privacy expectations:

- Local alpha logs stay on the device until manually shared.
- Logs do not include transcript text, expected sentence text, audio URI, audio files, API keys, location, contacts, chat messages, or free-text lesson answers.
- Safe metadata may include labels like route, lessonId, result, provider, fallback, durationMs, and similarityBucket.

Known alpha limitations:

- A0/A1/A2 lessons are playable. Five optional limited “B1 Ön İzleme” lessons are available; full B1/B2 tracks remain curriculum metadata and are marked as coming soon.
- Speaking transcript uses backend OpenAI STT and requires local backend reachability plus OpenAI API quota.
- Speaking feedback is transcript-comparison based, not real phonetic pronunciation scoring.
- This is Expo Go/dev-build testing only for now.
- No accounts, Supabase sync, or cloud progress backup yet.
- Feedback opens a mail draft/template; there is no feedback backend yet.
- AI chat needs the local backend and falls back to a local Wolli response if unavailable.

See also: `docs/alpha-test-checklist.md` for a short tester-facing Turkish checklist, `docs/backend-roadmap.md` for future public backend planning, and `docs/language-app-ux-research.md` for high-level UX research notes.

## Product Notes

- User-facing explanations and feedback are in Turkish.
- German content currently covers playable A0, A1, and A2 lessons, plus five optional limited “B1 Ön İzleme” lessons.
- Exam text is described as “A1 sınav tarzı pratik,” not as an official Goethe/telc/ÖSD product.
- All included lesson and exam content is original starter content.
