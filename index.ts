import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { initDatabase } from './src/database/db';
import { receitasRoutes } from './src/routes/receitas';
import { dividasRoutes } from './src/routes/dividas';
import { contasRoutes } from './src/routes/contas';
import { dashboardRoutes } from './src/routes/dashboard';

async function start() {
    await initDatabase();

    const app = new Elysia()
        .use(cors()) // <- Adiciona CORS
        .get('/', () => 'API Controle Financeiro 💰')
        .get('/health', () => ({ status: 'ok' }))
        .use(receitasRoutes)
        .use(dividasRoutes)
        .use(contasRoutes)
        .use(dashboardRoutes)
        .listen(4000);

    console.log(`🚀 Servidor rodando em http://localhost:3000`);
}

start();