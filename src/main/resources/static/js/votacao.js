
const conteudoVotacao = document.getElementById("conteudo-votacao");
const acessoNegadoVotacao = document.getElementById("acesso-negado-votacao");
const erroVotacao = document.getElementById("erro-votacao");

const listaParticipantes = document.getElementById("lista-participantes");
const participantesVazio = document.getElementById("participantes-vazio");
const quantidadeParticipantes = document.getElementById("quantidade-participantes");

const botaoTentarNovamente = document.getElementById(
    "tentar-novamente-votacao"
);

// MODAL
const modal = document.getElementById("modal-votacao");
const modalConteudo = modal.querySelector(".modal-conteudo");

const modalIcone = document.getElementById("modal-icone");
const modalEtiqueta = document.getElementById("modal-etiqueta");
const modalTitulo = document.getElementById("modal-titulo");
const modalDescricao = document.getElementById("modal-descricao");
const modalErro = document.getElementById("modal-erro");

const botaoConfirmar = document.getElementById("modal-confirmar");
const botaoCancelar = document.getElementById("modal-cancelar");

let usuarioAtual = null;
let participanteSelecionado = null;
let enviandoVoto = false;
let acaoModal = null;
let elementoFocoAnterior = null;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelas() {
    conteudoVotacao.hidden = true;
    acessoNegadoVotacao.hidden = true;
    erroVotacao.hidden = true;
}

function mostrarAcessoNegado() {
    ocultarTelas();
    fecharModal();
    acessoNegadoVotacao.hidden = false;
}

function mostrarErro() {
    ocultarTelas();
    erroVotacao.hidden = false;
}

// ========================================
// CONTROLE DO MODAL
// ========================================

function abrirModal({
                        icone,
                        etiqueta,
                        titulo,
                        descricao,
                        textoConfirmar,
                        textoCancelar,
                        acao
                    }) {
    elementoFocoAnterior = document.activeElement;

    modalIcone.textContent = icone;
    modalEtiqueta.textContent = etiqueta;
    modalTitulo.textContent = titulo;

    // A descrição pode conter <strong> criado
    // apenas pelos templates definidos neste JS.
    modalDescricao.replaceChildren();

    if (typeof descricao === "string") {
        modalDescricao.textContent = descricao;
    } else {
        modalDescricao.appendChild(descricao);
    }

    modalErro.hidden = true;
    modalErro.textContent = "";

    botaoConfirmar.textContent = textoConfirmar;
    botaoCancelar.textContent = textoCancelar;

    acaoModal = acao;

    modal.hidden = false;
    document.body.classList.add("modal-aberto");

    botaoConfirmar.focus();
}

function fecharModal() {
    if (enviandoVoto) {
        return;
    }

    modal.hidden = true;
    document.body.classList.remove("modal-aberto");

    acaoModal = null;
    participanteSelecionado = null;

    if (
        elementoFocoAnterior &&
        elementoFocoAnterior.isConnected
    ) {
        elementoFocoAnterior.focus();
    }
}

function criarDescricaoComDestaque(inicio, destaque, fim) {
    const fragmento = document.createDocumentFragment();

    fragmento.appendChild(document.createTextNode(inicio));

    const strong = document.createElement("strong");
    strong.textContent = destaque;

    fragmento.appendChild(strong);
    fragmento.appendChild(document.createTextNode(fim));

    return fragmento;
}

function mostrarErroModal(mensagem) {
    modalErro.textContent = mensagem;
    modalErro.hidden = false;
}

// ========================================
// MODAL: CONFIRMAR VOTO
// ========================================

function confirmarEscolha(participante) {
    participanteSelecionado = participante;

    const descricao = document.createDocumentFragment();

    descricao.appendChild(
        document.createTextNode("Você está prestes a votar em ")
    );

    const nome = document.createElement("strong");
    nome.textContent = participante.nome;

    descricao.appendChild(nome);

    descricao.appendChild(
        document.createTextNode(
            `, com a fantasia "${participante.fantasia}". ` +
            "Confirma sua escolha?"
        )
    );

    abrirModal({
        icone: "🎃",
        etiqueta: "CONFIRME SUA ESCOLHA",
        titulo: "É essa mesmo?",
        descricao,
        textoConfirmar: "Sim, confirmar meu voto!",
        textoCancelar: "Não, quero escolher outra",
        acao: "votar"
    });
}

// ========================================
// MODAL: E-MAIL NÃO VERIFICADO
// ========================================

