# Proposal: Fix Header Action Button & "Concluída" Column Right Edge Clipping

## Why

On standard desktop and laptop screen resolutions (e.g., 1280px to 1440px), users noticed two clipping issues:
1. **Header Action Button Clipping**: The "+ Registrar Trabalho" button on the top-right header row overflows and gets cut off on the right edge of the viewport.
2. **"Concluída" Column Clipping**: The 5th Kanban column ("Concluída") is truncated on the right side because column minimum widths (`300px`) exceed available display space and the board container lacks right end padding (`pr`).

## What

- **Header Action Buttons Layout**:
  - Add `flexWrap: 'wrap'` and flexible responsive sizing to header action buttons.
  - Apply compact padding (`px: { xs: 1.5, sm: 1.5, md: 2 }`) to header buttons to prevent horizontal overflow on laptop screens.
  - Ensure header container respects layout padding.

- **Kanban Column Responsive Width & Board End Padding**:
  - Refine `KanbanColumn` width breakpoints (`flex: { xs: '0 0 85vw', sm: '0 0 250px', md: '1 1 250px', lg: '1 1 270px' }`, `minWidth: { xs: '270px', sm: '240px', md: '250px', lg: '270px' }`).
  - Add right padding (`pr: { xs: 2, sm: 3, md: 4 }`) to the board container so the "Concluída" column renders completely with visible outer margins.
