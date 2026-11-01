## 1. Textos

- [x] 1.1 Adicionar chaves pt/en para o aviso de aprovação do solicitante (tarefa e demanda), o aviso do registro de trabalho para a Tekuá e o aviso para um membro beneficiário

## 2. Formulários de criação

- [x] 2.1 Em `CreateTask.tsx`, exibir o aviso de aprovação do solicitante e remover o campo "Número de Confirmações" e seu estado
- [x] 2.2 Em `CreateDemand.tsx`, exibir o aviso de aprovação do solicitante e remover o campo "Número de Confirmações" e seu estado
- [x] 2.3 Remover `minConfirmations` do envio de `createActivity` nos dois formulários, já que o servidor o ignora

## 3. Registro de trabalho e edição

- [x] 3.1 Em `RegisterWork.tsx`, exibir o aviso conforme o beneficiário (Tekuá ou membro), atualizando-o quando o beneficiário mudar, sem repetir o aviso de destino da mudança `register-work-validation-notice`
- [x] 3.2 Em `TaskDetail.tsx`, exibir o campo "Número de Confirmações" na edição somente quando `validation_method` for `community_consensus`

## 4. Validação

- [x] 4.1 Testes de renderização: avisos nos três formulários, troca do aviso ao mudar o beneficiário, campo ausente nos formulários de criação
- [x] 4.2 Teste da edição: campo presente só com `community_consensus`
- [x] 4.3 Verificar que os dois JSON de tradução continuam válidos e executar `npm run build` sem erros
