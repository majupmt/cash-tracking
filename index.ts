import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { initDatabase, sql } from './src/database/db';
import { authRoutes } from './src/routes/auth';
import { receitasRoutes } from './src/routes/receitas';
import { dividasRoutes } from './src/routes/dividas';
import { contasRoutes } from './src/routes/contas';
import { dashboardRoutes } from './src/routes/dashboard';
import { extratoRoutes } from './src/routes/extrato';
import { transacoesRoutes } from './src/routes/transacoes';
import { uploadRoutes } from './src/routes/upload';
import { requestLogger } from './src/middleware/request-logger';
import { logger } from './src/lib/logger';
import { metrics } from './src/lib/metrics';

async function start() {
    await initDatabase();

    new Elysia()
        .use(cors())
        .use(requestLogger)
        // Static files
        .get('/style.css', () => Bun.file('./public/style.css'))
        .get('/app.js', () => Bun.file('./public/app.js'))
        .get('/', () => Bun.file('./public/index.html'))
        // Health & metrics
        .get('/api', () => 'API Cash Tracking')
        .get('/api/health', async () => {
            let dbOk = false;
            try {
                await sql`SELECT 1`;
                dbOk = true;
            } catch { /* db down */ }
            const mem = process.memoryUsage();
            return {
                status: dbOk ? 'ok' : 'degraded',
                db: dbOk,
                uptime: process.uptime(),
                memory: { rss: Math.round(mem.rss / 1024 / 1024), heap: Math.round(mem.heapUsed / 1024 / 1024) },
                requests: metrics.getSummary(),
            };
        })
        .get('/api/metrics', () => metrics.getSummary())
        // Routes
        .use(authRoutes)
        .use(receitasRoutes)
        .use(dividasRoutes)
        .use(contasRoutes)
        .use(dashboardRoutes)
        .use(extratoRoutes)
        .use(transacoesRoutes)
        .use(uploadRoutes)
        .listen(4000);

    logger.info('server_start', { port: 4000, env: process.env.NODE_ENV || 'development' });
}

start();
