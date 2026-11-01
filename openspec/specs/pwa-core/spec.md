# pwa-core Specification

## Purpose
This specification defines the Progressive Web App (PWA) requirements for the platform, ensuring installability, offline resilience, and a native-like user experience on mobile and desktop devices.

## Requirements

### Requirement: Application Installability
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

### Requirement: Offline Resilience
O sistema **SHALL** permitir que a estrutura básica da interface seja carregada mesmo em condições de instabilidade ou ausência de conexão.

#### Scenario: Loading while offline
- **WHEN** o usuário abre a aplicação sem conexão com a internet.
- **THEN** o Service Worker **SHALL** servir os assets cacheados (HTML, JS, CSS, Fontes) para garantir que o shell da aplicação seja renderizado.

### Requirement: Branded Visual Identity (PWA)
A aplicação instalada **SHALL** manter a identidade visual da Tekuá desde o momento do lançamento no dispositivo.

#### Scenario: Splash Screen and Theme
- **WHEN** a aplicação é inicializada a partir do ícone na tela de início.
- **THEN** o sistema **SHALL** exibir uma splash screen configurada com o logotipo e as cores institucionais (background_color e theme_color).

### Requirement: Atualização Obrigatória do Aplicativo Instalado
O sistema SHALL garantir que o usuário sempre execute a versão mais recente do portal, bloqueando o uso da aplicação e exigindo o refresh sempre que uma nova versão do PWA estiver disponível no dispositivo.

#### Scenario: Usuário em versão obsoleta
- **WHEN** uma nova versão do PWA é publicada e detectada no dispositivo do usuário
- **THEN** o sistema SHALL exigir o refresh da aplicação antes de permitir o uso do portal
- **AND** SHALL informar o usuário sobre a necessidade da atualização

#### Scenario: Atualização concluída
- **WHEN** o usuário confirma a atualização obrigatória
- **THEN** o sistema SHALL recarregar a aplicação e SHALL apresentar a nova versão em uso
