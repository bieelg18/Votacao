
const conteudoRanking = document.getElementById("conteudo-ranking");
const acessoNegadoRanking = document.getElementById("acesso-negado-ranking");
const erroRanking = document.getElementById("erro-ranking");

const listaRanking = document.getElementById("lista-ranking");
const rankingVazio = document.getElementById("ranking-vazio");

const botaoTentarNovamente = document.getElementById(
    "tentar-novamente-ranking"
);

const botaoAtualizar = document.getElementById(
    "botao-atualizar-ranking"
);

const iconeAtualizar = document.getElementById("icone-atualizar");
const textoAtualizar = document.getElementById("texto-atualizar");

const ultimaAtualizacao = document.getElementById(
    "ultima-atualizacao"
);

const avisoErroAtualizacao = document.getElementById(
    "aviso-erro-atualizacao"
);

const INTERVALO_ATUALIZACAO = 15000;

let intervaloRanking = null;
let atualizando = false;
let rankingCarregado = false;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelasRanking() {
    conteudoRanking.hidden = true;
    acessoNegadoRanking.hidden = true;
    erroRanking.hidden = true;
}

function pararAtualizacaoAutomatica() {
    if (intervaloRanking !== null) {
        clearInterval(intervaloRanking);
        intervaloRanking = null;
    }
}

function mostrarAcessoNegadoRanking() {
    pararAtualizacaoAutomatica();
    ocultarTelasRanking();

    acessoNegadoRanking.hidden = false;
}

function mostrarErroRanking() {
    pararAtualizacaoAutomatica();
    ocultarTelasRanking();

    erroRanking.hidden = false;
}

// ========================================
// ESTADO DO BOTÃO
// ========================================

function definirEstadoAtualizacao(carregando) {
    botaoAtualizar.disabled = carregando;

    iconeAtualizar.classList.toggle(
        "girando",
        carregando
    );

    textoAtualizar.textContent = carregando
        ? "Atualizando..."
        : "Atualizar ranking";
}

function mostrarErroAtualizacao(mensagem) {
    avisoErroAtualizacao.textContent = mensagem;
    avisoErroAtualizacao.hidden = false;
}

function limparErroAtualizacao() {
    avisoErroAtualizacao.textContent = "";
    avisoErroAtualizacao.hidden = true;
}

function registrarUltimaAtualizacao() {
    const horario = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    ultimaAtualizacao.textContent =
        `Última atualização: ${horario}`;
}

// ========================================
// MONTAR CLASSIFICAÇÃO
// ========================================

function criarItemRanking(participante, indice) {
    const item = document.createElement("div");
    item.className = "item-ranking";

    if (indice === 0) {
        item.classList.add("primeiro-lugar");
    }

    const posicao = document.createElement("span");
    posicao.className = "posicao-ranking";

    const medalhas = ["🥇", "🥈", "🥉"];

    posicao.textContent =
        medalhas[indice] || `${indice + 1}º`;

    const informacoes = document.createElement("div");
    informacoes.className = "informacoes-ranking";

    const nome = document.createElement("strong");
    nome.className = "nome-participante";
    nome.textContent = participante.nomeParticipante;

    const fantasia = document.createElement("span");
    fantasia.className = "nome-fantasia";
    fantasia.textContent = participante.nomeFantasia;

    informacoes.append(nome, fantasia);

    const votos = document.createElement("div");
    votos.className = "quantidade-votos";

    const numeroVotos = document.createElement("strong");
    numeroVotos.textContent = participante.votos;

    const rotuloVotos = document.createElement("span");
    rotuloVotos.textContent = participante.votos === 1
        ? "voto"
        : "votos";

    votos.append(numeroVotos, rotuloVotos);

    item.append(posicao, informacoes, votos);

    return item;
}

function exibirRanking(participantes) {
    const classificados = participantes
        .filter(participante => participante.votos > 0)
        .sort((a, b) => b.votos - a.votos);

    const fragmento = document.createDocumentFragment();

    classificados.forEach((participante, indice) => {
        fragmento.appendChild(
            criarItemRanking(participante, indice)
        );
    });

    listaRanking.replaceChildren(fragmento);

    rankingVazio.hidden = classificados.length > 0;
}

// ========================================
// AUTENTICAÇÃO
// ========================================

async function validarAutenticacao(token) {
    const resposta = await fetch("/usuario/me", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
    });

    if (resposta.status === 401 || resposta.status === 403) {
        localStorage.removeItem("token");
        mostrarAcessoNegadoRanking();
        return false;
    }

    if (!resposta.ok) {
        throw new Error("Falha ao validar autenticação.");
    }

    return true;
}

// ========================================
// BUSCAR RANKING NO BACKEND
// ========================================

async function atualizarRanking() {
    if (atualizando) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegadoRanking();
        return;
    }

    atualizando = true;
    definirEstadoAtualizacao(true);
    limparErroAtualizacao();

    try {
        const resposta = await fetch("/votacao", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (resposta.status === 401 || resposta.status === 403) {
            localStorage.removeItem("token");
            mostrarAcessoNegadoRanking();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Falha ao atualizar o ranking.");
        }

        const participantes = await resposta.json();

        if (!Array.isArray(participantes)) {
            throw new Error("Formato de ranking inesperado.");
        }

        exibirRanking(participantes);

        rankingCarregado = true;

        registrarUltimaAtualizacao();

        conteudoRanking.hidden = false;
        erroRanking.hidden = true;

    } catch (erro) {
        console.error("Erro ao atualizar ranking:", erro);

        if (rankingCarregado) {
            // Mantém o último ranking exibido.
            mostrarErroAtualizacao(
                "Não foi possível atualizar agora. " +
                "A classificação anterior continua disponível."
            );
        } else {
            mostrarErroRanking();
        }

    } finally {
        atualizando = false;
        definirEstadoAtualizacao(false);
    }
}

// ========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ========================================

function iniciarAtualizacaoAutomatica() {
    pararAtualizacaoAutomatica();

    intervaloRanking = setInterval(() => {
        if (
            !document.hidden &&
            !conteudoRanking.hidden &&
            !atualizando
        ) {
            atualizarRanking();
        }
    }, INTERVALO_ATUALIZACAO);
}

// Quando o usuário volta para a aba,
// consulta novamente os votos.
document.addEventListener("visibilitychange", () => {
    if (
        !document.hidden &&
        !conteudoRanking.hidden &&
        !atualizando
    ) {
        atualizarRanking();
    }
});

// ========================================
// CARREGAMENTO INICIAL
// ========================================

async function carregarRanking() {
    pararAtualizacaoAutomatica();
    ocultarTelasRanking();

    rankingCarregado = false;

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegadoRanking();
        return;
    }

    try {
        const autenticado = await validarAutenticacao(token);

        if (!autenticado) {
            return;
        }

        await atualizarRanking();

        if (rankingCarregado) {
            iniciarAtualizacaoAutomatica();
        }

    } catch (erro) {
        console.error("Erro ao carregar ranking:", erro);
        mostrarErroRanking();
    }
}

// ========================================
// BOTÕES
// ========================================

botaoAtualizar.addEventListener("click", () => {
    atualizarRanking();
});

botaoTentarNovamente.addEventListener(
    "click",
    carregarRanking
);

// ========================================
// LIMPEZA
// ========================================

window.addEventListener("pagehide", () => {
    pararAtualizacaoAutomatica();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarRanking();
