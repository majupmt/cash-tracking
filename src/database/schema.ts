import { pgTable, serial, text, decimal, boolean, timestamp, integer, date, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha_hash').notNull(), // Mapeando para o nome real no banco
  createdAt: timestamp('created_at').defaultNow(),
});

export const receitas = pgTable('receitas', {
  id: serial('id').primaryKey(),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }),
  descricao: text('descricao').notNull(),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  dataRecebimento: date('data_recebimento'),
  recorrente: boolean('recorrente').default(true),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('receitas_user_id_idx').on(table.userId),
  ativoIdx: index('receitas_ativo_idx').on(table.ativo),
}));

export const transacoes = pgTable('transacoes', {
  id: serial('id').primaryKey(),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }),
  descricao: text('descricao').notNull(),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  tipo: text('tipo').notNull(), // 'receita' | 'despesa'
  categoria: text('categoria'),
  data: text('data').notNull(), // No banco atual está como TEXT
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('transacoes_user_id_idx').on(table.userId),
  dataIdx: index('transacoes_data_idx').on(table.data),
}));

export const dividas = pgTable('dividas', {
  id: serial('id').primaryKey(),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }),
  descricao: text('descricao').notNull(),
  valorTotal: decimal('valor_total', { precision: 10, scale: 2 }).notNull(),
  valorPago: decimal('valor_pago', { precision: 10, scale: 2 }).default('0'),
  taxaJuros: decimal('taxa_juros', { precision: 5, scale: 2 }).default('0'),
  dataInicio: date('data_inicio').notNull(),
  quitada: boolean('quitada').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  // Colunas detectadas no banco que faltavam no schema
  valorParcela: decimal('valor_parcela', { precision: 10, scale: 2 }),
  parcelasTotal: integer('parcelas_total'),
  parcelasPagas: integer('parcelas_pagas').default(0),
}, (table) => ({
  userIdIdx: index('dividas_user_id_idx').on(table.userId),
  quitadaIdx: index('dividas_quitada_idx').on(table.quitada),
}));

export const contasFixas = pgTable('contas_fixas', {
  id: serial('id').primaryKey(),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }),
  descricao: text('descricao').notNull(),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  diaVencimento: integer('dia_vencimento'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  // Colunas detectadas no banco que faltavam no schema
  pago: boolean('pago').default(false),
  categoria: text('categoria').default('Outros'),
}, (table) => ({
  userIdIdx: index('contas_fixas_user_id_idx').on(table.userId),
}));

// Tabelas auxiliares que existiam no banco mas não no schema
export const pagamentosDivida = pgTable('pagamentos_divida', {
  id: serial('id').primaryKey(),
  dividaId: integer('divida_id').references(() => dividas.id, { onDelete: 'cascade' }).notNull(),
  valorPago: decimal('valor_pago', { precision: 10, scale: 2 }).notNull(),
  dataPagamento: date('data_pagamento').notNull(),
  mesReferencia: text('mes_referencia'),
  observacao: text('observacao'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const planejamentoMensal = pgTable('planejamento_mensal', {
  id: serial('id').primaryKey(),
  mesReferencia: text('mes_referencia').notNull(),
  valorInvestimento: decimal('valor_investimento', { precision: 10, scale: 2 }).default('0'),
  observacoes: text('observacoes'),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  unq: uniqueIndex('planejamento_mensal_unq').on(table.mesReferencia, table.userId),
}));

export const receitasMensais = pgTable('receitas_mensais', {
  id: serial('id').primaryKey(),
  userId: integer('usuario_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  mes: integer('mes').notNull(),
  ano: integer('ano').notNull(),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unq: uniqueIndex('receitas_mensais_unq').on(table.userId, table.mes, table.ano),
}));