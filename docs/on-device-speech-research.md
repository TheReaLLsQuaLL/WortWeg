# WortWeg On-Device Speech Research

Status: research/prototype planning only. OpenAI STT through the WortWeg backend remains the stable default until native/on-device STT is proven reliable on real iOS and Android devices.

## Sources checked

- Apple Speech framework docs: SFSpeechRecognizer, supportedLocales(), supportsOnDeviceRecognition, SFSpeechRecognitionRequest.requiresOnDeviceRecognition, requestAuthorization(_:)
  - https://developer.apple.com/documentation/speech
  - https://developer.apple.com/documentation/speech/sfspeechrecognizer/supportedlocales%28%29
  - https://developer.apple.com/documentation/speech/sfspeechrecognizer/supportsondevicerecognition
  - https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition
  - https://developer.apple.com/documentation/speech/sfspeechrecognizer/requestauthorization%28_%3A%29
- Android SpeechRecognizer and RecognizerIntent docs
  - https://developer.android.com/reference/android/speech/SpeechRecognizer
  - https://developer.android.com/reference/android/speech/RecognizerIntent
- Google ML Kit GenAI Speech Recognition docs
  - https://developers.google.com/ml-kit/genai
  - https://developers.google.com/ml-kit/genai/speech-recognition/android
- Gemma 3n and LiteRT docs
  - https://ai.google.dev/gemma/docs/gemma-3n
  - https://developers.google.com/edge/litert
- Expo dev-build/custom-native-code docs
  - https://docs.expo.dev/develop/development-builds/introduction/
  - https://docs.expo.dev/workflow/customizing/

## Comparison

| Provider | Platform | Offline possible? | German support | Expo Go compatible? | Requires dev build? | Estimated app size impact | Latency expectation | Accuracy risk | Cost | Privacy | Implementation difficulty | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI backend STT | iOS + Android | No | Strong cloud German support through current backend model | Yes, because mobile only uploads audio to existing backend | No | Low in app; backend only | Medium; network + upload + API response | Low/medium for A0/A1 sentences; depends on noise/quota | Paid API | Audio leaves device to WortWeg backend then OpenAI | Already implemented | Keep as default for private alpha and first production MVP. |
| iOS native Speech framework | iOS | Yes, if supportsOnDeviceRecognition is true for locale/device and request uses requiresOnDeviceRecognition | Must verify on device with Locale(identifier: de-DE), supportedLocales(), and supportsOnDeviceRecognition | No | Yes: Expo dev client / EAS dev build + Swift native module/config plugin | Low; uses OS speech assets, but device may need language resources | Low if available; can stream partials | Medium/high across devices/locales/noise; German offline availability must be tested | No per-call cost | Best if on-device required; speech stays local when forced | Medium: permissions, lifecycle, audio session, native bridge | Best first iOS native candidate, but only in a separate EAS dev-build branch. |
| Android native SpeechRecognizer | Android | Yes, if isOnDeviceRecognitionAvailable(context) is true and createOnDeviceSpeechRecognizer(context) succeeds | RecognizerIntent.EXTRA_LANGUAGE can request BCP-47 tags like de-DE; real device support varies by recognizer/model install | No | Yes: Expo dev client / EAS dev build + Kotlin native module/config plugin | Low; uses system recognizer/services | Low if recognizer is local and ready | Medium/high because device/OEM/model availability varies; must call destroy and handle lifecycle carefully | No per-call cost | Better if on-device service is used; avoid generic cloud recognizer path | Medium/high: main-thread calls, listener lifecycle, destroy(), manifest queries | Best first Android baseline candidate after iOS prototype, but must remain behind capability detection and OpenAI fallback. |
| ML Kit GenAI Speech Recognition | Android | Yes | Docs list Basic de-DE as beta; Advanced lists de-DE among typically high-accuracy locales, but Advanced currently has narrow device support | No | Yes: EAS dev build + native dependency/config/plugin work | Medium; model may be shared through AICore, but feature download/state must be handled | Low/medium after model ready; first-run may wait for model/status/download | Medium: alpha API, beta language status, Pixel/device restrictions, AICore setup issues | No per-call server cost | Local processing; strong privacy if available | High: alpha API, Kotlin Flow, model status/download, AICore errors, foreground/quota rules | Promising Android experiment later, not for alpha. Test only after native SpeechRecognizer baseline. |
| Gemma / LiteRT custom STT | iOS + Android possible in theory | Yes | Gemma 3n has audio input and broad language training; production STT quality for short German learner utterances must be benchmarked | No | Yes: custom native module, model packaging/download, LiteRT/MediaPipe/LiteRT-LM integration | High/very high: model assets, native runtimes, optional accelerators | Unclear; may be slower and battery-heavy versus platform STT for short utterances | High: model size, RAM, thermal, battery, accuracy, prompt/output parsing | No per-call API cost, but engineering and device cost high | Strong if fully local, but local model storage and processing risks remain | Very high: model conversion/runtime, audio preprocessing, quantization, memory, device matrix | Not worth testing now. Revisit after OpenAI + native OS STT have real device metrics. |

