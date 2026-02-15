import { Elysia, t } from 'elysia';
import sql from '../database/db';
import { extrairUsuarioDoHeader } from '../middleware/auth';

export const transacoesRoutes = new Elysia({ prefix: '/api/transacoes' })

  .get('/', async ({ headers, set, query }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

      // Pagination parameters
      const limit = Math.min(parseInt(query.limit as string) || 50, 100); // Max 100
      const page = Math.max(parseInt(query.page as string) || 1, 1);
      const offset = (page - 1) * limit;

      // Get total count
      const [{ count }] = await sql`
        SELECT COUNT(*) as count FROM transacoes
        WHERE usuario_id = ${userId}
      `;

      // Get paginated transactions
      const transacoes = await sql`
        SELECT * FROM transacoes
        WHERE usuario_id = ${userId}
        ORDER BY data DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      return {
        transacoes,
        pagination: {
          limit,
          page,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      set.status = 401;
      return { error: 'Nao autorizado' };
    }
  })

  .get('/receitas', async ({ headers, set }) => {
    try {
      const { userId } = extrairUsuarioDoHeader(headers.authorization || null);

      const transacoes = await sql`
        SELECT * FROM transacoes
        WHERE usuario_id = ${userId} AND tipo = 'receita'
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

      // Validar data
      if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        set.status = 400;
        return { error: 'Data inválida. Formato: YYYY-MM-DD' };
      }

      // Validar descrição
      if (!descricao || descricao.trim().length === 0) {
        set.status = 400;
        return { error: 'Descrição é obrigatória' };
      }

      if (descricao.length > 255) {
        set.status = 400;
        return { error: 'Descrição muito longa (máx 255 caracteres)' };
      }

      // Validar valor
      if (isNaN(valor) || valor === 0) {
        set.status = 400;
        return { error: 'Valor deve ser um número diferente de zero' };
      }

      if (Math.abs(valor) > 999999.99) {
        set.status = 400;
        return { error: 'Valor muito grande (máx R$ 999.999,99)' };
      }

      const [transacao] = await sql`
        INSERT INTO transacoes (data, descricao, valor, tipo, categoria, usuario_id)
        VALUES (${data}, ${descricao.trim()}, ${valor}, ${tipo || 'despesa'}, ${categoria || 'Outros'}, ${userId})
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

      // Validar dados se fornecidos
      if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        set.status = 400;
        return { error: 'Data inválida. Formato: YYYY-MM-DD' };
      }

      if (descricao && descricao.length > 255) {
        set.status = 400;
        return { error: 'Descrição muito longa (máx 255 caracteres)' };
      }

      if (valor && (isNaN(valor) || valor === 0 || Math.abs(valor) > 999999.99)) {
        set.status = 400;
        return { error: 'Valor inválido' };
      }

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
