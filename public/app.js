// ========================================
// CASH TRACKING — SPA Frontend
// ========================================

const APP = document.getElementById('app');

// ========================================
// STATE
// ========================================
let state = {
  transacoes: [],
  receita: 0,
  receitaSaved: false,
  manualEntries: [],
  aiUsed: false,
  isTestDrive: false,
};

// ========================================
// MOCK DATA
// ========================================
const MOCK_TRANSACTIONS = [
  { data: '01/02/2026', descricao: 'Uber', valor: 35.50, tipo: 'despesa', categoria: 'Transporte' },
  { data: '02/02/2026', descricao: 'Supermercado BH', valor: 248.90, tipo: 'despesa', categoria: 'Alimentacao' },
  { data: '03/02/2026', descricao: 'Netflix', valor: 55.90, tipo: 'despesa', categoria: 'Assinaturas' },
  { data: '04/02/2026', descricao: 'Farmacia Drogasil', valor: 89.50, tipo: 'despesa', categoria: 'Saude' },
  { data: '05/02/2026', descricao: 'iFood', valor: 67.80, tipo: 'despesa', categoria: 'Alimentacao' },
  { data: '06/02/2026', descricao: 'Posto Shell', valor: 210.00, tipo: 'despesa', categoria: 'Transporte' },
  { data: '07/02/2026', descricao: 'Amazon Prime', valor: 14.90, tipo: 'despesa', categoria: 'Assinaturas' },
  { data: '08/02/2026', descricao: 'Mercado Livre', valor: 189.90, tipo: 'despesa', categoria: 'Compras' },
  { data: '09/02/2026', descricao: 'Aluguel', valor: 1500.00, tipo: 'despesa', categoria: 'Moradia' },
  { data: '10/02/2026', descricao: 'Curso Udemy', valor: 27.90, tipo: 'despesa', categoria: 'Educacao' },
  { data: '11/02/2026', descricao: 'Cinema', valor: 45.00, tipo: 'despesa', categoria: 'Lazer' },
  { data: '12/02/2026', descricao: 'Padaria Central', valor: 32.50, tipo: 'despesa', categoria: 'Alimentacao' },
  { data: '13/02/2026', descricao: 'Spotify', valor: 21.90, tipo: 'despesa', categoria: 'Assinaturas' },
  { data: '14/02/2026', descricao: 'Uber Eats', valor: 52.30, tipo: 'despesa', categoria: 'Alimentacao' },
  { data: '15/02/2026', descricao: 'Academia Smart Fit', valor: 99.90, tipo: 'despesa', categoria: 'Saude' },
];

const CATEGORIES = {
  Alimentacao: { color: '#f59e0b', icon: '\uD83C\uDF7D', label: 'Alimentacao' },
  Transporte: { color: '#6366f1', icon: '\uD83D\uDE97', label: 'Transporte' },
  Moradia: { color: '#06b6d4', icon: '\uD83C\uDFE0', label: 'Moradia' },
  Saude: { color: '#10b981', icon: '\uD83D\uDC8A', label: 'Saude' },
  Compras: { color: '#8b5cf6', icon: '\uD83D\uDED2', label: 'Compras' },
  Assinaturas: { color: '#ec4899', icon: '\uD83D\uDCFA', label: 'Assinaturas' },
  Lazer: { color: '#f97316', icon: '\uD83C\uDFAE', label: 'Lazer' },
  Educacao: { color: '#14b8a6', icon: '\uD83D\uDCDA', label: 'Educacao' },
  Outros: { color: '#64748b', icon: '\uD83D\uDCE6', label: 'Outros' },
};

// ========================================
// UTILITIES
// ========================================
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
}

function isLoggedIn() {
  return !!getToken();
}

function categorize(descricao) {
  const d = descricao.toLowerCase();
  if (/uber|99|taxi|onibus|metro|combustivel|posto|shell|ipiranga|estacionamento/.test(d)) return 'Transporte';
  if (/mercado|supermercado|ifood|rappi|padaria|restaurante|lanchonete|uber eats|alimenta/.test(d)) return 'Alimentacao';
  if (/aluguel|condominio|iptu|luz|agua|gas|internet|moradia/.test(d)) return 'Moradia';
  if (/farmacia|hospital|medico|consulta|plano de saude|academia|smart fit|drogasil/.test(d)) return 'Saude';
  if (/netflix|spotify|amazon prime|disney|hbo|youtube|assinatura/.test(d)) return 'Assinaturas';
  if (/cinema|teatro|parque|bar|balada|lazer|jogo|game/.test(d)) return 'Lazer';
  if (/curso|livro|udemy|escola|faculdade|educa/.test(d)) return 'Educacao';
  if (/mercado livre|shopee|amazon|compra|loja|shopping/.test(d)) return 'Compras';
  return 'Outros';
}

