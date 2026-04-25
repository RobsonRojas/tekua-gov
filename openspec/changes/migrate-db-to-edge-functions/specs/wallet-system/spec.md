## MODIFIED Requirements

### Requirement: Transferência P2P e Rastreabilidade
O sistema SHALL possibilitar o envio de moedas entre membros da comunidade de forma segura e manter rastreabilidade com as atividades de governança. Toda lógica de transferência MUST ser processada exclusivamente no servidor (Edge Functions) para garantir a integridade.

#### Scenario: Envio de Moedas e Vínculo de Atividade
- **WHEN** o remetente solicita o envio informando o destinatário, valor, justificativa e ID da atividade via API segura.
- **THEN** o sistema SHALL validar o saldo e permissões no servidor, debitar o valor da carteira de origem e creditar na carteira de destino de forma atômica, registrando o `activity_id` para auditoria.

#### Scenario: Saldo Insuficiente
- **WHEN** o remetente tenta enviar um valor maior do que possui em saldo.
- **THEN** a Edge Function SHALL impedir a operação e retornar um erro estruturado de saldo insuficiente.
