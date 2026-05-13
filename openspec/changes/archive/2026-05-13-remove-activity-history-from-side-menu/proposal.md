## Why

O item "Histórico de Atividades" no menu lateral redireciona para uma aba específica dentro do Painel Admin. O usuário solicitou a remoção deste item do menu lateral para simplificar a navegação, uma vez que esta informação já pode ser acessada através do Painel Admin ou diretamente no perfil do usuário, evitando redundância e desordem visual.

## What Changes

- Remoção do item de navegação `activity` do hook `useNavigation.tsx`.
- O item deixará de aparecer tanto na `Sidebar` (Desktop) quanto no `MobileDrawer` (Mobile).
- Não haverá mudanças na funcionalidade da aba de auditoria dentro do Painel Admin, que continuará acessível por outros meios.

## Capabilities

### Modified Capabilities
- `navigation-interface`: Atualização da lista de itens de navegação globais.

## Impact

- `src/hooks/useNavigation.tsx`: Exclusão da entrada correspondente ao histórico de atividades no array `navItems`.
- UX: Menu lateral mais conciso e focado nas principais áreas funcionais do sistema.
