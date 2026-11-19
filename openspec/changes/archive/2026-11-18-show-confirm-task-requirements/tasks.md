## 1. Lógica de requisitos

- [x] 1.1 Criar função pura `getConfirmRequirements` que retorna a lista `{ key, met }` a partir de `isWorker`, `isSelfConfirmExempt` e `user_has_confirmed`
- [x] 1.2 Em `TaskDetail.tsx`, derivar o `disabled` do botão de `actionLoading || algum requisito não satisfeito`

## 2. Interface

- [x] 2.1 Criar componente `ConfirmRequirementsList` (pendentes em destaque, satisfeitos discretos com check)
- [x] 2.2 Renderizar a lista abaixo do botão Confirmar Tarefa apenas quando ele estiver desabilitado por requisitos

## 3. Textos

- [x] 3.1 Adicionar chaves `work.confirmRequirements.*` em `src/locales/pt/translation.json` com linguagem simples
- [x] 3.2 Adicionar as mesmas chaves em `src/locales/en/translation.json`

## 4. Testes

- [x] 4.1 Testes unitários de `getConfirmRequirements` (executor, já confirmou, solicitante, admin)
- [x] 4.2 Teste de `TaskDetail`: lista aparece com botão desabilitado e some com botão habilitado
- [x] 4.3 Rodar `openspec validate show-confirm-task-requirements` e a suíte de testes
