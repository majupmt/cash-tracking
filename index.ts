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

const PORT = parseInt(process.env.PORT || '4000');

async function start() {
    await initDatabase();

    const healthHandler = async () => {
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
    };

    new Elysia()
        .use(cors({
            origin: [
                'http://localhost:3000',
                'https://cash-tracking.vercel.app',
                /\.vercel\.app$/,
            ],
            credentials: true,
        }))
        .use(requestLogger)
        // Static files
        .get('/style.css', () => Bun.file('./public/style.css'))
        .get('/app.js', () => Bun.file('./public/app.js'))
        .get('/', () => Bun.file('./public/index.html'))
        // Health & metrics
        .get('/health', healthHandler)
        .get('/api', () => 'API Cash Tracking')
        .get('/api/health', healthHandler)
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
        .listen(PORT);

    logger.info('server_start', { port: PORT, env: process.env.NODE_ENV || 'development' });
}

start();
