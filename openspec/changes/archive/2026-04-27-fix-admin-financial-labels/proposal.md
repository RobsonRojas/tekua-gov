# Proposal - Fix Admin Financial Labels

## What
Fix the missing translation keys in the Admin Panel's Financial tab and the tab title itself.

## Why
The Financial tab currently displays raw translation keys (e.g., `admin.financialIntegrity`), which looks unprofessional and is confusing for users.

## How
1.  Identify all missing keys shown in the user's screenshot.
2.  Add these keys to `src/locales/pt-BR.json` and `src/locales/en-US.json`.
3.  Ensure the tab title in the Admin Panel navigation is correctly internationalized.

## What Changes
- `src/locales/pt-BR.json`: Addition of financial translation keys.
- `src/locales/en-US.json`: Addition of financial translation keys.
- `src/pages/AdminPanel/index.tsx` (or wherever the tabs are defined): Ensure the label for the Financial tab uses `t()`.
