## Why

Quem cria uma tarefa no mural não consegue assumi-la: o botão "Assumir Tarefa" fica desabilitado para o criador, e o servidor recusa com "You cannot claim your own task". Na prática, um membro que cria uma tarefa para si mesmo, ou que decide executá-la depois de publicá-la, precisa pedir a outra pessoa que a assuma, ou recorrer a um administrador, como mostra o histórico da tarefa na imagem.

## What Changes

- Permitir que o criador (solicitante) de uma tarefa a assuma, quando ela está aberta, tanto no detalhe da tarefa quanto no card do mural.
- Remover a recusa "You cannot claim your own task" do servidor.
- Atualizar o texto do guia do assistente do mural, que hoje diz que só quem não é o solicitante assume.
- Manter o resto da regra: só tarefas abertas, só do tipo tarefa, e uma única pessoa assume.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `task-execution`: o solicitante passa a poder assumir a própria tarefa.

## Impact

- `supabase/functions/api-work/index.ts`: remover a checagem em `claimTask`.
- `src/pages/TaskDetail.tsx` e `src/components/ActivityCard.tsx`: o botão deixa de ser desabilitado para o criador.
- `supabase/functions/ai-handler/workWall.ts`: texto do guia.
- Sem mudança de banco.
