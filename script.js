// ================================================================
// SISTEMA DE CONTROLE DE ESTUDOS
// ================================================================
// Persistência: localStorage + JSON.stringify() + JSON.parse()
// Estrutura principal: array de objetos.
//
// Regra do cronômetro:
// - cada disciplina pode ter seu próprio cronômetro;
// - somente um cronômetro fica ativo por vez;
// - horasPlanejadas guarda a meta informada no cadastro;
// - ao parar, o tempo real medido é salvo em horasEstudadas;
// - a disciplina NÃO é concluída automaticamente ao parar o cronômetro.

const CHAVE_STORAGE = "disciplinas";
const CHAVE_TEMA = "temaEstudos";

// Array de objetos: cada item representa uma disciplina.
let disciplinas = [];

// Estado do cronômetro em memória.
let cronometroAtivo = null;
let intervaloCronometro = null;

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
    const temaSalvo = localStorage.getItem(CHAVE_TEMA);
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
    localStorage.setItem(CHAVE_TEMA, novoTema);
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

        // Garante a separação entre tempo planejado e tempo realmente estudado.
        // Registros antigos que não possuíam essa separação usam horasEstudadas como
        // referência planejada e começam o estudo real em 00:00:00.
        disciplinas = disciplinas.map(function (disciplina) {
            const tempoCronometro = Number(disciplina.tempoCronometroSegundos) || 0;
            const possuiTempoPlanejado = disciplina.horasPlanejadas !== undefined;

            return {
                ...disciplina,
                horasPlanejadas: possuiTempoPlanejado
                    ? Number(disciplina.horasPlanejadas) || 0
                    : Number(disciplina.horasEstudadas) || 0,
                horasEstudadas: possuiTempoPlanejado
                    ? Number(disciplina.horasEstudadas) || 0
                    : (tempoCronometro > 0 ? Number((tempoCronometro / 3600).toFixed(4)) : 0),
                tempoCronometroSegundos: tempoCronometro,
                concluida: Boolean(disciplina.concluida)
            };
        });
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
        return "Informe o tempo planejado de estudo.";
    }

    const horasNumero = Number(horas);

    if (!Number.isFinite(horasNumero)) {
        return "O tempo planejado deve ser um número.";
    }

    if (horasNumero < 0) {
        return "O tempo planejado não pode ser negativo.";
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

    // Cria um objeto com os dados exigidos pelo exercício.
    const novaDisciplina = {
        nome: nome,
        horasPlanejadas: Number(horas),
        horasEstudadas: 0,
        tempoCronometroSegundos: 0,
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

    // Se a disciplina estiver sendo concluída enquanto o cronômetro está rodando,
    // primeiro registra o tempo já estudado e só depois fecha a tarefa.
    if (!disciplina.concluida && cronometroAtivo && cronometroAtivo.indice === indice) {
        pararCronometro(indice, false);
    }

    // Inverte true para false e false para true.
    disciplina.concluida = !disciplina.concluida;

    // Uma disciplina concluída não pode iniciar o cronômetro.
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

    // Não deixa um cronômetro continuar apontando para uma disciplina removida.
    if (cronometroAtivo && cronometroAtivo.indice === indice) {
        pararCronometro(indice, false);
    }

    // Remove o objeto do array.
    disciplinas.splice(indice, 1);

    // Persiste o array atualizado no localStorage.
    salvarDisciplinas();
    renderizarDisciplinas();
}

// ================================================================
// CRONÔMETRO
// ================================================================
function iniciarCronometro(indice) {
    const disciplina = disciplinas[indice];

    if (!disciplina) {
        return;
    }

    // Regra de negócio: cronômetro disponível somente para tarefas abertas.
    if (disciplina.concluida) {
        mostrarMensagem(`Reabra "${disciplina.nome}" para iniciar o cronômetro.`, "erro");
        return;
    }

    if (cronometroAtivo) {
        mostrarMensagem("Pare o cronômetro atual antes de iniciar outro.", "erro");
        return;
    }

    cronometroAtivo = {
        indice: indice,
        inicio: Date.now(),
        segundosAcumulados: obterTempoSalvoEmSegundos(disciplina)
    };

    atualizarCronometroNaTela();
    intervaloCronometro = setInterval(atualizarCronometroNaTela, 1000);
    renderizarDisciplinas();
}

function obterSegundosDecorridos() {
    if (!cronometroAtivo) {
        return 0;
    }

    const segundosDaSessao = Math.max(0, Math.floor((Date.now() - cronometroAtivo.inicio) / 1000));
    return cronometroAtivo.segundosAcumulados + segundosDaSessao;
}

function atualizarCronometroNaTela() {
    if (!cronometroAtivo) {
        return;
    }

    const display = document.querySelector(`[data-cronometro="${cronometroAtivo.indice}"]`);

    if (!display) {
        return;
    }

    display.textContent = formatarTempo(obterSegundosDecorridos());
}

function pararCronometro(indice, exibirMensagem = true) {
    if (!cronometroAtivo || cronometroAtivo.indice !== indice) {
        return;
    }

    const segundos = obterSegundosDecorridos();
    const disciplina = disciplinas[indice];

    clearInterval(intervaloCronometro);
    intervaloCronometro = null;

    cronometroAtivo = null;

    if (disciplina) {
        // Salva o tempo acumulado: ao iniciar novamente, o cronômetro continua
        // exatamente do ponto em que foi parado anteriormente.
        disciplina.tempoCronometroSegundos = segundos;

        // O tempo estudado representa o tempo real acumulado pelo cronômetro.
        // O tempo planejado permanece intacto.
        disciplina.horasEstudadas = Number((segundos / 3600).toFixed(4));

        // O cronômetro não conclui a disciplina automaticamente.
        salvarDisciplinas();
    }

    renderizarDisciplinas();

    if (exibirMensagem && disciplina) {
        mostrarMensagem(`Tempo registrado em "${disciplina.nome}": ${formatarTempo(segundos)}.`, "sucesso");
    }
}

function formatarTempo(segundos) {
    const totalSegundos = Math.max(0, Math.floor(Number(segundos) || 0));
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundosRestantes = totalSegundos % 60;

    return [horas, minutos, segundosRestantes]
        .map(function (valor) {
            return String(valor).padStart(2, "0");
        })
        .join(":");
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

        const tempoPlanejado = document.createElement("span");
        tempoPlanejado.textContent = `Planejado: ${formatarHorasPlanejadas(disciplina.horasPlanejadas)}`;

        const tempoEstudado = document.createElement("span");
        tempoEstudado.textContent = `Estudado: ${formatarTempo(obterTempoSalvoEmSegundos(disciplina))}`;

        const separador = document.createElement("span");
        separador.className = "separador";
        separador.textContent = "•";
        separador.setAttribute("aria-hidden", "true");

        const status = document.createElement("span");
        status.className = "status";
        status.classList.add(disciplina.concluida ? "concluida" : "andamento");
        status.textContent = disciplina.concluida ? "Concluída" : "Em andamento";

        dados.append(tempoPlanejado, separador, tempoEstudado, separador.cloneNode(true), status);
        info.append(nome, dados);

        const cronometro = document.createElement("div");
        cronometro.className = "area-cronometro";

        const cronometroLabel = document.createElement("span");
        cronometroLabel.className = "rotulo-cronometro";
        cronometroLabel.textContent = cronometroAtivo && cronometroAtivo.indice === indice
            ? "Estudando agora"
            : "Cronômetro";

        const cronometroDisplay = document.createElement("strong");
        cronometroDisplay.className = "cronometro-display";
        cronometroDisplay.dataset.cronometro = String(indice);
        cronometroDisplay.textContent = cronometroAtivo && cronometroAtivo.indice === indice
            ? formatarTempo(obterSegundosDecorridos())
            : formatarTempo(obterTempoSalvoEmSegundos(disciplina));

        cronometro.append(cronometroLabel, cronometroDisplay);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const botaoCronometro = document.createElement("button");
        botaoCronometro.type = "button";
        const cronometroRodando = cronometroAtivo && cronometroAtivo.indice === indice;
        const cronometroDisponivel = !disciplina.concluida;

        if (cronometroRodando) {
            botaoCronometro.className = "botao-cronometro parando";
            botaoCronometro.textContent = "Parar cronômetro";
            botaoCronometro.disabled = false;
            botaoCronometro.setAttribute("aria-label", `Parar cronômetro de ${disciplina.nome}`);
        } else if (!cronometroDisponivel) {
            botaoCronometro.className = "botao-cronometro indisponivel";
            botaoCronometro.textContent = "Iniciar Cronômetro";
            botaoCronometro.disabled = true;
            botaoCronometro.setAttribute("aria-label", `Cronômetro indisponível para ${disciplina.nome}. Reabra a disciplina para iniciar.`);
            botaoCronometro.title = "Reabra a disciplina para iniciar o cronômetro";
        } else {
            botaoCronometro.className = "botao-cronometro";
            botaoCronometro.textContent = "Iniciar cronômetro";
            botaoCronometro.disabled = false;
            botaoCronometro.setAttribute("aria-label", `Iniciar cronômetro de ${disciplina.nome}`);
            botaoCronometro.removeAttribute("title");
        }

        botaoCronometro.addEventListener("click", function () {
            if (botaoCronometro.disabled) {
                return;
            }

            if (cronometroAtivo && cronometroAtivo.indice === indice) {
                pararCronometro(indice);
            } else {
                iniciarCronometro(indice);
            }
        });

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

        acoes.append(botaoCronometro, botaoConclusao, botaoRemover);
        card.append(info, cronometro, acoes);
        listaDisciplinas.appendChild(card);
    });

    estadoVazio.hidden = disciplinas.length !== 0;
    atualizarResumo();
    atualizarCronometroNaTela();
}

