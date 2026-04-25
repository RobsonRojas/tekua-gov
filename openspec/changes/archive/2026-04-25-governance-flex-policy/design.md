## Context

Atualmente, o sistema utiliza um intervalo fixo de 24 horas (`now() + interval '24 hours'`) no trigger `tr_set_payout_lock`. Não há uma forma de diferenciar o risco entre uma pequena contribuição e um grande saque do tesouro.

## Goals / Non-Goals

**Goals:**
- Implementar uma tabela de políticas para gerenciar períodos de carência.
- Adicionar suporte para auditoria manual obrigatória em payouts específicos.
- Garantir retrocompatibilidade (padrão 24h se nenhuma política for encontrada).

**Non-Goals:**
- Implementar um sistema de aprovação multifirma completo (apenas flag admin).
- Alterar o sistema de moedas ou transações base.

## Decisions

### 1. Tabela `governance_policies`
- **Racional**: Centralizar as regras em uma tabela permite ajustes sem alterar código de triggers ou funções.
- **Campos**: `id`, `category` (ex: 'task', 'treasury'), `min_amount`, `lock_hours`, `requires_manual_audit`.

### 2. Extensão da tabela `activities`
- **Racional**: Precisamos rastrear se uma atividade específica foi auditada.
- **Novas Colunas**:
    - `requires_audit` (BOOLEAN): Definido no momento da criação/validação baseado na política.
    - `audit_status` (TEXT): `pending`, `approved`, `rejected`.
    - `auditor_id` (UUID): Referência ao admin que realizou a auditoria.

### 3. Lógica do Trigger `tr_set_payout_lock`
- O trigger buscará a política correspondente (`type` e `reward_amount`).
- Se encontrar, aplicará o `lock_hours`. Caso contrário, mantém o padrão de 24h.
- Se `requires_manual_audit` for true, o saldo disponível só será liberado após `audit_status = 'approved'`, independentemente do tempo passado.

## Risks / Trade-offs

- **[Risco] Overhead de Consulta no Trigger** → **[Mitigação]** A tabela de políticas será pequena (poucas linhas), permitindo consultas rápidas via indexação por categoria.
- **[Risco] Bloqueio Indesejado** → **[Mitigação]** Definir políticas padrão generosas e permitir que admins forcem a liberação manual se necessário.
