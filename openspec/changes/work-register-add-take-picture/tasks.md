# Tasks - Work Register Add Take Picture

- [x] **1. Infrastructure**
    - [x] 1.1 Create `src/components/CameraCapture/index.tsx`.
    - [x] 1.2 Implement `watermarkImage` utility in `src/utils/imageUtils.ts`.

- [x] **2. UI Integration**
    - [x] 2.1 Add "Take Picture" button to the work registration form.
    - [x] 2.2 Implement a Modal to house the camera preview.
    - [x] 2.3 Implement the "Capture" logic that triggers geolocation and watermarking.

- [x] **3. Feature Logic**
    - [x] 3.1 Request camera permissions.
    - [x] 3.2 Request geolocation permissions.
    - [x] 3.3 Overlay text on canvas (Date, Time, Lat/Lon).
    - [x] 3.4 Integrate the resulting file with the existing upload flow.

- [x] **4. Verification**
    - [x] 4.1 Test on a device with a camera.
    - [x] 4.2 Verify that the captured image has the expected watermarks.
    - [x] 4.3 Verify that the geolocation is accurate.
