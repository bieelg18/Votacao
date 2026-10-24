
const conteudoUsuarios = document.getElementById("conteudo-usuarios");
const acessoNegado = document.getElementById("acesso-negado-usuarios");
const semPermissao = document.getElementById("sem-permissao-usuarios");
const erroUsuarios = document.getElementById("erro-usuarios");

const listaUsuarios = document.getElementById("lista-usuarios");
const usuariosVazio = document.getElementById("usuarios-vazio");
const totalUsuarios = document.getElementById("total-usuarios");
const mensagemLista = document.getElementById("mensagem-lista");

const botaoAtualizar = document.getElementById("atualizar-usuarios");
const botaoTentarNovamente = document.getElementById(
    "tentar-novamente-usuarios"
);

const modalPermissao = document.getElementById("modal-permissao");
const nomeModalPermissao = document.getElementById("nome-modal-permissao");
const seletorPermissao = document.getElementById("seletor-permissao");
const botaoSalvarPermissao = document.getElementById("salvar-permissao");
const botaoCancelarPermissao = document.getElementById("cancelar-permissao");
const erroModalPermissao = document.getElementById("erro-modal-permissao");

const modalExclusao = document.getElementById("modal-exclusao");
const nomeModalExclusao = document.getElementById("nome-modal-exclusao");
const botaoConfirmarExclusao = document.getElementById("confirmar-exclusao");
const botaoCancelarExclusao = document.getElementById("cancelar-exclusao");
const erroModalExclusao = document.getElementById("erro-modal-exclusao");

let usuarioSelecionado = null;
let usuarioLogado = null;
let operacaoEmAndamento = false;

// ========================================
// CONTROLE DE TELAS
// ========================================

function ocultarTelas() {
    conteudoUsuarios.hidden = true;
    acessoNegado.hidden = true;
    semPermissao.hidden = true;
    erroUsuarios.hidden = true;
}

function mostrarAcessoNegado() {
    ocultarTelas();
    acessoNegado.hidden = false;
}

function mostrarSemPermissao() {
    ocultarTelas();
    semPermissao.hidden = false;
}

function mostrarErro() {
    ocultarTelas();
    erroUsuarios.hidden = false;
}

function mostrarMensagem(texto, erro = false) {
    mensagemLista.textContent = texto;
    mensagemLista.classList.toggle("erro", erro);
    mensagemLista.hidden = false;
}

// ========================================
// AUTENTICAÇÃO
// ========================================

function obterToken() {
    return localStorage.getItem("token");
}

function tratarSessaoExpirada() {
    localStorage.removeItem("token");
    fecharTodosModais(true);
    mostrarAcessoNegado();
}

async function verificarAdmin() {
    const token = obterToken();

    if (!token) {
        mostrarAcessoNegado();
        return false;
    }

    const resposta = await fetch("/usuario/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
        cache: "no-store"
    });

    if (resposta.status === 401 || resposta.status === 403) {
        tratarSessaoExpirada();
        return false;
    }

    if (!resposta.ok) {
        throw new Error("Erro ao validar autenticação.");
    }

    const usuario = await resposta.json();

    if (usuario.permissao !== "ADMIN") {
        mostrarSemPermissao();
        return false;
    }

    usuarioLogado = usuario;
    return true;
}

// ========================================
// REQUISIÇÕES
// ========================================

async function requisicaoAdmin(url, opcoes = {}) {
    const token = obterToken();

    if (!token) {
        tratarSessaoExpirada();
        throw new Error("Sessão expirada.");
    }

    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
            Authorization: `Bearer ${token}`,
            ...opcoes.headers
        },
        cache: "no-store"
    });

    if (resposta.status === 401) {
        tratarSessaoExpirada();
        throw new Error("Sessão expirada.");
    }

    if (resposta.status === 403) {
        fecharTodosModais(true);
        mostrarSemPermissao();
        throw new Error("Acesso não autorizado.");
    }

    return resposta;
}

async function obterMensagemErro(resposta, mensagemPadrao) {
    const tipo = resposta.headers.get("content-type") || "";

    if (tipo.includes("application/json")) {
        try {
            const dados = await resposta.json();

            if (typeof dados.message === "string") {
                return dados.message;
            }

            if (typeof dados.mensagem === "string") {
                return dados.mensagem;
            }
        } catch (_) {
            // Mantém mensagem padrão.
        }
    }

    return mensagemPadrao;
}

// ========================================
// CRIAR CARD DE USUÁRIO
// ========================================

