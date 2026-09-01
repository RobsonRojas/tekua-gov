# Proposal: Fix Header "+ Registrar Trabalho" Button Truncation

## Why

In the top header bar of the Work Wall (`WorkWall.tsx`), the button "+ Registrar Trabalho" is truncated to "+ Registrar Traba" on standard desktop and laptop screens (1280px–1440px) when the sidebar is open.

This truncation occurs because fixed button paddings, `whiteSpace: 'nowrap'` with `flexShrink: 0`, and redundant nested container horizontal paddings force the rightmost button past the right boundary of the main content area.

## What

- **Responsive Header Action Buttons Layout**:
  - Apply responsive button paddings (`px: { sm: 1, md: 1.5, lg: 2 }`) and font sizing to header action buttons ("Atualizar", "+ Criar Demanda", "+ Registrar Trabalho").
  - Allow the header button group to wrap gracefully onto a second line if horizontal screen space is constrained (`flexWrap: 'wrap'`, `maxWidth: '100%'`).

- **Streamline Page Container Padding**:
  - Adjust page container padding in `WorkWall.tsx` (`px: { xs: 1.5, sm: 2, md: 3 }`) to eliminate double padding conflicts with `MainLayout.tsx`.
