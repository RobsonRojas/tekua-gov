# Tasks: Fix Header Button Clipping & Right Margin

## Implementation Tasks

- [x] **1. Add Box-Sizing & Safety Padding to Header Container (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Add `boxSizing: 'border-box'` to the page `Container` and header `Box`.
  - Add `pr: 1` to title `Box` and set button padding to `px: { xs: 1.25, sm: 1.25, md: 1.75 }`.
  - Ensure action buttons wrap cleanly and preserve a 16px–24px right safety margin from the screen boundary.

- [x] **2. Build & Verification** <!-- id: 2 -->
  - Verify complete button label visibility without right-edge clipping on laptop and desktop resolutions.
