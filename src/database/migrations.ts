import sql from './db';

export async function runMigrations() {
    try {
        console.log('🔄 Executando migrações...');

        // Adicionar coluna usuario_id na tabela receitas (se não existir)
        try {
            await sql`
                ALTER TABLE receitas
                ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
            `;
        } catch (e) {
            console.log('   ✓ usuario_id já existe em receitas');
        }

        // Adicionar coluna usuario_id na tabela dividas (se não existir)
        try {
            await sql`
                ALTER TABLE dividas
                ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
            `;
        } catch (e) {
            console.log('   ✓ usuario_id já existe em dividas');
        }

        // Adicionar coluna usuario_id na tabela contas_fixas (se não existir)
        try {
            await sql`
                ALTER TABLE contas_fixas
                ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
            `;
        } catch (e) {
            console.log('   ✓ usuario_id já existe em contas_fixas');
        }

        // Adicionar coluna usuario_id na tabela planejamento_mensal (se não existir)
        try {
            await sql`
                ALTER TABLE planejamento_mensal
                ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
            `;
        } catch (e) {
            console.log('   ✓ usuario_id já existe em planejamento_mensal');
        }

        // Adicionar coluna pago em contas_fixas (para toggle de status)
        try {
            await sql`
                ALTER TABLE contas_fixas
                ADD COLUMN IF NOT EXISTS pago BOOLEAN DEFAULT false
            `;
        } catch (e) {
            console.log('   ✓ pago já existe em contas_fixas');
        }

        // Adicionar coluna categoria em contas_fixas
        try {
            await sql`
                ALTER TABLE contas_fixas
                ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Outros'
            `;
        } catch (e) {
            console.log('   ✓ categoria já existe em contas_fixas');
        }

        // Criar índices para melhor performance
        try {
            // Índice composto para filtro por usuario e ordenação por data (transações)
            await sql`
                CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_data 
                ON transacoes(usuario_id, data DESC)
            `;
            console.log('   ✓ Índice idx_transacoes_usuario_data criado');
        } catch (e) {
            console.log('   ✓ Índice idx_transacoes_usuario_data já existe');
        }

        try {
            // Índice para tipo de transação (receita/despesa)
            await sql`
                CREATE INDEX IF NOT EXISTS idx_transacoes_tipo 
                ON transacoes(usuario_id, tipo)
            `;
            console.log('   ✓ Índice idx_transacoes_tipo criado');
        } catch (e) {
            console.log('   ✓ Índice idx_transacoes_tipo já existe');
        }

        try {
            // Índice para receitas
            await sql`
                CREATE INDEX IF NOT EXISTS idx_receitas_usuario 
                ON receitas(usuario_id, ativo)
            `;
            console.log('   ✓ Índice idx_receitas_usuario criado');
        } catch (e) {
            console.log('   ✓ Índice idx_receitas_usuario já existe');
        }

        try {
            // Índice para dívidas
            await sql`
                CREATE INDEX IF NOT EXISTS idx_dividas_usuario 
                ON dividas(usuario_id, quitada)
            `;
            console.log('   ✓ Índice idx_dividas_usuario criado');
        } catch (e) {
            console.log('   ✓ Índice idx_dividas_usuario já existe');
        }

        try {
            // Índice para contas fixas
            await sql`
                CREATE INDEX IF NOT EXISTS idx_contas_fixas_usuario 
                ON contas_fixas(usuario_id, ativo)
            `;
            console.log('   ✓ Índice idx_contas_fixas_usuario criado');
        } catch (e) {
            console.log('   ✓ Índice idx_contas_fixas_usuario já existe');
        }

        console.log('✅ Migrações executadas com sucesso');
    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error);
        throw error;
    }
}
