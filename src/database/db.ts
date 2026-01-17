import postgres from 'postgres';

// Configuração da conexão
const sql = postgres({
    host: process.env.DB_HOST || null,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'controle_financeiro',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Senh@5813',
});

// Função pra inicializar as tabelas
export async function initDatabase() {
    try {
        // Tabela de usuários (SEMPRE criar primeiro)
        await sql`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Executar migrations para adicionar usuario_id nas tabelas existentes
        const { runMigrations } = await import('./migrations');
        await runMigrations();

        // Tabela de receitas
        await sql`
            CREATE TABLE IF NOT EXISTS receitas (
                id SERIAL PRIMARY KEY,
                descricao TEXT NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                data_recebimento DATE,
                recorrente BOOLEAN DEFAULT true,
                ativo BOOLEAN DEFAULT true,
                usuario_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `;

        // Tabela de dívidas
        await sql`
            CREATE TABLE IF NOT EXISTS dividas (
                id SERIAL PRIMARY KEY,
                descricao TEXT NOT NULL,
                valor_total DECIMAL(10, 2) NOT NULL,
                valor_pago DECIMAL(10, 2) DEFAULT 0,
                taxa_juros DECIMAL(5, 2) DEFAULT 0,
                data_inicio DATE NOT NULL,
                quitada BOOLEAN DEFAULT false,
                usuario_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `;

        // Tabela de pagamentos
        await sql`
            CREATE TABLE IF NOT EXISTS pagamentos_divida (
                id SERIAL PRIMARY KEY,
                divida_id INTEGER NOT NULL,
                valor_pago DECIMAL(10, 2) NOT NULL,
                data_pagamento DATE NOT NULL,
                mes_referencia TEXT,
                observacao TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (divida_id) REFERENCES dividas(id) ON DELETE CASCADE
            )
        `;

        // Tabela de contas fixas
        await sql`
            CREATE TABLE IF NOT EXISTS contas_fixas (
                id SERIAL PRIMARY KEY,
                descricao TEXT NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                dia_vencimento INTEGER,
                ativo BOOLEAN DEFAULT true,
                usuario_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `;

        // Tabela de planejamento mensal
        await sql`
            CREATE TABLE IF NOT EXISTS planejamento_mensal (
                id SERIAL PRIMARY KEY,
                mes_referencia TEXT NOT NULL,
                valor_investimento DECIMAL(10, 2) DEFAULT 0,
                observacoes TEXT,
                usuario_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE(mes_referencia, usuario_id)
            )
        `;

        console.log('✅ Banco de dados inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
    }
}

export default sql;