
// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const conteudoConta = document.getElementById("conteudo-conta");
const acessoNegado = document.getElementById("acesso-negado-conta");
const erroConta = document.getElementById("erro-conta");

const nomeSaudacao = document.getElementById("nome-saudacao");
const nomeUsuario = document.getElementById("nome-usuario");
const emailUsuario = document.getElementById("email-usuario");
const statusVerificacao = document.getElementById("status-verificacao");

const botaoTentarNovamente = document.getElementById("tentar-novamente");

// ========================================
// ELEMENTOS DA EXCLUSÃO
// ========================================

const botaoExcluirConta = document.getElementById("botao-excluir-conta");

const modalExclusao = document.getElementById("modal-exclusao");

const botaoCancelarExclusao = document.getElementById("cancelar-exclusao");
const botaoConfirmarExclusao = document.getElementById("confirmar-exclusao");

const erroExclusao = document.getElementById("erro-exclusao");

let excluindoConta = false;
let focoAnterior = null;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelas() {
    conteudoConta.hidden = true;
    acessoNegado.hidden = true;
    erroConta.hidden = true;
}

function mostrarAcessoNegado() {
    ocultarTelas();
    acessoNegado.hidden = false;
}

function mostrarErro() {
    ocultarTelas();
    erroConta.hidden = false;
}

// ========================================
// CARREGAR DADOS DO USUÁRIO
// ========================================

async function carregarMinhaConta() {
    ocultarTelas();

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegado();
        return;
    }

    try {
        const resposta = await fetch("/usuario/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (resposta.status === 401 || resposta.status === 403) {
            localStorage.removeItem("token");
            mostrarAcessoNegado();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados do usuário.");
        }

        const usuario = await resposta.json();

        // Nome e e-mail retornados pela API.
        nomeSaudacao.textContent = usuario.nome || "convidado";
        nomeUsuario.textContent = usuario.nome || "Não informado";
        emailUsuario.textContent = usuario.email || "Não informado";

        // Situação da verificação de e-mail.
        const verificado = usuario.emailVerificado === true;

        statusVerificacao.textContent = verificado
            ? "✓ Conta verificada"
            : "⏳ Verificação pendente";

        statusVerificacao.classList.toggle(
            "status-verificado",
            verificado
        );

        statusVerificacao.classList.toggle(
            "status-pendente",
            !verificado
        );

        conteudoConta.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar minha conta:", erro);
        mostrarErro();
    }
}

// ========================================
// TENTAR NOVAMENTE
// ========================================

botaoTentarNovamente.addEventListener(
    "click",
    carregarMinhaConta
);

// ========================================
// ABRIR MODAL DE EXCLUSÃO
// ========================================

function abrirModalExclusao() {
    focoAnterior = document.activeElement;

    erroExclusao.textContent = "";
    erroExclusao.hidden = true;

    modalExclusao.hidden = false;

    document.body.classList.add("modal-aberto");

    botaoCancelarExclusao.focus();
}

// ========================================
// FECHAR MODAL DE EXCLUSÃO
// ========================================

function fecharModalExclusao() {
    if (excluindoConta) {
        return;
    }

    modalExclusao.hidden = true;

    document.body.classList.remove("modal-aberto");

    focoAnterior?.focus();
}

// ========================================
// EVENTOS DO MODAL
// ========================================

botaoExcluirConta.addEventListener(
    "click",
    abrirModalExclusao
);

botaoCancelarExclusao.addEventListener(
    "click",
    fecharModalExclusao
);

// Clicar fora do modal fecha a janela.
modalExclusao.addEventListener("click", (evento) => {
    if (evento.target === modalExclusao) {
        fecharModalExclusao();
    }
});

// Escape fecha o modal.
// Tab mantém o foco dentro do modal.
document.addEventListener("keydown", (evento) => {
    if (modalExclusao.hidden) {
        return;
    }

    if (evento.key === "Escape") {
        evento.preventDefault();
        fecharModalExclusao();
        return;
    }

    if (evento.key === "Tab") {
        const primeiro = botaoCancelarExclusao;
        const ultimo = botaoConfirmarExclusao;

        if (
            evento.shiftKey &&
            document.activeElement === primeiro
        ) {
            evento.preventDefault();
            ultimo.focus();

        } else if (
            !evento.shiftKey &&
            document.activeElement === ultimo
        ) {
            evento.preventDefault();
            primeiro.focus();
        }
    }
});

// ========================================
// CONFIRMAR EXCLUSÃO DA CONTA
// ========================================

botaoConfirmarExclusao.addEventListener(
    "click",
    async () => {

        if (excluindoConta) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            fecharModalExclusao();
            mostrarAcessoNegado();
            return;
        }

        excluindoConta = true;

        erroExclusao.textContent = "";
        erroExclusao.hidden = true;

        botaoConfirmarExclusao.disabled = true;
        botaoCancelarExclusao.disabled = true;

        botaoConfirmarExclusao.textContent =
            "Excluindo conta...";

        try {
            const resposta = await fetch(
                "/usuario/excluir-conta",
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            // Token inválido ou expirado.
            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {
                localStorage.removeItem("token");

                modalExclusao.hidden = true;
                document.body.classList.remove("modal-aberto");

                mostrarAcessoNegado();
                return;
            }

            // Erro retornado pelo servidor.
            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível excluir a conta."
                );
            }

            // Exclusão confirmada pela API.
            localStorage.removeItem("token");

            sessionStorage.removeItem("emailCadastro");
            sessionStorage.removeItem("emailLogin");

            // Voltar para a página de login.
            window.location.replace("/index.html");

        } catch (erro) {
            console.error(
                "Erro ao excluir conta:",
                erro
            );

            erroExclusao.textContent =
                "Não conseguimos excluir sua conta. Tente novamente.";

            erroExclusao.hidden = false;

        } finally {
            excluindoConta = false;

            botaoConfirmarExclusao.disabled = false;
            botaoCancelarExclusao.disabled = false;

            botaoConfirmarExclusao.textContent =
                "Sim, excluir conta";
        }
    }
);

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarMinhaConta();
