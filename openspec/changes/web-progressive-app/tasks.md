## 1. Configuração e Dependências

- [x] 1.1 Instalar o plugin `vite-plugin-pwa`.
- [x] 1.2 Configurar o plugin no `vite.config.ts`.
- [x] 1.3 Criar os ícones do aplicativo (192x192 e 512x512) na pasta `public`.

## 2. Manifesto e Service Worker

- [x] 2.1 Definir o conteúdo do `manifest.webmanifest`.
- [x] 2.2 Adicionar as meta tags do PWA no `index.html`.
- [x] 2.3 Implementar a lógica de registro e atualização do Service Worker no `main.tsx`.

## 3. Melhorias Mobile

- [x] 3.1 Revisar a responsividade do `MainLayout` para visualização em modo "standalone".
- [x] 3.2 Testar a instalação localmente usando Chrome DevTools (Application tab).

## 4. Testes e Validação

- [x] Implementar testes unitários para o service worker e lógica de atualização (Vitest).
- [x] Implementar testes de integração/E2E validando o modo standalone e offline (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
