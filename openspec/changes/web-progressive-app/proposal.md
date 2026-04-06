## Why

O portal Tekua Governance precisa ser acessível e fácil de usar em dispositivos móveis. Transformar a aplicação em um Progressive Web App (PWA) permite que:
- O usuário instale o portal como um aplicativo na tela inicial do smartphone.
- O portal funcione em modo tela cheia (standalone), removendo a barra de endereços do navegador.
- Haja um carregamento mais rápido e suporte básico a funcionamento offline através de cache de ativos estáticos.
- Melhore o engajamento do usuário com uma experiência de "app nativo".

## What Changes

Esta mudança irá configurar os requisitos básicos de um PWA no projeto Vite:
- Criação de um `manifest.webmanifest` (ou `manifest.json`) com metadados do app (nome, cores, ícones).
- Configuração do plugin `vite-plugin-pwa` para gerar o Service Worker automaticamente.
- Adição de ícones em múltiplos tamanhos (192x192, 512x512).
- Atualização do `index.html` com as meta tags necessárias.

## Capabilities

### New Capabilities
- `progressive-web-app`: Capacidade da aplicação ser instalada, descoberta e executada com características de aplicativo nativo (offline, standalone).

### Modified Capabilities
- `layout-interface`: Melhorias de responsividade para garantir que a interface seja "app-like" quando instalada.

## Impact

A principal mudança será na configuração do build (`vite.config.ts`) e na adição de ativos estáticos (ícones). O comportamento da aplicação em navegadores modernos passará a exibir o prompt de instalação ("Adicionar à tela inicial").
