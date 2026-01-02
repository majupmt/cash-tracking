import { Elysia, t} from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';

export const receitasRoutes = new Elysia({ prefix: '/receitas'})

    .get('/', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const receitas = await sql`
                SELECT * FROM receitas
                WHERE ativo = true AND usuario_id = ${userId}
                ORDER BY created_at DESC
            `;
            return receitas;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    .get('/:id', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [receita] = await sql `
                SELECT * FROM receitas
                WHERE id = ${params.id} AND usuario_id = ${userId}
            `;
            if (!receita){
                set.status = 404;
                return { error: 'Receita não encontrada' };
            }
            return receita;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    .post('/', async ({ body, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [receita] = await sql`
                INSERT INTO receitas (descricao, valor, data_recebimento, recorrente, usuario_id)
                VALUES (${body.descricao}, ${body.valor}, ${body.data_recebimento || null}, ${body.recorrente !== false}, ${userId})
                RETURNING *
            `;
            return receita;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            data_recebimento: t.Optional(t.String()),
            recorrente: t.Optional(t.Boolean())
        })
    })

    .put('/:id', async ({ params, body, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [receita] = await sql `
                UPDATE receitas
                SET descricao = ${body.descricao},
                    valor = ${body.valor},
                    data_recebimento = ${body.data_recebimento || null},
                    recorrente = ${body.recorrente !== false}
                WHERE id = ${params.id} AND usuario_id = ${userId}
                RETURNING *
            `;

            if (!receita) {
                set.status = 404;
                return { error: 'Receita não encontrada' };
            }

            return receita;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            data_recebimento: t.Optional(t.String()),
            recorrente: t.Optional(t.Boolean())
        })
    })

    .delete('/:id', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

            const [receita] = await sql`
                UPDATE receitas
                SET ativo = false
                WHERE id = ${params.id} AND usuario_id = ${userId}
                RETURNING *
            `;

            if (!receita) {
                set.status = 404;
                return { error: 'Receita não encontrada' };
            }

            return receita;
        } catch (error) {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    });

