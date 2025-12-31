import { Elysia, t } from 'elysia';
import sql from '../database/db';

export const contasRoutes = new Elysia({ prefix: '/contas' })

    // Listar todas as contas ativas
    .get('/', async () => {
        const contas = await sql`
            SELECT * FROM contas_fixas
            WHERE ativo = true
            ORDER BY dia_vencimento ASC
        `;
        return contas;
    })

    // Buscar conta por ID
    .get('/:id', async ({ params }) => {
        const [conta] = await sql`
            SELECT * FROM contas_fixas WHERE id = ${params.id}
        `;
        if (!conta) {
            return { error: 'Conta não encontrada' };
        }
        return conta;
    })

    // Criar nova conta
    .post('/', async ({ body }) => {
        const [conta] = await sql`
            INSERT INTO contas_fixas (descricao, valor, dia_vencimento)
            VALUES (${body.descricao}, ${body.valor}, ${body.dia_vencimento || null})
            RETURNING *
        `;
        
        if (!conta) {
            return { error: 'Erro ao criar conta' };
        }
        
        return conta;
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            dia_vencimento: t.Optional(t.Number())
        })
    })

    // Atualizar conta
    .put('/:id', async ({ params, body }) => {
        const [conta] = await sql`
            UPDATE contas_fixas
            SET descricao = ${body.descricao},
                valor = ${body.valor},
                dia_vencimento = ${body.dia_vencimento || null}
            WHERE id = ${params.id}
            RETURNING *
        `;
        
        if (!conta) {
            return { error: 'Conta não encontrada' };
        }
        
        return conta;
    }, {
        body: t.Object({
            descricao: t.String(),
            valor: t.Number(),
            dia_vencimento: t.Optional(t.Number())
        })
    })

    // Desativar conta (soft delete)
    .delete('/:id', async ({ params }) => {
        const [conta] = await sql`
            UPDATE contas_fixas 
            SET ativo = false 
            WHERE id = ${params.id}
            RETURNING *
        `;
        return conta || { error: 'Conta não encontrada' };
    });