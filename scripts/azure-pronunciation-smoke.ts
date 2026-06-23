import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { assessPronunciation } from '../server/azureSpeechClient';
import { getBackendConfig } from '../server/config';

async function main() {
  const { positionals } = parseArgs({
    allowPositionals: true,
  });

  const [audioFilePath, expectedText] = positionals;

  if (!audioFilePath || !expectedText) {
    console.error('Usage: npm run speech:azure:smoke -- <path-to-audio-file> "<expected text>"');
    process.exit(1);
  }

  const config = getBackendConfig();

  if (!config.speechAzureEnabled) {
    console.error('Error: SPEECH_AZURE_ENABLED must be true');
    process.exit(1);
  }

  if (process.env.SPEECH_SCORING_PROVIDER !== 'azure') {
    console.error('Error: SPEECH_SCORING_PROVIDER must be azure');
    process.exit(1);
  }

  if (!config.azureSpeechKeyConfigured || !config.azureSpeechRegion) {
    console.error('Error: Missing required environment variables: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION');
    process.exit(1);
  }

  const extension = path.extname(audioFilePath).toLowerCase();
  
  if (extension === '.m4a') {
    console.error('Error: Azure requires wav/ogg for this test. m4a is not supported by Azure REST directly.');
    process.exit(1);
  }
  
  if (extension !== '.wav' && extension !== '.ogg') {
    console.error(`Error: Unsupported audio format "${extension}". Azure requires wav/ogg for this test.`);
    process.exit(1);
  }

  if (!fs.existsSync(audioFilePath)) {
    console.error(`Error: File not found: ${audioFilePath}`);
    process.exit(1);
  }

  const mimetype = extension === '.wav' ? 'audio/wav' : 'audio/ogg';

  console.log(`\nStarting Azure Pronunciation Assessment Smoke Test...`);
  console.log(`Audio File: ${audioFilePath}`);
  console.log(`Expected Text: ${expectedText}`);
  console.log(`Region: ${config.azureSpeechRegion}\n`);

  try {
    const startedAt = Date.now();
    const result = await assessPronunciation(
      audioFilePath,
      expectedText,
      mimetype,
      config.speechProviderTimeoutMs,
    );
    const durationMs = Date.now() - startedAt;

    console.log('--- Azure Result ---');
    console.log(`Transcript:        ${result.transcript}`);
    console.log(`PronunciationScore: ${result.pronunciationScore}`);
    console.log(`AccuracyScore:      ${result.accuracyScore}`);
    console.log(`FluencyScore:       ${result.fluencyScore}`);
    console.log(`CompletenessScore:  ${result.completenessScore}`);
    console.log(`Confidence:         ${result.confidence}`);
    console.log(`Provider:           azure`);
    console.log(`Fallback:           false`);
    console.log(`Duration:           ${durationMs}ms`);
    console.log('--------------------\n');

  } catch (error) {
    console.error('--- Azure Request Failed ---');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
