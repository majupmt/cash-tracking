# 🔍 GUIA DE LOGS E DEBUGGING

## 📋 Como Acompanhar o que está Rolando por Trás dos Panos

### 1. Logs em Tempo Real

#### Iniciar a aplicação com logs visíveis:
```bash
bun run dev
```

Todos os logs aparecem no terminal em formato JSON estruturado:
```json
{
  "timestamp": "2026-02-08T00:30:49.969Z",
  "level": "info",
  "message": "💾 [POST] Adicionando nova receita",
  "userId": "123",
  "descricao": "Salário",
  "valor": 5000
}
```

---

### 2. Entender os Prefixos de Log

| Prefixo | Significado | Exemplo |
|---------|------------|---------|
| 📤 | GET - Buscando dados | `📤 [GET] Buscando receitas` |
| 💾 | POST - Salvando dados | `💾 [POST] Adicionando nova receita` |
| ✏️ | PUT - Atualizando dados | `✏️ [PUT/:id] Atualizando receita` |
| 🗑️ | DELETE - Deletando dados | `🗑️ [DELETE/:id] Deletando receita` |
| 📊 | DASHBOARD - Cálculos | `📊 [DASHBOARD/RESUMO] Buscando resumo` |
| ✅ | SUCESSO | `✅ [GET] Receitas encontradas` |
| ⚠️ | AVISO | `⚠️ [GET/:id] Receita não encontrada` |
| ❌ | ERRO | `❌ [GET] Erro ao buscar receitas` |

---

### 3. Fluxo de Uma Receita Sendo Adicionada

Quando você adiciona uma receita, os logs mostram:

```
💾 [POST] Adicionando nova receita
   userId: 456
   descricao: "Freelance"
   valor: 1500
   ↓
✅ [POST] Receita adicionada com sucesso
   id: 789
   valor: 1500
```

---

### 4. Fluxo do Dashboard Carregando

Quando o dashboard carrega, você vê:

```
📊 [DASHBOARD/RESUMO] Buscando resumo do dashboard
   userId: 456
   ✓ Receitas totais encontradas: 6500
   ✓ Contas fixas encontradas: 1589.80
   ✓ Dívidas encontradas: 2
   ✓ Parcelas do mês: 500
   ✓ Gastos mensais: 2089.80
   Disponível: 4410.20
   ↓
✅ [DASHBOARD/RESUMO] Resumo calculado com sucesso
```

---

### 5. Filtrando Logs no Terminal

#### Ver apenas erros:
```bash
bun run dev 2>&1 | grep "❌"
```

#### Ver apenas acessos ao dashboard:
```bash
bun run dev 2>&1 | grep "DASHBOARD"
```

#### Ver apenas operações com receitas:
```bash
bun run dev 2>&1 | grep -E "\[GET/PUT/POST\].*receita"
```

#### Ver logs em tempo real com cores:
```bash
bun run dev 2>&1 | grep --color=always .
```

---

### 6. Testes com Logs Detalhados

Os testes E2E agora também mostram logs detalhados:

```bash
bun run test:e2e
```

Você verá:
```
═══════════════════════════════════════════════════════
🚀 TEST START: Receita Integration Test
═══════════════════════════════════════════════════════
🔵 [SETUP] Navigating to welcome screen...
🔵 [SETUP] Clicking signup button...
💰 [STEP 2] Setting initial revenue to 5000
📁 [STEP 2] Uploading transaction CSV...
✅ [STEP 2] CSV uploaded successfully
🎯 [STEP 3] Navigating to dashboard...
📊 [STEP 4] Verifying initial balance display...
   📈 Income displayed: R$ 5000
   📉 Expenses displayed: R$ 800
   ⚖️  Balance displayed: R$ 4200
✅ [STEP 4] Income value verified
═══════════════════════════════════════════════════════
```

---

### 7. Estrutura de Logs do Backend

Todos os logs seguem este padrão:

```json
{
  "timestamp": "ISO-8601-DATE",
  "level": "info|warn|error|debug",
  "message": "Descrição amigável com emoji",
  "userId": "ID do usuário (se aplicável)",
  "...": "Dados adicionais contextuais"
}
```

---

### 8. Troubleshooting Usando Logs

#### Problema: "Receita não aparece no dashboard"

1. Procure no log:
   ```bash
   bun run dev 2>&1 | grep -E "(POST.*receita|DASHBOARD)"
   ```

2. Verificar se POST foi bem-sucedido:
   ```
   ✅ [POST] Receita adicionada com sucesso → OK
   ❌ [POST] Erro ao adicionar receita → ERRO!
   ```

3. Verificar se dashboard buscou receitas:
   ```
   📊 [DASHBOARD/RESUMO] ... Receitas totais encontradas: 1500 → OK
   ```

#### Problema: "Dashboard mostra valores incorretos"

1. Procure a seção de cálculo:
   ```bash
   bun run dev 2>&1 | grep "resumo calculado"
   ```

2. Verifique cada componente:
   - `totalReceitas`: Deve incluir suas receitas
   - `totalContas`: Contas fixas
   - `gastosMensais`: Soma de contas fixas + parcelas
   - `disponivel`: receitas - gastos

---

### 9. Consultar Dados Diretamente do Banco

Se quiser verificar se os dados realmente foram salvos:

```bash
# Conectar ao banco (estando dentro do container)
docker-compose exec postgres psql -U gabriel -d controle_financeiro

# Queries úteis:
SELECT * FROM usuarios;
SELECT * FROM receitas WHERE usuario_id = 1;
SELECT SUM(valor) as total FROM receitas WHERE usuario_id = 1;
```

---

### 10. Monitorar Performance

Os logs incluem timing. Para ver solicitações lentas:

```bash
bun run dev 2>&1 | grep -E "ERROR|Warning|timeout"
```

---

## 🚀 Próximos Passos

1. **Rodar os testes de integração:**
   ```bash
   bun run test:e2e
   ```

2. **Verificar testes unitários:**
   ```bash
   bun run test:unit
   ```

3. **Acompanhar logs em tempo real enquanto testa:**
   ```bash
   # Terminal 1:
   bun run dev
   
   # Terminal 2:
   bun run test:e2e
   ```

---

## 📊 Verificação de Integridade

O teste `receitas-integration.spec.ts` verifica:
- ✅ Receita é adicionada com sucesso
- ✅ Dashboard reflete a receita adicionada
- ✅ Percentuais estão corretos
- ✅ Fórmula: Income = Balance + Expenses + Fixed
- ✅ Dados persistem ao navegar

Rode com:
```bash
bun run test:e2e -- tests/e2e/receitas-integration.spec.ts
```
