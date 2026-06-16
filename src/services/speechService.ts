import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';
import { Platform } from 'react-native';

export type MicrophonePermissionResult = {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
};

export type RecordingResult = {
  uri: string;
  durationMs: number;
};

export type TranscriptionResult = {
  transcript: string;
  confidence: number;
};

export type WordPronunciationFeedback = {
  word: string;
  issue: string;
  suggestionTr: string;
};

export type PronunciationScore = {
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  feedbackTr: string;
  wordFeedback: WordPronunciationFeedback[];
};

type RecorderStatusSnapshot = {
  isRecording: boolean;
  durationMs: number;
};

let activeRecorder: AudioRecorder | null = null;
let activeStopPromise: Promise<RecordingResult> | null = null;
let isStarting = false;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const logAndroidAudio = (message: string, details?: Record<string, unknown>) => {
  if (Platform.OS !== 'android' || process.env.NODE_ENV === 'production') {
    return;
  }

  console.log('[WortWeg Audio]', message, details ?? {});
};

const setPlaybackMode = async () => {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
};

const setRecordingMode = async () => {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
};

const getRecorderLogId = (recorder: AudioRecorder | null) => {
  if (!recorder) {
    return 'none';
  }

  try {
    return recorder.id;
  } catch {
    return 'released';
  }
};

const releaseRecorder = (recorder: AudioRecorder | null) => {
  if (!recorder) {
    return;
  }

  const recorderId = getRecorderLogId(recorder);

  try {
    recorder.release();
    logAndroidAudio('recorder released', { id: recorderId });
  } catch (error) {
    logAndroidAudio('recorder release ignored', {
      id: recorderId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
};

const createRecorder = () => {
  const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
  logAndroidAudio('recorder created', { id: getRecorderLogId(recorder) });
  return recorder;
};

export const requestMicrophonePermission = async (): Promise<MicrophonePermissionResult> => {
  const permission = await requestRecordingPermissionsAsync();

  logAndroidAudio('permission state', {
    status: permission.status,
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  });

  return {
    granted: permission.granted,
    status: permission.status,
    canAskAgain: permission.canAskAgain,
  };
};

export const startRecording = async (): Promise<void> => {
  if (isStarting) {
    throw new Error('Kayıt zaten başlatılıyor.');
  }

  if (activeRecorder || activeStopPromise) {
    throw new Error('Devam eden bir kayıt işlemi var.');
  }

  isStarting = true;
  let recorder: AudioRecorder | null = null;

  try {
    await setRecordingMode();
    recorder = createRecorder();
    await recorder.prepareToRecordAsync();
    recorder.record();
    activeRecorder = recorder;
    logAndroidAudio('recording started', { id: getRecorderLogId(recorder) });
  } catch (error) {
    releaseRecorder(recorder);
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('recording start error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    isStarting = false;
  }
};

export const getActiveRecordingStatus = (): RecorderStatusSnapshot => {
  const recorder = activeRecorder;

  if (!recorder) {
    return { isRecording: false, durationMs: 0 };
  }

  try {
    const status = recorder.getStatus();
    return {
      isRecording: status.isRecording,
      durationMs: status.durationMillis,
    };
  } catch (error) {
    logAndroidAudio('status read error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return { isRecording: false, durationMs: 0 };
  }
};

export const stopRecording = async (): Promise<RecordingResult> => {
  if (activeStopPromise) {
    logAndroidAudio('stop already in progress');
    return activeStopPromise;
  }

  const recorder = activeRecorder;

  if (!recorder) {
    throw new Error('Durdurulacak aktif kayıt yok.');
  }

  activeStopPromise = (async () => {
    const recorderId = getRecorderLogId(recorder);

    activeRecorder = null;
    logAndroidAudio('stop requested', { id: recorderId });

    try {
      const statusBeforeStop = recorder.getStatus();
      const stopResult = (await recorder.stop()) as unknown as {
        durationMillis?: number;
        url?: string | null;
      };
      const uri = stopResult?.url ?? statusBeforeStop.url ?? '';
      const durationMs =
        stopResult?.durationMillis ?? statusBeforeStop.durationMillis ?? 0;

      if (!uri) {
        throw new Error('Recording finished but no audio file URI was returned.');
      }

      logAndroidAudio('stop completed', {
        id: recorderId,
        durationMs,
        audioUri: uri,
      });

      return { uri, durationMs };
    } catch (error) {
      logAndroidAudio('stop error', {
        id: recorderId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      activeRecorder = null;
      releaseRecorder(recorder);
      activeStopPromise = null;
      await setPlaybackMode().catch((error) => {
        logAndroidAudio('playback mode restore error', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      });
    }
  })();

  return activeStopPromise;
};

export const cleanupRecording = async (): Promise<void> => {
  logAndroidAudio('cleanup requested');

  if (activeStopPromise) {
    await activeStopPromise.catch(() => undefined);
    return;
  }

  const recorder = activeRecorder;
  const recorderId = getRecorderLogId(recorder);
  activeRecorder = null;

  if (!recorder) {
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('cleanup completed', { hadRecorder: false });
    return;
  }

  try {
    if (recorder.isRecording) {
      await recorder.stop();
    }
  } catch (error) {
    logAndroidAudio('cleanup stop ignored', {
      id: recorderId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  } finally {
    releaseRecorder(recorder);
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('cleanup completed', { hadRecorder: true });
  }
};

export const replayRecording = async (audioUri: string): Promise<void> => {
  if (!audioUri) {
    throw new Error('No audio recording is available to replay.');
  }

  try {
    await setPlaybackMode();
    const player = createAudioPlayer({ uri: audioUri });
    logAndroidAudio('replay started', { audioUri });
    player.play();

    setTimeout(() => {
      try {
        player.remove();
        logAndroidAudio('replay player removed');
      } catch (error) {
        logAndroidAudio('replay remove ignored', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }, 30_000);
  } catch (error) {
    logAndroidAudio('replay error', {
      audioUri,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const transcribeGerman = async (
  audioUri: string,
): Promise<TranscriptionResult> => {
  // TODO: real transcription should call a backend speech endpoint, not expose keys.
  await wait(650);

  return {
    transcript: audioUri
      ? 'Ich heiße Toprak und ich wohne in Istanbul.'
      : '',
    confidence: audioUri ? 0.92 : 0,
  };
};

export const scorePronunciation = async (
  audioUri: string,
  expectedText: string,
): Promise<PronunciationScore> => {
  // TODO: pronunciation scoring should call Azure Pronunciation Assessment via backend.
  await wait(850);

  if (!audioUri || !expectedText) {
    return {
      pronunciationScore: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      feedbackTr: 'Ses kaydı veya hedef cümle bulunamadı.',
      wordFeedback: [],
    };
  }

  return {
    pronunciationScore: 84,
    accuracyScore: 88,
    fluencyScore: 76,
    completenessScore: 90,
    feedbackTr:
      "Çok iyi. 'heiße' kelimesini biraz daha net söyle ve cümleyi daha akıcı oku.",
    wordFeedback: [
      {
        word: 'heiße',
        issue: 'Biraz belirsiz telaffuz edildi.',
        suggestionTr: "ß sesini 's' gibi net söyle.",
      },
    ],
  };
};
