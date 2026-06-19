## Context

In `DocumentViewerModal.tsx`, documents (especially PDFs loaded via `iframe`) currently allow users to select text and copy it. While basic safeguards exist (intercepting Ctrl+S and Ctrl+P), the native PDF viewer within the `iframe` still allows highlighting and `Ctrl+C`. This poses a risk for sensitive documents that should be view-only.

## Goals / Non-Goals

**Goals:**
- Block the ability to select text within the `DocumentViewerModal` for PDFs and images.
- Block copying text (e.g., via keyboard shortcuts like `Ctrl+C` or `Cmd+C`).
- Ensure the document remains scrollable and viewable.

**Non-Goals:**
- Preventing sophisticated scraping tools or users from taking screenshots (this is outside the scope of browser-level DOM protections).
- Creating a custom PDF rendering engine (we will continue using the browser's native PDF capabilities via `iframe` but with an overlay).

## Decisions

**1. Transparent Overlay for Iframes**
Since CSS `user-select: none` applied to the iframe wrapper does not affect the cross-origin or even native PDF viewer inside the iframe, we will implement a transparent `Box` overlay positioned absolutely over the `iframe`. This will intercept all mouse events (`pointer-events: auto`), preventing users from clicking, dragging, or selecting text inside the iframe.

**2. Preserving Scrollability**
Because the overlay blocks mouse events on the iframe, the user cannot use the scrollbar inside the iframe. To mitigate this, we can wrap the iframe in a scrollable container (`overflow-y: auto`) and set the iframe's height to match the document height (if possible) or simply rely on the user scrolling with the mouse wheel (which often propagates through transparent overlays) or we add a custom scroll mechanism. Wait, actually, the simplest approach is a `pointer-events: none` on the `iframe` itself (if it works) or an overlay. Let's decide to use a `Box` wrapper with `userSelect: 'none'` and intercepting `copy` events on the window, plus adding an overlay with `pointerEvents: none` if needed.
Wait, if we put a transparent overlay, the scroll wheel usually works on the wrapper. But if it's a PDF, we might not know its height. The best approach to prevent selection without breaking scrolling is to apply CSS `pointer-events: none` directly to the `iframe`, which blocks mouse clicks and selection, but allows mouse wheel scrolling if the wrapper is scrollable, or the iframe might scroll via mouse wheel even with pointer-events none in some browsers. Alternatively, we intercept `Ctrl+C` in the `handleKeyDown` event listener.

Let's refine:
We will intercept `Ctrl+C` and `Cmd+C` in the existing global `keydown` listener inside `DocumentViewerModal.tsx`.
We will also add an `onCopy` event handler on the `Dialog` to `e.preventDefault()`.

## Risks / Trade-offs

- **Risk:** Advanced users can use browser dev tools to remove the overlay or event listeners.
  - *Mitigation:* We accept this risk, as client-side protections are meant to deter casual copying, not defend against technical circumvention.