function getCurrentMonthYear() {
  const months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getTransactionPeriod(transacoes) {
  if (!transacoes.length) return '';
  const dates = transacoes.map(t => t.data);
  return `${dates[0]} \u2014 ${dates[dates.length - 1]}`;
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na requisicao');
    return data;
  } catch (err) {
    throw err;
  }
}

// ========================================
// ROUTER
// ========================================
const routes = {
  '#/': renderLogin,
  '#/escolha': renderEscolha,
  '#/registro': renderRegistro,
  '#/test-drive': renderTestDrive,
  '#/transacoes': renderTransacoes,
  '#/dashboard': renderDashboard,
  '#/upload': renderUpload,
  '#/input-manual': renderInputManual,
  '#/configuracoes': renderConfiguracoes,
};

function navigate(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const route = routes[hash] || renderLogin;
  APP.innerHTML = '';
  route();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) window.location.hash = '#/';
  handleRoute();
});

// ========================================
// SCREEN: LOGIN
// ========================================
function renderLogin() {
  if (isLoggedIn()) { navigate('#/dashboard'); return; }

  APP.innerHTML = `
    <div class="login-page">
      <div class="login-branding">
        <div class="login-logo">CT</div>
        <h1>Cash Tracking</h1>
        <p class="subtitle">Controle financeiro inteligente.</p>
        <ul class="login-features">
          <li><span class="check-icon"><i data-lucide="check" style="width:12px;height:12px"></i></span> Importe seu extrato automaticamente</li>
          <li><span class="check-icon"><i data-lucide="check" style="width:12px;height:12px"></i></span> Categorize gastos com IA</li>
          <li><span class="check-icon"><i data-lucide="check" style="width:12px;height:12px"></i></span> Visualize para onde vai seu dinheiro</li>
        </ul>
      </div>
      <div class="login-form-side">
        <div class="login-form-container">
          <h2>Bem-vindo de volta</h2>
          <p class="subtitle">Entre na sua conta para continuar</p>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" data-testid="login-email" placeholder="seu@email.com">
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" data-testid="login-password" placeholder="********">
          </div>
          <div class="error-message" data-testid="login-error"></div>
          <button class="btn-primary" data-testid="btn-login">Entrar</button>
          <div class="form-divider">ou</div>
          <button class="btn-secondary" data-testid="btn-comecar">Comecar agora</button>
          <div class="login-footer">
            <a href="javascript:void(0)" data-testid="link-criar-conta">Criar conta</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Login handler
  APP.querySelector('[data-testid="btn-login"]').addEventListener('click', async () => {
    const email = APP.querySelector('[data-testid="login-email"]').value;
    const senha = APP.querySelector('[data-testid="login-password"]').value;
    const errEl = APP.querySelector('[data-testid="login-error"]');

    if (!email || !senha) {
      errEl.textContent = 'Preencha todos os campos!';
      errEl.classList.add('visible');
      return;
    }

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      state.isTestDrive = false;
      navigate('#/dashboard');
    } catch (err) {
      errEl.textContent = err.message || 'Email ou senha invalidos';
      errEl.classList.add('visible');
    }
  });

  // Enter key on password
  APP.querySelector('[data-testid="login-password"]').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') APP.querySelector('[data-testid="btn-login"]').click();
  });

  APP.querySelector('[data-testid="btn-comecar"]').addEventListener('click', () => navigate('#/escolha'));
  APP.querySelector('[data-testid="link-criar-conta"]').addEventListener('click', () => navigate('#/registro'));
}

// ========================================
// SCREEN: REGISTRO
// ========================================
function renderRegistro() {
  APP.innerHTML = `
    <div class="centered-page">
      <div class="centered-card">
        <button class="back-button" onclick="navigate('#/')">\u2190 Voltar</button>
        <div class="centered-logo">CT</div>
        <h2>Criar conta</h2>
        <p class="subtitle">Cadastre-se para comecar a controlar suas financas</p>
        <div class="form-group">
          <label>Nome</label>
          <input type="text" data-testid="register-name" placeholder="Seu nome completo">
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" data-testid="register-email" placeholder="seu@email.com">
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" data-testid="register-password" placeholder="Minimo 8 caracteres">
        </div>
        <div class="error-message" data-testid="register-error"></div>
        <button class="btn-primary" data-testid="btn-register">Criar conta</button>
        <div class="login-footer" style="margin-top:16px">
          Ja tem conta? <a href="javascript:void(0)" onclick="navigate('#/')">Entrar</a>
        </div>
      </div>
    </div>
  `;

  APP.querySelector('[data-testid="btn-register"]').addEventListener('click', async () => {
    const nome = APP.querySelector('[data-testid="register-name"]').value;
    const email = APP.querySelector('[data-testid="register-email"]').value;
    const senha = APP.querySelector('[data-testid="register-password"]').value;
    const errEl = APP.querySelector('[data-testid="register-error"]');

    if (!nome || nome.length < 2) { errEl.textContent = 'Nome deve ter no minimo 2 caracteres'; errEl.classList.add('visible'); return; }
    if (!email || !email.includes('@')) { errEl.textContent = 'Email invalido'; errEl.classList.add('visible'); return; }
    if (!senha || senha.length < 8) { errEl.textContent = 'Senha deve ter no minimo 8 caracteres'; errEl.classList.add('visible'); return; }

    try {
      const data = await apiFetch('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      state.isTestDrive = false;
      navigate('#/dashboard');
    } catch (err) {
      errEl.textContent = err.message || 'Erro ao cadastrar';
      errEl.classList.add('visible');
    }
  });
}

// ========================================
// SCREEN: ESCOLHA
// ========================================
function renderEscolha() {
  APP.innerHTML = `
    <div class="centered-page">
      <div class="centered-card">
        <button class="back-button" onclick="navigate('#/')">\u2190 Voltar</button>
        <div class="centered-logo">CT</div>
        <h2>Como quer comecar?</h2>
        <p class="subtitle">Escolha a opcao que preferir</p>
        <div class="choice-card" data-testid="option-test-drive">
          <div class="choice-icon choice-icon-play"><i data-lucide="play" style="width:20px;height:20px"></i></div>
          <div>
            <h3>Test-Drive</h3>
            <p>Teste agora, sem cadastro. Importe seu extrato e veja o resultado.</p>
          </div>
        </div>
        <div class="choice-card" data-testid="option-register">
          <div class="choice-icon choice-icon-register"><i data-lucide="plus" style="width:20px;height:20px"></i></div>
          <div>
            <h3>Criar conta</h3>
            <p>Cadastre-se para salvar seus dados e acessar todas as funcionalidades.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  APP.querySelector('[data-testid="option-test-drive"]').addEventListener('click', () => {
    state.isTestDrive = true;
    navigate('#/test-drive');
  });
  APP.querySelector('[data-testid="option-register"]').addEventListener('click', () => navigate('#/registro'));
}

