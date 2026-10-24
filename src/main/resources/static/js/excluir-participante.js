const conteudoExcluir = document.getElementById("conteudo-excluir");
const acessoNegadoExcluir = document.getElementById("acesso-negado-excluir");
const erroExcluir = document.getElementById("erro-excluir");

const tituloAcessoNegado = document.getElementById("titulo-acesso-negado-excluir");
const textoAcessoNegado = document.getElementById("texto-acesso-negado-excluir");
const linkAcessoNegado = document.getElementById("link-acesso-negado-excluir");

const listaParticipantes = document.getElementById("lista-participantes-excluir");
const participantesVazio = document.getElementById("participantes-vazio-excluir");
const contadorParticipantes = document.getElementById("contador-participantes-excluir");

const botaoTentarNovamente = document.getElementById("tentar-novamente-excluir");

// MODAL
const modalExcluir = document.getElementById("modal-excluir");
const fundoModal = document.getElementById("fundo-modal-excluir");
const cancelarExclusao = document.getElementById("cancelar-exclusao");
const confirmarExclusao = document.getElementById("confirmar-exclusao");

const nomeConfirmacao = document.getElementById("nome-confirmacao-excluir");
const fantasiaConfirmacao = document.getElementById("fantasia-confirmacao-excluir");
const mensagemModal = document.getElementById("mensagem-modal-excluir");

let participanteSelecionado = null;
let excluindo = false;
let focoAnterior = null;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelasExcluir() {
    conteudoExcluir.hidden = true;
    acessoNegadoExcluir.hidden = true;
    erroExcluir.hidden = true;
}

function mostrarAcessoNegadoExcluir(semPermissao = false) {
    ocultarTelasExcluir();

    if (semPermissao) {
        tituloAcessoNegado.textContent = "Acesso restrito!";

        textoAcessoNegado.textContent =
            "Essa área é exclusiva dos administradores da festa.";

        linkAcessoNegado.href = "/principal.html";
        linkAcessoNegado.textContent = "Voltar para a festa →";
    } else {
        tituloAcessoNegado.textContent =
            "Você não está logado! KKKKK";

        textoAcessoNegado.textContent =
            "Faça login primeiro para acessar essa área da festa!";

        linkAcessoNegado.href = "/index.html";
        linkAcessoNegado.textContent = "Fazer login →";
    }

    acessoNegadoExcluir.hidden = false;
}

function mostrarErroExcluir() {
    ocultarTelasExcluir();
    erroExcluir.hidden = false;
}

// ========================================
// AUTENTICAÇÃO ADMIN
// ========================================

async function validarAdministrador(token) {
    const resposta = await fetch("/usuario/me", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
    });

    if (resposta.status === 401) {
        localStorage.removeItem("token");
        mostrarAcessoNegadoExcluir();
        return false;
    }

    if (resposta.status === 403) {
        mostrarAcessoNegadoExcluir(true);
        return false;
    }

    if (!resposta.ok) {
        throw new Error("Falha ao validar autenticação.");
    }

    const usuario = await resposta.json();

    if (usuario.permissao !== "ADMIN") {
        mostrarAcessoNegadoExcluir(true);
        return false;
    }

    return true;
}

// ========================================
// IMAGENS
// ========================================

function urlImagemValida(url) {
    try {
        const endereco = new URL(url);

        return endereco.protocol === "http:" ||
            endereco.protocol === "https:";
    } catch {
        return false;
    }
}

function criarFotoParticipante(participante) {
    const foto = document.createElement("div");
    foto.className = "foto-participante-excluir";
    foto.textContent = "🎭";

    const url = participante.url_imagem_fantasia;

    if (urlImagemValida(url)) {
        const imagem = document.createElement("img");

        imagem.src = url;
        imagem.alt = `Fantasia de ${participante.nome}`;
        imagem.loading = "lazy";
        imagem.referrerPolicy = "no-referrer";

        imagem.addEventListener("load", () => {
            foto.replaceChildren(imagem);
        });
    }

    return foto;
}

// ========================================
// MONTAR LISTA
// ========================================

function criarCardParticipante(participante) {
    const card = document.createElement("div");
    card.className = "participante-excluir";

    const foto = criarFotoParticipante(participante);

    const dados = document.createElement("div");
    dados.className = "dados-participante-excluir";

    const nome = document.createElement("strong");
    nome.textContent = participante.nome;

    const fantasia = document.createElement("small");
    fantasia.textContent = `Fantasia: ${participante.fantasia}`;

    dados.append(nome, fantasia);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir-item";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", () => {
        abrirModalExcluir(participante);
    });

    card.append(foto, dados, botaoExcluir);

    return card;
}

