## Why

A coluna/status `pending_approval` era usado para o fluxo de moderação do Work Wall, que já foi removido (conforme change `remove-moderation-column`). Manter esse valor órfão no enum `activity_status` é desnecessário - não é mais produzido pela aplicação e apenas mantém um valor legado no banco. Remover esse valor limpa o schema e evita seu uso acidental.

## What Changes

- Remover o valor `pending_approval` do enum `activity_status` do PostgreSQL
- Criar migração para recriar o tipo enum sem o valor `pending_approval`, convertendo e atualizando todas as dependências
- Garantir que nenhuma atividade permaneça com status `pending_approval` (já migradas no change anterior)
- **BREAKING**: remover completamente o valor `pending_approval` do enum - qualquer código que tente inserir esse valor irá falhar

## Capabilities

### New Capabilities
<!-- Nenhuma nova capability -->

### Modified Capabilities
- `activity-moderation`: remover completamente o valor `pending_approval` do enum de status, já que o fluxo de moderação foi totalmente removido

## Impact

- **Database**: enum `activity_status`, migração para recriar o tipo sem `pending_approval`
- **Backend**: sem mudanças esperadas - aplicação já não produz esse valor
- **Segurança**: previne uso acidental do valor legado
