import  sql  from '../db.js';

export async function criarTabelaTransacoes() {
  const query = `
    CREATE TABLE IF NOT EXISTS transacoes (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      data DATE NOT NULL,
      descricao TEXT NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      tipo VARCHAR(10) CHECK (tipo IN ('receita', 'despesa')),
      categoria VARCHAR(50),
      origem VARCHAR(20) DEFAULT 'extrato' CHECK (origem IN ('manual', 'ia_chat', 'extrato')),
      arquivo_origem TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
    CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
  `;

  try {
    await sql `${query}`;
    console.log('✅ Tabela transacoes criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela transacoes:', error);
    throw error;
  }
}