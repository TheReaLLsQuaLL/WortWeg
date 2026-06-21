# Azure Pronunciation Prototype Design

This document plans a future backend-only Azure Pronunciation Assessment prototype for WortWeg. It is a planning artifact only. It does not implement Azure, install packages, change environment files, or change the current speech path.

## 1. Current Speech Architecture

- The Expo app records audio with the existing press-and-hold speaking flow.
- The mobile app uploads the recording to the local backend endpoint `/speech/transcribe`.
- The backend uses OpenAI STT as the current transcription path.
- The app compares the returned transcript against the expected German sentence.
- Hybrid Speech Scoring v1 currently gives transcript-based feedback:
  - doğru kelimeler
  - eksik kelimeler
  - fazla kelimeler
  - kelime sırası when simple and reliable
  - tekrar önerisi
- There is no phoneme-level or provider pronunciation scoring yet.
- Current transcript-based scoring can give 100 for slow but word-correct speech. It does not score accent quality, natural speed, fluency, prosody, or rhythm.
- Provider, model, endpoint, and network details must never be visible to normal users.
- Raw transcripts and `audioUri` must not be written to analytics or local event logs.
- `.env` is local, ignored/untracked, and must not be committed.

## 2. Why Azure Later

Azure Pronunciation Assessment may be useful later if it adds feedback that transcript comparison cannot provide:

- pronunciation assessment beyond text matching
- accuracy, fluency, and completeness signals
- a future way to distinguish word-correct but very slow speech from more natural pronunciation, if provider feedback proves reliable
- word-level feedback if it is reliable for short German learner sentences
- future Turkish-speaker German pronunciation tips for sounds such as `ch`, `r`, `ü/ö/ä`, and word stress

The value must be validated with real recordings before any user-facing claim is made.

## 3. Why Not Now

Azure should not be added before the current private-alpha speech flow is validated:

- It adds another provider and more backend complexity.
- It introduces new cost and quota considerations.
- It needs a privacy review for audio and score handling.
- It may require different audio format handling.
- Pronunciation scores can be inconsistent across accents, devices, background noise, and sentence length.
- It is not needed to validate the current OpenAI STT plus transcript-scoring flow.
- It must not break the working OpenAI STT path.

## 4. Prototype Scope

The prototype should be backend-only and hidden behind a DEV or feature flag.

In scope:

- backend-only Azure Pronunciation Assessment spike
- no user-facing Azure claims
- no frontend provider details
- no app dependency on Azure packages or SDKs
- no replacement of OpenAI STT
- normalized backend response shape
- local-only comparison testing first

Out of scope:

- production rollout
- app-side Azure keys
- provider names in normal UI
- phoneme coaching claims before validation

## 5. Proposed Hybrid Architecture

The current OpenAI STT path should remain the reliable transcription path and fallback.

Proposed flow:

1. Mobile app records audio and sends it to the backend.
2. Backend receives the expected sentence and audio file.
3. Backend runs the configured speech mode:
   - `transcript`: OpenAI STT only, current behavior
   - `azure`: Azure assessment only for experimental backend comparison
   - `hybrid`: OpenAI STT plus Azure pronunciation assessment when enabled
4. Backend normalizes the response.
5. Frontend receives provider-neutral fields and renders the same product language.

Provider-neutral response fields:

```json
{
  "transcript": "Ich habe vor, jeden Tag Deutsch zu ueben.",
  "scorePercent": 82,
  "feedbackLevel": "good",
  "wordFeedback": [
    {
      "word": "Deutsch",
      "status": "matched",
      "hintTr": "Bu kelime hedef cümleyle uyumlu."
    }
  ],
  "pronunciationHints": [
    "Birkaç kelimeyi daha yavaş söylemeyi dene."
  ],
  "retrySuggestion": "Cümleyi iki kısa parçaya bölerek tekrar dene."
}
```

The frontend must not display provider names, provider models, Azure endpoint details, or raw diagnostic strings.

## 6. Environment Variables

Use placeholder names only:

```bash
AZURE_SPEECH_KEY=your_server_side_azure_key
AZURE_SPEECH_REGION=your_azure_region
SPEECH_SCORING_PROVIDER=transcript
SPEECH_AZURE_ENABLED=false
```

Rules:

- Never commit `.env`.
- Do not put real keys in docs.
- Do not put Azure keys in the mobile app.
- Keep Azure keys only on the backend host.
- Default behavior should remain `SPEECH_SCORING_PROVIDER=transcript` until the prototype is explicitly enabled.

## 7. Privacy Rules

The prototype must preserve WortWeg's current privacy posture:

