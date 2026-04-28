## 1. Database & Schema

- [ ] 1.1 Create a new migration file `supabase/migrations/20260428000000_create_governance_settings.sql` to define the table.
- [ ] 1.2 Implement the singleton pattern by inserting a record with ID 'current'.
- [ ] 1.3 Add RLS policies: anyone can read, only admins can update.

## 2. Edge Function Stabilization

- [ ] 2.1 Update `supabase/functions/api-governance/index.ts` to handle missing settings records gracefully.
- [ ] 2.2 Verify that `fetchSettings` returns default values if the table is empty.

## 3. Frontend Crash Fix

- [ ] 3.1 Identify a React 19 compatible editor or implement a workaround for `ReactQuill`.
- [ ] 3.2 Update `src/pages/Voting.tsx` to use the stabilized editor.
- [ ] 3.3 Verify that the "Criar Nova Pauta" dialog opens and saves without crashing.

## 4. Verification

- [ ] 4.1 Run the application and verify that the "Votações e Pautas" page loads without schema errors.
- [ ] 4.2 Test the creation of a new pauta and ensure it persists in the database.
