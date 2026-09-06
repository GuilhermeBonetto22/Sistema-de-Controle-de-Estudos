// ================================================================
// SISTEMA DE CONTROLE DE ESTUDOS
// ================================================================
// Persistência: localStorage + JSON.stringify() + JSON.parse()
// Estrutura principal: array de objetos.

const CHAVE_STORAGE = "disciplinas";

// Array de objetos: cada item representa uma disciplina.
let disciplinas = [];

const formDisciplina = document.getElementById("form-disciplina");
const nomeDisciplina = document.getElementById("nome-disciplina");
const horasEstudadas = document.getElementById("horas-estudadas");
const mensagemForm = document.getElementById("mensagem-form");
const listaDisciplinas = document.getElementById("lista-disciplinas");
const estadoVazio = document.getElementById("estado-vazio");
const totalDisciplinas = document.getElementById("total-disciplinas");
const totalConcluidas = document.getElementById("total-concluidas");
const totalHoras = document.getElementById("total-horas");
const contadorStatus = document.getElementById("contador-status");
const botaoTema = document.getElementById("botao-tema");

// ================================================================
// TEMA
// ================================================================
function aplicarTema() {
    const temaSalvo = localStorage.getItem("temaEstudos");
    const temaEscuro = temaSalvo === "escuro";

    document.body.classList.toggle("tema-escuro", temaEscuro);
    document.documentElement.classList.toggle("tema-escuro", temaEscuro);
    botaoTema.innerHTML = temaEscuro ? "☀️ <span>Tema claro</span>" : "🌙 <span>Tema escuro</span>";
    botaoTema.setAttribute("aria-label", temaEscuro ? "Ativar tema claro" : "Ativar tema escuro");
    botaoTema.title = temaEscuro ? "Ativar tema claro" : "Ativar tema escuro";
}

function alternarTema() {
    const temaEscuro = !document.body.classList.contains("tema-escuro");
    const novoTema = temaEscuro ? "escuro" : "claro";

    document.body.classList.toggle("tema-escuro", temaEscuro);
    document.documentElement.classList.toggle("tema-escuro", temaEscuro);
    localStorage.setItem("temaEstudos", novoTema);
    aplicarTema();
}

botaoTema.addEventListener("click", alternarTema);
aplicarTema();

// ================================================================
// CARREGAR
// ================================================================
function carregarDisciplinas() {
    const dados = localStorage.getItem(CHAVE_STORAGE);

    // getItem() retorna null quando a chave ainda não existe.
    if (dados === null) {
        disciplinas = [];
        return;
    }

    try {
        const dadosConvertidos = JSON.parse(dados);

        // Mantém a estrutura esperada: somente um array de objetos.
        disciplinas = Array.isArray(dadosConvertidos)
            ? dadosConvertidos
            : [];
    } catch (erro) {
        // Se houver JSON inválido, a aplicação continua utilizável.
        disciplinas = [];
        console.error("Não foi possível ler as disciplinas salvas:", erro);
    }
}

// ================================================================
// SALVAR
// ================================================================
function salvarDisciplinas() {
    // Converte o array de objetos em JSON antes de salvar.
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(disciplinas));
}

// ================================================================
// VALIDAÇÃO
// ================================================================
function validarDados(nome, horas) {
    if (nome.trim() === "") {
        return "Informe o nome da disciplina.";
    }

    if (horas === "") {
        return "Informe a quantidade de horas estudadas.";
    }

    const horasNumero = Number(horas);

    if (!Number.isFinite(horasNumero)) {
        return "As horas estudadas devem ser um número.";
    }

    if (horasNumero < 0) {
        return "As horas estudadas não podem ser negativas.";
    }

    return "";
}

// ================================================================
// ADICIONAR
// ================================================================
function adicionarDisciplina(evento) {
    evento.preventDefault();

    const nome = nomeDisciplina.value.trim();
    const horas = horasEstudadas.value.trim();
    const erro = validarDados(nome, horas);

    if (erro !== "") {
        mostrarMensagem(erro, "erro");
        return;
    }

    // Cria um objeto com exatamente os dados exigidos pelo exercício.
    const novaDisciplina = {
        nome: nome,
        horasEstudadas: Number(horas),
        concluida: false
    };

    // Carregar → Alterar → Salvar: alteração do array.
    disciplinas.push(novaDisciplina);

    // Persistência do array atualizado.
    salvarDisciplinas();

    formDisciplina.reset();
    renderizarDisciplinas();
    mostrarMensagem("Disciplina adicionada com sucesso.", "sucesso");
    nomeDisciplina.focus();
}

