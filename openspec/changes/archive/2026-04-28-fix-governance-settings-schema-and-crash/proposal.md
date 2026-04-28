## Why

The platform is currently experiencing critical failures in the Governance module:
1. Accessing the "Votações e Pautas" page fails because the `governance_settings` table is missing from the database schema.
2. Attempting to create a new agenda (pauta) causes a complete application crash due to `ReactQuill` using the deprecated `findDOMNode` method in a React 19 environment.

## What Changes

- **Database**: Add a new migration to create the `governance_settings` table with a singleton pattern (ID: 'current') and appropriate RLS policies.
- **Frontend**: Update the `Voting` page and its dialog to use a React 19 compatible rich text editor or fix the `ReactQuill` implementation to avoid `findDOMNode`.
- **Backend**: Ensure the `api-governance` Edge Function correctly handles the new `governance_settings` table.

## Capabilities

### New Capabilities
- `governance-settings`: Centralized configuration for governance parameters (voting thresholds, timeframes, etc.).

### Modified Capabilities
- `governance-services`: Update requirements to include mandatory settings initialization and UI stability for rich text editing.

## Impact

- **Database**: New table `governance_settings`.
- **APIs**: `api-governance` edge function will now depend on the new table.
- **Frontend**: `Voting.tsx` will be refactored for stability.
