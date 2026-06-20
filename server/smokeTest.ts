type SmokeResult = {
  detail?: string;
  label: string;
  status: 'FAIL' | 'PASS' | 'SKIP';
};

const DEFAULT_BACKEND_URL = 'http://localhost:3001';
const SAFE_RATE_LIMIT_MESSAGE = 'Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar dene.';

const backendUrl = (process.env.BACKEND_SMOKE_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
const runRateLimitCheck = process.env.BACKEND_SMOKE_RATE_LIMIT === '1';
const origin = process.env.BACKEND_SMOKE_ORIGIN || 'http://localhost:8083';

const results: SmokeResult[] = [];

const record = (result: SmokeResult) => {
  results.push(result);
  const suffix = result.detail ? ' - ' + result.detail : '';
  console.log(result.status + ' ' + result.label + suffix);
};

const safeJson = async (response: Response) => {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const checkHealth = async () => {
  const response = await fetch(backendUrl + '/health');
  const body = await safeJson(response);

  if (!response.ok || !isRecord(body) || body.ok !== true) {
    record({ status: 'FAIL', label: 'health', detail: 'GET /health did not return ok=true' });
    return;
  }

  record({ status: 'PASS', label: 'health' });
};

const checkCors = async () => {
  const response = await fetch(backendUrl + '/health', {
    headers: { Origin: origin },
  });

  if (!response.ok) {
    record({ status: 'FAIL', label: 'cors', detail: 'health with Origin header failed' });
    return;
  }

  record({ status: 'PASS', label: 'cors', detail: 'Origin request returned a sane response' });
};

const checkAi = async () => {
  const response = await fetch(backendUrl + '/ai/teacher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      level: 'A1',
      userMessage: 'Hallo',
      targetLanguage: 'German',
      nativeLanguage: 'Turkish',
      conversationHistory: [],
      context: {},
    }),
  });

  const body = await safeJson(response);

  if (response.status === 429) {
    record({ status: 'FAIL', label: 'ai route', detail: 'rate limited before smoke check could run' });
    return;
  }

  if (!response.ok || !isRecord(body)) {
    record({ status: 'FAIL', label: 'ai route', detail: 'AI route did not return JSON success' });
    return;
  }

  if (typeof body.tr !== 'string' || typeof body.de !== 'string') {
    record({ status: 'FAIL', label: 'ai route', detail: 'AI response is missing usable text fields' });
    return;
  }

  record({ status: 'PASS', label: 'ai route', detail: 'usable response fields present' });
};

const checkSpeechValidation = async () => {
  const response = await fetch(backendUrl + '/speech/transcribe', {
    method: 'POST',
  });
  const body = await safeJson(response);

  if (response.status !== 400 || !isRecord(body) || typeof body.error !== 'string') {
    record({ status: 'FAIL', label: 'speech validation', detail: 'missing-file request did not return safe 400' });
    return;
  }

  const serialized = JSON.stringify(body).toLowerCase();
  if (
    serialized.includes('provider') ||
    serialized.includes('model') ||
    serialized.includes('endpoint') ||
    serialized.includes('stack') ||
    serialized.includes('transcript') ||
    serialized.includes('audiouri')
  ) {
    record({ status: 'FAIL', label: 'speech validation', detail: 'safe 400 included internal diagnostics' });
    return;
  }

  record({ status: 'PASS', label: 'speech validation' });
};

const checkRateLimit = async () => {
  if (!runRateLimitCheck) {
    record({ status: 'SKIP', label: 'rate limit', detail: 'set BACKEND_SMOKE_RATE_LIMIT=1 with low limits to force 429' });
    return;
  }

  let limited = false;
  let safeMessage = false;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(backendUrl + '/speech/transcribe', {
      method: 'POST',
    });
    const body = await safeJson(response);

    if (response.status === 429) {
      limited = true;
      safeMessage = isRecord(body) && body.error === SAFE_RATE_LIMIT_MESSAGE && body.code === 'rate_limited';
      break;
    }
  }

  if (!limited) {
    record({ status: 'FAIL', label: 'rate limit', detail: 'no 429 observed during explicit rate-limit smoke mode' });
    return;
  }

  if (!safeMessage) {
    record({ status: 'FAIL', label: 'rate limit', detail: '429 response did not match safe Turkish shape' });
    return;
  }

  record({ status: 'PASS', label: 'rate limit' });
};

const main = async () => {
  console.log('WortWeg backend smoke');
  console.log('Target: ' + backendUrl);

  try {
    await checkHealth();
    await checkCors();
    await checkAi();
    await checkSpeechValidation();
    await checkRateLimit();
  } catch (error) {
    record({
      status: 'FAIL',
      label: 'smoke runner',
      detail: error instanceof Error ? error.message : 'unknown failure',
    });
  }

  const failed = results.some((result) => result.status === 'FAIL');
  process.exitCode = failed ? 1 : 0;
};

void main();
