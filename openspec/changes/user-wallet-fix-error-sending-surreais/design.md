## Context

Erros de `NotFoundError: Failed to execute 'insertBefore' on 'Node'` no React geralmente ocorrem quando a árvore DOM real foi modificada de uma forma que o React não consegue prever (comumente por extensões de tradução como o Google Tradutor) ou devido a problemas complexos de re-renderização em nós de texto expostos. No React Router v6+, a forma recomendada de lidar com erros de renderização e evitar que a aplicação inteira quebre em uma tela branca (ou tela genérica de erro do router) é utilizando a propriedade `errorElement` nas rotas. Atualmente, a rota da carteira não possui tratamento isolado, fazendo com que falhas locais derrubem toda a árvore de navegação do usuário.

## Goals / Non-Goals

**Goals:**
- Implementar um componente `GlobalErrorBoundary` (ou similar) reutilizável.
- Adicionar a propriedade `errorElement={<GlobalErrorBoundary />}` no nível raiz das rotas no `src/router.tsx` e possivelmente no nível de sub-rotas críticas (como a Wallet) para conter a falha.
- Fornecer opções claras para o usuário dentro do componente de erro, como "Recarregar Página" e "Ir para o Início", mantendo a identidade visual da Tekuá.

**Non-Goals:**
- Resolver o problema base do Google Translate corrompendo o DOM de todo o aplicativo. (Isso exigiria mudanças profundas, como envolver todo texto puro em `<span>` ou desativar o translate via meta tag `<html translate="no">`, o que prejudicaria acessibilidade. O foco aqui é *error recovery* gracioso).

## Decisions

### 1. Componente de Erro (Error Element)
**Decisão**: Criar o componente `src/components/GlobalErrorBoundary.tsx` que utiliza os hooks `useRouteError` do `react-router-dom` para capturar a exceção e apresentar a UI.
**Rationale**: Centraliza a lógica de fallback de erros visuais e garante que a aplicação não apresente logs crus ou stack traces para o usuário final.

### 2. Integração no React Router
**Decisão**: No arquivo `src/router.tsx`, na configuração do `createBrowserRouter`, adicionar a propriedade `errorElement: <GlobalErrorBoundary />` à rota `/` e às rotas filhas principais (como `app/` e `wallet/`).
**Rationale**: O React Router usa Error Boundaries sob o capô para a propriedade `errorElement`. Adicioná-lo à raiz protege toda a aplicação. Adicioná-lo em rotas filhas permite que a navegação global (navbar/sidebar) continue funcionando mesmo se a página falhar.

## Risks / Trade-offs

- **Risk**: Se o erro for de inicialização (antes do router montar), o `errorElement` não será acionado.
  → **Mitigação**: O problema relatado (`insertBefore` ao enviar moedas) acontece durante a interação do usuário com a página já montada, então o `errorElement` será totalmente efetivo para esse caso de uso.
