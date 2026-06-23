import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

// Requires `npm install ffmpeg-static`
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

export const convertToAzureWav = async (inputPath: string): Promise<string> => {
  if (!ffmpegStatic) {
    throw new Error('ffmpeg-static binary not found');
  }

  const outputFilename = `azure-conv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.wav`;
  const outputPath = path.join(os.tmpdir(), 'wortweg-speech-uploads', outputFilename);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    // -y: overwrite output
    // -i inputPath: input file
    // -ar 16000: set audio sampling rate to 16kHz
    // -ac 1: set audio channels to 1 (mono)
    // -f wav: force format to wav
    await execFileAsync(
      ffmpegStatic,
      ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', '-f', 'wav', outputPath],
      { timeout: 10_000 }
    );

    return outputPath;
  } catch (error) {
    // Clean up partial output file if ffmpeg failed
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch (cleanupError) {
        // Ignore cleanup error
      }
    }
    
    // Do not leak file paths in the error
    throw new Error('Audio conversion failed: ' + (error instanceof Error ? error.message.split(inputPath).join('<input>') : 'unknown'));
  }
};
