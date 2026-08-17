## ADDED Requirements

### Requirement: Suporte a tipo de notificação "surreal_receipt"
O sistema SHALL estender o schema de tipos de notificação para incluir `surreal_receipt`, permitindo notificações estruturadas de recebimento de surreais.

#### Scenario: Criar notificação de tipo surreal_receipt
- **WHEN** o sistema cria uma notificação com `type: 'surreal_receipt'`
- **THEN** a notificação SHALL armazenar payload estruturado com campos: `transactionId`, `amount`, `senderName`, `recipientName`, `description`

#### Scenario: Email para tipo surreal_receipt
- **WHEN** uma notificação de tipo `surreal_receipt` é processada para envio de email
- **THEN** o sistema SHALL usar template de email específico com assunto como "Surreais ganhos na comunidade!" e corpo destacando o valor, remetente e convite ao work-wall

### Requirement: Link na notificação aponta para página compartilhada
O sistema SHALL gerar links para a página de recibo público (`/share/surreal/:transactionId`) tanto em notificações app quanto em emails.

#### Scenario: Notificação app com link
- **WHEN** uma notificação `surreal_receipt` é exibida no app
- **THEN** o link da notificação SHALL navegar para `/share/surreal/:transactionId`

#### Scenario: Email com link para recibo
- **WHEN** um email de tipo `surreal_receipt` é enviado
- **THEN** o CTA "Ver recibo" no email SHALL apontar para `${baseUrl}/share/surreal/:transactionId`
