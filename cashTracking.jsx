import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CASH TRACKING — Controle Financeiro Inteligente
// Stack: Bun + Elysia + PostgreSQL + Claude API
// Design: Professional SaaS — Dark Premium
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Mock Data ───────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: 1, date: "2026-02-01", description: "Uber", category: "Transporte", value: -35.5, color: "#6366f1" },
  { id: 2, date: "2026-02-02", description: "Supermercado BH", category: "Alimentação", value: -248.9, color: "#f59e0b" },
  { id: 3, date: "2026-02-03", description: "Netflix", category: "Assinaturas", value: -55.9, color: "#ec4899" },
  { id: 4, date: "2026-02-05", description: "iFood", category: "Alimentação", value: -67.8, color: "#f59e0b" },
  { id: 5, date: "2026-02-06", description: "Farmácia", category: "Saúde", value: -89.5, color: "#10b981" },
  { id: 6, date: "2026-02-07", description: "Posto Shell", category: "Transporte", value: -210.0, color: "#6366f1" },
  { id: 7, date: "2026-02-08", description: "Spotify", category: "Assinaturas", value: -21.9, color: "#ec4899" },
  { id: 8, date: "2026-02-10", description: "Uber", category: "Transporte", value: -28.7, color: "#6366f1" },
  { id: 9, date: "2026-02-11", description: "Padaria Mineira", category: "Alimentação", value: -32.5, color: "#f59e0b" },
  { id: 10, date: "2026-02-12", description: "Amazon", category: "Compras", value: -189.9, color: "#8b5cf6" },
  { id: 11, date: "2026-02-13", description: "Uber", category: "Transporte", value: -42.3, color: "#6366f1" },
  { id: 12, date: "2026-02-14", description: "Restaurante", category: "Alimentação", value: -95.0, color: "#f59e0b" },
  { id: 13, date: "2026-02-15", description: "Conta de Luz", category: "Moradia", value: -187.6, color: "#06b6d4" },
  { id: 14, date: "2026-02-16", description: "Academia", category: "Saúde", value: -119.9, color: "#10b981" },
  { id: 15, date: "2026-02-17", description: "Mercado Extra", category: "Alimentação", value: -312.4, color: "#f59e0b" },
];

const CATEGORIES_SUMMARY = [
  { name: "Alimentação", total: 756.6, percent: 44.2, color: "#f59e0b", icon: "🍽" },
  { name: "Transporte", total: 316.5, percent: 18.5, color: "#6366f1", icon: "🚗" },
  { name: "Moradia", total: 187.6, percent: 11.0, color: "#06b6d4", icon: "🏠" },
  { name: "Saúde", total: 209.4, percent: 12.2, color: "#10b981", icon: "💊" },
  { name: "Compras", total: 189.9, percent: 11.1, color: "#8b5cf6", icon: "🛒" },
  { name: "Assinaturas", total: 77.8, percent: 4.5, color: "#ec4899", icon: "📺" },
];

// ─── Screens ─────────────────────────────────────
const SCREENS = {
  LOGIN: "login",
  CHOICE: "choice",
  TEST_DRIVE: "test_drive",
  REGISTER: "register",
  TRANSACTIONS: "transactions",
  DASHBOARD: "dashboard",
};

// ─── Animated Number ─────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <span>
      {prefix}
      {display.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {suffix}
    </span>
  );
}

// ─── Progress Bar ────────────────────────────────
function ProgressBar({ percent, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(t);
  }, [percent, delay]);
  return (
    <div style={{
      width: "100%", height: 6, borderRadius: 3,
      background: "rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        width: `${width}%`, height: "100%", borderRadius: 3,
        background: color,
        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    </div>
  );
}

// ─── Category Donut (SVG) ────────────────────────
function CategoryDonut({ categories }) {
  const total = categories.reduce((s, c) => s + c.total, 0);
  let cumulative = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 160 160" style={{ width: 160, height: 160 }}>
      {categories.map((cat, i) => {
        const dashLength = (cat.total / total) * circumference;
        const dashOffset = -(cumulative / total) * circumference;
        cumulative += cat.total;
        return (
          <circle
            key={i}
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={cat.color}
            strokeWidth="18"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "80px 80px",
              opacity: 0,
              animation: `donutFadeIn 0.6s ease forwards ${i * 0.15}s`,
            }}
          />
        );
      })}
      <text x="80" y="74" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="'DM Sans', sans-serif" fontWeight="500">
        Total
      </text>
      <text x="80" y="94" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="'DM Sans', sans-serif" fontWeight="700">
        R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </text>
    </svg>
  );
}

