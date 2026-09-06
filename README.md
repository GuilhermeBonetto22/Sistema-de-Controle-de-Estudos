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
