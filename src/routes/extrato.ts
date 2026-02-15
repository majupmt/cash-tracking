import { Elysia } from 'elysia';

function categorize(descricao: string): string {
  const d = descricao.toLowerCase();
  if (/uber|99|taxi|onibus|metro|combustivel|posto|shell|ipiranga|estacionamento/.test(d)) return 'Transporte';
  if (/mercado|supermercado|ifood|rappi|padaria|restaurante|lanchonete|uber eats|alimenta/.test(d)) return 'Alimentacao';
  if (/aluguel|condominio|iptu|luz|agua|gas|internet|moradia/.test(d)) return 'Moradia';
  if (/farmacia|hospital|medico|consulta|plano de saude|academia|smart fit|drogasil/.test(d)) return 'Saude';
  if (/netflix|spotify|amazon prime|disney|hbo|youtube|assinatura/.test(d)) return 'Assinaturas';
  if (/cinema|teatro|parque|bar|balada|lazer|jogo|game/.test(d)) return 'Lazer';
  if (/curso|livro|udemy|escola|faculdade|educa/.test(d)) return 'Educacao';
  if (/mercado livre|shopee|amazon|compra|loja|shopping/.test(d)) return 'Compras';
  return 'Outros';
}

function parseCSV(text: string) {
  const lines = text.split('\n').filter(l => l.trim());
  const transactions: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Try semicolon separator first, then comma
    const line = lines[i] ?? '';
    if (!line) continue;
    let parts = line.split(';').map(p => p.trim());
    if (parts.length < 3) {
      parts = line.split(',').map(p => p.trim());
    }

    if (parts.length >= 3) {
      const valor = parseFloat((parts[2] ?? '0').replace(',', '.'));
      if (!isNaN(valor)) {
        transactions.push({
          data: parts[0] ?? '',
          descricao: parts[1] ?? '',
          valor: Math.abs(valor),
          tipo: valor < 0 ? 'despesa' : 'receita',
          categoria: categorize(parts[1] ?? ''),
        });
      }
    }
  }

  return transactions;
}

export const extratoRoutes = new Elysia({ prefix: '/api/extrato' })

  .post('/upload', async ({ body, set }) => {
    try {
      const formData = body as Record<string, any>;
      const arquivo = formData.arquivo;

      if (!arquivo) {
        set.status = 400;
        return { error: 'Nenhum arquivo enviado' };
      }

      let text = '';

      if (arquivo instanceof File || arquivo instanceof Blob) {
        text = await arquivo.text();
      } else if (typeof arquivo === 'string') {
        text = arquivo;
      } else {
        set.status = 400;
        return { error: 'Formato de arquivo invalido' };
      }

      const transacoes = parseCSV(text);

      if (!transacoes.length) {
        set.status = 400;
        return { error: 'Nenhuma transacao encontrada no arquivo', transacoes: [] };
      }

      return { transacoes, count: transacoes.length };
    } catch (error) {
      set.status = 500;
      return { error: 'Erro ao processar arquivo', transacoes: [] };
    }
  })

  .post('/confirmar', async ({ body, headers, set }) => {
    try {
      const { transacoes } = body as { transacoes: any[] };

      if (!transacoes || !transacoes.length) {
        set.status = 400;
        return { error: 'Nenhuma transacao para confirmar' };
      }

      return { success: true, count: transacoes.length };
    } catch (error) {
      set.status = 500;
      return { error: 'Erro ao confirmar transacoes' };
    }
  });
