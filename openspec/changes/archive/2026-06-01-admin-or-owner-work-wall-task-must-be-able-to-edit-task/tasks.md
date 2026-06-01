## 1. Backend API Implementation

- [x] 1.1 Criar a ação `updateActivity` no Deno Edge Function `supabase/functions/api-work/index.ts`
- [x] 1.2 Implementar validação de segurança na Edge Function garantindo que apenas administradores ou o criador original (`requester_id`) possam atualizar a tarefa
- [x] 1.3 Atualizar os campos editáveis na tabela `activities` (título, descrição, recompensa, executor atrelado)
- [x] 1.4 Gerenciar a substituição dos anexos de referência (não evidência) na tabela `activity_attachments`
- [x] 1.5 Registrar a operação de edição na tabela de auditoria (`audit_logs`) com os metadados das mudanças realizadas

## 2. Frontend Integration

- [x] 2.1 Adicionar checagem de permissões em `src/pages/TaskDetail.tsx` para identificar se o usuário logado é admin ou criador da tarefa
- [x] 2.2 Criar botão "Editar Tarefa" na página de detalhes da tarefa, visível apenas para usuários autorizados
- [x] 2.3 Desenvolver o modal interativo `EditTaskDialog` (MUI Dialog) contendo os campos de Título, Descrição, Recompensa, Atribuição de Executor (admin apenas) e componente `FileUploader` pré-carregados
- [x] 2.4 Integrar o envio do formulário do modal chamando o endpoint `apiClient.invoke('api-work', 'updateActivity')` com os parâmetros corretos
- [x] 2.5 Adicionar retorno de sucesso e recarregamento da página para refletir as alterações em tempo real no mural

## 3. Verification & Validation

- [x] 3.1 Validar manualmente a edição de tarefas com perfil de administrador e perfil de criador comum
- [x] 3.2 Validar que usuários comuns que não sejam criadores da tarefa não visualizam o botão e são bloqueados pelo backend caso tentem editar