// ========================================
// SCREEN: TEST-DRIVE
// ========================================
function renderTestDrive() {
  state.isTestDrive = true;
  state.manualEntries = [];

  APP.innerHTML = `
    <div class="test-drive-page">
      <div class="test-drive-container">
        <button class="back-button" onclick="navigate('#/escolha')">\u2190 Voltar</button>
        <h2>Test-Drive</h2>
        <p class="subtitle" style="color:var(--text-muted);margin-bottom:8px">Importe seu extrato ou adicione transacoes manualmente</p>

        <div class="test-drive-grid">
          <!-- Upload Column -->
          <div class="test-drive-card">
            <h3>Upload de extrato</h3>
            <div class="upload-dropzone" data-testid="upload-dropzone">
              <div class="upload-dropzone-icon"><i data-lucide="upload" style="width:22px;height:22px"></i></div>
              <p>Arraste seu arquivo aqui</p>
              <span class="upload-hint">PDF, CSV, OFX ou TXT</span>
            </div>
            <input type="file" class="hidden-input" data-testid="upload-file-input" accept=".pdf,.csv,.txt,.ofx">
            <div class="upload-progress" data-testid="upload-progress">
              <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
          </div>

          <!-- Manual Input Column -->
          <div class="test-drive-card">
            <h3>Input manual</h3>
            <div class="manual-form">
              <input type="date" data-testid="manual-date">
              <input type="text" data-testid="manual-description" placeholder="Descricao">
              <div class="form-row">
                <input type="number" data-testid="manual-value" placeholder="Valor" step="0.01" min="0">
                <select data-testid="manual-type">
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
              <button class="btn-primary" data-testid="btn-add-manual">Adicionar</button>
            </div>
            <div class="manual-entries" data-testid="manual-entries-list"></div>
          </div>
        </div>

        <div class="test-drive-footer">
          <button class="btn-secondary" data-testid="btn-demo-data">Ver demonstracao com dados exemplo</button>
        </div>
      </div>
    </div>
  `;

  // Dropzone click -> trigger file input
  const dropzone = APP.querySelector('[data-testid="upload-dropzone"]');
  const fileInput = APP.querySelector('[data-testid="upload-file-input"]');

  dropzone.addEventListener('click', () => fileInput.click());

  // Drag events
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  });

  // Demo data
  APP.querySelector('[data-testid="btn-demo-data"]').addEventListener('click', () => {
    state.transacoes = [...MOCK_TRANSACTIONS];
    state.receita = 0;
    state.receitaSaved = false;
    sessionStorage.setItem('transacoes', JSON.stringify(state.transacoes));
    navigate('#/transacoes');
  });

  // Manual add
  APP.querySelector('[data-testid="btn-add-manual"]').addEventListener('click', () => {
    const dateEl = APP.querySelector('[data-testid="manual-date"]');
    const descEl = APP.querySelector('[data-testid="manual-description"]');
    const valEl = APP.querySelector('[data-testid="manual-value"]');
    const typeEl = APP.querySelector('[data-testid="manual-type"]');

    const dateVal = dateEl.value;
    const desc = descEl.value.trim();
    const valor = parseFloat(valEl.value);
    const tipo = typeEl.value;

    if (!dateVal || !desc || !valor || isNaN(valor)) return;

    const parts = dateVal.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    const entry = {
      data: formattedDate,
      descricao: desc,
      valor,
      tipo,
      categoria: categorize(desc),
    };

    state.manualEntries.push(entry);
    renderManualEntries();

    dateEl.value = '';
    descEl.value = '';
    valEl.value = '';
  });
}