## Detailed notes

### iOS: SFSpeechRecognizer

Apple exposes locale-aware speech recognition through the Speech framework. For WortWeg, the key future checks are:

- Create a recognizer for de-DE and verify it exists.
- Check SFSpeechRecognizer.supportedLocales() and the recognizer supportsOnDeviceRecognition flag.
- Set SFSpeechRecognitionRequest.requiresOnDeviceRecognition = true only when the device supports it. If forced while unsupported, the native path should fail fast and fall back to OpenAI.
- Request both microphone recording permission and speech recognition authorization.
- Keep lifecycle strict: start recognition, stream partial/final result, stop/cancel, release audio engine resources.

Risks:

- German on-device support can vary by iOS version, device, and installed language assets.
- Accuracy may be weaker than OpenAI for Turkish-accented beginner German.
- Expo Go cannot ship a Swift bridge to SFSpeechRecognizer; this requires a dev build.

### Android: SpeechRecognizer

Android platform docs expose two relevant checks:

- SpeechRecognizer.isOnDeviceRecognitionAvailable(context) checks if an on-device recognition service exists.
- SpeechRecognizer.createOnDeviceSpeechRecognizer(context) creates one, but should only be used after availability is confirmed.

Implementation notes for a future Kotlin module:

- Use RecognizerIntent.EXTRA_LANGUAGE = de-DE and LANGUAGE_MODEL_FREE_FORM.
- Call methods on the main thread.
- Set a RecognitionListener before startListening.
- Always call destroy() when finished.
- For Android 11+ visibility, include the speech recognition service query in the manifest if querying services.

Risks:

- OEM/device recognizer behavior varies.
- Installed offline language packs and Google Speech Services state matter.
- Some recognizers may silently ignore extras or return poor partials.

### ML Kit GenAI Speech Recognition

Google documents ML Kit GenAI Speech Recognition as alpha. It supports:

- Basic mode: traditional on-device model, generally available on most Android devices with API 31+.
- Advanced mode: GenAI model with better quality/broader language coverage, currently narrow device support.
- Microphone input or strict PCM file descriptor input.
- German de-DE appears in supported locales, but Basic German is beta and must be evaluated.

Risks:

- Alpha API with possible breaking changes.
- AICore setup/download/status complexity.
- Foreground and battery quotas.
- Not Expo Go compatible.

### Gemma / LiteRT

Gemma 3n is optimized for everyday devices and includes audio input handling, including speech recognition. LiteRT supports on-device ML/GenAI deployment across mobile/edge targets and can run optimized models with hardware acceleration.

For WortWeg, this is not the right first native STT path:

- It is far heavier than OS speech APIs for A0/A1 sentence transcription.
- It requires native runtimes, model packaging or download, audio preprocessing, memory profiling, thermal testing, and broad device QA.
- It may become interesting later if WortWeg wants fully local AI features beyond STT.

## Proposed future abstraction

Do not replace transcribeGerman() yet. The future provider routing should stay behind capability detection:

~~~ts
export type SpeechProvider =
  | "openai"
  | "ios-native"
  | "android-native"
  | "mlkit"
  | "gemma";
~~~

Future fallback order:

1. native/on-device if enabled and available
2. OpenAI backend
3. local fallback

Suggested future API shape:

~~~ts
type SpeechCapability = {
  provider: SpeechProvider;
  available: boolean;
  reason?: string;
  platform: "ios" | "android" | "web" | string;
  requiresDevBuild?: boolean;
};

async function canUseNativeSpeech(): Promise<SpeechCapability>;
async function transcribeWithProvider(input: {
  provider: SpeechProvider;
  audioUri?: string;
  expectedText?: string;
  locale: "de-DE";
}): Promise<TranscriptionResult>;
~~~

Privacy rules remain unchanged: no transcript text, expected sentence, audio URI, API keys, or free user text in local events.

## Expo impact

Native/on-device STT is not an Expo Go feature for WortWeg. Expo Go ships with a fixed set of native libraries, and custom native code requires an Expo development build or custom dev client. For native STT, plan on:

- EAS development build.
- Expo dev client.
- A local Expo module or native library bridge.
- Config plugin for iOS Info.plist speech/microphone permissions and Android manifest queries/permissions.
- A separate branch so current OpenAI STT remains stable.

## Recommendation

- Private alpha: stay cloud-first with the current OpenAI backend STT path. It is already working, cross-platform, and stable enough for testing learning UX.
- First native experiment: iOS SFSpeechRecognizer in a separate EAS dev-build branch. The API is platform-owned, likely low-latency when available, and the device matrix is narrower than Android.
- First Android experiment: platform SpeechRecognizer.createOnDeviceSpeechRecognizer with de-DE, strict lifecycle cleanup, and OpenAI fallback. Test on multiple real phones before exposing to testers.
- ML Kit GenAI: promising but too alpha/device-dependent for the next milestone. Revisit after Android platform native STT metrics.
- Gemma/LiteRT: later. It is overkill for short A0/A1 sentence STT today and should not block alpha or first production MVP.
