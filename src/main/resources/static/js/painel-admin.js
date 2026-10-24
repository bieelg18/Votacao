
const conteudoAdmin = document.getElementById("conteudo-admin");

const acessoNegadoAdmin = document.getElementById(
    "acesso-negado-admin"
);

const semPermissaoAdmin = document.getElementById(
    "sem-permissao-admin"
);

const erroAdmin = document.getElementById("erro-admin");

const botaoTentarNovamenteAdmin = document.getElementById(
    "tentar-novamente-admin"
);

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelasAdmin() {
    conteudoAdmin.hidden = true;
    acessoNegadoAdmin.hidden = true;
    semPermissaoAdmin.hidden = true;
    erroAdmin.hidden = true;
}

function mostrarAcessoNegadoAdmin() {
    ocultarTelasAdmin();
    acessoNegadoAdmin.hidden = false;
}

function mostrarSemPermissaoAdmin() {
    ocultarTelasAdmin();
    semPermissaoAdmin.hidden = false;
}

function mostrarErroAdmin() {
    ocultarTelasAdmin();
    erroAdmin.hidden = false;
}

function mostrarPainelAdmin() {
    ocultarTelasAdmin();
    conteudoAdmin.hidden = false;
}

// ========================================
// VERIFICAR AUTENTICAÇÃO E PERMISSÃO
// ========================================

async function verificarAcessoAdmin() {

    ocultarTelasAdmin();

    const token = localStorage.getItem("token");

    // Sem token: não está autenticado
    if (!token) {
        mostrarAcessoNegadoAdmin();
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
            mostrarAcessoNegadoAdmin();
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                "Erro ao verificar autenticação."
            );
        }

        const usuario = await resposta.json();

        // Usuário autenticado, mas não é ADMIN
        if (usuario.permissao !== "ADMIN") {
            mostrarSemPermissaoAdmin();
            return;
        }

        // Usuário autenticado e ADMIN
        mostrarPainelAdmin();

    } catch (erro) {

        console.error(
            "Erro ao verificar acesso administrativo:",
            erro
        );

        mostrarErroAdmin();
    }
}

// ========================================
// TENTAR NOVAMENTE
// ========================================

botaoTentarNovamenteAdmin.addEventListener(
    "click",
    verificarAcessoAdmin
);

// ========================================
// INICIALIZAÇÃO
// ========================================

verificarAcessoAdmin();
