export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha_hash: string;
    created_at: Date;
}

export interface CadastroInput {
    nome: string;
    email: string;
    senha: string;
}

export interface LoginInput {
    email: string;
    senha: string;
}

export interface JWTPayload {
    userId: number;
    email: string;
}

export interface AuthResponse {
    token: string;
    usuario: {
        id: number;
        nome: string;
        email: string;
    };
}
