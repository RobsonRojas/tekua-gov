# password-reset-otp-security Specification

## Purpose
TBD - created by archiving change fix-db-vulnerability. Update Purpose after archive.
## Requirements
### Requirement: OTP Table Access Control
The `public.password_reset_otps` table SHALL have Row-Level Security enabled to prevent unauthorized access via the Supabase anon or authenticated keys.

#### Scenario: Anon key cannot read OTP records
- **WHEN** an unauthenticated request is made using the anon key to select from `public.password_reset_otps`
- **THEN** the request SHALL be denied and return zero rows (RLS implicit deny)

#### Scenario: Authenticated user cannot read OTP records
- **WHEN** an authenticated user makes a request using the authenticated JWT to select from `public.password_reset_otps`
- **THEN** the request SHALL be denied and return zero rows (RLS implicit deny)

#### Scenario: Service role retains full access
- **WHEN** an Edge Function uses the `SUPABASE_SERVICE_ROLE_KEY` to insert, select, or update `public.password_reset_otps`
- **THEN** the operation SHALL succeed because `service_role` bypasses RLS by design

#### Scenario: Supabase security alert is resolved
- **WHEN** the corrective migration is applied to the remote database
- **THEN** the Supabase dashboard SHALL no longer display the `rls_disabled_in_public` critical alert for the `password_reset_otps` table

