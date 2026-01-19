import fs from 'fs/promises';
import { existsSync } from 'node:fs';

const pdf = require('pdf-parse');


/**
 * Extrai texto de um arquivo (PDF, CSV ou OFX)
 */
export async function extrairTexto(caminhoArquivo: string): Promise<string> {
    if (!existsSync(caminhoArquivo)){
        throw new Error('Arquivo não encontrado');
    }

    const extensao = caminhoArquivo.split('.').pop()?.toLowerCase();

    switch (extensao) {
        case 'pdf':
            return await extrairTextoPDF(caminhoArquivo);
        case 'csv':
            return await extrairTextoCSV(caminhoArquivo);
        case 'ofx':
            return await extrairTextoOFX(caminhoArquivo);
        case 'txt':  // ← ADICIONA ISSO
            return await extrairTextoTXT(caminhoArquivo);  
        default:
            throw new Error('Formato de arquivo não suportado');
    }
}

/**
 * Extrai texto de arquivo PDF
 */
async function extrairTextoPDF(caminho: string): Promise<string> {
    try {
        const buffer = await fs.readFile(caminho);
        const dados = await pdf(buffer);

        console.log(`📄 PDF processado: ${dados.numpages} páginas`);
    
        return dados.text;
    } catch (error) {
        console.error('Erro ao processar PDF:', error);
        throw new Error('Falha ao extrair PDF');
    }
}

/**
 * Extrai texto de arquivo CSV
 */
async function extrairTextoCSV(caminho: string): Promise<string> {
    try {
        const texto = await fs.readFile(caminho, 'utf-8');
        console.log('📊 CSV processado');
        return texto;
    } catch (error) {
        console.error('Erro ao processar CSV:', error);
        throw new Error('Falha ao extrair CSV');
    }
}

/**
 * Extrai texto de arquivo OFX
 */
async function extrairTextoOFX(caminho: string): Promise<string> {
    try {
        const texto = await fs.readFile(caminho, 'utf-8');
        console.log('💳 OFX processado');
        return texto;
    } catch (error) {
        console.error('Erro ao processar OFX:', error);
        throw new Error('Falha ao extrair OFX');
    }
}

/**
 * Extrai texto de arquivo TXT
 */
async function extrairTextoTXT(caminho: string): Promise<string> {
    try {
        const texto = await fs.readFile(caminho, 'utf-8');
        console.log('📝 TXT processado');
        return texto;
    } catch (error) {
        console.error('Erro ao processar TXT:', error);
        throw new Error('Falha ao extrair TXT');
    }
}

export function limparTexto(texto: string): string {
    let limpo = texto;

    // Remove múltiplos espaços NA MESMA LINHA (mas mantém quebras de linha)
    limpo = limpo.replace(/[^\S\n]+/g, ' '); // ← MUDANÇA AQUI

    // Remove linhas vazias
    limpo = limpo.split('\n')
        .filter(linha => linha.trim().length > 0)
        .join('\n');

    // Remove cabeçalhos comuns de bancos
    const padroes = [
        /Banco\s+\d+\s+-\s+Agência\s+\d+/gi,
        /Extrato\s+de\s+Conta\s+Corrente/gi,
        /Data\s+Descrição\s+Valor/gi,
        /Saldo\s+Anterior/gi,
        /Saldo\s+Atual/gi,
        /Período:/gi, // ← ADICIONA ISSO
        /Extrato\s+Bancário/gi, // ← ADICIONA ISSO
    ];

    padroes.forEach(regex => {
        limpo = limpo.replace(regex, '');
    });

    return limpo.trim();
}
/**
 * Extrai apenas linhas que parecem ser transações
 */
export function extrairLinhasTransacoes(texto: string): string[] {
    const linhas = texto.split('\n');

    const linhasTransacoes = linhas.filter(linha => {
        const temData = /\d{2}\/\d{2}(\/\d{4})?/.test(linha);
        const temValor = /R?\$?\s*[\d.,]+/.test(linha);
        return temData && temValor;
    });

    console.log(`🔍 ${linhasTransacoes.length} linhas de possíveis transações extraídas`);

    return linhasTransacoes;
}

