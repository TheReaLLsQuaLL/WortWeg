import { Platform } from 'react-native';

export type AudioUploadInfo = {
  extension: string;
  name: string;
  type: string;
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos';
};

const supportedExtensions = new Set(['m4a', 'mp3', 'mp4', 'wav', 'webm', 'mpeg', 'mpga']);

const mimeByExtension: Record<string, string> = {
  m4a: 'audio/m4a',
  mp3: 'audio/mpeg',
  mp4: 'audio/mp4',
  wav: 'audio/wav',
  webm: 'audio/webm',
  mpeg: 'audio/mpeg',
  mpga: 'audio/mpeg',
};

const getRawExtension = (uri: string) => {
  const cleanUri = uri.split('?')[0]?.split('#')[0] ?? uri;
  const lastSegment = cleanUri.split('/').pop() ?? '';
  const extension = lastSegment.includes('.') ? lastSegment.split('.').pop()?.toLowerCase() : '';

  return extension && extension.length <= 5 ? extension : '';
};

export const inferAudioUploadInfo = (uri: string): AudioUploadInfo => {
  const rawExtension = getRawExtension(uri);
  const extension = supportedExtensions.has(rawExtension) ? rawExtension : 'm4a';
  const type = Platform.OS === 'ios' && extension === 'm4a'
    ? 'audio/mp4'
    : mimeByExtension[extension] ?? 'audio/mp4';

  return {
    extension,
    name: 'wortweg-recording.' + extension,
    type,
    platform: Platform.OS,
  };
};
