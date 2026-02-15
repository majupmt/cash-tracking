# Setup do Banco de Dados

## 🐘 PostgreSQL com Docker

Para rodar a aplicação, você precisa de um PostgreSQL. Recomendamos usar Docker:

### 1. Iniciar o banco de dados:
```bash
bun run db:up
```

Isso vai iniciar um container PostgreSQL com:
- **User**: gabriel
- **Password**: postgres  
- **Database**: controle_financeiro
- **Port**: 5432

### 2. Verificar se o banco está rodando:
```bash
docker-compose ps
# ou
bun run db:logs
```

### 3. Parar o banco:
```bash
bun run db:down
```

### 4. Resetar o banco (apaga todos os dados):
```bash
bun run db:reset
```

---

## 🚀 Rodar a aplicação

Com o banco rodando, agora você pode:

```bash
# Modo desenvolvimento (com auto-reload)
bun run dev

# Modo produção
bun run start
```

A aplicação vai iniciar em `http://localhost:4000`

---

## ✅ Rodar testes

```bash
# Testes unitários (Jest)
bun run test:unit

# Testes E2E (Playwright) - precisa que a app esteja rodando
bun run test:e2e

# Todos os testes
bun run test
```

---

## 🔧 Troubleshooting

### Erro: "password authentication failed"
Certifique-se de que o PostgreSQL está rodando:
```bash
bun run db:up
```

### Erro: "port 5432 already in use"
Algo já está usando a porta. Opções:
```bash
# Parar e resetar
bun run db:reset

# Ou verificar qual processo está usando
sudo lsof -i :5432
```

### Ver logs do PostgreSQL
```bash
bun run db:logs
```

---

## 📝 Variáveis de ambiente

O arquivo `.env` está configurado para PostgreSQL local:
```
DATABASE_URL=postgresql://gabriel:postgres@127.0.0.1:5432/controle_financeiro
```

Se quiser usar **Supabase** ou outro banco em produção, altere o `DATABASE_URL` no `.env`.