function renderManualEntries() {
  const list = APP.querySelector('[data-testid="manual-entries-list"]');
  if (!list) return;
  list.innerHTML = state.manualEntries.map(e => `
    <div class="manual-entry">
      <span class="entry-desc">${e.descricao}</span>
      <span class="entry-value ${e.tipo === 'receita' ? 'income' : ''}">${e.tipo === 'despesa' ? '- ' : '+ '}R$ ${formatCurrency(e.valor)}</span>
    </div>
  `).join('');
}

async function handleFileUpload(file) {
  const progress = APP.querySelector('[data-testid="upload-progress"]');
  progress.classList.add('visible');

  try {
    const formData = new FormData();
    formData.append('arquivo', file);

    const res = await fetch('/extrato/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.transacoes && data.transacoes.length) {
      state.transacoes = data.transacoes.map(t => ({
        ...t,
        categoria: t.categoria || categorize(t.descricao),
      }));
    } else {
      // Fallback: parse CSV client-side
      state.transacoes = await parseCSVClientSide(file);
    }

    state.receita = 0;
    state.receitaSaved = false;
    sessionStorage.setItem('transacoes', JSON.stringify(state.transacoes));
    navigate('#/transacoes');
  } catch (err) {
    // Fallback: try client-side parsing
    try {
      state.transacoes = await parseCSVClientSide(file);
      state.receita = 0;
      state.receitaSaved = false;
      sessionStorage.setItem('transacoes', JSON.stringify(state.transacoes));
      navigate('#/transacoes');
    } catch {
      progress.classList.remove('visible');
    }
  }
}

