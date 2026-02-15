"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row" data-testid="screen-welcome">
      {/* Left — Branding */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 bg-bg-secondary">
        <div className="flex items-center gap-3 mb-10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6366f1" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-semibold text-text-primary">Cash Tracking</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-text-primary">
          Controle financeiro{" "}
          <em className="text-accent not-italic">inteligente</em> e sem
          complicacao.
        </h1>
        <p className="text-text-secondary text-lg mb-8 max-w-lg">
          Importe seus extratos, categorize automaticamente e receba insights
          da IA para tomar decisoes melhores sobre seu dinheiro.
        </p>
        <div className="flex flex-wrap gap-3">
          {["Upload de extratos", "IA integrada", "Dashboard em tempo real"].map(
            (badge) => (
              <span
                key={badge}
                className="px-4 py-2 rounded-full bg-accent-soft text-accent text-sm font-medium"
              >
                {badge}
              </span>
            )
          )}
        </div>
      </div>

      {/* Right — CTA */}
      <div className="flex flex-col justify-center items-center px-8 py-12 md:w-[420px]">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta</h2>
          <p className="text-text-secondary mb-8">
            Entre na sua conta ou comece agora
          </p>

          <Link
            href="/login"
            className="block w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-center font-semibold transition-colors mb-3"
            data-testid="btn-go-login"
          >
            Entrar na minha conta
          </Link>
          <Link
            href="/cadastro"
            className="block w-full py-3 rounded-lg border border-border hover:bg-bg-hover text-text-primary text-center font-semibold transition-colors mb-6"
            data-testid="btn-go-signup"
          >
            Criar conta gratuita
          </Link>

          <p className="text-text-muted text-sm text-center">
            Quer testar antes?{" "}
            <Link
              href="/test-drive"
              className="text-accent hover:underline"
              data-testid="link-test-drive"
            >
              Faca um test drive &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