- Do not log raw audio.
- Do not log `audioUri`.
- Do not log raw transcripts unless there is an explicit privacy review and product decision.
- Do not expose provider, model, endpoint, or network internals to normal users.
- Delete temporary audio after processing when applicable.
- Keep DEV diagnostics collapsed and manually expandable.

Safe metadata for internal logs:

- duration bucket or duration in milliseconds
- transcript length
- score bucket
- provider mode for internal diagnostics only
- platform
- audio extension and MIME type
- error category without secrets

## 8. API Design Sketch

Prefer keeping `/speech/transcribe` stable if the frontend can keep receiving a compatible response. If the prototype needs a separate contract, add `/speech/assess` behind a backend feature flag.

### Option A - Keep `/speech/transcribe`

Future request shape stays close to current upload behavior:

```http
POST /speech/transcribe
Content-Type: multipart/form-data

audio=<file>
expectedText=Ich habe vor, jeden Tag Deutsch zu ueben.
mode=hybrid
```

Future response sketch:

```json
{
  "transcript": "Ich habe vor jeden Tag Deutsch zu ueben.",
  "scorePercent": 84,
  "feedbackLevel": "good",
  "matchedWords": ["Ich", "habe", "vor", "jeden", "Tag", "Deutsch", "zu", "ueben"],
  "missingWords": [],
  "extraWords": [],
  "wordFeedback": [
    {
      "word": "vor",
      "status": "review",
      "hintTr": "Bu parçayı kısa bir duraklamayla tekrar et."
    }
  ],
  "pronunciationHints": [
    "Cümleyi daha sakin ve eşit hızda söyle."
  ],
  "retrySuggestion": "Önce 'Ich habe vor' kısmını, sonra devamını söyle."
}
```

### Option B - Add `/speech/assess`

This endpoint would be used only in DEV or internal testing:

```http
POST /speech/assess
Content-Type: multipart/form-data

audio=<file>
expectedText=Könnten Sie mir bitte helfen?
mode=azure
```

Response shape should still be provider-neutral:

```json
{
  "transcript": "Koennten Sie mir bitte helfen?",
  "scorePercent": 78,
  "feedbackLevel": "needsPractice",
  "wordFeedback": [],
  "pronunciationHints": [
    "Soru cümlesini daha yavaş söylemeyi dene."
  ],
  "retrySuggestion": "Önce kısa parçalar halinde tekrar et."
}
```

All sample data above is fake placeholder data.

## 9. Testing Plan

Start local-only. Do not expose the prototype to testers until quality and privacy are reviewed.

Test areas:

- Compare current OpenAI transcript result against Azure assessment output.
- Use short German sample sentences from existing WortWeg lesson prompts.
- Test clean recordings, quiet room recordings, and realistic phone recordings.
- Check Turkish-speaker edge cases:
  - `ch`
  - `r`
  - `ü/ö/ä`
  - word stress
- Confirm no raw transcript, `audioUri`, or audio file path is written to logs.
- Confirm temp audio cleanup still works.
- Confirm OpenAI STT remains functional when Azure is disabled or fails.
- Confirm normal UI never exposes provider names or diagnostics.

Quality gates before rollout:

- Azure output should add useful feedback beyond transcript comparison.
- Scores should be stable enough across repeated recordings.
- Feedback should be understandable in Turkish.
- False confidence should be avoided.
- Cost and latency should be acceptable.

## 10. Rollout Plan

### Phase 1 - Design doc only

- Keep this document as the planning reference.
- No code, packages, environment changes, or product claims.

### Phase 2 - Backend spike behind feature flag

- Add backend-only Azure prototype behind `SPEECH_AZURE_ENABLED=false`.
- Keep current OpenAI STT route working.
- Use placeholder-safe docs and local `.env` only.

### Phase 3 - Internal DEV comparison panel

- Compare transcript scoring and Azure scoring internally.
- Keep DEV diagnostics collapsed.
- Do not show provider details to normal users.

### Phase 4 - Provider-neutral UI experiment

- If Azure feedback is useful, test a UI that receives normalized categories only.
- Keep the app language focused on Turkish feedback and retry suggestions.

### Phase 5 - Production hardening only if useful

- Add rate limits, request size limits, error handling, monitoring, and cost controls.
- Review privacy policy implications.
- Keep OpenAI STT fallback.

## 11. Non-Goals

- No Azure implementation now.
- No replacing OpenAI STT now.
- No user-facing Azure or pronunciation-score claims yet.
- No advanced phoneme coaching until validated.
- No mobile Azure SDK dependency.
- No cloud accounts required.
- No provider/model/endpoint details in the app UI.

## 12. Next Implementation Prompt

Prototype Azure pronunciation assessment behind backend feature flag.