function parseCSVClientSide(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        const transactions = [];

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(';').map(p => p.trim());
          if (parts.length >= 3) {
            const valor = parseFloat(parts[2].replace(',', '.'));
            if (!isNaN(valor)) {
              transactions.push({
                data: parts[0],
                descricao: parts[1],
                valor: Math.abs(valor),
                tipo: valor < 0 ? 'despesa' : 'receita',
                categoria: categorize(parts[1]),
              });
            }
          }
        }
        resolve(transactions);
      } catch { reject(new Error('Failed to parse CSV')); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ========================================
// SCREEN: TRANSACOES
// ========================================
function renderTransacoes() {
  // Load from sessionStorage if empty
  if (!state.transacoes.length) {
    const stored = sessionStorage.getItem('transacoes');
    if (stored) state.transacoes = JSON.parse(stored);
  }

  // Also load manual entries
  if (state.manualEntries.length && !state.transacoes.length) {
    state.transacoes = [...state.manualEntries];
  }

  const totalExpenses = state.transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const balance = state.receita - totalExpenses;

  APP.innerHTML = `
    <div class="transactions-page">
      <div class="transactions-container">
        <div class="transactions-header">
          <div>
            <h1 data-testid="transactions-count">${state.transacoes.length} transacoes encontradas</h1>
            <p class="period" data-testid="transactions-period">Periodo: ${getTransactionPeriod(state.transacoes)}</p>
          </div>
          <button class="btn-primary" data-testid="btn-view-dashboard">Ver Dashboard \u2192</button>
        </div>

        ${!state.receitaSaved ? `
        <div class="income-card">
          <h3>Qual foi sua receita neste mes?</h3>
          <p class="subtitle">Informe o valor aproximado para calcularmos seu saldo e percentuais.</p>
          <div class="income-input-group">
            <div class="income-input-wrapper">
              <span class="income-prefix">R$</span>
              <input type="number" data-testid="income-input" placeholder="0,00" step="0.01" min="0">
            </div>
            <button class="btn-primary" data-testid="btn-save-income">Salvar</button>
          </div>
        </div>
        ` : `
        <div class="summary-cards">
          <div class="summary-card income" data-testid="summary-income">
            <div class="summary-label">RECEITA</div>
            <div class="summary-value mono">R$ ${formatCurrency(state.receita)}</div>
          </div>
          <div class="summary-card expenses" data-testid="summary-expenses">
            <div class="summary-label">GASTOS</div>
            <div class="summary-value mono">R$ ${formatCurrency(totalExpenses)}</div>
          </div>
          <div class="summary-card balance ${balance < 0 ? 'negative' : ''}" data-testid="summary-balance">
            <div class="summary-label">SALDO</div>
            <div class="summary-value mono">R$ ${formatCurrency(balance)}</div>
          </div>
        </div>
        `}

        <div class="transactions-table" data-testid="transactions-table">
          <div class="table-header">
            <div>DATA</div>
            <div>DESCRICAO</div>
            <div class="col-category">CATEGORIA</div>
            <div style="text-align:right">VALOR</div>
          </div>
          ${state.transacoes.map((t, i) => `
            <div class="table-row animate-in" data-row style="animation-delay:${i * 0.03}s">
              <div class="row-date">${t.data}</div>
              <div class="row-desc">${t.descricao}</div>
              <div class="row-category"><span class="badge badge-${(t.categoria || 'Outros').toLowerCase()}">${t.categoria || 'Outros'}</span></div>
              <div class="row-value ${t.tipo === 'receita' ? 'income' : ''}">${t.tipo === 'despesa' ? '- ' : '+ '}R$ ${formatCurrency(t.valor)}</div>
            </div>
          `).join('')}
        </div>

        <div class="transactions-footer">
          <button class="btn-primary" data-testid="btn-view-dashboard">Ver Dashboard Completo \u2192</button>
        </div>
      </div>
    </div>
  `;

  // Save income
  const saveBtn = APP.querySelector('[data-testid="btn-save-income"]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const val = parseFloat(APP.querySelector('[data-testid="income-input"]').value);
      if (!val || isNaN(val)) return;
      state.receita = val;
      state.receitaSaved = true;
      sessionStorage.setItem('receita', val.toString());
      renderTransacoes();
    });
  }

  // Navigate to dashboard
  APP.querySelectorAll('[data-testid="btn-view-dashboard"]').forEach(btn => {
    btn.addEventListener('click', () => navigate('#/dashboard'));
  });
}

