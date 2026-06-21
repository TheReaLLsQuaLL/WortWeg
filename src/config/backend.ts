import Constants from 'expo-constants';

export type BackendUrlSource = 'env' | 'dev-lan-fallback' | 'missing';

export type BackendConfig = {
  baseUrl: string;
  host: string;
  isConfigured: boolean;
  source: BackendUrlSource;
};

export type BackendHealthResult = {
  ok: boolean;
  httpStatus?: number;
  errorMessage?: string;
  config: BackendConfig;
};

const trimTrailingSlashes = (value: string) => value.trim().replace(/\/+$/, '');

const isDevRuntime = () =>
  typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const getHostFromUrl = (url: string) => {
  if (!url) {
    return '';
  }

  try {
    return new URL(url).host;
  } catch {
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    return withoutProtocol.split('/')[0]?.split('?')[0] ?? '';
  }
};

const getExpoDevHost = () => {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null | undefined;
  const constants = Constants as typeof Constants & {
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  };
  const hostUri =
    expoConfig?.hostUri ??
    constants.manifest?.debuggerHost ??
    constants.manifest2?.extra?.expoGo?.debuggerHost ??
    '';

  if (!hostUri || typeof hostUri !== 'string') {
    return '';
  }

  const withoutProtocol = hostUri.replace(/^https?:\/\//, '');
  const host = withoutProtocol.split('/')[0]?.split(':')[0] ?? '';

  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return '';
  }

  return host;
};

const getDevLanFallbackUrl = () => {
  if (!isDevRuntime()) {
    return '';
  }

  const host = getExpoDevHost();
  return host ? `http://${host}:3001` : '';
};

export const getBackendConfig = (): BackendConfig => {
  const envUrl = trimTrailingSlashes(process.env.EXPO_PUBLIC_AI_BACKEND_URL ?? '');

  if (envUrl) {
    return {
      baseUrl: envUrl,
      host: getHostFromUrl(envUrl),
      isConfigured: true,
      source: 'env',
    };
  }

  const fallbackUrl = trimTrailingSlashes(getDevLanFallbackUrl());

  if (fallbackUrl) {
    return {
      baseUrl: fallbackUrl,
      host: getHostFromUrl(fallbackUrl),
      isConfigured: true,
      source: 'dev-lan-fallback',
    };
  }

  return {
    baseUrl: '',
    host: '',
    isConfigured: false,
    source: 'missing',
  };
};

export const buildBackendUrl = (path: string) => {
  const config = getBackendConfig();

  if (!config.baseUrl) {
    return '';
  }

  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  return config.baseUrl + normalizedPath;
};

export const getBackendHost = (backendUrl = getBackendConfig().baseUrl) => {
  const host = getHostFromUrl(backendUrl);
  const safeHost = host.includes('@') ? host.split('@').pop() : host;

  return safeHost || 'Ayarlı değil';
};

export const getBackendDebugInfo = () => {
  const config = getBackendConfig();

  return {
    backendBaseUrl: config.baseUrl,
    backendHost: config.host,
    backendSource: config.source,
    backendConfigured: config.isConfigured,
  };
};

export const checkBackendHealth = async (timeoutMs = 3500): Promise<BackendHealthResult> => {
  const config = getBackendConfig();
  const endpoint = buildBackendUrl('/health');

  if (!endpoint) {
    return { ok: false, errorMessage: 'missing-backend-url', config };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
    });

    return { ok: response.ok, httpStatus: response.status, config };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'health-check-failed';
    return { ok: false, errorMessage, config };
  } finally {
    clearTimeout(timeout);
  }
};
