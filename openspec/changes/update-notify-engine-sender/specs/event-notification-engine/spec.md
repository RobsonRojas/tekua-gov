## ADDED Requirements

### Requirement: Remetente Oficial
O sistema SHALL usar `gov@tekua.com.br` como o endereço de email de remetente para todas as notificações disparadas pelo motor de notificações.

#### Scenario: Envio de Notificação por Email
- **WHEN** o motor de notificações despacha um email via provedor externo (ex: Resend)
- **THEN** o cabeçalho `from` SHALL estar configurado como `gov@tekua.com.br`, mantendo o nome "Tekuá Governança" como identificador visual.
