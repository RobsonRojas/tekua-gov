## Context

The application uses `react-i18next` for localization. Translation keys are organized into namespaces (top-level keys in JSON files). The `NewMemberModal` component expects keys `common.send` and `common.sending` to be present in the `common` namespace, but they were omitted during previous updates.

## Goals / Non-Goals

**Goals:**
- Fix the broken button label in the admin panel by adding the missing i18n keys.
- Maintain consistency with existing "common" utility labels.

**Non-Goals:**
- Refactoring the entire i18n structure.
- Changing the layout of the `NewMemberModal`.

## Decisions

### Decision: Add keys to "common" namespace
- **Rationale**: The component already references `common.send`. Adding the keys to the existing namespace is the most direct and least intrusive fix.
- **Alternatives considered**:
  - Changing the component to use `admin.send`: Rejected because "Send" is a generic action that belongs in `common`.

## Risks / Trade-offs

- **[Risk]** Overlapping keys in different namespaces → **Mitigation**: Standardize on `common` for generic action labels like Send, Cancel, Save.
