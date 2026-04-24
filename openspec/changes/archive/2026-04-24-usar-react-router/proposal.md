## Why

Atualmente, o portal Tekua Governance utiliza um sistema de navegação baseado em estado (`currentPage`), o que limita a experiência do usuário. Sem o gerenciamento de rotas pelo lado do cliente (Client-Side Routing):
- O botão "voltar" do navegador não funciona como esperado.
- Não é possível compartilhar URLs para páginas específicas (ex: `/profile` ou `/admin`).
- A lógica de navegação está centralizada e acoplada.
- O SEO e a acessibilidade da navegação são prejudicados.

## What Changes

Esta mudança irá integrar o `react-router-dom` ao projeto para gerenciar a navegação de forma declarativa. As alterações incluem:
- Instalação da biblioteca `react-router-dom`.
- Criação de um `BrowserRouter` no ponto de entrada da aplicação.
- Definição de rotas para as páginas existentes: `/login`, `/home`, `/profile`, e `/admin`.
- Implementação de sub-rotas para o painel administrativo, se necessário.
- Uso de componentes `<Link>` e hooks como `useNavigate` para navegação interna.
- Implementação de Rotas Protegidas (Protected Routes) para garantir que apenas usuários autenticados acessem áreas restritas.

## Capabilities

### New Capabilities
- `client-side-routing`: Fornece uma infraestrutura de navegação baseada em URL, permitindo suporte a histórico, URLs profundas e transições suaves.

### Modified Capabilities
- `auth-flow`: A lógica de redirecionamento pós-login será atualizada para usar rotas em vez de mudanças de estado manuais.

## Impact

A estrutura principal do `App.tsx` e `MainLayout.tsx` sofrerá refatorações significativas. Todos os links internos e botões de navegação precisarão ser atualizados para usar os componentes/hooks do React Router.