function mostrarEmailNaoVerificado() {
    abrirModal({
        icone: "📩",
        etiqueta: "FALTA SÓ UM PASSINHO",
        titulo: "Verifique seu e-mail!",
        descricao:
            "Antes de votar, você precisa confirmar " +
            "seu endereço de e-mail. Depois disso, " +
            "poderá participar da votação!",
        textoConfirmar: "Verificar meu e-mail →",
        textoCancelar: "Agora não",
        acao: "verificar-email"
    });
}

// ========================================
// MODAL: USUÁRIO JÁ VOTOU
// ========================================

function mostrarJaVotou() {
    abrirModal({
        icone: "👻",
        etiqueta: "OPA, JÁ TEMOS SEU VOTO!",
        titulo: "Espertinho de novo? KKKK",
        descricao:
            "Você já registrou seu voto! " +
            "Cada convidado pode votar apenas uma vez. " +
            "Agora é só acompanhar a disputa no ranking!",
        textoConfirmar: "Ver ranking →",
        textoCancelar: "Continuar por aqui",
        acao: "ranking"
    });
}

// ========================================
// MODAL: VOTO CONFIRMADO
// ========================================

function mostrarVotoConfirmado() {
    abrirModal({
        icone: "🎉",
        etiqueta: "VOTO REGISTRADO",
        titulo: "Seu voto foi confirmado!",
        descricao:
            "BOOOORA! Seu voto entrou na disputa! " +
            "Agora é só acompanhar quem está liderando " +
            "o Halloween do Waltão!",
        textoConfirmar: "Ver ranking →",
        textoCancelar: "Continuar por aqui",
        acao: "ranking"
    });
}

// ========================================
// IMAGENS DOS PARTICIPANTES
// ========================================

function criarImagemParticipante(participante) {
    const container = document.createElement("div");
    container.className = "imagem-participante";

    function mostrarImagemIndisponivel() {
        container.replaceChildren();

        const icone = document.createElement("span");
        icone.className = "imagem-indisponivel";
        icone.textContent = "👻";

        container.appendChild(icone);
    }

    const url = participante.url_imagem_fantasia;

    if (!url) {
        mostrarImagemIndisponivel();
        return container;
    }

    const imagem = document.createElement("img");

    imagem.src = url;
    imagem.alt = `Fantasia de ${participante.nome}: ${participante.fantasia}`;
    imagem.loading = "lazy";

    imagem.addEventListener("error", mostrarImagemIndisponivel, {
        once: true
    });

    container.appendChild(imagem);

    return container;
}

// ========================================
// CRIAR CARD DE PARTICIPANTE
// ========================================

function criarCardParticipante(participante) {
    const card = document.createElement("article");
    card.className = "card-participante";

    const imagem = criarImagemParticipante(participante);

    const corpo = document.createElement("div");
    corpo.className = "corpo-participante";

    const rotulo = document.createElement("p");
    rotulo.className = "rotulo-participante";
    rotulo.textContent = "🎭 PARTICIPANTE DA FESTA";

    const nome = document.createElement("h3");
    nome.className = "nome-participante-votacao";
    nome.textContent = participante.nome;

    const fantasia = document.createElement("p");
    fantasia.className = "fantasia-participante";

    const destaque = document.createElement("strong");
    destaque.textContent = participante.fantasia;

    fantasia.append(
        document.createTextNode("Fantasia: "),
        destaque
    );

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-votar";
    botao.textContent = "🗳️ Votar nesta fantasia →";

    botao.addEventListener("click", () => {
        if (usuarioAtual?.emailVerificado === false) {
            mostrarEmailNaoVerificado();
            return;
        }

        confirmarEscolha(participante);
    });

    corpo.append(rotulo, nome, fantasia, botao);
    card.append(imagem, corpo);

    return card;
}

// ========================================
// EXIBIR PARTICIPANTES
// ========================================

function exibirParticipantes(participantes) {
    listaParticipantes.replaceChildren();

    quantidadeParticipantes.textContent =
        `${participantes.length} ` +
        (participantes.length === 1
            ? "PARTICIPANTE CADASTRADO"
            : "PARTICIPANTES CADASTRADOS");

    participantesVazio.hidden = participantes.length > 0;

    const fragmento = document.createDocumentFragment();

    participantes.forEach(participante => {
        fragmento.appendChild(
            criarCardParticipante(participante)
        );
    });

    listaParticipantes.appendChild(fragmento);
}

// ========================================
// ENVIAR VOTO AO BACKEND
// ========================================