// ─── AI Insight Card ─────────────────────────────
function AIInsight({ transactions, income }) {
  const [visible, setVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");

  const totalSpent = transactions.reduce((s, t) => s + Math.abs(t.value), 0);
  const topCategory = CATEGORIES_SUMMARY[0];
  const percentSpent = income > 0 ? ((totalSpent / income) * 100).toFixed(0) : 0;

  const fullText = `Este mês você já comprometeu ${percentSpent}% da sua receita. ${topCategory.name} representa ${topCategory.percent}% dos seus gastos (R$ ${topCategory.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}). Considere estabelecer um limite mensal para essa categoria. Suas assinaturas somam R$ 77,80/mês — vale revisar se todas estão sendo utilizadas.`;

  const startTyping = () => {
    if (visible) return;
    setVisible(true);
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 18);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)",
      border: "1px solid rgba(99,102,241,0.15)",
      borderRadius: 12, padding: "20px 24px",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: visible ? 16 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>
            ✦
          </div>
          <div>
            <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>Análise Inteligente</span>
            <span style={{
              marginLeft: 8, fontSize: 10, color: "#6366f1",
              background: "rgba(99,102,241,0.15)", padding: "2px 8px",
              borderRadius: 4, fontWeight: 600, letterSpacing: 0.5,
            }}>
              IA
            </span>
          </div>
        </div>
        {!visible && (
          <button
            onClick={startTyping}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "#fff", padding: "8px 20px",
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Ver análise
          </button>
        )}
      </div>
      {visible && (
        <p style={{
          color: "#cbd5e1", fontSize: 14, lineHeight: 1.7,
          margin: 0, fontFamily: "'DM Sans', sans-serif",
        }}>
          {text}
          {typing && <span style={{ animation: "blink 1s infinite", color: "#6366f1" }}>|</span>}
        </p>
      )}
      {visible && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            fontSize: 10, color: "#64748b",
            background: "rgba(255,255,255,0.04)",
            padding: "3px 10px", borderRadius: 4,
          }}>
            1 de 1 análise gratuita utilizada
          </span>
          <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>
            Desbloquear Plus →
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────
export default function CashTracking() {
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [income, setIncome] = useState("");
  const [incomeSet, setIncomeSet] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [manualEntries, setManualEntries] = useState([]);
  const [manualForm, setManualForm] = useState({ date: "", description: "", value: "", type: "despesa" });
  const fileRef = useRef(null);

  // ─── Registration state
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  // ─── Simulate upload processing
  const simulateUpload = () => {
    setProcessing(true);
    setProcessPercent(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setProcessing(false);
          setUploadDone(true);
          setScreen(SCREENS.TRANSACTIONS);
        }, 400);
      }
      setProcessPercent(Math.min(p, 100));
    }, 200);
  };

  const totalSpent = MOCK_TRANSACTIONS.reduce((s, t) => s + Math.abs(t.value), 0);
  const parsedIncome = parseFloat(income) || 0;
  const balance = parsedIncome - totalSpent;

  const formatDate = (d) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}`;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA 1 — Login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.LOGIN) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.loginWrapper}>
          {/* Left side - Branding */}
          <div style={styles.loginBrand}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={styles.logoMark}>CT</div>
              <h1 style={styles.brandTitle}>Cash Tracking</h1>
              <p style={styles.brandSub}>
                Controle financeiro inteligente.
                <br />
                Visualize, categorize e otimize seus gastos.
              </p>
              <div style={styles.brandFeatures}>
                {["Upload de extratos bancários", "Categorização automática com IA", "Dashboard em tempo real"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, animation: `slideUp 0.5s ease forwards ${0.3 + i * 0.1}s`, opacity: 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#818cf8", flexShrink: 0 }}>✓</div>
                    <span style={{ color: "#94a3b8", fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.brandGlow} />
          </div>

          {/* Right side - Form */}
          <div style={styles.loginForm}>
            <div style={{ maxWidth: 380, width: "100%" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                Bem-vindo de volta
              </h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
                Entre na sua conta para continuar
              </p>

              <label style={styles.label}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={styles.input}
              />

              <label style={styles.label}>Senha</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />

              <button style={styles.btnPrimary} onClick={() => alert("Login: integrar com backend Elysia")}>
                Entrar
              </button>

              <div style={styles.divider}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>ou</span>
                <div style={styles.dividerLine} />
              </div>

              <button style={styles.btnSecondary} onClick={() => setScreen(SCREENS.CHOICE)}>
                Começar agora
              </button>

              <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 24 }}>
                Ainda não tem conta?{" "}
                <span style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }} onClick={() => setScreen(SCREENS.REGISTER)}>
                  Criar conta
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA — Registro
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.REGISTER) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.centeredCard}>
          <button style={styles.backBtn} onClick={() => setScreen(SCREENS.LOGIN)}>← Voltar</button>
          <div style={styles.logoMarkSmall}>CT</div>
          <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
            Criar conta
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
            Preencha seus dados para começar
          </p>

          <label style={styles.label}>Nome</label>
          <input
            type="text" value={registerForm.name}
            onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
            placeholder="Seu nome" style={styles.input}
          />

          <label style={styles.label}>E-mail</label>
          <input
            type="email" value={registerForm.email}
            onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
            placeholder="seu@email.com" style={styles.input}
          />

          <label style={styles.label}>Senha</label>
          <input
            type="password" value={registerForm.password}
            onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
            placeholder="Mínimo 8 caracteres" style={styles.input}
          />

          <button style={styles.btnPrimary} onClick={() => alert("Registro: integrar com backend Elysia")}>
            Criar conta
          </button>

          <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 20 }}>
            Já tem conta?{" "}
            <span style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }} onClick={() => setScreen(SCREENS.LOGIN)}>
              Entrar
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA 2 — Escolha (Test-Drive ou Cadastro)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.CHOICE) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.centeredCard}>
          <button style={styles.backBtn} onClick={() => setScreen(SCREENS.LOGIN)}>← Voltar</button>
          <div style={styles.logoMarkSmall}>CT</div>
          <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
            Como quer começar?
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
            Escolha a melhor opção para você
          </p>

          {/* Option: Test Drive */}
          <div
            style={styles.optionCard}
            onClick={() => setScreen(SCREENS.TEST_DRIVE)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ ...styles.optionIcon, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>▶</div>
              <div>
                <h3 style={styles.optionTitle}>Test-Drive</h3>
                <p style={styles.optionDesc}>Teste agora, sem cadastro. Importe seu extrato e veja o resultado.</p>
              </div>
            </div>
            <span style={{ color: "#475569", fontSize: 18 }}>→</span>
          </div>

          {/* Option: Register */}
          <div
            style={styles.optionCard}
            onClick={() => setScreen(SCREENS.REGISTER)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ ...styles.optionIcon, background: "linear-gradient(135deg, #10b981, #059669)" }}>+</div>
              <div>
                <h3 style={styles.optionTitle}>Criar conta</h3>
                <p style={styles.optionDesc}>Cadastre-se para salvar seus dados e acessar todas as funcionalidades.</p>
              </div>
            </div>
            <span style={{ color: "#475569", fontSize: 18 }}>→</span>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA 3 — Test Drive (Upload + Manual)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.TEST_DRIVE) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={{ maxWidth: 800, width: "100%", padding: "40px 24px", animation: "fadeIn 0.4s ease" }}>
          <button style={styles.backBtn} onClick={() => setScreen(SCREENS.CHOICE)}>← Voltar</button>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ ...styles.logoMarkSmall, margin: "0 auto 16px" }}>CT</div>
            <h2 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
              Importe seus dados
            </h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Escolha como deseja adicionar suas transações
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Upload */}
            <div style={styles.sectionCard}>
              <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                Upload de extrato
              </h3>

              <div
                style={{
                  ...styles.dropZone,
                  borderColor: dragOver ? "#6366f1" : "rgba(255,255,255,0.1)",
                  background: dragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.csv,.txt,.ofx" hidden onChange={simulateUpload} />
                {processing ? (
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 12 }}>Processando...</p>
                    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{
                        width: `${processPercent}%`, height: "100%", borderRadius: 3,
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>{Math.round(processPercent)}%</p>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>
                      ↑
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 4 }}>
                      Arraste seu arquivo aqui
                    </p>
                    <p style={{ color: "#475569", fontSize: 12 }}>
                      PDF, CSV, OFX ou TXT
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Manual Input */}
            <div style={styles.sectionCard}>
              <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                Input manual
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="date" value={manualForm.date}
                  onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                  style={styles.inputSmall}
                />
                <input
                  type="text" placeholder="Descrição" value={manualForm.description}
                  onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                  style={styles.inputSmall}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="number" placeholder="Valor (R$)" value={manualForm.value}
                    onChange={e => setManualForm({ ...manualForm, value: e.target.value })}
                    style={{ ...styles.inputSmall, flex: 1 }}
                  />
                  <select
                    value={manualForm.type}
                    onChange={e => setManualForm({ ...manualForm, type: e.target.value })}
                    style={{ ...styles.inputSmall, width: 120 }}
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
                <button
                  style={{ ...styles.btnPrimary, marginTop: 4, padding: "10px 16px", fontSize: 13 }}
                  onClick={() => {
                    if (manualForm.description && manualForm.value) {
                      setManualEntries(prev => [...prev, { ...manualForm, id: Date.now() }]);
                      setManualForm({ date: "", description: "", value: "", type: "despesa" });
                    }
                  }}
                >
                  Adicionar
                </button>
              </div>

              {manualEntries.length > 0 && (
                <div style={{ marginTop: 14, maxHeight: 120, overflowY: "auto" }}>
                  {manualEntries.map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>{e.description}</span>
                      <span style={{ color: e.type === "receita" ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                        {e.type === "receita" ? "+" : "-"} R$ {parseFloat(e.value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick action: view with mock data */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              style={{ ...styles.btnSecondary, maxWidth: 320 }}
              onClick={() => { setUploadDone(true); setScreen(SCREENS.TRANSACTIONS); }}
            >
              Ver demonstração com dados exemplo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA 4 — Transações + Receita + Preview
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.TRANSACTIONS) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={{ maxWidth: 900, width: "100%", padding: "40px 24px", animation: "fadeIn 0.4s ease" }}>
          <button style={styles.backBtn} onClick={() => setScreen(SCREENS.TEST_DRIVE)}>← Voltar</button>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                {MOCK_TRANSACTIONS.length} transações encontradas
              </h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Período: 01/02/2026 — 17/02/2026
              </p>
            </div>
            <button style={styles.btnPrimary} onClick={() => setScreen(SCREENS.DASHBOARD)}>
              Ver Dashboard →
            </button>
          </div>

          {/* Income input */}
          {!incomeSet && (
            <div style={{
              ...styles.sectionCard, marginBottom: 24,
              background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.06) 100%)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}>
              <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                Qual foi sua receita neste mês?
              </h3>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
                Informe o valor aproximado para calcularmos seu saldo e percentuais.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 14, fontWeight: 600 }}>R$</span>
                  <input
                    type="number" value={income}
                    onChange={e => setIncome(e.target.value)}
                    placeholder="5.000,00"
                    style={{ ...styles.inputSmall, paddingLeft: 40 }}
                  />
                </div>
                <button
                  style={{ ...styles.btnPrimary, padding: "10px 24px", fontSize: 13 }}
                  onClick={() => income && setIncomeSet(true)}
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {incomeSet && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Receita", value: parsedIncome, color: "#10b981", prefix: "R$ " },
                { label: "Gastos", value: totalSpent, color: "#ef4444", prefix: "R$ " },
                { label: "Saldo", value: balance, color: balance >= 0 ? "#10b981" : "#ef4444", prefix: "R$ " },
              ].map((item, i) => (
                <div key={i} style={{ ...styles.sectionCard, textAlign: "center", animation: `slideUp 0.4s ease forwards ${i * 0.1}s`, opacity: 0 }}>
                  <p style={{ color: "#64748b", fontSize: 12, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{item.label}</p>
                  <p style={{ color: item.color, fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    <AnimatedNumber value={item.value} prefix={item.prefix} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Transaction list */}
          <div style={styles.sectionCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                Extrato
              </h3>
              <span style={{ color: "#475569", fontSize: 12 }}>
                Total: R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px", gap: 0 }}>
              {/* Header */}
              {["Data", "Descrição", "Categoria", "Valor"].map((h, i) => (
                <div key={i} style={{ padding: "8px 12px", color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {h}
                </div>
              ))}
              {/* Rows */}
              {MOCK_TRANSACTIONS.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div style={{ ...styles.tableCell, animation: `slideUp 0.3s ease forwards ${i * 0.03}s`, opacity: 0 }}>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{formatDate(t.date)}</span>
                  </div>
                  <div style={{ ...styles.tableCell, animation: `slideUp 0.3s ease forwards ${i * 0.03}s`, opacity: 0 }}>
                    <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{t.description}</span>
                  </div>
                  <div style={{ ...styles.tableCell, animation: `slideUp 0.3s ease forwards ${i * 0.03}s`, opacity: 0 }}>
                    <span style={{
                      fontSize: 11, color: t.color, fontWeight: 600,
                      background: `${t.color}15`, padding: "3px 10px",
                      borderRadius: 4,
                    }}>
                      {t.category}
                    </span>
                  </div>
                  <div style={{ ...styles.tableCell, animation: `slideUp 0.3s ease forwards ${i * 0.03}s`, opacity: 0, textAlign: "right" }}>
                    <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                      - R$ {Math.abs(t.value).toFixed(2)}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* CTA Dashboard */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button style={{ ...styles.btnPrimary, maxWidth: 300 }} onClick={() => setScreen(SCREENS.DASHBOARD)}>
              Ver Dashboard Completo →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELA 5 — Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === SCREENS.DASHBOARD) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={{ padding: "28px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
                <div style={{ ...styles.logoMarkSmall, width: 32, height: 32, fontSize: 11, borderRadius: 8 }}>CT</div>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Cash Tracking</span>
              </div>
              {[
                { label: "Dashboard", icon: "◉", active: true },
                { label: "Transações", icon: "☰", onClick: () => setScreen(SCREENS.TRANSACTIONS) },
                { label: "Upload", icon: "↑", onClick: () => setScreen(SCREENS.TEST_DRIVE) },
                { label: "Insights IA", icon: "✦", plus: true },
                { label: "Planejamento", icon: "◫", plus: true },
                { label: "Configurações", icon: "⚙" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 8, marginBottom: 4,
                    background: item.active ? "rgba(99,102,241,0.12)" : "transparent",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onClick={item.onClick}
                  onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, color: item.active ? "#818cf8" : "#64748b", width: 20, textAlign: "center" }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: item.active ? "#e2e8f0" : "#94a3b8", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                  </div>
                  {item.plus && (
                    <span style={{ fontSize: 9, color: "#6366f1", background: "rgba(99,102,241,0.15)", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>PLUS</span>
                  )}
                </div>
              ))}
            </div>

            {/* Upgrade CTA */}
            <div style={{ padding: "0 20px 24px", marginTop: "auto" }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: 16,
              }}>
                <p style={{ color: "#c7d2fe", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Cash Tracking Plus</p>
                <p style={{ color: "#64748b", fontSize: 11, marginBottom: 12, lineHeight: 1.5 }}>
                  IA ilimitada, planejamento e relatórios avançados.
                </p>
                <div style={{
                  textAlign: "center", background: "#6366f1", color: "#fff",
                  padding: "8px 0", borderRadius: 6, fontSize: 12, fontWeight: 600,
                  cursor: "pointer",
                }}>
                  R$ 15/mês
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                  Dashboard
                </h1>
                <p style={{ color: "#64748b", fontSize: 13 }}>Fevereiro 2026</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={styles.btnSecondary}
                  onClick={() => setScreen(SCREENS.LOGIN)}
                >
                  Criar conta para salvar
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Receita", value: parsedIncome || 5000, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
                { label: "Gastos", value: totalSpent, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
                { label: "Saldo", value: (parsedIncome || 5000) - totalSpent, color: (parsedIncome || 5000) - totalSpent >= 0 ? "#10b981" : "#ef4444", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)" },
              ].map((c, i) => (
                <div key={i} style={{
                  background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: 12, padding: "20px 24px",
                  animation: `slideUp 0.5s ease forwards ${i * 0.1}s`, opacity: 0,
                }}>
                  <p style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 26, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    <AnimatedNumber value={c.value} prefix="R$ " />
                  </p>
                </div>
              ))}
            </div>

            {/* Categories + Donut */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {/* Donut */}
              <div style={styles.sectionCard}>
                <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                  Distribuição por categoria
                </h3>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CategoryDonut categories={CATEGORIES_SUMMARY} />
                </div>
              </div>

              {/* Category breakdown */}
              <div style={styles.sectionCard}>
                <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                  Categorias
                </h3>
                {CATEGORIES_SUMMARY.map((cat, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13 }}>{cat.icon}</span>
                        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>{cat.percent}%</span>
                        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                          R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <ProgressBar percent={cat.percent} color={cat.color} delay={200 + i * 100} />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <AIInsight transactions={MOCK_TRANSACTIONS} income={parsedIncome || 5000} />

            {/* Bottom CTA */}
            <div style={{
              marginTop: 28, textAlign: "center", padding: "24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 12 }}>
                Gostou do que viu? Crie sua conta para salvar seus dados e acessar análises ilimitadas.
              </p>
              <button style={{ ...styles.btnPrimary, maxWidth: 240 }} onClick={() => setScreen(SCREENS.REGISTER)}>
                Criar conta gratuita
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Styles
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0a0e1a 0%, #0f1629 40%, #0d1117 100%)",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e2e8f0",
  },
  loginWrapper: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
  },
  loginBrand: {
    flex: 1,
    padding: "60px 48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  brandGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    bottom: -100,
    right: -100,
    pointerEvents: "none",
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 24,
    fontFamily: "'DM Sans', sans-serif",
  },
  logoMarkSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: 32,
  },
  brandFeatures: {
    marginTop: 8,
  },
  loginForm: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 48px",
    background: "rgba(255,255,255,0.015)",
    borderLeft: "1px solid rgba(255,255,255,0.04)",
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    marginBottom: 16,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  inputSmall: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 13,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  btnSecondary: {
    width: "100%",
    padding: "12px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.06)",
  },
  dividerText: {
    color: "#475569",
    fontSize: 12,
  },
  centeredCard: {
    maxWidth: 440,
    width: "100%",
    padding: "40px 32px",
    animation: "fadeIn 0.4s ease",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 24,
    padding: 0,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    marginBottom: 12,
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.02)",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#fff",
    fontWeight: 700,
    flexShrink: 0,
  },
  optionTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 2,
    fontFamily: "'DM Sans', sans-serif",
  },
  optionDesc: {
    color: "#64748b",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.4,
  },
  sectionCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "20px 24px",
  },
  dropZone: {
    border: "2px dashed rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "36px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    minHeight: 160,
  },
  tableCell: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
  },
  sidebar: {
    width: 240,
    background: "linear-gradient(180deg, rgba(15,22,41,0.98) 0%, rgba(10,14,26,0.98) 100%)",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    flexShrink: 0,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Global CSS (animations + font import)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0e1a; }

  input:focus, select:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
  }

  button:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(0);
  }

  select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }

  select option {
    background: #1e293b;
    color: #e2e8f0;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes donutFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;