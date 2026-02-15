import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("❌ A variável DATABASE_URL não foi definida no arquivo .env");
}

// Configuração da conexão
const sql = postgres(connectionString, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    idle_timeout: 20,
    connect_timeout: 10,
});

// Inicializa Drizzle
export const db = drizzle(sql, { schema });

// Função pra inicializar as tabelas
export async function initDatabase() {
    try {
        // A inicialização manual foi removida em favor do Drizzle Kit.
        // Para criar/atualizar as tabelas, execute no terminal:
        // bun run db:push
        console.log('✅ Conexão com banco estabelecida (Gerenciamento via Drizzle Kit)');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
    }
}

export { sql };
export default sql;