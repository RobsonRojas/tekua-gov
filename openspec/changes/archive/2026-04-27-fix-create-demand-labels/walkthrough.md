# Walkthrough - Fix Create Demand Labels

The label for the description field in the "Create Demand" form has been updated to be more contextually appropriate. Instead of asking the user to describe what they *did*, it now asks them to describe what *needs to be done*.

## Changes

### 1. Localization
Added a new translation key `work.demandDescription` to both Portuguese and English translation files.
- **PT**: "Descreva a demanda (o que precisa ser feito)"
- **EN**: "Describe the demand (what needs to be done)"

### 2. UI Updates
Updated the `CreateDemand.tsx` component to use the new `work.demandDescription` key for the description field label.

## Verification Results
Verified using the browser subagent that the label "Descreva a demanda (o que precisa ser feito)" is correctly displayed in the form at `/create-demand`.
The build also completed successfully.
