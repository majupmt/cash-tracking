# Cash Tracking

Sistema de controle financeiro pessoal com dashboard inteligente, categorizacao automatica de transacoes e insights por IA.

## Stack

- **Runtime:** [Bun](https://bun.sh) v1.3.5+
- **Backend:** [Elysia](https://elysiajs.com) (HTTP framework)
- **Banco de dados:** PostgreSQL (Supabase)
- **Autenticacao:** JWT + bcryptjs
- **Frontend:** Vanilla JS SPA (sem framework)
- **Testes:** Playwright (E2E) + Bun test (unitarios)

## Instalacao

```bash
bun install
```

## Configuracao

Crie um arquivo `.env` na raiz com as variaveis de conexao ao banco:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database
JWT_SECRET=sua_chave_secreta
```

Bun carrega o `.env` automaticamente.

## Executando

```bash
# Desenvolvimento (com hot reload)
bun run dev

# Producao
bun run start
```

O servidor sobe na porta **4000**: `http://localhost:4000`

## Testes

```bash
# Testes unitarios (categorizer, parser, validators)
bun test

# Testes E2E (Playwright — requer servidor rodando ou usa webServer config)
bun run test:e2e
```

### Cobertura de testes E2E

| Arquivo | O que testa |
|---------|-------------|
| `auth.spec.ts` | Login, registro, navegacao entre telas de autenticacao |
| `test-drive.spec.ts` | Fluxo test-drive: upload, entrada manual, navegacao ao dashboard |
| `transactions.spec.ts` | Update de receita, calculo de saldo, filtros, navegacao sidebar |
| `dashboard.spec.ts` | Cards de resumo, sidebar, navegacao entre views, valores acompanham receita |
| `upload.spec.ts` | Upload de CSV, processamento, feedback visual |
| `ia-insight.spec.ts` | Card de IA, botao de insight, view de insights |

### Testes unitarios

| Arquivo | O que testa |
|---------|-------------|
| `categorizer.test.ts` | Auto-categorizacao de transacoes por descricao |
| `extrato-parser.test.ts` | Parse de CSV (`;` e `,`), classificacao receita/despesa |
| `validators.test.ts` | Validacao de email, senha, moeda, data, sanitizacao |

## Estrutura do projeto

```
cash-tracking/
├── index.ts                    # Entry point — Elysia server
├── public/                     # Frontend SPA
│   ├── index.html              # HTML com todas as telas
│   ├── app.js                  # Logica do SPA (routing, render, state)
│   └── style.css               # Design system completo
├── src/
│   ├── database/
│   │   ├── db.ts               # Conexao PostgreSQL
│   │   └── migrations.ts       # Migracoes do banco
│   ├── middleware/
│   │   ├── auth.ts             # Extracao de JWT do header
│   │   └── request-logger.ts   # Log de requests
│   ├── routes/
│   │   ├── auth.ts             # POST /auth/login, /auth/cadastro
│   │   ├── receitas.ts         # CRUD /receitas
│   │   ├── dividas.ts          # CRUD /dividas
│   │   ├── contas.ts           # CRUD /contas_fixas
│   │   ├── dashboard.ts        # GET /dashboard/resumo, /dashboard/data
│   │   ├── extrato.ts          # Upload e parse de extratos
│   │   ├── transacoes.ts       # CRUD /transacoes
│   │   └── upload.ts           # Upload de arquivos
│   ├── services/
│   │   ├── dashboard.ts        # Logica de negocio do dashboard
│   │   ├── categorizer.ts      # Auto-categorizacao por regex
│   │   └── extrato-parser.ts   # Parser de CSV/OFX
│   ├── lib/
│   │   ├── logger.ts           # Logger estruturado
│   │   └── metrics.ts          # Metricas de request
│   ├── types/
│   │   └── auth.ts             # Tipos TypeScript
│   └── utils/
│       ├── validators.ts       # Validacoes (email, senha, etc)
│       └── formatters.ts       # Formatadores
├── tests/
│   ├── e2e/                    # Playwright specs
│   └── fixtures/               # Arquivos de teste (CSV)
├── playwright.config.ts        # Config Playwright
└── package.json
```

## API Endpoints

### Autenticacao
- `POST /auth/login` — Login com `{ email, senha }`
- `POST /auth/cadastro` — Registro com `{ nome, email, senha }`

### Receitas
- `GET /receitas/` — Listar receitas ativas
- `GET /receitas/:id` — Buscar receita por ID
- `POST /receitas/` — Criar receita `{ descricao, valor, data_recebimento?, recorrente? }`
- `PUT /receitas/:id` — Atualizar receita
- `DELETE /receitas/:id` — Soft delete (marca como inativa)

### Dashboard
- `GET /dashboard/resumo` — Resumo financeiro do mes
- `GET /dashboard/data` — Dados completos do dashboard
- `POST /dashboard/atualizar-receita-mes` — Atualizar receita mensal
- `POST /dashboard/chat-ia` — Chat com IA para insights
- `GET /dashboard/insight-organizacao` — Insight de organizacao
- `GET /dashboard/projecao-dividas` — Projecao de quitacao de dividas

### Dividas
- CRUD em `/dividas`

### Contas Fixas
- CRUD em `/contas_fixas`

### Transacoes
- CRUD em `/transacoes`

### Health
- `GET /api/health` — Status do servidor e banco
- `GET /api/metrics` — Metricas de requests

## Frontend

SPA com navegacao interna via `showScreen()`. Telas:

1. **Welcome** — Tela inicial com login/cadastro
2. **Login** — Autenticacao
3. **Signup** — Registro + opcao test-drive
4. **Test Drive** — Upload de extrato ou entrada manual (sem conta)
5. **Dashboard** — Views internas: Dashboard, Transacoes, Dividas, Contas Fixas, Insights IA

### Modo Test-Drive

Permite experimentar o app sem criar conta. Dados ficam em `sessionStorage` e nao sao salvos no servidor.

### Design System

- Tema dark premium (`#0a0e1a` fundo, `#6366f1` acentos indigo/violet)
- Fontes: DM Sans (display) + DM Mono (valores monetarios)
- Todos elementos interativos possuem `data-testid` para testes

---

Desenvolvido com [Bun](https://bun.sh)
