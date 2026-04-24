## 1. Banco de Dados e Infraestrutura

- [ ] 1.1 Criar tabela `governance_policies` com campos para categoria, valor mínimo, horas de bloqueio e flag de auditoria.
- [ ] 1.2 Adicionar colunas `requires_audit`, `audit_status` e `auditor_id` na tabela `activities`.
- [ ] 1.3 Criar migração para popular a tabela `governance_policies` com regras padrão (ex: Task > 24h, Especial > Manual).

## 2. Lógica de Negócio (Backend)

- [ ] 2.1 Atualizar a função `fn_set_payout_lock` para consultar a tabela de políticas e aplicar as regras dinâmicas.
- [ ] 2.2 Modificar a função de cálculo de saldo (`get_available_balance`) para considerar o `audit_status`.
- [ ] 2.3 Criar RPC `approve_payout(activity_id)` acessível apenas por administradores.

## 3. Interface Administrativa (Frontend)

- [ ] 3.1 Desenvolver a página de "Auditoria de Payouts" listando atividades com `audit_status = 'pending'`.
- [ ] 3.2 Implementar o modal de revisão com detalhes da atividade e botões de Aprovar/Rejeitar.
- [ ] 3.3 Adicionar indicadores visuais no perfil do usuário para saldos bloqueados por auditoria.

## 4. Validação e Testes

- [ ] 4.1 Validar que atividades pequenas continuam com o lock padrão de 24h.
- [ ] 4.2 Testar o bloqueio manual: o saldo não deve ser liberado mesmo após `available_at` sem aprovação do admin.
- [ ] 4.3 Verificar se o log de auditoria captura as ações de aprovação manual.
