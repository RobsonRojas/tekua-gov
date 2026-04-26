## 1. Backend & API

- [x] 1.1 Atualizar a Edge Function `api-work` para suportar a criação de atividades com status 'open'.
- [x] 1.2 Garantir que o `requester_id` seja definido como o ID do usuário autenticado ao criar uma demanda.
- [x] 1.3 Adicionar validações de servidor para garantir que o `reward_amount` seja positivo.

## 2. Frontend & UI

- [x] 2.1 Criar o componente de página `CreateDemand.tsx` (baseado no `RegisterWork.tsx`).
- [x] 2.2 Remover campos irrelevantes para demandas iniciais (como evidência de conclusão) no formulário de criação.
- [x] 2.3 Adicionar a nova rota `/create-demand` no `router.tsx`.
- [x] 2.4 Atualizar o `WorkWall.tsx` para incluir um botão "Criar Demanda" e garantir que as tarefas 'open' sejam exibidas corretamente.

## 3. Localização (i18n)

- [x] 3.1 Adicionar chaves de tradução para "Criar Demanda", "Valor da Recompensa", etc., em `pt.json` e `en.json`.

## 4. Testes e Verificação

- [x] 4.1 Testar o fluxo de criação de demanda com um usuário comum.
- [x] 4.2 Verificar se a demanda aparece corretamente no Mural de Trabalho para todos os membros.
