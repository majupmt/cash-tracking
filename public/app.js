// URL da API
const API_URL = 'http://localhost:3000';

// Dados temporários do wizard
let dadosTemporarios = {
    receitas: [],
    contas: [],
    dividas: []
};

// ========================================
// AUTENTICAÇÃO
// ========================================

// Função de CADASTRO
async function fazerCadastro() {
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;

    if (!nome || !email || !senha) {
        document.getElementById('erro-cadastro').textContent = 'Preencha todos os campos!';
        return;
    }

    if (senha.length < 6) {
        document.getElementById('erro-cadastro').textContent = 'Senha deve ter no mínimo 6 caracteres!';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await response.json();

        if (dados.error) {
            document.getElementById('erro-cadastro').textContent = dados.error;
            return;
        }

        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        // Usuário novo vai direto pro wizard
        mostrarTela('passo-1');

    } catch (error) {
        console.error('Erro no cadastro:', error);
        document.getElementById('erro-cadastro').textContent = 'Erro ao cadastrar. Tente novamente!';
    }
}

// Função de LOGIN
async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    if (!email || !senha) {
        document.getElementById('erro-login').textContent = 'Preencha todos os campos!';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const dados = await response.json();
        
        if (dados.error) {
            document.getElementById('erro-login').textContent = dados.error;
            return;
        }
        
        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));
        
        // Verifica se já tem dados cadastrados
        verificarSePrimeiroAcesso();
        
    } catch (error) {
        console.error('Erro no login:', error);
        document.getElementById('erro-login').textContent = 'Erro ao fazer login. Tente novamente!';
    }
}

// Função de LOGOUT
function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    dadosTemporarios = {
        receitas: [],
        contas: [],
        dividas: []
    };
    
    mostrarTela('tela-inicial');
}

// Função pra pegar o token salvo
function getToken() {
    return localStorage.getItem('token');
}

// Função pra verificar se o usuário está logado
function verificarAutenticacao() {
    const token = getToken();
    
    if (!token) {
        mostrarTela('tela-inicial');
        return false;
    }
    
    verificarSePrimeiroAcesso();
    return true;
}

