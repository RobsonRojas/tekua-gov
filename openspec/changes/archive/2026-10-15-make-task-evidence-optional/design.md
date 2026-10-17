## Context

See proposal.md - Why. Task/demand completion is handled by `src/pages/SubmitTaskProof.tsx`, mounted at `/tasks/:id/submit`. The submit button is disabled until at least one attachment exists:

```
disabled={uploading || attachments.length === 0}
```

The backend `submitProof` action in `supabase/functions/api-work/index.ts` already treats evidence as optional: it inserts evidence only when provided and always advances the activity to `pending_validation`. No other server-side check requires evidence for completion.

## Goals / Non-Goals

**Goals:**
- Allow submitting a task/demand for validation with zero attachments.
- Keep evidence available and clearly marked as optional.

**Non-Goals:**
- Removing the evidence upload capability.
- Changing the contribution registration flow (`RegisterWork`) or the `work-registration` evidence policy.
- Changing payout, validation/approval, or notification logic.

## Decisions

- **Keep the uploader, mark it "opcional"**: The `FileUploader` stays in place so executors who want to attach evidence still can; the heading/helper text is updated to say the evidence is optional. Alternative: remove the uploader entirely - rejected, it would discard useful evidence and is not what was requested.
- **Submit enabled with zero attachments**: Drop the `attachments.length === 0` clause from the button's `disabled` condition (keep the `uploading` guard). This is the single functional change.
- **No backend change**: `submitProof` already accepts an empty attachment list, so the requirement is satisfied without new migrations or API changes. This keeps risk and scope low.

## Risks / Trade-offs

- **Less evidence for community validation** → Mitigation: evidence remains available and encouraged as optional; validators can still reject tasks with insufficient justification.
- **Existing tests/usages assuming the disabled state** → Mitigation: check for tests referencing the submit button state and update them.
