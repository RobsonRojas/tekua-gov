## ADDED Requirements

### Requirement: Fallback de Erro de Renderização
O sistema SHALL implementar uma barreira de erros (Error Boundary ou `errorElement`) para evitar que exceções não tratadas no frontend quebrem totalmente a aplicação e exibam stack traces ao usuário.

#### Scenario: Interceptação de Erro de DOM
- **WHEN** uma extensão do navegador ou inconsistência no React causa uma exceção como `NotFoundError: Failed to execute 'removeChild' on 'Node'`
- **THEN** a aplicação captura o erro e renderiza uma página de "Ops, algo deu errado" amigável.
- **THEN** a página de erro fornece uma forma simples de retornar à tela inicial ou recarregar a página sem as inconsistências.
