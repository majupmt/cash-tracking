import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
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
        // Serve arquivos estáticos SEM processar
        .get('/style.css', () => Bun.file('./public/style.css'))
        .get('/app.js', () => Bun.file('./public/app.js'))
        .get('/', () => Bun.file('./public/index.html'))
        .get('/api', () => 'API Controle Financeiro 💰')
        .get('/api/health', () => ({ status: 'ok' }))
        .use(authRoutes)
        .use(receitasRoutes)
        .use(dividasRoutes)
        .use(contasRoutes)
        .use(dashboardRoutes)
        .listen(4000);

    console.log(`🚀 Servidor rodando em http://localhost:4000`);
}

start();