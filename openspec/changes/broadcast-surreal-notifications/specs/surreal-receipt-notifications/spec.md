## Purpose

Permite que todos os membros cadastrados recebam notificações no aplicativo e por email quando outro membro recebe surreais, incentivando reconhecimento social e engajamento comunitário.

## ADDED Requirements

### Requirement: Broadcast de notificação quando surreais são recebidos
O sistema SHALL disparar uma notificação broadcast para todos os membros cadastrados quando um membro recebe uma transação de surreais (recebimento).

#### Scenario: Disparo de notificação ao receber surreais
- **WHEN** uma nova transação com `from_id` NOT NULL (recebimento, não minting) é criada na tabela `transactions`
- **THEN** o sistema SHALL criar notificações na tabela `notifications` para cada membro cadastrado (exceto o remetente), com tipo `surreal_receipt`

#### Scenario: Notificação inclui dados estruturados
- **WHEN** uma notificação de tipo `surreal_receipt` é criada
- **THEN** o payload SHALL incluir: `transactionId`, `amount`, `senderName`, `recipientName`, `description`, `createdAt`

#### Scenario: Email transacional é enviado
- **WHEN** uma notificação de tipo `surreal_receipt` é criada
- **THEN** o sistema SHALL enviar um email transacional para cada membro listando quem ganhou surreais, o valor, e um link para a página de recibo compartilhado

### Requirement: Notificação aponta para página de recibo compartilhado
O sistema SHALL incluir um link que abre a página de recibo compartilhado quando a notificação é clicada.

#### Scenario: Link em notificação app
- **WHEN** um membro clica em uma notificação `surreal_receipt` no aplicativo
- **THEN** o navegador SHALL navegar para `/share/surreal/:transactionId` exibindo os detalhes do recebimento

#### Scenario: Link em email
- **WHEN** um membro clica no link no email de notificação
- **THEN** o navegador SHALL abrir `/share/surreal/:transactionId` no portal
