## 1. Backend Updates

- [x] 1.1 Atualizar a função RPC `confirm_activity` (ou a lógica na API, caso seja feita na camada do servidor) para avaliar se o `user.role` é `admin`.
- [x] 1.2 Implementar a condição de bypass para permitir a confirmação de tarefas `requester_approval` por administradores que não são o `requester_id`.

## 2. Frontend Updates

- [x] 2.1 Atualizar o componente de visualização/detalhes da tarefa no mural para não desabilitar o botão de confirmação se o usuário logado for `admin`.
- [x] 2.2 Garantir que a UI deixe claro que o administrador está confirmando (se aplicável, feedback visual leve).
