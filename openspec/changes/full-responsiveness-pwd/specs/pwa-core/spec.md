## MODIFIED Requirements

### Requirement: Application Installability (pwa-core)
O sistema **SHALL** cumprir todos os requisitos técnicos para ser considerado "instalável" pelos navegadores modernos (Chrome, Safari, Edge) e **SHALL** oferecer um prompt de instalação explícito dentro da aplicação.

#### Scenario: Installing on Android/Chrome
- **WHEN** o usuário acessa o portal via Chrome no Android.
- **THEN** o navegador **SHALL** oferecer o prompt de instalação (A2HS).
- **AND** a aplicação instalada **SHALL** abrir em modo `standalone` (sem barra de endereço do navegador).

#### Scenario: Installing on iOS/Safari
- **WHEN** o usuário acessa o portal via Safari no iPhone.
- **THEN** o sistema **SHALL** fornecer indicação clara ou componente de suporte para a ação "Adicionar à Tela de Início".

#### Scenario: Explicit Internal Install Prompt
- **WHEN** a aplicação detecta que é instalável mas ainda não está instalada.
- **THEN** o sistema **SHALL** exibir um botão ou banner de "Instalar Aplicativo" para facilitar a descoberta da funcionalidade pelo usuário.
