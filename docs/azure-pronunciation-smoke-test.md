# Alpha 0.6 Azure Pronunciation Assessment Smoke Test

## Status: Backend Prototype Validated
The Azure Pronunciation Assessment backend prototype is fully implemented and secured behind feature flags (`SPEECH_AZURE_ENABLED`). 

### Audio Format Fallback Note
Current Expo mobile recordings are transmitted as `.m4a` files. Because Azure's short-audio REST endpoint natively requires `.wav` or `.ogg`, the backend router safely intercepts `.m4a` files and forces them to gracefully fallback to OpenAI STT to guarantee zero disruption to the active user experience.

### Manual Smoke-Test Validation
The Azure REST path was isolated and successfully validated using the local developer smoke script (`npm run speech:azure:smoke`) with a verified 16kHz mono `.wav` file. 

**Smoke Result:**
* **Provider**: azure
* **Fallback**: false
* **Transcript**: Ich trinke Wasser.
* **PronunciationScore**: 98.8
* **AccuracyScore**: 98
* **FluencyScore**: 100
* **CompletenessScore**: 100
* **Duration**: ~850ms

### Architecture & Parsing Insight
The Azure REST API response flattens the pronunciation metrics directly onto the `NBest[0]` object rather than nesting them. The backend parser extracts:
* `PronScore`
* `AccuracyScore`
* `FluencyScore`
* `CompletenessScore`

### Next Steps for Full Activation
To activate Azure for mobile clients, we must pursue one of the following approaches:
1. Implement secure, low-latency server-side audio conversion (from `.m4a` to `.wav`/`.ogg`) within Node.js.
2. Execute a controlled mobile recording experiment modifying the React Native `expo-audio` preset to export `.wav` or `.ogg` natively.
