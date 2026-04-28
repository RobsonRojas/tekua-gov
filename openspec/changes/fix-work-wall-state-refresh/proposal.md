## Why

The Work Wall (Mural de Trabalho) is experiencing a state synchronization issue. When a user clicks "Assumir Tarefa" (Take Task), the backend confirms the action, but the UI card does not immediately update to reflect the "Em Execução" (In Progress) status. This creates confusion for the user, who may think the action failed until they manually refresh or check the activity history.

## What Changes

- **Frontend Component**: Update `ActivityCard.tsx` to immediately reflect status changes in the local state after a successful API call.
- **Frontend Hook**: Ensure `useQueryWithCache` correctly invalidates the cache and forces a re-render when `refetch` is called.
- **Frontend State**: Improve the optimistic UI update logic in `WorkWall.tsx` if applicable.

## Capabilities

### Modified Capabilities
- `work-registration`: Improve the responsiveness of task assignment and status updates.

## Impact

- **Frontend**: `WorkWall.tsx`, `ActivityCard.tsx`, `useQueryWithCache.ts`.
