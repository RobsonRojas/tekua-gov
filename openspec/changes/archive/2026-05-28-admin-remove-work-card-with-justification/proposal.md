## Why

Atualmente, não existe um mecanismo fácil e rastreável para administradores removerem cartões de demanda/trabalho do mural quando estes são incorretos, spam ou violam regras da comunidade. Precisamos permitir essa remoção rápida, exigindo uma justificativa para manter a transparência e integridade do processo de governança.

## What Changes

- Adição de um botão/ação de "Remover/Arquivar Demanda" disponível apenas para administradores nos cartões de trabalho.
- Ao clicar em remover, um modal será exibido exigindo que o admin insira uma justificativa.
- A justificativa e a exclusão da atividade serão salvas no banco de dados e no histórico de auditoria (Activity Management).

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin-activity-management`: Nova funcionalidade para exclusão justificada de demandas por administradores.
- `work-registration`: Mudança no fluxo do mural para ocultar ou deletar (soft-delete) tarefas removidas.

## Impact

- **Frontend**: Inserção da ação de exclusão no `WorkCard` (apenas para admins) e modal de justificativa.
- **Backend/RPC**: Criação ou atualização de RPC (`delete_activity_with_justification`) para processar a remoção, salvar a justificativa e registrar na tabela de auditoria.
