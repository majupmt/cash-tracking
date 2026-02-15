// ========================================
// CASH TRACKING — SPA Frontend
// ========================================

// ========================================
// MOCK DATA
// ========================================
const CATEGORIES = {
  "Alimentacao": { color: "#f59e0b", icon: "\uD83C\uDF7D" },
  "Transporte": { color: "#6366f1", icon: "\uD83D\uDE97" },
  "Saude":      { color: "#10b981", icon: "\uD83D\uDC8A" },
  "Assinaturas":{ color: "#ec4899", icon: "\uD83D\uDCF1" },
  "Lazer":      { color: "#8b5cf6", icon: "\uD83C\uDFAE" },
  "Moradia":    { color: "#0ea5e9", icon: "\uD83C\uDFE0" },
  "Educacao":   { color: "#14b8a6", icon: "\uD83D\uDCDA" },
  "Outros":     { color: "#64748b", icon: "\uD83D\uDCE6" }
};

const MOCK_TRANSACTIONS = [
  { id: 1,  date: "2026-02-01", desc: "Supermercado BH",     category: "Alimentacao",  value: -248.90 },
  { id: 2,  date: "2026-02-02", desc: "Uber - trabalho",     category: "Transporte",   value: -35.50 },
  { id: 3,  date: "2026-02-03", desc: "Netflix",             category: "Assinaturas",  value: -55.90 },
  { id: 4,  date: "2026-02-05", desc: "iFood",               category: "Alimentacao",  value: -67.80 },
  { id: 5,  date: "2026-02-06", desc: "Farmacia Drogasil",   category: "Saude",        value: -89.50 },
  { id: 6,  date: "2026-02-07", desc: "Posto Shell",         category: "Transporte",   value: -210.00 },
  { id: 7,  date: "2026-02-08", desc: "Spotify Premium",     category: "Assinaturas",  value: -21.90 },
  { id: 8,  date: "2026-02-10", desc: "Cinema",              category: "Lazer",        value: -42.00 },
  { id: 9,  date: "2026-02-11", desc: "Padaria Mineira",     category: "Alimentacao",  value: -18.50 },
  { id: 10, date: "2026-02-12", desc: "Aluguel",             category: "Moradia",      value: -1200.00 },
  { id: 11, date: "2026-02-13", desc: "Curso Udemy",         category: "Educacao",     value: -29.90 },
  { id: 12, date: "2026-02-14", desc: "Salario",           category: "Alimentacao",  value: 34.800}
];

const MOCK_DEBTS = [
  { id: 1, desc: "Cartao Nubank",      total: 1850.00, paid: 620.00,  due: "2026-03-10" },
  { id: 2, desc: "Emprestimo pessoal",  total: 5000.00, paid: 2500.00, due: "2026-06-15" }
];

const MOCK_FIXED = [
  { id: 1, desc: "Aluguel",   value: 1200.00, category: "Moradia" },
  { id: 2, desc: "Internet",  value: 119.90,  category: "Assinaturas" },
  { id: 3, desc: "Academia",  value: 89.90,   category: "Saude" },
  { id: 4, desc: "Energia",   value: 180.00,  category: "Moradia" }
];

// ========================================
// STATE
// ========================================
const state = {
  currentScreen: 'welcome',
  currentView: 'dashboard',
  isTestDrive: false,
  revenue: 0,
  transactions: [],
  debts: [...MOCK_DEBTS],
  fixed: [...MOCK_FIXED],
  manualEntries: [],
  uploadDone: false,
  sidebarCollapsed: false,
  aiShown: false,
  insightHistory: [],
  // Transactions view pagination
  txPage: 1,
  txPerPage: 15,
  txFilterSearch: '',
  txFilterCategory: '',
  txFilterType: '',
  // Edit state
  editingTx: null,
  editingDebt: null,
  editingFixed: null,
};

// ========================================
// UTILITIES
// ========================================
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

function formatCurrency(v) {
  return Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getFullDate() {
  const d = new Date();
  const dias = ['Domingo','Segunda-feira','Terca-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sabado'];
  const meses = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `Fevereiro 2026 \u2014 ${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()].toLowerCase()}`;
}

function getToken() { return localStorage.getItem('ct_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('ct_user') || 'null'); } catch { return null; }
}
function isLoggedIn() { return !!getToken(); }

function categorize(desc) {
  const d = desc.toLowerCase();
  if (/uber|99|taxi|onibus|metro|combustivel|posto|shell|ipiranga|estacionamento/.test(d)) return 'Transporte';
  if (/mercado|supermercado|ifood|rappi|padaria|restaurante|lanchonete|uber eats|alimenta/.test(d)) return 'Alimentacao';
  if (/aluguel|condominio|iptu|luz|agua|gas|internet|moradia|energia/.test(d)) return 'Moradia';
  if (/farmacia|hospital|medico|consulta|plano de saude|academia|smart fit|drogasil/.test(d)) return 'Saude';
  if (/netflix|spotify|amazon prime|disney|hbo|youtube|assinatura/.test(d)) return 'Assinaturas';
  if (/cinema|teatro|parque|bar|balada|lazer|jogo|game/.test(d)) return 'Lazer';
  if (/curso|livro|udemy|escola|faculdade|educa/.test(d)) return 'Educacao';
  return 'Outros';
}

function todayISO() { return new Date().toISOString().split('T')[0]; }

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    console.log(`[API] ✓ ${res.status} ${url}:`, data);
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} na requisicao`);
    return data;
  } catch (err) {
    console.error(`[API] ✗ ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

// ========================================
// BACKEND DATA LOADING (logged-in mode)
// ========================================
async function loadDashboardFromAPI() {
  try {
    console.log('🔄 Carregando dados do backend...');
    const [txRes, fixedRes, debtsRes, resumoRes] = await Promise.all([
      apiFetch('/api/transacoes').catch((e) => { console.warn('Erro em /api/transacoes:', e); return null; }),
      apiFetch('/api/contas').catch((e) => { console.warn('Erro em /api/contas:', e); return null; }),
      apiFetch('/api/dividas').catch((e) => { console.warn('Erro em /api/dividas:', e); return null; }),
      apiFetch('/api/dashboard/resumo').catch((e) => { console.warn('Erro em /api/dashboard/resumo:', e); return null; }),
    ]);

    // Map backend transacoes → frontend transactions
    if (txRes && Array.isArray(txRes)) {
      state.transactions = txRes.map(t => ({
        id: t.id,
        date: t.data,
        desc: t.descricao,
        category: t.categoria || categorize(t.descricao),
        value: Number(t.valor),
      }));
      console.log(`✅ Carregadas ${state.transactions.length} transações do backend`);
    } else {
      console.error('❌ Falha ao carregar transações do backend. Usando lista vazia.');
      state.transactions = [];
    }

    // Map backend contas_fixas → frontend fixed
    if (fixedRes && Array.isArray(fixedRes) && fixedRes.length > 0) {
      state.fixed = fixedRes.map(c => ({
        id: c.id,
        desc: c.descricao,
        value: Number(c.valor),
        category: c.categoria || 'Outros',
        pago: c.pago || false,
      }));
      console.log(`✅ Carregadas ${state.fixed.length} contas fixas`);
    }

    // Map backend dividas → frontend debts
    if (debtsRes && Array.isArray(debtsRes) && debtsRes.length > 0) {
      state.debts = debtsRes.map(d => ({
        id: d.id,
        desc: d.descricao,
        total: Number(d.valor_total),
        paid: Number(d.valor_pago || 0),
        due: d.data_inicio,
        parcelas_total: d.parcelas_total,
        parcelas_pagas: d.parcelas_pagas,
        quitada: d.quitada,
      }));
      console.log(`✅ Carregadas ${state.debts.length} dívidas`);
    }

    // Revenue from dashboard resumo
    if (resumoRes && resumoRes.receitas != null) {
      state.revenue = Number(resumoRes.receitas) || 0;
    } else {
      state.revenue = 0;
    }

    console.log('✅ Dados carregados do backend com sucesso');
    return true;
  } catch (err) {
    console.error('❌ Falha ao carregar do backend:', err);
    state.transactions = MOCK_TRANSACTIONS.map(t => ({ ...t }));
    state.revenue = 4500;
    return false;
  }
}

// Persist a new transaction to backend
async function apiCreateTransaction(tx) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch('/transacoes', {
      method: 'POST',
      body: JSON.stringify({
        data: tx.date,
        descricao: tx.desc,
        valor: tx.value,
        tipo: tx.value < 0 ? 'despesa' : 'receita',
        categoria: tx.category,
      }),
    });
    return result.transacao;
  } catch (e) {
    console.warn('Erro ao salvar transacao no backend:', e);
    return null;
  }
}