// Verifica se é primeiro acesso (se tem dados cadastrados)
async function verificarSePrimeiroAcesso() {
    const token = getToken();
    
    try {
        const response = await fetch(`${API_URL}/receitas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const receitas = await response.json();
        
        if (receitas.length === 0) {
            // Não tem dados = vai pro wizard
            mostrarTela('passo-1');
        } else {
            // Já tem dados = vai pro dashboard
            await carregarDashboard();
            mostrarTela('dashboard');
        }
        
    } catch (error) {
        console.error('Erro ao verificar dados:', error);
        mostrarTela('tela-inicial');
    }
}

// Quando a página carregar, verifica se está logado
window.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
});

// ========================================
// NAVEGAÇÃO
// ========================================

function mostrarTela(idTela) {
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('active');
    });
    document.getElementById(idTela).classList.add('active');
}

// Navegar para tela de login
function mostrarLogin() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
    document.getElementById('erro-login').textContent = '';
    
    mostrarTela('tela-login');
}

// Navegar para tela de cadastro
function mostrarCadastro() {
    document.getElementById('cadastro-nome').value = '';
    document.getElementById('cadastro-email').value = '';
    document.getElementById('cadastro-senha').value = '';
    document.getElementById('erro-cadastro').textContent = '';
    
    mostrarTela('tela-cadastro');
}

// Voltar para tela inicial
function voltarParaInicial() {
    mostrarTela('tela-inicial');
}

function iniciarWizard() {
    mostrarTela('passo-1');
}

function proximoPasso(passo) {
    mostrarTela(`passo-${passo}`);
}

function voltarPasso(passo) {
    mostrarTela(`passo-${passo}`);
}

// ========================================
// WIZARD - PASSO 1: RECEITAS
// ========================================

function adicionarReceita() {
    const descricao = document.getElementById('descricao-receita').value;
    const valor = parseFloat(document.getElementById('valor-receita').value);

    if (!descricao || !valor) {
        alert('Preencha todos os campos!');
        return;
    }

    dadosTemporarios.receitas.push({ descricao, valor });
    
    document.getElementById('descricao-receita').value = '';
    document.getElementById('valor-receita').value = '';
    
    renderizarReceitas();
}

function renderizarReceitas() {
    const lista = document.getElementById('lista-receitas');
    lista.innerHTML = '';
    
    dadosTemporarios.receitas.forEach((receita, index) => {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.innerHTML = `
            <span>${receita.descricao}: R$ ${receita.valor.toFixed(2)}</span>
            <button onclick="removerReceita(${index})">✕</button>
        `;
        lista.appendChild(div);
    });
}

function removerReceita(index) {
    dadosTemporarios.receitas.splice(index, 1);
    renderizarReceitas();
}

// ========================================
// WIZARD - PASSO 2: CONTAS FIXAS
// ========================================

function adicionarConta() {
    const descricao = document.getElementById('descricao-conta').value;
    const valor = parseFloat(document.getElementById('valor-conta').value);
    const diaVencimento = parseInt(document.getElementById('dia-vencimento').value) || null;

    if (!descricao || !valor) {
        alert('Preencha pelo menos descrição e valor!');
        return;
    }

    dadosTemporarios.contas.push({ descricao, valor, dia_vencimento: diaVencimento });
    
    document.getElementById('descricao-conta').value = '';
    document.getElementById('valor-conta').value = '';
    document.getElementById('dia-vencimento').value = '';
    
    renderizarContas();
}

function renderizarContas() {
    const lista = document.getElementById('lista-contas');
    lista.innerHTML = '';
    
    dadosTemporarios.contas.forEach((conta, index) => {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.innerHTML = `
            <span>${conta.descricao}: R$ ${conta.valor.toFixed(2)} ${conta.dia_vencimento ? `(dia ${conta.dia_vencimento})` : ''}</span>
            <button onclick="removerConta(${index})">✕</button>
        `;
        lista.appendChild(div);
    });
}

function removerConta(index) {
    dadosTemporarios.contas.splice(index, 1);
    renderizarContas();
}

// ========================================
// WIZARD - PASSO 3: DÍVIDAS
// ========================================

function adicionarDivida() {
    const descricao = document.getElementById('descricao-divida').value;
    const valorTotal = parseFloat(document.getElementById('valor-total-divida').value);
    const valorParcela = parseFloat(document.getElementById('valor-parcela-divida').value);
    const parcelasTotal = parseInt(document.getElementById('parcelas-total').value);
    const parcelasPagas = parseInt(document.getElementById('parcelas-pagas').value) || 0;

    if (!descricao || !valorTotal || !valorParcela || !parcelasTotal) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    dadosTemporarios.dividas.push({
        descricao,
        valor_total: valorTotal,
        valor_parcela: valorParcela,
        parcelas_total: parcelasTotal,
        parcelas_pagas: parcelasPagas,
        data_inicio: new Date().toISOString().split('T')[0]
    });
    
    document.getElementById('descricao-divida').value = '';
    document.getElementById('valor-total-divida').value = '';
    document.getElementById('valor-parcela-divida').value = '';
    document.getElementById('parcelas-total').value = '';
    document.getElementById('parcelas-pagas').value = '0';
    
    renderizarDividas();
}

function renderizarDividas() {
    const lista = document.getElementById('lista-dividas');
    lista.innerHTML = '';
    
    dadosTemporarios.dividas.forEach((divida, index) => {
        const parcelasRestantes = divida.parcelas_total - divida.parcelas_pagas;
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.innerHTML = `
            <div>
                <strong>${divida.descricao}</strong><br>
                <small>R$ ${divida.valor_parcela.toFixed(2)}/mês - Faltam ${parcelasRestantes} parcelas</small>
            </div>
            <button onclick="removerDivida(${index})">✕</button>
        `;
        lista.appendChild(div);
    });
}

function removerDivida(index) {
    dadosTemporarios.dividas.splice(index, 1);
    renderizarDividas();
}

// ========================================
// FINALIZAR WIZARD E SALVAR NA API
// ========================================

async function finalizarWizard() {
    const token = getToken();

    if (!token) {
        alert('Você não está logado!');
        fazerLogout();
        return;
    }

    try {
        // Salvar receitas
        for (const receita of dadosTemporarios.receitas) {
            await fetch(`${API_URL}/receitas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(receita)
            });
        }

        // Salvar contas
        for (const conta of dadosTemporarios.contas) {
            await fetch(`${API_URL}/contas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(conta)
            });
        }

        // Salvar dívidas
        for (const divida of dadosTemporarios.dividas) {
            await fetch(`${API_URL}/dividas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(divida)
            });
        }

        // Carregar dashboard
        await carregarDashboard();
        mostrarTela('dashboard');

    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados. Verifique se a API está rodando!');
    }
}

