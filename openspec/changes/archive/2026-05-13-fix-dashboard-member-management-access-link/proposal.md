## Why

O card "Member Management" no Dashboard principal está direcionando os administradores para uma página legada (`/admin/members`). Para garantir uma experiência de gestão unificada e moderna, este link deve apontar para o novo Painel Administrativo (`AdminPanel`), especificamente na aba de Gestão de Usuários, que oferece funcionalidades mais robustas como adição de membros, deleção segura e histórico.

## What Changes

- Atualização da rota do card de Membros em `src/pages/Home.tsx` de `/admin/members` para `/admin-panel?tab=users`.

## Capabilities

### Modified Capabilities
- `navigation-interface`: Atualização de redirecionamentos internos do dashboard para o painel administrativo.

## Impact

- `src/pages/Home.tsx`: Alteração do array `homeCards` para refletir o novo destino do link de acesso.
