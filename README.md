# WortWeg

WortWeg is a mobile-first German learning MVP for Turkish speakers. It uses Expo React Native, TypeScript, React Navigation, local AsyncStorage persistence, original CEFR A1 content, SRS vocabulary review, a secure local AI backend wrapper for Gemini text feedback, and placeholder speech/pronunciation services.

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
- If AI chat returns a mock reply, confirm `EXPO_PUBLIC_AI_BACKEND_URL` uses the LAN IP, then restart Expo with `npm start -- --clear`.
- Gemini keys stay only in `.env` on the backend side. The mobile app must never contain `GEMINI_API_KEY`.

## Install

```bash
npm install
```

Copy `.env.example` to `.env`. Do not expose real API keys in the mobile app.

```bash
cp .env.example .env
```

Put `GEMINI_API_KEY` only in `.env` for the backend server. For Expo Go on a real phone, set `EXPO_PUBLIC_AI_BACKEND_URL` to your Mac LAN URL, for example `http://192.168.1.8:3001`. The backend URL is not secret; the Gemini key is secret.

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
- The A1 learning path is built from `src/data/lessons.a1.ts`.
- Exam practice content is original and lives in `src/data/exam.a1.ts`.
- Lesson completion awards XP, updates local-date streaks, adds SRS cards, and records mistakes.
- SRS review uses `src/lib/srs.ts`.
- AI chat, exam answer feedback, writing feedback, and speaking feedback call the local backend when configured, and fall back to mock responses when unavailable.
- Speech recording/replay is local, German transcription can use the secure backend, and pronunciation scoring is still mocked in `src/services/speechService.ts`.

## AI Service Boundary

The mobile app never calls Gemini directly. It calls the WortWeg backend URL from `EXPO_PUBLIC_AI_BACKEND_URL`. Mobile AI requests use `EXPO_PUBLIC_AI_TIMEOUT_MS`, defaulting to `30000` ms:

```ts
await fetch(`${process.env.EXPO_PUBLIC_AI_BACKEND_URL}/ai/teacher`, {
  method: 'POST',
  body: JSON.stringify(input),
});
// Timeout defaults to EXPO_PUBLIC_AI_TIMEOUT_MS=30000.
```

Do not use `AI_BACKEND_URL` in mobile code. `AI_BACKEND_URL` is for server/internal tooling; Expo only exposes variables prefixed with `EXPO_PUBLIC_`. The server in `server/` reads `GEMINI_API_KEY`, calls Gemini, validates the response with Zod, and returns a stable JSON contract to the app. If the mobile backend URL is missing, fetch fails, or the response is invalid, the app falls back to mock feedback. If Gemini itself fails server-side, the server returns schema-valid mock feedback.

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
- Mock responses use `mock:<reason>:<model>`.

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

# Expo Go on a physical phone. Use the LAN IP shown by Expo.
EXPO_PUBLIC_AI_BACKEND_URL=http://192.168.1.8:3001
EXPO_PUBLIC_AI_TIMEOUT_MS=30000
EXPO_PUBLIC_SPEECH_TIMEOUT_MS=45000
```

Use `localhost` only for simulator/web or curl commands running on the same Mac. For Expo Go on a physical phone, `localhost` means the phone itself, so use your computer LAN IP.


## Speech-to-text Backend

WortWeg speaking practice now sends recorded audio through the secure backend for German transcription:

```text
mobile recording -> WortWeg backend -> OpenAI transcription -> backend response -> mobile transcript
```

The mobile app never calls OpenAI directly and never contains `OPENAI_API_KEY`. Pronunciation scoring is still mocked in the app after the transcript returns. Uploaded audio is handled as a temporary backend file and is deleted after transcription/fallback.

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
curl http://192.168.1.8:3001/health
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
6. Confirm pronunciation scores still appear as mock scores.
7. Stop the backend and repeat to confirm local mock fallback works.
8. Export the alpha event log and confirm speech events do not include transcript text or audio URI.

Fallback behavior:

- Missing `OPENAI_API_KEY`: backend returns a mock transcript with `provider: "mock"` and `modelUsed: "mock:missing-openai-key"`.
- OpenAI failure: backend returns a mock transcript with a `mock:<reason>:<model>` model marker.
- Mobile upload failure or timeout: app falls back to the local mock transcript and logs safe speech fallback events.

STT quota troubleshooting:

If `/speech/transcribe` returns `modelUsed: "mock:openai-http-429:gpt-4o-mini-transcribe"` and OpenAI reports `errorCode: "insufficient_quota"`, the backend is configured correctly but OpenAI rejected the request for account/project quota or billing reasons.

Check:

- OpenAI API billing is active for the project that owns the key.
- The project has budget/usage limits that allow transcription requests.
- The key in `.env` belongs to the paid OpenAI API project.
- ChatGPT subscription billing is separate from OpenAI API billing.

After fixing billing, create a fresh API key in the paid project, update `.env`, and restart the backend with `npm run server:dev`.

## Troubleshooting Mock AI In Expo Go

If the app returns the mock AI placeholder while backend curl works:

1. Confirm the backend is running:

```bash
npm run server:dev
```

2. Confirm your phone can reach the backend over LAN. Replace the IP with the LAN IP shown by Expo:

```bash
curl http://192.168.1.8:3001/health
```

Expected response:

```json
{"ok":true,"service":"wortweg-ai"}
```

3. In `.env`, set the mobile URL with the `EXPO_PUBLIC_` prefix:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://192.168.1.8:3001
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

5. Watch the Expo logs for `[WortWeg AI]`. In development, the app logs the backend URL, request mode, timeoutMs, response time, HTTP status, timeout errors, network errors, and whether mock fallback was used.

6. Test the AI endpoint from your Mac or another LAN device:

```bash
curl -s -X POST http://192.168.1.8:3001/ai/teacher \
  -H 'Content-Type: application/json' \
  -d '{"mode":"chat","level":"A1","userMessage":"Hallo","targetLanguage":"German","nativeLanguage":"Turkish","conversationHistory":[],"context":{}}'
