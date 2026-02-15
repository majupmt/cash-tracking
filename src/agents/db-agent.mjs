import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

dotenv.config();

function nowTs() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function tentarConectarEInspecionar() {
  const databaseUrl = process.env.DATABASE_URL || null;
  const pgHost = process.env.PGHOST || process.env.PGHOSTADDR || null;
  if (!databaseUrl && !pgHost) {
    return { conectado: false, razao: 'Nenhuma DATABASE_URL ou PGHOST encontrada no ambiente.' };
  }

  try {
    const postgres = await import('postgres');
    const sql = postgres.default ? postgres.default(databaseUrl || undefined) : postgres(databaseUrl || undefined);
    const tabelas = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    const resultados = [];
    for (const t of tabelas) {
      const nome = t.tablename;
      const inicio = performance.now();
      const r = await sql.unsafe(`SELECT COUNT(*)::bigint AS cnt FROM ${nome}`);
      const decorrido = performance.now() - inicio;
      const cnt = r[0]?.cnt ?? null;
      resultados.push({ tabela: nome, quantidade: Number(cnt), tempoMs: Math.round(decorrido) });
    }
    await sql.end({ timeout: 1000 }).catch(() => {});
    return { conectado: true, tabelas: resultados };
  } catch (err) {
    return { conectado: false, razao: String(err) };
  }
}

async function main() {
  console.log('🔄 Inspecionando banco de dados...');
  
  const diretorioRelatorios = 'reports';
  await fs.mkdir(diretorioRelatorios, { recursive: true });
  const caminhoRelatorio = path.join(diretorioRelatorios, `relatorio-banco-${nowTs()}.md`);
  const partes = [];

  // Cabeçalho
  partes.push('# 🗄️ Relatório do Banco de Dados');
  partes.push(`**Data:** ${new Date().toLocaleString('pt-BR')}`);
  partes.push('');

  // Resumo Executivo
  partes.push('## 📊 Resumo Executivo');
  partes.push('');
  
  const resumoEnv = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    PGHOST: !!process.env.PGHOST,
    PGUSER: !!process.env.PGUSER,
    PGDATABASE: !!process.env.PGDATABASE,
  };
  const conectado = resumoEnv.DATABASE_URL || resumoEnv.PGHOST;
  
  partes.push(`| Item | Status |`);
  partes.push(`|------|--------|`);
  partes.push(`| Conexão Configurada | ${conectado ? '✅ Sim' : '❌ Não'} |`);
  partes.push('');

  // Variáveis de Ambiente
  partes.push('## 🔧 Configuração');
  partes.push('');
  partes.push(`- DATABASE_URL: ${resumoEnv.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
  partes.push(`- PGHOST: ${resumoEnv.PGHOST ? '✅ Configurada' : '❌ Não configurada'}`);
  partes.push(`- PGUSER: ${resumoEnv.PGUSER ? '✅ Configurada' : '❌ Não configurada'}`);
  partes.push(`- PGDATABASE: ${resumoEnv.PGDATABASE ? '✅ Configurada' : '❌ Não configurada'}`);
  partes.push('');

  // Migrações
  partes.push('## 🔄 Migrações');
  partes.push('');
  try {
    await fs.readFile('src/database/migrations.ts', 'utf8');
    const stats = await fs.stat('src/database/migrations.ts');
    partes.push('✅ Arquivo de migrações encontrado');
    partes.push(`- Última alteração: ${stats.mtime.toLocaleString('pt-BR')}`);
  } catch (e) {
    partes.push('❌ Arquivo de migrações não encontrado em `src/database/migrations.ts`');
  }
  partes.push('');

  // Verificação do Banco
  partes.push('## 🔌 Teste de Conexão');
  partes.push('');
  
  const sonda = await tentarConectarEInspecionar();
  
  if (!sonda.conectado) {
    partes.push('❌ **Não foi possível conectar ao banco**');
    partes.push('');
    partes.push(`**Motivo:** ${sonda.razao}`);
    partes.push('');
    partes.push('**Para corrigir:**');
    partes.push('1. Configure `DATABASE_URL` no arquivo `.env`');
    partes.push('2. Ou configure `PGHOST`, `PGUSER`, `PGDATABASE` e `PGPASSWORD`');
    partes.push('3. Execute `npm run agentes` novamente');
  } else {
    partes.push('✅ **Conexão com banco estabelecida**');
    partes.push('');
    
    // Tabelas e Registros
    partes.push('### 📋 Tabelas e Registros');
    partes.push('');
    partes.push('| Tabela | Registros | Tempo |');
    partes.push('|--------|-----------|-------|');
    sonda.tabelas.forEach(t => {
      const icon = t.tempoMs > 200 ? '⚠️' : '✅';
      partes.push(`| ${icon} ${t.tabela} | **${t.quantidade}** | ${t.tempoMs}ms |`);
    });
    partes.push('');

    // Gargalos
    const lentos = sonda.tabelas.filter(t => t.tempoMs > 200);
    if (lentos.length > 0) {
      partes.push('### ⚠️ Possíveis Gargalos');
      partes.push('');
      lentos.forEach(s => {
        partes.push(`- **${s.tabela}**: Contagem levou ${s.tempoMs}ms`);
        partes.push(`  💡 Sugestão: Considere adicionar índices ou usar queries mais eficientes`);
      });
      partes.push('');
    } else {
      partes.push('✅ Nenhum gargalo óbvio detectado');
      partes.push('');
    }
  }

  // Verificações de Código
  partes.push('## 🔐 Segurança (Verificação de Código)');
  partes.push('');
  
  const filesToScan = [];
  async function coletar(dir) {
    const itens = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const it of itens) {
      const p = path.join(dir, it.name);
      if (it.isDirectory() && it.name !== 'node_modules' && it.name !== '.') await coletar(p);
      else if (it.isFile() && /\.(ts|js|mjs)$/.test(it.name)) filesToScan.push(p);
    }
  }
  await coletar('src');

  const inseguro = [];
  for (const f of filesToScan) {
    const txt = await fs.readFile(f, 'utf8').catch(() => '');
    if (/\bquery\(|sql\.unsafe|\`SELECT\s+[\s\S]*?\${/.test(txt)) {
      inseguro.push(f);
    }
  }

  if (inseguro.length > 0) {
    partes.push('⚠️ Arquivos com SQL potencialmente inseguro:');
    inseguro.forEach(f => partes.push(`  - ${f}`));
  } else {
    partes.push('✅ Nenhum SQL inseguro detectado');
  }
  partes.push('');

  // Próximos Passos
  partes.push('## 🎯 Próximas Ações');
  partes.push('');
  if (!sonda.conectado) {
    partes.push('1. Configure as variáveis de ambiente do banco');
    partes.push('2. Rode `npm run agentes` novamente para verificar');
  } else {
    const lentos = sonda.tabelas.filter(t => t.tempoMs > 200);
    if (lentos.length > 0) {
      partes.push('1. Analise os gargalos detectados');
      partes.push('2. Considere adicionar índices nas tabelas lentas');
      partes.push('3. Use `EXPLAIN ANALYZE` para otimizar queries');
    } else {
      partes.push('✅ Banco de dados está saudável!');
    }
  }
  partes.push('');

  await fs.writeFile(caminhoRelatorio, partes.join('\n'), 'utf8');
  console.log(`✅ Relatório de banco gerado: ${caminhoRelatorio}`);
}

main().catch(err => {
  console.error('❌ Erro no agente de banco:', err);
  process.exit(1);
});
