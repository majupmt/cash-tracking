interface Transacao {
    data: string;
    descricao: string;
    valor: number;
    tipo: 'receita' | 'despesa';
    categoria?: string;
}

/**
 * Extrai dados estruturados de uma linha de transação
 */
export function parseTransacao(linha: string): Transacao | null {
    // Remove espaços extras
    linha = linha.trim();

    // Regex para capturar: DATA + DESCRIÇÃO + VALOR

    const regex = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([-+]?R?\$?\s*[\d.,]+)$/;
    const match = linha.match(regex);

    if (!match) {
        return null; // Não conseguiu parsear
    }

    const [_, dataStr, descricao, valorStr] = match;

    // Parse da data
    const data = parseData(dataStr);

    // Parse do valor
    const valor = parseValor(valorStr);

    // Determina tipo (receita ou despesa)
    const tipo = valor >= 0 ? 'receita' : 'despesa';

    return {
        data,
        descricao: (descricao ?? '').trim(),
        valor: Math.abs(valor), // Sempre positivo
        tipo
    };
}

/**
 * Converte data DD/MM/YYYY para YYYY-MM-DD
 */
function parseData(dataStr: string | undefined): string {
    if (!dataStr) {
        return new Date().toISOString().split('T')[0] ?? ''; // Data atual como fallback
    }
    
    const partes = dataStr.split('/');
    const dia = partes[0] ?? '';
    const mes = partes[1] ?? '';
    const ano = partes[2] ?? '';

    if (!dia || !mes || !ano) {
        return new Date().toISOString().split('T')[0] ?? '';
    }

    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}


/**
 * Converte string de valor para número
 * Ex: "-R$ 250,00" -> -250.00
 * Ex: "+R$ 5.000,00" -> 5000.00
 */
function parseValor(valorStr: string | undefined): number {
    if (!valorStr) {
        return 0;
    }
    
    // Remove tudo exceto números, vírgula, ponto, sinal
    let limpo = valorStr.replace(/[^\d,.\-+]/g, '');

    // Substitui vírgula por ponto (padrão brasileiro)
    limpo = limpo.replace(/\./g, ''); // Remove ponto de milhar
    limpo = limpo.replace(',', '.'); // Vírgula vira ponto decimal

    return parseFloat(limpo) || 0;
}

/**
 * Processa múltiplas linhas e retorna transações válidas
 */
export function validarTransacoes(linhas: string[]): Transacao[] {
    const transacoes: Transacao[] = [];

    for (const linha of linhas) {
        const transacao = parseTransacao(linha);
        
        if (transacao) {
            transacoes.push(transacao);
        } else {
            console.log(`⚠️  Linha ignorada (não é transação): ${linha.substring(0, 50)}...`);
        }
    }

    console.log(`✅ ${transacoes.length} transações válidas encontradas`);

    return transacoes;
}

/**
 * Valida se uma transação tem todos os campos obrigatórios
 */
export function validarTransacao(transacao: Transacao): boolean {
    if (!transacao.data || !/^\d{4}-\d{2}-\d{2}$/.test(transacao.data)) {
        return false;
    }

    if (!transacao.descricao || transacao.descricao.length < 3) {
        return false;
    }

    if (isNaN(transacao.valor) || transacao.valor < 0) {
        return false;
    }

    if (!['receita', 'despesa'].includes(transacao.tipo)) {
        return false;
    }

    return true;
}