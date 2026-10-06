## Context

See proposal.md - Why. The WorkWall holds filter state in React and `WorkFilterValues`; nothing survives reload and there is no persistent indicator of active filters.

## Goals / Non-Goals

**Goals:**
- Persist WorkWall filters to localStorage and rehydrate on mount.
- Show a visible indicator when any filter differs from default.

**Non-Goals:**
- Sharing filters via URL, cross-device sync, or backend storage.

## Decisions

- **localStorage key** e.g. `tekua:workwall:filters`, serialized as JSON; merge with defaults on load and ignore invalid/extra fields (fail-safe to defaults).
- **Write on change** via useEffect on `filters`.
- **Indicator**: count of active (non-default) filters shown as a badge on the filters button and/or a highlighted state in `WorkFilters`; reusing existing UI components avoids new dependencies.

## Risks / Trade-offs

- Stale/invalid stored filters → validate shape and fall back to defaults.
- Users may forget filters are active → clear affordance via the indicator plus easy reset in WorkFilters.
