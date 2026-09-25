## 1. Banco de Dados (RPC Fix)

- [x] 1.1 Criar migration SQL `CREATE OR REPLACE FUNCTION admin_adjust_wallet_balance(...)` removendo o bloco de verificação via `auth.uid()` (linhas 130–138 da função atual), mantendo toda a lógica de transferência intacta.

## 2. Edge Function `api-wallet`

- [x] 2.1 No case `adjustBalance` (linha ~248 de `index.ts`), adicionar após `if (error) throw error`: verificação `if (data && !data.success) throw new Error(data.error || 'Wallet adjustment failed')`.

## 3. Deploy e Teste

- [x] 3.1 Executar `npm run build` para validar o frontend (sem mudanças de código TS, apenas garantia).
- [x] 3.2 Deploy da Edge Function: `npx supabase functions deploy api-wallet`.
- [x] 3.3 Aplicar migration ao banco de produção via `npx supabase db push` ou SQL Editor.
- [ ] 3.4 Testar manualmente: abrir painel Admin → Ajustar Saldo de um membro → confirmar que o saldo muda e a mensagem de sucesso aparece.
