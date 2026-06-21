export type RecordingVoiceEvidenceLevel = 'none' | 'weak' | 'strong';

export type RecordingVoiceEvidenceReason =
  | 'too_short'
  | 'silent'
  | 'low_energy'
  | 'steady_noise'
  | 'voice_like'
  | 'unknown_metering';

export type RecordingVoiceEvidence = {
  shouldUpload: boolean;
  evidenceLevel: RecordingVoiceEvidenceLevel;
  reason: RecordingVoiceEvidenceReason;
  durationMs: number;
  sampleCount: number;
  aboveThresholdCount: number;
  aboveThresholdRatio: number;
  voiceDetected: boolean | null;
  meteringSampleCount: number;
  loudSampleCount: number;
  peakMetering?: number;
  quietestMetering?: number;
  meteringRange?: number;
};

const MIN_LOCAL_VOICE_DURATION_MS = 900;
const MIN_METERING_SAMPLE_COUNT = 5;
const METERING_LOUD_THRESHOLD_DB = -68;
const METERING_PEAK_THRESHOLD_DB = -58;
const MIN_LOUD_METERING_SAMPLES = 2;
const MIN_LOUD_METERING_RATIO = 0.12;
const MIN_METERING_RANGE_DB = 6;

export const analyzeRecordingVoiceEvidence = ({
  durationMs,
  meteringSamples,
}: {
  durationMs: number;
  meteringSamples: number[];
}): RecordingVoiceEvidence => {
  const safeSamples = meteringSamples.filter((sample) => Number.isFinite(sample));
  const sampleCount = safeSamples.length;
  const peakMetering = sampleCount > 0 ? Math.max(...safeSamples) : undefined;
  const quietestMetering = sampleCount > 0 ? Math.min(...safeSamples) : undefined;
  const meteringRange =
    peakMetering === undefined || quietestMetering === undefined
      ? undefined
      : Math.max(0, peakMetering - quietestMetering);
  const aboveThresholdCount = safeSamples.filter((sample) => sample >= METERING_LOUD_THRESHOLD_DB).length;
  const aboveThresholdRatio = sampleCount > 0 ? aboveThresholdCount / sampleCount : 0;

  const makeEvidence = (
    evidenceLevel: RecordingVoiceEvidenceLevel,
    reason: RecordingVoiceEvidenceReason,
  ): RecordingVoiceEvidence => ({
    shouldUpload: evidenceLevel === 'strong',
    evidenceLevel,
    reason,
    durationMs,
    sampleCount,
    aboveThresholdCount,
    aboveThresholdRatio,
    voiceDetected: evidenceLevel === 'strong' ? true : evidenceLevel === 'none' ? false : null,
    meteringSampleCount: sampleCount,
    loudSampleCount: aboveThresholdCount,
    peakMetering,
    quietestMetering,
    meteringRange,
  });

  if (durationMs < MIN_LOCAL_VOICE_DURATION_MS) {
    return makeEvidence('none', 'too_short');
  }

  if (sampleCount === 0 || sampleCount < MIN_METERING_SAMPLE_COUNT) {
    return makeEvidence('weak', 'unknown_metering');
  }

  if (aboveThresholdCount === 0) {
    return makeEvidence('none', 'silent');
  }

  if (
    aboveThresholdCount < MIN_LOUD_METERING_SAMPLES ||
    aboveThresholdRatio < MIN_LOUD_METERING_RATIO ||
    (peakMetering ?? -Infinity) < METERING_PEAK_THRESHOLD_DB
  ) {
    return makeEvidence('weak', 'low_energy');
  }

  if ((meteringRange ?? 0) < MIN_METERING_RANGE_DB) {
    return makeEvidence('weak', 'steady_noise');
  }

  return makeEvidence('strong', 'voice_like');
};