function criarCardUsuario(usuario) {
    const item = document.createElement("article");
    item.className = "item-usuario";

    const cabecalho = document.createElement("div");
    cabecalho.className = "usuario-cabecalho";

    const avatar = document.createElement("span");
    avatar.className = "usuario-avatar";
    avatar.textContent = usuario.permissao === "ADMIN" ? "🛡️" : "👤";

    const informacoes = document.createElement("div");
    informacoes.className = "usuario-informacoes";

    const nome = document.createElement("strong");
    nome.className = "usuario-nome";
    nome.textContent = usuario.nome || "Nome não informado";

    const email = document.createElement("span");
    email.className = "usuario-email";
    email.textContent = usuario.email || "E-mail não informado";

    informacoes.append(nome, email);
    cabecalho.append(avatar, informacoes);

    const metadados = document.createElement("div");
    metadados.className = "usuario-metadados";

    const id = document.createElement("span");
    id.className = "usuario-id";
    id.textContent = `ID #${usuario.id}`;

    const permissao = document.createElement("span");
    permissao.className = "usuario-permissao";

    const admin = usuario.permissao === "ADMIN";

    permissao.classList.add(admin ? "admin" : "comum");
    permissao.textContent = admin ? "🛡️ ADMIN" : "👤 USUARIO";

    metadados.append(id, permissao);

    const acoes = document.createElement("div");
    acoes.className = "usuario-acoes";

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "botao-editar-usuario";
    botaoEditar.textContent = "✏️ Editar permissão";
    botaoEditar.addEventListener("click", () => {
        abrirModalPermissao(usuario);
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir-usuario";
    botaoExcluir.textContent = "🗑️ Excluir";
    botaoExcluir.addEventListener("click", () => {
        abrirModalExclusao(usuario);
    });

    acoes.append(botaoEditar, botaoExcluir);

    item.append(cabecalho, metadados, acoes);

    return item;
}

// ========================================
// EXIBIR LISTA
// ========================================

function exibirUsuarios(usuarios) {
    listaUsuarios.replaceChildren();

    totalUsuarios.textContent =
        `${usuarios.length} ${usuarios.length === 1
            ? "USUÁRIO CADASTRADO"
            : "USUÁRIOS CADASTRADOS"}`;

    usuariosVazio.hidden = usuarios.length > 0;

    const fragmento = document.createDocumentFragment();

    usuarios.forEach(usuario => {
        fragmento.appendChild(criarCardUsuario(usuario));
    });

    listaUsuarios.appendChild(fragmento);
}

// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function carregarUsuarios(validarAutenticacao = true) {
    botaoAtualizar.disabled = true;
    mensagemLista.hidden = true;

    if (validarAutenticacao) {
        ocultarTelas();
    }

    try {
        if (validarAutenticacao) {
            const autorizado = await verificarAdmin();

            if (!autorizado) {
                return;
            }
        }

        const resposta = await requisicaoAdmin("/usuario/admin/all", {
            method: "GET"
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível listar os usuários.");
        }

        const usuarios = await resposta.json();

        if (!Array.isArray(usuarios)) {
            throw new Error("Formato de resposta inesperado.");
        }

        exibirUsuarios(usuarios);
        conteudoUsuarios.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);

        if (!acessoNegado.hidden || !semPermissao.hidden) {
            return;
        }

        if (validarAutenticacao) {
            mostrarErro();
        } else {
            mostrarMensagem(
                "Não foi possível atualizar a lista. Tente novamente.",
                true
            );
        }
    } finally {
        botaoAtualizar.disabled = false;
    }
}

// ========================================
// CONTROLE DOS MODAIS
// ========================================

function atualizarBloqueioRolagem() {
    const algumModalAberto =
        !modalPermissao.hidden || !modalExclusao.hidden;

    document.body.classList.toggle(
        "modal-aberto",
        algumModalAberto
    );
}

function fecharTodosModais(forcar = false) {
    if (operacaoEmAndamento && !forcar) {
        return;
    }

    modalPermissao.hidden = true;
    modalExclusao.hidden = true;
    usuarioSelecionado = null;

    atualizarBloqueioRolagem();
}

function abrirModalPermissao(usuario) {
    usuarioSelecionado = usuario;

    nomeModalPermissao.textContent = usuario.nome;
    seletorPermissao.value = usuario.permissao;
    erroModalPermissao.hidden = true;

    modalPermissao.hidden = false;
    atualizarBloqueioRolagem();

    seletorPermissao.focus();
}

function abrirModalExclusao(usuario) {
    usuarioSelecionado = usuario;

    nomeModalExclusao.textContent = usuario.nome;
    erroModalExclusao.hidden = true;

    modalExclusao.hidden = false;
    atualizarBloqueioRolagem();

    botaoCancelarExclusao.focus();
}

// ========================================
// ALTERAR PERMISSÃO
// ========================================

async function salvarPermissao() {
    if (!usuarioSelecionado || operacaoEmAndamento) {
        return;
    }

    const usuario = usuarioSelecionado;
    const novaPermissao = seletorPermissao.value;

    if (!["USUARIO", "ADMIN"].includes(novaPermissao)) {
        return;
    }

    if (novaPermissao === usuario.permissao) {
        fecharTodosModais();
        return;
    }

    operacaoEmAndamento = true;
    botaoSalvarPermissao.disabled = true;
    botaoCancelarPermissao.disabled = true;
    botaoSalvarPermissao.textContent = "Salvando...";
    erroModalPermissao.hidden = true;

    try {
        const resposta = await requisicaoAdmin(
            `/usuario/admin/alterar-permissao/${usuario.id}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    permissao: novaPermissao
                })
            }
        );

        if (!resposta.ok) {
            const mensagem = await obterMensagemErro(
                resposta,
                "Não foi possível alterar a permissão."
            );

            throw new Error(mensagem);
        }

        // Se o ADMIN alterar a própria permissão, a sessão
        // poderá deixar de ter autorização para esta página.
        const alterouPropriaConta =
            usuarioLogado &&
            usuarioLogado.email === usuario.email;

        operacaoEmAndamento = false;
        fecharTodosModais();

        if (alterouPropriaConta && novaPermissao !== "ADMIN") {
            await carregarUsuarios(true);
            return;
        }

        await carregarUsuarios(false);

        mostrarMensagem(
            `Permissão de ${usuario.nome} alterada para ${novaPermissao}!`
        );

    } catch (erro) {
        console.error("Erro ao alterar permissão:", erro);

        if (!modalPermissao.hidden) {
            erroModalPermissao.textContent = erro.message;
            erroModalPermissao.hidden = false;
        }
    } finally {
        operacaoEmAndamento = false;
        botaoSalvarPermissao.disabled = false;
        botaoCancelarPermissao.disabled = false;
        botaoSalvarPermissao.textContent = "Salvar alteração →";
    }
}

// ========================================
// EXCLUIR USUÁRIO
// ========================================

async function excluirUsuario() {
    if (!usuarioSelecionado || operacaoEmAndamento) {
        return;
    }

    const usuario = usuarioSelecionado;

    operacaoEmAndamento = true;
    botaoConfirmarExclusao.disabled = true;
    botaoCancelarExclusao.disabled = true;
    botaoConfirmarExclusao.textContent = "Excluindo...";
    erroModalExclusao.hidden = true;

    try {
        const resposta = await requisicaoAdmin(
            `/usuario/admin/deletar-usuario/${usuario.id}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {
            const mensagem = await obterMensagemErro(
                resposta,
                "Não foi possível excluir o usuário."
            );

            throw new Error(mensagem);
        }

        const excluiuPropriaConta =
            usuarioLogado &&
            usuarioLogado.email === usuario.email;

        operacaoEmAndamento = false;
        fecharTodosModais();

        if (excluiuPropriaConta) {
            localStorage.removeItem("token");
            window.location.replace("/index.html");
            return;
        }

        await carregarUsuarios(false);

        mostrarMensagem(
            `A conta de ${usuario.nome} foi excluída com sucesso!`
        );

    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);

        if (!modalExclusao.hidden) {
            erroModalExclusao.textContent = erro.message;
            erroModalExclusao.hidden = false;
        }
    } finally {
        operacaoEmAndamento = false;
        botaoConfirmarExclusao.disabled = false;
        botaoCancelarExclusao.disabled = false;
        botaoConfirmarExclusao.textContent = "Sim, excluir usuário";
    }
}

// ========================================
// EVENTOS
// ========================================

botaoAtualizar.addEventListener("click", () => {
    carregarUsuarios(false);
});

botaoTentarNovamente.addEventListener("click", () => {
    carregarUsuarios(true);
});

botaoSalvarPermissao.addEventListener("click", salvarPermissao);
botaoConfirmarExclusao.addEventListener("click", excluirUsuario);

botaoCancelarPermissao.addEventListener("click", () => {
    fecharTodosModais();
});

botaoCancelarExclusao.addEventListener("click", () => {
    fecharTodosModais();
});

// Fechar clicando fora do conteúdo do modal.
[modalPermissao, modalExclusao].forEach(modal => {
    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            fecharTodosModais();
        }
    });
});

// Fechar com ESC.
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharTodosModais();
    }
});

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarUsuarios();
