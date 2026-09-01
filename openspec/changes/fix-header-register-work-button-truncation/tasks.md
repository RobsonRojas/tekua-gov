# Tasks: Fix Header "+ Registrar Trabalho" Button Truncation

## Implementation Tasks

- [x] **1. Refine Header Bar Layout & Responsive Button Styles (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Adjust page Container padding to `px: { xs: 1.5, sm: 2, md: 3 }`.
  - Apply responsive padding (`px: { xs: 1.5, sm: 1.25, md: 2 }`) and font sizes (`fontSize: { sm: '0.8rem', md: '0.875rem' }`) to header buttons.
  - Set `minWidth: 0` on title container and `flexWrap: 'wrap'` on action button box.

- [x] **2. Build & Verification** <!-- id: 2 -->
  - Verify complete label text visibility for "+ Registrar Trabalho" without truncation or right edge clipping across desktop and laptop resolutions.
