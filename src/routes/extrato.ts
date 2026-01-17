import { Elysia } from 'elysia';
import { processarArquivo } from '../services/fileProcessor';
import { validarTransacoes } from '../services/transactionValidator';
import { authMiddleware } from '../middleware/auth';
import sql from '../database/db';

export const extratoRoutes = new Elysia().use(authMiddleware)

  .post('/upload', async ({ body, set }) => {
    try {
      const arquivo = (body as any)?.arquivo;

      if (!arquivo) {
        set.status = 400;
        return { sucesso: false, erro: 'Nenhum arquivo enviado' };
      }

      if (typeof arquivo === 'string') {
        const { extrairTexto, limparTexto, extrairLinhasTransacoes } =
          await import('../services/fileProcessor');

        const textoCompleto = await extrairTexto(arquivo);
        const textoLimpo = limparTexto(textoCompleto);
        const linhasTransacoes = extrairLinhasTransacoes(textoLimpo);
        const transacoes = validarTransacoes(linhasTransacoes);

        return {
          sucesso: true,
          dados: {
            totalLinhas: linhasTransacoes.length,
            transacoesValidas: transacoes.length,
            transacoes
          }
        };
      }

      const resultado = await processarArquivo(arquivo);
      const transacoes = validarTransacoes(resultado.linhasTransacoes);

      return {
        sucesso: true,
        dados: {
          totalLinhas: resultado.totalLinhas,
          transacoesValidas: transacoes.length,
          transacoes
        }
      };

    } catch (error: any) {
      set.status = 500;
      return { sucesso: false, erro: error.message };
    }
  })

  .post('/confirmar', async (ctx) => {
    const { body, set } = ctx;
    const user = (ctx as any).user as { userId: number; email: string };
    try {
      const { transacoes, arquivo_origem } = body as any;

      if (!Array.isArray(transacoes) || transacoes.length === 0) {
        set.status = 400;
        return { sucesso: false, erro: 'Transações inválidas' };
      } 

      let salvas = 0;

      for (const t of transacoes) {
        await sql`
          INSERT INTO transacoes
            (usuario_id, data, descricao, valor, tipo, categoria, origem, arquivo_origem)
          VALUES
            (
              ${user.userId},
              ${t.data},
              ${t.descricao},
              ${t.valor},
              ${t.tipo},
              ${t.categoria || null},
              'extrato',
              ${arquivo_origem || null}
            )
        `;
        salvas++;
      }

      return {
        sucesso: true,
        mensagem: `${salvas} transações salvas com sucesso!`,
        totalSalvo: salvas
      };

    } catch (error: any) {
      set.status = 500;
      return { sucesso: false, erro: error.message };
    }
  });
