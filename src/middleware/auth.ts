import { Elysia } from 'elysia';
import { extrairUsuarioDoHeader } from '../utils/jwt';
import type { JWTPayload } from '../types/auth';

export const authMiddleware = new Elysia({
  name: 'auth'
}).derive(({ request, set }): { user: JWTPayload } => {
  try {
    const authHeader = request.headers.get('authorization');
    const user = extrairUsuarioDoHeader(authHeader);

    return { user };
  } catch (error: any) {
    set.status = 401;
    throw new Error(error.message || 'Não autorizado');
  }
});
