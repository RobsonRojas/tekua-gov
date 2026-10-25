## Purpose

Garantir que as notificações push geradas pelo sistema de notificações do portal sejam exibidas como notificações do sistema (notification tray) nos dispositivos Android e iOS quando o aplicativo estiver instalado como PWA, com comportamento correto ao clicar para abrir o app na rota correspondente.

## ADDED Requirements

### Requirement: Exibição de Notificações do Sistema em PWA
O sistema SHALL exibir notificações push como notificações do sistema (usando `Notification API` via Service Worker) quando o aplicativo estiver instalado como PWA ou em segundo plano, garantindo apresentação nativa no Android e no iOS.

#### Scenario: Notificação recebida com app em segundo plano
- **WHEN** uma notificação push é enviada pelo sistema e o aplicativo está em segundo plano ou fechado (mas instalado como PWA)
- **THEN** o sistema SHALL exibir uma notificação do sistema com título, corpo e ícone adequados

#### Scenario: Notificação recebida com app aberto em aba
- **WHEN** uma notificação push é enviada e o aplicativo está aberto em uma aba do navegador
- **THEN** o sistema SHALL ainda exibir a notificação do sistema (quando aplicável) para garantir visibilidade ao usuário

### Requirement: Clique na Notificação Abre o PWA na Rota Correta
Ao clicar em uma notificação do sistema, o aplicativo SHALL ser aberto ou focado no modo correto (standalone para PWA instalado) e direcionado para a URL/rota especificada no payload da notificação.

#### Scenario: Abrir app instalado em modo standalone
- **WHEN** o usuário clica em uma notificação push enquanto o PWA está instalado
- **THEN** o sistema SHALL abrir ou focar a instância do app em modo standalone
- **AND** SHALL navegar para a rota `url` fornecida no payload da notificação

#### Scenario: Abrir em nova janela se app não estiver aberto
- **WHEN** o usuário clica em uma notificação push e não há nenhuma janela/instância do app aberta
- **THEN** o sistema SHALL abrir uma nova janela/instância do PWA apontando para a rota correta

### Requirement: Payload Compatível com Service Worker
O payload enviado pelo `notify-engine` SHALL conter campos compatíveis com o Service Worker para exibição e navegação (`title`, `body`, `url` ou `data.url`).

#### Scenario: Payload com campos padronizados
- **WHEN** o `notify-engine` envia uma notificação push
- **THEN** o payload SHALL incluir `title`, `body` e uma URL de destino (`url` ou `data.url`) utilizável pelo Service Worker

### Requirement: Tratamento de Subscrições Expiradas
O Service Worker e o `notify-engine` SHALL lidar com subscrições push expiradas ou inválidas, removendo-as da base quando apropriado.

#### Scenario: Subscrição inválida ao enviar
- **WHEN** o envio push falhar com status 410 ou 404
- **THEN** o sistema SHALL remover a subscrição correspondente da tabela `push_subscriptions`