/**
 * Salva arquivo temporário e retorna o caminho
 */
/**
 * Salva arquivo temporário e retorna o caminho
 */
export async function salvarArquivoTemp(arquivo: any): Promise<string> {
    console.log('🔍 DEBUG salvarArquivoTemp - arquivo completo:', arquivo);
    console.log('🔍 DEBUG salvarArquivoTemp - tipo:', typeof arquivo);
    console.log('🔍 DEBUG salvarArquivoTemp - constructor:', arquivo?.constructor?.name);
    console.log('🔍 DEBUG salvarArquivoTemp - keys:', Object.keys(arquivo || {}));
    
    // Garante que a pasta existe
    if (!existsSync('./uploads')) {
        await fs.mkdir('./uploads', { recursive: true });
    }

    const timestamp = Date.now();
    
    // Tenta pegar o nome de várias formas possíveis
    let nomeOriginal = 'arquivo_sem_nome.txt';
    
    if (arquivo?.name) {
        nomeOriginal = arquivo.name;
    } else if (arquivo?.filename) {
        nomeOriginal = arquivo.filename;
    } else if (arquivo?.originalname) {
        nomeOriginal = arquivo.originalname;
    }
    
    console.log('📝 Nome detectado:', nomeOriginal);
    
    // Limpa caracteres especiais do nome
    nomeOriginal = nomeOriginal.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const nomeArquivo = `${timestamp}_${nomeOriginal}`;
    const caminho = `./uploads/${nomeArquivo}`;

    // Converte o arquivo para Buffer
    let buffer: Buffer;
    
    try {
        if (arquivo.arrayBuffer && typeof arquivo.arrayBuffer === 'function') {
            console.log('🔄 Usando arrayBuffer()');
            const arrayBuffer = await arquivo.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (arquivo.buffer) {
            console.log('🔄 Usando .buffer');
            buffer = arquivo.buffer;
        } else if (Buffer.isBuffer(arquivo)) {
            console.log('🔄 Já é um Buffer');
            buffer = arquivo;
        } else if (arquivo.data) {
            console.log('🔄 Usando .data');
            buffer = Buffer.from(arquivo.data);
        } else {
            console.error('❌ Estrutura do arquivo não reconhecida');
            throw new Error('Não foi possível extrair o buffer do arquivo');
        }
    } catch (error) {
        console.error('❌ Erro ao extrair buffer:', error);
        throw new Error('Formato de arquivo não suportado: ' + error);
    }

    // Salva o arquivo temporariamente
    await fs.writeFile(caminho, buffer);

    console.log(`💾 Arquivo salvo temporariamente em: ${caminho}`);
    console.log(`📏 Tamanho: ${buffer.length} bytes`);

    // 1 hora = 3.600.000ms
    setTimeout(async () => {
        try {
            if (existsSync(caminho)) {
                await fs.unlink(caminho);
                console.log(`🗑️ Arquivo temporário removido: ${caminho}`);
            }
        } catch (error) {
            console.error('Erro ao deletar arquivo temp:', error);
        }
    }, 3600000);

    return caminho;
}

/**
 * Processa um arquivo completo: salva, extrai, limpa
 */
export async function processarArquivo(arquivo: any) {
    console.log(`🚀 Iniciando processamento do arquivo: ${arquivo.name}`);

    // Salva temporariamente
    const caminho = await salvarArquivoTemp(arquivo);

    // Extrai texto
    const textoCompleto = await extrairTexto(caminho);

    // Limpa texto
    const textoLimpo = limparTexto(textoCompleto);

    // Extrai linhas de transações
    const linhasTransacoes = extrairLinhasTransacoes(textoLimpo);

    console.log(`✅ Processamento concluído para o arquivo: ${arquivo.name}`);

    return {
        textoCompleto,
        textoLimpo,
        linhasTransacoes,
        totalLinhas: linhasTransacoes.length
    };
}