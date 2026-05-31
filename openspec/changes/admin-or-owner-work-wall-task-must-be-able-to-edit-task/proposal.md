## Why

Atualmente, as tarefas no Work Wall da Tekuá Governança não podem ser editadas após a criação. Se houver algum erro de digitação, necessidade de complementar a descrição, redefinir a recompensa, ou atrelar/mudar o executor de um trabalho, o autor ou administrador é obrigado a apagar e criar a tarefa do zero. Essa alteração visa permitir a edição ágil e segura de tarefas por seus respectivos autores e por administradores da plataforma.

## What Changes

- **Editar Tarefa**: Introduzir a capacidade de editar os detalhes de uma tarefa (título, descrição, valor de recompensa, executor atrelado e documentos de referência).
- **Controle de Acesso**: Restringir a ação de editar exclusivamente aos administradores e ao autor original (criador/requester) da tarefa.
- **Formulário de Edição**: Interface visual fluida integrada à tela de detalhes da tarefa e/ou modal no Work Wall para realizar a alteração em tempo real.
- **Rastreabilidade e Auditoria**: Registro de auditoria (`audit_logs`) quando uma tarefa for alterada, armazenando os metadados dos campos modificados.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `gift-economy-tasks`: Permitir que autores e administradores editem tarefas ativas, com validação de permissões no backend e frontend.

## Impact

- **Backend (Edge Function)**: `api-work` receberá uma nova ação `updateActivity` que validará a role do usuário e atualizará o registro na tabela `activities` e seus respectivos `activity_attachments`.
- **Frontend (React)**: `TaskDetail.tsx` e `ActivityCard.tsx` exibirão o botão de edição apenas para usuários autorizados. Um modal ou formulário de edição será criado para atualizar os campos.
- **Banco de Dados**: Criação de logs de auditoria automatizados após atualizações.
