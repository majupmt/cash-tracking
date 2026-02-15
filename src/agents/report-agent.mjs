import fs from 'fs/promises';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const exec = promisify(_exec);

function nowTs() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function extrairEstatisticas(saida) {
  const stats = {
    suites: 0,
    testes: 0,
    passando: 0,
    falhando: 0,
    tempo: 0
  };
  
  const matchSuites = saida.match(/Test Suites:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (matchSuites) {
    stats.suites = parseInt(matchSuites[2]);
  }
  
  const matchTests = saida.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (matchTests) {
    stats.passando = parseInt(matchTests[1]);
    stats.testes = parseInt(matchTests[2]);
    stats.falhando = stats.testes - stats.passando;
  }
  
  const matchTime = saida.match(/Time:\s+([\d.]+)\s+s/);
  if (matchTime) stats.tempo = parseFloat(matchTime[1]);
  
  return stats;
}

function sugestoesPraErro(errText) {
  const mapa = {
    '__dirname is not defined': 'Use `import.meta.url` com `url.fileURLToPath` para construir `__dirname`',
    'Playwright Test did not expect': 'Testes Playwright estão rodando dentro do Jest. Mova para pasta separada (`tests/e2e`) e use `npx playwright test`',
    'ReferenceError: __dirname': 'Config é ESM. Substitua `__dirname` por `path.dirname(fileURLToPath(import.meta.url))`',
    'did not expect test.beforeEach': 'Teste Playwright misturado com Jest. Organize os testes em pastas diferentes'
  };
  
  for (const [chave, sugestao] of Object.entries(mapa)) {
    if (errText.includes(chave)) return sugestao;
  }
  return null;
}

async function rodarECapturar(cmd, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await exec(cmd, { cwd, maxBuffer: 10 * 1024 * 1024 });
    return { sucesso: true, stdout, stderr };
  } catch (err) {
    return { sucesso: false, stdout: err.stdout || '', stderr: err.stderr || err.message };
  }
}

function extrairLinhasErro(texto) {
  return texto.split('\n')
    .filter(l => /Error:|FAIL|ReferenceError|did not expect|✘/.test(l))
    .slice(0, 5);
}

async function main() {
  const diretorioRelatorios = 'reports';
  await fs.mkdir(diretorioRelatorios, { recursive: true });
  const timestamp = nowTs();
  const caminhoRelatorio = path.join(diretorioRelatorios, `relatorio-testes-${timestamp}.md`);

  console.log('🔄 Coletando dados de testes...');
  const unit = await rodarECapturar('bun run test:unit');
  const e2e = await rodarECapturar('bun run test:e2e');

  // Combina stdout + stderr pois o Jest pode sair por stderr
  const unitOutput = (unit.stdout || '') + '\n' + (unit.stderr || '');
  const e2eOutput = (e2e.stdout || '') + '\n' + (e2e.stderr || '');

  const statsUnit = extrairEstatisticas(unitOutput);
  const statsE2E = extrairEstatisticas(e2eOutput);
  const combinado = unitOutput + '\n' + e2eOutput;
  
  const secoes = [];
  
  // Cabeçalho
  secoes.push('# 📋 Relatório de Testes');
  secoes.push(`**Data:** ${new Date().toLocaleString('pt-BR')}`);
  secoes.push('');

  // Resumo Executivo
  secoes.push('## 📊 Resumo Executivo');
  secoes.push('');
  
  const statusGeral = statsUnit.falhando === 0 && statsE2E.falhando === 0 ? '✅ TUDO OK' : '⚠️ PROBLEMAS ENCONTRADOS';
  const totalTestes = statsUnit.testes + statsE2E.testes;
  const totalPassando = statsUnit.passando + statsE2E.passando;
  const taxaSucesso = totalTestes > 0 ? ((totalPassando / totalTestes) * 100).toFixed(1) : 0;
  
  secoes.push(`| Métrica | Valor |`);
  secoes.push(`|---------|-------|`);
  secoes.push(`| Status Geral | ${statusGeral} |`);
  secoes.push(`| Total de Testes | ${totalTestes} |`);
  secoes.push(`| Passando | ✅ ${totalPassando} |`);
  secoes.push(`| Falhando | ❌ ${statsUnit.falhando + statsE2E.falhando} |`);
  secoes.push(`| Taxa de Sucesso | ${taxaSucesso}% |`);
  secoes.push('');

  // Testes Unitários
  secoes.push('## 🧪 Testes Unitários');
  secoes.push('');
  secoes.push(`**Status:** ${statsUnit.falhando === 0 ? '✅ Todos passando' : '⚠️ Alguns falhando'}`);
  secoes.push(`- Testes: **${statsUnit.passando}/${statsUnit.testes}** passando`);
  secoes.push(`- Suites: **${statsUnit.suites}** suite(s)`);
  secoes.push(`- Tempo: **${statsUnit.tempo}s**`);
  secoes.push('');

  // Testes E2E
  secoes.push('## 🎯 Testes E2E');
  secoes.push('');
  secoes.push(`**Status:** ${statsE2E.falhando === 0 ? '✅ Todos passando' : '⚠️ Alguns falhando'}`);
  secoes.push(`- Testes: **${statsE2E.passando}/${statsE2E.testes}** passando`);
  secoes.push(`- Suites: **${statsE2E.suites}** suite(s)`);
  secoes.push(`- Tempo: **${statsE2E.tempo}s**`);
  secoes.push('');

  // Erros
  const linhasErro = extrairLinhasErro(combinado);
  if (linhasErro.length > 0) {
    secoes.push('## ❌ Erros Identificados');
    secoes.push('');
    linhasErro.forEach((linha, i) => {
      const sugestao = sugestoesPraErro(linha);
      secoes.push(`**Erro ${i + 1}:** ${linha.trim()}`);
      if (sugestao) {
        secoes.push(`💡 **Solução:** ${sugestao}`);
      }
      secoes.push('');
    });
  } else {
    secoes.push('## ✅ Nenhum Erro Detectado');
    secoes.push('');
    secoes.push('Todos os testes passaram sem erros!');
    secoes.push('');
  }

  // Checklist
  secoes.push('## 📋 Verificações');
  secoes.push('');
  
  let playwrightOk = true;
  try {
    const pw = await fs.readFile('playwright.config.ts', 'utf8');
    if (/__dirname/.test(pw) && /import.meta.url/.test(pw) === false) {
      secoes.push('- ⚠️ `playwright.config.ts` usa `__dirname` em ESM');
      playwrightOk = false;
    } else {
      secoes.push('- ✅ `playwright.config.ts` OK');
    }
  } catch (e) {
    secoes.push('- ⚠️ `playwright.config.ts` não encontrado');
  }

  if (playwrightOk) {
    secoes.push('');
  }

  // Ações recomendadas
  secoes.push('## 🎯 Próximas Ações');
  secoes.push('');
  if (statsUnit.falhando > 0 || statsE2E.falhando > 0) {
    secoes.push('1. Verifique os erros acima');
    secoes.push('2. Aplique as soluções sugeridas');
    secoes.push('3. Rode novamente com `npm run agentes`');
  } else {
    secoes.push('✅ Tudo está OK! Continue desenvolvendo com confiança.');
  }
  secoes.push('');

  await fs.writeFile(caminhoRelatorio, secoes.join('\n'), 'utf8');
  console.log(`✅ Relatório gerado: ${caminhoRelatorio}`);
}

main().catch(err => {
  console.error('❌ Erro no agente:', err);
  process.exit(1);
});
