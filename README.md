# 💰 Cash Tracking

Aplicação web de controle financeiro pessoal com análise inteligente de extratos bancários.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Bun](https://img.shields.io/badge/bun-v1.0+-black)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)

---

## 📋 **Sobre o Projeto**

Cash Tracking é uma aplicação completa de gestão financeira que permite:

- ✅ **Input Manual**: Adicione receitas, despesas e dívidas manualmente
- 🤖 **Chat com IA**: Descreva suas transações e a IA as organiza automaticamente
- 📄 **Import de Extrato**: Faça upload de PDF/CSV/TXT e extraia transações automaticamente
- 📊 **Dashboard Inteligente**: Visualize suas finanças de forma clara e organizada
- 🚗 **Test-Drive**: Experimente sem cadastro! Teste importando seu extrato

---

## 🛠️ **Tecnologias Utilizadas**

### **Backend**
- [Bun](https://bun.sh/) - Runtime JavaScript ultrarrápido
- [Elysia](https://elysiajs.com/) - Framework web para Bun
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
- [postgres.js](https://github.com/porsager/postgres) - Cliente PostgreSQL para Node.js
- [JWT](https://jwt.io/) - Autenticação segura
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Hash de senhas
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - Extração de texto de PDFs

### **Frontend**
- HTML5 + CSS3 (Vanilla)
- JavaScript ES6+
- Google Fonts (Poppins + Inter)

### **IA (Planejado)**
- [Claude API (Anthropic)](https://www.anthropic.com/) - Categorização inteligente de transações

---

## 🚀 **Como Rodar o Projeto**

### **Pré-requisitos**

- [Bun](https://bun.sh/) v1.0 ou superior
- [PostgreSQL](https://www.postgresql.org/) 14+
- Node.js 18+ (opcional, caso queira usar npm)

### **1️⃣ Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cash-tracking.git
cd cash-tracking
```

### **2️⃣ Instale as dependências**
```bash
bun install
```

### **3️⃣ Configure o banco de dados**

Crie um banco PostgreSQL:
```bash
# Entre no PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE controle_financeiro;

# Crie um usuário (opcional)
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE controle_financeiro TO seu_usuario;
```

### **4️⃣ Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=controle_financeiro
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao

# Servidor
PORT=4000
```

### **5️⃣ Rode as migrations**
```bash
bun run src/database/run-migrations.ts
```

### **6️⃣ Inicie o servidor**
```bash
bun run index.ts
```

O servidor estará rodando em: **http://localhost:4000**

---

## 📁 **Estrutura do Projeto**
```
cash-tracking/
├── public/                  # Frontend
│   ├── index.html          # Página principal
│   ├── style.css           # Estilos
│   └── app.js              # Lógica do frontend
├── src/
│   ├── database/           # Configuração do banco
│   │   ├── db.ts          # Conexão PostgreSQL
│   │   ├── migrations/    # Migrations
│   │   └── run-migrations.ts
│   ├── middleware/         # Middlewares
│   │   └── auth.ts        # Autenticação JWT
│   ├── routes/            # Rotas da API
│   │   ├── auth.ts        # Login/Cadastro
│   │   ├── receitas.ts    # Receitas
│   │   ├── contas.ts      # Contas fixas
│   │   ├── dividas.ts     # Dívidas
│   │   ├── dashboard.ts   # Dashboard
│   │   └── extrato.ts     # Upload e processamento
│   ├── services/          # Lógica de negócio
│   │   ├── fileProcessor.ts        # Extração de texto
│   │   └── transactionValidator.ts # Validação
│   └── types/             # TypeScript types
│       └── auth.ts
├── uploads/               # Arquivos temporários (não commitado)
├── .env                   # Variáveis de ambiente (não commitado)
├── .gitignore
├── bun.lockb
├── index.ts               # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 **Endpoints da API**

### **Autenticação**
```http
POST /auth/cadastro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### **Extrato Bancário**
```http
POST /extrato/upload
Content-Type: multipart/form-data

arquivo: [PDF/CSV/TXT]
```
```http
POST /extrato/confirmar
Authorization: Bearer {token}
Content-Type: application/json

{
  "arquivo_origem": "extrato-janeiro.pdf",
  "transacoes": [
    {
      "data": "2025-01-15",
      "descricao": "Supermercado",
      "valor": 250.00,
      "tipo": "despesa",
      "categoria": "alimentação"
    }
  ]
}
```

### **Dashboard**
```http
GET /dashboard/resumo
Authorization: Bearer {token}
```

### **Receitas / Contas / Dívidas**
```http
GET    /receitas          # Listar
POST   /receitas          # Criar
PUT    /receitas/:id      # Atualizar
DELETE /receitas/:id      # Deletar
```

*Mesma estrutura para `/contas` e `/dividas`*

---

## 🧪 **Como Testar**

### **Teste rápido com cURL**
```bash
# 1. Criar conta
curl -X POST http://localhost:4000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456"}'

# 2. Fazer login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","senha":"123456"}'

# 3. Upload de extrato
curl -X POST http://localhost:4000/extrato/upload \
  -F "arquivo=@uploads/extrato-teste.txt"

# 4. Ver dashboard (substitua TOKEN pelo token do login)
curl http://localhost:4000/dashboard/resumo \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎨 **Features Implementadas**

- [x] Autenticação com JWT
- [x] CRUD de Receitas, Contas e Dívidas
- [x] Upload de extrato (PDF/CSV/TXT)
- [x] Extração automática de transações
- [x] Validação e estruturação de dados
- [x] Persistência no banco de dados
- [x] Dashboard com resumo financeiro
- [x] Frontend responsivo

---

## 🚧 **Próximos Passos**

- [ ] Integração com Claude API (categorização IA)
- [ ] Chat com IA para input de transações
- [ ] Frontend do upload com drag & drop
- [ ] Preview editável de transações
- [ ] Gráficos e visualizações
- [ ] Export de relatórios (PDF/Excel)
- [ ] Notificações de vencimento
- [ ] App mobile (React Native)

---

## 🤝 **Como Contribuir**

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 **Autor**

**Maria Julia**

- GitHub: [@majupmt](https://github.com/majupmt)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

## 🙏 **Agradecimentos**

- [Anthropic](https://www.anthropic.com/) - Claude AI
- [Bun Team](https://bun.sh/) - Runtime incrível
- Comunidade open source

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