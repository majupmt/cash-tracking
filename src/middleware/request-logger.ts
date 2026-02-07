import { Elysia } from 'elysia';
import { logger } from '../lib/logger';
import { metrics } from '../lib/metrics';

export const requestLogger = new Elysia({ name: 'request-logger' })
  .derive(({ request }) => {
    return { requestStart: Date.now(), requestPath: new URL(request.url).pathname };
  })
  .onAfterResponse(({ request, requestStart, requestPath, set }) => {
    const duration = Date.now() - (requestStart as number);
    const status = typeof set.status === 'number' ? set.status : 200;
    const path = requestPath as string;

    // Skip static files from logging
    if (path === '/style.css' || path === '/app.js' || path === '/') return;

    metrics.recordRequest(path, status, duration);
    logger.info('request', {
      method: request.method,
      path,
      status,
      durationMs: duration,
    });
  });
