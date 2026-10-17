# notifications-hub Specification

## Purpose
TBD - created by archiving change system-notifications-hub. Update Purpose after archive.
## Requirements
### Requirement: Central de Notificações In-App
O sistema **SHALL** prover um hub centralizado para que os usuários visualizem alertas importantes sobre sua participação na plataforma.

#### Scenario: Recebimento de alerta de comentário
- **WHEN** Outro usuário comenta em uma pauta onde o usuário participou ou que o usuário criou.
- **THEN** Uma notificação é gerada e o ícone de sino no header exibe um indicador visual (badge).

#### Scenario: Navegação via notificação
- **WHEN** O usuário clica em uma notificação de "Atividade Confirmada".
- **THEN** O sistema redireciona o usuário diretamente para a página de detalhes da atividade correspondente.

#### Scenario: Limpeza de notificações
- **WHEN** O usuário clica em "Marcar todas como lidas".
- **THEN** O sistema atualiza o status de todos os alertas pendentes para `is_read: true` e remove o badge do header.

### Requirement: Notificações de Transferência Financeira
O sistema de notificações SHALL suportar o tipo de evento `finance` para alertas relacionados à carteira digital.

#### Scenario: Alerta de Recebimento de Surreais
- **WHEN** um usuário recebe uma transferência de Surreais.
- **THEN** uma notificação do tipo `finance` é gerada e o ícone de sino no header exibe um badge numérico atualizado.

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

