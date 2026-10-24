
const conteudoCadastro = document.getElementById(
    "conteudo-cadastro-participante"
);

const acessoNegadoCadastro = document.getElementById(
    "acesso-negado-cadastro"
);

const erroPaginaCadastro = document.getElementById(
    "erro-pagina-cadastro"
);

const formCadastro = document.getElementById(
    "form-cadastrar-participante"
);

const campoNome = document.getElementById("nome-participante");
const campoFantasia = document.getElementById("fantasia-participante");
const campoImagem = document.getElementById("imagem-participante");

const previaImagem = document.getElementById("previa-imagem");
const imagemPreview = document.getElementById("imagem-preview");
const erroImagem = document.getElementById("erro-imagem");

const mensagemCadastro = document.getElementById("mensagem-cadastro");

const botaoCadastrar = document.getElementById(
    "botao-cadastrar-participante"
);

const botaoTentarNovamente = document.getElementById(
    "tentar-novamente-cadastro"
);

let tokenAdmin = null;
let temporizadorImagem = null;

// ========================================
// CONTROLE DAS TELAS
// ========================================

function ocultarTelasCadastro() {
    conteudoCadastro.hidden = true;
    acessoNegadoCadastro.hidden = true;
    erroPaginaCadastro.hidden = true;
}

function mostrarAcessoNegadoCadastro() {
    ocultarTelasCadastro();
    tokenAdmin = null;
    acessoNegadoCadastro.hidden = false;
}

function mostrarErroPaginaCadastro() {
    ocultarTelasCadastro();
    erroPaginaCadastro.hidden = false;
}

// ========================================
// VALIDAR ADMINISTRADOR
// ========================================

async function verificarAdministrador() {
    ocultarTelasCadastro();

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarAcessoNegadoCadastro();
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

        if (resposta.status === 401) {
            localStorage.removeItem("token");
            mostrarAcessoNegadoCadastro();
            return;
        }

        if (resposta.status === 403) {
            mostrarAcessoNegadoCadastro();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Não foi possível validar o usuário.");
        }

        const usuario = await resposta.json();

        if (usuario.permissao !== "ADMIN") {
            mostrarAcessoNegadoCadastro();
            return;
        }

        tokenAdmin = token;
        conteudoCadastro.hidden = false;

    } catch (erro) {
        console.error("Erro ao verificar administrador:", erro);
        mostrarErroPaginaCadastro();
    }
}

// ========================================
// MENSAGENS DO FORMULÁRIO
// ========================================

function mostrarMensagemCadastro(texto, tipo) {
    mensagemCadastro.textContent = texto;
    mensagemCadastro.className = `mensagem-cadastro ${tipo}`;
    mensagemCadastro.hidden = false;
}

function limparMensagemCadastro() {
    mensagemCadastro.hidden = true;
    mensagemCadastro.textContent = "";
    mensagemCadastro.className = "mensagem-cadastro";
}

// ========================================
// PRÉVIA DA IMAGEM
// ========================================

function limparPreviaImagem() {
    imagemPreview.removeAttribute("src");
    imagemPreview.hidden = true;
    erroImagem.hidden = true;
    previaImagem.hidden = true;
}

function atualizarPreviaImagem() {
    const url = campoImagem.value.trim();

    if (!url) {
        limparPreviaImagem();
        return;
    }

    let endereco;

    try {
        endereco = new URL(url);

        if (!["http:", "https:"].includes(endereco.protocol)) {
            throw new Error("Protocolo inválido");
        }

    } catch {
        limparPreviaImagem();
        return;
    }

    previaImagem.hidden = false;
    erroImagem.hidden = true;
    imagemPreview.hidden = true;

    imagemPreview.onload = () => {
        imagemPreview.hidden = false;
        erroImagem.hidden = true;
    };

    imagemPreview.onerror = () => {
        imagemPreview.hidden = true;
        erroImagem.hidden = false;
    };

    imagemPreview.src = endereco.href;
}

campoImagem.addEventListener("input", () => {
    clearTimeout(temporizadorImagem);

    temporizadorImagem = setTimeout(
        atualizarPreviaImagem,
        500
    );
});

// ========================================
// CADASTRAR PARTICIPANTE
// ========================================

async function cadastrarParticipante(evento) {
    evento.preventDefault();
    limparMensagemCadastro();

    const nome = campoNome.value.trim();
    const fantasia = campoFantasia.value.trim();
    const urlImagem = campoImagem.value.trim();

    if (!nome || !fantasia || !urlImagem) {
        mostrarMensagemCadastro(
            "Preencha todos os campos antes de cadastrar.",
            "erro"
        );
        return;
    }

    let urlValida;

    try {
        urlValida = new URL(urlImagem);

        if (!["http:", "https:"].includes(urlValida.protocol)) {
            throw new Error("URL inválida");
        }

    } catch {
        mostrarMensagemCadastro(
            "Informe uma URL de imagem válida, começando com https://.",
            "erro"
        );
        return;
    }

    if (!tokenAdmin) {
        mostrarAcessoNegadoCadastro();
        return;
    }

    botaoCadastrar.disabled = true;
    botaoCadastrar.textContent = "Cadastrando...";

    try {
        const resposta = await fetch("/participante/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({
                nome: nome,
                fantasia: fantasia,
                url_imagem_fantasia: urlImagem
            })
        });

        if (resposta.status === 401) {
            localStorage.removeItem("token");
            mostrarAcessoNegadoCadastro();
            return;
        }

        if (resposta.status === 403) {
            mostrarMensagemCadastro(
                "Você não tem permissão para cadastrar participantes.",
                "erro"
            );
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                `Falha ao cadastrar participante. HTTP ${resposta.status}`
            );
        }

        mostrarMensagemCadastro(
            `🎃 ${nome} foi cadastrado com sucesso!`,
            "sucesso"
        );

        formCadastro.reset();
        clearTimeout(temporizadorImagem);
        limparPreviaImagem();

    } catch (erro) {
        console.error("Erro ao cadastrar participante:", erro);

        mostrarMensagemCadastro(
            "Não foi possível cadastrar o participante. Tente novamente.",
            "erro"
        );

    } finally {
        botaoCadastrar.disabled = false;
        botaoCadastrar.textContent = "Cadastrar participante →";
    }
}

// ========================================
// EVENTOS
// ========================================

formCadastro.addEventListener("submit", cadastrarParticipante);

botaoTentarNovamente.addEventListener(
    "click",
    verificarAdministrador
);

// ========================================
// INICIALIZAÇÃO
// ========================================

verificarAdministrador();
