// URL da API
const API_URL = 'http://localhost:4000';

// Dados temporários
let dadosTemporarios = {
    receitas: [],
    contas: [],
    dividas: []
};

// ========================================
// NAVEGAÇÃO ENTRE TELAS
// ========================================

function mostrarTela(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('active'));
    document.getElementById(idTela)?.classList.add('active');
}

function mostrarEscolha() {
    mostrarTela('tela-escolha');
}

function mostrarCadastro() {
    mostrarTela('tela-cadastro');
}

function voltarParaInicial() {
    mostrarTela('tela-inicial');
    document.getElementById('erro-login').textContent = '';
    document.getElementById('erro-cadastro').textContent = '';
}

function iniciarTestDrive() {
    mostrarTela('passo-1');
}

// ========================================
// AUTENTICAÇÃO
// ========================================

async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const erroEl = document.getElementById('erro-login');

    if (!email || !senha) {
        erroEl.textContent = 'Preencha todos os campos!';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            mostrarDashboard();
        } else {
            erroEl.textContent = data.error || 'Erro ao fazer login';
        }
    } catch (error) {
        erroEl.textContent = 'Erro ao conectar com servidor';
        console.error(error);
    }
}

async function fazerCadastro() {
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    const erroEl = document.getElementById('erro-cadastro');

    if (!nome || !email || !senha) {
        erroEl.textContent = 'Preencha todos os campos!';
        return;
    }

    if (senha.length < 6) {
        erroEl.textContent = 'Senha deve ter no mínimo 6 caracteres!';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            mostrarTela('passo-1');
        } else {
            erroEl.textContent = data.error || 'Erro ao cadastrar';
        }
    } catch (error) {
        erroEl.textContent = 'Erro ao conectar com servidor';
        console.error(error);
    }
}

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    document.getElementById('dashboard-layout').style.display = 'none';
    document.getElementById('container-auth').style.display = 'flex';
    voltarParaInicial();
}

// ========================================
// WIZARD - RECEITAS
// ========================================

function adicionarReceita() {
    const descricao = document.getElementById('descricao-receita').value;
    const valor = parseFloat(document.getElementById('valor-receita').value);

    if (!descricao || !valor) {
        alert('Preencha todos os campos!');
        return;
    }

    dadosTemporarios.receitas.push({ descricao, valor });
    atualizarListaReceitas();
    
    document.getElementById('descricao-receita').value = '';
    document.getElementById('valor-receita').value = '';
}

function atualizarListaReceitas() {
    const lista = document.getElementById('lista-receitas');
    lista.innerHTML = dadosTemporarios.receitas.map((r, i) => `
        <div class="item-lista">
            <span>${r.descricao}: R$ ${r.valor.toFixed(2)}</span>
            <button onclick="removerReceita(${i})">Remover</button>
        </div>
    `).join('');
}

function removerReceita(index) {
    dadosTemporarios.receitas.splice(index, 1);
    atualizarListaReceitas();
}

// ========================================
// WIZARD - CONTAS
// ========================================

function adicionarConta() {
    const descricao = document.getElementById('descricao-conta').value;
    const valor = parseFloat(document.getElementById('valor-conta').value);
    const vencimento = parseInt(document.getElementById('dia-vencimento').value);

    if (!descricao || !valor || !vencimento) {
        alert('Preencha todos os campos!');
        return;
    }

    dadosTemporarios.contas.push({ descricao, valor, vencimento });
    atualizarListaContas();
    
    document.getElementById('descricao-conta').value = '';
    document.getElementById('valor-conta').value = '';
    document.getElementById('dia-vencimento').value = '';
}

function atualizarListaContas() {
    const lista = document.getElementById('lista-contas');
    lista.innerHTML = dadosTemporarios.contas.map((c, i) => `
        <div class="item-lista">
            <span>${c.descricao}: R$ ${c.valor.toFixed(2)} (Dia ${c.vencimento})</span>
            <button onclick="removerConta(${i})">Remover</button>
        </div>
    `).join('');
}

function removerConta(index) {
    dadosTemporarios.contas.splice(index, 1);
    atualizarListaContas();
}

// ========================================
// WIZARD - DÍVIDAS
// ========================================

