import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { formatarData, formatarDataHora } from '../utils/formatters';

export const dividasRoutes = new Elysia({ prefix: '/dividas' })

    // Listar todas as dívidas não quitadas
    .get('/', async () => {
        const dividas = await sql`
            SELECT * FROM dividas
            WHERE quitada = false
            ORDER BY created_at DESC
        `;
        
        return dividas.map(d => ({
            ...d,
            data_inicio: formatarData(d.data_inicio),
            created_at: formatarDataHora(d.created_at),
            parcelas_restantes: (d.parcelas_total || 0) - (d.parcelas_pagas || 0),
            valor_restante: ((d.parcelas_total || 0) - (d.parcelas_pagas || 0)) * (d.valor_parcela || 0)
        }));
    })

    // Buscar dívida por ID
    .get('/:id', async ({ params }) => {
        const [divida] = await sql`
            SELECT * FROM dividas WHERE id = ${params.id}
        `;
        if (!divida) {
            return { error: 'Dívida não encontrada' };
        }
        
        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at),
            parcelas_restantes: (divida.parcelas_total || 0) - (divida.parcelas_pagas || 0),
            valor_restante: ((divida.parcelas_total || 0) - (divida.parcelas_pagas || 0)) * (divida.valor_parcela || 0)
        };
    })

    // Criar nova dívida
    .post('/', async ({ body }) => {
        const [divida] = await sql`
            INSERT INTO dividas (
                descricao, 
                valor_total, 
                valor_parcela,
                parcelas_total,
                parcelas_pagas,
                data_inicio
            )
            VALUES (
                ${body.descricao}, 
                ${body.valor_total}, 
                ${body.valor_parcela},
                ${body.parcelas_total},
                ${body.parcelas_pagas || 0},
                ${body.data_inicio}
            )
            RETURNING *
        `;
        
        if (!divida) {
            return { error: 'Erro ao criar dívida' };
        }
        
        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at)
        };
    }, {
        body: t.Object({
            descricao: t.String(),
            valor_total: t.Number(),
            valor_parcela: t.Number(),
            parcelas_total: t.Number(),
            parcelas_pagas: t.Optional(t.Number()),
            data_inicio: t.String()
        })
    })

    // Atualizar dívida
    .put('/:id', async ({ params, body }) => {
        const [divida] = await sql`
            UPDATE dividas
            SET descricao = ${body.descricao},
                valor_total = ${body.valor_total},
                valor_parcela = ${body.valor_parcela},
                parcelas_total = ${body.parcelas_total},
                parcelas_pagas = ${body.parcelas_pagas},
                data_inicio = ${body.data_inicio},
                quitada = ${body.quitada !== undefined ? body.quitada : false}
            WHERE id = ${params.id}
            RETURNING *
        `;
        
        if (!divida) {
            return { error: 'Dívida não encontrada' };
        }
        
        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at)
        };
    }, {
        body: t.Object({
            descricao: t.String(),
            valor_total: t.Number(),
            valor_parcela: t.Number(),
            parcelas_total: t.Number(),
            parcelas_pagas: t.Number(),
            data_inicio: t.String(),
            quitada: t.Optional(t.Boolean())
        })
    })

    // Marcar como quitada
    .delete('/:id', async ({ params }) => {
        const [divida] = await sql`
            UPDATE dividas 
            SET quitada = true 
            WHERE id = ${params.id}
            RETURNING *
        `;
        return divida || { error: 'Dívida não encontrada' };
    })
    
    // Registrar pagamento de parcela
    .post('/:id/pagar-parcela', async ({ params }) => {
        const [divida] = await sql`
            UPDATE dividas 
            SET parcelas_pagas = parcelas_pagas + 1
            WHERE id = ${params.id}
            RETURNING *
        `;
        
        if (!divida) {
            return { error: 'Dívida não encontrada' };
        }
        
        // Se pagou todas as parcelas, marca como quitada
        if (divida.parcelas_pagas >= divida.parcelas_total) {
            await sql`
                UPDATE dividas SET quitada = true WHERE id = ${params.id}
            `;
        }
        
        return {
            ...divida,
            parcelas_restantes: divida.parcelas_total - divida.parcelas_pagas,
            mensagem: `Parcela registrada! Faltam ${divida.parcelas_total - divida.parcelas_pagas} parcelas`
        };
    });