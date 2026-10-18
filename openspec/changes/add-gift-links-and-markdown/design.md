## Context

See `proposal.md` — Why. Relevant current state:

- `public.gifts` (migration `20260614103232_create_gift_economy.sql`) has `id`, `provider_id`, `title JSONB`, `description JSONB`, `status`, `created_at`. No link column.
- `createGift` / `fetchGifts` live in `supabase/functions/api-gifts/index.ts`; `fetchGifts` already selects `*`, so new columns flow to the client without API changes.
- `GiftsArea.tsx` renders descriptions as plain text with `sx={{ whiteSpace: 'pre-wrap' }}`; `GiftDetailsModal.tsx` does the same inside a `Dialog maxWidth="sm"`.
- `src/components/common/SafeMarkdown.tsx` already provides sanitized Markdown (`react-markdown` + `DOMPurify` with `ALLOWED_TAGS: []` and a protocol-filtered `urlTransform`). It takes only `content` today and is used by `AIAgent` and `AgenteChat`.
- i18n: namespace `gifts` in `src/locales/{pt,en}/translation.json`.

## Goals / Non-Goals

**Goals:**
- One optional external link per dádiva, validated, surfaced as a new-tab button in the details card.
- Markdown for the description input and for rendering in list + details, reusing the existing sanitized renderer.
- Guarantee rendered Markdown cannot overflow the details card width.

**Non-Goals:**
- Multiple links per dádiva (Markdown links in the description cover extra references).
- Editing/updating an existing dádiva, or a dedicated `/gifts/:id` route.
- A WYSIWYG editor for the description (no Quill here; raw Markdown stays the source of truth).
- Changing the `title`/`description` JSONB (`{pt, en}`) shape or the points/usage flow.

## Decisions

**Decision 1: Store the link as a nullable `link_url TEXT` column.**
- Rationale: The link is a single, non-translatable locator; a flat column matches how it is read/written and needs no JSONB traversal. `fetchGifts` returns it for free via `select('*')`.
- Alternatives considered: `links JSONB` / `TEXT[]` for multiple links (rejected: no plural requirement in practice, adds form/list-of-fields complexity); reusing `description` JSONB to embed the URL (rejected: not queryable/validatable and muddies content).

**Decision 2: Reuse and extend `SafeMarkdown` instead of embedding a renderer per view.**
- Rationale: XSS hardening (tag stripping, protocol allow-list) already exists and is unit-tested. Extending it with two optional props — `linkTarget` (e.g. `'_blank'`) and `sx`/wrapper styling — keeps a single hardening point and leaves existing call sites unchanged.
- Alternatives considered: `dangerouslySetInnerHTML` with a third-party Markdown-to-HTML conversion (rejected: weaker safety, duplicate concerns); a separate `GiftMarkdown` component wrapping `ReactMarkdown` (rejected: forks the sanitization logic).
- Note: opening links in a new tab is implemented via `components={{ a: ... }}` injecting `target` and `rel="noopener noreferrer"`.

**Decision 3: Keep the description `TextField multiline` and add Markdown affordances (helper text + preview), not a rich-text editor.**
- Rationale: The stored value must remain Markdown (spec), so a WYSIWYG round-trip would be lossy/ambiguous. A helper hint plus a live `<SafeMarkdown>` preview in a bordered box gives feedback with minimal surface.
- Alternatives considered: `RichTextEditor` (Quill) already in the repo (rejected: emits HTML, contradicts the Markdown contract).

**Decision 4: Containment via a scoped `sx` block on the Markdown container.**
- Rationale: The details body needs `overflowWrap: 'anywhere'`/`wordBreak: 'break-word'`, `'& *': { maxWidth: '100%' }`, `'& pre': { overflowX: 'auto' }`, `'& img': { maxWidth: '100%', height: 'auto' }`, `'& table': { display: 'block', overflowX: 'auto' }`, and `minWidth: 0` on the flex/grid parent chain. A single style object on the wrapper keeps it colocated and avoids new global CSS.
- Alternatives considered: global CSS in an app stylesheet (rejected: leaks to other Markdown surfaces); truncation/ellipsis (rejected: the detail view must show the full description).

**Decision 5: Validate the link at the form (client) and at the edge function (server).**
- Rationale: The client gives immediate feedback; the edge function is the trust boundary. Accept only absolute `http`/`https` URLs, normalize by trimming, and store `null` when empty.
- Alternatives considered: client-only validation (rejected: edge function is reachable directly).

## Risks / Trade-offs

- [Untrusted link is stored] → Server-side allow-list of `http`/`https`; render with `rel="noopener noreferrer"` and `target="_blank"`.
- [Markdown-disabled or older clients showing raw Markdown] → Acceptable: the raw text stays readable; list and details both render Markdown after this change.
- [Wide Markdown (tables, code, images) breaking the dialog layout] → Scoped containment rules plus `minWidth: 0` on the dialog content; verified against long-word and long-URL fixtures.
- [Existing `SafeMarkdown` consumers regress] → New props are optional; default behavior (no forced target, current markup) is unchanged, and existing tests must still pass.
- [Migration on a live table] → Column is nullable with no default and no backfill; rollback is `DROP COLUMN link_url`.

## Migration Plan

1. Add migration `supabase/migrations/<timestamp>_add_link_url_to_gifts.sql`: `ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS link_url TEXT NULL;` (no RLS change — table policies already apply).
2. Update `createGift` to accept `linkUrl`/`link_url`, validate it, and persist trimmed value or `null`.
3. Ship frontend form field, preview, details button, and containment styling.
4. Rollback: drop the column; the frontend degrades to "no link" (button hidden).
