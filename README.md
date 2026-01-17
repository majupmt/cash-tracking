# Cash Tracking

Sistema de controle financeiro pessoal desenvolvido com Bun, Elysia e PostgreSQL.

## 🚀 Como rodar o projeto

### Instalar dependências:

```bash
bun install
```

### Executar o servidor:

```bash
bun run index.ts
```

## 🛠️ Tecnologias

- **Runtime:** Bun v1.3.5+
- **Framework:** Elysia
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT + bcrypt

## 📦 Estrutura do projeto

```
cash-tracking/
├── src/
│   ├── database/       # Configuração e migrações do banco
│   ├── middleware/     # Middlewares (auth, etc)
│   ├── routes/         # Rotas da API
│   ├── services/       # Lógica de negócio
│   ├── types/          # Definições TypeScript
│   └── utils/          # Utilitários
├── public/             # Frontend
│   ├── index.html
│   ├── app.js
│   └── style.css
└── index.ts            # Entry point
```

---

Desenvolvido com [Bun](https://bun.com) 🚀
