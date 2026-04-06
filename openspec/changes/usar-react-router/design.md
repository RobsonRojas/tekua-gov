## Context

O portal Tekua Governance é uma Single Page Application (SPA) construída com React e Vite. Atualmente, a transição entre as telas de Login, Home, Perfil e Administração é controlada por uma variável de estado booleana ou de string, o que resulta em uma URL estática (apenas `/`) independentemente do conteúdo exibido.

## Goals / Non-Goals

**Goals:**
- Substituir o gerenciamento manual de estado de página por uma solução de roteamento robusta.
- Permitir que cada visualização principal tenha sua própria URL amigável.
- Garantir que a autenticação proteja as rotas sensíveis.
- Melhorar o suporte ao botão "voltar" do navegador.

**Non-Goals:**
- Implementar Server-Side Rendering (SSR).
- Migrar para um framework como Next.js (manter a simplicidade do Vite).

## Decisions

- **Biblioteca**: `react-router-dom` v7 (ou a versão compatível mais recente disponível no projeto).
- **Roteador**: Utilizar `createBrowserRouter` para definir as rotas de forma centralizada e permitir futuras otimizações de carregamento.
- **Estrutura de Rotas**:
  - `/login`: Rota pública para autenticação.
  - `/`: Rota protegida que renderiza o `MainLayout` com a `Home`.
  - `/profile`: Rota protegida para gerenciamento de perfil.
  - `/admin`: Rota protegida (apenas para administradores).
- **Componente de Layout**: O `MainLayout.tsx` atuará como o componente pai, utilizando o componente `<Outlet />` do React Router para renderizar as rotas filhas.
- **Proteção de Rotas**: Criar um componente `AuthGuard` ou `ProtectedRoute` que verifica a existência de uma sessão ativa no `AuthContext` e redireciona para `/login` se necessário.

## Risks / Trade-offs

- **Sessão Persistente**: É necessário garantir que o carregamento da sessão no `AuthContext` não cause redirecionamentos incorretos para a página de login enquanto a autenticação ainda está sendo verificada.
- **Deep Linking**: URLs profundas (ex: `/admin`) podem falhar em alguns servidores de hospedagem estática se não houver redirecionamento para o `index.html`.