function exibirParticipantes(participantes) {
    listaParticipantes.replaceChildren();

    const quantidade = participantes.length;

    contadorParticipantes.textContent =
        `${quantidade} PARTICIPANTE${quantidade === 1 ? "" : "S"} CADASTRADO${quantidade === 1 ? "" : "S"}`;

    participantesVazio.hidden = quantidade > 0;

    participantes.forEach(participante => {
        listaParticipantes.appendChild(
            criarCardParticipante(participante)
        );
    });
}

// ========================================
// BUSCAR PARTICIPANTES
// ========================================

async function buscarParticipantes(token) {
    const resposta = await fetch("/participante", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
    });

    if (resposta.status === 401) {
        localStorage.removeItem("token");
        mostrarAcessoNegadoExcluir();
        return false;
    }

    if (resposta.status === 403) {
        mostrarAcessoNegadoExcluir(true);
        return false;
    }

    if (!resposta.ok) {
        throw new Error("Falha ao buscar participantes.");
    }

    const participantes = await resposta.json();

    if (!Array.isArray(participantes)) {
        throw new Error("Formato inesperado de participantes.");
    }

    exibirParticipantes(participantes);

    return true;
}

// ========================================
// CARREGAR PÁGINA
// ========================================

async function carregarPaginaExcluir() {
    ocultarTelasExcluir();

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegadoExcluir();
        return;
    }

    try {
        const administrador = await validarAdministrador(token);

        if (!administrador) {
            return;
        }

        const carregado = await buscarParticipantes(token);

        if (!carregado) {
            return;
        }

        conteudoExcluir.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar exclusão:", erro);
        mostrarErroExcluir();
    }
}

// ========================================
// MODAL DE CONFIRMAÇÃO
// ========================================

function abrirModalExcluir(participante) {
    participanteSelecionado = participante;
    focoAnterior = document.activeElement;

    nomeConfirmacao.textContent = participante.nome;
    fantasiaConfirmacao.textContent =
        `Fantasia: ${participante.fantasia}`;

    mensagemModal.hidden = true;
    mensagemModal.textContent = "";

    modalExcluir.hidden = false;
    document.body.classList.add("modal-aberto");

    cancelarExclusao.focus();
}

function fecharModalExcluir() {
    if (excluindo) {
        return;
    }

    modalExcluir.hidden = true;
    document.body.classList.remove("modal-aberto");

    participanteSelecionado = null;

    if (focoAnterior?.isConnected) {
        focoAnterior.focus();
    }
}

cancelarExclusao.addEventListener("click", fecharModalExcluir);
fundoModal.addEventListener("click", fecharModalExcluir);

document.addEventListener("keydown", evento => {
    if (modalExcluir.hidden) {
        return;
    }

    if (evento.key === "Escape") {
        fecharModalExcluir();
    }

    if (evento.key === "Tab") {
        const primeiro = cancelarExclusao;
        const ultimo = confirmarExclusao;

        if (evento.shiftKey && document.activeElement === primeiro) {
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
// EXCLUIR PARTICIPANTE
// ========================================

confirmarExclusao.addEventListener("click", async () => {
    if (!participanteSelecionado || excluindo) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        fecharModalExcluir();
        mostrarAcessoNegadoExcluir();
        return;
    }

    excluindo = true;
    confirmarExclusao.disabled = true;
    confirmarExclusao.textContent = "Excluindo participante...";

    mensagemModal.hidden = true;

    try {
        const resposta = await fetch(
            `/participante/admin/${participanteSelecionado.id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (resposta.status === 401) {
            localStorage.removeItem("token");

            excluindo = false;
            fecharModalExcluir();
            mostrarAcessoNegadoExcluir();
            return;
        }

        if (resposta.status === 403) {
            excluindo = false;
            fecharModalExcluir();
            mostrarAcessoNegadoExcluir(true);
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                `Erro ao excluir participante: HTTP ${resposta.status}`
            );
        }

        // Atualizar a lista após a exclusão.
        const atualizado = await buscarParticipantes(token);

        if (!atualizado) {
            excluindo = false;
            fecharModalExcluir();
            return;
        }

        excluindo = false;
        fecharModalExcluir();

    } catch (erro) {
        console.error("Erro ao excluir participante:", erro);

        mensagemModal.textContent =
            "Não foi possível excluir o participante. Tente novamente.";

        mensagemModal.hidden = false;

    } finally {
        excluindo = false;
        confirmarExclusao.disabled = false;
        confirmarExclusao.textContent =
            "Sim, excluir participante";
    }
});

// ========================================
// TENTAR NOVAMENTE
// ========================================

botaoTentarNovamente.addEventListener(
    "click",
    carregarPaginaExcluir
);

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarPaginaExcluir();