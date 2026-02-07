import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';

export const transacoesRoutes = new Elysia({ prefix: '/transacoes' })

  .get('/', async ({ headers, set }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

      const transacoes = await sql`
        SELECT * FROM transacoes
        WHERE usuario_id = ${userId}
        ORDER BY data DESC
      `;

      return { transacoes };
    } catch (error) {
      set.status = 401;
      return { error: 'Nao autorizado' };
    }
  })

  .post('/', async ({ body, headers, set }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
      const { data, descricao, valor, tipo, categoria } = body;

      const [transacao] = await sql`
        INSERT INTO transacoes (data, descricao, valor, tipo, categoria, usuario_id)
        VALUES (${data}, ${descricao}, ${valor}, ${tipo || 'despesa'}, ${categoria || 'Outros'}, ${userId})
        RETURNING *
      `;

      return { transacao };
    } catch (error) {
      set.status = error instanceof Error && error.message === 'Token não fornecido' ? 401 : 500;
      return { error: 'Erro ao criar transacao' };
    }
  }, {
    body: t.Object({
      data: t.String(),
      descricao: t.String(),
      valor: t.Number(),
      tipo: t.Optional(t.String()),
      categoria: t.Optional(t.String()),
    })
  })

  .put('/:id', async ({ params, body, headers, set }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);
      const { data, descricao, valor, tipo, categoria } = body as any;

      const [transacao] = await sql`
        UPDATE transacoes
        SET data = COALESCE(${data || null}, data),
            descricao = COALESCE(${descricao || null}, descricao),
            valor = COALESCE(${valor || null}, valor),
            tipo = COALESCE(${tipo || null}, tipo),
            categoria = COALESCE(${categoria || null}, categoria)
        WHERE id = ${params.id} AND usuario_id = ${userId}
        RETURNING *
      `;

      if (!transacao) {
        set.status = 404;
        return { error: 'Transacao nao encontrada' };
      }

      return { transacao };
    } catch (error) {
      set.status = 500;
      return { error: 'Erro ao atualizar transacao' };
    }
  })

  .delete('/:id', async ({ params, headers, set }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

      const [deleted] = await sql`
        DELETE FROM transacoes
        WHERE id = ${params.id} AND usuario_id = ${userId}
        RETURNING id
      `;

      if (!deleted) {
        set.status = 404;
        return { error: 'Transacao nao encontrada' };
      }

      return { success: true };
    } catch (error) {
      set.status = 500;
      return { error: 'Erro ao deletar transacao' };
    }
  });
