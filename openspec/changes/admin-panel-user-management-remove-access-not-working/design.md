## Context

O fluxo de remoção de usuários no Painel Admin envolve:
1. Clique no botão de menu (`MoreVertical`).
2. Abertura do menu MUI e seleção de um usuário.
3. Clique em "Remove Access" no menu.
4. Exibição de um `Dialog` de confirmação.
5. Execução do handler `handleRemoveMember` que chama a Edge Function `api-members`.

O problema relatado sugere que o passo 4 não está recebendo os dados do usuário corretamente e o passo 5 está falhando sem feedback adequado.

## Goals / Non-Goals

**Goals:**
- Restaurar a funcionalidade de remoção de acesso.
- Corrigir a exibição do nome do usuário no diálogo de confirmação.
- Garantir que o administrador receba feedback de sucesso ou erro claro.

**Non-Goals:**
- Alterar as permissões de quem pode remover usuários (mantendo restrito a `admin`).
- Implementar "soft delete" (a remoção deve permanecer permanente conforme o design atual).

## Decisions

- **Persistência de Estado:** Garantir que o `selectedUser` não seja limpo ao fechar o menu âncora, apenas após a conclusão da ação ou fechamento do diálogo.
- **UX de Deleção:** Manter o `Dialog` aberto enquanto a `actionLoading` for verdadeira, desabilitando os botões, e fechar apenas em caso de sucesso. Isso evita que o usuário fique sem saber se a ação foi disparada se a rede estiver lenta.
- **Payload da API:** Validar que o `apiClient.invoke` está enviando o `targetUserId` correto.

## Risks / Trade-offs

- [Integridade Referencial] → A deleção de um usuário no Auth pode falhar se houver chaves estrangeiras sem `ON DELETE CASCADE`. *Mitigação:* Realizar uma varredura nas migrations para identificar tabelas bloqueantes e aplicar o cascade onde necessário.
- [Segurança] → Remover o próprio acesso. *Mitigação:* Manter a trava `selectedUser?.id === authUser?.id` no frontend e backend.
