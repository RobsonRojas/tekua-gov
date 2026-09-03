# surreal-receipt-notifications Specification

## Purpose
Permite que todos os membros cadastrados recebam notifica��es no aplicativo e por email quando outro membro recebe surreais, incentivando reconhecimento social e engajamento comunit�rio.
## Requirements
### Requirement: Broadcast de notifica��o quando surreais s�o recebidos
O sistema SHALL disparar uma notifica��o broadcast para todos os membros cadastrados quando um membro recebe uma transa��o de surreais (recebimento).

#### Scenario: Disparo de notifica��o ao receber surreais
- **WHEN** uma nova transa��o com `from_id` NOT NULL (recebimento, n�o minting) � criada na tabela `transactions`
- **THEN** o sistema SHALL criar notifica��es na tabela `notifications` para cada membro cadastrado (exceto o remetente), com tipo `surreal_receipt`

#### Scenario: Notifica��o inclui dados estruturados
- **WHEN** uma notifica��o de tipo `surreal_receipt` � criada
- **THEN** o payload SHALL incluir: `transactionId`, `amount`, `senderName`, `recipientName`, `description`, `createdAt`

#### Scenario: Email transacional � enviado
- **WHEN** uma notifica��o de tipo `surreal_receipt` � criada
- **THEN** o sistema SHALL enviar um email transacional para cada membro listando quem ganhou surreais, o valor, e um link para a p�gina de recibo compartilhado

### Requirement: Notifica��o aponta para p�gina de recibo compartilhado
O sistema SHALL incluir um link que abre a p�gina de recibo compartilhado quando a notifica��o � clicada.

#### Scenario: Link em notifica��o app
- **WHEN** um membro clica em uma notifica��o `surreal_receipt` no aplicativo
- **THEN** o navegador SHALL navegar para `/share/surreal/:transactionId` exibindo os detalhes do recebimento

#### Scenario: Link em email
- **WHEN** um membro clica no link no email de notifica��o
- **THEN** o navegador SHALL abrir `/share/surreal/:transactionId` no portal

