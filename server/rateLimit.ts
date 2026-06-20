import type { RequestHandler } from 'express';

import { getBackendConfig } from './config';

type RateLimitGroup = 'ai' | 'health' | 'speech';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
const RATE_LIMIT_MESSAGE = 'Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar dene.';

const getClientKey = (group: RateLimitGroup, request: Parameters<RequestHandler>[0]) =>
  group + ':' + (request.ip || request.socket.remoteAddress || 'unknown');

const cleanupExpiredBuckets = (now: number) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const createRateLimitMiddleware = (
  group: RateLimitGroup,
  maxRequests: number,
): RequestHandler => {
  return (request, response, next) => {
    const config = getBackendConfig();

    if (!config.rateLimitEnabled) {
      next();
      return;
    }

    const now = Date.now();
    cleanupExpiredBuckets(now);

    const key = getClientKey(group, request);
    const existing = buckets.get(key);
    const bucket = existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + config.rateLimitWindowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    response.setHeader('X-RateLimit-Limit', String(maxRequests));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - bucket.count)));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > maxRequests) {
      response.setHeader('Retry-After', String(retryAfterSeconds));
      response.status(429).json({
        error: RATE_LIMIT_MESSAGE,
        code: 'rate_limited',
      });
      return;
    }

    next();
  };
};
