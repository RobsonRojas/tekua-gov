# Spec: wallet-admin-operations

## Comportamento Atual (Buggy)

- `adjustBalance` retorna HTTP 200 mesmo quando a operação falha internamente.
- O campo `data.success: false` é silenciado — o frontend não exibe nenhum erro ao usuário.

## Comportamento Esperado

### Ajuste de Saldo (`adjustBalance`)

**Pré-condições:**
- O usuário autenticado deve ter `role = 'admin'` ou `'admin'` no array `roles`.
- `recipientId` deve ser um UUID válido de um usuário com carteira registrada.
- `amount` deve ser diferente de zero.

**Fluxo de sucesso:**
1. A Edge Function verifica admin antes de chamar a RPC.
2. A RPC executa a transferência atômica entre a carteira tesouro e a carteira do membro.
3. Retorna `{ data: { success: true }, error: null }` com HTTP 200.

**Fluxo de erro (qualquer falha):**
1. A Edge Function deve propagar erros da RPC ao cliente.
2. Se `data.success === false`, a Edge Function deve retornar HTTP 400 com `{ data: null, error: "<mensagem>" }`.
3. O frontend exibe a mensagem de erro ao usuário.

**Erros esperados mapeados:**
| Condição | Mensagem |
|---|---|
| Carteira tesouro não encontrada | `Treasury wallet not found` |
| Carteira do usuário não encontrada | `Target user wallet not found` |
| Saldo insuficiente para débito | `Insufficient balance in user wallet` |
| Amount zero | `Amount cannot be zero` |
