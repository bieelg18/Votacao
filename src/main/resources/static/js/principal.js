
const paginaPrincipal = document.getElementById("pagina-principal");
const paginaAcessoNegado = document.getElementById("pagina-acesso-negado");

const botaoMenu = document.getElementById("abrir-menu");
const menuOpcoes = document.getElementById("menu-opcoes");
const botaoSair = document.getElementById("sair");

// NOVO: opção administrativa
const opcaoAdmin = document.getElementById("opcao-admin");

// ========================================
// CONTROLE DE VISIBILIDADE
// ========================================

function mostrarPaginaPrincipal() {
    paginaAcessoNegado.hidden = true;
    paginaPrincipal.hidden = false;
}

function mostrarAcessoNegado() {
    paginaPrincipal.hidden = true;
    paginaAcessoNegado.hidden = false;

    // Nunca manter a opção administrativa visível
    opcaoAdmin.hidden = true;

    fecharMenu();
}

// ========================================
// VERIFICAR PERMISSÃO ADMIN
// ========================================

function verificarPermissaoAdmin(usuario) {

    // A permissão vem diretamente do backend.
    const ehAdmin = usuario.permissao === "ADMIN";

    // Apenas administradores visualizam a opção.
    opcaoAdmin.hidden = !ehAdmin;
}

// ========================================
// VERIFICAR AUTENTICAÇÃO
// ========================================

async function verificarAutenticacao() {

    const token = localStorage.getItem("token");

    // Ocultar opção ADMIN durante a validação
    opcaoAdmin.hidden = true;

    // Usuário sem token
    if (!token) {
        mostrarAcessoNegado();
        return;
    }

    try {

        const resposta = await fetch("/usuario/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
        });

        // Token inválido ou expirado
        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {
            localStorage.removeItem("token");
            mostrarAcessoNegado();
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                "Erro ao verificar autenticação"
            );
        }

        const usuario = await resposta.json();

        // NOVO: verificar se o usuário é ADMIN
        verificarPermissaoAdmin(usuario);

        // Exibir página após autenticação
        mostrarPaginaPrincipal();

    } catch (erro) {

        console.error(
            "Erro ao verificar autenticação:",
            erro
        );

        // Não exibir conteúdo protegido
        mostrarAcessoNegado();
    }
}

// ========================================
// MENU HAMBÚRGUER
// ========================================

function fecharMenu() {

    menuOpcoes.hidden = true;

    botaoMenu.setAttribute(
        "aria-expanded",
        "false"
    );

    botaoMenu.setAttribute(
        "aria-label",
        "Abrir menu"
    );
}

function alternarMenu() {

    const menuAberto =
        botaoMenu.getAttribute("aria-expanded") === "true";

    menuOpcoes.hidden = menuAberto;

    botaoMenu.setAttribute(
        "aria-expanded",
        String(!menuAberto)
    );

    botaoMenu.setAttribute(
        "aria-label",
        menuAberto ? "Abrir menu" : "Fechar menu"
    );
}

botaoMenu.addEventListener("click", (evento) => {

    evento.stopPropagation();

    alternarMenu();
});

// Fechar ao clicar fora do menu
document.addEventListener("click", (evento) => {

    if (
        !menuOpcoes.hidden &&
        !menuOpcoes.contains(evento.target) &&
        !botaoMenu.contains(evento.target)
    ) {
        fecharMenu();
    }
});

// Fechar com ESC
document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {
        fecharMenu();
    }
});

// ========================================
// SAIR DA CONTA
// ========================================

botaoSair.addEventListener("click", () => {

    // Remover JWT
    localStorage.removeItem("token");

    // Ocultar opção ADMIN
    opcaoAdmin.hidden = true;

    // Fechar menu
    fecharMenu();

    // Voltar ao login
    window.location.replace("/index.html");
});

// ========================================
// INICIALIZAÇÃO
// ========================================

verificarAutenticacao();
