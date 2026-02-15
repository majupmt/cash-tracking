import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { formatarData, formatarDataHora } from '../utils/formatters';
import { extrairUsuarioDoHeader } from '../middleware/auth';

export const dividasRoutes = new Elysia({ prefix: '/api/dividas' })

/**
 * ============================
 * LISTAR DÍVIDAS EM ABERTO
 * ============================
 */
.get('/', async ({ headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const dividas = await sql`
            SELECT
            id,
            descricao,
            valor_total,
            valor_pago,
            (valor_total - valor_pago) AS valor_restante
            FROM dividas
            WHERE quitada = false
            AND usuario_id = ${userId}
        `;

        return dividas.map(d => ({
            ...d,
            data_inicio: formatarData(d.data_inicio),
            created_at: formatarDataHora(d.created_at),
            valor_restante: d.valor_total - d.valor_pago
        }));
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
})

/**
 * ============================
 * BUSCAR DÍVIDA POR ID
 * ============================
 */
.get('/:id', async ({ params, headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const [divida] = await sql`
            SELECT *
            FROM dividas
            WHERE id = ${params.id}
              AND usuario_id = ${userId}
        `;

        if (!divida) {
            set.status = 404;
            return { error: 'Dívida não encontrada' };
        }

        return {
            ...divida,
            data_inicio: divida ? formatarData(divida.data_inicio) : null,
            created_at: divida ? formatarDataHora(divida.created_at) : null,
            valor_restante: divida ? divida.valor_total - divida.valor_pago : null
        };
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
})

/**
 * ============================
 * CRIAR NOVA DÍVIDA
 * ============================
 */
.post('/', async ({ body, headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const [divida] = await sql`
            INSERT INTO dividas (
                descricao,
                valor_total,
                data_inicio,
                usuario_id
            )
            VALUES (
                ${body.descricao},
                ${body.valor_total},
                ${body.data_inicio},
                ${userId}
            )
            RETURNING *
        `;

        if (!divida) {
            set.status = 404;
            return { error: 'Dívida não encontrada' };
        }

        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at)
        };
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
}, {
    body: t.Object({
        descricao: t.String(),
        valor_total: t.Number(),
        data_inicio: t.String()
    })
})

/**
 * ============================
 * ATUALIZAR DÍVIDA
 * ============================
 */
.put('/:id', async ({ params, body, headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const [divida] = await sql`
            UPDATE dividas
            SET
                descricao = ${body.descricao},
                valor_total = ${body.valor_total},
                data_inicio = ${body.data_inicio},
                quitada = ${body.quitada ?? false}
            WHERE id = ${params.id}
              AND usuario_id = ${userId}
            RETURNING *
        `;

        if (!divida) {
            set.status = 404;
            return { error: 'Dívida não encontrada' };
        }

        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at),
            valor_restante: divida.valor_total - divida.valor_pago
        };
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
}, {
    body: t.Object({
        descricao: t.String(),
        valor_total: t.Number(),
        data_inicio: t.String(),
        quitada: t.Optional(t.Boolean())
    })
})

/**
 * ============================
 * TOGGLE QUITADA
 * ============================
 */
.patch('/:id/toggle-quitada', async ({ params, headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const [divida] = await sql`
            UPDATE dividas
            SET quitada = NOT quitada
            WHERE id = ${params.id}
              AND usuario_id = ${userId}
            RETURNING *
        `;

        if (!divida) {
            set.status = 404;
            return { error: 'Dívida não encontrada' };
        }

        return {
            ...divida,
            data_inicio: formatarData(divida.data_inicio),
            created_at: formatarDataHora(divida.created_at),
            valor_restante: divida.valor_total - divida.valor_pago
        };
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
})

/**
 * ============================
 * REGISTRAR PAGAMENTO DA DÍVIDA
 * ============================
 */
.post('/:id/pagamentos', async ({ params, body, headers, set }) => {
    try {
        const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

        const [pagamento] = await sql`
            INSERT INTO pagamentos_divida (
                divida_id,
                valor_pago,
                data_pagamento,
                observacao
            )
            VALUES (
                ${params.id},
                ${body.valor_pago},
                ${body.data_pagamento},
                ${body.observacao ?? null}
            )
            RETURNING *
        `;

        await sql`
            UPDATE dividas
            SET valor_pago = valor_pago + ${body.valor_pago}
            WHERE id = ${params.id}
              AND usuario_id = ${userId}
        `;

        return pagamento;
    } catch (error) {
        set.status = 401;
        return { error: 'Não autorizado' };
    }
}, {
    body: t.Object({
        valor_pago: t.Number(),
        data_pagamento: t.String(),
        observacao: t.Optional(t.String())
    })
});
