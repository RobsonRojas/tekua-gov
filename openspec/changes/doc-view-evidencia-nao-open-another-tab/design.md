## Context

Currently, the evidence viewing functionality in `TaskDetail.tsx` and `ActivityCard.tsx` opens evidence URLs in a new browser tab (`window.open(url, '_blank')`). This disrupts the user experience. Opening the evidence inside a modal provides a smoother, context-preserving experience.

## Goals / Non-Goals

**Goals:**
- Create an `EvidenceViewerModal` component that displays images in a centralized modal over the current page.
- Update components that link to evidences to use this new modal instead of opening new tabs.

**Non-Goals:**
- Completely overhauling how evidence is captured or stored.
- Adding complex features like PDF viewing in the modal (though if the browser supports it natively in an `iframe`, it could be considered, but the primary focus is image evidence).

## Decisions

**1. Modal Component**
We will create an `EvidenceViewerModal` component that takes an `open` boolean, `evidenceUrl` string, and `onClose` callback. It will use MUI's `Dialog` component.

**2. Component Updates**
In `TaskDetail.tsx` and `ActivityCard.tsx` (and potentially `ContributionCard.tsx`), we will add local state to manage the currently selected evidence URL and the modal's open state. When a user clicks on an evidence, we set the state instead of calling `window.open`.

## Risks / Trade-offs

- **Risk:** Some evidences might be external links or non-image files (like DOCX) that browsers can't easily display in a modal `iframe` or `img` tag.
  - *Mitigation:* The modal can attempt to render an image if the URL ends with an image extension. If not, it could fallback to providing a direct download link or opening in a new tab as a last resort. However, since the prompt specifies fixing the behavior to open in a modal, we will attempt to display it in a generic `iframe` or `img` wrapper.
