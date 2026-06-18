import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import multer from 'multer';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const uploadDir = path.join(os.tmpdir(), 'wortweg-speech-uploads');
const allowedExtensions = new Set(['.m4a', '.mp3', '.mp4', '.wav', '.webm', '.mpeg', '.mpga']);
const allowedMimeTypes = new Set([
  'audio/m4a',
  'audio/mp3',
  'audio/mp4',
  'audio/mpeg',
  'audio/mpga',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/webm',
  'video/mp4',
  'video/webm',
  'application/octet-stream',
]);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_request, file, callback) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.m4a';
    callback(null, 'speech-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + ext);
  },
});

export const isAllowedAudioUpload = (file: Express.Multer.File) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimeType = (file.mimetype || '').toLowerCase();

  return allowedExtensions.has(extension) || allowedMimeTypes.has(mimeType);
};

export const speechUpload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (!isAllowedAudioUpload(file)) {
      callback(new Error('unsupported-audio-format'));
      return;
    }

    callback(null, true);
  },
});

export const getUploadSizeLimitBytes = () => MAX_UPLOAD_BYTES;
