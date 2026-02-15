import { Elysia, t } from 'elysia';
import { parse } from 'csv-parse/sync';
import { logger } from '../lib/logger';

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
   const getValue = (tag: string): string => {
      const m = new RegExp(`<${tag}>([^<\\n]+)`, 'i').exec(block);
      return m?.[1]?.trim() ?? '';
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
  .post('/upload-extrato', async ({ body, set }) => {
    try {
      const file = body.file as any;
      
      if (!file || !file.name) {
        set.status = 400;
        return { success: false, error: 'Nenhum arquivo foi enviado' };
      }

      const filename = file.name.toLowerCase();
      
      logger.info('upload_start', { filename, size: file.size });

      // Limite de 10MB
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        set.status = 400;
        logger.warn('upload_too_large', { filename, size: file.size });
        return { 
          success: false, 
          error: `Arquivo muito grande. Máximo: 10MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
        };
      }

      // Validar extensão
      const validExtensions = ['.csv', '.ofx', '.qfx'];
      const fileExt = filename.substring(filename.lastIndexOf('.'));
      if (!validExtensions.includes(fileExt)) {
        set.status = 400;
        logger.warn('upload_invalid_ext', { filename, ext: fileExt });
        return { 
          success: false, 
          error: `Formato não suportado. Aceita: CSV, OFX, QFX` 
        };
      }
      
      let transactions;
      
      logger.info('upload_parsing', { filename, format: fileExt });
      const content = await file.text();
      if (filename.endsWith('.ofx') || filename.endsWith('.qfx')) {
        transactions = parseOFX(content);
      } else {
        transactions = parseCSV(content);
      }

      logger.info('upload_parsed', { filename, count: transactions.length });

      if (transactions.length === 0) {
        set.status = 400;
        logger.warn('upload_no_transactions', { filename });
        return { success: false, error: 'Nenhuma transacao encontrada no arquivo. Verifique o formato.' };
      }

      // Limite máximo de transações por upload: 500
      if (transactions.length > 500) {
        set.status = 400;
        logger.warn('upload_too_many', { filename, count: transactions.length });
        return { 
          success: false, 
          error: `Muitas transações (${transactions.length}). Máximo: 500 por arquivo.` 
        };
      }

      const summary = {
        total: transactions.length,
        income: transactions.filter((t: any) => t.value > 0).reduce((s: number, t: any) => s + t.value, 0),
        expenses: transactions.filter((t: any) => t.value < 0).reduce((s: number, t: any) => s + Math.abs(t.value), 0),
        categories: Array.from(new Set(transactions.map((t: any) => t.category))),
      };

      logger.info('upload_success', { filename, summary });

      return {
        success: true,
        transactions,
        summary,
      };
    } catch (error: any) {
      set.status = 500;
      logger.error('upload_error', { error: error.message, stack: error.stack });
      return { success: false, error: 'Erro ao processar arquivo: ' + error.message };
    }
  }, {
    body: t.Object({
      file: t.File()
    })
  });
