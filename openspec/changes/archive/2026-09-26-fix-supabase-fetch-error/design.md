## Context

Ver proposal.md — Why. O Supabase CLI falha com `Error: Failed to fetch (api.supabase.com)` ao tentar fazer `db push`. Este erro tipicamente indica:
1. Token de autenticação do CLI expirado ou ausente (`supabase login` não realizado).
2. Problema de rede/proxy bloqueando o domínio `api.supabase.com`.
3. `SUPABASE_DB_PASSWORD` ou `project-ref` incorretos na configuração local.

Como fallback garantido, o migration SQL pode ser aplicado manualmente via SQL Editor no dashboard do Supabase.

## Goals / Non-Goals

**Goals:**
- Aplicar a migration `20260922171900_add_ai_chat_sessions.sql` no banco de produção.
- Documentar como reliabilitar o CLI do Supabase localmente para pushes futuros.

**Non-Goals:**
- Alterar a estrutura do banco de dados.
- Modificar o código da aplicação.

## Decisions

**Abordagem primária: reconectar o CLI**  
Executar `npx supabase login` para renovar o token de acesso à API. Se falhar, verificar proxy/firewall.

**Abordagem secundária (fallback): SQL Editor manual**  
Copiar o conteúdo da migration e executar diretamente no SQL Editor do Supabase Dashboard (`https://supabase.com/dashboard/project/<ref>/sql/new`). É equivalente ao push via CLI e não requer conectividade com `api.supabase.com`.

**Por que não tentar recriar o projeto local?**  
O link (`supabase link`) pode sofrer do mesmo problema de fetch. O SQL Editor é sempre acessível via HTTPS ao Dashboard e não depende do CLI.

## Risks / Trade-offs

- [Risco] O SQL Editor manual não registra a migration na tabela interna `supabase_migrations.schema_migrations`, podendo causar conflito futuro quando o CLI voltar a funcionar → **Mitigação:** Após executar o SQL no Dashboard, executar `npx supabase migration repair --status applied 20260922171900` localmente para marcar a migration como aplicada.

## Migration Plan

1. Tentar reconectar o CLI: `npx supabase login`.
2. Se o login funcionar: `npx supabase db push`.
3. Se ainda falhar: aplicar SQL manualmente no Dashboard + repair local.