// ================================================================
// ALTERAR CONCLUSÃO
// ================================================================
function alterarConclusao(indice) {
    const disciplina = disciplinas[indice];

    if (!disciplina) {
        return;
    }

    // Inverte true para false e false para true.
    disciplina.concluida = !disciplina.concluida;

    // Salva a alteração para que ela sobreviva ao F5.
    salvarDisciplinas();
    renderizarDisciplinas();
}

// ================================================================
// REMOVER
// ================================================================
function removerDisciplina(indice) {
    if (!disciplinas[indice]) {
        return;
    }

    // Remove o objeto do array.
    disciplinas.splice(indice, 1);

    // Persiste o array atualizado no localStorage.
    salvarDisciplinas();
    renderizarDisciplinas();
}

// ================================================================
// RENDERIZAR
// ================================================================
function renderizarDisciplinas() {
    listaDisciplinas.innerHTML = "";

    disciplinas.forEach(function (disciplina, indice) {
        const card = document.createElement("article");
        card.className = "card-disciplina";

        if (disciplina.concluida) {
            card.classList.add("concluida");
        }

        const info = document.createElement("div");
        info.className = "info-disciplina";

        const nome = document.createElement("h3");
        nome.className = "nome-disciplina";
        nome.textContent = disciplina.nome;

        const dados = document.createElement("div");
        dados.className = "dados-disciplina";

        const horas = document.createElement("span");
        horas.textContent = `Horas estudadas: ${formatarHoras(disciplina.horasEstudadas)}`;

        const separador = document.createElement("span");
        separador.className = "separador";
        separador.textContent = "•";
        separador.setAttribute("aria-hidden", "true");

        const status = document.createElement("span");
        status.className = "status";
        status.classList.add(disciplina.concluida ? "concluida" : "andamento");
        status.textContent = disciplina.concluida ? "Concluída" : "Em andamento";

        dados.append(horas, separador, status);
        info.append(nome, dados);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const botaoConclusao = document.createElement("button");
        botaoConclusao.type = "button";
        botaoConclusao.className = "botao-secundario";
        botaoConclusao.textContent = disciplina.concluida ? "Reabrir" : "Concluir";
        botaoConclusao.addEventListener("click", function () {
            alterarConclusao(indice);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.className = "botao-remover";
        botaoRemover.textContent = "Remover";
        botaoRemover.addEventListener("click", function () {
            removerDisciplina(indice);
        });

        acoes.append(botaoConclusao, botaoRemover);
        card.append(info, acoes);
        listaDisciplinas.appendChild(card);
    });

    estadoVazio.hidden = disciplinas.length !== 0;
    atualizarResumo();
}

// ================================================================
// RESUMO
// ================================================================
function atualizarResumo() {
    const quantidadeConcluidas = disciplinas.filter(function (disciplina) {
        return disciplina.concluida;
    }).length;

    const quantidadeHoras = disciplinas.reduce(function (total, disciplina) {
        return total + Number(disciplina.horasEstudadas);
    }, 0);

    totalDisciplinas.textContent = disciplinas.length;
    totalConcluidas.textContent = quantidadeConcluidas;
    totalHoras.textContent = `${formatarNumero(quantidadeHoras)}h`;
    contadorStatus.textContent = `${disciplinas.length} ${disciplinas.length === 1 ? "disciplina" : "disciplinas"}`;
}

// ================================================================
// AUXILIARES DE INTERFACE
// ================================================================
function formatarNumero(numero) {
    return Number.isInteger(numero)
        ? String(numero)
        : numero.toFixed(1).replace(".0", "");
}

function formatarHoras(horas) {
    const numero = Number(horas);
    return `${formatarNumero(numero)}h`;
}

function mostrarMensagem(texto, tipo) {
    mensagemForm.textContent = texto;
    mensagemForm.className = `mensagem ${tipo}`;
}

// ================================================================
// INICIALIZAÇÃO
// ================================================================
formDisciplina.addEventListener("submit", adicionarDisciplina);

// Carregar → JSON.parse → array de objetos → renderizar.
carregarDisciplinas();
renderizarDisciplinas();
