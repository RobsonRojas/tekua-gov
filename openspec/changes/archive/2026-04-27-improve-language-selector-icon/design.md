# Design - Improve Language Selector Icon

## Context
The language selector button currently uses a generic icon. It should indicate the active language.

## Decisions

### 1. UI Modification
- Instead of just showing the `Languages` icon from `lucide-react`, we will show the current language code (PT/EN) or a flag icon.
- Preferred approach: Keep the icon but add a text label next to it, or replace the icon with a circular flag/text badge.
- Decision: We will use a `Button` that displays the current language code (e.g., "PT" or "EN") alongside a small globe/translate icon.

### 2. Component Update
- Locate the `LanguageSelector` component.
- Use `i18n.language.toUpperCase().substring(0, 2)` to get the label.
- Style the button to match the premium aesthetic of the portal.
