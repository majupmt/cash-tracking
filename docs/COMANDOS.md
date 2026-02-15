# 📚 Comandos do Projeto Cash Tracking

## 🚀 Servidor

```bash
npm start              # Inicia o servidor em produção (porta 4000)
npm run dev           # Inicia com hot reload (desenvolvimento)
```

## 🗄️ Banco de Dados (Docker)

```bash
npm run db:up         # 🟢 Sobe o PostgreSQL
npm run db:down       # 🔴 Para o banco de dados
npm run db:reset      # 🔄 Reseta (deleta tudo e sobe novamente)
npm run db:logs       # 📋 Ver logs do PostgreSQL em tempo real
```

## 🧪 Testes

```bash
npm run test:unit     # Testes unitários com Jest
npm run test:e2e      # Testes E2E com Playwright
npm test              # Roda todos os testes (unit + e2e)
```

## 🤖 Agentes (Relatórios & Analysis)

```bash
npm run agent:report  # Executa agente de relatórios
npm run agent:db      # Executa agente de banco de dados
npm run agentes       # Executa ambos os agentes
```

## 📋 Qualidade de Código

```bash
npm run lint          # Valida código com Biome
npm run typecheck     # Verifica tipos TypeScript
```

---

## ⚡ Fluxo de Desenvolvimento Recomendado

1. **Primeira vez / Reset:**
   ```bash
   npm run db:up       # Subir banco
   ```

2. **Desenvolvimento:**
   ```bash
   npm run dev         # Em um terminal (hot reload)
   npm run db:logs     # Em outro terminal (logs do DB)
   ```

3. **Antes de commitar:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Gerar relatórios:**
   ```bash
   npm run agentes
   ```

---

## 📍 URLs Principais

- 🌐 **Frontend:** http://localhost:4000
- 📊 **API:** http://localhost:4000/api
- ❤️ **Health:** http://localhost:4000/api/health
- 📈 **Métricas:** http://localhost:4000/api/metrics

---

## 🔍 Endpoints Principais

```
GET  /api/health                    # Status da aplicação
GET  /api/metrics                   # Métricas de requisições

POST /api/auth/cadastro             # Registrar novo usuário
POST /api/auth/login                # Login

GET  /api/transacoes                # Listar transações
POST /api/transacoes                # Criar transação
PUT  /api/transacoes/:id            # Atualizar transação
DELETE /api/transacoes/:id          # Deletar transação

GET  /api/contas                    # Listar contas fixas
POST /api/contas                    # Criar conta fixa
PUT  /api/contas/:id                # Atualizar conta fixa
DELETE /api/contas/:id              # Deletar conta fixa

GET  /api/dividas                   # Listar dívidas
POST /api/dividas                   # Criar dívida
PUT  /api/dividas/:id               # Atualizar dívida
DELETE /api/dividas/:id             # Deletar dívida

POST /api/upload-extrato            # Upload de arquivo (CSV/OFX/PDF)
GET  /api/dashboard/resumo          # Resumo financeiro
```

---

## 📝 Logs

Agora o projeto tem logs estruturados em JSON:
- **Info** (cyan): Informações gerais
- **Warn** (yellow): Avisos
- **Error** (red): Erros
- **Debug** (magenta): Debug info

Exemplo de log:
```json
[INFO] {"timestamp":"2026-02-08T12:00:00.000Z","level":"info","message":"server_start","port":4000,"env":"development"}
```

---

**✅ Tudo pronto! Use `npm start` e acompanhe os logs no terminal.**
