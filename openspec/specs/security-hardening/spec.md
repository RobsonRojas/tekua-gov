# security-hardening Specification

## Purpose
Estabelecer políticas rigorosas de segurança no nível do banco de dados (Supabase), garantindo que todos os dados sensíveis sejam protegidos via Row-Level Security (RLS) e que o acesso público seja negado por padrão.
## Requirements
### Requirement: Enable RLS on all public tables
The system SHALL ensure that every table in the `public` schema has Row-Level Security (RLS) enabled to prevent unauthorized data access.

#### Scenario: Verify RLS enablement
- **WHEN** a security audit is performed on the `public` schema
- **THEN** every table MUST have `relrowsecurity` set to `true` in `pg_class`.

### Requirement: Default Deny Policy
The system SHALL ensure that any table with RLS enabled defaults to denying all access unless an explicit policy allows it.

#### Scenario: Deny unauthorized access
- **WHEN** a request is made to a table with RLS enabled but no policies
- **THEN** the database MUST return a permission denied error for all operations.

### Requirement: Secure Partitioned Audit Logs
The system SHALL ensure that RLS policies are correctly enforced across the partitioned `audit_logs` table structure.

#### Scenario: RLS enforcement on parent table
- **WHEN** a user queries the `public.audit_logs` parent table
- **THEN** the parent's RLS policies MUST be applied to filter data from all child partitions.

### Requirement: Enforce RLS on Extension Tables in Public Schema
The system SHALL ensure that any extension table in the `public` schema (such as `spatial_ref_sys`) has Row-Level Security (RLS) enabled to prevent unauthorized modifications, while allowing read access through explicit public policies.

#### Scenario: Verify RLS enablement on spatial_ref_sys
- **WHEN** a security audit is performed on extension tables in the `public` schema
- **THEN** the `spatial_ref_sys` table MUST have row-level security enabled and read access allowed.

### Requirement: Secure Views with Security Invoker
The system SHALL ensure that any database view exposing sensitive tables with RLS enabled (such as `vw_audit_logs_all` exposing `audit_logs`) is defined with the `security_invoker = true` option to enforce the querying user's RLS policies and permissions.

#### Scenario: View query respects RLS of querying user
- **WHEN** a non-admin user queries the `vw_audit_logs_all` view
- **THEN** the database MUST apply the RLS policies of `audit_logs` relative to that user, returning only their own logs.

