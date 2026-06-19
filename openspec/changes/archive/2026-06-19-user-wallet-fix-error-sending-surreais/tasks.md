## 1. Criação do Componente ErrorBoundary

- [x] 1.1 Criar o arquivo `src/components/GlobalErrorBoundary.tsx`.
- [x] 1.2 Implementar o componente utilizando o hook `useRouteError()` do `react-router-dom` para capturar a exceção subjacente.
- [x] 1.3 Desenhar a interface (UI) do componente com Material-UI (`Box`, `Typography`, `Button`), exibindo uma mensagem amigável (ex: "Ops, algo deu errado de forma inesperada") e os detalhes técnicos de forma minimizada.
- [x] 1.4 Adicionar botões funcionais na UI para "Recarregar Página" (`window.location.reload()`) e "Ir para o Início" (`window.location.href = '/'`).

## 2. Configuração no React Router

- [x] 2.1 No arquivo `src/router.tsx`, importar o componente `GlobalErrorBoundary`.
- [x] 2.2 Adicionar a propriedade `errorElement: <GlobalErrorBoundary />` na configuração da rota raiz principal do aplicativo.
- [x] 2.3 Opcionalmente, adicionar também na sub-rota do dashboard (`/app` ou `/`) para que, caso ocorra um erro ali, a navbar principal não seja perdida.

## 3. Testes e Verificação

- [x] 3.1 Provocar intencionalmente um erro de renderização em um componente qualquer (ex: lançando um `throw new Error("Test")` na inicialização do componente de Wallet).
- [x] 3.2 Verificar se o `GlobalErrorBoundary` captura o erro e renderiza a tela amigável, ao invés da página branca ou da tela feia padrão do navegador.
- [x] 3.3 Testar os botões de recarregamento para certificar-se de que restauram a aplicação com sucesso.