```

## Speaking Practice Recording

The speaking practice flow uses `expo-audio` for local recording and replay in Expo Go. German transcription uploads audio to the WortWeg backend when configured; pronunciation scoring remains mocked.

Current behavior:

- asks for microphone permission on device
- records audio locally
- stops and stores the local recording URI
- replays the local recording
- uploads audio to `/speech/transcribe` for German transcript when backend is reachable
- falls back to a local mock transcript when backend/OpenAI is unavailable
- returns mocked pronunciation scores

Test on Android Expo Go:

```bash
npm start -- --clear
```

Then open WortWeg, tap `Sesli cümle pratiği` on Home, and verify:

- permission prompt appears
- record starts
- stop creates an audio URI
- replay plays the recording
- backend transcript or DEV fallback transcript appears
- mock pronunciation feedback appears
- bottom safe area remains clear

Limitations:

- transcription requires the local backend and server-side `OPENAI_API_KEY`; otherwise it falls back to a mock transcript
- pronunciation scoring is mocked in `src/services/speechService.ts`
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

## Alpha Testing Checklist

Use Node `22.22.3` for the first private alpha pass. Keep the backend and Expo running in separate terminals.

Setup:

```bash
nvm use
npm install
cp .env.example .env
npm run server:dev
npm start -- --clear
```

For Expo Go on a real phone, set `EXPO_PUBLIC_AI_BACKEND_URL` in `.env` to your computer LAN IP, for example `http://192.168.1.8:3001`, then restart Expo with `--clear`.

Reset before a fresh-user test:

- Open `Profil`.
- In development builds, tap `Geliştirici: Uygulama verisini sıfırla`.
- Confirm that onboarding appears again.

Real-device persistence test:

1. Open `Profil` and tap `Geliştirici: Uygulama verisini sıfırla`.
2. Complete onboarding without placement.
3. Confirm the app lands on Home.
4. Kill Expo Go fully.
5. Reopen the app from Expo Go.
6. Confirm Home opens, not onboarding.
7. Open `Profil` -> `Debug: Onboarding durumunu göster` and confirm `hasCompletedOnboarding: true`, `hasLearningPlan: true`, and route `Main/Home`.
8. Developer reset again.
9. Complete onboarding with placement.
10. Accept the recommended level.
11. Confirm Home opens.
12. Kill and reopen Expo Go.
13. Confirm Home opens again.
14. Export the local alpha event log and check for `app_boot_decision` and `route_reset_to_home`.

Flows to test:

- onboarding and optional placement test
- plan creation and PlanOverview
- Home recommendations
- A0.1 lesson start, wrong answer feedback, completion, XP update
- `Sıradaki ders`, `Kelime tekrarı`, and `Ana sayfaya dön` after lesson completion
- SRS review and mistakes notebook
- CurriculumMap A0/A1 playable lesson
- CurriculumMap A2/B1/B2 coming-soon message
- AI chat with backend online and with backend offline fallback
- speaking practice record, stop, replay, mocked transcript/scoring
- Profile reset, feedback draft, local alpha log export, and local alpha log clear

Local alpha event log:

- Open `Profil` -> `Alpha test günlüğü`.
- Tap `Test günlüğünü kopyala` to show a selectable local log.
- Tap `Geri bildirim gönder` to open a feedback draft that can include the copied local log.
- Tap `Test günlüğünü temizle` to remove only the local event log.
- The log stays on the device until the tester manually shares it.

Privacy rules for the local log:

- no external analytics SDK is used
- no events are sent to a server
- no contacts, location, microphone content, audio files, audio URI, transcript text, device fingerprint, API keys, AI prompts/responses, chat messages, placement free text, or lesson answer text are logged
- safe metadata is limited to labels such as `lessonId`, `level`, `moduleId`, `exerciseType`, `result`, `durationMs`, `routeName`, `routeChosen`, `fallbackReason`, and onboarding boot booleans

Feedback to report:

- What were you trying to do?
- What went wrong or felt unclear?
- Screenshot optional.
- Device model and OS version.
- App screen name.

Known alpha limitations:

- A2/B1/B2 modules are curriculum metadata only and show coming-soon behavior.
- Speaking transcription uses the backend when configured; pronunciation scoring is still mocked.
- No Supabase account sync yet; progress is local to the device.
- Feedback opens a mail draft or template; there is no feedback backend yet.
- Local alpha event logs are manually exportable only; there is no analytics backend.
- AI chat needs the local backend and falls back to a local Wolli response if unavailable.

## Product Notes

- User-facing explanations and feedback are in Turkish.
- German content is CEFR A1 first.
- Exam text is described as “A1 sınav pratiği,” not as an official Goethe/telc/ÖSD product.
- All included lesson and exam content is original starter content.
