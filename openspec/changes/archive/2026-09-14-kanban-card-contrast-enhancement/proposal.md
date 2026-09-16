# Proposal: Enhance Work Wall Activity Card Visual Contrast

## Why

Users reported low contrast and poor legibility on the Work Wall Kanban activity cards (`ActivityCard.tsx`). In dark mode, card body descriptions, confirmation progress indicators, requester/beneficiary metadata, and action buttons use dim muted colors (`text.secondary` / low-contrast green-brown tints), making information difficult to read against dark column backgrounds.

## What

- **High-Contrast Typography**:
  - Replace dim text colors on card descriptions with high-contrast text (`rgba(255, 255, 255, 0.88)` / crisp light text).
  - Elevate confirmation progress counts, percentages, and requester/beneficiary labels with high-contrast font weights and readable color values.

- **Card Container Surface Definition**:
  - Add a high-contrast subtle border (`1px solid rgba(255, 255, 255, 0.12)`) and elevated card background fill so cards pop distinctly from Kanban column backgrounds.

- **Vibrant & Legible Action Buttons**:
  - Upgrade card action buttons ("Assumir Tarefa", "Concluir e Enviar", "Confirmar Tarefa") with high-contrast filled backgrounds (`#10b981`, `#f59e0b`), solid white text (`#ffffff`), and clear focus/hover feedback.

- **High-Visibility Badges & Icons**:
  - Enhance reward token pills ($S trophy), drag grips, attachment indicators, and action icons with high-contrast color values.
