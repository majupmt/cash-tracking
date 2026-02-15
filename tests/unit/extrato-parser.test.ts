import { parseCSV } from '../../src/services/extrato-parser'

describe('parseCSV', () => {
  test('deve parsear CSV com separador ponto-e-virgula', () => {
    const csv = `data;descricao;valor
07/02/2026;SUPERMERCADO EXTRA;-150,00
07/02/2026;Salario;3500,00`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]!.descricao).toBe('SUPERMERCADO EXTRA');
    expect(result[0]!.valor).toBe(150);
    expect(result[0]!.tipo).toBe('despesa');
    expect(result[0]!.categoria).toBe('Alimentacao');
    expect(result[1]!.tipo).toBe('receita');
  });

  test('deve parsear CSV com separador virgula', () => {
    const csv = `data,descricao,valor
07/02/2026,Uber Trip,-25.50
07/02/2026,PIX Recebido,100.00`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]!.categoria).toBe('Transporte');
    expect(result[1]!.categoria).toBe('Outros');
  });

  test('deve ignorar linhas invalidas', () => {
    const csv = `data;descricao;valor
linha-invalida
07/02/2026;Netflix;-29,90`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0]!.descricao).toBe('Netflix');
  });

  test('deve retornar array vazio para CSV sem dados', () => {
    const csv = `data;descricao;valor`;
    expect(parseCSV(csv)).toHaveLength(0);
  });

  test('deve retornar array vazio para string vazia', () => {
    expect(parseCSV('')).toHaveLength(0);
  });

  test('valor deve ser sempre positivo (abs)', () => {
    const csv = `data;descricao;valor
07/02/2026;Teste;-99,99`;
    const result = parseCSV(csv);
    expect(result[0]!.valor).toBe(99.99);
  });
});
