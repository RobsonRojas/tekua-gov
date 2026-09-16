# Tasks: Fix Beneficiary Approval and Sidebar Username

## 1. Fix Beneficiary Approval Button
- [x] Investigate `TaskDetail.tsx` to determine why the "Aprovar Trabalho" button is not rendering for the beneficiary. (Check if `activity.status` !== `'pending_validation'` or if `user?.id` mismatch).
- [x] Fix the conditional rendering in the Validação section to ensure the button is displayed.

## 2. Fix Sidebar Username
- [x] Locate the Sidebar component (e.g. `src/components/layout/Sidebar.tsx`).
- [x] Find the bottom profile section that currently hardcodes the text "Perfil".
- [x] Update it to use `profile?.full_name || 'Perfil'`.
