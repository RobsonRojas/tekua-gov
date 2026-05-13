## Why

A critical security vulnerability has been identified where certain database tables in the `public` schema are publicly accessible. Anyone with the project URL can read, edit, and delete data because Row-Level Security (RLS) is either not enabled or incorrectly configured for these tables. This poses a significant risk to data integrity and user privacy.

## What Changes

- **Enable RLS**: Apply `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` to all tables in the `public` schema that are currently unprotected.
- **Harden Policies**: Review and update existing RLS policies to ensure they follow the principle of least privilege.
- **Default Deny**: Ensure that any table with RLS enabled has at least one policy or defaults to denying access if no policy matches.
- **Audit Partitions**: Specifically ensure that partitioned tables (like `audit_logs`) have RLS correctly applied to both parent and child partitions if necessary.

## Capabilities

### New Capabilities
- `security-hardening`: Project-wide audit and remediation of RLS settings to eliminate `rls_disabled_in_public` warnings and secure all data.

### Modified Capabilities
<!-- No requirement changes to existing features, only security implementation details. -->

## Impact

- **Database**: New migration file to enable RLS and define secure policies.
- **Security**: Resolution of the "Critical issue" and elimination of unauthorized data access.
- **Application**: The frontend must ensure all requests are properly authenticated to satisfy the new RLS requirements.
