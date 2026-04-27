## Context

The application's navigation hook (`useNavigation.tsx`) contains paths that do not align with the actual routes defined in `router.tsx`. This causes several menu items to fail when clicked.

## Goals / Non-Goals

**Goals:**
- Correct all navigation paths in the `useNavigation` hook.
- Ensure admin-only menu items are correctly flagged.
- Align the Sidebar navigation with the Home page cards.

**Non-Goals:**
- Refactoring the routing system itself.
- Creating new pages or features.
- Changing the visual layout of the sidebar.

## Decisions

### 1. Update Path Mapping in `useNavigation.tsx`
We will update the `navItems` array to use the correct paths from `router.tsx`:
- **Dashboard**: `/dashboard` → `/` (Matches the index route).
- **Mural de Trabalho**: `/tasks` → `/work-wall` (Matches the existing work wall page).
- **Assistente de IA**: `/ia-assistant` → `/ai-agent` (Matches the AI Agent page).
- **Painel Admin**: `/admin` → `/admin-panel` (Matches the Admin Panel page).
- **Histórico de Atividades**: `/history` → `/admin/activity` (Matches the Admin Activity page).

### 2. Restrict Activity History to Admins
Since the only available activity history page is `/admin/activity` (which shows logs for all users), we will mark this item as `adminOnly: true` in the navigation hook. This prevents regular members from seeing a link to a protected route they cannot access.

## Risks / Trade-offs

- **[Risk]** → Users who bookmarked old paths (if they were working before) might find them changed.
- **[Mitigation]** → Since the old paths were mostly non-existent (404/redirect), this is a net positive.