function adicionarDivida() {
    const descricao = document.getElementById('descricao-divida').value;
    const valorParcela = parseFloat(document.getElementById('valor-parcela-divida').value);
    const parcelasTotal = parseInt(document.getElementById('parcelas-total').value);

    if (!descricao || !valorParcela || !parcelasTotal) {
        alert('Preencha todos os campos!');
        return;
    }

    dadosTemporarios.dividas.push({ descricao, valor_parcela: valorParcela, parcelas_totais: parcelasTotal, parcelas_pagas: 0 });
    atualizarListaDividas();
    
    document.getElementById('descricao-divida').value = '';
    document.getElementById('valor-parcela-divida').value = '';
    document.getElementById('parcelas-total').value = '';
}

function atualizarListaDividas() {
    const lista = document.getElementById('lista-dividas');
    lista.innerHTML = dadosTemporarios.dividas.map((d, i) => `
        <div class="item-lista">
            <span>${d.descricao}: ${d.parcelas_totais}x de R$ ${d.valor_parcela.toFixed(2)}</span>
            <button onclick="removerDivida(${i})">Remover</button>
        </div>
    `).join('');
}

function removerDivida(index) {
    dadosTemporarios.dividas.splice(index, 1);
    atualizarListaDividas();
}

// ========================================
// NAVEGAÇÃO WIZARD
// ========================================

function proximoPasso(passo) {
    mostrarTela(`passo-${passo}`);
}

function voltarPasso(passo) {
    mostrarTela(`passo-${passo}`);
}

async function finalizarWizard() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado!');
        return;
    }

    try {
        // Salvar receitas
        for (const r of dadosTemporarios.receitas) {
            await fetch(`${API_URL}/receitas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(r)
            });
        }

        // Salvar contas
        for (const c of dadosTemporarios.contas) {
            await fetch(`${API_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(c)
            });
        }

        // Salvar dívidas
        for (const d of dadosTemporarios.dividas) {
            await fetch(`${API_URL}/dividas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(d)
            });
        }

        mostrarDashboard();
    } catch (error) {
        alert('Erro ao salvar dados!');
        console.error(error);
    }
}

// ========================================
// DASHBOARD
// ========================================

function mostrarDashboard() {
    document.getElementById('container-auth').style.display = 'none';
    document.getElementById('dashboard-layout').style.display = 'flex';
    carregarDashboardData();
}

async function carregarDashboardData() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    document.getElementById('user-greeting').textContent = usuario.nome || 'Usuário';

    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/dashboard/data`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('mes-atual').textContent = data.mes_atual || 'Janeiro 2026';
            document.getElementById('valor-gasto').textContent = `R$ ${data.gasto_total?.toFixed(2) || '0,00'}`;
            document.getElementById('valor-receita-display').textContent = `R$ ${data.receita_mes?.toFixed(2) || '0,00'}`;
            document.getElementById('valor-sobra').textContent = `R$ ${data.sobra?.toFixed(2) || '0,00'}`;
            document.getElementById('input-receita-mes').value = data.receita_mes || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

async function salvarReceitaMes() {
    const valor = parseFloat(document.getElementById('input-receita-mes').value);
    const token = localStorage.getItem('token');

    if (!valor || !token) {
        alert('Digite um valor válido!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/dashboard/atualizar-receita-mes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ valor })
        });

        if (response.ok) {
            carregarDashboardData();
            alert('Receita atualizada!');
        }
    } catch (error) {
        alert('Erro ao salvar receita!');
        console.error(error);
    }
}

function navegarPara(secao) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${secao}`)?.classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    event.target.closest('.menu-item')?.classList.add('active');
}

async function enviarMensagemChat() {
    const input = document.getElementById('chat-input');
    const mensagem = input.value.trim();
    const token = localStorage.getItem('token');

    if (!mensagem) return;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `<div class="chat-message user">${mensagem}</div>`;
    input.value = '';

    try {
        const response = await fetch(`${API_URL}/dashboard/chat-ia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mensagem })
        });

        const data = await response.json();

        if (response.ok) {
            chatMessages.innerHTML += `<div class="chat-message assistant">${data.resposta}</div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        chatMessages.innerHTML += `<div class="chat-message assistant">Erro ao processar mensagem.</div>`;
        console.error(error);
    }
}

async function mostrarInsightOrganizacao() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/dashboard/insight-organizacao`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Insights:\n${data.insights.join('\n')}`);
        }
    } catch (error) {
        alert('Erro ao carregar insights!');
        console.error(error);
    }
}

// Verificar se já está logado ao carregar página
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        mostrarDashboard();
    }
});