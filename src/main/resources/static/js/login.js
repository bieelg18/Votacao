
const formulario = document.getElementById("form-login");

const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");

const botaoEntrar = document.getElementById("botao-entrar");
const botaoMostrarSenha = document.getElementById("mostrar-senha");

const mensagemErro = document.getElementById("mensagem-erro");

let realizandoLogin = false;

// ========================================
// PREENCHIMENTO AUTOMÁTICO DO E-MAIL
// ========================================

const emailSalvo = sessionStorage.getItem("emailLogin");

if (emailSalvo) {
    campoEmail.value = emailSalvo;

    sessionStorage.removeItem("emailLogin");

    campoSenha.focus();
}

// ========================================
// MOSTRAR / OCULTAR SENHA
// ========================================

botaoMostrarSenha.addEventListener("click", () => {
    const senhaVisivel = campoSenha.type === "text";

    campoSenha.type = senhaVisivel ? "password" : "text";

    botaoMostrarSenha.textContent = senhaVisivel
        ? "Mostrar"
        : "Ocultar";

    botaoMostrarSenha.setAttribute(
        "aria-label",
        senhaVisivel ? "Mostrar senha" : "Ocultar senha"
    );
});

// ========================================
// MENSAGENS DE ERRO
// ========================================

function exibirErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

campoEmail.addEventListener("input", limparErro);
campoSenha.addEventListener("input", limparErro);

// ========================================
// LOGIN
// ========================================

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (realizandoLogin) {
        return;
    }

    limparErro();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    // Validar campos obrigatórios
    if (!email || !senha) {
        exibirErro("Preencha todos os campos para entrar.");
        return;
    }

    // Validar formato do e-mail
    if (!campoEmail.checkValidity()) {
        exibirErro("Digite um endereço de e-mail válido.");
        return;
    }

    realizandoLogin = true;

    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando na festa...";

    try {
        const resposta = await fetch("/auth/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        // Credenciais inválidas
        if (resposta.status === 401) {
            exibirErro("E-mail e/ou senha inválidos.");
            return;
        }

        // Outras respostas de erro
        if (!resposta.ok) {
            exibirErro("Não foi possível realizar o login. Tente novamente.");
            return;
        }

        // Resposta da API: { "token": "..." }
        const dados = await resposta.json();

        if (!dados.token || typeof dados.token !== "string") {
            exibirErro("O servidor não retornou um token válido.");
            return;
        }

        // Salvar o JWT para utilizar nas próximas requisições
        localStorage.setItem("token", dados.token);

        // Redirecionar para a página principal
        window.location.replace("/principal.html");

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);

        exibirErro("Não foi possível conectar ao servidor.");
    } finally {
        realizandoLogin = false;

        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar na festa →";
    }
});