// ========================================
// SCREEN: DASHBOARD
// ========================================
function renderDashboard() {
  // Load transacoes from sessionStorage if needed
  if (!state.transacoes.length) {
    const stored = sessionStorage.getItem('transacoes');
    if (stored) state.transacoes = JSON.parse(stored);
  }

  // Load receita from sessionStorage
  if (!state.receita) {
    const storedReceita = sessionStorage.getItem('receita');
    if (storedReceita) { state.receita = parseFloat(storedReceita); state.receitaSaved = true; }
  }

  const isTest = state.isTestDrive || !isLoggedIn();
  const expenses = state.transacoes.filter(t => t.tipo === 'despesa');
  const totalExpenses = expenses.reduce((s, t) => s + t.valor, 0);
  const balance = state.receita - totalExpenses;

  // Category breakdown
  const catMap = {};
  expenses.forEach(t => {
    const cat = t.categoria || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + t.valor;
  });

  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  APP.innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('dashboard')}
      <div class="dashboard-main">
        <div class="mobile-header">
          <button class="hamburger-btn" onclick="toggleMobileSidebar()"><i data-lucide="menu" style="width:18px;height:18px"></i></button>
          <h2>Dashboard</h2>
        </div>

        <div class="dashboard-topbar">
          <div>
            <h1 data-testid="dashboard-title">Dashboard</h1>
            <p class="topbar-date">${getCurrentMonthYear()}</p>
          </div>
          ${isTest ? '<button class="btn-secondary" data-testid="btn-register-cta" onclick="navigate(\'#/registro\')">Criar conta para salvar</button>' : ''}
        </div>

        <!-- Summary Cards -->
        <div class="dashboard-summary">
          <div class="summary-card income" data-testid="dashboard-summary-income">
            <div class="summary-label">RECEITA</div>
            <div class="summary-value mono">R$ ${formatCurrency(state.receita)}</div>
          </div>
          <div class="summary-card expenses" data-testid="dashboard-summary-expenses">
            <div class="summary-label">GASTOS</div>
            <div class="summary-value mono">R$ ${formatCurrency(totalExpenses)}</div>
          </div>
          <div class="summary-card balance ${balance < 0 ? 'negative' : ''}" data-testid="dashboard-summary-balance">
            <div class="summary-label">SALDO</div>
            <div class="summary-value mono">R$ ${formatCurrency(balance)}</div>
          </div>
        </div>

        <!-- Categories Section -->
        <div class="categories-section">
          <div class="category-donut-card" data-testid="category-donut">
            <h3>Distribuicao por categoria</h3>
            <div class="donut-container">
              ${renderDonutChart(catEntries, totalExpenses)}
            </div>
          </div>
          <div class="category-breakdown-card" data-testid="category-breakdown">
            <h3>Detalhamento</h3>
            ${catEntries.map(([cat, val]) => {
              const pct = totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : 0;
              const catInfo = CATEGORIES[cat] || CATEGORIES.Outros;
              return `
                <div class="category-item">
                  <div class="category-dot" style="background:${catInfo.color}"></div>
                  <div class="category-info">
                    <div class="category-name">${catInfo.icon} ${cat}</div>
                    <div class="category-bar-wrapper">
                      <div class="category-bar-fill" style="width:${pct}%;background:${catInfo.color}"></div>
                    </div>
                  </div>
                  <div class="category-percent">${pct}%</div>
                  <div class="category-value mono">R$ ${formatCurrency(val)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- AI Insight Card -->
        <div class="ai-card" data-testid="ai-insight-card">
          <div class="ai-card-header">
            <div class="ai-icon"><i data-lucide="sparkles" style="width:16px;height:16px"></i></div>
            <h3>Analise Inteligente</h3>
            <span class="badge-ia">IA</span>
          </div>
          <div data-testid="ai-insight-text" class="ai-insight-text"></div>
          ${!state.aiUsed ? `<button class="btn-primary" data-testid="btn-ai-analyze">Ver analise</button>` : ''}
          <div data-testid="ai-free-limit" class="ai-free-limit" style="display:none">
            1 de 1 analise gratuita utilizada &middot; <a href="javascript:void(0)">Desbloquear Plus \u2192</a>
          </div>
        </div>

        <!-- CTA Card (test drive) -->
        ${isTest ? `
        <div class="cta-card">
          <p>Gostou do que viu? Crie sua conta para salvar seus dados e acessar analises ilimitadas.</p>
          <button class="btn-primary" data-testid="btn-register-cta" onclick="navigate('#/registro')">Criar conta gratuita</button>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  // AI analysis button
  const aiBtn = APP.querySelector('[data-testid="btn-ai-analyze"]');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      aiBtn.style.display = 'none';
      runAIAnalysis(catEntries, totalExpenses);
    });
  }

  // Animate category bars after render
  requestAnimationFrame(() => {
    APP.querySelectorAll('.category-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = w; });
    });
  });
}

function renderDonutChart(catEntries, total) {
  if (!catEntries.length) {
    return '<svg width="160" height="160"><circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="20"/><text x="80" y="78" text-anchor="middle" fill="#64748b" font-size="12" font-family="DM Sans">Sem dados</text></svg>';
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let segments = '';

  catEntries.forEach(([cat, val], i) => {
    const pct = total > 0 ? val / total : 0;
    const dashLen = pct * circumference;
    const catInfo = CATEGORIES[cat] || CATEGORIES.Outros;
    segments += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${catInfo.color}" stroke-width="20" stroke-dasharray="${dashLen} ${circumference - dashLen}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)" style="opacity:0;animation:fadeIn 0.4s ease ${i * 0.15}s forwards"/>`;
    offset += dashLen;
  });

  return `
    <svg width="160" height="160" viewBox="0 0 160 160">
      ${segments}
      <text x="80" y="74" text-anchor="middle" fill="#64748b" font-size="11" font-family="DM Sans">Total</text>
      <text x="80" y="92" text-anchor="middle" fill="#f1f5f9" font-size="13" font-weight="700" font-family="DM Mono">R$ ${formatCurrency(total)}</text>
    </svg>
  `;
}

