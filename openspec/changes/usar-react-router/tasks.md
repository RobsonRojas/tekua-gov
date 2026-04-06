## 1. Instalação e Configuração Base

- [ ] 1.1 Instalar `react-router-dom`.
- [ ] 1.2 Configurar o `BrowserRouter` no `src/main.tsx`.
- [ ] 1.3 Criar o arquivo de definição de rotas `src/routes.tsx` (ou similar).

## 2. Refatoração de Componentes

- [ ] 2.1 Criar o componente `ProtectedRoute` para encapsular a lógica de autenticação.
- [ ] 2.2 Atualizar o `App.tsx` para usar o `RouterProvider` ou definir as `<Routes>`.
- [ ] 2.3 Modificar o `MainLayout.tsx` para utilizar o componente `<Outlet />`.
- [ ] 2.4 Substituir navegação baseada em estado por componentes `<Link>` e o hook `useNavigate`.

## 3. Ajustes de Autenticação

- [ ] 3.1 Atualizar a lógica de redirecionamento no `Login.tsx` após o sucesso na autenticação.
- [ ] 3.2 Garantir que o `AuthContext` interaja corretamente com as rotas durante o carregamento da sessão.
