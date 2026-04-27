## 1. UI Refactoring

- [x] 1.1 Create `src/components/admin/ActivityHistoryTab.tsx` by moving logic from `AdminActivityHistory.tsx`.
- [x] 1.2 Update `src/pages/AdminPanel.tsx` to include the new "Histórico de Atividades" tab.
- [x] 1.3 Update `src/pages/GovernanceServices.tsx` to remove the "Histórico de Atividades" card.
- [x] 1.4 Update `src/hooks/useNavigation.tsx` to ensure "Histórico de Atividades" sidebar item points to the Admin Panel.

## 2. Component Cleanup

- [x] 2.1 (Optional) Remove `AdminActivityHistory.tsx` and its route from `router.tsx` if no longer needed as a standalone page.

## 3. Verification

- [x] 3.1 Verify the new tab is visible and functional in the Admin Panel for admins.
- [x] 3.2 Verify the card is removed from the Governance Services page.
- [x] 3.3 Verify RLS continues to protect activity data from non-admins.
