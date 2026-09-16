# Tasks: Optimize Kanban Card Layout Information Display

## Implementation Tasks

- [x] **1. Refactor Card Header & Badges (`src/components/ActivityCard.tsx`)** <!-- id: 1 -->
  - Wrap status chip and reward badge in responsive flex containers (`flexWrap: 'wrap'`, `gap: 0.75`).
  - Set compact Chip dimensions (`height: 24`, `fontSize: '0.72rem'`, `maxWidth: '140px'`) so long status names fit cleanly.

- [x] **2. Reclaim Card Padding & Adjust Typography (`src/components/ActivityCard.tsx`)** <!-- id: 2 -->
  - Set `CardContent` padding to `p: 1.75` (14px) and `&:last-child: { pb: 1.75 }`.
  - Adjust title font size to `fontSize: '0.95rem'`, `lineHeight: 1.3`.
  - Clamp description to 3 lines max (`WebkitLineClamp: 3`).

- [x] **3. Fix Action & Moderation Buttons (`src/components/ActivityCard.tsx`)** <!-- id: 3 -->
  - Adjust moderation stack to `direction={{ xs: 'row', sm: 'column', lg: 'row' }}` with `size="small"` so "Aprovar" and "Reprovar" buttons never clip past card borders.

- [x] **4. Build & Visual Verification** <!-- id: 4 -->
  - Verify card legibility across all status columns.
  - Confirm 0 compilation errors.
