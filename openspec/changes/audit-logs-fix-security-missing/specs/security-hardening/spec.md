## ADDED Requirements

### Requirement: Secure Views with Security Invoker
The system SHALL ensure that any database view exposing sensitive tables with RLS enabled (such as `vw_audit_logs_all` exposing `audit_logs`) is defined with the `security_invoker = true` option to enforce the querying user's RLS policies and permissions.

#### Scenario: View query respects RLS of querying user
- **WHEN** a non-admin user queries the `vw_audit_logs_all` view
- **THEN** the database MUST apply the RLS policies of `audit_logs` relative to that user, returning only their own logs.