function runAIAnalysis(catEntries, totalExpenses) {
  const textEl = APP.querySelector('[data-testid="ai-insight-text"]');
  const limitEl = APP.querySelector('[data-testid="ai-free-limit"]');

  // Build analysis text based on real data
  let analysis = '';
  if (catEntries.length) {
    const topCat = catEntries[0];
    const topPct = totalExpenses > 0 ? ((topCat[1] / totalExpenses) * 100).toFixed(0) : 0;
    analysis = `Com base nas suas ${state.transacoes.length} transacoes, identifiquei que a categoria "${topCat[0]}" representa ${topPct}% dos seus gastos totais (R$ ${formatCurrency(topCat[1])}). `;

    if (state.receita > 0) {
      const savingRate = ((state.receita - totalExpenses) / state.receita * 100).toFixed(0);
      if (savingRate > 0) {
        analysis += `Voce conseguiu poupar ${savingRate}% da sua renda este mes, o que e ${savingRate >= 20 ? 'excelente' : savingRate >= 10 ? 'bom' : 'um comeco'}. `;
      } else {
        analysis += `Seus gastos ultrapassaram sua receita em R$ ${formatCurrency(totalExpenses - state.receita)}. Recomendo revisar os gastos com ${topCat[0]} para equilibrar suas financas. `;
      }
    }

    if (catEntries.length > 1) {
      analysis += `Seus tres maiores gastos sao: ${catEntries.slice(0, 3).map(([c, v]) => `${c} (R$ ${formatCurrency(v)})`).join(', ')}. `;
    }

    analysis += 'Considere definir metas por categoria para controlar melhor seus gastos mensais.';
  } else {
    analysis = 'Adicione transacoes para receber uma analise personalizada dos seus gastos.';
  }

  // Typing effect
  let i = 0;
  textEl.innerHTML = '<span class="typing-cursor"></span>';

  const interval = setInterval(() => {
    if (i < analysis.length) {
      textEl.innerHTML = analysis.substring(0, i + 1) + '<span class="typing-cursor"></span>';
      i++;
    } else {
      clearInterval(interval);
      textEl.textContent = analysis;
      state.aiUsed = true;
      if (limitEl) limitEl.style.display = 'block';
    }
  }, 18);
}

// ========================================
// SIDEBAR COMPONENT
// ========================================
function renderSidebar(active) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', hash: '#/dashboard' },
    { id: 'transacoes', label: 'Transacoes', icon: 'list', hash: '#/transacoes' },
    { id: 'upload', label: 'Upload', icon: 'upload', hash: '#/test-drive' },
    { id: 'insights', label: 'Insights IA', icon: 'sparkles', hash: null, plus: true },
    { id: 'planejamento', label: 'Planejamento', icon: 'calendar', hash: null, plus: true },
    { id: 'configuracoes', label: 'Configuracoes', icon: 'settings', hash: '#/configuracoes' },
  ];

  return `
    <aside class="sidebar" data-testid="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo-icon">CT</div>
        <span class="sidebar-logo-text">Cash Tracking</span>
      </div>
      <nav class="sidebar-nav">
        ${menuItems.map(item => `
          <button class="sidebar-menu-item ${active === item.id ? 'active' : ''}"
            data-testid="sidebar-menu-${item.id}"
            ${item.hash ? `onclick="navigate('${item.hash}')"` : 'disabled'}
          >
            <i data-lucide="${item.icon}" class="menu-icon-svg"></i>
            <span class="menu-item-label">${item.label}</span>
            ${item.plus ? '<span class="badge-plus">PLUS</span>' : ''}
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-upgrade" data-testid="sidebar-upgrade-cta">
        <h4>Cash Tracking Plus</h4>
        <p>IA ilimitada, planejamento e relatorios avancados.</p>
        <button class="btn-upgrade">R$ 15/mes</button>
      </div>
    </aside>
  `;
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  if (sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
    const overlay = document.querySelector('.mobile-overlay');
    if (overlay) overlay.remove();
  } else {
    sidebar.classList.add('mobile-open');
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.addEventListener('click', () => toggleMobileSidebar());
    document.body.appendChild(overlay);
  }
}

// ========================================
// SCREEN: CONFIGURACOES
// ========================================
function renderConfiguracoes() {
  const user = getUser();
  const isTest = state.isTestDrive || !isLoggedIn();

  APP.innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('configuracoes')}
      <div class="dashboard-main">
        <div class="mobile-header">
          <button class="hamburger-btn" onclick="toggleMobileSidebar()"><i data-lucide="menu" style="width:18px;height:18px"></i></button>
          <h2>Configuracoes</h2>
        </div>

        <h1 data-testid="settings-title">Configuracoes</h1>

        <div data-testid="settings-profile" class="settings-section" style="margin-top:24px">
          <h3>Perfil</h3>
          <div class="settings-row">
            <label>Nome</label>
            <input type="text" value="${user?.nome || ''}" ${isLoggedIn() ? '' : 'disabled'} placeholder="Seu nome">
          </div>
          <div class="settings-row">
            <label>E-mail</label>
            <input type="email" value="${user?.email || ''}" disabled placeholder="seu@email.com">
          </div>
        </div>

        <div data-testid="settings-preferences" class="settings-section">
          <h3>Preferencias</h3>
          <div class="settings-row">
            <label>Tema</label>
            <select disabled>
              <option>Dark</option>
            </select>
          </div>
          <div class="settings-row">
            <label>Moeda</label>
            <select disabled>
              <option>BRL (R$)</option>
            </select>
          </div>
        </div>

        ${isTest ? `
        <div class="cta-card" style="text-align:left;margin-top:24px">
          <p>Crie uma conta para salvar suas preferencias</p>
          <button class="btn-primary" style="max-width:200px" onclick="navigate('#/registro')">Criar conta</button>
        </div>
        ` : `
        <div class="settings-section">
          <h3>Conta</h3>
          <div class="settings-actions">
            <button class="btn-danger" data-testid="btn-logout">Sair</button>
            <button class="btn-outline-danger">Excluir conta</button>
          </div>
        </div>
        `}
      </div>
    </div>
  `;

  const logoutBtn = APP.querySelector('[data-testid="btn-logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      sessionStorage.clear();
      state = { transacoes: [], receita: 0, receitaSaved: false, manualEntries: [], aiUsed: false, isTestDrive: false };
      navigate('#/');
    });
  }
}

