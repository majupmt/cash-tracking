import sql from './db';

export async function runMigrations() {
    try {
        console.log('🔄 Executando migrações...');

        // Adicionar coluna usuario_id na tabela receitas (se não existir)
        await sql`
            ALTER TABLE receitas
            ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
        `;

        // Adicionar coluna usuario_id na tabela dividas (se não existir)
        await sql`
            ALTER TABLE dividas
            ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
        `;

        // Adicionar coluna usuario_id na tabela contas_fixas (se não existir)
        await sql`
            ALTER TABLE contas_fixas
            ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
        `;

        // Adicionar coluna usuario_id na tabela planejamento_mensal (se não existir)
        await sql`
            ALTER TABLE planejamento_mensal
            ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
        `;

        // Criar tabela receitas_mensais para armazenar a receita definida pelo usuário
        await sql`
            CREATE TABLE IF NOT EXISTS receitas_mensais (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
                ano INTEGER NOT NULL CHECK (ano >= 2020),
                valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario_id, mes, ano)
            )
        `;

        // Criar tabela chat_historico para histórico do chat com IA
        await sql`
            CREATE TABLE IF NOT EXISTS chat_historico (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                mensagem TEXT NOT NULL,
                resposta TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log('✅ Migrações executadas com sucesso!');
        console.log('⚠️  ATENÇÃO: Se você já tinha dados, será necessário atualizar manualmente o usuario_id dos registros existentes.');
    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error);
        throw error;
    }
}