// Update a transaction in backend
async function apiUpdateTransaction(id, tx) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch(`/transacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: tx.date,
        descricao: tx.desc,
        valor: tx.value,
        tipo: tx.value < 0 ? 'despesa' : 'receita',
        categoria: tx.category,
      }),
    });
    return result.transacao;
  } catch (e) {
    console.warn('Erro ao atualizar transacao no backend:', e);
    return null;
  }
}

// Delete a transaction from backend
async function apiDeleteTransaction(id) {
  if (!isLoggedIn()) return;
  try { await apiFetch(`/transacoes/${id}`, { method: 'DELETE' }); } catch (e) { console.warn('Erro ao deletar transacao:', e); }
}

// Persist a new fixed bill to backend
async function apiCreateFixed(fixed) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch('/contas', {
      method: 'POST',
      body: JSON.stringify({
        descricao: fixed.desc,
        valor: fixed.value,
        dia_vencimento: null,
      }),
    });
    return result;
  } catch (e) {
    console.warn('Erro ao salvar conta fixa no backend:', e);
    return null;
  }
}

// Update a fixed bill in backend
async function apiUpdateFixed(id, fixed) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch(`/contas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        descricao: fixed.desc,
        valor: fixed.value,
        dia_vencimento: null,
      }),
    });
    return result;
  } catch (e) {
    console.warn('Erro ao atualizar conta fixa no backend:', e);
    return null;
  }
}

// Delete a fixed bill from backend
async function apiDeleteFixed(id) {
  if (!isLoggedIn()) return;
  try { await apiFetch(`/contas/${id}`, { method: 'DELETE' }); } catch (e) { console.warn('Erro ao deletar conta fixa:', e); }
}

// Persist a new debt to backend
async function apiCreateDebt(debt) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch('/dividas', {
      method: 'POST',
      body: JSON.stringify({
        descricao: debt.desc,
        valor_total: debt.total,
        parcelas_total: 1,
        parcelas_pagas: 0,
        data_inicio: debt.due,
      }),
    });
    return result;
  } catch (e) {
    console.warn('Erro ao salvar divida no backend:', e);
    return null;
  }
}

// Update a debt in backend
async function apiUpdateDebt(id, debt) {
  if (!isLoggedIn()) return null;
  try {
    const result = await apiFetch(`/dividas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        descricao: debt.desc,
        valor_total: debt.total,
        valor_pago: debt.paid,
        data_inicio: debt.due,
      }),
    });
    return result;
  } catch (e) {
    console.warn('Erro ao atualizar divida no backend:', e);
    return null;
  }
}

// Delete a debt from backend
async function apiDeleteDebt(id) {
  if (!isLoggedIn()) return;
  try { await apiFetch(`/dividas/${id}`, { method: 'DELETE' }); } catch (e) { console.warn('Erro ao deletar divida:', e); }
}

// Toggle fixed bill paid status
async function apiToggleFixedPago(id) {
  if (!isLoggedIn()) return;
  try { await apiFetch(`/contas/${id}/toggle-pago`, { method: 'PATCH' }); } catch (e) { console.warn('Erro ao toggle pago:', e); }
}

// Toggle debt quitada status
async function apiToggleDebtQuitada(id) {
  if (!isLoggedIn()) return;
  try { await apiFetch(`/dividas/${id}/toggle-quitada`, { method: 'PATCH' }); } catch (e) { console.warn('Erro ao toggle quitada:', e); }
}

// ========================================
// NAVIGATION
// ========================================
function showScreen(name) {
  state.currentScreen = name;
  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`#screen-${name}`);
  if (target) target.classList.add('active');
}

function navigateTo(screen) {
  showScreen(screen);
  if (screen === 'dashboard') initDashboard();
}

function switchView(viewName) {
  state.currentView = viewName;
  $$('.dash-view').forEach(v => v.classList.remove('active'));

  // If user asked for 'receitas', show the transacoes view but set filters
  const viewToShow = viewName === 'receitas' ? 'transacoes' : viewName;
  const target = $(`[data-view="${viewToShow}"]`);
  if (target) target.classList.add('active');

  // Update sidebar active (use original viewName so menu highlights 'receitas' button)
  $$('.sidebar-menu-item').forEach(i => i.classList.remove('active'));
  const menuBtn = $(`[data-menu="${viewName}"]`);
  if (menuBtn) menuBtn.classList.add('active');

  // Render the view
  if (viewName === 'dashboard') refreshDashboardView();
  else if (viewName === 'transacoes') {
    state.txFilterType = '';
    renderTransactionsView();
  } else if (viewName === 'receitas') {
    state.txFilterType = 'income';
    // Try to fetch receitas from backend; fallback to client-side filter
    (async () => {
      try {
        if (isLoggedIn()) {
          const res = await apiFetch('/receitas');
          if (res && res.receitas) {
            state.receitas = res.receitas.map(t => ({
              id: t.id,
              date: t.data,
              desc: t.descricao,
              category: t.categoria || categorize(t.descricao),
              value: Number(t.valor),
            }));
          }
        }
      } catch (e) {
        // ignore and fallthrough to render using existing state
        console.warn('Falha ao carregar receitas do backend, usando cache/local', e);
      } finally {
        renderTransactionsView();
      }
    })();
  } else if (viewName === 'dividas') renderDebtsView();
  else if (viewName === 'contas') renderFixedView();
  else if (viewName === 'insights') renderInsightsView();
}

// ========================================
// ANIMATED COUNTER
// ========================================
function animateValue(el, target, duration = 800) {
  const start = 0;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = formatCurrency(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ========================================
// SPARKLINE SVG
// ========================================
function sparklineSVG(points, color) {
  const w = 60, h = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg class="summary-sparkline" viewBox="0 0 ${w} ${h}"><polyline points="${coords}" stroke="${color}" /></svg>`;
}

// ========================================
// DONUT CHART SVG
// ========================================
function donutSVG(catEntries, total) {
  if (!catEntries.length) {
    return '<svg width="160" height="160"><circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="20"/><text x="80" y="84" text-anchor="middle" fill="#64748b" font-size="12" font-family="DM Sans">Sem dados</text></svg>';
  }
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;
  let arcs = '';
  catEntries.forEach(([cat, val], i) => {
    const pct = total > 0 ? val / total : 0;
    const dash = pct * C;
    const info = CATEGORIES[cat] || CATEGORIES.Outros;
    arcs += `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${info.color}" stroke-width="20" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)" style="opacity:0;animation:donutIn 0.4s ease ${i * 0.12}s forwards"/>`;
    offset += dash;
  });
  return `<svg width="160" height="160" viewBox="0 0 160 160">${arcs}<text x="80" y="78" text-anchor="middle" fill="#64748b" font-size="11" font-family="DM Sans">Total</text><text x="80" y="94" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="700" font-family="DM Mono">${formatCurrency(total)}</text></svg>`;
}

// ========================================
// TYPEWRITER EFFECT
// ========================================
function typewriter(el, text, speed = 10) {
  let i = 0;
  el.innerHTML = '<span class="typing-cursor"></span>';
  const interval = setInterval(() => {
    if (i < text.length) {
      el.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor"></span>';
      i++;
    } else {
      clearInterval(interval);
      el.textContent = text;
    }
  }, speed);
}

// ========================================
// CSV PARSER (Client-side fallback)
// ========================================
function parseCSVClient(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headerLine = lines[0].replace(/^\uFEFF/, '');
  const sep = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(sep).map(h => h.trim().replace(/^"|"$/g, ''));

  const findCol = (names) => {
    for (const n of names) {
      const idx = headers.findIndex(h => h.toLowerCase() === n.toLowerCase());
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const dateIdx = findCol(['Data', 'date', 'DATA', 'Data Transação', 'Data Transacao']);
  const descIdx = findCol(['Descrição', 'Descricao', 'Título', 'Titulo', 'description', 'DESCRICAO', 'Estabelecimento']);
  const valIdx = findCol(['Valor', 'value', 'VALOR', 'Quantia']);

  if (descIdx < 0 || valIdx < 0) return [];

  return lines.slice(1).map((line, i) => {
    const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    const rawDate = dateIdx >= 0 ? cols[dateIdx] || '' : '';
    const desc = cols[descIdx] || '';
    const rawVal = cols[valIdx] || '0';

    let date = todayISO();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [d, m, y] = rawDate.split('/');
      date = `${y}-${m}-${d}`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      date = rawDate;
    }

    const value = parseFloat(
      rawVal.replace('R$', '').replace(/\s/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.')
    );

    if (!desc.trim() || isNaN(value) || value === 0) return null;

    return {
      id: Date.now() + i,
      date,
      desc: desc.trim(),
      category: categorize(desc),
      value,
    };
  }).filter(Boolean);
}

// ========================================
// UPLOAD: Real file processing
// ========================================
async function processUpload(file) {
  console.log(`📤 Processando upload: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
  
  // Try server-side first
  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log(`📤 Enviando para servidor...`);
    const res = await fetch('/api/upload-extrato', { method: 'POST', body: formData });
    const data = await res.json();
    
    console.log(`📤 Resposta do servidor:`, data);
    
    if (data.success && data.transactions && data.transactions.length > 0) {
      console.log(`✅ ${data.transactions.length} transações extraídas`);
      return data.transactions.map(t => ({
        id: t.id || Date.now() + Math.random(),
        date: t.date,
        desc: t.desc,
        category: t.category,
        value: t.value,
      }));
    } else {
      console.warn(`⚠️ Resposta sem transações:`, data);
    }
  } catch (e) {
    console.error(`❌ Erro no servidor:`, e);
    // Server unavailable, fall through to client-side
  }

  // Client-side fallback for CSV
  console.log(`🔄 Tentando fallback client-side...`);
  const content = await file.text();
  const filename = file.name.toLowerCase();
  if (filename.endsWith('.csv') || filename.endsWith('.txt')) {
    const txns = parseCSVClient(content);
    if (txns.length > 0) {
      console.log(`✅ ${txns.length} transações do cliente`);
      return txns;
    }
  }

  console.error(`❌ Nenhuma transação encontrada`);
  return null;
}

// ========================================
// INIT: WELCOME SCREEN
// ========================================
function initWelcome() {
  $('[data-testid="btn-go-login"]').addEventListener('click', () => navigateTo('login'));
  $('[data-testid="btn-go-signup"]').addEventListener('click', () => navigateTo('signup'));
  $('[data-testid="link-test-drive"]').addEventListener('click', () => navigateTo('signup'));
}

// ========================================
// INIT: LOGIN SCREEN
// ========================================
function initLogin() {
  const emailEl = $('[data-testid="login-email"]');
  const passEl = $('[data-testid="login-password"]');
  const btnEl = $('[data-testid="btn-login"]');
  const errEl = $('[data-testid="login-error"]');

  function checkFields() {
    btnEl.disabled = !(emailEl.value.trim() && passEl.value.trim());
  }

  emailEl.addEventListener('input', checkFields);
  passEl.addEventListener('input', checkFields);

  passEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !btnEl.disabled) btnEl.click();
  });

  $('[data-testid="login-back"]').addEventListener('click', () => navigateTo('welcome'));

  btnEl.addEventListener('click', async () => {
    errEl.classList.remove('visible');
    errEl.textContent = '';
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailEl.value.trim(), senha: passEl.value }),
      });
      localStorage.setItem('ct_token', data.token);
      localStorage.setItem('ct_user', JSON.stringify(data.usuario));
      state.isTestDrive = false;
      // Load real data from Supabase
      await loadDashboardFromAPI();
      navigateTo('dashboard');
    } catch (err) {
      errEl.textContent = err.message || 'Email ou senha invalidos';
      errEl.classList.add('visible');
    }
  });
}

