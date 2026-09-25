## Context

Ver proposal.md — Why. A RPC `admin_adjust_wallet_balance` usa `SECURITY DEFINER` e é chamada pela Edge Function via `supabaseAdmin` (service role), que não propaga o JWT do usuário. Assim, `auth.uid()` retorna NULL dentro da função, fazendo a verificação de admin interna falhar. Como o bloco `WHEN OTHERS` captura tudo e retorna `{ success: false }`, o erro nunca fica visível.

## Goals / Non-Goals

**Goals:**
- Corrigir a RPC para não depender de `auth.uid()` (a verificação já ocorre na Edge Function antes de chamar a RPC).
- Corrigir a Edge Function para propagar erros `data.success === false` como HTTP 400.

**Non-Goals:**
- Alterar o frontend (`AdminPanel.tsx`) — ele já trata `error` da resposta corretamente.
- Reescrever a lógica de transferência.

## Decisions

**Remover verificação de admin da RPC:**  
A autorização já é checada na Edge Function (linhas 230-237 de `api-wallet/index.ts`) antes da chamada RPC. Manter uma segunda verificação via `auth.uid()` é um anti-pattern quando a função é chamada via service role. A RPC deve confiar que quem a chama (service role) já autorizou a operação.

**Alternativa rejeitada — Passar `admin_id` como parâmetro para verificar:**  
Aumentaria complexidade desnecessariamente. A autorização na Edge Function com o JWT do usuário é suficiente.

**Propagar erro na Edge Function (mesmo padrão de `mintCurrency`):**  
Adicionar `if (data && !data.success) throw new Error(data.error)` após a chamada RPC no case `adjustBalance`, exatamente como já existe no case `transfer` (linha 138).

## Risks / Trade-offs

- [Risco] Remover a verificação interna da RPC torna a função menos defensiva se chamada diretamente (fora da Edge Function) → **Mitigação:** manter comentário explícito na função SQL e a verificação na Edge Function. O acesso direto à RPC já é protegido por RLS do banco.

## Migration Plan

1. Criar migration SQL com `CREATE OR REPLACE FUNCTION admin_adjust_wallet_balance(...)` sem o bloco de verificação `auth.uid()`.
2. Corrigir `api-wallet/index.ts` — case `adjustBalance` — propagar `data.success`.
3. Deploy da Edge Function: `npx supabase functions deploy api-wallet`.
4. Aplicar migration: `npx supabase db push` (ou SQL Editor se CLI falhar).
5. Testar manualmente o ajuste de saldo no painel admin.
