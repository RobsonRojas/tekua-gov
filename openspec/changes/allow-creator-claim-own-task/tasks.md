## 1. Backend

- [x] 1.1 Em `api-work/index.ts`, remover a checagem `requester_id === user.id` de `claimTask`, mantendo a atualização condicionada a `status = 'open'`

## 2. Frontend

- [x] 2.1 Em `TaskDetail.tsx`, remover `isOwner` do `disabled` do botão "Assumir Tarefa"
- [x] 2.2 Em `ActivityCard.tsx`, remover `isOwner` do `disabled` do botão de assumir

## 3. Texto do assistente

- [x] 3.1 Em `ai-handler/workWall.ts`, ajustar o guia para dizer que qualquer membro, incluindo o solicitante, pode assumir uma tarefa aberta

## 4. Validação

- [x] 4.1 Teste de renderização: o botão de assumir está habilitado para o criador em `TaskDetail` e em `ActivityCard`
- [x] 4.2 Verificar que o botão continua habilitado para outros membros e que `build` passa sem erros
