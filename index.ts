import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { initDatabase } from './src/database/db';
import { authRoutes } from './src/routes/auth';
import { receitasRoutes } from './src/routes/receitas';
import { dividasRoutes } from './src/routes/dividas';
import { contasRoutes } from './src/routes/contas';
import { dashboardRoutes } from './src/routes/dashboard';

async function start() {
    await initDatabase();

    const app = new Elysia()
        .use(cors())
        .get('/', () => 'API Controle Financeiro 💰')
        .get('/health', () => ({ status: 'ok' }))
        .use(authRoutes)
        .use(receitasRoutes)
        .use(dividasRoutes)
        .use(contasRoutes)
        .use(dashboardRoutes)
        .listen(4000);

    console.log(`🚀 Servidor rodando em http://localhost:4000`);
}

start();