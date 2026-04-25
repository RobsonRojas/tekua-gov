## 1. Banco de Dados e Infraestrutura

- [x] 1.1 Criar tabela `governance_policies` com campos para categoria, valor mínimo, horas de bloqueio e flag de auditoria.
- [x] 1.2 Adicionar colunas `requires_audit`, `audit_status` e `auditor_id` na tabela `activities`.
- [x] 1.3 Criar migração para popular a tabela `governance_policies` com regras padrão (ex: Task > 24h, Especial > Manual).

## 2. Lógica de Negócio (Backend)

- [x] 2.1 Atualizar a função `fn_set_payout_lock` para consultar a tabela de políticas e aplicar as regras dinâmicas.
- [x] 2.2 Modificar a função de cálculo de saldo (`get_available_balance`) para considerar o `audit_status`.
- [x] 2.3 Criar RPC `approve_payout(activity_id)` acessível apenas por administradores.

## 3. Interface Administrativa (Frontend)

- [x] 3.1 Desenvolver a página de "Auditoria de Payouts" listando atividades com `audit_status = 'pending'`.
- [x] 3.2 Implementar o modal de revisão com detalhes da atividade e botões de Aprovar/Rejeitar.
- [x] 3.3 Adicionar indicadores visuais no perfil do usuário para saldos bloqueados por auditoria.

## 4. Validação e Testes

- [x] 4.1 Validar que atividades pequenas continuam com o lock padrão de 24h.
- [x] 4.2 Testar o bloqueio manual: o saldo não deve ser liberado mesmo após `available_at` sem aprovação do admin.
- [x] 4.3 Verificar se o log de auditoria captura as ações de aprovação manual.
