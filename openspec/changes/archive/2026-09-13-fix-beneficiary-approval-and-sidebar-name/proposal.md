# Proposal: Fix Beneficiary Approval and Sidebar Username

## The Problem
1. **Beneficiary Approval:** The "Aprovar Trabalho" button is still not appearing for the logged-in beneficiary. The `activity.status` check or the `isOwner` check might be failing (e.g. `isOwner` might not match `user.id` properly, or the status might not be exactly `'pending_validation'`).
2. **Sidebar Username:** The sidebar menu is displaying the static word "Perfil" instead of the logged-in user's actual name.

## The Solution
1. **Beneficiary Approval:** Update `TaskDetail.tsx` to ensure the approval button is displayed correctly. Investigate if `activity.status` for "Aguardando Aprovação" is something else (like `'in_progress'` or a different status string), or if `isOwner` needs to be calculated differently.
2. **Sidebar Username:** Update the `Sidebar` or `Layout` component to replace the static text "Perfil" with `user?.user_metadata?.full_name` or `profile?.full_name`.

## Key Features
- Fix the condition for the "Aprovar Trabalho" button so it reliably renders for the Beneficiary when the work is awaiting approval.
- Display the actual user name in the sidebar profile section instead of the generic word "Perfil".
