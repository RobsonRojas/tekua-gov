# Proposal: Fix Header "+ Registrar Trabalho" Right-Edge Clipping

## Why

In the top header bar of the Work Wall (`WorkWall.tsx`), the rightmost action button **"+ Registrar Trabalho"** is clipped at the right screen boundary (rendering as `+ Registrar Tra|`), as shown in the user screenshot.

This occurs because flex items aligned to `flex-end` inside a `100%` width flex container push past the right padding of the page when button widths, white-space constraints, and container padding lack rigid bounds (`boxSizing: 'border-box'`, safety margin padding, and breakpoint label scaling).

## What

- **Header Action Button Padding & Boundary Fix**:
  - Add explicit container right safety padding and `boxSizing: 'border-box'` to `WorkWall.tsx` top header container.
  - Implement responsive button label rendering and compact paddings (`px: { xs: 1, sm: 1.25, md: 1.75 }`) so button groups never exceed available content width.
  - Guarantee a minimum 16px–24px right safety margin between the rightmost button and the viewport/drawer boundary on all screen sizes.
