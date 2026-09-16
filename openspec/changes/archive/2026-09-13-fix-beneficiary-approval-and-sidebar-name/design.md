# Design: Fix Beneficiary Approval and Sidebar Username

## 1. Architecture
- **Frontend Components:**
  - `TaskDetail.tsx`: Refine the logic for rendering the approval button. The status for "Aguardando Aprovação" might be mapped differently or `activity.user_has_confirmed` might be causing issues. We will debug the exact status and render condition.
  - `Sidebar.tsx` (or equivalent layout component): Fetch the `profile` object from the auth context and render `profile.full_name || 'Perfil'` in the user section at the bottom of the sidebar.

## 2. API / Database Changes
No changes needed.

## 3. UI/UX Flow
- User opens sidebar -> Sees their own name instead of "Perfil".
- Beneficiary opens their Work page -> Sees the "Aprovar Trabalho" button when the work is awaiting their approval.
