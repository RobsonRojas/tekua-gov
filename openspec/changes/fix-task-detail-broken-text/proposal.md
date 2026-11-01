## Why

No detalhe da tarefa, o bloco "Convite Externo" aparece quebrado: o título mostra o nome interno da chave de tradução (`work.inviteExternal`), a frase de instrução é cortada na borda do card ("...se cadastrem" sem terminar) e o link do convite ultrapassa a largura, empurrando o botão "Copiar" para fora. A descrição da tarefa também não quebra palavras longas, então uma URL longa colada nela estoura o card do mesmo jeito.

## What Changes

- Adicionar a chave `work.inviteExternal` ("Convite Externo" / "External Invite") nos arquivos de tradução e passar o texto padrão ao `t()`, já que o `|| 'Convite Externo'` atual nunca age.
- Mover a frase de instrução do convite, hoje fixa em português no código, para as chaves de tradução pt/en.
- Conter o bloco do convite na largura do card: o link passa a quebrar em várias linhas em vez de ser cortado, e o botão "Copiar" permanece visível.
- Fazer a descrição da tarefa quebrar palavras e URLs longas dentro da largura do card, mantendo as quebras de linha do texto.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `task-external-invites`: o bloco de convite é traduzido e cabe na largura do card.
- `task-execution`: a descrição da tarefa não ultrapassa a largura do card.

## Impact

- `src/pages/TaskDetail.tsx`: estilos do bloco do convite e da descrição, e chamada do `t()`.
- `src/locales/pt/translation.json` e `src/locales/en/translation.json`: chaves novas.
- Sem mudança de API, banco ou dependências.
