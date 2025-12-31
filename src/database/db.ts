import postgres from 'postgres';

// Configuração da conexão
const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'controle_financeiro', // ou o nome que você quiser
    username: 'postgres',
    password: 'Senh@5813',
});

// Função pra inicializar as tabelas
export async function initDatabase() {
    try {
        // Tabela de receitas
        await sql`
            CREATE TABLE IF NOT EXISTS receitas (
                id SERIAL PRIMARY KEY,
                descricao TEXT NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                data_recebimento DATE,
                recorrente BOOLEAN DEFAULT true,
                ativo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Tabela de planejamento mensal
        await sql`
            CREATE TABLE IF NOT EXISTS planejamento_mensal (
                id SERIAL PRIMARY KEY,
                mes_referencia TEXT NOT NULL UNIQUE,
                valor_investimento DECIMAL(10, 2) DEFAULT 0,
                observacoes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log('✅ Banco de dados inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
    }
}

export default sql;