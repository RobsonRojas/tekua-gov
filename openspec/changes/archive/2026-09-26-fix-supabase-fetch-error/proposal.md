## Why

Ao tentar executar as migrations locais no Supabase (`npx supabase db push` ou `npx supabase migration up`), o CLI retorna `Error: Failed to fetch (api.supabase.com)`, impedindo que a tabela `ai_chat_sessions` (e outras migrations pendentes) seja aplicada ao banco de dados de produção. O projeto não consegue acessar a API do Supabase Cloud, possivelmente por problema de autenticação, rede ou configuração do CLI.

## What Changes

- Diagnóstico e correção do problema que impede o CLI do Supabase de conectar à API `api.supabase.com`.
- Garantir que as migrations pendentes (especialmente `20260922171900_add_ai_chat_sessions.sql`) sejam aplicadas com sucesso no projeto de produção.
- Como fallback, documentar o procedimento para aplicar a migration manualmente via SQL Editor do Dashboard do Supabase, caso o CLI não consiga ser corrigido rapidamente.

## Capabilities

### New Capabilities
*(Nenhuma capacidade nova de produto — este é um fix de infraestrutura de deploy)*

### Modified Capabilities
*(Nenhuma — sem mudanças de comportamento no sistema)*

## Impact

- Supabase CLI e autenticação local (`supabase login` / token).
- Migrations SQL pendentes no banco de dados de produção.
- Potencialmente o arquivo `.env` ou configurações de rede/proxy do ambiente de desenvolvimento.
