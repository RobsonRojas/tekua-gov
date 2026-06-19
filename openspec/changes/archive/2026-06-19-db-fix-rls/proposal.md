## Why

The `public.spatial_ref_sys` table is currently public but does not have Row Level Security (RLS) enabled. This poses a security vulnerability as it is exposed to PostgREST, meaning any user might potentially read or modify this data without proper authorization checks. Enabling RLS is required to secure the table and adhere to best security practices for exposing tables via PostgREST.

## What Changes

- Enable Row Level Security (RLS) on the `public.spatial_ref_sys` table.
- Define appropriate RLS policies for `public.spatial_ref_sys`. Since this table is created by PostGIS and contains spatial reference systems reference data, it should generally be readable by authenticated/anon users but not modifiable by them.

## Capabilities

### New Capabilities
- `db-spatial-ref-sys-rls`: Security capability to enforce Row Level Security on the `public.spatial_ref_sys` table.

### Modified Capabilities

## Impact

- Database schema (`public.spatial_ref_sys` table).
- PostgREST API (queries to this table will now be subject to RLS policies).
