## Context

O dashboard principal do portal Tekuá funciona como um ponto de entrada para diferentes áreas da associação. Atualmente, o card de "Serviços de Governança" é apenas visual, o que impede os membros de acessarem ferramentas cruciais para a vida democrática da organização (Votações, Estatutos, etc).

## Goals / Non-Goals

**Goals:**
- Implementar a página de hub de Serviços de Governança (`/governance`).
- Ativar a navegação entre Dashboard e Hub de Governança.
- Organizar visualmente os serviços disponíveis para facilitar o acesso do membro.

**Non-Goals:**
- Implementação detalhada de cada serviço (como o sistema de votação ou quadro de tarefas) nesta etapa; o hub apenas fornecerá os links para essas páginas (que serão tratadas em propostas específicas).

## Decisions

- **URL Structure**: `/governance` será o hub central.
- **UI Components**: Utilizar os mesmos padrões visuais do Dashboard (Cards + Icons) para consistência no design system.
- **Access Control**: Todo usuário autenticado (`member` ou `admin`) tem acesso à visualização dos serviços.

## Risks / Trade-offs

- **Placeholder Links**: Enquanto as outras funcionalidades (votação, tarefas) não forem implementadas, os botões dentro do hub de governança levarão para estados de "Em breve" ou páginas vazias para manter o fluxo de navegação ativo.
