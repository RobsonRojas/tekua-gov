# notifications Specification

## Purpose
TBD - created by archiving change push-notifications. Update Purpose after archive.
## Requirements
### Requirement: Consentimento e Inscrição Push
O sistema SHALL permitir que o usuário gerencie seu consentimento para receber alertas proativos.

#### Scenario: Solicitação de Permissão
- **WHEN** o usuário acessa o dashboard após o primeiro acesso.
- **THEN** o sistema SHALL exibir um banner ou modal solicitando permissão para envio de notificações push.

#### Scenario: Registro de Subscrição
- **WHEN** o usuário aceita a permissão no navegador.
- **THEN** o sistema SHALL gerar as chaves de subscrição e registrá-las na tabela `push_subscriptions` no Supabase vinculadas ao seu perfil.

### Requirement: Exibição de Notificação em Segundo Plano
O sistema SHALL entregar notificações visuais ao usuário, mesmo que o portal esteja fechado.

#### Scenario: Recebimento de Push
- **WHEN** uma Edge Function dispara um evento de push para o endpoint do usuário.
- **THEN** o Service Worker SHALL interceptar o evento e exibir uma notificação nativa com título, corpo e ícone da Tekuá.

#### Scenario: Ação ao Clicar na Notificação
- **WHEN** o usuário clica na notificação exibida.
- **THEN** o navegador SHALL abrir o portal Tekua e focar na aba correspondente, redirecionando para a rota especificada nos metadados da mensagem (ex: `/voting`).

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Email Notification Templates
O sistema SHALL suportar templates de email dinâmicos para diferentes tipos de alertas de governança.

#### Scenario: Rendering Task Notification Email
- **WHEN** o motor de notificações processa um alerta de "Nova Demanda".
- **THEN** o email enviado SHALL conter o título da demanda, o valor sugerido em Surreais e um link direto para a tarefa no portal.

### Requirement: Multi-channel Delivery (Push and Email)
O sistema SHALL tentar entregar notificações via push e email simultaneamente para garantir visibilidade.

#### Scenario: Redundant Delivery
- **WHEN** um evento de alta prioridade (como tarefa finalizada) é processado.
- **THEN** o sistema SHALL disparar tanto a notificação Web Push quanto o email transacional.

