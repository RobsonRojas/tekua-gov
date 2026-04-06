## 1. Instalação e Configuração Base

- [x] 1.1 Instalar `react-router-dom`.
- [x] 1.2 Configurar o `BrowserRouter` no `src/main.tsx`.
- [x] 1.3 Criar o arquivo de definição de rotas `src/routes.tsx` (ou similar).

## 2. Refatoração de Componentes

- [x] 2.1 Criar o componente `ProtectedRoute` para encapsular a lógica de autenticação.
- [x] 2.2 Atualizar o `App.tsx` para usar o `RouterProvider` ou definir as `<Routes>`.
- [x] 2.3 Modificar o `MainLayout.tsx` para utilizar o componente `<Outlet />`.
- [x] 2.4 Substituir navegação baseada em estado por componentes `<Link>` e o hook `useNavigate`.

## 3. Ajustes de Autenticação

- [x] 3.1 Atualizar a lógica de redirecionamento no `Login.tsx` após o sucesso na autenticação.
- [x] 3.2 Garantir que o `AuthContext` interaja corretamente com as rotas durante o carregamento da sessão.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
