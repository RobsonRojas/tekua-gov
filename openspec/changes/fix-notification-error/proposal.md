## Why

Atualmente, o aplicativo está apresentando uma tela de erro em branco ("Erro inesperado no aplicativo!") relacionada à remoção de nós do DOM (`NotFoundError: Falha ao executar 'removeChild' em 'Node'`). Isso provavelmente ocorre por conta de extensões de tradução (como Google Translate) ou renderizações condicionais mal formatadas que causam inconsistências na árvore do React. Para proporcionar uma experiência de usuário melhor, precisamos tratar esse erro e exibir um fallback amigável usando um ErrorBoundary, evitando o travamento completo da página.

## What Changes

- **New Feature**: Adição de um `ErrorBoundary` global ou no nível das rotas do React Router (`errorElement`).
- **Fix**: Proteção de nós de texto em elementos de notificação/interface para mitigar a causa raiz do problema de tradução do DOM (`removeChild`).

## Capabilities

### Modified Capabilities
- `frontend-content-security` ou `technical-integrity` (vamos criar ou modificar uma capability genérica de estabilidade do frontend). Se houver uma capability existente relacionada a estabilidade/tratamento de erros, ela será estendida. Vou usar a capability existente que mais se adeque ou criar uma nova chamada `frontend-error-handling`.
Vou criar `frontend-error-handling`.

### New Capabilities
- `frontend-error-handling`: Gerenciamento centralizado de erros de renderização e exceções não tratadas no frontend para prover uma experiência resiliente.

## Impact

- **Frontend**: Modificação das rotas principais (`App.tsx` ou `main.tsx`) para incluir `errorElement` ou `<ErrorBoundary>`.
- **Componentes**: Criação de um componente genérico de Fallback de Erro.
