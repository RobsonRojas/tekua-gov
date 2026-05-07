## 1. Backend e Lógica de Negócio

- [ ] 1.1 Atualizar a Edge Function `api-work` para aceitar `workerId` nos handlers `createActivity` e `submitActivity`.
- [ ] 1.2 Modificar o handler `moderateActivity` na Edge Function `api-work` para transicionar o status diretamente para `in_progress` se `worker_id` estiver presente no momento da aprovação.

## 2. Componentes Frontend

- [ ] 2.1 Implementar ou adaptar componente `MemberSelector` (utilizando Autocomplete do MUI) para busca de usuários.
- [ ] 2.2 Adicionar o seletar de executor na página `CreateDemand.tsx`, visível apenas para perfis `admin` ou `transversal_council`.
- [ ] 2.3 Garantir que o `workerId` selecionado seja enviado no payload da API ao criar a demanda.

## 3. Verificação e Testes

- [ ] 3.1 Testar criação de demanda por Admin com atribuição de executor e verificar transição de status após aprovação.
- [ ] 3.2 Testar criação de demanda por Membro comum e garantir que o seletor de executor não é exibido.
- [ ] 3.3 Validar que a tarefa atribuída aparece corretamente na aba "Minhas Tarefas" do usuário escolhido.
