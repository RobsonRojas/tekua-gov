# Proposal: Optimize Kanban Card Layout Information Display

## Why

In the multi-column fluid Kanban board layout, `ActivityCard` elements (such as long status chips like "Aguardando Validação", reward badges, confirmation progress bars, and moderation buttons "Aprovar"/"Reprovar") are colliding and overflowing past the card borders.

Optimizing inner card padding, header layout flex wrapping, typography scales, line-clamping, and button sizing will ensure all activity details remain completely visible, clean, and unclipped.

## What

- **Reclaim Horizontal Space & Card Padding**:
  - Reduce `CardContent` padding from `p: 3` (24px) to `p: 1.75` (14px) and `&:last-child: { pb: 1.75 }`.

- **Refactor Card Header**:
  - Wrap status chips and reward badges in flex-wrapped containers (`flexWrap: 'wrap'`, `gap: 0.75`).
  - Enable text ellipsis / auto-wrap on chips with long labels ("Aguardando Validação", "Aguardando Aprovação").

- **Optimize Typography & Clamping**:
  - Set title font size to `fontSize: '0.95rem'`, `fontWeight: 700`, `lineHeight: 1.3`.
  - Clamp description to a maximum of 3 lines (`WebkitLineClamp: 3`) to keep card sizes balanced.

- **Fix Action & Moderation Buttons**:
  - Update moderation buttons ("Aprovar" / "Reprovar") to `direction="column"` or `size="small"` inside compact columns to eliminate horizontal button overflow.
