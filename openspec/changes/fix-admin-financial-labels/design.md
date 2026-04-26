# Design - Fix Admin Financial Labels

## Context
The Financial tab in the Admin Panel is showing raw translation keys. The tab title itself is also untranslated in the navigation bar.

## Decisions

### 1. Translation Keys
We will add the following keys to `src/locales/pt/translation.json` and `src/locales/en/translation.json`:
- `admin.financial`: "Financeiro" / "Financial"
- `admin.financialIntegrity`: "Integridade Financeira" / "Financial Integrity"
- `admin.integrityDesc`: "Resumo da integridade e balanço do sistema." / "Summary of system integrity and balance."
- `admin.noDiscrepancies`: "Sem Discrepâncias" / "No Discrepancies"
- `admin.noDiscrepanciesDesc`: "O sistema não detectou inconsistências nos saldos." / "The system detected no inconsistencies in balances."
- `common.refresh`: "Atualizar" / "Refresh"

### 2. Component Updates
- Update the Admin navigation component to use `t('admin.financial')` for the tab label.
- Update the Financial component (`src/pages/Admin/Financial/index.tsx` or similar) to use the new keys.
