# Proposal - Fix Create Demand Labels

## What
Fix the incorrect help text/label for the description field in the "Create Demand" form.

## Why
The description field currently says "Descreva o que você fez" (Describe what you did), which is appropriate for registering *completed* work, but not for *requesting* work (creating a demand). It should guide the requester to describe the required task.

## How
1.  Update `src/locales/pt/translation.json` and `src/locales/en/translation.json` to include a specific key for demand descriptions.
2.  Update the `CreateDemand` component to use this new key.

## What Changes
- `src/locales/pt/translation.json`: Add `work.demandDescription`.
- `src/locales/en/translation.json`: Add `work.demandDescription`.
- `src/pages/Dashboard/Work/CreateDemand.tsx` (or equivalent): Use the new translation key.
