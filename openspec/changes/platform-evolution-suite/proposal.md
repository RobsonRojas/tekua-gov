## Why

A plataforma Tekua atingiu maturidade funcional, mas requer refinamentos críticos de segurança financeira, reatividade da interface e blindagem da inteligência artificial para se tornar um produto de nível industrial pronto para escala.

## What Changes

- **Segurança Financeira**: Introdução de um período de carência (Lock Period) para payouts de atividades, permitindo auditoria humana antes da liberação dos créditos.
- **Auditoria**: Implementação de um log de auditoria imutável para ações críticas.
- **Reatividade Elite**: Sincronização em tempo real do perfil e saldo do usuário através do `AuthContext` e uso de Skeletons Screens para carregamento fluído.
- **IA Robusta**: Migração da lógica do Assistente IA para Edge Functions do Supabase, ocultando chaves de API e injetando filtros de segurança e contexto.

## Capabilities

### New Capabilities
- `platform-audit-system`: Motor de registro imutável de eventos de governança e finanças.
- `payout-lock-policy`: Regras de carência e liberação de créditos ganhos.
- `ai-secure-proxy`: Gateway seguro para interações com modelos de linguagem.

### Modified Capabilities
- `wallet-system`: Integração com o sistema de lock e atualização em tempo real.
- `work-registration`: Refinamento da UX de carregamento e feedback.

## Impact

- **Database**: Novas colunas em `activities` ou `payouts` para controle de tempo; nova tabela `audit_logs`.
- **Frontend**: Refatoração do `AuthContext`, criação de componentes `Skeleton`, atualização do `AIAgent`.
- **Backend**: Criação de Supabase Edge Functions.
