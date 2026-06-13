## Context

O frontend do Tekua Gov (escrito em React/Vite) está ocasionalmente crashando para alguns usuários devido a um problema comum onde extensões de navegador (como o Google Translate) modificam diretamente o DOM (ex: substituindo nós de texto). O React, ao tentar atualizar a árvore virtual e aplicar no DOM real, encontra uma estrutura diferente e lança a exceção `NotFoundError: Falha ao executar 'removeChild' em 'Node'`. O impacto atual é que a tela fica totalmente em branco com a mensagem de stacktrace ("Erro inesperado no aplicativo!"), interrompendo a experiência do usuário.

## Goals / Non-Goals

**Goals:**
- Implementar um `ErrorBoundary` global ou na raiz das rotas do React Router para capturar exceções de renderização não tratadas e exibir uma UI amigável (fallback UI).
- Garantir que usuários possam retornar à página inicial (`/`) em caso de crash.

**Non-Goals:**
- Corrigir todas as incompatibilidades com o Google Translate de forma cirúrgica (envolver todos os nós de texto com spans), pois o foco principal é a resiliência via ErrorBoundary.
- Configurar envio de logs de erro do frontend para serviços externos (ex: Sentry) neste momento. O foco é apenas estabilizar a UX.

## Decisions

- **Error Boundary no Router:** Vamos utilizar a propriedade `errorElement` do `react-router-dom` (se o projeto usar `createBrowserRouter`) ou um componente clássico `<ErrorBoundary>` envolvendo as rotas. Dada a dica de erro do React Router na mensagem original ("fornecendo sua própria propriedade errorElement na sua rota"), adotaremos o `errorElement` no setup de roteamento.
- **Fallback UI:** Será criado um componente simples (`ErrorFallback` ou similar) que mostra uma mensagem educada de que algo deu errado, e um botão "Voltar ao Início".

## Risks / Trade-offs

- **Risk:** Erros que ocorrem fora do contexto do React Router (antes de montar as rotas) não seriam pegos pelo `errorElement`.
  - **Mitigation:** O `errorElement` no topo da árvore de rotas pegará virtualmente todos os erros de renderização em componentes.
