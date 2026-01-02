import { Elysia, t } from 'elysia';
import bcrypt from 'bcryptjs';
import sql from '../database/db';
import { gerarToken } from '../middleware/auth';
import type { AuthResponse, Usuario } from '../types/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })

    .post('/cadastro', async ({ body, set }) => {
        try {
            const { nome, email, senha } = body;

            // Verificar se o email já está cadastrado
            const [usuarioExistente] = await sql<Usuario[]>`
                SELECT * FROM usuarios WHERE email = ${email}
            `;

            if (usuarioExistente) {
                set.status = 400;
                return { error: 'Email já cadastrado' };
            }

            // Hash da senha
            const senha_hash = await bcrypt.hash(senha, 10);

            // Criar usuário
            const [novoUsuario] = await sql<Usuario[]>`
                INSERT INTO usuarios (nome, email, senha_hash)
                VALUES (${nome}, ${email}, ${senha_hash})
                RETURNING id, nome, email, created_at
            `;

            // Gerar token
            const token = gerarToken({
                userId: novoUsuario.id,
                email: novoUsuario.email
            });

            const response: AuthResponse = {
                token,
                usuario: {
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email
                }
            };

            return response;
        } catch (error) {
            set.status = 500;
            return { error: 'Erro ao cadastrar usuário' };
        }
    }, {
        body: t.Object({
            nome: t.String({ minLength: 2 }),
            email: t.String({ format: 'email' }),
            senha: t.String({ minLength: 6 })
        })
    })

    .post('/login', async ({ body, set }) => {
        try {
            const { email, senha } = body;

            // Buscar usuário
            const [usuario] = await sql<Usuario[]>`
                SELECT * FROM usuarios WHERE email = ${email}
            `;

            if (!usuario) {
                set.status = 401;
                return { error: 'Email ou senha inválidos' };
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

            if (!senhaValida) {
                set.status = 401;
                return { error: 'Email ou senha inválidos' };
            }

            // Gerar token
            const token = gerarToken({
                userId: usuario.id,
                email: usuario.email
            });

            const response: AuthResponse = {
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            };

            return response;
        } catch (error) {
            set.status = 500;
            return { error: 'Erro ao fazer login' };
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            senha: t.String()
        })
    })

    .get('/verificar', async ({ headers, set }) => {
        try {
            const authHeader = headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                set.status = 401;
                return { error: 'Token não fornecido' };
            }

            const token = authHeader.substring(7);
            const { verificarToken } = await import('../middleware/auth');
            const payload = verificarToken(token);

            const [usuario] = await sql<Usuario[]>`
                SELECT id, nome, email FROM usuarios WHERE id = ${payload.userId}
            `;

            if (!usuario) {
                set.status = 401;
                return { error: 'Usuário não encontrado' };
            }

            return {
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            };
        } catch (error) {
            set.status = 401;
            return { error: 'Token inválido ou expirado' };
        }
    });