// ========================================
// INIT: SIGNUP SCREEN
// ========================================
function initSignup() {
  const nameEl = $('[data-testid="signup-name"]');
  const emailEl = $('[data-testid="signup-email"]');
  const passEl = $('[data-testid="signup-password"]');
  const btnEl = $('[data-testid="btn-signup"]');
  const errEl = $('[data-testid="signup-error"]');

  function checkFields() {
    btnEl.disabled = !(nameEl.value.trim() && emailEl.value.trim() && passEl.value.trim());
  }

  nameEl.addEventListener('input', checkFields);
  emailEl.addEventListener('input', checkFields);
  passEl.addEventListener('input', checkFields);

  $('[data-testid="signup-back"]').addEventListener('click', () => navigateTo('welcome'));

  $('[data-testid="btn-signup-testdrive"]').addEventListener('click', () => {
    state.isTestDrive = true;
    sessionStorage.setItem('ct_testdrive', '1');
    navigateTo('testdrive');
  });

  btnEl.addEventListener('click', async () => {
    errEl.classList.remove('visible');
    errEl.textContent = '';

    const nome = nameEl.value.trim();
    const email = emailEl.value.trim();
    const senha = passEl.value;

    if (nome.length < 2) { errEl.textContent = 'Nome deve ter no minimo 2 caracteres'; errEl.classList.add('visible'); return; }
    if (!email.includes('@')) { errEl.textContent = 'Email invalido'; errEl.classList.add('visible'); return; }
    if (senha.length < 8) { errEl.textContent = 'Senha deve ter no minimo 8 caracteres'; errEl.classList.add('visible'); return; }

    try {
      const data = await apiFetch('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
      localStorage.setItem('ct_token', data.token);
      localStorage.setItem('ct_user', JSON.stringify(data.usuario));
      state.isTestDrive = false;
      navigateTo('testdrive');
    } catch (err) {
      errEl.textContent = err.message || 'Erro ao cadastrar';
      errEl.classList.add('visible');
    }
  });
}

// ========================================
// INIT: TEST DRIVE SCREEN
// ========================================
function initTestDrive() {
  const tabBtns = $$('.tab-btn');
  const revenueInput = $('[data-testid="testdrive-revenue"]');
  const dashBtn = $('[data-testid="btn-go-dashboard"]');
  const dropzone = $('[data-testid="testdrive-dropzone"]');
  const fileInput = $('[data-testid="testdrive-file-input"]');
  const progressEl = $('[data-testid="testdrive-progress"]');
  const progressFill = $('[data-testid="testdrive-progress-fill"]');
  const successArea = $('[data-testid="upload-success-area"]');

  $('[data-testid="testdrive-back"]').addEventListener('click', () => navigateTo('signup'));

  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $('#tab-content-upload').style.display = tab === 'upload' ? 'block' : 'none';
      $('#tab-content-manual').style.display = tab === 'manual' ? 'block' : 'none';
    });
  });

  function checkReady() {
    const hasRevenue = revenueInput.value && parseFloat(revenueInput.value) > 0;
    const hasData = state.uploadDone || state.manualEntries.length > 0;
    dashBtn.disabled = !(hasRevenue && hasData);
  }

  function renderUploadReview(txns) {
    successArea.innerHTML = `
      <div class="upload-review" data-testid="upload-review">
        <div class="upload-review-header">
          <div class="upload-review-title">
            <span class="success-icon">&#10003;</span>
            <span>${txns.length} transacoes encontradas</span>
          </div>
          <button class="btn-ghost btn-sm" data-testid="upload-review-reupload">Enviar outro arquivo</button>
        </div>
        <div class="upload-review-table-wrapper">
          <table class="upload-review-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descricao</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody data-testid="upload-review-tbody">
              ${txns.map((t, i) => `
                <tr data-index="${i}">
                  <td><input type="date" class="review-input review-date" value="${t.date}" data-testid="review-date-${i}"></td>
                  <td><input type="text" class="review-input review-desc" value="${t.desc}" data-testid="review-desc-${i}"></td>
                  <td>
                    <select class="review-input review-cat" data-testid="review-cat-${i}">
                      ${Object.keys(CATEGORIES).map(c =>
                        `<option value="${c}" ${c === t.category ? 'selected' : ''}>${c}</option>`
                      ).join('')}
                    </select>
                  </td>
                  <td><input type="number" class="review-input review-value" value="${t.value}" step="0.01" data-testid="review-value-${i}"></td>
                  <td><button class="entry-remove review-remove" data-index="${i}" data-testid="review-remove-${i}">&times;</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    // Re-upload button
    successArea.querySelector('[data-testid="upload-review-reupload"]')?.addEventListener('click', () => {
      state.uploadDone = false;
      state.transactions = [];
      successArea.innerHTML = '';
      dropzone.style.display = '';
      checkReady();
    });

    // Listen to edits
    successArea.querySelectorAll('.review-input').forEach(input => {
      input.addEventListener('change', () => {
        const row = input.closest('tr');
        const idx = parseInt(row.dataset.index);
        const tx = state.transactions[idx];
        if (!tx) return;
        const dateInput = row.querySelector('.review-date');
        const descInput = row.querySelector('.review-desc');
        const catInput = row.querySelector('.review-cat');
        const valInput = row.querySelector('.review-value');
        tx.date = dateInput.value;
        tx.desc = descInput.value;
        tx.category = catInput.value;
        tx.value = parseFloat(valInput.value) || 0;
      });
    });

    // Remove buttons
    successArea.querySelectorAll('.review-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        state.transactions.splice(idx, 1);
        if (state.transactions.length === 0) {
          state.uploadDone = false;
          successArea.innerHTML = '';
          dropzone.style.display = '';
        } else {
          renderUploadReview(state.transactions);
        }
        checkReady();
      });
    });
  }

  revenueInput.addEventListener('input', checkReady);

  // Dropzone click/drag
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleTestDriveUpload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleTestDriveUpload(fileInput.files[0]);
  });

  async function handleTestDriveUpload(file) {
    dropzone.style.display = 'none';
    progressEl.classList.add('visible');

    // Animate progress
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 12 + 3;
      if (pct > 85) pct = 85;
      progressFill.style.width = pct + '%';
    }, 100);

    const txns = await processUpload(file);

    clearInterval(interval);
    progressFill.style.width = '100%';

    setTimeout(() => {
      progressEl.classList.remove('visible');

      if (txns && txns.length > 0) {
        state.uploadDone = true;
        state.transactions = txns;
        renderUploadReview(txns);
      } else {
        state.uploadDone = false;
        successArea.innerHTML = `
          <div class="upload-error">
            <p>❌ Nenhuma transacao foi extraida do arquivo</p>
            <p>Verifique o formato do arquivo (CSV/OFX/PDF/QFX)</p>
          </div>`;
      }
      checkReady();
    }, 400);
  }

  // Manual entries
  $('[data-testid="btn-add-manual"]').addEventListener('click', () => {
    const descEl = $('[data-testid="manual-desc"]');
    const valEl = $('[data-testid="manual-value"]');
    const typeEl = $('[data-testid="manual-type"]');
    const catEl = $('[data-testid="manual-category"]');

    const desc = descEl.value.trim();
    const valor = parseFloat(valEl.value);
    const tipo = typeEl.value;
    const cat = catEl.value;

    if (!desc || !valor || isNaN(valor)) return;

    const entry = {
      id: Date.now(),
      date: todayISO(),
      desc,
      category: cat,
      value: tipo === 'gasto' ? -valor : valor
    };

    state.manualEntries.push(entry);
    renderManualEntries();
    checkReady();

    descEl.value = '';
    valEl.value = '';
  });

  function renderManualEntries() {
    const list = $('[data-testid="manual-entries-list"]');
    list.innerHTML = state.manualEntries.map(e => {
      const isExpense = e.value < 0;
      const info = CATEGORIES[e.category] || CATEGORIES.Outros;
      return `
        <div class="manual-entry">
          <div>
            <div class="entry-desc">${e.desc}</div>
            <div class="entry-cat">${info.icon} ${e.category}</div>
          </div>
          <span class="entry-value ${isExpense ? '' : 'income'}">${isExpense ? '- ' : '+ '}${formatCurrency(e.value)}</span>
          <button class="entry-remove" data-id="${e.id}">&times;</button>
        </div>`;
    }).join('');

    list.querySelectorAll('.entry-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.manualEntries = state.manualEntries.filter(e => e.id !== parseInt(btn.dataset.id));
        renderManualEntries();
        checkReady();
      });
    });
  }

  // Go to dashboard
  dashBtn.addEventListener('click', () => {
    const revenueValue = parseFloat(revenueInput.value);
    state.revenue = isNaN(revenueValue) ? 4500 : revenueValue;
    if (!state.transactions.length && state.manualEntries.length) {
      state.transactions = [...state.manualEntries];
    } else if (!state.transactions.length) {
      state.transactions = MOCK_TRANSACTIONS.map(t => ({ ...t }));
    } else if (state.manualEntries.length) {
      state.transactions = [...state.transactions, ...state.manualEntries];
    }
    sessionStorage.setItem('ct_transactions', JSON.stringify(state.transactions));
    sessionStorage.setItem('ct_revenue', state.revenue.toString());
    navigateTo('dashboard');
  });
}

