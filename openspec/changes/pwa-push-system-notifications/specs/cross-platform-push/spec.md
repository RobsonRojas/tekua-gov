## MODIFIED Requirements

### Requirement: Entrega Específica por Plataforma
O sistema SHALL formatar e entregar o payload de notificação de acordo com as exigências técnicas da plataforma de destino, garantindo que as notificações Web Push sejam exibidas corretamente no PWA instalado em Android e iOS.

#### Scenario: Roteamento de Notificação Push
- **WHEN** uma notificação é gerada para um usuário com múltiplos dispositivos registrados
- **THEN** o sistema SHALL enviar a mensagem via protocolo Web Push para os registros de navegador e via gateway mobile apropriado (ex: FCM) para dispositivos móveis registrados
- **AND** para registros Web Push (PWA), o payload SHALL ser formatado para exibição nativa no sistema operacional

#### Scenario: Notificação exibida em PWA instalado
- **WHEN** uma notificação Web Push é enviada para um dispositivo com PWA instalado
- **THEN** o Service Worker SHALL exibir a notificação usando `self.registration.showNotification` com `icon`, `badge` e `data.url` configurados
- **AND** ao clicar, a aplicação SHALL abrir/focar no modo standalone na rota correta
