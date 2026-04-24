## ADDED Requirements

### Requirement: Automação de Pagamento de Contribuições
O sistema **SHALL** executar a transferência automática de Surreais assim que o consenso comunitário for atingido.

#### Scenario: Pagamento automático após threshold
- **WHEN** O número de confirmações únicas de uma contribuição atinge o valor `min_confirmations`.
- **THEN** A transação de transferência da Tesouraria para o autor é criada automaticamente pelo sistema.

#### Scenario: Atualização de status da contribuição
- **WHEN** O pagamento automático é concluído com sucesso.
- **THEN** O status da contribuição muda para `completed` e o autor recebe uma notificação.

#### Scenario: Falha no pagamento automático
- **WHEN** A Tesouraria está sem saldo ou ocorre erro na função RPC.
- **THEN** A contribuição permanece com status `pending` e uma notificação de erro é gerada para auditoria administrativa.

#### Scenario: Auditoria de transação
- **WHEN** O pagamento automático ocorre.
- **THEN** A transação deve conter no campo `description` o ID da contribuição originária para rastreio completo.
