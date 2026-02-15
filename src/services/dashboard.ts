import sql from '../database/db';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export class DashboardService {

    /**
     * ============================
     * DASHBOARD PRINCIPAL
     * ============================
     */
    static async getDashboardData(userId: number) {
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = agora.getFullYear();
        const mesNome = `${MESES[mesAtual - 1]} ${anoAtual}`;

        /**
         * RECEITA DO MÊS
         */
        const receitaMes = await sql`
            SELECT valor
            FROM receitas_mensais
            WHERE usuario_id = ${userId}
              AND mes = ${mesAtual}
              AND ano = ${anoAtual}
        `;
        const receitaValor = Number(receitaMes[0]?.valor || 0);

        /**
         * CONTAS FIXAS
         */
        const contasFixas = await sql`
            SELECT id, descricao, valor, dia_vencimento
            FROM contas_fixas
            WHERE ativo = true
              AND usuario_id = ${userId}
            ORDER BY dia_vencimento ASC
        `;
        const totalContasFixas = contasFixas.reduce(
            (acc, c) => acc + Number(c.valor), 0
        );

        /**
         * PAGAMENTOS DE DÍVIDAS NO MÊS
         */
        const pagamentosDividas = await sql`
            SELECT SUM(valor_pago) AS total
            FROM pagamentos_divida
            WHERE EXTRACT(MONTH FROM data_pagamento) = ${mesAtual}
              AND EXTRACT(YEAR FROM data_pagamento) = ${anoAtual}
              AND divida_id IN (
                  SELECT id FROM dividas WHERE usuario_id = ${userId}
              )
        `;
        const totalPagamentosDividas = Number(pagamentosDividas[0]?.total || 0);

        /**
         * DÍVIDAS ATIVAS
         */
        const dividas = await sql`
            SELECT
                id,
                descricao,
                valor_total,
                valor_pago
            FROM dividas
            WHERE quitada = false
              AND usuario_id = ${userId}
        `;

        /**
         * CÁLCULOS
         */
        const gastoTotal = totalContasFixas + totalPagamentosDividas;
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
                valor_restante: Number(d.valor_total) - Number(d.valor_pago)
            }))
        };
    }

    /**
     * ============================
     * ATUALIZAR RECEITA DO MÊS
     * ============================
     */
    static async atualizarReceitaMes(userId: number, valor: number) {
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = agora.getFullYear();

        await sql`
            INSERT INTO receitas_mensais (usuario_id, mes, ano, valor, updated_at)
            VALUES (${userId}, ${mesAtual}, ${anoAtual}, ${valor}, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, mes, ano)
            DO UPDATE SET
                valor = ${valor},
                updated_at = CURRENT_TIMESTAMP
        `;

        return { success: true, nova_receita: valor };
    }

    /**
     * ============================
     * PROCESSAR MENSAGEM IA
     * ============================
     */
    static async processarMensagemIA(userId: number, mensagem: string) {
        const dashboardData = await this.getDashboardData(userId);
        const insights: string[] = [];
        let resposta = '';

        if (dashboardData.receita_mes > 0) {
            const percentualGasto =
                (dashboardData.gasto_total / dashboardData.receita_mes) * 100;

            if (percentualGasto > 80) {
                insights.push(
                    `⚠️ Seus gastos representam ${percentualGasto.toFixed(0)}% da receita.`
                );
            } else {
                insights.push(
                    `✅ Seus gastos estão em ${percentualGasto.toFixed(0)}% da receita.`
                );
            }

            if (dashboardData.sobra > 0) {
                insights.push(
                    `💰 Você tem R$ ${dashboardData.sobra.toFixed(2)} livres este mês.`
                );
            } else {
                insights.push(
                    `🚨 Suas despesas excedem a receita em R$ ${Math.abs(dashboardData.sobra).toFixed(2)}.`
                );
            }
        }

        const msg = mensagem.toLowerCase();

        if (msg.includes('economizar') || msg.includes('poupar')) {
            resposta =
                'Sugiro revisar contas fixas, limitar gastos variáveis e guardar pelo menos 10% da receita.';
        } else if (msg.includes('divida') || msg.includes('dívida')) {
            const totalDividas = dashboardData.dividas.reduce(
                (a, d) => a + d.valor_restante, 0
            );
            resposta =
                `Você possui ${dashboardData.dividas.length} dívida(s) ativas, totalizando R$ ${totalDividas.toFixed(2)} restantes.`;
        } else if (msg.includes('gasto')) {
            resposta =
                `Seu gasto mensal atual é de R$ ${dashboardData.gasto_total.toFixed(2)}.`;
        } else {
            resposta =
                `Resumo do mês: Receita R$ ${dashboardData.receita_mes.toFixed(2)}, Gastos R$ ${dashboardData.gasto_total.toFixed(2)}, Sobra R$ ${dashboardData.sobra.toFixed(2)}.`;
        }

        await sql`
            INSERT INTO chat_historico (usuario_id, mensagem, resposta)
            VALUES (${userId}, ${mensagem}, ${resposta})
        `;

        return { resposta, insights };
    }

    /**
     * ============================
     * INSIGHT DE ORGANIZAÇÃO
     * ============================
     */
    static async getInsightOrganizacao(userId: number) {
        const data = await this.getDashboardData(userId);
        const insights: string[] = [];

        if (data.receita_mes === 0) {
            return {
                titulo: 'Cadastre sua receita',
                insights: ['Informe sua receita mensal para receber análises.']
            };
        }

        const percentualGasto = (data.gasto_total / data.receita_mes) * 100;

        if (percentualGasto > 90) {
            insights.push('🚨 Você está gastando mais de 90% da sua receita.');
        } else if (percentualGasto > 70) {
            insights.push('⚠️ Seus gastos estão altos, atenção.');
        } else {
            insights.push('✅ Seus gastos estão sob controle.');
        }

        if (data.dividas.length > 0) {
            const totalDividas = data.dividas.reduce(
                (a, d) => a + d.valor_restante, 0
            );
            insights.push(
                `💳 Dívidas ativas somam R$ ${totalDividas.toFixed(2)}.`
            );
        } else {
            insights.push('🎉 Você não possui dívidas ativas.');
        }

        return {
            titulo: 'Análise do mês',
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
