## ADDED Requirements

### Requirement: Enforce Row Level Security on spatial_ref_sys
The system SHALL have Row Level Security enabled on the `public.spatial_ref_sys` table to prevent unauthorized modifications via the API.

#### Scenario: Read access
- **WHEN** a user queries the `spatial_ref_sys` table
- **THEN** they should be able to read the spatial reference data

#### Scenario: Write access denial
- **WHEN** a user attempts to insert, update, or delete records in `spatial_ref_sys` via PostgREST
- **THEN** the database should reject the operation due to RLS policies
