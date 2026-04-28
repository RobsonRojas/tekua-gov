## Context

The Work Wall utilizes `useQueryWithCache`, which prioritizes cached data from IndexedDB for immediate rendering. While this improves perceived performance, it can cause stale data to persist in the UI if the cache invalidation or re-fetching logic is not perfectly synchronized with the action's success. Specifically, the "Assumir Tarefa" action in `ActivityCard` does not seem to trigger a sufficient state update to re-render the card with the new status.

## Goals / Non-Goals

**Goals:**
- Ensure immediate UI updates for activity status changes.
- Verify the cache invalidation logic in `useQueryWithCache`.

**Non-Goals:**
- Implementing real-time WebSockets for all status changes (this fix focuses on local actions).

## Decisions

### 1. In-Component State Update
- **Decision**: Update `ActivityCard.tsx` to maintain a local `status` state that is updated immediately after a successful API response, in addition to calling the parent's `onRefresh`.
- **Rationale**: This provides the fastest possible feedback to the user while the background re-fetch updates the global list.

### 2. Cache Invalidation
- **Decision**: Update `useQueryWithCache.ts` to ensure that a `refetch` call explicitly clears the current cache key or forces an overwrite before the next render.

## Risks / Trade-offs

- **Risk**: Local state in `ActivityCard` getting out of sync with the parent `WorkWall` state if not handled carefully.
  - **Mitigation**: Ensure `onRefresh` is called as the final step to sync everything with the server.
