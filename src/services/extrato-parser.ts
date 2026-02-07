import { categorize } from './categorizer';

export interface ParsedTransaction {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  categoria: string;
}

export function parseCSV(text: string): ParsedTransaction[] {
  const lines = text.split('\n').filter(l => l.trim());
  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    let parts = lines[i]!.split(';').map(p => p.trim());
    if (parts.length < 3) {
      parts = lines[i]!.split(',').map(p => p.trim());
    }

    if (parts.length >= 3) {
      const valor = parseFloat(parts[2]!.replace(',', '.'));
      if (!isNaN(valor)) {
        transactions.push({
          data: parts[0]!,
          descricao: parts[1]!,
          valor: Math.abs(valor),
          tipo: valor < 0 ? 'despesa' : 'receita',
          categoria: categorize(parts[1]!),
        });
      }
    }
  }

  return transactions;
}
