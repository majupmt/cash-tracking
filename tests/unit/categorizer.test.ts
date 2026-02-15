import { categorize } from '../../src/services/categorizer';

describe('categorize', () => {
  test('deve categorizar transporte', () => {
    expect(categorize('UBER TRIP')).toBe('Transporte');
    expect(categorize('Posto Shell')).toBe('Transporte');
    expect(categorize('Estacionamento Centro')).toBe('Transporte');
  });

  test('deve categorizar alimentacao', () => {
    expect(categorize('SUPERMERCADO EXTRA')).toBe('Alimentacao');
    expect(categorize('iFood pedido')).toBe('Alimentacao');
    expect(categorize('Padaria Bom Dia')).toBe('Alimentacao');
  });

  test('deve categorizar moradia', () => {
    expect(categorize('Aluguel Apto')).toBe('Moradia');
    expect(categorize('Conta de Luz')).toBe('Moradia');
    expect(categorize('Internet Vivo')).toBe('Moradia');
  });

  test('deve categorizar saude', () => {
    expect(categorize('Farmacia Drogasil')).toBe('Saude');
    expect(categorize('Smart Fit mensalidade')).toBe('Saude');
  });

  test('deve categorizar assinaturas', () => {
    expect(categorize('Netflix mensal')).toBe('Assinaturas');
    expect(categorize('Spotify Premium')).toBe('Assinaturas');
  });

  test('deve categorizar lazer', () => {
    expect(categorize('Cinema Cinemark')).toBe('Lazer');
    expect(categorize('Bar do Zeca')).toBe('Lazer');
  });

  test('deve categorizar educacao', () => {
    expect(categorize('Curso Udemy')).toBe('Educacao');
    expect(categorize('Livraria Cultura')).toBe('Educacao');
  });

  test('deve categorizar compras', () => {
    expect(categorize('Mercado Livre compra')).toBe('Compras');
    expect(categorize('Shopee pedido')).toBe('Compras');
  });

  test('deve retornar Outros para descricao desconhecida', () => {
    expect(categorize('PIX recebido')).toBe('Outros');
    expect(categorize('Transferencia bancaria')).toBe('Outros');
  });
});