// ========================================
// INIT: DASHBOARD
// ========================================
function initDashboard() {
  // Load data from sessionStorage if needed
  if (!state.transactions.length) {
    const stored = sessionStorage.getItem('ct_transactions');
    if (stored) {
      state.transactions = JSON.parse(stored);
      console.log(`✅ Restauradas ${state.transactions.length} transações de sessionStorage`);
    } else {
      console.warn('⚠️ Dashboard sem transações carregadas. Estado vazio.');
      state.transactions = [];
    }
  }
  if (state.revenue === 0 || !state.revenue) {
    const storedRev = sessionStorage.getItem('ct_revenue');
    if (storedRev !== null) state.revenue = parseFloat(storedRev);
    else state.revenue = 4500;
  }

  const isTest = state.isTestDrive || sessionStorage.getItem('ct_testdrive') === '1';
  const user = getUser();

  // Banner
  const banner = $('[data-testid="test-banner"]');
  if (isTest && !isLoggedIn()) {
    banner.style.display = 'flex';
    $('[data-testid="screen-dashboard"]').classList.add('has-banner');
    $('.dashboard-main').style.paddingTop = '72px';
  } else {
    banner.style.display = 'none';
  }

  // Greeting
  const greeting = $('[data-testid="dash-greeting"]');
  if (user && user.nome) {
    greeting.textContent = `Ola, ${user.nome}`;
  } else {
    greeting.textContent = 'Seu Dashboard';
  }

  // Date
  $('[data-testid="dash-date"]').textContent = getFullDate();

  // Logout button
  const logoutBtn = $('[data-testid="sidebar-logout"]');
  if (isLoggedIn()) {
    logoutBtn.style.display = 'flex';
    logoutBtn.onclick = () => {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
      sessionStorage.clear();
      state.transactions = [];
      state.revenue = 0;
      state.isTestDrive = false;
      navigateTo('welcome');
    };
  } else {
    logoutBtn.style.display = 'none';
  }

  // Banner register
  $('[data-testid="banner-register"]').onclick = () => navigateTo('signup');

  // Sidebar toggle
  const sidebar = $('[data-testid="sidebar"]');
  $('[data-testid="sidebar-toggle"]').onclick = () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    $('.dashboard-main').style.marginLeft =
      state.sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';
    const toggleIcon = $('[data-testid="sidebar-toggle"] .menu-icon');
    toggleIcon.innerHTML = state.sidebarCollapsed ? '&#9655;' : '&#9665;';
  };

  // Sidebar menu navigation
  $$('.sidebar-menu-item').forEach(item => {
    item.onclick = () => {
      switchView(item.dataset.menu);
    };
  });

  // Compute values
  const expenses = state.transactions.filter(t => t.value < 0);
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.value), 0);
  const totalFixed = state.fixed.reduce((s, f) => s + f.value, 0);
  const balance = state.revenue - totalExpenses;

  // Summary cards
  renderSummaryCards(totalExpenses, totalFixed, balance);

  // Category breakdown
  const catMap = {};
  expenses.forEach(t => {
    const cat = t.category || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + Math.abs(t.value);
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Render dashboard view
  renderTransactions();
  renderDebts();
  renderDonut(catEntries, totalExpenses);
  renderBudget(totalExpenses);
  renderFixedBills();

  // Upload modal
  initUploadModal();

  // AI insight button
  $('[data-testid="btn-ai-insight"]').onclick = () => showAIInsight();

  // CRUD modals
  initTransactionModal();
  initDebtModal();
  initFixedModal();

  // Reset to dashboard view
  switchView('dashboard');

  // Animate summary values after render
  requestAnimationFrame(() => {
    $$('[data-animate-value]').forEach(el => {
      animateValue(el, parseFloat(el.dataset.animateValue));
    });
  });

  // Show AI insight automatically
  if (!state.aiShown) {
    const aiText = $('[data-testid="ai-text"]');
    const text = generateInsightText();
    aiText.textContent = text;
    state.aiShown = true;
  }
}

// ========================================
// DASHBOARD: Refresh (when switching back)
// ========================================
function refreshDashboardView() {
  const expenses = state.transactions.filter(t => t.value < 0);
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.value), 0);
  const totalFixed = state.fixed.reduce((s, f) => s + f.value, 0);
  const balance = state.revenue - totalExpenses;

  renderSummaryCards(totalExpenses, totalFixed, balance);
  renderTransactions();
  renderDebts();

  const catMap = {};
  expenses.forEach(t => {
    const cat = t.category || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + Math.abs(t.value);
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  renderDonut(catEntries, totalExpenses);
  renderBudget(totalExpenses);
  renderFixedBills();

  // Animate values
  requestAnimationFrame(() => {
    $$('[data-animate-value]').forEach(el => {
      animateValue(el, parseFloat(el.dataset.animateValue));
    });
  });
}

// ========================================
// DASHBOARD: Summary Cards
// ========================================
function renderSummaryCards(totalExpenses, totalFixed, balance) {
  const grid = $('[data-testid="summary-grid"]');
  const sparkIncome = [3800, 4100, 3900, 4200, 4500, 4300, 4500];
  const sparkExpense = [1800, 2100, 1900, 2300, 1700, 2000, totalExpenses];
  const sparkBalance = sparkIncome.map((v, i) => v - sparkExpense[i]);
  const sparkFixed = [1500, 1500, 1550, 1590, 1590, 1590, totalFixed];

  grid.innerHTML = `
    <div class="summary-card animate-in" data-testid="summary-card-income" style="animation-delay:0s">
      <div class="summary-border" style="background:#34d399"></div>
      <div class="summary-header">
        <div>
          <div class="summary-label">Receita do mes</div>
          <div class="summary-value mono" data-testid="summary-value-income" data-animate-value="${state.revenue}" data-raw-value="${state.revenue}">${formatCurrency(0)}</div>
          <div class="summary-trend positive">\u25B2 5.2% vs mes anterior</div>
        </div>
        ${sparklineSVG(sparkIncome, '#34d399')}
      </div>
    </div>
    <div class="summary-card animate-in" data-testid="summary-card-expenses" style="animation-delay:0.08s">
      <div class="summary-border" style="background:#f87171"></div>
      <div class="summary-header">
        <div>
          <div class="summary-label">Total de gastos</div>
          <div class="summary-value mono" data-testid="summary-value-expenses" data-animate-value="${totalExpenses}" data-raw-value="${totalExpenses}">${formatCurrency(0)}</div>
          <div class="summary-trend negative">\u25BC 8.4% vs mes anterior</div>
        </div>
        ${sparklineSVG(sparkExpense, '#f87171')}
      </div>
    </div>
    <div class="summary-card animate-in" data-testid="summary-card-balance" style="animation-delay:0.16s">
      <div class="summary-border" style="background:${balance >= 0 ? '#818cf8' : '#f87171'}"></div>
      <div class="summary-header">
        <div>
          <div class="summary-label">Saldo disponivel</div>
          <div class="summary-value mono" data-testid="summary-value-balance" style="color:${balance >= 0 ? '#818cf8' : '#f87171'}" data-animate-value="${Math.abs(balance)}" data-raw-value="${balance}">${formatCurrency(0)}</div>
          <div class="summary-trend ${balance >= 0 ? 'positive' : 'negative'}">${balance >= 0 ? '\u25B2' : '\u25BC'} ${balance >= 0 ? '+' : ''}${((balance / state.revenue) * 100).toFixed(1)}%</div>
        </div>
        ${sparklineSVG(sparkBalance, balance >= 0 ? '#818cf8' : '#f87171')}
      </div>
    </div>
    <div class="summary-card animate-in" data-testid="summary-card-fixed" style="animation-delay:0.24s">
      <div class="summary-border" style="background:#f59e0b"></div>
      <div class="summary-header">
        <div>
          <div class="summary-label">Contas fixas</div>
          <div class="summary-value mono" data-testid="summary-value-fixed" data-animate-value="${totalFixed}" data-raw-value="${totalFixed}">${formatCurrency(0)}</div>
          <div class="summary-trend negative">\u25B2 2.1% vs mes anterior</div>
        </div>
        ${sparklineSVG(sparkFixed, '#f59e0b')}
      </div>
    </div>`;
}

// ========================================
// DASHBOARD: Recent Transactions
// ========================================
function renderTransactions() {
  const card = $('[data-testid="transactions-card"]');
  const txns = state.transactions.slice(0, 10);

  card.innerHTML = `
    <div class="transactions-card-header">
      <div>
        <h3>Transacoes recentes<span class="count">${state.transactions.length}</span></h3>
      </div>
      <a href="javascript:void(0)" data-testid="link-ver-todas">Ver todas &rarr;</a>
    </div>
    <div class="transaction-list">
      ${txns.map((t, i) => {
        const cat = t.category || 'Outros';
        const info = CATEGORIES[cat] || CATEGORIES.Outros;
        const isExpense = t.value < 0;
        return `
          <div class="transaction-row animate-in" style="animation-delay:${i * 0.04}s">
            <div class="transaction-icon" style="background:${info.color}15">
              ${info.icon}
            </div>
            <div class="transaction-info">
              <div class="transaction-desc">${t.desc}</div>
              <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
            <div class="transaction-badge">
              <span class="badge badge-${cat.toLowerCase()}">${cat}</span>
            </div>
            <div class="transaction-value ${isExpense ? 'expense' : 'income'}">
              ${isExpense ? '- ' : '+ '}${formatCurrency(t.value)}
            </div>
          </div>`;
      }).join('')}
    </div>`;

  // "Ver todas" link navigates to transacoes view
  const link = $('[data-testid="link-ver-todas"]');
  if (link) link.onclick = (e) => { e.preventDefault(); switchView('transacoes'); };
}

// ========================================
// DASHBOARD: Debts (compact)
// ========================================
function renderDebts() {
  const card = $('[data-testid="debts-card"]');
  card.innerHTML = `
    <h3>Dividas ativas</h3>
    ${state.debts.map(d => {
      const pct = ((d.paid / d.total) * 100).toFixed(0);
      const remaining = d.total - d.paid;
      const dueDate = formatDateFull(d.due);
      return `
        <div class="debt-item">
          <div class="debt-header">
            <span class="debt-name">${d.desc}</span>
            <span class="debt-amounts mono">${formatCurrency(d.paid)} / ${formatCurrency(d.total)}</span>
          </div>
          <div class="debt-bar">
            <div class="debt-bar-fill ${parseInt(pct) > 60 ? 'high' : 'low'}" style="width:${pct}%"></div>
          </div>
          <div class="debt-info">Vencimento: ${dueDate} \u2014 Restam ${formatCurrency(remaining)}</div>
        </div>`;
    }).join('')}`;
}

// ========================================
// DASHBOARD: Donut Chart
// ========================================
function renderDonut(catEntries, totalExpenses) {
  const card = $('[data-testid="donut-card"]');
  card.innerHTML = `
    <h3>Gastos por categoria</h3>
    <div class="donut-wrapper">${donutSVG(catEntries, totalExpenses)}</div>
    <div class="donut-legend">
      ${catEntries.map(([cat, val]) => {
        const pct = totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : '0.0';
        const info = CATEGORIES[cat] || CATEGORIES.Outros;
        return `
          <div class="donut-legend-item">
            <div class="donut-legend-dot" style="background:${info.color}"></div>
            <span class="donut-legend-label">${info.icon} ${cat}</span>
            <span class="donut-legend-value mono">${formatCurrency(val)}</span>
            <span class="donut-legend-pct">${pct}%</span>
          </div>`;
      }).join('')}
    </div>`;
}

// ========================================
// DASHBOARD: Budget
// ========================================
function renderBudget(totalExpenses) {
  const card = $('[data-testid="budget-card"]');
  const pct = state.revenue > 0 ? ((totalExpenses / state.revenue) * 100) : 0;
  const barClass = pct < 60 ? 'ok' : pct < 80 ? 'warn' : 'danger';

  card.innerHTML = `
    <h3>Uso do orcamento</h3>
    <div class="budget-pct">${pct.toFixed(0)}%</div>
    <div class="budget-label">da receita comprometida</div>
    <div class="budget-bar">
      <div class="budget-bar-fill ${barClass}" style="width:${Math.min(pct, 100)}%"></div>
    </div>`;
}

// ========================================
// DASHBOARD: Fixed Bills (compact)
// ========================================
function renderFixedBills() {
  const card = $('[data-testid="fixed-card"]');
  card.innerHTML = `
    <h3>Contas fixas</h3>
    ${state.fixed.map(f => {
      const info = CATEGORIES[f.category] || CATEGORIES.Outros;
      return `
        <div class="fixed-item">
          <span class="fixed-icon">${info.icon}</span>
          <span class="fixed-desc">${f.desc}</span>
          <span class="fixed-value mono">${formatCurrency(-f.value)}</span>
        </div>`;
    }).join('')}`;
}

// ========================================
// DASHBOARD: AI Insight
// ========================================
function generateInsightText() {
  const expenses = state.transactions.filter(t => t.value < 0);
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.value), 0);

  const catMap = {};
  expenses.forEach(t => {
    const cat = t.category || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + Math.abs(t.value);
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  if (!catEntries.length) return 'Adicione transacoes para receber uma analise personalizada.';

  const topCat = catEntries[0];
  const topPct = ((topCat[1] / totalExpenses) * 100).toFixed(0);
  const foodTotal = catMap['Alimentacao'] || 0;
  const foodPct = totalExpenses > 0 ? ((foodTotal / totalExpenses) * 100).toFixed(0) : 0;
  const commitPct = state.revenue > 0 ? ((totalExpenses / state.revenue) * 100).toFixed(0) : 0;
  const totalFixed = state.fixed.reduce((s, f) => s + f.value, 0);
  const freeMargin = state.revenue - totalExpenses - totalFixed;
  const emergencyTarget = state.revenue * 0.10;

  let text = `Sua maior categoria de gastos e ${topCat[0]} com ${topPct}% do total. `;
  text += `Alimentacao representa ${foodPct}% (${formatCurrency(foodTotal)}). Considere estabelecer um teto de ${formatCurrency(foodTotal * 0.85)} para esta categoria. `;
  text += `Voce ja comprometeu ${commitPct}% da sua receita mensal com gastos variaveis. `;
  text += `Suas contas fixas somam ${formatCurrency(totalFixed)}, deixando uma margem livre de ${formatCurrency(Math.max(freeMargin, 0))}. `;
  text += `Sugestao: reserve pelo menos ${formatCurrency(emergencyTarget)} (10% da receita) como fundo de emergencia mensal.`;
  return text;
}

function showAIInsight() {
  const aiCard = $('[data-testid="ai-card"]');
  const aiText = $('[data-testid="ai-text"]');

  if (state.aiShown) return;
  state.aiShown = true;
  aiCard.classList.add('visible');

  const text = generateInsightText();
  typewriter(aiText, text);

  // Save to history
  state.insightHistory.unshift({
    date: new Date().toLocaleString('pt-BR'),
    text,
  });
}

// ========================================
// UPLOAD MODAL (Dashboard)
// ========================================
function initUploadModal() {
  const modal = $('#upload-modal');
  const dropzone = $('[data-testid="modal-dropzone"]');
  const fileInput = $('[data-testid="modal-file-input"]');
  const processBtn = $('[data-testid="btn-modal-process"]');
  const progressEl = $('[data-testid="modal-progress"]');

  $('[data-testid="btn-upload-modal"]').onclick = () => {
    modal.style.display = 'flex';
    // Reset state
    dropzone.style.display = 'flex';
    processBtn.disabled = true;
    progressEl.classList.remove('visible');
    fileInput.value = '';
  };

  $('[data-testid="modal-close"]').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  dropzone.onclick = () => fileInput.click();
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      processBtn.disabled = false;
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) processBtn.disabled = false;
  });

  processBtn.onclick = async () => {
    if (!fileInput.files[0]) return;
    processBtn.disabled = true;
    dropzone.style.display = 'none';
    progressEl.classList.add('visible');

    const fill = progressEl.querySelector('.progress-fill');
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 12 + 3;
      if (pct > 85) pct = 85;
      fill.style.width = pct + '%';
    }, 100);

    const txns = await processUpload(fileInput.files[0]);

    clearInterval(interval);
    fill.style.width = '100%';

    setTimeout(() => {
      modal.style.display = 'none';
      if (txns && txns.length > 0) {
        state.transactions = [...state.transactions, ...txns];
        sessionStorage.setItem('ct_transactions', JSON.stringify(state.transactions));
      }
      // Refresh dashboard
      initDashboard();
    }, 500);
  };
}

