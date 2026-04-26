# Tasks - Work Register Add Take Picture

- [ ] **1. Infrastructure**
    - [ ] 1.1 Create `src/components/CameraCapture/index.tsx`.
    - [ ] 1.2 Implement `watermarkImage` utility in `src/utils/imageUtils.ts`.

- [ ] **2. UI Integration**
    - [ ] 2.1 Add "Take Picture" button to the work registration form.
    - [ ] 2.2 Implement a Modal to house the camera preview.
    - [ ] 2.3 Implement the "Capture" logic that triggers geolocation and watermarking.

- [ ] **3. Feature Logic**
    - [ ] 3.1 Request camera permissions.
    - [ ] 3.2 Request geolocation permissions.
    - [ ] 3.3 Overlay text on canvas (Date, Time, Lat/Lon).
    - [ ] 3.4 Integrate the resulting file with the existing upload flow.

- [ ] **4. Verification**
    - [ ] 4.1 Test on a device with a camera.
    - [ ] 4.2 Verify that the captured image has the expected watermarks.
    - [ ] 4.3 Verify that the geolocation is accurate.
