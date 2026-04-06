## Context

O dashboard do membro possui atalhos para funcionalidades administrativas que estão atualmente desativados. A gestão de membros é um processo crítico para a governança da Tekuá, permitindo que administradores validem a identidade dos membros e atribuam permissões adequadas.

## Goals / Non-Goals

**Goals:**
- Ativar o botão de navegação "Acessar" no card de Membros para usuários administradores.
- Criar uma interface centralizada para ver todos os perfis cadastrados.
- Permitir a edição rápida de papéis (roles) para controle de acesso.
- Garantir a segurança através de RLS (Row Level Security) e proteção de rotas no frontend.

**Non-Goals:**
- Implementação de convites por email (será tratado futuramente).
- Histórico detalhado de mudanças de perfil (audit log).

## Decisions

- **Routing**: Utilizar uma rota protegida `/admin/members` integrada ao sistema de roteamento centralizado.
- **Role Control**: Administradores podem elevar membros a `admin` ou rebaixar a `member`.
- **UI Architecture**: Utilizar uma tabela responsiva com busca e filtro por status de aprovação.
- **RLS Policy**: Manter a política de que apenas o proprietário ou um admin pode editar o perfil.

## Risks / Trade-offs

- **Permissions Overlap**: É necessário garantir que um administrador não possa acidentalmente se rebaixar a membro sem que exista pelo menos outro administrador ativo.
- **Privacy**: A listagem de dados sensíveis deve ser restrita estritamente a administradores no backend.
