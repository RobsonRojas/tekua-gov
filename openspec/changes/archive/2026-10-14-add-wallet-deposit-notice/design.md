## Context

See proposal.md - Why. Task and demand create/edit forms currently let users define a value without any indication of how it will be distributed to executors.

## Goals / Non-Goals

**Goals:**
- Show a visible notice near the value field in task and demand creation/edit forms.

**Non-Goals:**
- Changing payout logic, wallet behavior, or form validation.

## Decisions

- **Plain inline notice message**: Render a static informational text ("O valor definido será depositado na carteira de cada um dos executores") adjacent to the value input in each form. Alternatives: a tooltip — rejected because it can be missed; a modal warning — rejected as too intrusive for an informational notice.
- **Reuse existing notice/alert styling** if the form components already provide an info/notice pattern, to stay consistent with the UI.

## Risks / Trade-offs

- Notice may be ignored by users accustomed to the form → Mitigate by placing it directly next to the value field with attention-grabbing styling.
