# Sistema de Controle de Estudos

Protótipo acadêmico em HTML, CSS e JavaScript puro.

## Estrutura

```text
sistema-controle-estudos/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Persistência

A aplicação mantém um único array de objetos no `localStorage`, na chave `disciplinas`.

Fluxo de leitura:

```text
localStorage.getItem()
        ↓
   JSON.parse()
        ↓
 array de objetos
        ↓
   renderização
```

Fluxo de alteração:

```text
alterar array
      ↓
JSON.stringify()
      ↓
localStorage.setItem()
      ↓
renderização
```

## Estrutura de cada disciplina

```javascript
{
    nome: "Programação",
    horasEstudadas: 10,
    concluida: false
}
```

## Como executar

Abra o `index.html` em um navegador.

Para demonstrar a persistência, cadastre três disciplinas, altere uma para concluída e atualize a página com `F5`. Em seguida, remova uma disciplina, atualize novamente e confirme que ela não reapareceu.

## Requisito funcional — Disponibilidade do cronômetro

**RF-CRO-01 — Iniciar cronômetro somente com a disciplina aberta**

Como estudante, quero iniciar o cronômetro apenas quando a disciplina estiver aberta, para evitar registrar tempo em uma tarefa que já foi concluída.

Regras:

- Uma disciplina **Em andamento** pode iniciar o cronômetro.
- Uma disciplina **Concluída** não pode iniciar o cronômetro.
- Quando a disciplina estiver concluída, o botão do cronômetro permanece visível, porém fica **cinza, sem destaque e desabilitado**.
- Para voltar a utilizar o cronômetro, o estudante deve clicar em **Reabrir**.
- Se a disciplina for concluída enquanto seu cronômetro estiver rodando, o tempo decorrido até aquele momento é salvo e a disciplina passa a ficar com o cronômetro indisponível.

Fluxo:

```text
Em andamento
     ↓
Iniciar cronômetro
     ↓
Estudar
     ↓
Parar cronômetro

ou

Em andamento → Concluir → Cronômetro indisponível (cinza)
                           ↓
                        Reabrir
                           ↓
                  Cronômetro disponível
```
