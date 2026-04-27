# Proposal - Fix Admin Panel Header

## What
Refactor the Admin Panel header to move section-specific controls (title, subtitle, buttons) into the tab contents and update the main title to "Painel Administrativo".

## Why
Currently, the Admin Panel has a global header that doesn't change when switching tabs. Moving the "Novo Membro" button and "Gerenciamento de Usuários" title into the specific tab content makes the UI more intuitive and allows for different controls in other tabs (like the Financial tab).

## How
1.  Update the main title in `src/pages/Admin/index.tsx` to "Painel Administrativo".
2.  Remove the global subtitle and action buttons from the top layout of the Admin Panel.
3.  Move the title "Gerenciamento de Usuários", the subtitle, and the "Novo Membro"/"Refresh" buttons into the `UserManagement` tab component.
4.  Apply consistent styling to the new section headers within each tab.

## What Changes
- `src/pages/Admin/index.tsx`: Main layout refactor.
- `src/pages/Admin/UserManagement/index.tsx` (or equivalent): Integration of header elements.
- `src/locales/pt/translation.json`: Update `admin.title` to "Painel Administrativo".