// ================================================================
// RESUMO
// ================================================================
function atualizarResumo() {
    const quantidadeConcluidas = disciplinas.filter(function (disciplina) {
        return disciplina.concluida;
    }).length;

    totalDisciplinas.textContent = disciplinas.length;
    totalConcluidas.textContent = quantidadeConcluidas;
    const totalSegundos = disciplinas.reduce(function (total, disciplina) {
        return total + obterTempoSalvoEmSegundos(disciplina);
    }, 0);

    totalHoras.textContent = formatarTempo(totalSegundos);
    contadorStatus.textContent = `${disciplinas.length} ${disciplinas.length === 1 ? "disciplina" : "disciplinas"}`;
}

// ================================================================
// AUXILIARES DE INTERFACE
// ================================================================
function obterTempoSalvoEmSegundos(disciplina) {
    if (!disciplina) {
        return 0;
    }

    if (Number(disciplina.tempoCronometroSegundos) > 0) {
        return Number(disciplina.tempoCronometroSegundos);
    }

    return Math.max(0, Math.round((Number(disciplina.horasEstudadas) || 0) * 3600));
}

function formatarHorasPlanejadas(horas) {
    const valor = Number(horas) || 0;
    const segundos = Math.round(valor * 3600);
    return formatarTempo(segundos);
}

function formatarNumero(numero) {
    const valor = Number(numero) || 0;
    return Number.isInteger(valor)
        ? String(valor)
        : valor.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatarHoras(horas) {
    const numero = Number(horas) || 0;
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
