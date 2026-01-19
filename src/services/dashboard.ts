import sql from '../database/db';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export class DashboardService {
    static async getDashboardData(userId: number) {
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = agora.getFullYear();
        const mesNome = `${MESES[mesAtual - 1]} ${anoAtual}`;

        // Buscar receita do mês atual definida pelo usuário
        const receitaMes = await sql`
            SELECT valor FROM receitas_mensais
            WHERE usuario_id = ${userId} AND mes = ${mesAtual} AND ano = ${anoAtual}
        `;
        const receitaValor = Number(receitaMes[0]?.valor || 0);

        // Buscar contas fixas ativas
        const contasFixas = await sql`
            SELECT id, descricao, valor, dia_vencimento
            FROM contas_fixas
            WHERE ativo = true AND usuario_id = ${userId}
            ORDER BY dia_vencimento ASC
        `;
        const totalContasFixas = contasFixas.reduce((acc, c) => acc + Number(c.valor), 0);

        // Buscar dívidas não quitadas
        const dividas = await sql`
            SELECT
                id,
                descricao,
                valor_parcela,
                parcelas_total,
                parcelas_pagas,
                (parcelas_total - parcelas_pagas) as parcelas_restantes
            FROM dividas
            WHERE quitada = false AND usuario_id = ${userId}
        `;
        const totalParcelasMes = dividas.reduce((acc, d) => acc + Number(d.valor_parcela), 0);

        // Calcular gasto total e sobra
        const gastoTotal = totalContasFixas + totalParcelasMes;
        const sobra = receitaValor - gastoTotal;

        return {
            mes_atual: mesNome,
            receita_mes: receitaValor,
            gasto_total: gastoTotal,
            sobra,
            contas_fixas: contasFixas.map(c => ({
                id: c.id,
                descricao: c.descricao,
                valor: Number(c.valor),
                vencimento: c.dia_vencimento
            })),
            dividas: dividas.map(d => ({
                id: d.id,
                descricao: d.descricao,
                valor_parcela: Number(d.valor_parcela),
                parcelas_restantes: Number(d.parcelas_restantes)
            }))
        };
    }

    static async atualizarReceitaMes(userId: number, valor: number) {
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = agora.getFullYear();

        // Upsert - insere ou atualiza se já existir
        await sql`
            INSERT INTO receitas_mensais (usuario_id, mes, ano, valor, updated_at)
            VALUES (${userId}, ${mesAtual}, ${anoAtual}, ${valor}, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, mes, ano)
            DO UPDATE SET valor = ${valor}, updated_at = CURRENT_TIMESTAMP
        `;

        return { success: true, nova_receita: valor };
    }

    static async processarMensagemIA(userId: number, mensagem: string) {
        // Buscar dados do usuário para contextualizar a resposta
        const dashboardData = await this.getDashboardData(userId);

        // Gerar insight baseado nos dados
        let resposta = '';
        const insights: string[] = [];

        // Análise básica dos dados
        if (dashboardData.receita_mes > 0) {
            const percentualGasto = (dashboardData.gasto_total / dashboardData.receita_mes) * 100;

            if (percentualGasto > 80) {
                insights.push(`Seus gastos representam ${percentualGasto.toFixed(0)}% da sua receita. Considere revisar despesas.`);
            } else if (percentualGasto < 50) {
                insights.push(`Parabéns! Você gasta apenas ${percentualGasto.toFixed(0)}% da sua receita.`);
            }

            if (dashboardData.sobra > 0) {
                insights.push(`Você tem R$ ${dashboardData.sobra.toFixed(2)} disponível este mês.`);
            } else {
                insights.push(`Atenção: seus gastos excedem sua receita em R$ ${Math.abs(dashboardData.sobra).toFixed(2)}.`);
            }
        }

        // Respostas baseadas em palavras-chave da mensagem
        const msgLower = mensagem.toLowerCase();

        if (msgLower.includes('economizar') || msgLower.includes('poupar')) {
            resposta = 'Para economizar mais, sugiro: 1) Revisar suas contas fixas e negociar valores; 2) Definir um limite mensal para gastos variáveis; 3) Criar uma meta de poupança de pelo menos 10% da receita.';
        } else if (msgLower.includes('dívida') || msgLower.includes('divida')) {
            const totalDividas = dashboardData.dividas.reduce((acc, d) => acc + d.valor_parcela, 0);
            resposta = `Você tem ${dashboardData.dividas.length} dívida(s) ativa(s), totalizando R$ ${totalDividas.toFixed(2)} por mês em parcelas. Foque em quitar as com maior juros primeiro.`;
        } else if (msgLower.includes('gasto') || msgLower.includes('despesa')) {
            resposta = `Seu gasto mensal total é de R$ ${dashboardData.gasto_total.toFixed(2)}, sendo R$ ${dashboardData.contas_fixas.reduce((a, c) => a + c.valor, 0).toFixed(2)} em contas fixas.`;
        } else if (msgLower.includes('receita') || msgLower.includes('salário') || msgLower.includes('salario')) {
            resposta = `Sua receita cadastrada para ${dashboardData.mes_atual} é de R$ ${dashboardData.receita_mes.toFixed(2)}.`;
        } else if (msgLower.includes('sobra') || msgLower.includes('disponível') || msgLower.includes('disponivel')) {
            resposta = dashboardData.sobra >= 0
                ? `Você tem R$ ${dashboardData.sobra.toFixed(2)} disponível este mês após pagar todas as contas.`
                : `Atenção! Suas despesas excedem sua receita em R$ ${Math.abs(dashboardData.sobra).toFixed(2)}.`;
        } else {
            resposta = `Olá! Sou seu assistente financeiro. Posso ajudar com dicas sobre economia, análise de dívidas, gastos e planejamento. Sua situação atual: Receita R$ ${dashboardData.receita_mes.toFixed(2)}, Gastos R$ ${dashboardData.gasto_total.toFixed(2)}, Sobra R$ ${dashboardData.sobra.toFixed(2)}.`;
        }

        // Salvar no histórico
        await sql`
            INSERT INTO chat_historico (usuario_id, mensagem, resposta)
            VALUES (${userId}, ${mensagem}, ${resposta})
        `;

        return { resposta, insights };
    }

    static async getInsightOrganizacao(userId: number) {
        const data = await this.getDashboardData(userId);
        const insights: string[] = [];

        if (data.receita_mes === 0) {
            return {
                titulo: 'Cadastre sua receita',
                insights: ['Informe sua receita mensal para receber insights personalizados.']
            };
        }

        const percentualGasto = (data.gasto_total / data.receita_mes) * 100;

        // Análise de gastos
        if (percentualGasto > 90) {
            insights.push('⚠️ ALERTA: Você está gastando mais de 90% da sua receita!');
        } else if (percentualGasto > 70) {
            insights.push('📊 Seus gastos representam ' + percentualGasto.toFixed(0) + '% da receita. Há espaço para melhorar.');
        } else {
            insights.push('✅ Ótimo! Você gasta apenas ' + percentualGasto.toFixed(0) + '% da sua receita.');
        }

        // Análise de sobra
        if (data.sobra > 0) {
            const percentualSobra = (data.sobra / data.receita_mes) * 100;
            if (percentualSobra >= 20) {
                insights.push('💰 Excelente! Você consegue poupar ' + percentualSobra.toFixed(0) + '% da sua receita.');
            } else if (percentualSobra >= 10) {
                insights.push('👍 Você está conseguindo guardar ' + percentualSobra.toFixed(0) + '% da receita.');
            } else {
                insights.push('💡 Tente aumentar sua margem de economia para pelo menos 10%.');
            }
        } else {
            insights.push('🚨 Suas despesas excedem sua receita! Revise seus gastos urgentemente.');
        }

        // Análise de dívidas
        if (data.dividas.length > 0) {
            const totalParcelas = data.dividas.reduce((a, d) => a + d.valor_parcela, 0);
            const percentualDividas = (totalParcelas / data.receita_mes) * 100;

            if (percentualDividas > 30) {
                insights.push('💳 Dívidas consomem ' + percentualDividas.toFixed(0) + '% da receita. Priorize quitá-las.');
            } else {
                insights.push('💳 Dívidas representam ' + percentualDividas.toFixed(0) + '% da receita - dentro do aceitável.');
            }
        } else {
            insights.push('🎉 Parabéns! Você não tem dívidas ativas.');
        }

        return {
            titulo: 'Análise do seu mês',
            mes: data.mes_atual,
            resumo: {
                receita: data.receita_mes,
                gastos: data.gasto_total,
                sobra: data.sobra
            },
            insights
        };
    }
}
