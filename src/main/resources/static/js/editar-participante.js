
const conteudoEditar = document.getElementById("conteudo-editar");
const acessoNegadoEditar = document.getElementById("acesso-negado-editar");
const erroEditar = document.getElementById("erro-editar");

const tituloAcessoNegado = document.getElementById("titulo-acesso-negado");
const textoAcessoNegado = document.getElementById("texto-acesso-negado");
const linkAcessoNegado = document.getElementById("link-acesso-negado");

const listaParticipantes = document.getElementById("lista-participantes-editar");
const participantesVazio = document.getElementById("participantes-vazio");
const contadorParticipantes = document.getElementById("contador-participantes");

const botaoTentarNovamente = document.getElementById("tentar-novamente-editar");

// Modal
const modalEditar = document.getElementById("modal-editar");
const fundoModalEditar = document.getElementById("fundo-modal-editar");
const fecharModalEditar = document.getElementById("fechar-modal-editar");
const cancelarEdicao = document.getElementById("cancelar-edicao");

const formEditar = document.getElementById("form-editar-participante");
const campoNome = document.getElementById("editar-nome");
const campoFantasia = document.getElementById("editar-fantasia");
const campoImagem = document.getElementById("editar-imagem");

const previewImagem = document.getElementById("preview-imagem-editar");
const imagemPreview = document.getElementById("imagem-preview-editar");

const mensagemEditar = document.getElementById("mensagem-editar");
const botaoSalvar = document.getElementById("salvar-edicao");

let participanteSelecionado = null;
let salvandoEdicao = false;
let elementoAnteriorFoco = null;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelasEditar() {
    conteudoEditar.hidden = true;
    acessoNegadoEditar.hidden = true;
    erroEditar.hidden = true;
}

function mostrarAcessoNegadoEditar(semPermissao = false) {
    ocultarTelasEditar();

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

    acessoNegadoEditar.hidden = false;
}

function mostrarErroEditar() {
    ocultarTelasEditar();
    erroEditar.hidden = false;
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
        mostrarAcessoNegadoEditar();
        return false;
    }

    if (resposta.status === 403) {
        mostrarAcessoNegadoEditar(true);
        return false;
    }

    if (!resposta.ok) {
        throw new Error("Falha ao validar autenticação.");
    }

    const usuario = await resposta.json();

    if (usuario.permissao !== "ADMIN") {
        mostrarAcessoNegadoEditar(true);
        return false;
    }

    return true;
}

// ========================================
// IMAGENS
// ========================================

function obterUrlImagem(participante) {
    return participante.url_imagem_fantasia || "";
}

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
    foto.className = "foto-participante-editar";
    foto.textContent = "🎭";

    const url = obterUrlImagem(participante);

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

function atualizarPreviewImagem() {
    const url = campoImagem.value.trim();

    previewImagem.hidden = true;
    imagemPreview.removeAttribute("src");

    if (!urlImagemValida(url)) {
        return;
    }

    imagemPreview.onload = () => {
        previewImagem.hidden = false;
    };

    imagemPreview.onerror = () => {
        previewImagem.hidden = true;
    };

    imagemPreview.src = url;
}

// ========================================
// MONTAR PARTICIPANTES
// ========================================

function criarCardParticipante(participante) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "participante-editar";

    const foto = criarFotoParticipante(participante);

    const dados = document.createElement("div");
    dados.className = "dados-participante-editar";

    const nome = document.createElement("strong");
    nome.textContent = participante.nome;

    const fantasia = document.createElement("small");
    fantasia.textContent = `Fantasia: ${participante.fantasia}`;

    dados.append(nome, fantasia);

    const seta = document.createElement("span");
    seta.className = "seta-participante-editar";
    seta.textContent = "✎";
    seta.setAttribute("aria-hidden", "true");

    card.append(foto, dados, seta);

    card.addEventListener("click", () => {
        abrirModalEditar(participante);
    });

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
        mostrarAcessoNegadoEditar();
        return false;
    }

    if (resposta.status === 403) {
        mostrarAcessoNegadoEditar(true);
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

async function carregarPaginaEditar() {
    ocultarTelasEditar();

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegadoEditar();
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

        conteudoEditar.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar edição:", erro);
        mostrarErroEditar();
    }
}

