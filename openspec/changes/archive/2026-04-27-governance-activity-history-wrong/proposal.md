## Why

The "Histórico de Atividades" card in the Governance Services page currently redirects users to their own profile page (`/profile`). The intention is to provide a view of all system-wide activities, but this information is sensitive and should be restricted to administrators. Moving this view to a tab within the Admin Panel ensures proper access control and a more integrated administrative experience.

## What Changes

- **Modified `src/pages/AdminPanel.tsx`**: Add a new "Histórico de Atividades" tab to the existing administrative tabs.
- **Modified `src/components/admin/ActivityHistoryTab.tsx`**: (NEW or Refactored) Move the logic from `AdminActivityHistory.tsx` into a reusable component for the Admin Panel tab.
- **Modified `src/pages/GovernanceServices.tsx`**: Remove the "Histórico de Atividades" card from the public governance services view.
- **Modified `src/hooks/useNavigation.tsx`**: Ensure the "Histórico de Atividades" sidebar item correctly points to the Admin Panel (potentially with a specific tab state or keeping the separate admin route if preferred, but user requested a tab).
- **Modified `src/router.tsx`**: Keep or update routes as necessary to support the tabbed view.

## Capabilities

### Modified Capabilities
- `admin-panel`: Include system-wide activity history as a new administrative capability.
- `navigation-interface`: Update navigation to remove public access to global activity history.

## Impact

This change restricts the visibility of global system activity to administrators only. It simplifies the Governance Services page for regular users and centralizes administrative tools in the Admin Panel.
