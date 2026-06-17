import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_VERSION, STORAGE_KEYS } from '../data/constants';
import type { LocalEvent, LocalEventMetadata, TrackLocalEventInput } from '../types/analytics';

const MAX_EVENTS = 300;
const sessionId = 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const allowedMetadataKeys = new Set<keyof LocalEventMetadata>([
  'lessonId',
  'level',
  'moduleId',
  'exerciseType',
  'result',
  'durationMs',
  'routeName',
  'routeChosen',
  'fallbackReason',
  'repairedPlan',
  'hasCompletedOnboarding',
  'hasOnboarded',
  'hasProfile',
  'hasLearningPlan',
]);

const makeEventId = () =>
  'event-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

const sanitizeString = (value: string) =>
  value.replace(/[\n\r\t]/g, ' ').slice(0, 80);

const sanitizeMetadata = (metadata?: LocalEventMetadata): LocalEventMetadata | undefined => {
  if (!metadata) {
    return undefined;
  }

  const safe: LocalEventMetadata = {};

  for (const [key, value] of Object.entries(metadata) as Array<[keyof LocalEventMetadata, LocalEventMetadata[keyof LocalEventMetadata]]>) {
    if (!allowedMetadataKeys.has(key) || value === undefined || value === null) {
      continue;
    }

    if (key === 'durationMs' && typeof value === 'number' && Number.isFinite(value)) {
      safe.durationMs = Math.max(0, Math.round(value));
      continue;
    }

    if (key === 'result' && (value === 'correct' || value === 'incorrect')) {
      safe.result = value;
      continue;
    }

    if (typeof value === 'boolean') {
      safe[key] = value as never;
      continue;
    }

    if (typeof value === 'string') {
      safe[key] = sanitizeString(value) as never;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
};

const readEvents = async (): Promise<LocalEvent[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.localEventLog);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? parsed.filter(isLocalEventLike).slice(-MAX_EVENTS) : [];
};

const isLocalEventLike = (value: unknown): value is LocalEvent => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Partial<LocalEvent>;

  return Boolean(
    typeof event.id === 'string' &&
      typeof event.timestamp === 'string' &&
      typeof event.type === 'string' &&
      typeof event.sessionId === 'string' &&
      typeof event.severity === 'string',
  );
};

export const trackLocalEvent = (input: TrackLocalEventInput) => {
  void (async () => {
    try {
      const events = await readEvents();
      const event: LocalEvent = {
        id: makeEventId(),
        timestamp: new Date().toISOString(),
        type: input.type,
        screen: input.screen ? sanitizeString(input.screen) : undefined,
        action: input.action ? sanitizeString(input.action) : undefined,
        metadata: sanitizeMetadata(input.metadata),
        appVersion: APP_VERSION,
        sessionId,
        severity: input.severity ?? 'info',
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.localEventLog,
        JSON.stringify([...events, event].slice(-MAX_EVENTS)),
      );
    } catch {
      // Local alpha logging must never block product flows.
    }
  })();
};

export const getLocalEventLog = async (): Promise<LocalEvent[]> => {
  try {
    return readEvents();
  } catch {
    return [];
  }
};

export const clearEventLog = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.localEventLog);
  } catch {
    // Ignore local debug-log cleanup failures.
  }
};

export const exportEventLogJson = async () => {
  const events = await getLocalEventLog();

  return JSON.stringify({ exportedAt: new Date().toISOString(), count: events.length, events }, null, 2);
};

export const exportEventLogText = async () => {
  const events = await getLocalEventLog();

  if (events.length === 0) {
    return 'WortWeg alpha event log\nNo local events recorded yet.';
  }

  return [
    'WortWeg alpha event log',
    'Exported: ' + new Date().toISOString(),
    'Events: ' + events.length,
    '',
    ...events.map((event) => {
      const bits = [
        '[' + event.timestamp + ']',
        event.severity.toUpperCase(),
        event.type,
        event.screen ? 'screen=' + event.screen : '',
        event.action ? 'action=' + event.action : '',
        event.metadata ? 'metadata=' + JSON.stringify(event.metadata) : '',
        'session=' + event.sessionId,
      ].filter(Boolean);

      return bits.join(' | ');
    }),
  ].join('\n');
};
