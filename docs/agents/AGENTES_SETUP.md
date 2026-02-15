# 🤖 Setup dos Agentes

## Usar os Agentes

### Opção 1: Comando NPM (recomendado)
```bash
npm run agentes
```

Isso roda ambos os agentes automaticamente:
- 📋 **Agente de Relatórios** - Executa testes e coleta erros com sugestões
- 🗄️ **Agente de Banco** - Verifica a saúde do banco de dados

### Opção 2: Agentes Individuais
```bash
# Apenas relatório de testes
npm run agent:report

# Apenas verificação do banco
npm run agent:db
```

## Criar Alias no Terminal (Opcional)

Se quiser digitar um comando mais curto, adicione ao seu `~/.bashrc`:

```bash
# Adicione esta linha ao final do ~/.bashrc
alias agentes="cd /home/gabriel/cash-tracking && npm run agentes"
```

Depois execute:
```bash
source ~/.bashrc
```

Pronto! Agora pode digitar apenas `agentes` em qualquer lugar.

## Relatórios Gerados

Todos os relatórios são salvos em `reports/` com timestamps:

- `relatorio-testes-TIMESTAMP.md` - Análise de testes e erros
- `relatorio-banco-TIMESTAMP.md` - Saúde do banco de dados

### Conteúdo dos Relatórios

**📋 Relatório de Testes:**
- ✅ Resultado dos testes unitários
- ✅ Resultado dos testes E2E
- ❌ Erros encontrados (se houver)
- 💡 Sugestões automáticas de correção
- 🔍 Verificações no repositório

**🗄️ Relatório do Banco:**
- 🔧 Variáveis de ambiente
- 🔄 Status das migrações
- 🔌 Teste de conexão
- 📊 Contagem de registros por tabela
- ⚠️ Possíveis gargalos (queries lentas)
- 🔐 Verificações de SQL seguro

## Exemplos

```bash
# Rodar agentes agora
npm run agentes

# Ver últimos relatórios
cat reports/relatorio-testes-*.md | less
cat reports/relatorio-banco-*.md | less

# Remover relatórios antigos
rm reports/relatorio-*.md
```
