# Proposal - Work Register Add Take Picture

## What
Add a "Take Picture" feature to the work registration form that captures evidence using the device's camera and overlays metadata (geolocation and timestamp).

## Why
Users need a quick way to document their work with verified evidence. Adding GPS and time watermarks directly on the image increases the credibility of the submission.

## How
1.  Add a "Take Picture" button next to the "Upload" button in the work registration form.
2.  Implement a camera modal or overlay using `navigator.mediaDevices.getUserMedia`.
3.  Capture the GPS position using `navigator.geolocation`.
4.  Use an HTML5 Canvas to:
    - Draw the captured video frame.
    - Overlay the date, time, and coordinates at the bottom corner.
5.  Convert the canvas to a Blob/File and set it as the evidence file.

## What Changes
- `src/pages/WorkRegistration.tsx` (or equivalent): UI update to add the button.
- `src/components/CameraCapture/`: New component to handle camera access and watermarking.
- `src/utils/imageUtils.ts`: Helper for canvas-based watermarking.
