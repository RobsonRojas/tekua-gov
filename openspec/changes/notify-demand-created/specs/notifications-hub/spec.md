## ADDED Requirements

### Requirement: Notificação ao criar demanda
Quando uma demanda (atividade) é criada, o sistema **SHALL** entregar uma notificação in-app aos destinatários relevantes através do hub de notificações. A notificação **SHALL** conter `title` e `message` no formato i18n (`{ pt, en }`) e **SHALL** direcionar o usuário para a página da demanda no Work Wall. Em um broadcast, o sistema **SHALL NOT** notificar o próprio criador da demanda.

#### Scenario: Notificar executores designados
- **WHEN** uma demanda é criada com um ou mais executores designados
- **THEN** cada executor designado recebe uma notificação in-app sobre a nova demanda

#### Scenario: Broadcast para membros excluindo o criador
- **WHEN** uma demanda é criada sem executores designados
- **THEN** os membros da plataforma são notificados, exceto o usuário que criou a demanda

#### Scenario: Formato i18n da notificação
- **WHEN** a notificação de demanda criada é armazenada
- **THEN** os campos `title` e `message` são objetos JSONB com chaves `pt` e `en`, permitindo que o frontend os renderize no idioma ativo

#### Scenario: Entrega por múltiplos canais
- **WHEN** uma demanda é criada e existem inscrições de push/email configuradas para os destinatários
- **THEN** o sistema grava a notificação in-app e também tenta a entrega por push e email

#### Scenario: Falha isolada por destinatário
- **WHEN** a entrega falha para um destinatário específico
- **THEN** o sistema continua processando e entregando as notificações aos demais destinatários
