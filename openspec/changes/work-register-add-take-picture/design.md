# Design - Work Register Add Take Picture

## Context
Improve evidence collection by allowing users to take photos directly from the app with automated watermarking.

## Decisions

### 1. Camera Integration
- Component: `CameraCapture.tsx` using `react-webcam` (or native `getUserMedia`).
- Workflow:
  - User clicks "Take Picture".
  - Overlay opens with camera preview.
  - User clicks "Capture".
  - App fetches Geolocation and Timestamp.
  - Image is processed in a Canvas to add watermarks.
  - Final image is converted to Blob/File and passed to the upload handler.

### 2. Watermarking
- Text: "Tekuá - [Date] [Time] - Lat: [Lat], Lon: [Lon] - Accuracy: [Acc]m"
- Position: Bottom right corner.
- Style: White text with black shadow for readability.

### 3. Dependencies
- We might need to install `lucide-react` (already present) and potentially a lightweight image processing lib if canvas is too complex, but Canvas should suffice.