// ========================================
// DASHBOARD
// ========================================

async function carregarDashboard() {
    const token = getToken();

    if (!token) {
        alert('Você não está logado!');
        fazerLogout();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/dashboard/resumo`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const dados = await response.json();

        // Atualizar cards
        document.getElementById('total-receitas').textContent = `R$ ${dados.receitas.toFixed(2)}`;
        document.getElementById('total-contas').textContent = `R$ ${dados.contas_fixas.toFixed(2)}`;
        document.getElementById('total-dividas').textContent = `R$ ${dados.dividas_mes_atual.toFixed(2)}`;
        document.getElementById('total-disponivel').textContent = `R$ ${dados.disponivel.toFixed(2)}`;

        // Renderizar detalhes das dívidas
        const detalhesDividas = document.getElementById('detalhes-dividas');
        detalhesDividas.innerHTML = '';

        if (dados.dividas_detalhes.length === 0) {
            detalhesDividas.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma dívida cadastrada 🎉</p>';
        } else {
            dados.dividas_detalhes.forEach(divida => {
                const div = document.createElement('div');
                div.className = 'divida-item';
                div.innerHTML = `
                    <strong>${divida.descricao}</strong><br>
                    <span>Parcela: R$ ${Number(divida.valor_parcela).toFixed(2)}</span><br>
                    <span>Restam ${divida.parcelas_restantes} de ${divida.parcelas_total} parcelas</span><br>
                    <span>Total restante: R$ ${Number(divida.valor_restante).toFixed(2)}</span>
                `;
                detalhesDividas.appendChild(div);
            });
        }

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dashboard!');
    }
}

// Resetar tudo
function resetar() {
    if (confirm('Tem certeza que quer sair? Seus dados estão salvos.')) {
        fazerLogout();
    }
}

// Mostrar tela de escolha
function mostrarEscolha() {
    mostrarTela('tela-escolha');
}

// Iniciar test-drive (wizard sem salvar)
function iniciarTestDrive() {
    // Vai direto pro wizard sem autenticação
    mostrarTela('passo-1');
}

// Exporta as novas funções
window.mostrarEscolha = mostrarEscolha;
window.iniciarTestDrive = iniciarTestDrive;

// Expor funções globalmente para uso em onclick handlers
window.iniciarWizard = iniciarWizard;
window.proximoPasso = proximoPasso;
window.voltarPasso = voltarPasso;
window.adicionarReceita = adicionarReceita;
window.removerReceita = removerReceita;
window.adicionarConta = adicionarConta;
window.removerConta = removerConta;
window.adicionarDivida = adicionarDivida;
window.removerDivida = removerDivida;
window.finalizarWizard = finalizarWizard;
window.resetar = resetar;
window.mostrarLogin = mostrarLogin;
window.mostrarCadastro = mostrarCadastro;
window.fazerLogin = fazerLogin;
window.fazerCadastro = fazerCadastro;
window.voltarParaInicial = voltarParaInicial;