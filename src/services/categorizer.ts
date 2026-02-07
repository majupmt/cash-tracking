const CATEGORY_RULES: [RegExp, string][] = [
  [/mercado livre|shopee|amazon(?! prime)|compra|loja|shopping/, 'Compras'],
  [/uber|99|taxi|onibus|metro|combustivel|posto|shell|ipiranga|estacionamento/, 'Transporte'],
  [/supermercado|mercado|ifood|rappi|padaria|restaurante|lanchonete|uber eats|alimenta/, 'Alimentacao'],
  [/farmacia|hospital|medico|consulta|plano de saude|academia|smart fit|drogasil/, 'Saude'],
  [/aluguel|condominio|iptu|luz|agua|\bgas\b|internet|moradia/, 'Moradia'],
  [/netflix|spotify|amazon prime|disney|hbo|youtube|assinatura/, 'Assinaturas'],
  [/cinema|teatro|parque|\bbar\b|balada|lazer|jogo|game/, 'Lazer'],
  [/curso|livr[oa]|udemy|escola|faculdade|educa/, 'Educacao'],
];

export function categorize(descricao: string): string {
  const d = descricao.toLowerCase();
  for (const [regex, category] of CATEGORY_RULES) {
    if (regex.test(d)) return category;
  }
  return 'Outros';
}
