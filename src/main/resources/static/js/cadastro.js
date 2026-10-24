
const formulario = document.getElementById("form-cadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const campoConfirmarSenha = document.getElementById("confirmar-senha");

const botaoCadastro = document.getElementById("botao-cadastro");
const mensagemErro = document.getElementById("mensagem-erro");

// Mostrar ou ocultar senha
document.querySelectorAll(".alternar-senha").forEach(botao => {

    botao.addEventListener("click", () => {

        const campo = document.getElementById(botao.dataset.alvo);

        const senhaVisivel = campo.type === "text";

        campo.type = senhaVisivel ? "password" : "text";
        botao.textContent = senhaVisivel ? "Mostrar" : "Ocultar";

    });

});

// Exibir mensagens de erro
function exibirErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

// Limpar mensagens de erro
function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

// Enviar cadastro para o backend
formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    limparErro();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    // Validação dos campos
    if (!nome || !email || !senha || !confirmarSenha) {
        exibirErro("Preencha todos os campos.");
        return;
    }

    if (!campoEmail.checkValidity()) {
        exibirErro("Digite um e-mail válido.");
        return;
    }

    if (senha !== confirmarSenha) {
        exibirErro("As senhas não coincidem.");
        return;
    }

    // Impedir vários cliques durante o cadastro
    botaoCadastro.disabled = true;
    botaoCadastro.textContent = "Criando conta...";

    try {

        const resposta = await fetch("/usuario", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        // Tratamento de erros do backend
        if (!resposta.ok) {

            if (resposta.status === 409) {
                exibirErro("Este e-mail já está cadastrado.");
            }

            else if (resposta.status === 400) {
                exibirErro("Verifique os dados informados.");
            }

            else {
                exibirErro("Não foi possível criar sua conta.");
            }

            return;
        }

        // Guardar o e-mail para a próxima página
        sessionStorage.setItem("emailCadastro", email);

        // Redirecionar para a confirmação do e-mail
        window.location.href = "/verificar-email.html";

    } catch (erro) {

        exibirErro("Não foi possível conectar ao servidor.");

        console.error("Erro no cadastro:", erro);

    } finally {

        botaoCadastro.disabled = false;
        botaoCadastro.textContent = "Criar minha conta →";

    }

});