// ========================================
// MODAL
// ========================================

function abrirModalEditar(participante) {
    participanteSelecionado = participante;
    elementoAnteriorFoco = document.activeElement;

    campoNome.value = participante.nome || "";
    campoFantasia.value = participante.fantasia || "";
    campoImagem.value = obterUrlImagem(participante);

    mensagemEditar.hidden = true;
    mensagemEditar.textContent = "";
    mensagemEditar.className = "mensagem-editar";

    atualizarPreviewImagem();

    modalEditar.hidden = false;
    document.body.classList.add("modal-aberto");

    campoNome.focus();
}

function fecharModal() {
    if (salvandoEdicao) {
        return;
    }

    modalEditar.hidden = true;
    document.body.classList.remove("modal-aberto");

    participanteSelecionado = null;

    if (elementoAnteriorFoco?.isConnected) {
        elementoAnteriorFoco.focus();
    }
}

function mostrarMensagemEdicao(texto, tipo = "erro") {
    mensagemEditar.textContent = texto;
    mensagemEditar.className = `mensagem-editar ${tipo}`;
    mensagemEditar.hidden = false;
}

fecharModalEditar.addEventListener("click", fecharModal);
cancelarEdicao.addEventListener("click", fecharModal);
fundoModalEditar.addEventListener("click", fecharModal);

document.addEventListener("keydown", evento => {
    if (modalEditar.hidden) {
        return;
    }

    if (evento.key === "Escape") {
        fecharModal();
    }

    // Mantém a navegação por Tab dentro do modal.
    if (evento.key === "Tab") {
        const controles = [
            fecharModalEditar,
            campoNome,
            campoFantasia,
            campoImagem,
            botaoSalvar,
            cancelarEdicao
        ].filter(elemento => !elemento.disabled);

        const primeiro = controles[0];
        const ultimo = controles[controles.length - 1];

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

campoImagem.addEventListener("change", atualizarPreviewImagem);

// ========================================
// SALVAR EDIÇÃO
// ========================================

formEditar.addEventListener("submit", async evento => {
    evento.preventDefault();

    if (!participanteSelecionado || salvandoEdicao) {
        return;
    }

    const nome = campoNome.value.trim();
    const fantasia = campoFantasia.value.trim();
    const urlImagem = campoImagem.value.trim();

    mensagemEditar.hidden = true;

    if (!nome || !fantasia || !urlImagem) {
        mostrarMensagemEdicao(
            "Preencha todos os campos antes de salvar."
        );
        return;
    }

    if (!urlImagemValida(urlImagem)) {
        mostrarMensagemEdicao(
            "Informe uma URL válida começando com http:// ou https://."
        );
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        fecharModal();
        mostrarAcessoNegadoEditar();
        return;
    }

    salvandoEdicao = true;
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando alterações...";

    try {
        const resposta = await fetch(
            `/participante/admin/${participanteSelecionado.id}`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome,
                    fantasia: fantasia,
                    url_imagem_fantasia: urlImagem
                })
            }
        );

        if (resposta.status === 401) {
            localStorage.removeItem("token");

            salvandoEdicao = false;
            fecharModal();
            mostrarAcessoNegadoEditar();
            return;
        }

        if (resposta.status === 403) {
            salvandoEdicao = false;
            fecharModal();
            mostrarAcessoNegadoEditar(true);
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                `Erro ao salvar participante: HTTP ${resposta.status}`
            );
        }

        // Busca novamente os dados atualizados.
        const atualizado = await buscarParticipantes(token);

        if (!atualizado) {
            salvandoEdicao = false;
            fecharModal();
            return;
        }

        salvandoEdicao = false;
        fecharModal();

    } catch (erro) {
        console.error("Erro ao editar participante:", erro);

        mostrarMensagemEdicao(
            "Não foi possível concluir a operação. Confira os dados e tente novamente."
        );

    } finally {
        salvandoEdicao = false;
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar alterações →";
    }
});

// ========================================
// TENTAR NOVAMENTE
// ========================================

botaoTentarNovamente.addEventListener(
    "click",
    carregarPaginaEditar
);

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarPaginaEditar();
