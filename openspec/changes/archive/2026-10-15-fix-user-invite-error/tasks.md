## 1. Update `api-members` Edge Function

- [x] 1.1 In `supabase/functions/api-members/index.ts`, replace `inviteUserByEmail` with `admin.createUser`. Set a secure generated password and `email_confirm: true`.
- [x] 1.2 Pass the same user metadata (full_name, roles, etc.) to the `createUser` function.
- [x] 1.3 Insert a record into the `email_queue` table with status `pending` so an offline worker can send the invite email later.
- [x] 1.4 Make sure the profile update block is executed after `createUser` (using the new user ID).

## 2. Validation

- [x] 2.1 Verify that inviting a new member creates the user in `auth.users`.
- [x] 2.2 Verify that the `profiles` table is updated correctly and the user appears in the admin panel.
- [x] 2.3 Verify that a record is added to the `email_queue` table for the invited user.
