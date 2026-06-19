## 1. Setup

- [x] 1.1 Localizar o arquivo principal de roteamento (`App.tsx`, `main.tsx` ou router config).
- [x] 1.2 Criar um componente simples `ErrorFallback.tsx` na pasta de componentes base (ex: `src/components/ErrorFallback.tsx`) que mostre uma mensagem de erro amigável e um botão para voltar ao início (`/`).

## 2. Core Implementation

- [x] 2.1 Envolver as rotas principais com a propriedade `errorElement` apontando para o `<ErrorFallback />` criado (se usando o `createBrowserRouter`), ou criar uma classe `ErrorBoundary` e envolver a árvore principal de componentes.

## 3. Prevenção de `removeChild`

- [x] 3.1 Revisar locais propensos a modificação de texto bruto no DOM (como a notificação de erro ou alertas dinâmicos recentes) e certificar-se de que nós de texto estão agrupados em `<span>` ou `<div>`, o que previne extensões de tradução de quebrarem o layout. (Focado apenas na notificação do erro atual).
