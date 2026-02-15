# 🤖 Guia Rápido - Agentes em Português

## 🚀 Como Usar (3 Formas)

### Forma 1️⃣ - Comando NPM (Mais Simples)
```bash
npm run agentes
```
Roda ambos os agentes automaticamente.

### Forma 2️⃣ - Alias no Terminal (Recomendado) ⭐
Depois de abrir um novo terminal, use:
```bash
agentes           # Roda ambos os agentes
agentes-report    # Só relatório de testes
agentes-db        # Só verificação de banco
```

### Forma 3️⃣ - Script Shell
```bash
./agentes.sh              # Roda ambos (mesmo que npm run agentes)
./agentes.sh report       # Só testes
./agentes.sh db           # Só banco
```

---

## 📊 O que Cada Agente Faz

### 📋 Agente de Relatórios (`agentes-report`)
- ✅ Executa testes unitários (`bun run test:unit`)
- ✅ Executa testes E2E (`bun run test:e2e`)
- ❌ Coleta e identifica erros
- 💡 Sugere soluções automáticas
- 📁 Gera: `reports/relatorio-testes-TIMESTAMP.md`

### 🗄️ Agente de Banco (`agentes-db`)
- 🔧 Verifica variáveis de ambiente
- 🔄 Checa status das migrações
- 🔌 Testa conexão com PostgreSQL
- 📊 Conta registros em cada tabela
- ⚠️ Identifica gargalos (queries lentas)
- 🔐 Verifica código SQL inseguro
- 📁 Gera: `reports/relatorio-banco-TIMESTAMP.md`

---

## 📁 Onde Encontrar os Relatórios

Todos salvos em `reports/`:
```bash
# Ver último relatório de testes
cat reports/relatorio-testes-*.md | less

# Ver último relatório de banco
cat reports/relatorio-banco-*.md | less

# Listar todos os relatórios
ls -lh reports/
```

---

## 💡 Exemplos de Uso

```bash
# Rodar tudo de uma vez
npm run agentes

# Ou com alias (novo terminal)
agentes

# Ver testes apenas
agentes-report

# Verificar saúde do banco
agentes-db

# Remover relatórios antigos
rm reports/relatorio-*.md
```

---

## 🔧 Personalizar os Agentes

Os agentes estão em:
- `src/agents/report-agent.mjs` - Agente de testes
- `src/agents/db-agent.mjs` - Agente de banco

**Tudo em português Brasil!** 🇧🇷

---

## ⚙️ Configuração Inicial

Se os aliases não funcionam na sessão atual, execute:
```bash
source ~/.bashrc
```

Depois tente novamente.

---

Pronto! Agora é só digitar `agentes` quando quiser rodar! 🎉
