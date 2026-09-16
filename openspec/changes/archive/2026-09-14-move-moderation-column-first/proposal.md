# Proposal: Place Moderation Column First in Kanban Board

## Why

Activities pending moderation (`pending_approval`) represent newly created demands/tasks awaiting initial review before becoming open for execution. Placing the "Moderação" column first in the Kanban board flow ensures administrators and council members review pending items before viewing open, executing, or validating tasks.

## What

- Reorder `columnDefs` in `src/pages/WorkWall.tsx` so that the `moderation` column (`id: 'moderation'`) appears as the first column before `open` ("Abertas").
