## Why

The sidebar navigation items for "Mural de Trabalho", "Histórico de Atividades", "Assistente de IA" and "Painel Admin" are pointing to incorrect or non-existent routes, causing them to fail when clicked. This breaks the primary navigation of the platform.

## What Changes

- **Modified `src/hooks/useNavigation.tsx`**: Update navigation paths to match the routes defined in `src/router.tsx`.
  - Update Dashboard path from `/dashboard` to `/`.
  - Update Work Mural path from `/tasks` to `/work-wall`.
  - Update Activity History path from `/history` to `/admin/activity` (and mark as `adminOnly`).
  - Update AI Assistant path from `/ia-assistant` to `/ai-agent`.
  - Update Admin Panel path from `/admin` to `/admin-panel`.

## Capabilities

### Modified Capabilities
- `navigation-interface`: Ensure all navigation links point to valid routes defined in the application router.

## Impact

This change affects the main navigation system (Sidebar and Mobile Drawer). It ensures that all menu items lead to their respective pages.
