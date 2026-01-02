import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-mude-em-producao';

export function gerarToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verificarToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
}

export function extrairUsuarioDoHeader(authHeader: string | null): JWTPayload {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
    }

    const token = authHeader.substring(7);
    return verificarToken(token);
}
