"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setAuth, type User } from "@/lib/auth";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = nome.trim().length >= 2 && email.includes("@") && senha.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiPost<{ token: string; user: User }>("/auth/cadastro", {
        nome,
        email,
        senha,
      });
      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" data-testid="screen-signup">
      <div className="w-full max-w-md bg-bg-card rounded-2xl p-8 border border-border">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-block"
          data-testid="signup-back"
        >
          &larr; Voltar
        </Link>

        <h2 className="text-2xl font-bold text-center mb-2">Criar sua conta</h2>
        <p className="text-text-secondary text-center mb-8">
          Comece a controlar suas financas agora
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1">Nome</label>
            <input
              type="text"
              data-testid="signup-name"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1">E-mail</label>
            <input
              type="email"
              data-testid="signup-email"
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
              data-testid="signup-password"
              placeholder="Minimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-danger text-sm mb-4" data-testid="signup-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            data-testid="btn-signup"
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-border" />
          <span className="px-4 text-text-muted text-sm">ou</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Link
          href="/test-drive"
          className="block w-full py-3 rounded-lg border border-border hover:bg-bg-hover text-text-primary text-center font-semibold transition-colors"
          data-testid="btn-signup-testdrive"
        >
          Quero fazer um test drive primeiro
        </Link>
      </div>
    </div>
  );
}
