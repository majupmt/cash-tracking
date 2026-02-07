import { Elysia, t } from 'elysia';
import { parse } from 'csv-parse/sync';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentacao': ['supermercado', 'mercado', 'ifood', 'uber eats', 'rappi', 'restaurante', 'padaria', 'acougue', 'hortifruti', 'lanchonete', 'pizza', 'burger', 'sushi', 'food', 'alimenta'],
  'Transporte': ['uber', '99', 'cabify', 'posto', 'shell', 'ipiranga', 'br distribuidora', 'estacionamento', 'pedagio', 'combustivel', 'gasolina', 'metro', 'onibus'],
  'Saude': ['farmacia', 'drogasil', 'drogaria', 'hospital', 'clinica', 'medico', 'dentista', 'laboratorio', 'unimed', 'hapvida', 'academia', 'smart fit'],
  'Assinaturas': ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'youtube', 'apple', 'google one', 'icloud', 'adobe'],
  'Lazer': ['cinema', 'teatro', 'show', 'ingresso', 'bar', 'pub', 'festa', 'viagem', 'hotel', 'airbnb', 'game', 'jogo'],
  'Moradia': ['aluguel', 'condominio', 'energia', 'cemig', 'agua', 'copasa', 'gas', 'internet', 'iptu', 'luz'],
  'Educacao': ['udemy', 'coursera', 'alura', 'escola', 'faculdade', 'livro', 'livraria', 'curso', 'mensalidade'],
};

function categorize(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return 'Outros';
}

function normalizeDate(dateStr: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return `${y}-${m}-${d}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function parseCSV(content: string) {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    delimiter: [',', ';'],
  });

  return records.map((row: any, index: number) => {
    const date = row['Data'] || row['date'] || row['DATA'] || row['Data Transação'] || row['Data Transacao'] || '';
    const desc = row['Descrição'] || row['Descricao'] || row['Título'] || row['Titulo'] || row['description'] || row['DESCRICAO'] || row['Estabelecimento'] || '';
    const rawValue = row['Valor'] || row['value'] || row['VALOR'] || row['Quantia'] || '0';

    const value = parseFloat(
      rawValue.toString()
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\.(?=\d{3})/g, '')
        .replace(',', '.')
    );

    return {
      id: index + 1,
      date: normalizeDate(date),
      desc: desc.trim(),
      category: categorize(desc),
      value: isNaN(value) ? 0 : value,
    };
  }).filter((tx: any) => tx.desc && tx.value !== 0);
}

function parseOFX(content: string) {
  const transactions: any[] = [];
  const txRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  let id = 1;

  while ((match = txRegex.exec(content)) !== null) {
    const block = match[1];
    const getValue = (tag: string) => {
      const m = new RegExp(`<${tag}>([^<\\n]+)`, 'i').exec(block);
      return m ? m[1].trim() : '';
    };

    const dateRaw = getValue('DTPOSTED');
    const date = dateRaw.length >= 8
      ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
      : new Date().toISOString().slice(0, 10);

    const desc = getValue('MEMO') || getValue('NAME');
    const value = parseFloat(getValue('TRNAMT').replace(',', '.'));

    if (desc && !isNaN(value)) {
      transactions.push({
        id: id++,
        date,
        desc,
        category: categorize(desc),
        value,
      });
    }
  }

  return transactions;
}

export const uploadRoutes = new Elysia({ prefix: '/api' })
  .post('/upload-extrato', async ({ body }) => {
    try {
      const file = body.file;
      const content = await file.text();
      const filename = file.name.toLowerCase();

      let transactions;
      if (filename.endsWith('.ofx') || filename.endsWith('.qfx')) {
        transactions = parseOFX(content);
      } else {
        transactions = parseCSV(content);
      }

      if (transactions.length === 0) {
        return { success: false, error: 'Nenhuma transacao encontrada no arquivo. Verifique o formato.' };
      }

      return {
        success: true,
        transactions,
        summary: {
          total: transactions.length,
          income: transactions.filter((t: any) => t.value > 0).reduce((s: number, t: any) => s + t.value, 0),
          expenses: transactions.filter((t: any) => t.value < 0).reduce((s: number, t: any) => s + Math.abs(t.value), 0),
          categories: [...new Set(transactions.map((t: any) => t.category))],
        }
      };
    } catch (error: any) {
      return { success: false, error: 'Erro ao processar arquivo: ' + error.message };
    }
  }, {
    body: t.Object({
      file: t.File()
    })
  });