// ========================================
// SCREEN: UPLOAD (post-login)
// ========================================
function renderUpload() {
  APP.innerHTML = `
    <div class="upload-page">
      <div class="upload-container">
        <button class="back-button" onclick="navigate('#/dashboard')">\u2190 Voltar ao Dashboard</button>
        <h2>Upload de Extrato</h2>
        <p class="subtitle" style="color:var(--text-muted);margin-bottom:24px">Importe seu extrato bancario para categorizar automaticamente</p>
        <div class="test-drive-card">
          <div class="upload-dropzone" data-testid="upload-dropzone">
            <div class="upload-dropzone-icon"><i data-lucide="upload" style="width:22px;height:22px"></i></div>
            <p>Arraste seu arquivo aqui</p>
            <span class="upload-hint">PDF, CSV, OFX ou TXT</span>
          </div>
          <input type="file" class="hidden-input" data-testid="upload-file-input" accept=".pdf,.csv,.txt,.ofx">
          <div class="upload-progress" data-testid="upload-progress">
            <div class="progress-bar"><div class="progress-fill"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const dropzone = APP.querySelector('[data-testid="upload-dropzone"]');
  const fileInput = APP.querySelector('[data-testid="upload-file-input"]');

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFileUpload(e.target.files[0]);
  });
}

// ========================================
// SCREEN: INPUT MANUAL (post-login)
// ========================================
function renderInputManual() {
  APP.innerHTML = `
    <div class="input-manual-page">
      <div class="input-manual-container">
        <button class="back-button" onclick="navigate('#/dashboard')">\u2190 Voltar ao Dashboard</button>
        <h2>Adicionar Transacao</h2>
        <p class="subtitle" style="color:var(--text-muted);margin-bottom:24px">Adicione transacoes manualmente</p>
        <div class="test-drive-card">
          <div class="manual-form">
            <div class="form-group">
              <label>Data</label>
              <input type="date" data-testid="manual-date">
            </div>
            <div class="form-group">
              <label>Descricao</label>
              <input type="text" data-testid="manual-description" placeholder="Ex: Supermercado">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Valor</label>
                <input type="number" data-testid="manual-value" placeholder="0,00" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select data-testid="manual-type">
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" data-testid="btn-add-manual">Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  APP.querySelector('[data-testid="btn-add-manual"]').addEventListener('click', async () => {
    const dateEl = APP.querySelector('[data-testid="manual-date"]');
    const descEl = APP.querySelector('[data-testid="manual-description"]');
    const valEl = APP.querySelector('[data-testid="manual-value"]');
    const typeEl = APP.querySelector('[data-testid="manual-type"]');

    const dateVal = dateEl.value;
    const desc = descEl.value.trim();
    const valor = parseFloat(valEl.value);
    const tipo = typeEl.value;

    if (!dateVal || !desc || !valor || isNaN(valor)) return;

    if (isLoggedIn()) {
      try {
        await apiFetch('/transacoes', {
          method: 'POST',
          body: JSON.stringify({ data: dateVal, descricao: desc, valor, tipo, categoria: categorize(desc) }),
        });
        navigate('#/transacoes');
      } catch (err) {
        // Fallback: add locally
        const parts = dateVal.split('-');
        state.transacoes.push({ data: `${parts[2]}/${parts[1]}/${parts[0]}`, descricao: desc, valor, tipo, categoria: categorize(desc) });
        sessionStorage.setItem('transacoes', JSON.stringify(state.transacoes));
        navigate('#/transacoes');
      }
    } else {
      const parts = dateVal.split('-');
      state.transacoes.push({ data: `${parts[2]}/${parts[1]}/${parts[0]}`, descricao: desc, valor, tipo, categoria: categorize(desc) });
      sessionStorage.setItem('transacoes', JSON.stringify(state.transacoes));
      navigate('#/transacoes');
    }
  });
}
