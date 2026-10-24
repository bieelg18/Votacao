
const formulario = document.getElementById("form-verificacao");

const camposCodigo = Array.from(
    document.querySelectorAll("#campos-codigo input")
);

const emailDestino = document.getElementById("email-destino");

const mensagemErro = document.getElementById("mensagem-erro");
const mensagemSucesso = document.getElementById("mensagem-sucesso");

const botaoConfirmar = document.getElementById("botao-confirmar");
const botaoReenviar = document.getElementById("botao-reenviar");
const contador = document.getElementById("contador");

const email = sessionStorage.getItem("emailCadastro");

let verificando = false;
let reenviando = false;
let intervaloContador = null;

// ========================================
// E-MAIL DO USUÁRIO
// ========================================

if (!email) {
    window.location.replace("/cadastro.html");
} else {
    emailDestino.textContent = email;
    camposCodigo[0].focus();
}

// ========================================
// MENSAGENS
// ========================================

function limparMensagens() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;

    mensagemSucesso.textContent = "";
    mensagemSucesso.hidden = true;
}

function exibirErro(texto) {
    mensagemSucesso.hidden = true;

    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
}

function exibirSucesso(texto) {
    mensagemErro.hidden = true;

    mensagemSucesso.textContent = texto;
    mensagemSucesso.hidden = false;
}

// ========================================
// CAMPOS DO CÓDIGO
// ========================================

function preencherCodigo(texto, indiceInicial = 0) {
    const digitos = texto.replace(/\D/g, "");

    if (!digitos) {
        return;
    }

    let indice = indiceInicial;

    for (const digito of digitos) {
        if (indice >= camposCodigo.length) {
            break;
        }

        camposCodigo[indice].value = digito;
        indice++;
    }

    camposCodigo[
        Math.min(indice, camposCodigo.length - 1)
        ].focus();
}

camposCodigo.forEach((campo, indice) => {

    // Avançar automaticamente após digitar
    campo.addEventListener("input", () => {
        const digitos = campo.value.replace(/\D/g, "");

        campo.value = digitos.slice(-1);

        if (campo.value && indice < camposCodigo.length - 1) {
            camposCodigo[indice + 1].focus();
        }

        limparMensagens();
    });

    // Voltar com Backspace
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Backspace" && !campo.value && indice > 0) {
            camposCodigo[indice - 1].focus();
            camposCodigo[indice - 1].value = "";
        }

        if (evento.key === "ArrowLeft" && indice > 0) {
            evento.preventDefault();
            camposCodigo[indice - 1].focus();
        }

        if (evento.key === "ArrowRight" && indice < camposCodigo.length - 1) {
            evento.preventDefault();
            camposCodigo[indice + 1].focus();
        }
    });

    // Colar um código completo
    campo.addEventListener("paste", (evento) => {
        evento.preventDefault();

        const texto = evento.clipboardData.getData("text");

        preencherCodigo(texto, indice);
        limparMensagens();
    });

});

// ========================================
// CONTAGEM REGRESSIVA
// ========================================

function iniciarContagem(segundos = 60) {
    clearInterval(intervaloContador);

    const termino = Date.now() + segundos * 1000;

    botaoReenviar.disabled = true;

    function atualizarContagem() {
        const restante = Math.max(
            0,
            Math.ceil((termino - Date.now()) / 1000)
        );

        contador.textContent = restante;

        if (restante === 0) {
            clearInterval(intervaloContador);

            botaoReenviar.disabled = false;
            botaoReenviar.textContent = "Reenviar código";
        } else {
            botaoReenviar.innerHTML =
                `Reenviar código em <span id="contador">${restante}</span>s`;
        }
    }

    atualizarContagem();

    intervaloContador = setInterval(atualizarContagem, 1000);
}

iniciarContagem();

// ========================================
// CONFIRMAR E-MAIL
// ========================================

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (verificando) {
        return;
    }

    limparMensagens();

    const codigo = camposCodigo
        .map(campo => campo.value)
        .join("");

    if (!/^\d{6}$/.test(codigo)) {
        exibirErro("Digite os 6 dígitos do código de verificação.");
        return;
    }

    verificando = true;

    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = "Confirmando...";

    try {
        const resposta = await fetch("/usuario/confirmar-email", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                codigo: codigo
            })
        });

        if (!resposta.ok) {
            if (resposta.status === 400) {
                exibirErro("Código inválido ou expirado. Verifique e tente novamente.");
            } else if (resposta.status === 429) {
                exibirErro("Muitas tentativas. Aguarde antes de tentar novamente.");
            } else {
                exibirErro("Não foi possível confirmar seu e-mail. Tente novamente.");
            }

            return;
        }

        exibirSucesso("E-mail confirmado com sucesso! Redirecionando...");

        // Não precisamos mais do e-mail temporário.
        sessionStorage.removeItem("emailCadastro");

        // Guardar o e-mail para preencher o login.
        sessionStorage.setItem("emailLogin", email);

        // Redirecionar para o login.
        window.location.replace("/index.html");

    } catch (erro) {
        console.error("Erro ao confirmar e-mail:", erro);

        exibirErro("Não foi possível conectar ao servidor.");
    } finally {
        verificando = false;

        botaoConfirmar.disabled = false;
        botaoConfirmar.textContent = "Confirmar e-mail →";
    }
});

// ========================================
// REENVIAR CÓDIGO
// ========================================

botaoReenviar.addEventListener("click", async () => {
    if (reenviando || botaoReenviar.disabled) {
        return;
    }

    reenviando = true;
    botaoReenviar.disabled = true;
    botaoReenviar.textContent = "Reenviando...";

    limparMensagens();

    try {
        const resposta = await fetch("/usuario/reenviar-codigo", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })
        });

        if (!resposta.ok) {
            exibirErro("Não foi possível solicitar outro código.");
            botaoReenviar.textContent = "Reenviar código";
            botaoReenviar.disabled = false;
            return;
        }

        exibirSucesso(
            "Solicitação recebida! Confira seu e-mail."
        );

        iniciarContagem(60);

    } catch (erro) {
        console.error("Erro ao reenviar código:", erro);

        exibirErro("Não foi possível conectar ao servidor.");

        botaoReenviar.textContent = "Reenviar código";
        botaoReenviar.disabled = false;
    } finally {
        reenviando = false;
    }
});


