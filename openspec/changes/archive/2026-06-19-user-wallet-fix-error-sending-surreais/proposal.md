## Why

O aplicativo tem apresentado um "Erro inesperado" (NotFoundError: Failed to execute 'insertBefore' on 'Node') ao realizar ações dinâmicas, como o envio de Surreais na carteira. Esse tipo de erro de manipulação do DOM pelo React (muitas vezes causado por extensões de tradução como Google Tradutor ou re-renderizações conflitantes) derruba toda a aplicação e exibe uma tela de erro não amigável do React Router. Precisamos implementar um Error Boundary adequado (`errorElement`) para capturar essas falhas graciosamente e melhorar a experiência do usuário, permitindo recuperação ou recarregamento da página sem perder o contexto do app.

## What Changes

- Implementação de um componente global ou específico de rota de **Error Boundary** (utilizando a propriedade `errorElement` do React Router).
- O `errorElement` exibirá uma UI amigável e de acordo com a identidade visual da Tekuá, informando que ocorreu um problema inesperado e oferecendo botões de ação ("Recarregar Página" ou "Voltar ao Início").
- Revisão de pontos na página de Wallet onde nós dinâmicos são manipulados e que podem causar o erro de `insertBefore` (ex: uso de Fragments vazios ou nós temporários que podem estar sendo corrompidos).

## Capabilities

### New Capabilities
- `error-handling`: Nova especificação cobrindo os requisitos de Error Boundaries amigáveis para a plataforma.

### Modified Capabilities
- Nenhuma capability existente terá seus requisitos principais de negócio alterados; trata-se de uma melhoria transversal de estabilidade (cross-cutting concern).

## Impact

- **Affected code**: `src/router.tsx` (definição de rotas e `errorElement`), novo componente `src/components/ErrorBoundary.tsx` ou similar.
- **APIs**: N/A.
- **Dependencies**: N/A (Uso de features nativas do `react-router-dom`).
