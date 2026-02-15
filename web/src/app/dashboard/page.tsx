"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { isAuthenticated, getUser, clearAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIES = [
  "Alimentacao", "Transporte", "Saude", "Assinaturas",
  "Lazer", "Moradia", "Educacao", "Outros",
];

const CATEGORY_COLORS: Record<string, string> = {
  Alimentacao: "#f59e0b", Transporte: "#6366f1", Saude: "#10b981",
  Assinaturas: "#ec4899", Lazer: "#8b5cf6", Moradia: "#0ea5e9",
  Educacao: "#14b8a6", Outros: "#64748b",
};

interface Transaction {
  id: number;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  data: string;
}

interface Debt {
  id: number;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  data_inicio: string;
  quitada: boolean;
}

interface FixedBill {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  pago: boolean;
}

type View = "dashboard" | "transacoes" | "dividas" | "contas" | "insights";

const MENU_ITEMS: { key: View; label: string; icon: string; testId: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "◼", testId: "menu-dashboard" },
  { key: "transacoes", label: "Transacoes", icon: "↕", testId: "menu-transacoes" },
  { key: "dividas", label: "Dividas", icon: "⚠", testId: "menu-dividas" },
  { key: "contas", label: "Contas fixas", icon: "📌", testId: "menu-contas" },
  { key: "insights", label: "Insights IA", icon: "✦", testId: "menu-insights" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTestDrive, setIsTestDrive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [revenue, setRevenue] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [fixed, setFixed] = useState<FixedBill[]>([]);
  const [insightText, setInsightText] = useState("");
  const [insightHistory, setInsightHistory] = useState<string[]>([]);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const testDrive = sessionStorage.getItem("testDrive");
    if (testDrive) {
      setIsTestDrive(true);
      setRevenue(parseFloat(sessionStorage.getItem("testDriveRevenue") || "0"));
      const entries = JSON.parse(sessionStorage.getItem("testDriveEntries") || "[]");
      const txs: Transaction[] = entries.map((e: { id: number; desc: string; value: number; type: string; category: string }) => ({
        id: e.id,
        descricao: e.desc,
        valor: e.type === "receita" ? e.value : -e.value,
        tipo: e.type === "receita" ? "receita" : "despesa",
        categoria: e.category,
        data: new Date().toISOString().split("T")[0],
      }));
      setTransactions(txs);
      setDebts([
        { id: 1, descricao: "Cartao Nubank", valor_total: 1850, valor_pago: 620, data_inicio: "2026-01-10", quitada: false },
        { id: 2, descricao: "Emprestimo pessoal", valor_total: 5000, valor_pago: 2500, data_inicio: "2026-01-15", quitada: false },
      ]);
      setFixed([
        { id: 1, descricao: "Aluguel", valor: 1200, categoria: "Moradia", pago: false },
        { id: 2, descricao: "Internet", valor: 119.90, categoria: "Assinaturas", pago: false },
        { id: 3, descricao: "Academia", valor: 89.90, categoria: "Saude", pago: false },
        { id: 4, descricao: "Energia", valor: 180, categoria: "Moradia", pago: false },
      ]);
      setLoading(false);
      return;
    }

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    try {
      const [txRes, fixedRes, debtsRes, resumoRes] = await Promise.all([
        apiFetch<Transaction[]>("/transacoes").catch(() => []),
        apiFetch<FixedBill[]>("/contas").catch(() => []),
        apiFetch<Debt[]>("/dividas").catch(() => []),
        apiFetch<{ receita_mensal: number }>("/dashboard/resumo").catch(() => ({ receita_mensal: 0 })),
      ]);
      setTransactions(Array.isArray(txRes) ? txRes : []);
      setFixed(Array.isArray(fixedRes) ? fixedRes : []);
      setDebts(Array.isArray(debtsRes) ? debtsRes : []);
      setRevenue(resumoRes?.receita_mensal || 0);
    } catch {
      // Silently handle errors
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed values
  const expenses = transactions
    .filter((t) => t.tipo === "despesa" || Number(t.valor) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
  const income = transactions
    .filter((t) => t.tipo === "receita" || Number(t.valor) > 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
  const balance = revenue - expenses;
  const fixedTotal = fixed.reduce((sum, f) => sum + Number(f.valor), 0);

  // Filtered transactions
  const filteredTx = transactions.filter((t) => {
    if (filterSearch && !t.descricao.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    if (filterCategory && t.categoria !== filterCategory) return false;
    if (filterType === "expense" && (t.tipo === "receita" || Number(t.valor) > 0)) return false;
    if (filterType === "income" && (t.tipo === "despesa" || Number(t.valor) < 0)) return false;
    return true;
  });

  // Category breakdown for donut
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const total = transactions
      .filter((t) => t.categoria === cat && (t.tipo === "despesa" || Number(t.valor) < 0))
      .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
    return { category: cat, total };
  }).filter((c) => c.total > 0);

  function handleLogout() {
    clearAuth();
    sessionStorage.clear();
    router.push("/");
  }

  async function generateInsight() {
    setGeneratingInsight(true);
    try {
      if (isTestDrive) {
        await new Promise((r) => setTimeout(r, 1500));
        const text = `Com base nos seus dados, suas maiores despesas estao em ${categoryBreakdown[0]?.category || "Outros"}. Considere revisar seus gastos nessa categoria.`;
        setInsightText(text);
        setInsightHistory((prev) => [text, ...prev]);
      } else {
        const data = await apiFetch<{ insight: string }>("/dashboard/insight", {
          method: "POST",
        });
        setInsightText(data.insight);
        setInsightHistory((prev) => [data.insight, ...prev]);
      }
    } catch {
      setInsightText("Nao foi possivel gerar o insight. Tente novamente.");
    }
    setGeneratingInsight(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="screen-dashboard">
      {/* Sidebar */}
      <aside
        className={`bg-bg-secondary border-r border-border flex flex-col transition-all ${
          sidebarCollapsed ? "w-16" : "w-60"
        }`}
        data-testid="sidebar"
      >
        <div className="p-4 flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6366f1" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!sidebarCollapsed && (
            <span className="font-semibold text-text-primary">Cash Tracking</span>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              data-testid={item.testId}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                view === item.key
                  ? "bg-accent-soft text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 space-y-1 border-t border-border">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            data-testid="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span>{sidebarCollapsed ? "▶" : "◀"}</span>
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-bg-hover transition-colors"
            data-testid="sidebar-logout"
            onClick={handleLogout}
          >
            <span>➜</span>
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Test drive banner */}
        {isTestDrive && (
          <div
            className="bg-warning/10 text-warning px-4 py-3 flex items-center justify-between text-sm"
            data-testid="test-banner"
          >
            <span>Modo test drive &mdash; seus dados nao serao salvos.</span>
            <button
              className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm hover:bg-accent-hover transition-colors"
              data-testid="banner-register"
              onClick={() => router.push("/cadastro")}
            >
              Criar conta para salvar
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-border">
          <div>
            <h1 className="text-xl font-bold" data-testid="dash-greeting">
              {isTestDrive ? "Seu Dashboard" : `Ola, ${getUser()?.nome || "Usuario"}`}
            </h1>
            <p className="text-text-muted text-sm" data-testid="dash-date">
              Fevereiro 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg border border-border text-text-primary text-sm hover:bg-bg-hover transition-colors"
              data-testid="btn-upload-modal"
            >
              📤 Upload extrato
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm transition-colors"
              data-testid="btn-ai-insight"
              onClick={() => { setView("insights"); generateInsight(); }}
            >
              ✦ Insight da IA
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* VIEW: Dashboard */}
          {view === "dashboard" && (
            <div data-testid="view-dashboard">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="summary-grid">
                <SummaryCard label="Receita" value={revenue} color="text-success" testId="summary-card-income" />
                <SummaryCard label="Despesas" value={expenses} color="text-danger" testId="summary-card-expenses" />
                <SummaryCard label="Saldo" value={balance} color={balance >= 0 ? "text-success" : "text-danger"} testId="summary-card-balance" />
                <SummaryCard label="Contas fixas" value={fixedTotal} color="text-warning" testId="summary-card-fixed" />
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent transactions */}
                  <div className="bg-bg-card rounded-xl p-6 border border-border" data-testid="transactions-card">
                    <h3 className="font-semibold mb-4">Ultimas transacoes</h3>
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="text-text-primary text-sm">{tx.descricao}</span>
                          <span className="text-text-muted text-xs ml-2">{tx.categoria}</span>
                        </div>
                        <span className={`font-mono text-sm ${Number(tx.valor) < 0 ? "text-danger" : "text-success"}`}>
                          {Number(tx.valor) < 0 ? "-" : "+"} {formatCurrency(Math.abs(Number(tx.valor)))}
                        </span>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-text-muted text-sm">Nenhuma transacao ainda.</p>
                    )}
                  </div>

                  {/* Debts preview */}
                  <div className="bg-bg-card rounded-xl p-6 border border-border" data-testid="debts-card">
                    <h3 className="font-semibold mb-4">Dividas</h3>
                    {debts.slice(0, 3).map((d) => {
                      const pct = d.valor_total > 0 ? (Number(d.valor_pago) / Number(d.valor_total)) * 100 : 0;
                      return (
                        <div key={d.id} className="mb-3 last:mb-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-primary">{d.descricao}</span>
                            <span className="text-text-muted font-mono">
                              {formatCurrency(Number(d.valor_pago))} / {formatCurrency(Number(d.valor_total))}
                            </span>
                          </div>
                          <div className="w-full bg-bg-primary rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {debts.length === 0 && <p className="text-text-muted text-sm">Nenhuma divida cadastrada.</p>}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Category breakdown */}
                  <div className="bg-bg-card rounded-xl p-6 border border-border" data-testid="donut-card">
                    <h3 className="font-semibold mb-4">Gastos por categoria</h3>
                    {categoryBreakdown.map((c) => (
                      <div key={c.category} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] }} />
                          <span className="text-text-secondary text-sm">{c.category}</span>
                        </div>
                        <span className="font-mono text-sm text-text-primary">{formatCurrency(c.total)}</span>
                      </div>
                    ))}
                    {categoryBreakdown.length === 0 && (
                      <p className="text-text-muted text-sm">Sem dados de gastos.</p>
                    )}
                  </div>

                  {/* AI card */}
                  <div className="bg-bg-card rounded-xl p-6 border border-border" data-testid="ai-card">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-accent">✦</span>
                      <h3 className="font-semibold">Analise da IA</h3>
                    </div>
                    <p className="text-text-secondary text-sm" data-testid="ai-text">
                      {insightText || "Clique em \"Insight da IA\" para gerar uma analise."}
                    </p>
                  </div>

                  {/* Fixed bills */}
                  <div className="bg-bg-card rounded-xl p-6 border border-border" data-testid="fixed-card">
                    <h3 className="font-semibold mb-4">Contas fixas</h3>
                    {fixed.map((f) => (
                      <div key={f.id} className="flex items-center justify-between py-1.5">
                        <span className="text-text-secondary text-sm">{f.descricao}</span>
                        <span className="font-mono text-sm text-text-primary">{formatCurrency(Number(f.valor))}</span>
                      </div>
                    ))}
                    {fixed.length === 0 && <p className="text-text-muted text-sm">Nenhuma conta fixa.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Transacoes */}
          {view === "transacoes" && (
            <div data-testid="view-transacoes">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Transacoes</h2>
                <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm transition-colors" data-testid="btn-new-transaction">
                  + Nova transacao
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-4" data-testid="filters-bar">
                <input
                  type="text"
                  className="px-4 py-2 rounded-lg bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent text-sm flex-1 min-w-[200px]"
                  placeholder="Buscar transacao..."
                  data-testid="filter-search"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
                <select
                  className="px-4 py-2 rounded-lg bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
                  data-testid="filter-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Todas categorias</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="px-4 py-2 rounded-lg bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
                  data-testid="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="expense">Gastos</option>
                  <option value="income">Receitas</option>
                </select>
              </div>

              <div className="bg-bg-card rounded-xl border border-border overflow-hidden" data-testid="transactions-table-wrapper">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Data</th>
                      <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Descricao</th>
                      <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Categoria</th>
                      <th className="text-right px-4 py-3 text-text-muted text-sm font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody data-testid="transactions-tbody">
                    {filteredTx.map((tx) => (
                      <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                        <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(tx.data)}</td>
                        <td className="px-4 py-3 text-text-primary text-sm">{tx.descricao}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: CATEGORY_COLORS[tx.categoria] + "20", color: CATEGORY_COLORS[tx.categoria] }}
                          >
                            {tx.categoria}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${Number(tx.valor) < 0 ? "text-danger" : "text-success"}`}>
                          {Number(tx.valor) < 0 ? "-" : "+"} {formatCurrency(Math.abs(Number(tx.valor)))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTx.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-8">Nenhuma transacao encontrada.</p>
                )}
              </div>
              <div className="mt-2 text-text-muted text-sm" data-testid="transactions-info">
                {filteredTx.length} transacao(es)
              </div>
            </div>
          )}

          {/* VIEW: Dividas */}
          {view === "dividas" && (
            <div data-testid="view-dividas">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Dividas</h2>
                <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm transition-colors" data-testid="btn-new-debt">
                  + Nova divida
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" data-testid="debts-summary">
                <div className="bg-bg-card rounded-xl p-4 border border-border text-center">
                  <p className="text-text-muted text-sm">Total devido</p>
                  <p className="text-xl font-bold font-mono text-danger">
                    {formatCurrency(debts.reduce((s, d) => s + Number(d.valor_total) - Number(d.valor_pago), 0))}
                  </p>
                </div>
                <div className="bg-bg-card rounded-xl p-4 border border-border text-center">
                  <p className="text-text-muted text-sm">Total pago</p>
                  <p className="text-xl font-bold font-mono text-success">
                    {formatCurrency(debts.reduce((s, d) => s + Number(d.valor_pago), 0))}
                  </p>
                </div>
                <div className="bg-bg-card rounded-xl p-4 border border-border text-center">
                  <p className="text-text-muted text-sm">Dividas ativas</p>
                  <p className="text-xl font-bold">{debts.filter((d) => !d.quitada).length}</p>
                </div>
              </div>

              <div className="space-y-4" data-testid="debts-grid">
                {debts.map((d) => {
                  const pct = Number(d.valor_total) > 0 ? (Number(d.valor_pago) / Number(d.valor_total)) * 100 : 0;
                  return (
                    <div key={d.id} className="bg-bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{d.descricao}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${d.quitada ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                          {d.quitada ? "Quitada" : "Em andamento"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted">Progresso</span>
                        <span className="font-mono text-text-secondary">
                          {formatCurrency(Number(d.valor_pago))} / {formatCurrency(Number(d.valor_total))} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-bg-primary rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {debts.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-8">Nenhuma divida cadastrada.</p>
                )}
              </div>
            </div>
          )}

          {/* VIEW: Contas fixas */}
          {view === "contas" && (
            <div data-testid="view-contas">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Contas Fixas</h2>
                <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm transition-colors" data-testid="btn-new-fixed">
                  + Nova conta fixa
                </button>
              </div>

              <div className="bg-bg-card rounded-xl p-4 border border-border mb-6 flex items-center justify-between" data-testid="fixed-total-bar">
                <span className="text-text-secondary">Total mensal</span>
                <span className="text-xl font-bold font-mono text-warning">{formatCurrency(fixedTotal)}</span>
              </div>

              <div className="space-y-3" data-testid="fixed-grid">
                {fixed.map((f) => (
                  <div key={f.id} className="bg-bg-card rounded-xl px-6 py-4 border border-border flex items-center justify-between">
                    <div>
                      <span className="text-text-primary font-medium">{f.descricao}</span>
                      <span
                        className="ml-2 px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: (CATEGORY_COLORS[f.categoria] || "#64748b") + "20", color: CATEGORY_COLORS[f.categoria] || "#64748b" }}
                      >
                        {f.categoria}
                      </span>
                    </div>
                    <span className="font-mono font-medium text-text-primary">{formatCurrency(Number(f.valor))}</span>
                  </div>
                ))}
                {fixed.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-8">Nenhuma conta fixa cadastrada.</p>
                )}
              </div>
            </div>
          )}

          {/* VIEW: Insights */}
          {view === "insights" && (
            <div data-testid="view-insights">
              <h2 className="text-xl font-bold mb-6">Insights da IA</h2>

              <button
                className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors mb-6 disabled:opacity-50"
                data-testid="btn-generate-insight"
                onClick={generateInsight}
                disabled={generatingInsight}
              >
                {generatingInsight ? "Gerando..." : "✦ Gerar nova analise"}
              </button>

              <div className="bg-bg-card rounded-xl p-6 border border-border mb-6" data-testid="insight-current">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-accent">✦</span>
                  <h3 className="font-semibold">Analise atual</h3>
                </div>
                <p className="text-text-secondary text-sm whitespace-pre-wrap" data-testid="insight-text">
                  {insightText || "Clique no botao acima para gerar uma analise."}
                </p>
              </div>

              <div data-testid="insight-history">
                <h3 className="font-semibold mb-4">Historico de analises</h3>
                <div className="space-y-3" data-testid="insight-history-list">
                  {insightHistory.map((text, i) => (
                    <div key={i} className="bg-bg-card rounded-lg p-4 border border-border text-text-secondary text-sm">
                      {text}
                    </div>
                  ))}
                  {insightHistory.length === 0 && (
                    <p className="text-text-muted text-sm">Nenhuma analise gerada ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, testId }: {
  label: string;
  value: number;
  color: string;
  testId: string;
}) {
  return (
    <div
      className="bg-bg-card rounded-xl p-5 border border-border"
      data-testid={testId}
      data-raw-value={value}
    >
      <p className="text-text-muted text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
