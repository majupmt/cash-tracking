import { Elysia, t} from 'elysia';
import sql from '../database/db';

export const receitasRoutes = new Elysia({ prefix: '/receitas'})

    .get('/', async () => {
        const receitas = await sql`
            SELECT * FROM receitas
            WHERE ativo = true
            ORDER BY created_at DESC
        `;
        return receitas;
    })

    .get('/:id', async ({ params }) => {
        const [receita] = await sql `
            SELECT * FROM receitas WHERE id = ${params.id}
        `;
        if (!receita){
            return { error: 'Receita não encontrada' };
        }
        return receita;
    })

    .post('/', async ({ body }) => {
        const [receita] = await sql`
            INSERT INTO receitas (descricao, valor, data_recebimento, recorrente)
            VALUES (${body.descricao}, ${body.valor}, ${body.data_recebimento || null}, ${body.recorrente !== false})
            RETURNING *
        `;
        return receita;
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            data_recebimento: t.Optional(t.String()),
            recorrente: t.Optional(t.Boolean())
        })
    })

    .put('/:id', async ({ params, body }) => {
        const [receita] = await sql `
            UPDATE receitas
            SET descricao = ${body.descricao},
                valor = ${body.valor},
                data_recebimento = ${body.data_recebimento || null},
                recorrente = ${body.recorrente !== false}
            WHERE id = ${params.id}
            RETURNING *
        `;
        return receita || { error: 'Receita não encontrada ' }
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            data_recebimento: t.Optional(t.String()),
            recorrente: t.Optional(t.Boolean())
        })
    })

    .delete('/:id', async ({ params }) => {
        const [receita] = await sql`
            UPDATE receitas 
            SET ativo = false 
            WHERE id = ${params.id}
            RETURNING *
        `;
        return receita || { error: 'Receita não encontrada' };
    });

