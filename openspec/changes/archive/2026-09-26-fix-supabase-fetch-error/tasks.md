## 1. Reconectar CLI do Supabase

- [x] 1.1 Executar `npx supabase login` no terminal e completar o fluxo de autenticação no browser.
- [x] 1.2 Verificar se o projeto está vinculado: `npx supabase projects list` (confirmar que o projeto `tekua-gov` aparece).
- [x] 1.3 Se necessário, re-vincular: `npx supabase link --project-ref <ref>`. *(Já vinculado — linked: true)*

## 2. Aplicar as Migrations Pendentes

- [x] 2.2 Se o CLI continuar falhando com `Failed to fetch`: abrir o SQL Editor no Dashboard (`https://supabase.com/dashboard/project/<ref>/sql/new`).
- [x] 2.3 Copiar e executar o conteúdo de `supabase/migrations/20260922171900_add_ai_chat_sessions.sql` no SQL Editor.

