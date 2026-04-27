## Context

The "Histórico de Atividades" feature was previously implemented as a standalone page (`AdminActivityHistory.tsx`) and was erroneously linked from the public Governance Services page. The goal is to move this functionality into a tab within the `AdminPanel.tsx` and restrict it to administrators only, following the recently updated design patterns for the Admin Panel.

## Goals / Non-Goals

**Goals:**
- Integrate activity history as a new tab in `AdminPanel.tsx`.
- Remove the activity card from `GovernanceServices.tsx`.
- Ensure the activity view is only accessible via the Admin Panel by admins.

**Non-Goals:**
- Creating a separate public activity feed (reversing the previous plan).
- Refactoring the underlying `useAdminActivity` hook logic.

## Decisions

### 1. Tab Integration in `AdminPanel.tsx`
We will add a new tab index (e.g., `tabValue === 5`) in `AdminPanel.tsx` for "Histórico de Atividades". 
- The content will be rendered using a new component `src/components/admin/ActivityHistoryTab.tsx` which will encapsulate the table and filters previously found in `AdminActivityHistory.tsx`.

### 2. Removal of Public Link
The card in `src/pages/GovernanceServices.tsx` with `title: t('profile.activity')` will be removed. Members can still view their *own* activity on their profile page, which remains unchanged.

### 3. Route Management
We can eventually remove the standalone `/admin/activity` route in `router.tsx` or redirect it to the Admin Panel with the correct tab active. For now, the primary entry point will be the Admin Panel.

## Risks / Trade-offs

- **[Trade-off]** → Admins might need to click more to reach the history.
- **[Mitigation]** → The improved consistency within the Admin Panel outweighs the extra click.
