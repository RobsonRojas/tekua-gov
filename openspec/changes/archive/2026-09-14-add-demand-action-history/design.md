# Design Specification: Demand Action History & Confirmation Fix

## Architecture Overview

This change introduces a unified Action History timeline to the Demand Details view (`TaskDetail.tsx`) and fixes the confirmation button workflow to ensure task confirmations increment properly across all pending states (`pending_approval`, `pending_validation`).

```
[TaskDetail UI] 
    │
    ├──► [Task Confirmation Button] ──► calls apiClient.invoke('api-work', 'confirmActivity')
    │                                          │
    │                                          ▼
    │                                   [Supabase Edge Function: api-work]
    │                                          │
    │                                          ▼
    │                                   [RPC: confirm_activity()] ──► Inserts activity_confirmations
    │
    └──► [Demand Action History Timeline] 
            │
            └──► Synthesizes chronological events:
                 • Task Created (Requester)
                 • Task Claimed / Assigned (Executors)
                 • Evidence / Proof Submitted
                 • Confirmations & Approvals (Confirmers)
                 • Task Completed / Payout Triggered
```

## Detailed Changes

### 1. Backend Fixes (`supabase/functions/api-work/index.ts`)

- **`confirmActivity` Action**:
  - Check returned JSON payload from `confirm_activity` RPC for `success: false`.
  - If `success === false`, throw `new Error(data.error || 'Failed to confirm activity')` so the edge function returns an error response to the client.
- **`fetchActivityDetail` Action**:
  - Include full confirmation profiles (`confirmations:activity_confirmations (*, profile:profiles(id, full_name, avatar_url))`).
  - Ensure all activity evidence and attachments are returned to compile the timeline events accurately.

### 2. Frontend Confirmation Logic (`src/pages/TaskDetail.tsx`)

- Update `handleAction`:
  ```ts
  if (activity.status === 'open' && activity.type === 'task') {
    const { error } = await apiClient.invoke('api-work', 'claimTask', { activityId: activity.id });
    if (error) throw new Error(error);
  } else if (activity.status === 'pending_approval' || activity.status === 'pending_validation') {
    const { error } = await apiClient.invoke('api-work', 'confirmActivity', { activityId: activity.id });
    if (error) throw new Error(error);
  }
  ```
- Update confirmation progress calculations and button text reactively after `fetchDetail()` completes.

### 3. Action History Component (`src/components/work/DemandActionHistory.tsx`)

- Create reusable component `DemandActionHistory` that accepts `activity: any` and `confirmations: any[]`.
- Combine events into an array of history items sorted by timestamp:
  - `CREATED`: Demanda criada por [Solicitante]
  - `CLAIMED`: Tarefa assumida por [Executor]
  - `EVIDENCE_SUBMITTED`: Evidência enviada por [Executor]
  - `CONFIRMED`: Confirmação registrada por [Usuário]
  - `COMPLETED`: Tarefa concluída e recompensa de [X] $S distribuída
- Render items in a sleek modern timeline container with MUI icons, avatars, and styled badges.
- Include i18n support for English (`en`) and Portuguese (`pt`).

## User Experience & Aesthetics

- Glassmorphic card styling matching existing Tekuá dark green aesthetic (`bgcolor: 'rgba(255,255,255,0.02)'`, border: `'1px solid rgba(255,255,255,0.05)'`).
- Visual icons for each action type:
  - `PlusCircle` (Creation)
  - `PlayCircle` (Claimed)
  - `Upload` (Evidence)
  - `CheckCircle2` (Confirmed/Approved)
  - `Trophy` (Completed)
