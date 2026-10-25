## MODIFIED Requirements

### Requirement: Central de Notificações In-App
O sistema **SHALL** prover um hub centralizado para que os usuários visualizem alertas importantes sobre sua participação na plataforma, e **SHALL** também gerar notificações push do sistema quando o usuário tiver push habilitado e o app estiver em segundo plano ou instalado como PWA.

#### Scenario: Recebimento de alerta de comentário
- **WHEN** Outro usuário comenta em uma pauta onde o usuário participou ou que o usuário criou.
- **THEN** Uma notificação é gerada e o ícone de sino no header exibe um indicador visual (badge).
- **AND** se o usuário tiver push habilitado, uma notificação do sistema SHALL ser exibida via PWA

#### Scenario: Navegação via notificação
- **WHEN** O usuário clica em uma notificação de "Atividade Confirmada".
- **THEN** O sistema redireciona o usuário diretamente para a página de detalhes da atividade correspondente.
- **AND** quando clicada a partir de uma notificação push do sistema, o PWA SHALL ser aberto/focado na mesma rota

#### Scenario: Limpeza de notificações
- **WHEN** O usuário clica em "Marcar todas como lidas".
- **THEN** O sistema atualiza o status de todos os alertas pendentes para `is_read: true` e remove o badge do header.

### Requirement: Entrega por múltiplos canais
Quando uma demanda é criada e existem inscrições de push/email configuradas para os destinatários, o sistema grava a notificação in-app e também tenta a entrega por push e email. As notificações push SHALL ser exibidas como notificações do sistema quando o destinatário tiver o PWA instalado.

#### Scenario: Notificação push exibida como notificação do sistema em PWA instalado
- **WHEN** uma notificação push é enviada para um destinatário com PWA instalado em Android ou iOS
- **THEN** a notificação SHALL ser exibida na bandeja de notificações do sistema operacional
- **AND** ao clicar, o aplicativo SHALL abrir em modo standalone na rota correspondente
