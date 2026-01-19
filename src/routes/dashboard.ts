import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';
import { DashboardService } from '../services/dashboard';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })

    // Resumo geral do mês atual (formato antigo - mantido para compatibilidade)
    .get('/resumo', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            // Buscar receitas ativas
            const receitas = await sql`
                SELECT SUM(valor) as total FROM receitas
                WHERE ativo = true AND usuario_id = ${userId}
            `;
            const totalReceitas = Number(receitas[0]?.total || 0);

            // Buscar contas fixas ativas
            const contas = await sql`
                SELECT SUM(valor) as total FROM contas_fixas
                WHERE ativo = true AND usuario_id = ${userId}
            `;
            const totalContas = Number(contas[0]?.total || 0);

            // Buscar dívidas não quitadas
            const dividas = await sql`
                SELECT
                    id,
                    descricao,
                    valor_parcela,
                    parcelas_total,
                    parcelas_pagas,
                    (parcelas_total - parcelas_pagas) as parcelas_restantes,
                    (parcelas_total - parcelas_pagas) * valor_parcela as valor_restante
                FROM dividas
                WHERE quitada = false AND usuario_id = ${userId}
            `;

            // Total a pagar em dívidas este mês (soma das parcelas)
            const parcelasMesAtual = dividas.reduce((acc, d) => acc + Number(d.valor_parcela), 0);
            const totalDevidasRestantes = dividas.reduce((acc, d) => acc + Number(d.valor_restante), 0);

            // Calcular disponível
            const gastosMensais = totalContas + parcelasMesAtual;
            const disponivel = totalReceitas - gastosMensais;

            return {
                receitas: totalReceitas,
                contas_fixas: totalContas,
                dividas_mes_atual: parcelasMesAtual,
                dividas_total_restante: totalDevidasRestantes,
                gastos_mensais: gastosMensais,
                disponivel,
                dividas_detalhes: dividas,
                resumo: `Receitas: R$ ${totalReceitas.toFixed(2)} | Gastos fixos: R$ ${gastosMensais.toFixed(2)} | Disponível: R$ ${disponivel.toFixed(2)}`
            };
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Nova rota: Dashboard data completo (novo formato para o design do Figma)
    .get('/data', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            return await DashboardService.getDashboardData(userId);
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Nova rota: Atualizar receita do mês
    .post('/atualizar-receita-mes', async ({ headers, body, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            const { valor } = body as { valor: number };

            if (typeof valor !== 'number' || valor < 0) {
                set.status = 400;
                return { error: 'Valor inválido' };
            }

            return await DashboardService.atualizarReceitaMes(userId, valor);
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Nova rota: Chat com IA
    .post('/chat-ia', async ({ headers, body, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            const { mensagem } = body as { mensagem: string };

            if (!mensagem || typeof mensagem !== 'string') {
                set.status = 400;
                return { error: 'Mensagem inválida' };
            }

            return await DashboardService.processarMensagemIA(userId, mensagem);
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Nova rota: Insight de organização
    .get('/insight-organizacao', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            return await DashboardService.getInsightOrganizacao(userId);
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Projeção de quitação de dívidas
    .get('/projecao-dividas', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const dividas = await sql`
                SELECT * FROM dividas
                WHERE quitada = false AND usuario_id = ${userId}
            `;

            const projecoes = dividas.map(divida => {
                const parcelasRestantes = Number(divida.parcelas_total) - Number(divida.parcelas_pagas);
                const valorParcela = Number(divida.valor_parcela);
                const valorRestante = parcelasRestantes * valorParcela;

                return {
                    divida: divida.descricao,
                    valor_parcela: `R$ ${valorParcela.toFixed(2)}`,
                    parcelas_restantes: parcelasRestantes,
                    valor_total_restante: `R$ ${valorRestante.toFixed(2)}`,
                    meses_para_quitar: parcelasRestantes,
                    previsao_quitacao: `${parcelasRestantes} ${parcelasRestantes === 1 ? 'mês' : 'meses'}`
                };
            });

            return projecoes;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    });
