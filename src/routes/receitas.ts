import { Elysia, t} from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';
import { logger } from '../lib/logger';

export const receitasRoutes = new Elysia({ prefix: '/api/receitas'})

    .get('/', async ({ headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            logger.info('📤 [GET] Buscando receitas', { userId });

            const receitas = await sql`
                SELECT * FROM receitas
                WHERE ativo = true AND usuario_id = ${userId}
                ORDER BY created_at DESC
            `;
            logger.info('✅ [GET] Receitas encontradas', { userId, count: receitas.length, total: receitas.reduce((acc, r) => acc + r.valor, 0) });
            return receitas;
        } catch (error) {
            logger.error('❌ [GET] Erro ao buscar receitas', { error: String(error) });
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    .get('/:id', async ({ params, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            logger.info('📤 [GET/:id] Buscando receita específica', { userId, id: params.id });

            const [receita] = await sql `
                SELECT * FROM receitas
                WHERE id = ${params.id} AND usuario_id = ${userId}
            `;
            if (!receita){
                logger.warn('⚠️  [GET/:id] Receita não encontrada', { userId, id: params.id });
                set.status = 404;
                return { error: 'Receita não encontrada' };
            }
            logger.info('✅ [GET/:id] Receita encontrada', { userId, id: params.id, valor: receita.valor });
            return receita;
        } catch (error) {
            logger.error('❌ [GET/:id] Erro ao buscar receita', { error: String(error) });
            set.status = 401;
            return { error: 'Não autorizado' };
        }
    })

    .post('/', async ({ body, headers, set }) => {
        try {
            const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
            logger.info('💾 [POST] Adicionando nova receita', { userId, descricao: body.descricao, valor: body.valor });

            const [receita] = await sql`
                INSERT INTO receitas (descricao, valor, data_recebimento, recorrente, usuario_id)
                VALUES (${body.descricao}, ${body.valor}, ${body.data_recebimento || null}, ${body.recorrente !== false}, ${userId})
                RETURNING *
            `;
            if (!receita) {
                logger.error('❌ [POST] Falha ao criar receita');
                set.status = 500;
                return { error: 'Erro ao criar receita' };
            }
            logger.info('✅ [POST] Receita adicionada com sucesso', { userId, id: receita.id, valor: receita.valor });
            return receita;
        } catch (error) {
            logger.error('❌ [POST] Erro ao adicionar receita', { error: String(error) });
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