// ========================================
// VIEW: TRANSACTIONS (Full table)
// ========================================
function getFilteredTransactions() {
  let txns = [...state.transactions];

  if (state.txFilterSearch) {
    const q = state.txFilterSearch.toLowerCase();
    txns = txns.filter(t => t.desc.toLowerCase().includes(q));
  }

  if (state.txFilterCategory) {
    txns = txns.filter(t => t.category === state.txFilterCategory);
  }

  if (state.txFilterType === 'expense') {
    txns = txns.filter(t => t.value < 0);
  } else if (state.txFilterType === 'income') {
    txns = txns.filter(t => t.value >= 0);
  }

  return txns;
}

function renderTransactionsView() {
  const tbody = $('[data-testid="transactions-tbody"]');
  const info = $('[data-testid="transactions-info"]');
  const pagination = $('[data-testid="transactions-pagination"]');

  // Bind filters
  const searchInput = $('[data-testid="filter-search"]');
  const catFilter = $('[data-testid="filter-category"]');
  const typeFilter = $('[data-testid="filter-type"]');

  // Adjust header title when viewing receitas
  const headerTitle = $('[data-view="transacoes"] .section-header h2');
  if (headerTitle) headerTitle.textContent = state.currentView === 'receitas' ? 'Receitas' : 'Transacoes';

  // Ensure type filter control reflects current view filter
  typeFilter.value = state.txFilterType === 'income' ? 'income' : (state.txFilterType === 'expense' ? 'expense' : '');

  searchInput.oninput = () => { state.txFilterSearch = searchInput.value; state.txPage = 1; renderTransactionsView(); };
  catFilter.onchange = () => { state.txFilterCategory = catFilter.value; state.txPage = 1; renderTransactionsView(); };
  typeFilter.onchange = () => { state.txFilterType = typeFilter.value; state.txPage = 1; renderTransactionsView(); };

  // Bind "new transaction" button
  $('[data-testid="btn-new-transaction"]').onclick = () => openTransactionModal();

  const filtered = getFilteredTransactions();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.txPerPage));
  if (state.txPage > totalPages) state.txPage = totalPages;
  const start = (state.txPage - 1) * state.txPerPage;
  const page = filtered.slice(start, start + state.txPerPage);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">\uD83D\uDCCB</div><p>Nenhuma transacao encontrada</p></div></td></tr>`;
  } else {
    tbody.innerHTML = page.map(t => {
      const cat = t.category || 'Outros';
      const isExpense = t.value < 0;
      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td class="td-desc">${t.desc}</td>
          <td><span class="badge badge-${cat.toLowerCase()}">${cat}</span></td>
          <td class="td-value ${isExpense ? 'expense' : 'income'}">${isExpense ? '- ' : '+ '}${formatCurrency(t.value)}</td>
          <td class="td-actions">
            <button class="btn-icon" data-action="edit-tx" data-id="${t.id}" title="Editar">&#9998;</button>
            <button class="btn-icon danger" data-action="delete-tx" data-id="${t.id}" title="Excluir">&times;</button>
          </td>
        </tr>`;
    }).join('');
  }

  info.textContent = `${filtered.length} transacoes${state.txFilterSearch || state.txFilterCategory || state.txFilterType ? ' (filtradas)' : ''}`;

  // Pagination
  let pagHtml = '';
  pagHtml += `<button ${state.txPage <= 1 ? 'disabled' : ''} data-page="${state.txPage - 1}">&laquo;</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - state.txPage) > 1) {
      if (p === 3 || p === totalPages - 2) pagHtml += `<button disabled>...</button>`;
      continue;
    }
    pagHtml += `<button class="${p === state.txPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button ${state.txPage >= totalPages ? 'disabled' : ''} data-page="${state.txPage + 1}">&raquo;</button>`;
  pagination.innerHTML = pagHtml;

  // Pagination clicks
  pagination.querySelectorAll('button[data-page]').forEach(btn => {
    btn.onclick = () => {
      const p = parseInt(btn.dataset.page);
      if (p >= 1 && p <= totalPages) { state.txPage = p; renderTransactionsView(); }
    };
  });

  // Action buttons
  tbody.querySelectorAll('[data-action="edit-tx"]').forEach(btn => {
    btn.onclick = () => {
      const tx = state.transactions.find(t => t.id == btn.dataset.id);
      if (tx) openTransactionModal(tx);
    };
  });
  tbody.querySelectorAll('[data-action="delete-tx"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      apiDeleteTransaction(id);
      state.transactions = state.transactions.filter(t => t.id != id);
      sessionStorage.setItem('ct_transactions', JSON.stringify(state.transactions));
      renderTransactionsView();
    };
  });
}

