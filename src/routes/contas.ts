import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';

export const contasRoutes = new Elysia({ prefix: '/contas' })

    // Listar todas as contas ativas
    .get('/', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const contas = await sql`
                SELECT * FROM contas_fixas
                WHERE ativo = true AND usuario_id = ${userId}
                ORDER BY dia_vencimento ASC
            `;
            return contas;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Buscar conta por ID
    .get('/:id', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [conta] = await sql`
                SELECT * FROM contas_fixas
                WHERE id = ${params.id} AND usuario_id = ${userId}
            `;

            if (!conta) {
                set.status = 404;
                return { error: 'Conta não encontrada' };
            }

            return conta;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Criar nova conta
    .post('/', async ({ body, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [conta] = await sql`
                INSERT INTO contas_fixas (descricao, valor, dia_vencimento, usuario_id)
                VALUES (${body.descricao}, ${body.valor}, ${body.dia_vencimento || null}, ${userId})
                RETURNING *
            `;

            if (!conta) {
                set.status = 500;
                return { error: 'Erro ao criar conta' };
            }

            return conta;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            dia_vencimento: t.Optional(t.Number())
        })
    })

    // Atualizar conta
    .put('/:id', async ({ params, body, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [conta] = await sql`
                UPDATE contas_fixas
                SET descricao = ${body.descricao},
                    valor = ${body.valor},
                    dia_vencimento = ${body.dia_vencimento || null}
                WHERE id = ${params.id} AND usuario_id = ${userId}
                RETURNING *
            `;

            if (!conta) {
                set.status = 404;
                return { error: 'Conta não encontrada' };
            }

            return conta;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            dia_vencimento: t.Optional(t.Number())
        })
    })

    // Toggle pago/pendente
    .patch('/:id/toggle-pago', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [conta] = await sql`
                UPDATE contas_fixas
                SET pago = NOT COALESCE(pago, false)
                WHERE id = ${params.id} AND usuario_id = ${userId}
                RETURNING *
            `;

            if (!conta) {
                set.status = 404;
                return { error: 'Conta não encontrada' };
            }

            return conta;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    // Desativar conta (soft delete)
    .delete('/:id', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [conta] = await sql`
                UPDATE contas_fixas
                SET ativo = false
                WHERE id = ${params.id} AND usuario_id = ${userId}
                RETURNING *
            `;

            if (!conta) {
                set.status = 404;
                return { error: 'Conta não encontrada' };
            }

            return conta;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    });