async function registrarVoto() {
    if (enviandoVoto || !participanteSelecionado) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegado();
        return;
    }

    const idParticipante = participanteSelecionado.id;

    enviandoVoto = true;
    botaoConfirmar.disabled = true;
    botaoCancelar.disabled = true;
    botaoConfirmar.textContent = "Registrando voto...";

    try {
        const resposta = await fetch("/votacao", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                participanteId: idParticipante
            })
        });

        if (resposta.status === 401) {
            localStorage.removeItem("token");

            enviandoVoto = false;
            mostrarAcessoNegado();
            return;
        }

        if (resposta.status === 409) {
            enviandoVoto = false;
            mostrarJaVotou();
            return;
        }

        if (resposta.status === 403) {
            // Confirmar a causa do 403 antes de
            // assumir que é e-mail não verificado.
            const respostaUsuario = await fetch("/usuario/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                cache: "no-store"
            });

            if (respostaUsuario.status === 401) {
                localStorage.removeItem("token");

                enviandoVoto = false;
                mostrarAcessoNegado();
                return;
            }

            if (respostaUsuario.ok) {
                usuarioAtual = await respostaUsuario.json();

                if (usuarioAtual.emailVerificado === false) {
                    enviandoVoto = false;
                    mostrarEmailNaoVerificado();
                    return;
                }
            }

            mostrarErroModal(
                "Você não tem permissão para registrar este voto."
            );

            return;
        }

        if (!resposta.ok) {
            mostrarErroModal(
                "Não foi possível registrar seu voto. " +
                "Tente novamente."
            );
            return;
        }

        enviandoVoto = false;
        mostrarVotoConfirmado();

    } catch (erro) {
        console.error("Erro ao registrar voto:", erro);

        mostrarErroModal(
            "Não foi possível conectar ao servidor. " +
            "Confira sua conexão antes de tentar novamente."
        );

    } finally {
        enviandoVoto = false;
        botaoConfirmar.disabled = false;
        botaoCancelar.disabled = false;

        if (acaoModal === "votar") {
            botaoConfirmar.textContent =
                "Sim, confirmar meu voto!";
        }
    }
}

// ========================================
// AÇÕES DO MODAL
// ========================================

botaoConfirmar.addEventListener("click", () => {
    if (acaoModal === "votar") {
        registrarVoto();
        return;
    }

    if (acaoModal === "verificar-email") {
        if (usuarioAtual?.email) {
            sessionStorage.setItem(
                "emailCadastro",
                usuarioAtual.email
            );
        }

        window.location.href = "/verificar-email.html";
        return;
    }

    if (acaoModal === "ranking") {
        window.location.href = "/ranking.html";
    }
});

botaoCancelar.addEventListener("click", fecharModal);

modal.querySelector(".modal-fundo").addEventListener(
    "click",
    fecharModal
);

document.addEventListener("keydown", (evento) => {
    if (modal.hidden) {
        return;
    }

    if (evento.key === "Escape") {
        fecharModal();
    }

    // Mantém o foco dentro do modal.
    if (evento.key === "Tab") {
        const botoes = [
            botaoConfirmar,
            botaoCancelar
        ].filter(botao => !botao.disabled);

        if (botoes.length === 0) {
            return;
        }

        const primeiro = botoes[0];
        const ultimo = botoes[botoes.length - 1];

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
// CARREGAR DADOS
// ========================================

async function carregarVotacao() {
    ocultarTelas();

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegado();
        return;
    }

    try {
        // Validar autenticação e consultar usuário.
        const respostaUsuario = await fetch("/usuario/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (
            respostaUsuario.status === 401 ||
            respostaUsuario.status === 403
        ) {
            localStorage.removeItem("token");
            mostrarAcessoNegado();
            return;
        }

        if (!respostaUsuario.ok) {
            throw new Error("Falha ao consultar usuário.");
        }

        usuarioAtual = await respostaUsuario.json();

        // Buscar participantes reais.
        const respostaParticipantes = await fetch("/participante", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (
            respostaParticipantes.status === 401 ||
            respostaParticipantes.status === 403
        ) {
            localStorage.removeItem("token");
            mostrarAcessoNegado();
            return;
        }

        if (!respostaParticipantes.ok) {
            throw new Error("Falha ao buscar participantes.");
        }

        const participantes = await respostaParticipantes.json();

        if (!Array.isArray(participantes)) {
            throw new Error("Formato inesperado de participantes.");
        }

        exibirParticipantes(participantes);

        conteudoVotacao.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar votação:", erro);
        mostrarErro();
    }
}

// ========================================
// TENTAR NOVAMENTE
// ========================================

botaoTentarNovamente.addEventListener(
    "click",
    carregarVotacao
);

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarVotacao();