// ========================================
// VIEW: DEBTS (Full cards)
// ========================================
function renderDebtsView() {
  const summary = $('[data-testid="debts-summary"]');
  const grid = $('[data-testid="debts-grid"]');

  $('[data-testid="btn-new-debt"]').onclick = () => openDebtModal();

  const totalDebt = state.debts.reduce((s, d) => s + d.total, 0);
  const totalPaid = state.debts.reduce((s, d) => s + d.paid, 0);
  const totalRemaining = totalDebt - totalPaid;

  summary.innerHTML = `
    <div class="debts-summary-item">
      <span class="debts-summary-label">Total em dividas</span>
      <span class="debts-summary-value mono">${formatCurrency(totalDebt)}</span>
    </div>
    <div class="debts-summary-item">
      <span class="debts-summary-label">Ja pago</span>
      <span class="debts-summary-value mono" style="color:var(--color-income)">${formatCurrency(totalPaid)}</span>
    </div>
    <div class="debts-summary-item">
      <span class="debts-summary-label">Restante</span>
      <span class="debts-summary-value mono" style="color:var(--color-expense)">${formatCurrency(totalRemaining)}</span>
    </div>`;

  if (state.debts.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">\u2705</div><p>Nenhuma divida cadastrada</p></div>`;
    return;
  }

  grid.innerHTML = state.debts.map(d => {
    const pct = d.total > 0 ? ((d.paid / d.total) * 100).toFixed(0) : 0;
    const remaining = d.total - d.paid;
    return `
      <div class="debt-card">
        <div class="debt-card-header">
          <div>
            <div class="debt-card-title">${d.desc}</div>
            <div class="debt-card-due">Vencimento: ${formatDateFull(d.due)}</div>
          </div>
          <div class="debt-card-actions">
            <button class="btn-icon" data-action="edit-debt" data-id="${d.id}" title="Editar">&#9998;</button>
            <button class="btn-icon danger" data-action="delete-debt" data-id="${d.id}" title="Excluir">&times;</button>
          </div>
        </div>
        <div class="debt-card-amounts">
          <span class="debt-paid">Pago: ${formatCurrency(d.paid)}</span>
          <span class="debt-remaining">Restam: ${formatCurrency(remaining)}</span>
        </div>
        <div class="debt-card-bar">
          <div class="debt-card-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="debt-card-pct">${pct}% quitado</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('[data-action="edit-debt"]').forEach(btn => {
    btn.onclick = () => {
      const d = state.debts.find(d => d.id == btn.dataset.id);
      if (d) openDebtModal(d);
    };
  });
  grid.querySelectorAll('[data-action="delete-debt"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      apiDeleteDebt(id);
      state.debts = state.debts.filter(d => d.id != id);
      renderDebtsView();
    };
  });
}

// ========================================
// VIEW: FIXED BILLS (Full cards)
// ========================================
function renderFixedView() {
  const totalBar = $('[data-testid="fixed-total-bar"]');
  const grid = $('[data-testid="fixed-grid"]');

  $('[data-testid="btn-new-fixed"]').onclick = () => openFixedModal();

  const totalFixed = state.fixed.reduce((s, f) => s + f.value, 0);

  totalBar.innerHTML = `
    <span class="fixed-total-label">Total mensal em contas fixas</span>
    <span class="fixed-total-value mono">${formatCurrency(totalFixed)}</span>`;

  if (state.fixed.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCCB</div><p>Nenhuma conta fixa cadastrada</p></div>`;
    return;
  }

  grid.innerHTML = state.fixed.map(f => {
    const info = CATEGORIES[f.category] || CATEGORIES.Outros;
    return `
      <div class="fixed-card-item">
        <div class="fixed-card-icon" style="background:${info.color}15">${info.icon}</div>
        <div class="fixed-card-info">
          <div class="fixed-card-desc">${f.desc}</div>
          <div class="fixed-card-cat">${f.category}</div>
        </div>
        <span class="fixed-card-value mono">${formatCurrency(f.value)}</span>
        <div class="fixed-card-actions">
          <button class="btn-icon" data-action="edit-fixed" data-id="${f.id}" title="Editar">&#9998;</button>
          <button class="btn-icon danger" data-action="delete-fixed" data-id="${f.id}" title="Excluir">&times;</button>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('[data-action="edit-fixed"]').forEach(btn => {
    btn.onclick = () => {
      const f = state.fixed.find(f => f.id == btn.dataset.id);
      if (f) openFixedModal(f);
    };
  });
  grid.querySelectorAll('[data-action="delete-fixed"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      apiDeleteFixed(id);
      state.fixed = state.fixed.filter(f => f.id != id);
      renderFixedView();
    };
  });
}

// ========================================
// VIEW: INSIGHTS
// ========================================
function renderInsightsView() {
  const textEl = $('[data-testid="insight-text"]');
  const historyList = $('[data-testid="insight-history-list"]');

  $('[data-testid="btn-generate-insight"]').onclick = () => {
    const text = generateInsightText();
    state.insightHistory.unshift({
      date: new Date().toLocaleString('pt-BR'),
      text,
    });
    typewriter(textEl, text);
    renderInsightsView();
  };

  // Show current or last insight
  if (state.insightHistory.length > 0) {
    textEl.textContent = state.insightHistory[0].text;
  } else {
    textEl.textContent = 'Clique em "Gerar nova analise" para receber insights sobre suas financas.';
  }

  // Render history
  if (state.insightHistory.length <= 1) {
    historyList.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Nenhuma analise anterior ainda.</p>';
  } else {
    historyList.innerHTML = state.insightHistory.slice(1).map(h => `
      <div class="insight-history-item">
        <div class="insight-history-date">${h.date}</div>
        <div class="insight-history-text">${h.text}</div>
      </div>`).join('');
  }
}

// ========================================
// MODAL: TRANSACTION (Create/Edit)
// ========================================
function openTransactionModal(tx = null) {
  state.editingTx = tx;
  const modal = $('#transaction-modal');
  $('[data-testid="transaction-modal-title"]').textContent = tx ? 'Editar transacao' : 'Nova transacao';
  $('[data-testid="tx-modal-desc"]').value = tx ? tx.desc : '';
  $('[data-testid="tx-modal-value"]').value = tx ? Math.abs(tx.value) : '';
  $('[data-testid="tx-modal-type"]').value = tx && tx.value >= 0 ? 'receita' : 'gasto';
  $('[data-testid="tx-modal-category"]').value = tx ? tx.category : 'Alimentacao';
  $('[data-testid="tx-modal-date"]').value = tx ? tx.date : todayISO();
  modal.style.display = 'flex';
}

function initTransactionModal() {
  const modal = $('#transaction-modal');

  $('[data-testid="transaction-modal-close"]').onclick = () => { modal.style.display = 'none'; };
  $('[data-testid="tx-modal-cancel"]').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  $('[data-testid="tx-modal-save"]').onclick = async () => {
    const desc = $('[data-testid="tx-modal-desc"]').value.trim();
    const value = parseFloat($('[data-testid="tx-modal-value"]').value);
    const type = $('[data-testid="tx-modal-type"]').value;
    const category = $('[data-testid="tx-modal-category"]').value;
    const date = $('[data-testid="tx-modal-date"]').value || todayISO();

    console.log(`📝 Salvando transação:`, { desc, value, type, category, date });

    if (!desc || isNaN(value) || value <= 0) {
      console.warn('❌ Validação falhou');
      return;
    }

    const finalValue = type === 'gasto' ? -value : value;
    const txData = { date, desc, category, value: finalValue };

    if (state.editingTx) {
      // Update existing — persist to backend
      console.log(`🔄 Atualizando transação ${state.editingTx.id}`);
      await apiUpdateTransaction(state.editingTx.id, txData);
      const tx = state.transactions.find(t => t.id === state.editingTx.id);
      if (tx) {
        tx.desc = desc;
        tx.value = finalValue;
        tx.category = category;
        tx.date = date;
      }
    } else {
      // Create new — persist to backend if logged in
      console.log(`✨ Criando nova transação`);
      const saved = await apiCreateTransaction(txData);
      state.transactions.unshift({
        id: saved ? saved.id : Date.now(),
        ...txData,
      });
    }

    sessionStorage.setItem('ct_transactions', JSON.stringify(state.transactions));
    modal.style.display = 'none';
    state.editingTx = null;
    renderTransactionsView();
  };
}

// ========================================
// MODAL: DEBT (Create/Edit)
// ========================================
function openDebtModal(debt = null) {
  state.editingDebt = debt;
  const modal = $('#debt-modal');
  $('[data-testid="debt-modal-title"]').textContent = debt ? 'Editar divida' : 'Nova divida';
  $('[data-testid="debt-modal-desc"]').value = debt ? debt.desc : '';
  $('[data-testid="debt-modal-total"]').value = debt ? debt.total : '';
  $('[data-testid="debt-modal-paid"]').value = debt ? debt.paid : '';
  $('[data-testid="debt-modal-due"]').value = debt ? debt.due : '';
  modal.style.display = 'flex';
}

function initDebtModal() {
  const modal = $('#debt-modal');

  $('[data-testid="debt-modal-close"]').onclick = () => { modal.style.display = 'none'; };
  $('[data-testid="debt-modal-cancel"]').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  $('[data-testid="debt-modal-save"]').onclick = async () => {
    const desc = $('[data-testid="debt-modal-desc"]').value.trim();
    const total = parseFloat($('[data-testid="debt-modal-total"]').value);
    const paid = parseFloat($('[data-testid="debt-modal-paid"]').value) || 0;
    const due = $('[data-testid="debt-modal-due"]').value;

    if (!desc || isNaN(total) || total <= 0 || !due) return;

    const debtData = { desc, total, paid, due };

    if (state.editingDebt) {
      // Update existing — persist to backend
      await apiUpdateDebt(state.editingDebt.id, debtData);
      const d = state.debts.find(d => d.id === state.editingDebt.id);
      if (d) {
        d.desc = desc;
        d.total = total;
        d.paid = paid;
        d.due = due;
      }
    } else {
      const saved = await apiCreateDebt(debtData);
      state.debts.push({
        id: saved ? saved.id : Date.now(),
        ...debtData,
      });
    }

    modal.style.display = 'none';
    state.editingDebt = null;
    renderDebtsView();
  };
}

// ========================================
// MODAL: FIXED BILL (Create/Edit)
// ========================================
function openFixedModal(fixed = null) {
  state.editingFixed = fixed;
  const modal = $('#fixed-modal');
  $('[data-testid="fixed-modal-title"]').textContent = fixed ? 'Editar conta fixa' : 'Nova conta fixa';
  $('[data-testid="fixed-modal-desc"]').value = fixed ? fixed.desc : '';
  $('[data-testid="fixed-modal-value"]').value = fixed ? fixed.value : '';
  $('[data-testid="fixed-modal-category"]').value = fixed ? fixed.category : 'Moradia';
  modal.style.display = 'flex';
}

function initFixedModal() {
  const modal = $('#fixed-modal');

  $('[data-testid="fixed-modal-close"]').onclick = () => { modal.style.display = 'none'; };
  $('[data-testid="fixed-modal-cancel"]').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  $('[data-testid="fixed-modal-save"]').onclick = async () => {
    const desc = $('[data-testid="fixed-modal-desc"]').value.trim();
    const value = parseFloat($('[data-testid="fixed-modal-value"]').value);
    const category = $('[data-testid="fixed-modal-category"]').value;

    if (!desc || isNaN(value) || value <= 0) return;

    const fixedData = { desc, value, category };

    if (state.editingFixed) {
      // Update existing — persist to backend
      await apiUpdateFixed(state.editingFixed.id, fixedData);
      const f = state.fixed.find(f => f.id === state.editingFixed.id);
      if (f) {
        f.desc = desc;
        f.value = value;
        f.category = category;
      }
    } else {
      const saved = await apiCreateFixed(fixedData);
      state.fixed.push({
        id: saved ? saved.id : Date.now(),
        ...fixedData,
      });
    }

    modal.style.display = 'none';
    state.editingFixed = null;
    renderFixedView();
  };
}

// ========================================
// BOOT
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Init all screen event listeners (always)
  initWelcome();
  initLogin();
  initSignup();
  initTestDrive();

  // Check if already logged in
  if (isLoggedIn()) {
    state.isTestDrive = false;
    showScreen('dashboard');
    // Load real data from Supabase, fallback to mock
    await loadDashboardFromAPI();
    initDashboard();
  } else {
    showScreen('welcome');
  }
});
