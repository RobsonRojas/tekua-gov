## Context

Atualmente, na tela de carteira (`Wallet.tsx`), o usuário precisa digitar manualmente o email do destinatário ao realizar uma transferência (P2P). Isso é suscetível a erros de digitação e não oferece uma boa experiência de usuário, visto que o usuário precisa saber de cor o email corporativo do destinatário.

A Edge Function `api-members` já possui o método `fetchUsers` que retorna a lista de membros (`id, full_name, email, avatar_url`), acessível também para não-administradores (com RLS aplicada para retornar apenas campos públicos). 

## Goals / Non-Goals

**Goals:**
- Substituir o campo de texto livre de email por um componente de autocompletar e busca na interface de transferência de carteira.
- Permitir que o remetente selecione visualmente o destinatário (vendo nome, email e possivelmente avatar).
- Utilizar o email do usuário selecionado para enviar a requisição à Edge Function `api-wallet` (método `transfer`), mantendo a compatibilidade da API existente.

**Non-Goals:**
- Alterar a API de transferência (`api-wallet/transfer`) para receber `userId` em vez de `email` (vamos manter `email` para não introduzir breaking changes no backend, uma vez que o email já é validado e funciona bem).
- Implementar paginação ou lazy loading complexo para a busca. Como a plataforma Tekuá é fechada, buscar todos os usuários de uma vez no frontend e filtrar no cliente é perfeitamente aceitável e tem melhor UX.

## Decisions

### 1. Componente de UI: Autocomplete do MUI
**Decisão**: Usar o componente `<Autocomplete>` do Material UI em substituição ao `<TextField>` de email. 
**Rationale**: O MUI Autocomplete permite renderizar opções customizadas (ex: mostrar nome, email e avatar) e filtrar client-side (digitando o nome ou o email). É o padrão adotado na aplicação.

### 2. Busca de Usuários no Frontend
**Decisão**: Quando o modal de transferência for aberto, invocar `apiClient.invoke('api-members', 'fetchUsers')` para carregar a lista de usuários disponíveis.
**Rationale**: Reutiliza a função existente. Filtra o próprio usuário da lista para evitar que a pessoa tente transferir para si mesma. A chamada só ocorrerá sob demanda (quando o modal abrir).

### 3. Integração com a API
**Decisão**: O `Autocomplete` será configurado para alterar o estado `recipientEmail` com o valor do email do membro selecionado.
**Rationale**: Isso garante 100% de compatibilidade com a função `handleTransfer` já implementada no `Wallet.tsx`, que espera a variável `recipientEmail`.

## Risks / Trade-offs

- **Risk**: Performance se o número de usuários for muito grande (>1000). 
  → **Mitigação**: Para o contexto da Tekuá (comunidade fechada/associação), o número de usuários ativos carregados de uma vez no frontend não será um problema de performance no React.
- **Risk**: Exposição de dados de usuários.
  → **Mitigação**: O endpoint `fetchUsers` já protege os dados, retornando apenas campos básicos (nome, email, avatar) para não-admins, de acordo com as políticas do Supabase/Edge Functions.
