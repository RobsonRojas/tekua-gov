## ADDED Requirements

### Requirement: Enforce RLS on Extension Tables in Public Schema
The system SHALL ensure that any extension table in the `public` schema (such as `spatial_ref_sys`) has Row-Level Security (RLS) enabled to prevent unauthorized modifications, while allowing read access through explicit public policies.

#### Scenario: Verify RLS enablement on spatial_ref_sys
- **WHEN** a security audit is performed on extension tables in the `public` schema
- **THEN** the `spatial_ref_sys` table MUST have row-level security enabled and read access allowed.
