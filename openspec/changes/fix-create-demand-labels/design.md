# Design - Fix Create Demand Labels

## Context
The "Create Demand" form uses the same description label as the "Register Work" form, which is semantically incorrect.

## Decisions

### 1. New Translation Key
- We will add `work.demandDescription` to the translation files.
- PT: "Descreva a demanda (o que precisa ser feito)"
- EN: "Describe the demand (what needs to be done)"

### 2. Component Update
- Update `CreateDemand.tsx` to use `t('work.demandDescription')` for the description field label.
