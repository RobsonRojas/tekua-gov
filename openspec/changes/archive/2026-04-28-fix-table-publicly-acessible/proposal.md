## Why

O Supabase detectou que o Row-Level Security (RLS) não está habilitado em tabelas críticas do schema `public`. Sem RLS, qualquer pessoa com a URL do projeto pode acessar, modificar ou excluir dados diretamente, o que constitui uma vulnerabilidade de segurança crítica ("rls_disabled_in_public").

## What Changes

- Habilitação obrigatória de Row-Level Security (RLS) na tabela `ledger_entries`.
- Implementação de políticas de acesso restritivas para o sistema de contabilidade (ledger):
    - **SELECT**: Permitir que usuários visualizem apenas suas próprias entradas de ledger (através da associação com `wallets.profile_id`) e que administradores visualizem tudo.
    - **INSERT/UPDATE/DELETE**: Bloqueio total para usuários (acesso permitido apenas via funções de sistema `SECURITY DEFINER`).
- Auditoria de segurança em todas as tabelas do schema `public` para garantir que nenhuma outra tabela esteja exposta.

## Capabilities

### Modified Capabilities
- `secure-data-access`: Atualização das políticas de segurança para garantir o isolamento de dados financeiros.
- `wallet-system`: Proteção dos registros de auditoria do ledger para evitar manipulação externa de saldos.

## Impact

- **Segurança**: Eliminação da vulnerabilidade crítica apontada pelo Supabase.
- **Banco de Dados**: Nova migração para aplicar as políticas de RLS.
- **Performance**: Pequeno overhead de processamento devido à avaliação de políticas de RLS em consultas de saldo/extrato.
