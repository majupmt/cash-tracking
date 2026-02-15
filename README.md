<div align="center">

# Cash Tracking

**Controle financeiro inteligente com categorizacao por IA**

![CI](https://github.com/majupmt/cash-tracking/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Bun](https://img.shields.io/badge/Bun-1.0+-f9f1e1?logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)

[Live Demo](https://cash-tracking.vercel.app) · [API Docs](#api) · [Roadmap](#roadmap)

</div>

---

## Sobre

Cash Tracking e uma aplicacao full-stack de gestao financeira que permite importar extratos bancarios, categorizar transacoes automaticamente via IA, e visualizar insights sobre seus gastos em um dashboard interativo.

**Funcionalidades:**
- Upload de extratos (PDF, CSV) com parsing automatico
- Categorizacao inteligente via Claude API (Anthropic)
- Dashboard com graficos de gastos por categoria
- Controle de dividas com progresso de pagamento
- Contas fixas com alertas de vencimento
- Test drive sem cadastro para experimentar
- Insights mensais gerados por IA

---

## Tech Stack

| Camada | Tecnologia | Por que |
|--------|-----------|---------|
| Runtime | **Bun** | 3x mais rapido que Node.js, all-in-one |
| Backend | **Elysia** | Framework type-safe nativo pra Bun, 21x mais rapido que Express |
| ORM | **Drizzle** | Type-safe, migrations automaticas, syntax proxima do SQL |
| Banco | **PostgreSQL 16** | ACID para dados financeiros, relacional |
| Frontend | **Next.js 14** | App Router, SSR, deploy otimizado |
| Styling | **Tailwind CSS** | Utility-first, design system consistente |
| IA | **Claude API** | Categorizacao e insights financeiros |
| Testes | **Jest + Playwright** | Unit + E2E, 87 specs passando |
| CI/CD | **GitHub Actions** | Lint, typecheck, test, build, deploy automatico |
| Infra | **Docker** | PostgreSQL containerizado, ambiente reprodutivel |
| Deploy | **Vercel + Railway** | Frontend edge + backend com PostgreSQL gerenciado |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│                  Next.js 14 (Vercel)                    │
│         ┌──────┬──────┬──────┬──────┬──────┐           │
│         │Welco-│Login │Sign- │Test  │Dash- │           │
│         │ me   │      │ up   │Drive │board │           │
│         └──┬───┴──┬───┴──┬───┴──┬───┴──┬───┘           │
│            └──────┴──────┴──────┴──────┘                │
│                         │ /api/*                        │
└─────────────────────────┼───────────────────────────────┘
                          │ rewrite proxy
┌─────────────────────────┼───────────────────────────────┐
│                    BACKEND                              │
│              Bun + Elysia (Railway)                     │
│                         │                               │
│    ┌────────────────────┼────────────────────┐          │
│    │   Routes           │    Services        │          │
│    │  /auth/*           │   categorizer      │          │
│    │  /transacoes/*     │   dashboard        │          │
│    │  /receitas/*       │   extrato-parser   │          │
│    │  /dividas/*        │                    │          │
│    │  /contas/*         │    Claude API ◆────┼──► IA    │
│    │  /extrato/*        │                    │          │
│    │  /dashboard/*      │                    │          │
│    └────────┬───────────┴────────────────────┘          │
│             │ Drizzle ORM                               │
│    ┌────────┴────────┐                                  │
│    │  PostgreSQL 16  │ (Docker local / Railway prod)    │
│    └─────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

**Pre-requisitos:** [Bun](https://bun.sh) v1.0+ e [Docker](https://docker.com)

```bash
# Clone
git clone https://github.com/majupmt/cash-tracking.git
cd cash-tracking

# Instale dependencias
bun install && cd web && bun install && cd ..

# Suba o banco
docker compose up -d

# Configure o ambiente
cp .env.example .env

# Rode as migrations
bun run db:push

# Inicie tudo
bun run dev:all
```

Backend: `http://localhost:4000` · Frontend: `http://localhost:3000`

---

## API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/auth/cadastro` | Criar conta |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/receitas` | Listar receitas |
| POST | `/api/receitas` | Criar receita |
| GET | `/api/transacoes` | Listar transacoes |
| POST | `/api/transacoes` | Criar transacao |
| GET | `/api/dividas` | Listar dividas |
| GET | `/api/contas` | Listar contas fixas |
| GET | `/api/dashboard/resumo` | Dados do dashboard |
| POST | `/api/upload-extrato` | Upload de extrato |
| GET | `/api/health` | Health check |

Todas as rotas (exceto auth e health) exigem header `Authorization: Bearer {token}`.

---

## Scripts

```bash
# Desenvolvimento
bun run dev          # Backend (porta 4000)
bun run dev:web      # Frontend (porta 3000)
bun run dev:all      # Ambos simultaneamente

# Banco de dados
docker compose up -d   # Subir PostgreSQL
bun run db:push        # Aplicar schema
bun run db:studio      # Abrir Drizzle Studio (GUI)
bun run db:generate    # Gerar migrations

# Qualidade
bun run lint           # Biome lint
bun run lint:fix       # Auto-fix
bun run typecheck      # TypeScript check

# Testes
bun run test:unit      # Jest (unit)
bun run test:e2e       # Playwright (e2e)
bun run test           # Todos

# Build
bun run build:web      # Build Next.js para producao
```

---

## Decisoes Tecnicas

**Por que Bun ao inves de Node.js?**
Performance 3x superior e runtime all-in-one (bundler + package manager + test runner). Reduz complexidade do tooling.

**Por que Elysia ao inves de Express/Fastify?**
Type-safety end-to-end nativa, 21x mais rapido que Express em benchmarks, e projetado especificamente para Bun.

**Por que Drizzle ao inves de Prisma/TypeORM?**
Syntax proxima do SQL (nao abstrai demais), type-safe, migrations declarativas, e performance superior por nao usar query engine separado.

**Por que PostgreSQL ao inves de MongoDB?**
Dados financeiros exigem ACID, integridade referencial, e queries complexas (JOINs pra dashboard). PostgreSQL e o padrao da industria para fintech.

**Por que Next.js ao inves de React puro?**
App Router com SSR otimiza performance, rewrites simplificam a comunicacao com o backend, e deploy na Vercel e zero-config.

---

## Roadmap

- [x] CRUD de transacoes, receitas, dividas e contas fixas
- [x] Upload e parsing de extratos (PDF/CSV)
- [x] Autenticacao JWT
- [x] Dashboard com graficos
- [x] Test drive sem cadastro
- [x] Migracao para Drizzle ORM
- [x] Frontend Next.js + Tailwind
- [x] CI/CD com GitHub Actions
- [x] Deploy (Vercel + Railway)
- [ ] Categorizacao automatica via Claude API
- [ ] Insights mensais por IA
- [ ] PWA (app instalavel no celular)
- [ ] Multi-tenancy para modelo SaaS

---

## Autor

**Maria** — Dev full-stack em formacao, apaixonada por fintech e automacao.

[LinkedIn](https://linkedin.com/in/seu-perfil) · [GitHub](https://github.com/majupmt)
