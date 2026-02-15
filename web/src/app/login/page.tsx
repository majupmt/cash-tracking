"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setAuth, type User } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.includes("@") && senha.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiPost<{ token: string; user: User }>("/auth/login", {
        email,
        senha,
      });
      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" data-testid="screen-login">
      <div className="w-full max-w-md bg-bg-card rounded-2xl p-8 border border-border">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-block"
          data-testid="login-back"
        >
          &larr; Voltar
        </Link>

        <div className="flex justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6366f1" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Acessar sua conta</h2>
        <p className="text-text-secondary text-center mb-8">
          Digite suas credenciais para continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1">E-mail</label>
            <input
              type="email"
              data-testid="login-email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1">Senha</label>
            <input
              type="password"
              data-testid="login-password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-danger text-sm mb-4" data-testid="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            data-testid="btn-login"
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-text-muted text-sm text-center mt-4">
          Esqueceu a senha? <a className="text-accent hover:underline cursor-pointer">Recuperar</a>
        </p>
      </div>
    </div>
  );
}
